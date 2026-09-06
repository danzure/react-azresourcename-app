import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, ExternalLink, Code2 } from 'lucide-react';

const escapeBicep = (str) => (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escapeTf = (str) => (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Flatten tree into an array of { id, name, parentId, subscriptions }
function flattenTopology(nodes, parentId = null) {
    let result = [];
    nodes.forEach(node => {
        // Generate a safe identifier for code (alphanumeric and underscores)
        const safeId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
        result.push({
            id: node.id,
            safeId: safeId,
            name: node.name,
            parentId: parentId,
            subscriptions: node.subscriptions || []
        });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenTopology(node.children, safeId));
        }
    });
    return result;
}

function generateBicep(flatNodes) {
    let code = `targetScope = 'tenant'\n\n`;
    
    flatNodes.forEach(node => {
        code += `resource mg_${node.safeId} 'Microsoft.Management/managementGroups@2021-04-01' = {\n`;
        code += `  name: '${node.safeId}'\n`;
        code += `  properties: {\n`;
        code += `    displayName: '${escapeBicep(node.name)}'\n`;
        if (node.parentId) {
            code += `    details: {\n`;
            code += `      parent: {\n`;
            code += `        id: tenantResourceId('Microsoft.Management/managementGroups', '${node.parentId}')\n`;
            code += `      }\n`;
            code += `    }\n`;
        }
        code += `  }\n`;
        code += `}\n\n`;

        if (node.subscriptions && node.subscriptions.length > 0) {
            node.subscriptions.forEach((sub, _index) => {
                const subSafeId = sub.id.replace(/[^a-zA-Z0-9]/g, '_');
                code += `resource sub_${subSafeId} 'Microsoft.Management/managementGroups/subscriptions@2021-04-01' = {\n`;
                code += `  parent: mg_${node.safeId}\n`;
                code += `  name: '${escapeBicep(sub.name)}'\n`;
                code += `}\n\n`;
            });
        }
    });
    
    return code.trim();
}

function generateTerraform(flatNodes) {
    let code = `provider "azurerm" {\n  features {}\n}\n\n`;
    
    flatNodes.forEach(node => {
        code += `resource "azurerm_management_group" "${node.safeId}" {\n`;
        code += `  name         = "${node.safeId}"\n`;
        code += `  display_name = "${escapeTf(node.name)}"\n`;
        if (node.parentId) {
            code += `  parent_management_group_id = azurerm_management_group.${node.parentId}.id\n`;
        }
        code += `}\n\n`;

        if (node.subscriptions && node.subscriptions.length > 0) {
            node.subscriptions.forEach((sub, _index) => {
                const subSafeId = sub.id.replace(/[^a-zA-Z0-9]/g, '_');
                code += `data "azurerm_subscription" "sub_${subSafeId}" {\n`;
                code += `  subscription_id = "${escapeTf(sub.name)}"\n`;
                code += `}\n\n`;
                code += `resource "azurerm_management_group_subscription_association" "assoc_${subSafeId}" {\n`;
                code += `  management_group_id = azurerm_management_group.${node.safeId}.id\n`;
                code += `  subscription_id     = data.azurerm_subscription.sub_${subSafeId}.id\n`;
                code += `}\n\n`;
            });
        }
    });
    
    return code.trim();
}

function generateArm(flatNodes) {
    let code = {
        "$schema": "https://schema.management.azure.com/schemas/2019-08-01/tenantDeploymentTemplate.json#",
        "contentVersion": "1.0.0.0",
        "resources": []
    };
    
    flatNodes.forEach(node => {
        let resource = {
            "type": "Microsoft.Management/managementGroups",
            "apiVersion": "2021-04-01",
            "name": node.safeId,
            "properties": {
                "displayName": node.name
            }
        };
        if (node.parentId) {
            resource.properties.details = {
                "parent": {
                    "id": `[tenantResourceId('Microsoft.Management/managementGroups', '${node.parentId}')]`
                }
            };
            resource.dependsOn = [
                `[tenantResourceId('Microsoft.Management/managementGroups', '${node.parentId}')]`
            ];
        }
        code.resources.push(resource);

        if (node.subscriptions && node.subscriptions.length > 0) {
            node.subscriptions.forEach((sub, _index) => {
                code.resources.push({
                    "type": "Microsoft.Management/managementGroups/subscriptions",
                    "apiVersion": "2021-04-01",
                    "name": `[concat('${node.safeId}', '/', '${sub.name}')]`,
                    "dependsOn": [
                        `[tenantResourceId('Microsoft.Management/managementGroups', '${node.safeId}')]`
                    ]
                });
            });
        }
    });
    
    return JSON.stringify(code, null, 2);
}

export default function TopologyCodeGenerator({ topology }) {
    const [format, setFormat] = useState('bicep');
    const [copied, setCopied] = useState(false);

    const generatedCode = useMemo(() => {
        const flatNodes = flattenTopology(topology);
        if (format === 'bicep') return generateBicep(flatNodes);
        if (format === 'terraform') return generateTerraform(flatNodes);
        if (format === 'arm') return generateArm(flatNodes);
        return '';
    }, [topology, format]);

    const docsUrl = useMemo(() => {
        if (format === 'terraform') return 'https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/management_group';
        if (format === 'bicep') return 'https://learn.microsoft.com/en-us/azure/templates/microsoft.management/managementgroups?pivots=deployment-language-bicep';
        return 'https://learn.microsoft.com/en-us/azure/templates/microsoft.management/managementgroups?pivots=deployment-language-arm-template';
    }, [format]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-fluent-bg-canvas dark:bg-fluent-bg-subtle w-full flex flex-col overflow-hidden h-full flex-1 min-h-0">
            <div className="px-5 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle shrink-0">
                <div className="flex items-center gap-3 text-fluent-fg-primary font-semibold select-none">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                        <Code2 className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[15px]">IAC Template</span>
                        <span className="text-[12px] font-normal text-fluent-fg-secondary">Review and export your {format === 'terraform' ? 'Terraform' : format === 'bicep' ? 'Bicep' : 'ARM'} code</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 lg:gap-2 w-full sm:w-auto">
                        <div className="flex shrink-0 bg-fluent-bg-canvas border border-fluent-stroke-subtle rounded-md p-0.5 w-full sm:w-auto">
                            <button
                                onClick={() => setFormat('bicep')}
                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 ${format === 'bicep' ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                            >
                                Bicep
                            </button>
                            <button
                                onClick={() => setFormat('arm')}
                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 ${format === 'arm' ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                            >
                                ARM
                            </button>
                            <button
                                onClick={() => setFormat('terraform')}
                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 ${format === 'terraform' ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                            >
                                Terraform
                            </button>
                        </div>
                        <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                            <a
                                href={docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none px-3 h-[32px] rounded-[4px] border transition-colors duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50"
                                title="View documentation"
                            >
                                {format === 'terraform' ? (
                                    <img src="/terraform.svg" className="w-[14px] h-[14px] shrink-0" alt="Terraform" />
                                ) : (
                                    <svg viewBox="0 0 23 23" className="w-[14px] h-[14px] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0 0h11v11H0z" fill="#f35325"/>
                                        <path d="M12 0h11v11H12z" fill="#81bc06"/>
                                        <path d="M0 12h11v11H0z" fill="#05a6f0"/>
                                        <path d="M12 12h11v11H12z" fill="#ffba08"/>
                                    </svg>
                                )}
                                <span className="hidden sm:inline">{format === 'terraform' ? 'Terraform Registry' : format === 'bicep' ? 'Bicep Template' : 'ARM Template'}</span>
                                <span className="sm:hidden">Docs</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                            
                            <div className="w-px h-5 bg-fluent-stroke-subtle hidden sm:block"></div>
                            
                            <button
                                onClick={handleCopy}
                                className={`flex-1 sm:flex-none px-3 h-[32px] rounded-[4px] text-[13px] font-medium transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50 ${copied ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' : 'bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary'}`}
                                title="Copy code"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-[#1E1E1E] w-full flex flex-col flex-1 h-full min-h-0">
                <pre className="flex-1 text-[13px] leading-relaxed font-mono overflow-auto p-5 text-[#D4D4D4] m-0">
                    <code>{generatedCode}</code>
                </pre>
            </div>
        </div>
    );
}

TopologyCodeGenerator.propTypes = {
    topology: PropTypes.array.isRequired
};
