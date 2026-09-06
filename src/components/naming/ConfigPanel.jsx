import { memo } from 'react';
import { Edit3, Eye, EyeOff, ArrowLeft, ArrowRight, Copy, Check, Layers } from 'lucide-react';
import SearchableSelect from '../shared/SearchableSelect';
import Tooltip from '../shared/Tooltip';
import ResetButton from '../shared/ResetButton';
import { AZURE_REGIONS, ENVIRONMENTS } from '../../data/constants';
import PropTypes from 'prop-types';

/**
 * Configuration Panel Component
 * 
 * Displays the main configuration form for defining resource naming parameters:
 * - Organization Prefix, Workload, Environment, Region, Instance
 * - Pattern Builder: Allows reordering of naming segments
 * - Live Preview: Shows the current naming schema
 */
function ConfigPanel({
    workload,
    setWorkload,
    envValue,
    setEnvValue,
    regionValue,
    setRegionValue,
    instance,
    onInstanceChange,
    orgPrefix,
    setOrgPrefix,
    showOrg,
    setShowOrg,
    namingOrder,
    onMoveItem,
    liveSchemaStr,
    copiedId,
    onCopy,
    onResetDefaults
}) {
    return (
        <div className="relative z-40 animate-slide-up bg-fluent-bg-card rounded-lg border border-fluent-stroke-subtle shadow-soft p-4 flex flex-col gap-4">
            {/* Header / Actions */}
            <div className="flex items-center justify-between border-b border-fluent-stroke-subtle pb-2">
                <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-fluent-brand-fg" />
                    <h3 className="text-[14px] font-semibold text-fluent-fg-primary">Naming Parameters</h3>
                </div>
                <ResetButton
                    onClick={onResetDefaults}
                    title="Reset to default naming configuration"
                >
                    Reset Defaults
                </ResetButton>
            </div>

            {/* Form grid - 2 columns on large screens to cleanly fill whitespace */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
                {/* Org Prefix */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <Tooltip content="Organisation prefix">
                        <label className={`block text-[13px] font-semibold sm:text-right text-fluent-fg-secondary whitespace-nowrap sm:w-[100px] ${!showOrg ? 'opacity-50' : ''}`}>Org Prefix</label>
                    </Tooltip>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                            type="text"
                            value={orgPrefix}
                            onChange={(e) => setOrgPrefix(e.target.value)}
                            placeholder="Optional"
                            disabled={!showOrg}
                            className="flex-1 min-w-0 px-3 h-[32px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 disabled:opacity-40 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                        />
                        <button
                            type="button"
                            onClick={() => setShowOrg(!showOrg)}
                            className={`h-[32px] flex items-center justify-center rounded-[4px] border transition-all duration-200 ease-in-out active:scale-95 shrink-0 px-2.5 gap-1.5 ${showOrg ? 'bg-fluent-brand-bg border-fluent-brand-bg text-white' : 'bg-fluent-bg-canvas border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary'}`}
                            title={showOrg ? 'Disable Org' : 'Enable Org'}
                        >
                            {showOrg ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span className="text-[12px] font-medium">{showOrg ? 'Hide Org' : 'Show Org'}</span>
                        </button>
                    </div>
                </div>

                {/* Workload */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <Tooltip content="Application or workload name">
                        <label className="block text-[13px] font-semibold sm:text-right text-fluent-fg-secondary whitespace-nowrap sm:w-[100px]">Workload</label>
                    </Tooltip>
                    <input
                        type="text"
                        value={workload}
                        onChange={(e) => setWorkload(e.target.value)}
                        placeholder="e.g. webapp, corehub, analytics"
                        className="flex-1 min-w-0 px-3 h-[32px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                    />
                </div>

                {/* Environment */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <Tooltip content="Lifecycle stage">
                        <label className="block text-[13px] font-semibold sm:text-right text-fluent-fg-secondary whitespace-nowrap sm:w-[100px]">Environment</label>
                    </Tooltip>
                    <div className="flex-1 min-w-0">
                        <SearchableSelect items={ENVIRONMENTS} value={envValue} onChange={setEnvValue} compact />
                    </div>
                </div>

                {/* Region */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <Tooltip content="Azure region">
                        <label className="block text-[13px] font-semibold sm:text-right text-fluent-fg-secondary whitespace-nowrap sm:w-[100px]">Region</label>
                    </Tooltip>
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex-1 min-w-0">
                            <SearchableSelect items={AZURE_REGIONS} value={regionValue} onChange={setRegionValue} placeholder="Select region..." compact />
                        </div>
                        <a
                            href="https://datacenters.microsoft.com/globe/explore/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Azure Infrastructure Map"
                            className="h-[32px] flex items-center justify-center rounded-[4px] border transition-all duration-200 ease-in-out active:scale-95 shrink-0 px-2.5 gap-1.5 no-underline bg-fluent-bg-canvas border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary"
                        >
                            <svg viewBox="0 0 23 23" className="w-3.5 h-3.5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0h11v11H0z" fill="#f35325"/>
                                <path d="M12 0h11v11H12z" fill="#81bc06"/>
                                <path d="M0 12h11v11H0z" fill="#05a6f0"/>
                                <path d="M12 12h11v11H12z" fill="#ffba08"/>
                            </svg>
                            <span className="text-[12px] font-medium hidden xl:inline">Datacentre Map</span>
                        </a>
                    </div>
                </div>

                {/* Instance */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <Tooltip content="Instance number (001-999)">
                        <label className="block text-[13px] font-semibold sm:text-right text-fluent-fg-secondary whitespace-nowrap sm:w-[100px]">Instance</label>
                    </Tooltip>
                    <input
                        type="text"
                        value={instance}
                        onChange={onInstanceChange}
                        maxLength={3}
                        placeholder="001"
                        className="flex-1 min-w-0 px-3 h-[32px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                    />
                </div>
            </div>

            {/* Pattern Builder + Live Preview */}
            <div className="border-t border-fluent-stroke-subtle pt-3 flex flex-col gap-3">
                {/* Segment chips — compact inline strip with hover-reveal arrows */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-3.5 h-3.5 text-fluent-brand-fg" />
                        <h3 className="text-[13px] font-semibold text-fluent-fg-primary">Pattern Builder</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
                        {namingOrder.map((item, index) => (
                            <div
                                key={item}
                                className={`group flex items-center gap-1.5 pl-1 pr-1.5 h-[30px] rounded-[4px] border cursor-default transition-colors ${item === 'Org' && !showOrg ? 'opacity-40' : ''} bg-fluent-bg-canvas border-fluent-stroke-subtle hover:border-fluent-brand-bg`}
                            >
                                <span className="w-[18px] h-[18px] rounded-sm flex items-center justify-center text-[10px] font-bold shrink-0 bg-fluent-info-bg text-fluent-brand-fg">
                                    {index + 1}
                                </span>
                                <span className="text-[12px] font-medium text-fluent-fg-primary">{item}</span>
                                {/* Arrow buttons */}
                                <div className="flex items-center gap-px transition-opacity">
                                    <button
                                        type="button"
                                        onClick={() => onMoveItem(index, -1)}
                                        disabled={index === 0}
                                        className="p-0.5 rounded transition-colors disabled:opacity-20 text-fluent-fg-tertiary hover:bg-fluent-bg-hover hover:text-fluent-fg-primary"
                                        title="Move left"
                                    >
                                        <ArrowLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onMoveItem(index, 1)}
                                        disabled={index === namingOrder.length - 1}
                                        className="p-0.5 rounded transition-colors disabled:opacity-20 text-fluent-fg-tertiary hover:bg-fluent-bg-hover hover:text-fluent-fg-primary"
                                        title="Move right"
                                    >
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Live Preview — integrated footer with inline title */}
                <div className="px-3 py-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border border-fluent-stroke-subtle bg-fluent-bg-canvas rounded-lg">
                    <div className="flex items-center gap-2 shrink-0">
                        <Eye className="w-3.5 h-3.5 text-fluent-brand-fg" />
                        <span className="text-[12px] font-medium text-fluent-fg-secondary">Live Schema:</span>
                    </div>
                    <div className="flex flex-1 items-center gap-2 sm:gap-3 w-full min-w-0">
                        <div className="flex-1 px-3 py-1.5 rounded font-mono text-[13px] font-semibold tracking-wide bg-fluent-bg-card text-fluent-brand-fg border border-fluent-stroke-subtle overflow-x-auto whitespace-nowrap scrollbar-hide">
                            {liveSchemaStr}
                        </div>
                        <button
                            type="button"
                            onClick={onCopy}
                            className={`shrink-0 h-[26px] px-2.5 rounded-[4px] text-[12px] font-medium transition-all duration-200 ease-in-out active:scale-95 flex items-center gap-1.5 border ${copiedId === 'live-pill'
                                ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]'
                                : 'bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-secondary hover:border-fluent-stroke-strong hover:text-fluent-fg-primary'
                                }`}
                        >
                            {copiedId === 'live-pill' ? <><Check className="w-3.5 h-3.5" /> <span>Copied</span></> : <><Copy className="w-3.5 h-3.5" /> <span>Copy</span></>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

ConfigPanel.propTypes = {
    workload: PropTypes.string.isRequired,
    setWorkload: PropTypes.func.isRequired,
    envValue: PropTypes.string.isRequired,
    setEnvValue: PropTypes.func.isRequired,
    regionValue: PropTypes.string.isRequired,
    setRegionValue: PropTypes.func.isRequired,
    instance: PropTypes.string.isRequired,
    onInstanceChange: PropTypes.func.isRequired,
    orgPrefix: PropTypes.string.isRequired,
    setOrgPrefix: PropTypes.func.isRequired,
    showOrg: PropTypes.bool.isRequired,
    setShowOrg: PropTypes.func.isRequired,
    namingOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
    onMoveItem: PropTypes.func.isRequired,
    liveSchemaStr: PropTypes.string.isRequired,
    copiedId: PropTypes.string,
    onCopy: PropTypes.func.isRequired,
    onResetDefaults: PropTypes.func.isRequired
};

export default memo(ConfigPanel);
