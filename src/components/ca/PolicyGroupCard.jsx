import { useState, memo, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
    Copy, 
    Check, 
    ExternalLink, 
    ChevronDown, 
    ChevronUp, 
    Users, 
    Lock, 
    BadgeCheck, 
    AlertCircle, 
    ShieldAlert, 
    AlertTriangle, 
    Layers, 
    Settings2, 
    Terminal, 
    Code2, 
    Sliders, 
    Plus, 
    Minus, 
    ArrowRight, 
    FileText, 
    Shield 
} from 'lucide-react';
import FluentDropdown from '../shared/FluentDropdown';
import { 
    getReadableTitle, 
    getCategoryColorClass, 
    getPolicyMetadata, 
    generateDeploymentScripts 
} from '../../data/conditionalAccessData';

/**
 * Helper component to render formatted setting lines (Include/Exclude pills, Key-Values, Grant/Block rules).
 */
function SettingLineItem({ line }) {
    if (!line || typeof line !== 'string') return null;

    const trimmed = line.trim();
    if (!trimmed) return null;

    // Include pattern
    if (trimmed.startsWith('Include:')) {
        const content = trimmed.replace('Include:', '').trim();
        return (
            <div className="flex items-start gap-2 text-[13px] leading-relaxed mt-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold tracking-wide bg-fluent-cat-green-bg text-fluent-cat-green-fg shrink-0 mt-0.5">
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    Include
                </span>
                <span className="text-fluent-fg-primary break-words min-w-0">{content}</span>
            </div>
        );
    }

    // Exclude pattern
    if (trimmed.startsWith('Exclude:')) {
        const content = trimmed.replace('Exclude:', '').trim();
        return (
            <div className="flex items-start gap-2 text-[13px] leading-relaxed mt-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold tracking-wide bg-fluent-cat-red-bg text-fluent-cat-red-fg shrink-0 mt-0.5">
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                    Exclude
                </span>
                <span className="text-fluent-fg-primary font-medium break-words min-w-0">{content}</span>
            </div>
        );
    }

    // Block access pattern
    if (trimmed.toLowerCase().startsWith('block access')) {
        return (
            <div className="flex items-center gap-2 text-[13px] leading-relaxed mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-fluent-cat-red-bg text-fluent-cat-red-fg shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Block access
                </span>
                {trimmed.length > 13 && (
                    <span className="text-fluent-fg-secondary">{trimmed.substring(13).replace(/^\.|\.$/g, '').trim()}</span>
                )}
            </div>
        );
    }

    // Grant access with arrow flow
    if (trimmed.includes('->')) {
        const parts = trimmed.split('->');
        const left = parts[0].trim();
        const right = parts.slice(1).join('->').trim();
        return (
            <div className="flex items-start flex-wrap gap-1.5 text-[13px] leading-relaxed mt-1.5">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[11px] font-semibold bg-fluent-cat-green-bg text-fluent-cat-green-fg shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    {left}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-fluent-brand-fg shrink-0 mt-1" />
                <span className="font-semibold text-fluent-fg-primary break-words min-w-0">{right}</span>
            </div>
        );
    }

    // Key-Value pattern (e.g., Client apps: Exchange ActiveSync)
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > -1 && colonIdx < 35 && !trimmed.startsWith('http')) {
        const key = trimmed.substring(0, colonIdx).trim();
        const val = trimmed.substring(colonIdx + 1).trim();
        return (
            <div className="flex items-start gap-2 text-[13px] leading-relaxed mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fluent-brand-fg mt-2 shrink-0"></span>
                <div className="flex-1 min-w-0">
                    <strong className="font-semibold text-fluent-fg-primary mr-1">{key}:</strong>
                    <span className="text-fluent-fg-secondary">{val}</span>
                </div>
            </div>
        );
    }

    // Default line fallback
    return (
        <div className="text-[13px] text-fluent-fg-secondary leading-relaxed mt-1 pl-2.5 border-l-2 border-fluent-stroke-subtle">
            {trimmed}
        </div>
    );
}

SettingLineItem.propTypes = {
    line: PropTypes.string.isRequired
};

/**
 * Component to render grouped policy settings in the Entra Template view.
 */
function TemplateSettingBlock({ label, value }) {
    const lines = useMemo(() => value.split('\n').filter(Boolean), [value]);

    return (
        <div className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
            <span className="text-[11px] font-semibold text-fluent-fg-tertiary uppercase tracking-wider">
                {label}
            </span>
            <div className="flex flex-col">
                {lines.map((line, idx) => (
                    <SettingLineItem key={idx} line={line} />
                ))}
            </div>
        </div>
    );
}

TemplateSettingBlock.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
};

/**
 * PolicyGroupCard Component
 * 
 * Renders a standardized Microsoft Entra Conditional Access policy card with:
 * - Clear human-readable title and target persona selector
 * - Standardized CAF naming bar with 1-click clipboard integration
 * - Interactive Entra Portal Template showing Assignments & Access Controls
 * - Infrastructure-as-Code export tab for Microsoft Graph PowerShell & JSON
 * - Implementation guidance, prerequisites, and licensing tier requirements
 */
function PolicyGroupCard({ requirement, policies, copiedId, handleCopy, globalExpandState }) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('template'); // 'template' | 'script'
    const [scriptFormat, setScriptFormat] = useState('powershell'); // 'powershell' | 'json'
    const [scriptCopied, setScriptCopied] = useState(false);

    useEffect(() => {
        setIsExpanded(globalExpandState || false);
    }, [globalExpandState]);

    const activeIndex = selectedIdx < policies.length ? selectedIdx : 0;
    const activePolicy = policies[activeIndex];

    const readableTitle = useMemo(() => getReadableTitle(requirement), [requirement]);
    const isCopied = copiedId === activePolicy?.name;

    const metadata = useMemo(() => getPolicyMetadata(activePolicy), [activePolicy]);
    const deploymentScripts = useMemo(() => generateDeploymentScripts(activePolicy), [activePolicy]);

    const formatTarget = useCallback((policyName) => {
        const parts = policyName.split('-');
        if (parts.length < 5) return policyName;
        
        const splitCamelCase = (str) => {
            return str
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                .trim();
        };

        const persona = splitCamelCase(parts[1]);
        const resource = splitCamelCase(parts[2]);
        return `${persona} → ${resource}`;
    }, []);

    const handleCopyScript = useCallback(async (e) => {
        e.stopPropagation();
        const codeToCopy = scriptFormat === 'powershell' 
            ? deploymentScripts.powershell 
            : deploymentScripts.json;
        
        try {
            await navigator.clipboard.writeText(codeToCopy);
            setScriptCopied(true);
            setTimeout(() => setScriptCopied(false), 2000);
        } catch (err) {
            console.error('Copy script failed', err);
        }
    }, [scriptFormat, deploymentScripts]);

    if (!activePolicy) return null;

    const assignments = activePolicy.settings 
        ? activePolicy.settings.filter(s => ['Users', 'Identities', 'Target resources', 'Conditions'].includes(s.label))
        : [];
    const accessControls = activePolicy.settings 
        ? activePolicy.settings.filter(s => ['Grant', 'Session'].includes(s.label))
        : [];

    return (
        <div className="relative rounded-lg border shadow-soft bg-fluent-bg-card dark:bg-fluent-bg-subtle border-fluent-stroke-subtle w-full flex flex-col overflow-hidden hover:border-fluent-stroke-strong transition-all duration-200">
            
            {/* Main Overview Section */}
            <div className="p-4 sm:p-5 flex flex-col gap-4">
                
                {/* Header: Title, Target Scope, Required License, Categories */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-[15px] sm:text-[16px] font-semibold text-fluent-fg-primary" title={readableTitle}>
                                {readableTitle}
                            </h3>
                            {metadata.isPreview && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-bg-subtle text-fluent-fg-secondary border border-fluent-stroke-subtle">
                                    Preview
                                </span>
                            )}
                        </div>

                        {/* Target Scope Dropdown or Single Target Badge and Categories */}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {policies.length > 1 ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-[12px] font-medium text-fluent-fg-tertiary shrink-0">Scope:</span>
                                    <FluentDropdown
                                        options={policies.map((p, idx) => ({
                                            value: idx,
                                            label: `${formatTarget(p.name)} (${idx + 1}/${policies.length})`
                                        }))}
                                        value={activeIndex}
                                        onChange={(val) => setSelectedIdx(Number(val))}
                                        ariaLabel="Select policy scope variant"
                                        className="w-full sm:w-auto sm:min-w-[240px]"
                                    />
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[12px] font-medium bg-fluent-bg-subtle text-fluent-fg-secondary border border-fluent-stroke-subtle">
                                    <span className="text-fluent-fg-tertiary">Scope:</span>
                                    <span className="text-fluent-fg-primary font-semibold">{formatTarget(activePolicy.name)}</span>
                                </div>
                            )}

                            {/* Category Badges */}
                            <div className="flex gap-1.5 flex-wrap items-center">
                                {activePolicy.categories.map((cat, idx) => (
                                    <span 
                                        key={idx} 
                                        className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${getCategoryColorClass(cat)}`}
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Required License Tier Badge */}
                    <div className="shrink-0 self-start">
                        <span 
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium border ${metadata.licenseBadgeClass}`}
                            title={`Required license level: ${metadata.license}`}
                        >
                            <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">Required:</span>
                            <span className="font-semibold">{metadata.license}</span>
                        </span>
                    </div>
                </div>

                {/* Standardized CAF Policy Name Bar */}
                <div className="group/copy relative flex items-center justify-between gap-2 px-3 py-1.5 min-h-[32px] w-full min-w-0 rounded-[4px] border bg-fluent-bg-canvas hover:bg-fluent-bg-hover border-transparent transition-all">
                    <span className="flex-1 min-w-0 font-mono text-[13px] font-semibold text-fluent-brand-fg truncate select-all pr-2" title={activePolicy.name}>
                        {activePolicy.name}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(activePolicy.name, activePolicy.name);
                        }}
                        className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[11px] font-medium transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg ${isCopied 
                            ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                            : 'bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-primary hover:bg-fluent-bg-hover hover:border-fluent-stroke-strong'}`}
                        title="Copy standardized policy name"
                    >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy Name'}</span>
                    </button>
                </div>

                {/* Policy Description */}
                <p className="text-[13px] leading-relaxed text-fluent-fg-secondary">
                    {metadata.cleanDesc || activePolicy.desc}
                </p>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-fluent-stroke-subtle">
                    <div className="flex items-center gap-2 text-[12px] text-fluent-fg-tertiary">
                        <Shield className="w-3.5 h-3.5 text-fluent-brand-fg" />
                        <span>Recommended Baseline: <strong className="text-fluent-fg-primary font-semibold">Report-only first</strong></span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {activePolicy.settings && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="px-3 h-[32px] rounded-[4px] border border-fluent-stroke-strong bg-fluent-bg-card text-fluent-fg-secondary hover:text-fluent-fg-primary hover:border-fluent-fg-primary hover:bg-fluent-bg-hover transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 text-[13px] font-medium shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50"
                                aria-expanded={isExpanded}
                            >
                                <Settings2 className="w-3.5 h-3.5 text-fluent-brand-fg" />
                                <span>{isExpanded ? 'Hide Template' : 'View Template'}</span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        {activePolicy.link && (
                            <a
                                href={activePolicy.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 h-[32px] rounded-[4px] border transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary hover:text-fluent-fg-primary text-[13px] font-medium shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50"
                            >
                                <svg viewBox="0 0 23 23" className="w-[13px] h-[13px] shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0h11v11H0z" fill="#f35325"/>
                                    <path d="M12 0h11v11H12z" fill="#81bc06"/>
                                    <path d="M0 12h11v11H0z" fill="#05a6f0"/>
                                    <path d="M12 12h11v11H12z" fill="#ffba08"/>
                                </svg>
                                Microsoft Learn
                                <ExternalLink className="w-3 h-3 ml-0.5 text-fluent-fg-tertiary" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Template / Script View */}
            {isExpanded && activePolicy.settings && (
                <div className="border-t border-fluent-stroke-subtle bg-fluent-bg-canvas rounded-b-lg p-4 sm:p-5 flex flex-col gap-4 animate-fade-in">
                    
                    {/* View Switcher Tabs Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-fluent-stroke-subtle">
                        <div className="flex shrink-0 bg-fluent-bg-canvas border border-fluent-stroke-subtle rounded-md p-0.5 w-full sm:w-auto" role="tablist">
                            <button
                                role="tab"
                                aria-selected={activeTab === 'template'}
                                onClick={() => setActiveTab('template')}
                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${activeTab === 'template' 
                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' 
                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                            >
                                <Sliders className="w-3.5 h-3.5" />
                                Entra Portal Template
                            </button>
                            <button
                                role="tab"
                                aria-selected={activeTab === 'script'}
                                onClick={() => setActiveTab('script')}
                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${activeTab === 'script' 
                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' 
                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                            >
                                <Code2 className="w-3.5 h-3.5" />
                                IAC Template
                            </button>
                        </div>

                        <div className="flex items-center gap-2 text-[12px] text-fluent-fg-tertiary">
                            <Layers className="w-3.5 h-3.5 text-fluent-brand-fg shrink-0" />
                            <span className="font-medium text-fluent-fg-secondary">Policy Configuration Template</span>
                        </div>
                    </div>

                    {/* Tab 1: Entra Portal Template */}
                    {activeTab === 'template' && (
                        <div className="flex flex-col gap-4">
                            
                            {/* Prerequisites / Safety Banner (if applicable) */}
                            {metadata.prerequisite && (
                                <div className="rounded-lg border shadow-soft bg-fluent-bg-card dark:bg-fluent-bg-subtle border-fluent-stroke-subtle overflow-hidden">
                                    <div className="px-4 py-2.5 flex items-center gap-2 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle shrink-0">
                                        <AlertTriangle className="w-3.5 h-3.5 text-fluent-cat-orange-fg shrink-0" />
                                        <span className="text-[12px] font-semibold text-fluent-fg-primary">Prerequisites & Considerations</span>
                                    </div>
                                    <div className="p-3 sm:p-4 text-[13px] leading-relaxed text-fluent-fg-secondary">
                                        {metadata.prerequisite}
                                    </div>
                                </div>
                            )}

                            {/* Assignments and Access Controls Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                
                                {/* Assignments Column */}
                                {assignments.length > 0 && (
                                    <div className="flex flex-col bg-fluent-bg-card dark:bg-fluent-bg-subtle border border-fluent-stroke-subtle rounded-lg shadow-soft overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle shrink-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                                                    <Users className="w-3.5 h-3.5" />
                                                </div>
                                                <h4 className="text-[13px] font-semibold text-fluent-fg-primary">
                                                    Assignments
                                                </h4>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-bg-card border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                                {assignments.length} section{assignments.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="p-4 divide-y divide-fluent-stroke-subtle flex flex-col flex-1">
                                            {assignments.map((setting, idx) => (
                                                <TemplateSettingBlock 
                                                    key={idx} 
                                                    label={setting.label} 
                                                    value={setting.value} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Access Controls Column */}
                                {accessControls.length > 0 && (
                                    <div className="flex flex-col bg-fluent-bg-card dark:bg-fluent-bg-subtle border border-fluent-stroke-subtle rounded-lg shadow-soft overflow-hidden">
                                        <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle shrink-0">
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                                                    <Lock className="w-3.5 h-3.5" />
                                                </div>
                                                <h4 className="text-[13px] font-semibold text-fluent-fg-primary">
                                                    Access Controls
                                                </h4>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-bg-card border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                                {accessControls.length} control{accessControls.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="p-4 divide-y divide-fluent-stroke-subtle flex flex-col flex-1">
                                            {accessControls.map((setting, idx) => (
                                                <TemplateSettingBlock 
                                                    key={idx} 
                                                    label={setting.label} 
                                                    value={setting.value} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Implementation Readiness Callout */}
                            <div className="rounded-lg border shadow-soft bg-fluent-bg-card dark:bg-fluent-bg-subtle border-fluent-stroke-subtle px-4 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 text-[12px]">
                                <div className="flex items-center gap-2 text-fluent-fg-primary">
                                    <AlertCircle className="w-4 h-4 text-fluent-cat-orange-fg shrink-0" />
                                    <span className="text-fluent-fg-secondary">
                                        <span className="text-fluent-fg-tertiary mr-1.5 font-normal">Rollout Mode:</span>
                                        <strong className="text-fluent-fg-primary font-semibold">Report-only (validate 14–30 days)</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-fluent-fg-primary">
                                    <ShieldAlert className="w-4 h-4 text-fluent-cat-red-fg shrink-0" />
                                    <span className="text-fluent-fg-secondary">
                                        <span className="text-fluent-fg-tertiary mr-1.5 font-normal">Safety:</span>
                                        <strong className="text-fluent-fg-primary font-semibold">Exclude break-glass account</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Graph Script & JSON Export */}
                    {activeTab === 'script' && (
                        <div className="relative rounded-lg border shadow-soft bg-fluent-bg-card dark:bg-fluent-bg-subtle border-fluent-stroke-subtle w-full flex flex-col overflow-hidden flex-1 min-h-0">
                            <div className="px-4 py-3 sm:px-5 sm:py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle shrink-0">
                                <div className="flex items-center gap-3 text-fluent-fg-primary font-semibold select-none">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                                        <Code2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] sm:text-[15px]">IAC Template</span>
                                        <span className="text-[12px] font-normal text-fluent-fg-secondary">
                                            Review and export your {scriptFormat === 'powershell' ? 'Microsoft Graph PowerShell' : 'Graph API JSON'} script
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 w-full lg:w-auto">
                                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 lg:gap-2 w-full sm:w-auto">
                                        <div className="flex shrink-0 bg-fluent-bg-canvas border border-fluent-stroke-subtle rounded-md p-0.5 w-full sm:w-auto">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setScriptFormat('powershell'); }}
                                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${scriptFormat === 'powershell' 
                                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' 
                                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                                            >
                                                <Terminal className="w-3.5 h-3.5" />
                                                PowerShell
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setScriptFormat('json'); }}
                                                className={`flex-1 sm:flex-none text-[12px] px-3 py-1.5 font-medium rounded-sm transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${scriptFormat === 'json' 
                                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle' 
                                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover border border-transparent'}`}
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                JSON Payload
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleCopyScript}
                                            className={`flex-1 sm:flex-none px-3 h-[32px] rounded-[4px] text-[13px] font-medium transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50 ${scriptCopied 
                                                ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                                                : 'bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary'}`}
                                            title="Copy deployment code"
                                        >
                                            {scriptCopied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                            <span>{scriptCopied ? 'Copied' : 'Copy Script'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#1E1E1E] w-full flex-1 relative min-h-[16rem]">
                                <pre className="text-[13px] leading-relaxed font-mono overflow-auto p-5 text-[#D4D4D4] m-0">
                                    <code>{scriptFormat === 'powershell' ? deploymentScripts.powershell : deploymentScripts.json}</code>
                                </pre>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

PolicyGroupCard.propTypes = {
    requirement: PropTypes.string.isRequired,
    policies: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        categories: PropTypes.arrayOf(PropTypes.string).isRequired,
        link: PropTypes.string,
        settings: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired
        }))
    })).isRequired,
    copiedId: PropTypes.string,
    handleCopy: PropTypes.func.isRequired,
    globalExpandState: PropTypes.bool
};

export default memo(PolicyGroupCard);
