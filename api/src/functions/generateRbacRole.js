const { app } = require('@azure/functions');
const rbacCatalog = require('../data/azureRbacCatalog.json');

// Build indexed lookup of valid operations and providers
const validProviders = new Set(rbacCatalog.providers.map((p) => p.provider.toLowerCase()));
const allCatalogOperations = new Set();
const providerOperationsMap = new Map();

rbacCatalog.providers.forEach((p) => {
    const pKey = p.provider.toLowerCase();
    providerOperationsMap.set(pKey, p.operations);
    p.operations.forEach((op) => {
        allCatalogOperations.add(op.toLowerCase());
    });
});

// Grounding prompt summary showing key providers and representative operations
const providerSummaryText = rbacCatalog.providers
    .map((p) => {
        const sampleOps = p.operations.slice(0, 10).join(', ');
        const more = p.operations.length > 10 ? ` (+${p.operations.length - 10} more)` : '';
        return `[${p.provider}]: ${sampleOps}${more}`;
    })
    .join('\n');

const SYSTEM_PROMPT = `You are an expert Azure Security & Governance Cloud Solutions Architect. Your mission is to analyze a user's natural language role requirements and generate a standardized, Microsoft Cloud Adoption Framework (CAF) compliant Azure Custom Role definition following the Principle of Least Privilege.

CANONICAL AZURE RESOURCE PROVIDERS AND OPERATIONS:
You MUST ONLY return Azure operations that are valid for the canonical resource providers below:
${providerSummaryText}

ROLE GENERATION RULES:
1. Adhere strictly to the Principle of Least Privilege. Grant only the granular read, write, or action permissions necessary for the workload duties.
2. Use "actions" for allowed control plane operations (e.g. "Microsoft.Web/sites/read", "Microsoft.Web/sites/restart/action", "Microsoft.Web/sites/start/action").
3. Use "notActions" for explicit denials of destructive or elevated operations (e.g. "Microsoft.Web/sites/delete", "Microsoft.Authorization/roleAssignments/*", "Microsoft.KeyVault/vaults/delete").
4. "assignableScopes": String representing the target scope. Default to "/subscriptions/00000000-0000-0000-0000-000000000000" unless the user explicitly mentions a Management Group (e.g. "/providers/Microsoft.Management/managementGroups/my-mg"), Root ("/"), or Resource Group.
5. "roleName": A clean, descriptive title (e.g. "Container Apps DevOps Operator", "Key Vault Secret Reader").
6. "description": A crisp, professional summary describing what the role permits and explicitly restricts.
7. "roleSummary": A crisp 1-sentence architectural summary.
8. "explanation": A concise 1-2 sentence security recommendation or least-privilege guidance tip.

EXAMPLES:
- User Prompt: "Junior App Service Operator who can view, start, stop, and restart web apps and functions in staging, but cannot delete resources or manage IAM."
  Output:
  {
    "roleName": "DevOps App Service Operator",
    "description": "Allows viewing, starting, stopping, and restarting App Services and Functions without delete or IAM management rights.",
    "assignableScopes": "/subscriptions/00000000-0000-0000-0000-000000000000",
    "actions": [
      "Microsoft.Web/sites/read",
      "Microsoft.Web/sites/restart/action",
      "Microsoft.Web/sites/start/action",
      "Microsoft.Web/sites/stop/action",
      "Microsoft.Web/sites/slots/read",
      "Microsoft.Web/sites/slots/restart/action"
    ],
    "notActions": [
      "Microsoft.Web/sites/delete",
      "Microsoft.Authorization/roleAssignments/*"
    ],
    "roleSummary": "App Service and Function app operational role for deployment management and lifecycle controls.",
    "explanation": "Ensure deployment credentials and app settings containing secrets are protected by excluding config/list/action."
  }
`;

const JSON_SCHEMA_DEFINITION = {
    type: 'json_schema',
    json_schema: {
        name: 'azure_rbac_role_definition',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                roleName: {
                    type: 'string',
                    description: 'Descriptive, professional name for the custom role.'
                },
                description: {
                    type: 'string',
                    description: 'Concise description explaining the role permissions and restrictions.'
                },
                assignableScopes: {
                    type: 'string',
                    description: 'Target Azure resource scope (default: /subscriptions/00000000-0000-0000-0000-000000000000).'
                },
                actions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of allowed Azure Resource Provider operations.'
                },
                notActions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of explicitly denied operations.'
                },
                roleSummary: {
                    type: 'string',
                    description: 'Crisp 1-sentence summary of the generated custom role.'
                },
                explanation: {
                    type: 'string',
                    description: 'Brief 1-2 sentence least-privilege security rationale.'
                }
            },
            required: [
                'roleName',
                'description',
                'assignableScopes',
                'actions',
                'notActions',
                'roleSummary',
                'explanation'
            ],
            additionalProperties: false
        }
    }
};

/**
 * Normalizes and sanitizes the AI response against known Azure RBAC catalog operations.
 */
function normalizeAiRbacResponse(rawConfig) {
    // 1. Sanitize Role Name
    let roleName = (rawConfig.roleName || 'Custom Azure Role').toString().trim().slice(0, 120);

    // 2. Sanitize Description
    let description = (rawConfig.description || 'Custom role definition generated via AI.').toString().trim().slice(0, 500);

    // 3. Normalize Assignable Scopes
    let assignableScopes = (rawConfig.assignableScopes || '/subscriptions/00000000-0000-0000-0000-000000000000').toString().trim();
    if (!assignableScopes.startsWith('/')) {
        assignableScopes = `/${assignableScopes}`;
    }

    // Helper to validate and filter operations
    function filterOperations(opsList) {
        if (!Array.isArray(opsList)) return [];
        const sanitized = [];
        const seen = new Set();

        opsList.forEach((op) => {
            if (typeof op !== 'string') return;
            const cleanOp = op.trim();
            if (!cleanOp || seen.has(cleanOp.toLowerCase())) return;

            const lowerOp = cleanOp.toLowerCase();
            const providerPrefix = cleanOp.split('/')[0]?.toLowerCase();

            // Allow standard wildcards like */read or Microsoft.Provider/* or valid catalog matches
            const isValidCatalog = allCatalogOperations.has(lowerOp);
            const isValidWildcard = cleanOp === '*' || cleanOp === '*/read' || cleanOp.endsWith('/*');
            const isKnownProvider = validProviders.has(providerPrefix);

            if (isValidCatalog || (isKnownProvider && isValidWildcard) || cleanOp === '*/read') {
                sanitized.push(cleanOp);
                seen.add(lowerOp);
            } else if (isKnownProvider) {
                // If the exact operation was slightly mistyped, try finding closest in provider
                const availableOps = providerOperationsMap.get(providerPrefix) || [];
                const match = availableOps.find((o) => o.toLowerCase() === lowerOp || o.toLowerCase().includes(lowerOp));
                if (match && !seen.has(match.toLowerCase())) {
                    sanitized.push(match);
                    seen.add(match.toLowerCase());
                } else {
                    // Retain provider-level operation if reasonable
                    sanitized.push(cleanOp);
                    seen.add(lowerOp);
                }
            }
        });

        return sanitized;
    }

    const actions = filterOperations(rawConfig.actions);
    const notActions = filterOperations(rawConfig.notActions);

    return {
        roleName,
        description,
        assignableScopes,
        actions,
        notActions,
        roleSummary: rawConfig.roleSummary || `Custom role with ${actions.length} allowed operations.`,
        explanation: rawConfig.explanation || 'Custom role configured following least-privilege principles.'
    };
}

app.http('generateRbacRole', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        try {
            let body;
            try {
                body = await request.json();
            } catch {
                return {
                    status: 400,
                    jsonBody: { error: 'Invalid JSON payload in request body' }
                };
            }

            const { prompt } = body || {};

            if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
                return {
                    status: 400,
                    jsonBody: { error: 'Please pass a valid text prompt in the request body' }
                };
            }

            const sanitizedPrompt = prompt.trim();
            if (sanitizedPrompt.length > 2000) {
                return {
                    status: 400,
                    jsonBody: { error: 'Prompt must not exceed 2,000 characters' }
                };
            }

            const projectEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_API_KEY;
            const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

            if (!projectEndpoint || !apiKey || !deploymentName) {
                context.warn('Azure OpenAI environment variables are not fully configured.');
                return {
                    status: 503,
                    jsonBody: {
                        error: 'AI Service Not Configured',
                        details: 'Missing required Azure OpenAI configuration.'
                    }
                };
            }

            const inferenceUrl = `${projectEndpoint}/openai/v1/chat/completions`;
            context.log(`Calling Foundry inference URL: ${inferenceUrl}`);

            async function callOpenAi(formatOption) {
                return fetch(inferenceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: deploymentName,
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: sanitizedPrompt }
                        ],
                        response_format: formatOption,
                        temperature: 0.1
                    })
                });
            }

            // Attempt structured json_schema first
            let response = await callOpenAi(JSON_SCHEMA_DEFINITION);

            // Fallback to json_object if deployment does not support json_schema
            if (!response.ok && response.status === 400) {
                context.warn('Structured json_schema returned 400. Retrying with type: json_object fallback.');
                response = await callOpenAi({ type: 'json_object' });
            }

            if (!response.ok) {
                const errorBody = await response.text();
                context.error(`Foundry API error (${response.status}): ${errorBody}`);
                return {
                    status: 502,
                    jsonBody: { error: 'AI service temporarily unavailable. Please try again later.' }
                };
            }

            const data = await response.json();
            const responseText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

            if (!responseText) {
                throw new Error('Empty response received from AI model');
            }

            const parsedConfig = JSON.parse(responseText);
            const normalizedResult = normalizeAiRbacResponse(parsedConfig);

            return {
                status: 200,
                jsonBody: normalizedResult
            };
        } catch (error) {
            context.error('Error processing request:', error);
            return {
                status: 500,
                jsonBody: { error: 'Internal Server Error' }
            };
        }
    }
});

module.exports = {
    normalizeAiRbacResponse
};
