import { memo } from 'react';
import { Copy, Check, BookOpen, Info, ChevronDown, Globe } from 'lucide-react';
import PropTypes from 'prop-types';

function ExpandedPanel({ resource, genName, isCopied, isDarkMode, onCopy, selectedSubResource, onSubResourceChange }) {
    const currentSubResource = resource.subResources?.find(sr => sr.suffix === selectedSubResource);

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

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Description & Best Practice */}
                <div className="flex flex-col gap-4">
                    <div>
                        <span className={`text-[11px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Description</span>
                        <p className={`text-[13px] mt-1.5 leading-relaxed ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#323130]'}`}>{displayDesc}</p>
                    </div>
                    <div>
                        <span className={`text-[11px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>CAF best practice</span>
                        <div className={`mt-1.5 p-3 rounded border-l-4 ${isDarkMode ? 'bg-[#252423] border-[#0078d4]' : 'bg-white border-[#0078d4]'}`}>
                            <div className="flex gap-3">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0078d4]" />
                                <p className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#323130]'}`}>{displayBestPractice}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Naming Rules Card */}
                <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className={`text-[12px] font-semibold tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Naming rules</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Scope</span>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[13px] font-semibold text-right ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{resource.scope || 'Resource group'}</span>
                                <span className={`text-[11px] text-right max-w-[200px] leading-tight ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>{scopeDesc}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Abbreviation</span>
                            <code className={`text-[12px] px-2 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#f3f2f1] text-[#0078d4]'}`}>
                                {resource.abbrev}{selectedSubResource ? `-${selectedSubResource}` : ''}
                            </code>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Characters</span>
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {resource.chars?.split(',').map((char, i) => (
                                    <span key={i} className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#323130] text-[#c8c6c4]' : 'bg-[#f3f2f1] text-[#605e5c]'}`}>{char.trim()}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy Name Button */}
            <button
                onClick={onCopy}
                aria-label={isCopied ? 'Copied to clipboard' : 'Copy resource name'}
                className={`mt-6 w-full h-[40px] rounded font-semibold text-[14px] flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md ${isCopied
                    ? 'bg-[#107c10] text-white'
                    : 'bg-primary-gradient text-white hover:opacity-90 active:scale-[0.98]'
                    }`}
            >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied!' : 'Copy Name'}
            </button>
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
};

export default memo(ExpandedPanel);

