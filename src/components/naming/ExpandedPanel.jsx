import { memo, useMemo } from 'react';
import { Copy, Check, ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import FluentDropdown from '../shared/FluentDropdown';

import { VNET_TOPOLOGIES, AVD_TOPOLOGIES, AKS_TOPOLOGIES, SQL_TOPOLOGIES, WEB_TOPOLOGIES, ML_TOPOLOGIES, FUNC_TOPOLOGIES, ACA_TOPOLOGIES, APIM_TOPOLOGIES, AGW_TOPOLOGIES, LOGIC_APP_TOPOLOGIES } from '../../data/constants';
import { validateName } from '../../utils/nameValidator';
import ValidationHighlight from './ValidationHighlight';

import BundleList from './expanded/BundleList';
import { AboutBanner, GuidanceCard } from './expanded/AboutCard';
import NamingRulesCard from './expanded/NamingRulesCard';
import ResourceTemplateCard from './expanded/ResourceTemplateCard';

// ── Static constants (module-level, never re-created) ──────────────────────────

const SCOPE_DESCRIPTIONS = {
    'Resource group': 'Unique within the Resource Group.',
    'Subscription': 'Unique within the Subscription.',
    'Tenant': 'Unique within the Tenant.',
    'Global': 'Unique across all of Azure (globally).',
    'Region': 'Unique within the Azure Region.',
    'VNet': 'Unique within the Virtual Network.',
    'Namespace': 'Unique within the Namespace.',
    'Storage account': 'Unique across all of Azure (globally).',
    'Server': 'Unique within the Server.',
    'Environment': 'Unique within the Environment.',
    'Workspace': 'Unique within the Workspace.',
    'vWAN': 'Unique within the Virtual WAN.',
    'ANF account': 'Unique within the NetApp Account.',
    'Capacity pool': 'Unique within the Capacity Pool.',
    'Scope': 'Scope depends on context.',
};

const SUBNET_OVERRIDES = {
    afw: {
        desc: "Dedicated subnet for Azure Firewall. The name 'AzureFirewallSubnet' is mandatory.",
        bestPractice: "Must be named exactly 'AzureFirewallSubnet'. Recommended size is /26.",
    },
    bas: {
        desc: "Dedicated subnet for Azure Bastion. The name 'AzureBastionSubnet' is mandatory.",
        bestPractice: "Must be named exactly 'AzureBastionSubnet'. Minimum size is /26. Must be in the same VNet as the VMs it connects to.",
    },
    gw: {
        desc: "Dedicated subnet for Virtual Network Gateways (VPN/ExpressRoute). The name 'GatewaySubnet' is mandatory.",
        bestPractice: "Must be named exactly 'GatewaySubnet'. Recommended size is /27 or larger.",
    },
    afwm: {
        desc: "Dedicated management subnet for Azure Firewall (Basic SKU or forced tunneling). The name 'AzureFirewallManagementSubnet' is mandatory.",
        bestPractice: "Must be named exactly 'AzureFirewallManagementSubnet'. Minimum size is /26.",
    },
    rs: {
        desc: "Dedicated subnet for Azure Route Server. The name 'RouteServerSubnet' is mandatory.",
        bestPractice: "Must be named exactly 'RouteServerSubnet'. Minimum size is /27.",
    },
};

const TOPOLOGY_MAP = {
    'Virtual network': VNET_TOPOLOGIES,
    'Kubernetes (AKS)': AKS_TOPOLOGIES,
    'SQL server': SQL_TOPOLOGIES,
    'App Service': WEB_TOPOLOGIES,
    'Machine Learning workspace': ML_TOPOLOGIES,
    'Function app': FUNC_TOPOLOGIES,
    'Container App': ACA_TOPOLOGIES,
    'API Management': APIM_TOPOLOGIES,
    'Application Gateway': AGW_TOPOLOGIES,
    'Logic App': LOGIC_APP_TOPOLOGIES,
};

const NAME_PATTERN_RE = /^Name pattern:\s*([^.]+)\.\s*/;

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Expanded Resource Panel Component
 *
 * Displays detailed view for a selected resource, including:
 * - Topology selection (Single, Hub & Spoke, Bundle)
 * - Generated resource names with copy functionality
 * - Resource description and naming recommendations
 * - Naming rules visualization
 */
function ExpandedPanel({
    resource, genName, isCopied, onCopy,
    selectedSubResource, onSubResourceChange,
    topology, setTopology, spokeCount, setSpokeCount, spokeStartValue, setSpokeStartValue,
    bundle, getBundleName
}) {
    // ── Derived state ──────────────────────────────────────────────────────────
    const currentSubResource = resource.subResources?.find(sr => sr.suffix === selectedSubResource);
    const validationIssues = useMemo(() => validateName(genName, resource), [genName, resource]);
    const hasErrors = validationIssues.some(i => i.type === 'error');
    const isTooLong = validationIssues.some(i => i.code === 'TOO_LONG');
    const hasBundle = bundle && bundle.length > 0;
    const isVNet = resource.name === 'Virtual network';
    const isAVD = resource.category === 'Desktop Virtualization' && resource.name === 'Host Pool';

    const topologyOptions = useMemo(() => {
        if (isAVD) return AVD_TOPOLOGIES;
        return TOPOLOGY_MAP[resource.name] || [];
    }, [resource.name, isAVD]);

    const showTopology = topologyOptions.length > 0;
    const isHubSpoke = isVNet && topology === 'hub-spoke';
    const scopeDesc = SCOPE_DESCRIPTIONS[resource.scope] || `Name uniqueness scope: ${resource.scope}`;

    // Resolve subnet-specific description overrides
    const { displayDesc, displayBestPractice } = useMemo(() => {
        if (resource.name === 'Subnet' && selectedSubResource && SUBNET_OVERRIDES[selectedSubResource]) {
            return SUBNET_OVERRIDES[selectedSubResource];
        }
        return { desc: resource.desc, bestPractice: resource.bestPractice };
    }, [resource.name, resource.desc, resource.bestPractice, selectedSubResource]);

    // Parse the naming pattern from guidance text
    const { namingPattern, namingGuidanceText } = useMemo(() => {
        const raw = resource.namingGuidance || displayBestPractice || '';
        const match = raw.match(NAME_PATTERN_RE);
        return {
            namingPattern: match ? match[1].trim() : null,
            namingGuidanceText: match ? raw.slice(match[0].length).trim() : raw,
        };
    }, [resource.namingGuidance, displayBestPractice]);

    // Generate the fully resolved name that incorporates the guidance pattern
    const guidanceName = useMemo(() => {
        if (!namingPattern) return null;
        // getBundleName is actually the getGeneratedName function passed from ResourceCard
        return getBundleName ? getBundleName(resource, namingPattern) : null;
    }, [namingPattern, resource, getBundleName]);

    // ── Shared theme tokens (computed once per render) ──────────────────────────

    const t = useMemo(() => ({
        // Surface card
        card: 'bg-fluent-bg-card border-fluent-stroke-subtle',
        // Primary body text
        text: 'text-fluent-fg-secondary',
        // Strong text / headings
        strong: 'text-fluent-fg-primary',
        // Caption / label
        caption: 'text-fluent-fg-tertiary',
        // Muted / secondary text
        muted: 'text-fluent-fg-tertiary',
        // Divider
        divider: 'border-fluent-stroke-subtle',
        // Code badge
        code: 'bg-fluent-bg-subtle text-fluent-brand-fg border-fluent-stroke-subtle',
        // Code block (naming pattern)
        codeBlock: 'bg-fluent-bg-canvas text-fluent-brand-fg border border-fluent-stroke-subtle',
        // Char badge
        charBadge: 'bg-fluent-bg-canvas text-fluent-fg-secondary border-fluent-stroke-subtle',
    }), []);

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div onClick={(e) => e.stopPropagation()} className="px-3 sm:px-5 py-3 sm:py-4 border-t cursor-default bg-fluent-bg-canvas border-fluent-stroke-subtle animate-fade-in">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4 pb-3 border-b border-fluent-stroke-subtle">
                {/* Generated Name and Validation */}
                <div className="group/copy relative flex items-center gap-2 px-3 py-1.5 min-h-[32px] flex-1 min-w-0 rounded-[4px] border bg-fluent-bg-canvas hover:bg-fluent-bg-hover border-transparent transition-all">
                    <div className={`flex-1 min-w-0 font-mono text-[13px] font-semibold pr-24 ${isTooLong ? 'text-fluent-state-danger' : 'text-fluent-fg-primary'} truncate flex items-center gap-2`}>
                        <span className="truncate min-w-0 block">
                            <ValidationHighlight name={hasBundle && getBundleName ? getBundleName(bundle[0]) : genName} allowedCharsPattern={hasBundle ? bundle[0].chars : resource.chars} />
                        </span>
                        {hasBundle && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded font-bold bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle">
                                +{bundle.length - 1}
                            </span>
                        )}
                    </div>
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2 shrink-0 z-10 bg-transparent pr-0.5">
                        {validationIssues.length === 0 ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-fluent-cat-green-bg border border-transparent shadow-sm">
                                <ShieldCheck className="w-3 h-3 text-fluent-cat-green-fg" />
                                <span className="text-[11px] font-medium text-fluent-cat-green-fg">Valid</span>
                            </div>
                        ) : (
                            <div className="relative group/validation-exp animate-scale-in">
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-[4px] shadow-sm cursor-help transition-all duration-200 hover:brightness-95 dark:hover:brightness-110 active:scale-95 ${hasErrors ? 'bg-fluent-cat-red-bg text-fluent-state-danger' : 'bg-fluent-cat-orange-bg text-fluent-cat-orange-fg'}`}>
                                    {hasErrors
                                        ? <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.5} />
                                        : <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    }
                                    <span className="text-[11px] font-medium">
                                        {validationIssues.length} {validationIssues.length === 1 ? 'issue' : 'issues'}
                                    </span>
                                </div>
                                <div className="absolute right-0 top-7 z-50 w-56 max-w-[calc(100vw-32px)] p-2.5 rounded shadow-lg border text-[11px] leading-relaxed hidden group-hover/validation-exp:block bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    {validationIssues.map((issue, i) => (
                                        <div key={i} className={`flex items-start gap-1.5 ${i > 0 ? 'mt-1.5 pt-1.5 border-t' : ''} border-fluent-stroke-subtle`}>
                                            <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${issue.type === 'error' ? 'bg-fluent-state-danger' : 'bg-fluent-cat-orange-fg'}`} />
                                            <span>{issue.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasBundle && getBundleName) {
                                    const allNames = bundle.map(item => `${item.name}: ${getBundleName(item)}`).join('\n');
                                    onCopy(allNames, resource.name, e);
                                } else {
                                    onCopy(genName, resource.name, e);
                                }
                            }}
                            aria-label={isCopied ? 'Copied' : 'Copy name'}
                            className={`flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[11px] font-medium transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg ${isCopied 
                                ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                                : 'bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-primary hover:bg-fluent-bg-hover hover:border-fluent-stroke-strong'}`}
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    {/* Topology inline */}
                    {showTopology && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] whitespace-nowrap ${t.muted}`}>{isVNet ? 'Topology:' : 'Bundle:'}</span>
                                <FluentDropdown
                                    value={topology}
                                    onChange={(val) => setTopology?.(val)}
                                    options={topologyOptions}
                                    size="compact"
                                    ariaLabel={isVNet ? 'Topology' : 'Bundle'}
                                    className="min-w-[130px]"
                                />
                            </div>
                            {isHubSpoke && (
                                <div className="flex items-center gap-2">
                                    <span className={`text-[12px] whitespace-nowrap ${t.muted}`}>Spokes:</span>
                                    <input type="number" min="0" max="20" value={spokeCount}
                                        onChange={(e) => setSpokeCount?.(Math.max(0, Math.min(20, parseInt(e.target.value) || 0)))}
                                        className="w-[56px] h-[26px] px-2 rounded-sm border text-[13px] focus:outline-none focus:border-fluent-brand-bg transition-colors bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-primary"
                                    />
                                    <span className={`text-[12px] whitespace-nowrap ${t.muted}`}>from:</span>
                                    <input type="number" min="0" max="999" value={spokeStartValue}
                                        onChange={(e) => setSpokeStartValue?.(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-[56px] h-[26px] px-2 rounded-sm border text-[13px] focus:outline-none focus:border-fluent-brand-bg transition-colors bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-primary"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sub-resource inline */}
                    {resource.subResources?.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[12px] leading-[26px] ${t.muted}`}>Target:</span>
                            <FluentDropdown
                                value={selectedSubResource || (resource.subResources?.[0]?.suffix ?? '')}
                                onChange={(val) => onSubResourceChange?.(val)}
                                options={resource.subResources}
                                size="compact"
                                ariaLabel="Target Sub-resource"
                                className="min-w-[140px]"
                            />
                            {currentSubResource?.dnsZone && (
                                <code className={`px-1.5 py-0.5 rounded-sm font-mono text-[12px] ${t.code}`}>{currentSubResource.dnsZone}</code>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <BundleList 
                bundle={bundle} 
                getBundleName={getBundleName} 
                resource={resource} 
                isCopied={isCopied} 
                onCopy={onCopy} 
                t={t} 
            />



            {/* Full-width service description banner */}
            <AboutBanner 
                resource={resource} 
                displayDesc={displayDesc} 
                t={t} 
            />

            {/* Two Column Layout: Rules + Guidance | IAC Template */}
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-3 mt-3">
                <div className="flex flex-col gap-3 min-w-0 h-full">
                    <GuidanceCard 
                        namingPattern={guidanceName} 
                        namingGuidanceText={namingGuidanceText} 
                        t={t} 
                    />

                    <NamingRulesCard 
                        resource={resource} 
                        scopeDesc={scopeDesc} 
                        selectedSubResource={selectedSubResource} 
                        t={t} 
                    />
                </div>

                <ResourceTemplateCard 
                    resource={resource} 
                    genName={genName} 
                    bundle={bundle} 
                    getBundleName={getBundleName} 
                />
            </div>
        </div>
    );
}

ExpandedPanel.propTypes = {
    resource: PropTypes.shape({
        name: PropTypes.string.isRequired,
        abbrev: PropTypes.string.isRequired,
        category: PropTypes.string,
        maxLength: PropTypes.number,
        scope: PropTypes.string,
        chars: PropTypes.string,
        desc: PropTypes.string,
        longDesc: PropTypes.string,
        bestPractice: PropTypes.string,
        namingGuidance: PropTypes.string,
        learnUrl: PropTypes.string,
        subResources: PropTypes.arrayOf(PropTypes.shape({
            suffix: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            dnsZone: PropTypes.string,
        })),
    }).isRequired,
    genName: PropTypes.string.isRequired,
    isCopied: PropTypes.bool.isRequired,
    onCopy: PropTypes.func.isRequired,
    selectedSubResource: PropTypes.string,
    onSubResourceChange: PropTypes.func,
    topology: PropTypes.string,
    setTopology: PropTypes.func,
    spokeCount: PropTypes.number,
    setSpokeCount: PropTypes.func,
    spokeStartValue: PropTypes.number,
    setSpokeStartValue: PropTypes.func,
    bundle: PropTypes.array,
    getBundleName: PropTypes.func,
};

export default memo(ExpandedPanel);
