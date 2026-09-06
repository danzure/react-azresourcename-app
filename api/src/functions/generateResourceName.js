const { app } = require('@azure/functions');
const catalog = require('../data/azureCatalog.json');

// Build categorized service string for grounding
const categorizedResources = {};
catalog.resources.forEach((r) => {
    const cat = r.category || 'General';
    if (!categorizedResources[cat]) categorizedResources[cat] = [];
    categorizedResources[cat].push(r.name);
});

const catalogPromptText = Object.entries(categorizedResources)
    .map(([cat, items]) => `[${cat}]: ${items.join(', ')}`)
    .join('\n');

const validRegionsList = catalog.regions.map((r) => r.value).join(', ');
const validEnvsList = catalog.environments.map((e) => e.value).join(', ');

const SYSTEM_PROMPT = `You are an expert Azure Cloud Solutions Architect assistant. Your mission is to extract configuration parameters from a user's natural language architecture request to generate standardized, Microsoft Cloud Adoption Framework (CAF) compliant resource names.

CANONICAL AZURE RESOURCE CATALOG:
You MUST ONLY return resource names that exist EXACTLY in the canonical catalog below:
${catalogPromptText}

EXTRACTION RULES:
You MUST analyze the user prompt and return a strict JSON object with these fields:
1. "workload": A short, clean alphanumeric string representing the workload/application (e.g., 'eshop', 'hr', 'payments', 'corehub', 'analytics'). Use standard abbreviations where appropriate.
2. "orgPrefix": A 2-6 character alphanumeric organization or client prefix if mentioned or implied (e.g. 'contoso' -> 'ctso', 'acme' -> 'acme'). If not specified or implied, return an empty string "".
3. "envValue": The environment code. MUST be exactly one of: [${validEnvsList}]. Map terms: "production" -> "prod", "development" -> "dev", "staging" -> "stg", "testing" -> "test", "quality assurance" -> "qa", "user acceptance testing" -> "uat", "shared" -> "shrd", "sandbox" -> "sbx", "disaster recovery" -> "dr". Default to "prod" if unspecified.
4. "regionValue": The official Azure region value (e.g., "uksouth", "westeurope", "eastus", "swedencentral"). MUST be chosen from standard Azure regions: [${validRegionsList}]. Default to "uksouth" if unspecified.
5. "instance": A 3-digit zero-padded instance number string (e.g., "001", "002"). Default to "001" unless an explicit instance number is mentioned.
6. "searchTerm": A comma-separated string of ALL canonical Azure resource names needed for the solution. If the user asks for an entire environment, architecture stack, or solution pattern, act as a Solutions Architect and output the complete set of required Azure resources from the canonical catalog.
7. "architectureSummary": A crisp 1-sentence description of the architectural stack resolved from the user's intent.
8. "explanation": A concise 1-2 sentence CAF naming recommendation or architectural best-practice tip for this workload.

SOLUTIONS ARCHITECTURE EXAMPLES:
- For "Highly available E-Commerce platform for Contoso Retail":
  {
    "workload": "ecommerce",
    "orgPrefix": "ctso",
    "envValue": "prod",
    "regionValue": "uksouth",
    "instance": "001",
    "searchTerm": "App Service plan, App Service, SQL server, SQL database, Key vault, Application Insights, Azure Cache for Redis",
    "architectureSummary": "Highly available e-commerce application with App Service, Azure SQL, Redis Cache, and Key Vault.",
    "explanation": "Ensure Azure SQL and Redis are secured via Private Endpoints and secrets are managed via Key Vault."
  }
- For "Modern Data Warehouse with Azure Databricks and Data Lake Storage":
  {
    "workload": "datawhouse",
    "orgPrefix": "",
    "envValue": "prod",
    "regionValue": "uksouth",
    "instance": "001",
    "searchTerm": "Azure Databricks workspace, Data Lake Storage, Data Factory, Key vault, Log Analytics workspace",
    "architectureSummary": "Modern Data Platform with Data Factory ingestion, Data Lake storage, and Azure Databricks.",
    "explanation": "Data Lake storage accounts require globally unique lowercase names (3-24 chars, no hyphens)."
  }
- For "Zero-trust Hub and Spoke networking topology with Azure Firewall":
  {
    "workload": "corenet",
    "orgPrefix": "",
    "envValue": "prod",
    "regionValue": "uksouth",
    "instance": "001",
    "searchTerm": "Virtual network, Azure Firewall, Firewall policy, VPN Gateway, Public IP, Bastion host",
    "architectureSummary": "Centralized Hub and Spoke network perimeter with Azure Firewall, VPN Gateway, and Bastion.",
    "explanation": "Deploy GatewaySubnet and AzureFirewallSubnet dedicated subnets adhering to CAF naming."
  }
- For "Mission-critical AKS microservices with geo-replication in West Europe":
  {
    "workload": "microservices",
    "orgPrefix": "",
    "envValue": "prod",
    "regionValue": "westeurope",
    "instance": "001",
    "searchTerm": "Kubernetes (AKS), Container registry, Virtual network, Public IP, Managed identity (user), Log Analytics workspace, Key vault",
    "architectureSummary": "Secure AKS container cluster with Container Registry and managed identity integration.",
    "explanation": "Container Registry names must be globally unique alphanumeric strings (5-50 chars) without hyphens."
  }
- For "Secure Enterprise RAG pattern with OpenAI and AI Search in UK South":
  {
    "workload": "genai",
    "orgPrefix": "",
    "envValue": "prod",
    "regionValue": "uksouth",
    "instance": "001",
    "searchTerm": "Azure AI Search, Azure AI services account, Storage account, Key vault, Application Insights",
    "architectureSummary": "Generative AI and RAG architecture with AI Search and Azure AI services.",
    "explanation": "Leverage Managed Identity for authentication between AI Search and storage accounts."
  }
`;

const JSON_SCHEMA_DEFINITION = {
    type: 'json_schema',
    json_schema: {
        name: 'azure_naming_configuration',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                workload: {
                    type: 'string',
                    description: 'Concise alphanumeric workload or application identifier.'
                },
                orgPrefix: {
                    type: 'string',
                    description: '2-6 char alphanumeric organization prefix, or empty string.'
                },
                envValue: {
                    type: 'string',
                    enum: ['prod', 'dev', 'stg', 'test', 'uat', 'qa', 'shrd', 'sbx', 'dr'],
                    description: 'Standard CAF environment value.'
                },
                regionValue: {
                    type: 'string',
                    description: 'Azure region value identifier (e.g. uksouth, westeurope).'
                },
                instance: {
                    type: 'string',
                    description: '3-digit zero-padded instance number string (e.g. 001).'
                },
                searchTerm: {
                    type: 'string',
                    description: 'Comma-separated string of exact canonical Azure resource names from the catalog.'
                },
                architectureSummary: {
                    type: 'string',
                    description: 'Crisp 1-sentence architectural summary of the resolved solution.'
                },
                explanation: {
                    type: 'string',
                    description: 'Brief 1-2 sentence CAF governance and naming recommendation.'
                }
            },
            required: [
                'workload',
                'orgPrefix',
                'envValue',
                'regionValue',
                'instance',
                'searchTerm',
                'architectureSummary',
                'explanation'
            ],
            additionalProperties: false
        }
    }
};

/**
 * Normalizes and validates the AI response against known application constants.
 */
function normalizeAiResponse(rawConfig) {
    const validResourceNames = new Set(catalog.resources.map((r) => r.name.toLowerCase()));
    const resourceNameLookup = new Map(catalog.resources.map((r) => [r.name.toLowerCase(), r.name]));

    const validRegions = new Map();
    catalog.regions.forEach((r) => {
        validRegions.set(r.value.toLowerCase(), r.value);
        validRegions.set(r.label.toLowerCase(), r.value);
        if (r.abbrev) validRegions.set(r.abbrev.toLowerCase(), r.value);
    });

    const validEnvs = new Set(catalog.environments.map((e) => e.value.toLowerCase()));

    // 1. Sanitize workload
    let workload = (rawConfig.workload || '').toString().toLowerCase().trim();
    workload = workload.replace(/[^a-z0-9-]/g, '').slice(0, 20);

    // 2. Sanitize orgPrefix
    let orgPrefix = (rawConfig.orgPrefix || '').toString().toLowerCase().trim();
    orgPrefix = orgPrefix.replace(/[^a-z0-9]/g, '').slice(0, 8);

    // 3. Normalize envValue
    let envValue = (rawConfig.envValue || 'prod').toString().toLowerCase().trim();
    if (!validEnvs.has(envValue)) {
        if (envValue.includes('prod')) envValue = 'prod';
        else if (envValue.includes('dev')) envValue = 'dev';
        else if (envValue.includes('stag') || envValue.includes('stg')) envValue = 'stg';
        else if (envValue.includes('test')) envValue = 'test';
        else if (envValue.includes('uat')) envValue = 'uat';
        else if (envValue.includes('qa')) envValue = 'qa';
        else if (envValue.includes('sand') || envValue.includes('sbx')) envValue = 'sbx';
        else if (envValue.includes('shar') || envValue.includes('shrd')) envValue = 'shrd';
        else if (envValue.includes('dr')) envValue = 'dr';
        else envValue = 'prod';
    }

    // 4. Normalize regionValue
    let rawRegion = (rawConfig.regionValue || 'uksouth').toString().toLowerCase().trim();
    rawRegion = rawRegion.replace(/\s+/g, '');
    let regionValue = validRegions.get(rawRegion) || 'uksouth';

    // 5. Normalize instance
    let instanceRaw = (rawConfig.instance || '001').toString().replace(/[^0-9]/g, '');
    let instance = instanceRaw ? instanceRaw.padStart(3, '0').slice(-3) : '001';

    // 6. Validate and filter searchTerm against canonical catalog
    let rawTerms = (rawConfig.searchTerm || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    const matchedCanonicalNames = [];
    for (const term of rawTerms) {
        const termLower = term.toLowerCase();
        if (validResourceNames.has(termLower)) {
            matchedCanonicalNames.push(resourceNameLookup.get(termLower));
        } else {
            // Check for partial or alias matches in catalog
            const partialMatch = catalog.resources.find((r) =>
                r.name.toLowerCase().includes(termLower) || termLower.includes(r.name.toLowerCase())
            );
            if (partialMatch && !matchedCanonicalNames.includes(partialMatch.name)) {
                matchedCanonicalNames.push(partialMatch.name);
            }
        }
    }

    const searchTerm = matchedCanonicalNames.length > 0
        ? matchedCanonicalNames.join(', ')
        : (rawConfig.searchTerm || '');

    return {
        workload,
        orgPrefix,
        envValue,
        regionValue,
        instance,
        searchTerm,
        architectureSummary: rawConfig.architectureSummary || 'Cloud architecture configuration resolved.',
        explanation: rawConfig.explanation || ''
    };
}

app.http('generateResourceName', {
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

            // Helper to execute OpenAI API call
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

            // Attempt strict JSON schema first
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
            const normalizedResult = normalizeAiResponse(parsedConfig);

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
    normalizeAiResponse
};

