import { useState, useMemo, memo, useCallback } from 'react';
import { Copy, Check, Edit3, Eye, Info, ChevronDown, ChevronUp, ExternalLink, Code2, Terminal, FileText, Users, Lock, Shield, Sliders } from 'lucide-react';
import PropTypes from 'prop-types';
import { generateConditionalAccessTerraform, generateConditionalAccessJSON } from '../../utils/caExportUtils';
import FluentDropdown from '../shared/FluentDropdown';
import ResetButton from '../shared/ResetButton';

const ALPHANUMERIC_REGEX = /[^a-zA-Z0-9-]/g;

const PERSONA_OPTIONS = [
    { value: 'AllUsers', label: 'All Users' },
    { value: 'Admins', label: 'Administrators' },
    { value: 'Guests', label: 'Guests / Externals' },
    { value: 'Internal', label: 'Internal Users' },
    { value: 'ServiceAccts', label: 'Service Accounts' },
    { value: 'AIAgents', label: 'AI Agents' },
    { value: 'VIPs', label: 'VIPs / Executives' },
    { value: 'Vendors', label: 'Vendors' },
    { value: 'BreakGlass', label: 'Break Glass Accounts' }
];

const RESOURCE_OPTIONS = [
    { value: 'AllApps', label: 'All Cloud Apps' },
    { value: 'O365', label: 'Office 365 Suite' },
    { value: 'AzurePortal', label: 'Azure Management' },
    { value: 'MsAdminPortals', label: 'MS Admin Portals' },
    { value: 'Exo', label: 'Exchange Online' },
    { value: 'Spo', label: 'SharePoint Online' },
    { value: 'Teams', label: 'Microsoft Teams' },
    { value: 'Intune', label: 'Microsoft Intune' },
    { value: 'Avd', label: 'Azure Virtual Desktop' },
    { value: 'Defender', label: 'Microsoft Defender' },
    { value: 'HighRiskApps', label: 'High Risk Apps' },
    { value: 'SecurityInfo', label: 'Security Info Registration' },
    { value: 'Custom', label: 'Custom App...' }
];

const PLATFORM_OPTIONS = [
    { value: 'AnyPlatform', label: 'Any Platform' },
    { value: 'UnknownPlatform', label: 'Unknown / Unsupported' },
    { value: 'Windows', label: 'Windows' },
    { value: 'macOS', label: 'macOS' },
    { value: 'iOS', label: 'iOS' },
    { value: 'Android', label: 'Android' },
    { value: 'Linux', label: 'Linux' }
];

const ACTION_OPTIONS = [
    { value: 'RequireMFA', label: 'Require Multi-factor Authentication' },
    { value: 'RequirePhishResist', label: 'Require Phishing-Resistant MFA' },
    { value: 'RequireMfaForRisk', label: 'Require MFA for Sign-in Risk' },
    { value: 'RequirePasswordChange', label: 'Require Password Change' },
    { value: 'RequireCompliant', label: 'Require Compliant Device' },
    { value: 'AppProtection', label: 'Require App Protection Policy' },
    { value: 'AppEnforced', label: 'App Enforced Restrictions' },
    { value: 'Block', label: 'Block Access' },
    { value: 'BlockHighRisk', label: 'Block High Risk Sessions' },
    { value: 'BlockInsiderRisk', label: 'Block Elevated Insider Risk' },
    { value: 'BlockLegacyAuth', label: 'Block Legacy Authentication' },
    { value: 'BlockInteractive', label: 'Block Interactive Sign-in' },
    { value: 'SessionControl', label: 'Use Conditional Access App Control' },
    { value: 'TermsOfUse', label: 'Require Terms of Use Acceptance' },
    { value: 'Custom', label: 'Custom Requirement...' }
];

/**
 * PatternBuilderCard Component
 * 
 * Interactive builder for creating standardized Microsoft Entra Conditional Access policy names.
 * Features an Entra Portal-aligned layout separating parameters into Assignments and Access Controls,
 * with real-time CAF naming preview, custom values support, and tab-based IaC template export.
 */
function PatternBuilderCard({ copiedId, handleCopy }) {
    // Top-level tab: 'builder' | 'iac'
    const [activeTab, setActiveTab] = useState('builder');

    // Policy naming parts
    const [prefix, setPrefix] = useState('CA');
    const [persona, setPersona] = useState('AllUsers');
    const [action, setAction] = useState('RequireMFA');
    const [customAction, setCustomAction] = useState('');
    const [resource, setResource] = useState('AllApps');
    const [customResource, setCustomResource] = useState('');
    const [platform, setPlatform] = useState('AnyPlatform');
    const [isGuidanceExpanded, setIsGuidanceExpanded] = useState(false);

    // IaC Export format: 'terraform' | 'json'
    const [exportFormat, setExportFormat] = useState('terraform');
    const [exportCopied, setExportCopied] = useState(false);

    /**
     * Memoized generation of the final policy name string.
     * Incorporates custom action and resource values if selected.
     */
    const generatedName = useMemo(() => {
        const finalAction = action === 'Custom' ? (customAction || 'Custom') : action;
        const finalResource = resource === 'Custom' ? (customResource || 'Custom') : resource;
        const effectivePrefix = prefix.trim() || 'CA';
        return `${effectivePrefix}-${persona}-${finalResource}-${platform}-${finalAction}`;
    }, [prefix, persona, action, customAction, resource, customResource, platform]);

    const iacCode = useMemo(() => {
        const finalAction = action === 'Custom' ? (customAction || 'Custom') : action;
        const finalResource = resource === 'Custom' ? (customResource || 'Custom') : resource;
        if (exportFormat === 'terraform') {
            return generateConditionalAccessTerraform(generatedName, persona, finalResource, platform, finalAction);
        } else {
            return generateConditionalAccessJSON(generatedName, persona, finalResource, platform, finalAction);
        }
    }, [exportFormat, generatedName, persona, resource, customResource, platform, action, customAction]);

    const handleCopyIaC = useCallback(async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(iacCode);
            setExportCopied(true);
            setTimeout(() => setExportCopied(false), 2000);
        } catch (err) {
            console.error('Copy script failed', err);
        }
    }, [iacCode]);

    const handleResetDefaults = useCallback(() => {
        setPrefix('CA');
        setPersona('AllUsers');
        setResource('AllApps');
        setCustomResource('');
        setPlatform('AnyPlatform');
        setAction('RequireMFA');
    }, []);

    return (
        <div className="flex flex-col gap-3">
            {/* About / Guidance Accordion */}
            <div className="bg-fluent-bg-subtle rounded-lg flex flex-col overflow-hidden mb-1">
                <div
                    className="px-3 py-1.5 flex flex-col text-sm text-fluent-fg-secondary cursor-pointer hover:bg-fluent-bg-hover transition-colors"
                    onClick={() => setIsGuidanceExpanded(!isGuidanceExpanded)}
                    role="button"
                    aria-expanded={isGuidanceExpanded}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsGuidanceExpanded(!isGuidanceExpanded);
                        }
                    }}
                >
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 flex-shrink-0 text-fluent-brand-fg" />
                        <p className="text-fluent-fg-primary text-[13px]">
                            How to use this tool
                        </p>
                        {isGuidanceExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
                    </div>
                    {isGuidanceExpanded && (
                        <div className="mt-3 flex flex-col gap-3 text-[13px] text-fluent-info-text dark:text-fluent-fg-secondary cursor-default" onClick={(e) => e.stopPropagation()}>
                            <p>
                                This tool generates standardized <a href="https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview" target="_blank" rel="noopener noreferrer" className="text-fluent-brand-fg hover:underline inline-flex items-center gap-0.5 font-medium">Microsoft Entra Conditional Access policies <ExternalLink className="w-3 h-3 ml-0.5" /></a> naming conventions aligned with the <a href="https://learn.microsoft.com/azure/cloud-adoption-framework/" target="_blank" rel="noopener noreferrer" className="text-fluent-brand-fg hover:underline inline-flex items-center gap-0.5 font-medium">Cloud Adoption Framework (CAF) <ExternalLink className="w-3 h-3 ml-0.5" /></a>.
                            </p>
                            <ul className="list-disc pl-5 ml-2 flex flex-col gap-2">
                                <li><strong>Configure Assignments:</strong> Select the target persona, cloud application, and client platform conditions.</li>
                                <li><strong>Set Access Controls:</strong> Choose grant controls (such as MFA or Compliant Device) or explicit blocks.</li>
                                <li><strong>Export & Deploy:</strong> Switch to the IaC Template tab to export ready-to-deploy Terraform and JSON payload templates.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Pattern Builder Card */}
            <div className="relative z-40 rounded-lg border shadow-soft bg-fluent-bg-card dark:bg-fluent-bg-subtle border-fluent-stroke-subtle w-full flex flex-col">
                
                {/* Header with Title, Tabs, and Reset Defaults */}
                <div className="p-4 sm:p-5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-fluent-stroke-subtle">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                            <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-[15px] sm:text-[16px] font-semibold text-fluent-fg-primary leading-snug">
                                Policy Pattern Builder
                            </h3>
                            <p className="text-[12px] text-fluent-fg-secondary">
                                Configure Microsoft Entra policy parameters aligned with Cloud Adoption Framework (CAF) standards
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
                        {/* Tab Switcher */}
                        <div className="h-[32px] flex items-center shrink-0 bg-fluent-bg-canvas border border-fluent-stroke-subtle rounded-[4px] p-0.5" role="tablist">
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'builder'}
                                onClick={() => setActiveTab('builder')}
                                className={`h-full px-3 text-[12px] font-medium rounded-[2px] transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${activeTab === 'builder' 
                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm font-semibold' 
                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'}`}
                            >
                                <Sliders className="w-3.5 h-3.5 shrink-0" />
                                <span>Policy Builder</span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'iac'}
                                onClick={() => setActiveTab('iac')}
                                className={`h-full px-3 text-[12px] font-medium rounded-[2px] transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${activeTab === 'iac' 
                                    ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm font-semibold' 
                                    : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'}`}
                            >
                                <Code2 className="w-3.5 h-3.5 shrink-0" />
                                <span>IaC Template</span>
                            </button>
                        </div>

                        {/* Reset Defaults button */}
                        {activeTab === 'builder' && (
                            <ResetButton
                                onClick={handleResetDefaults}
                                title="Reset all builder inputs to defaults"
                            >
                                Reset Defaults
                            </ResetButton>
                        )}
                    </div>
                </div>

                {/* Unified Policy Prefix & Live Preview Strip */}
                <div className="px-4 sm:px-5 py-3 border-b border-fluent-stroke-subtle bg-fluent-bg-canvas/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px]">
                    {/* Policy Prefix configuration */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <label htmlFor="policy-prefix-input" className="text-[12px] font-semibold text-fluent-fg-primary whitespace-nowrap">
                            Policy Prefix:
                        </label>
                        <input
                            id="policy-prefix-input"
                            type="text"
                            value={prefix}
                            onChange={(e) => setPrefix(e.target.value.replace(ALPHANUMERIC_REGEX, ''))}
                            placeholder="CA"
                            maxLength={10}
                            className="px-2.5 h-[32px] border rounded outline-none text-[13px] font-mono font-semibold transition-colors duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-card text-fluent-brand-fg border-fluent-stroke-strong w-[72px] text-center placeholder:text-fluent-fg-tertiary"
                            aria-label="Policy Prefix"
                            title="Policy naming prefix (default: CA)"
                        />
                        <span className="text-[11px] text-fluent-fg-tertiary hidden xl:inline">
                            (Standard CAF identifier)
                        </span>
                    </div>

                    {/* Live Generated Preview Snippet */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 md:justify-end">
                        <div className="flex items-center gap-1.5 shrink-0 text-fluent-fg-tertiary">
                            <Eye className="w-3.5 h-3.5 text-fluent-brand-fg" />
                            <span className="text-[11px] font-semibold uppercase tracking-wider hidden sm:inline">Preview</span>
                        </div>

                        <div className="group/copy relative flex items-center gap-2 px-3 py-1.5 min-h-[32px] w-full md:w-auto md:min-w-[340px] max-w-full rounded-[4px] border bg-fluent-brand-bg/5 hover:bg-fluent-brand-bg/10 border-fluent-brand-bg/20 transition-all">
                            <div className="flex-1 min-w-0 font-mono text-[13px] font-semibold text-fluent-brand-fg truncate select-all" title={generatedName}>
                                {generatedName}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(generatedName, 'live-pill')}
                                aria-label={copiedId === 'live-pill' ? 'Copied' : 'Copy name'}
                                className={`shrink-0 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[11px] font-medium transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg ${copiedId === 'live-pill' 
                                    ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                                    : 'bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-primary hover:bg-fluent-bg-hover hover:border-fluent-stroke-strong'}`}
                            >
                                {copiedId === 'live-pill' ? <><Check className="w-3.5 h-3.5" /> <span>Copied</span></> : <><Copy className="w-3.5 h-3.5" /> <span>Copy Name</span></>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab 1: Policy Builder (Assignments & Access Controls Grid) */}
                {activeTab === 'builder' && (
                    <div className="relative z-20 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 animate-fade-in">
                        
                        {/* Column 1: Assignments */}
                        <div className="flex flex-col bg-fluent-bg-card dark:bg-fluent-bg-subtle border border-fluent-stroke-subtle rounded-lg shadow-soft">
                            <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle rounded-t-lg shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                                        <Users className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="text-[13px] font-semibold text-fluent-fg-primary">
                                        Assignments
                                    </h4>
                                </div>
                                <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-bg-card border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    3 parameters
                                </span>
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-1">
                                {/* Field 1: Users / Identities (Persona) */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-fluent-fg-primary">
                                            Users & Identities (Persona)
                                        </label>
                                        <span className="text-[11px] text-fluent-fg-tertiary">Target Audience</span>
                                    </div>
                                    <FluentDropdown
                                        value={persona}
                                        onChange={setPersona}
                                        options={PERSONA_OPTIONS}
                                        ariaLabel="Target Persona and Users"
                                        className="w-full"
                                    />
                                    <span className="text-[12px] text-fluent-fg-secondary">
                                        Defines the identity scope: all users, administrators, guest users, or workload identities.
                                    </span>
                                </div>

                                {/* Field 2: Target Resources (Cloud Apps) */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-fluent-fg-primary">
                                            Target Resources (Cloud Apps)
                                        </label>
                                        <span className="text-[11px] text-fluent-fg-tertiary">Applications</span>
                                    </div>
                                    {resource === 'Custom' ? (
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="text"
                                                value={customResource}
                                                onChange={(e) => setCustomResource(e.target.value.replace(ALPHANUMERIC_REGEX, ''))}
                                                placeholder="e.g. SalesApp, SAP, Workday"
                                                className="flex-1 min-w-0 w-full px-3 h-[32px] pr-8 border rounded outline-none text-[13px] font-mono transition-colors duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                                                maxLength={30}
                                                autoFocus
                                                aria-label="Custom target resource name"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setResource('AllApps'); setCustomResource(''); }}
                                                className="absolute right-1.5 w-6 h-6 flex items-center justify-center rounded-sm hover:bg-fluent-bg-hover text-fluent-fg-secondary hover:text-fluent-state-danger transition-colors text-[16px] leading-none"
                                                title="Revert to resource dropdown"
                                                aria-label="Revert to resource dropdown"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <FluentDropdown
                                            value={resource}
                                            onChange={setResource}
                                            options={RESOURCE_OPTIONS}
                                            ariaLabel="Target Cloud Applications"
                                            className="w-full"
                                        />
                                    )}
                                    <span className="text-[12px] text-fluent-fg-secondary">
                                        Target cloud applications, Microsoft administration portals, or custom application scopes.
                                    </span>
                                </div>

                                {/* Field 3: Conditions (Device Platforms) */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-fluent-fg-primary">
                                            Conditions (Device Platforms)
                                        </label>
                                        <span className="text-[11px] text-fluent-fg-tertiary">Platform Scope</span>
                                    </div>
                                    <FluentDropdown
                                        value={platform}
                                        onChange={setPlatform}
                                        options={PLATFORM_OPTIONS}
                                        ariaLabel="Device Platforms"
                                        className="w-full"
                                    />
                                    <span className="text-[12px] text-fluent-fg-secondary">
                                        Client operating system platform conditions enforced by this policy.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Access Controls */}
                        <div className="flex flex-col bg-fluent-bg-card dark:bg-fluent-bg-subtle border border-fluent-stroke-subtle rounded-lg shadow-soft">
                            <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle rounded-t-lg shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-md bg-fluent-brand-bg/10 text-fluent-brand-fg shrink-0">
                                        <Lock className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="text-[13px] font-semibold text-fluent-fg-primary">
                                        Access Controls
                                    </h4>
                                </div>
                                <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-bg-card border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    1 parameter
                                </span>
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-1 justify-between">
                                {/* Field 1: Grant Controls */}
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[13px] font-semibold text-fluent-fg-primary">
                                            Grant Controls & Requirements
                                        </label>
                                        <span className="text-[11px] text-fluent-fg-tertiary">Enforcement</span>
                                    </div>
                                    {action === 'Custom' ? (
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="text"
                                                value={customAction}
                                                onChange={(e) => setCustomAction(e.target.value.replace(ALPHANUMERIC_REGEX, ''))}
                                                placeholder="e.g. BlockNonCompliant, RequireFIDO2"
                                                className="flex-1 min-w-0 w-full px-3 h-[32px] pr-8 border rounded outline-none text-[13px] font-mono transition-colors duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                                                maxLength={30}
                                                autoFocus
                                                aria-label="Custom grant requirement"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setAction('RequireMFA'); setCustomAction(''); }}
                                                className="absolute right-1.5 w-6 h-6 flex items-center justify-center rounded-sm hover:bg-fluent-bg-hover text-fluent-fg-secondary hover:text-fluent-state-danger transition-colors text-[16px] leading-none"
                                                title="Revert to action dropdown"
                                                aria-label="Revert to action dropdown"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <FluentDropdown
                                            value={action}
                                            onChange={setAction}
                                            options={ACTION_OPTIONS}
                                            ariaLabel="Grant Controls"
                                            className="w-full"
                                        />
                                    )}
                                    <span className="text-[12px] text-fluent-fg-secondary">
                                        Access controls required to satisfy verification: MFA, compliant device, password change, or explicit block.
                                    </span>
                                </div>

                                {/* Zero Trust Best Practice Callout */}
                                <div className="rounded-lg border border-fluent-stroke-subtle bg-fluent-bg-canvas p-4 flex flex-col gap-3 flex-1 justify-between">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-fluent-brand-fg shrink-0" />
                                            <span className="text-[13px] font-semibold text-fluent-fg-primary">
                                                Zero Trust Deployment Baseline
                                            </span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-fluent-info-bg text-fluent-info-text border border-fluent-info-border">
                                            Recommended
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-2.5 text-[12px] text-fluent-fg-secondary">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-fluent-brand-fg mt-1.5 shrink-0" />
                                            <p className="leading-relaxed">
                                                <strong className="text-fluent-fg-primary font-semibold">Staged Rollout:</strong> Deploy in <strong className="text-fluent-brand-fg font-semibold">Report-only</strong> mode first. Inspect sign-in logs and use the Entra <em>What If</em> tool to measure impact before enforcing.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-fluent-brand-fg mt-1.5 shrink-0" />
                                            <p className="leading-relaxed">
                                                <strong className="text-fluent-fg-primary font-semibold">Break-Glass Accounts:</strong> Always exclude dedicated cloud-only emergency accounts (<span className="font-mono text-fluent-fg-primary font-medium">CA-BreakGlass</span>) to prevent tenant lockout.
                                            </p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-fluent-brand-fg mt-1.5 shrink-0" />
                                            <p className="leading-relaxed">
                                                <strong className="text-fluent-fg-primary font-semibold">Continuous Evaluation:</strong> Pair session controls with Continuous Access Evaluation (CAE) for real-time revocation on critical risk events.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-2.5 border-t border-fluent-stroke-subtle flex items-center justify-between text-[11px] text-fluent-fg-tertiary">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-fluent-cat-green-fg" />
                                            <span>Lifecycle: <strong className="text-fluent-fg-secondary font-medium">Report-only → Enforced</strong></span>
                                        </span>
                                        <span className="font-mono text-fluent-brand-fg font-medium">CAF Zero Trust v2</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: IaC Template View */}
                {activeTab === 'iac' && (
                    <div className="relative z-20 p-4 sm:p-5 flex flex-col gap-4 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-fluent-stroke-subtle">
                            <div className="flex items-center gap-2 text-[12px] text-fluent-fg-secondary">
                                <Code2 className="w-4 h-4 text-fluent-brand-fg shrink-0" />
                                <span>Infrastructure as Code definition for <strong className="text-fluent-fg-primary font-mono">{generatedName}</strong></span>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap">
                                {/* Format Selector */}
                                <div className="h-[32px] flex items-center shrink-0 bg-fluent-bg-canvas border border-fluent-stroke-subtle rounded-[4px] p-0.5" role="tablist">
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={exportFormat === 'terraform'}
                                        onClick={() => setExportFormat('terraform')}
                                        className={`h-full px-3 text-[12px] font-medium rounded-[2px] transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${exportFormat === 'terraform' 
                                            ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm font-semibold' 
                                            : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'}`}
                                    >
                                        <Terminal className="w-3.5 h-3.5 shrink-0" />
                                        <span>Terraform</span>
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={exportFormat === 'json'}
                                        onClick={() => setExportFormat('json')}
                                        className={`h-full px-3 text-[12px] font-medium rounded-[2px] transition-all duration-200 ease-in-out active:scale-95 inline-flex items-center justify-center gap-1.5 ${exportFormat === 'json' 
                                            ? 'bg-fluent-bg-card text-fluent-brand-fg shadow-sm font-semibold' 
                                            : 'text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'}`}
                                    >
                                        <FileText className="w-3.5 h-3.5 shrink-0" />
                                        <span>JSON Payload</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyIaC}
                                    className={`px-3 h-[32px] rounded-[4px] text-[12px] font-medium transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 border active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50 ${exportCopied 
                                        ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                                        : 'bg-fluent-bg-card border-fluent-stroke-subtle hover:border-fluent-stroke-strong text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'}`}
                                    title="Copy deployment code"
                                >
                                    {exportCopied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                    <span>{exportCopied ? 'Copied' : 'Copy Code'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Terminal Window */}
                        <div className="bg-[#1E1E1E] w-full relative rounded-lg border border-fluent-stroke-subtle overflow-hidden shadow-soft">
                            <pre className="text-[13px] leading-relaxed font-mono overflow-auto p-5 text-[#D4D4D4] m-0 max-h-[380px]">
                                <code>{iacCode}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

PatternBuilderCard.propTypes = {
    copiedId: PropTypes.string,
    handleCopy: PropTypes.func.isRequired
};

export default memo(PatternBuilderCard);
