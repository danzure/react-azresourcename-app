import { memo } from 'react';
import { Copy, Check, BookOpen, Info, ChevronDown, Globe } from 'lucide-react';
import PropTypes from 'prop-types';


import { VNET_TOPOLOGIES, AVD_TOPOLOGIES, AKS_TOPOLOGIES, SQL_TOPOLOGIES, WEB_TOPOLOGIES, SPOKE_TYPES } from '../data/constants';
import ValidationHighlight from './ValidationHighlight';
/**
 * Expanded Resource Panel Component
 * 
 * Displays detailed view for a selected resource, including:
 * - Topology selection (Single, Hub & Spoke, Bundle)
 * - Generated resource names with copy functionality
 * - Resource description and naming recommendations
 * - Naming rules visualization
 * 
 * @param {Object} props - Component props
 * @param {Object} props.resource - The resource definition object
 * @param {string} props.genName - The generated name for the base resource
 * @param {boolean} props.isCopied - Copied feedback state
 * @param {boolean} props.isDarkMode - Current theme state
 * @param {Function} props.onCopy - Copy handler
 * @param {string|null} props.selectedSubResource - Currently selected sub-resource suffix
 * @param {Function} props.onSubResourceChange - Handler for sub-resource selection
 * @param {string} props.topology - Current topology selection
 * @param {Function} props.setTopology - Handler for topology selection
 * @param {Array} props.selectedSpokes - Selected spokes for Hub & Spoke
 * @param {Function} props.handleSpokeToggle - Handler for spoke updates
 * @param {boolean} props.bundle - Bundle state (if applicable)
 * @param {Function} props.getBundleName - Helper for bundle names
 */
function ExpandedPanel({ resource, genName, isCopied, isDarkMode, onCopy, selectedSubResource, onSubResourceChange, topology, setTopology, selectedSpokes, handleSpokeToggle, bundle, getBundleName }) {
    const currentSubResource = resource.subResources?.find(sr => sr.suffix === selectedSubResource);
    const isVNet = resource.name === 'Virtual network';
    const isAVD = resource.category === 'Desktop Virtualization' && resource.name === 'Host Pool';
    const isAKS = resource.name === 'Kubernetes (AKS)';
    const isSQL = resource.name === 'SQL server';
    const isWeb = resource.name === 'App Service';

    let topologyOptions = [];
    if (isVNet) topologyOptions = VNET_TOPOLOGIES;
    if (isAVD) topologyOptions = AVD_TOPOLOGIES;
    if (isAKS) topologyOptions = AKS_TOPOLOGIES; // Includes Single and Bundle
    if (isSQL) topologyOptions = SQL_TOPOLOGIES; // Includes Single and Bundle
    if (isWeb) topologyOptions = WEB_TOPOLOGIES; // Includes Single and Bundle

    const showTopology = topologyOptions.length > 0;
    const isHubSpoke = isVNet && topology === 'hub-spoke';

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
        'Scope': 'Scope depends on context.'
    };

    const scopeDesc = SCOPE_DESCRIPTIONS[resource.scope] || `Name uniqueness scope: ${resource.scope}`;

    let displayDesc = resource.desc;
    let displayBestPractice = resource.bestPractice;

    if (resource.name === 'Subnet') {
        if (selectedSubResource === 'afw') {
            displayDesc = "Dedicated subnet for Azure Firewall. The name 'AzureFirewallSubnet' is mandatory.";
            displayBestPractice = "Must be named exactly 'AzureFirewallSubnet'. Recommended size is /26.";
        } else if (selectedSubResource === 'bas') {
            displayDesc = "Dedicated subnet for Azure Bastion. The name 'AzureBastionSubnet' is mandatory.";
            displayBestPractice = "Must be named exactly 'AzureBastionSubnet'. Minimum size is /26. Must be in the same VNet as the VMs it connects to.";
        } else if (selectedSubResource === 'gw') {
            displayDesc = "Dedicated subnet for Virtual Network Gateways (VPN/ExpressRoute). The name 'GatewaySubnet' is mandatory.";
            displayBestPractice = "Must be named exactly 'GatewaySubnet'. Recommended size is /27 or larger.";
        } else if (selectedSubResource === 'afwm') {
            displayDesc = "Dedicated management subnet for Azure Firewall (Basic SKU or forced tunneling). The name 'AzureFirewallManagementSubnet' is mandatory.";
            displayBestPractice = "Must be named exactly 'AzureFirewallManagementSubnet'. Minimum size is /26.";
        } else if (selectedSubResource === 'rs') {
            displayDesc = "Dedicated subnet for Azure Route Server. The name 'RouteServerSubnet' is mandatory.";
            displayBestPractice = "Must be named exactly 'RouteServerSubnet'. Minimum size is /27.";
        }
    }

    return (
        <div onClick={(e) => e.stopPropagation()} className={`p-6 border-t cursor-default ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0078d4]" />
                    <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Resource guidance</h4>
                </div>
                <a href={resource.learnUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] flex items-center gap-1.5 text-[#0078d4] hover:underline">
                    View Documentation
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            </div>

            {/* Topology Selector */}
            {showTopology && (
                <div className={`mb-5 p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>{isVNet ? 'Topology' : 'Deployment Bundle'}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <select
                                value={topology}
                                onChange={(e) => setTopology && setTopology(e.target.value)}
                                className={`w-full h-[36px] px-3 pr-8 rounded border appearance-none cursor-pointer text-[13px] font-medium ${isDarkMode ? 'bg-[#1b1a19] border-[#484644] text-white' : 'bg-[#faf9f8] border-[#edebe9] text-[#201f1e]'}`}
                            >
                                {topologyOptions.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`} />
                        </div>

                        {isHubSpoke && (
                            <div className="flex flex-col gap-2 mt-2">
                                <label className={`text-[11px] font-semibold uppercase tracking-wider opacity-70 ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#616161]'}`}>Spokes</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {SPOKE_TYPES.map(spoke => (
                                        <label key={spoke.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedSpokes && selectedSpokes.includes(spoke.value)}
                                                onChange={() => handleSpokeToggle && handleSpokeToggle(spoke.value)}
                                                className={`rounded text-[#0078d4] focus:ring-[#0078d4] ${isDarkMode ? 'bg-[#1b1a19] border-[#605e5c]' : 'bg-white border-[#8a8886]'}`}
                                            />
                                            <span className={`text-[12px] ${isDarkMode ? 'text-[#d2d2d2]' : 'text-[#201f1e]'}`}>{spoke.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sub-resource Selector (only for resources with subResources) */}
            {resource.subResources && resource.subResources.length > 0 && (
                <div className={`mb-5 p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Target service</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <select
                                value={selectedSubResource || ''}
                                onChange={(e) => onSubResourceChange?.(e.target.value)}
                                className={`w-full h-[36px] px-3 pr-8 rounded border appearance-none cursor-pointer text-[13px] font-medium ${isDarkMode ? 'bg-[#1b1a19] border-[#484644] text-white' : 'bg-[#faf9f8] border-[#edebe9] text-[#201f1e]'}`}
                            >
                                {resource.subResources.map((sr) => (
                                    <option key={sr.suffix} value={sr.suffix}>{sr.label}</option>
                                ))}
                            </select>
                            <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`} />
                        </div>
                        {currentSubResource?.dnsZone && (
                            <div className={`text-[12px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>
                                <span className="font-medium">Private DNS Zone:</span>{' '}
                                <code className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#f3f2f1] text-[#0078d4]'}`}>
                                    {currentSubResource.dnsZone}
                                </code>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Generated Bundle List */}
            {bundle && bundle.length > 0 && (
                <div className={`mb-5 p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Generated Resources</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        {bundle.map((item, idx) => {
                            const itemName = getBundleName(item);
                            return (
                                <div key={idx} className="flex flex-col">
                                    <span className={`text-[10px] uppercase tracking-wider font-semibold opacity-50 mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>{item.name}</span>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className={`text-[13px] font-medium font-mono truncate flex-1 ${isDarkMode ? 'text-[#ffffff]' : 'text-[#242424]'}`}>
                                            <ValidationHighlight name={itemName} allowedCharsPattern={item.chars || resource.chars} isDarkMode={isDarkMode} />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCopy(e, itemName);
                                            }}
                                            className={`h-[24px] px-2 rounded text-[11px] font-semibold transition-all flex items-center gap-1 shrink-0 ${isDarkMode ? 'text-white' : 'text-white'} ${isCopied
                                                ? 'bg-[#107c10]'
                                                : 'bg-[#0078d4] hover:bg-[#106ebe]'
                                                }`}
                                            title="Copy this name"
                                        >
                                            <Copy className="w-3 h-3" />
                                            {/* Copy text omitted for inline items to save space? Or included? User said "replicate". Included for now. */}
                                            <span>Copy</span>
                                        </button>
                                    </div>
                                    {idx < bundle.length - 1 && <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-[#484644]' : 'bg-[#edebe9]'}`}></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Description & Best Practice */}
                <div className="flex flex-col gap-6">
                    {/* About this Service */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-[#0078d4]" />
                            <h5 className={`text-[12px] font-semibold tracking-wide uppercase ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>About this Service</h5>
                        </div>
                        <div className={`ml-6 p-4 rounded-r border-l-4 ${isDarkMode ? 'bg-[#041829] border-[#0078d4] border-t border-r border-b border-[#0078d4]' : 'bg-[#f0f6ff] border-[#0078d4] border-t border-r border-b border-[#0078d4]'}`}>
                            <p className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#323130]'}`}>
                                {displayDesc}
                            </p>
                        </div>
                    </div>

                    {/* Naming Recommendation */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-[#107c10]" />
                            <h5 className={`text-[12px] font-semibold tracking-wide uppercase ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Naming Recommendation</h5>
                        </div>
                        <div className={`ml-6 p-4 rounded-r border-l-4 ${isDarkMode ? 'bg-[#052505] border-[#107c10] border-t border-r border-b border-[#107c10]' : 'bg-[#dff6dd] border-[#107c10] border-t border-r border-b border-[#107c10]'}`}>
                            <p className={`text-[13px] leading-relaxed font-medium ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#201f1e]'}`}>
                                {displayBestPractice}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Naming Rules Card */}
                <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Naming rules</span>
                    </div>
                    <div className="space-y-4">
                        {/* Scope */}
                        <div className="flex items-start justify-between group/scope relative">
                            <div className="flex flex-col gap-0.5">
                                <span className={`text-[13px] font-medium ${isDarkMode ? 'text-[#e1dfdd]' : 'text-[#323130]'}`}>Uniqueness Scope</span>
                                <span className={`text-[11px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>The level at which the name must be unique.</span>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-right">
                                <span className={`text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{resource.scope || 'Resource group'}</span>
                                <span className={`text-[11px] max-w-[200px] leading-tight ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>{scopeDesc}</span>
                            </div>
                        </div>

                        {/* Max Length */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className={`text-[13px] font-medium ${isDarkMode ? 'text-[#e1dfdd]' : 'text-[#323130]'}`}>Max Length</span>
                                <span className={`text-[11px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Maximum number of characters allowed.</span>
                            </div>
                            <span className={`text-[13px] font-mono font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>
                                {resource.maxLength} chars
                            </span>
                        </div>

                        {/* Abbreviation */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className={`text-[13px] font-medium ${isDarkMode ? 'text-[#e1dfdd]' : 'text-[#323130]'}`}>Recommended Abbrev</span>
                                <span className={`text-[11px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Common abbreviation for this resource type.</span>
                            </div>
                            <code className={`text-[12px] px-2 py-0.5 rounded font-mono border ${isDarkMode ? 'bg-[#323130] text-[#60cdff] border-[#605e5c]' : 'bg-[#f3f2f1] text-[#0078d4] border-[#e1dfdd]'}`}>
                                {resource.abbrev}{selectedSubResource ? `-${selectedSubResource}` : ''}
                            </code>
                        </div>

                        {/* Characters */}
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-0.5 max-w-[40%]">
                                <span className={`text-[13px] font-medium ${isDarkMode ? 'text-[#e1dfdd]' : 'text-[#323130]'}`}>Allowed Characters</span>
                                <span className={`text-[11px] leading-tight ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>
                                    Only the characters shown here are permitted in the name.
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[55%]">
                                {resource.chars?.split(',').map((char, i) => (
                                    <span key={i} className={`text-[11px] px-2 py-1 rounded font-mono font-medium min-w-[24px] text-center border ${isDarkMode ? 'bg-[#323130] text-[#e1dfdd] border-[#605e5c]' : 'bg-[#f3f2f1] text-[#323130] border-[#e1dfdd]'}`}>
                                        {char.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
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
        bestPractice: PropTypes.string,
        learnUrl: PropTypes.string,
        subResources: PropTypes.arrayOf(PropTypes.shape({
            suffix: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            dnsZone: PropTypes.string,
        })),
    }).isRequired,
    genName: PropTypes.string.isRequired,
    isCopied: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    onCopy: PropTypes.func.isRequired,
    selectedSubResource: PropTypes.string,
    onSubResourceChange: PropTypes.func,
    bundle: PropTypes.array,
    getBundleName: PropTypes.func,
};

export default memo(ExpandedPanel);

