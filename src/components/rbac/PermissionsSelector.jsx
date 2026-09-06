import { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, Plus, Minus, ShieldCheck, X, Code2, Copy, Check, ListFilter, RotateCcw } from 'lucide-react';
import { COMMON_RBAC_PROVIDERS } from '../../data/rbacData';
import SearchableSelect from '../shared/SearchableSelect';
import useDebounce from '../../hooks/useDebounce';

/**
 * PermissionsSelector Component
 * 
 * Interactive Azure Resource Provider operations picker and Custom Role definition viewer.
 * Provides granular operation search, provider filtering, Actions vs NotActions assignments,
 * and live Azure Role JSON generation with clipboard copy functionality.
 * 
 * @param {Object} props
 * @param {string} [props.roleName] - Name of the custom role
 * @param {string} [props.description] - Description of the custom role
 * @param {string[]} [props.assignableScopes] - List of target assignable scopes
 * @param {string[]} [props.actions] - Array of permitted Azure control plane operations
 * @param {string[]} [props.notActions] - Array of explicitly restricted operations
 * @param {Function} props.onAddAction - Callback to add an operation to Actions
 * @param {Function} props.onRemoveAction - Callback to remove an operation from Actions
 * @param {Function} props.onAddNotAction - Callback to add an operation to NotActions
 * @param {Function} props.onRemoveNotAction - Callback to remove an operation from NotActions
 * @param {Function} [props.onClearPermissions] - Callback to clear both Actions and NotActions
 * @param {Function} [props.onClearActions] - Callback to clear all Actions
 * @param {Function} [props.onClearNotActions] - Callback to clear all NotActions
 * @returns {JSX.Element}
 */
export default function PermissionsSelector({ 
    roleName = '', 
    description = '', 
    assignableScopes = [], 
    actions = [], 
    notActions = [], 
    onAddAction, 
    onRemoveAction, 
    onAddNotAction, 
    onRemoveNotAction,
    onClearPermissions,
    onClearActions,
    onClearNotActions
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 250);
    const [activeProvider, setActiveProvider] = useState('All');
    const [activeTab, setActiveTab] = useState('permissions'); // 'permissions' | 'json'
    const [copied, setCopied] = useState(false);
    const [visibleProviderLimit, setVisibleProviderLimit] = useState(15);

    // Reset pagination when filter criteria change
    useEffect(() => {
        setVisibleProviderLimit(15);
    }, [debouncedSearchTerm, activeProvider]);

    const filteredProviders = useMemo(() => {
        let providers = COMMON_RBAC_PROVIDERS;
        if (activeProvider !== 'All') {
            providers = providers.filter(p => p.provider === activeProvider);
        }
        
        if (!debouncedSearchTerm) return providers;
        
        const lowerSearch = debouncedSearchTerm.toLowerCase();
        return providers.map(p => ({
            provider: p.provider,
            operations: p.operations.filter(op => op.toLowerCase().includes(lowerSearch))
        })).filter(p => p.operations.length > 0);
    }, [debouncedSearchTerm, activeProvider]);

    // Progressive rendering: when browsing 'All' without search, limit initial providers rendered to keep DOM lightweight
    const displayedProviders = useMemo(() => {
        if (activeProvider !== 'All' || debouncedSearchTerm) {
            return filteredProviders;
        }
        return filteredProviders.slice(0, visibleProviderLimit);
    }, [filteredProviders, activeProvider, debouncedSearchTerm, visibleProviderLimit]);

    // O(1) Set lookups instead of O(N) linear array scanning
    const actionsSet = useMemo(() => new Set(actions), [actions]);
    const notActionsSet = useMemo(() => new Set(notActions), [notActions]);

    const totalAvailableCount = useMemo(() => {
        return filteredProviders.reduce((acc, p) => acc + p.operations.length, 0);
    }, [filteredProviders]);

    const providerOptions = useMemo(() => {
        return [
            { label: 'All Providers', value: 'All' },
            ...COMMON_RBAC_PROVIDERS.map(p => ({ label: p.provider, value: p.provider }))
        ];
    }, []);

    const generatedJson = useMemo(() => {
        const scopes = Array.isArray(assignableScopes) && assignableScopes.length > 0 
            ? assignableScopes 
            : ["/"];
            
        const payload = {
            Name: roleName || "Custom Role Name",
            IsCustom: true,
            Description: description || "Custom role description",
            Actions: actions.length > 0 ? actions : [],
            NotActions: notActions.length > 0 ? notActions : [],
            DataActions: [],
            NotDataActions: [],
            AssignableScopes: scopes
        };
        return JSON.stringify(payload, null, 2);
    }, [roleName, description, assignableScopes, actions, notActions]);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(generatedJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }, [generatedJson]);

    const handleClearAll = useCallback(() => {
        if (onClearPermissions) {
            onClearPermissions();
        }
    }, [onClearPermissions]);

    const handleToggleAction = useCallback((op) => {
        if (actions.includes(op)) {
            onRemoveAction(op);
        } else {
            onAddAction(op);
        }
    }, [actions, onRemoveAction, onAddAction]);

    const handleToggleNotAction = useCallback((op) => {
        if (notActions.includes(op)) {
            onRemoveNotAction(op);
        } else {
            onAddNotAction(op);
        }
    }, [notActions, onRemoveNotAction, onAddNotAction]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1 border-b border-fluent-stroke-subtle pb-2">
                <ShieldCheck className="w-5 h-5 text-fluent-brand-fg" />
                <h3 className="text-[16px] font-semibold text-fluent-fg-primary">Permissions & Role Definition</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Operations with integrated Search and Provider Filter */}
                <div className="flex flex-col border border-fluent-stroke-subtle rounded-lg bg-fluent-bg-canvas h-[500px]">
                    {/* Integrated Header Toolbar */}
                    <div className="p-3 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle/50 flex flex-col gap-2.5 rounded-t-lg relative z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-fluent-fg-primary">Available Operations</span>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-fluent-bg-card border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    {totalAvailableCount}
                                </span>
                            </div>
                            {(searchTerm || activeProvider !== 'All') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setActiveProvider('All');
                                    }}
                                    className="text-[11px] text-fluent-brand-fg hover:underline font-medium"
                                >
                                    Reset filters
                                </button>
                            )}
                        </div>

                        {/* Combined Search + Provider Select */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fluent-fg-tertiary" />
                                <input 
                                    type="text" 
                                    placeholder="Search operations (e.g. read, virtualMachines)..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-8 h-[32px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-card text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                                />
                                {searchTerm && (
                                    <button 
                                        type="button"
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fluent-fg-tertiary hover:text-fluent-fg-primary p-0.5 rounded transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <div className="w-full sm:w-[260px] shrink-0">
                                <SearchableSelect 
                                    items={providerOptions}
                                    value={activeProvider}
                                    onChange={setActiveProvider}
                                    compact={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Operations List */}
                    <div className="flex-1 overflow-y-auto p-2.5 rounded-b-lg">
                        {filteredProviders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-[13px] text-fluent-fg-tertiary py-12 gap-2">
                                <ShieldCheck className="w-8 h-8 opacity-30 text-fluent-fg-tertiary" />
                                <span>No matching operations found</span>
                                {(searchTerm || activeProvider !== 'All') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setActiveProvider('All');
                                        }}
                                        className="text-[12px] text-fluent-brand-fg hover:underline font-medium mt-1"
                                    >
                                        Reset filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {displayedProviders.map(p => (
                                    <div key={p.provider} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-fluent-fg-secondary uppercase tracking-wider bg-fluent-bg-subtle/60 rounded">
                                            <span>{p.provider}</span>
                                            <span className="font-medium text-fluent-fg-tertiary">{p.operations.length}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            {p.operations.map(op => {
                                                const isAction = actionsSet.has(op);
                                                const isNotAction = notActionsSet.has(op);
                                                return (
                                                    <div 
                                                        key={op} 
                                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded text-[12px] font-mono group transition-colors ${
                                                            isAction 
                                                                ? 'bg-fluent-cat-green-bg text-fluent-fg-primary' 
                                                                : isNotAction 
                                                                    ? 'bg-fluent-cat-red-bg text-fluent-fg-primary' 
                                                                    : 'hover:bg-fluent-bg-hover text-fluent-fg-primary'
                                                        }`}
                                                    >
                                                        <span className="break-all select-all">{op}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                type="button"
                                                                disabled={isNotAction}
                                                                onClick={() => handleToggleAction(op)}
                                                                title={
                                                                    isAction 
                                                                        ? 'Click to remove from Actions' 
                                                                        : isNotAction 
                                                                            ? 'Cannot add as Action when already in NotActions' 
                                                                            : 'Click to add to Actions'
                                                                }
                                                                className={`px-2 h-[24px] rounded-[4px] border text-[11px] font-semibold transition-all inline-flex items-center gap-1 active:scale-95 ${
                                                                    isAction 
                                                                        ? 'bg-fluent-cat-green-fg text-white border-fluent-cat-green-fg shadow-sm hover:opacity-90' 
                                                                        : 'bg-fluent-cat-green-bg text-fluent-cat-green-fg border-fluent-cat-green-bg hover:border-fluent-fg-primary'
                                                                } ${isNotAction ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            >
                                                                {isAction ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                <span>Action</span>
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                disabled={isAction}
                                                                onClick={() => handleToggleNotAction(op)}
                                                                title={
                                                                    isNotAction 
                                                                        ? 'Click to remove from NotActions' 
                                                                        : isAction 
                                                                            ? 'Cannot add as NotAction when already in Actions' 
                                                                            : 'Click to add to NotActions'
                                                                }
                                                                className={`px-2 h-[24px] rounded-[4px] border text-[11px] font-semibold transition-all inline-flex items-center gap-1 active:scale-95 ${
                                                                    isNotAction 
                                                                        ? 'bg-fluent-cat-red-fg text-white border-fluent-cat-red-fg shadow-sm hover:opacity-90' 
                                                                        : 'bg-fluent-cat-red-bg text-fluent-cat-red-fg border-fluent-cat-red-bg hover:border-fluent-fg-primary'
                                                                } ${isAction ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                            >
                                                                {isNotAction ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                <span>NotAction</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {displayedProviders.length < filteredProviders.length && (
                                    <div className="pt-2 pb-1 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setVisibleProviderLimit(prev => prev + 15)}
                                            className="px-3 h-[28px] rounded-[4px] border transition-colors inline-flex items-center justify-center gap-1.5 bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary hover:text-fluent-fg-primary text-[12px] font-medium shadow-sm active:scale-95"
                                        >
                                            Show more providers ({filteredProviders.length - displayedProviders.length} remaining)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Operations & JSON Definition with Tab Switcher */}
                <div className="flex flex-col border border-fluent-stroke-subtle rounded-lg bg-fluent-bg-canvas h-[500px] overflow-hidden shadow-soft">
                    {/* Header with Segmented Tabs */}
                    <div className="p-2.5 border-b border-fluent-stroke-subtle bg-fluent-bg-subtle/50 flex flex-wrap items-center justify-between gap-2 min-h-[57px] rounded-t-lg">
                        {/* Tab Segmented Control */}
                        <div 
                            className="flex items-center p-0.5 rounded-md bg-fluent-bg-card border border-fluent-stroke-subtle"
                            role="tablist"
                            aria-label="Permissions view mode"
                        >
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'permissions'}
                                onClick={() => setActiveTab('permissions')}
                                className={`flex items-center gap-1.5 px-3 h-[28px] rounded-[4px] text-[12px] font-medium transition-all duration-200 ease-in-out active:scale-95 ${
                                    activeTab === 'permissions'
                                        ? 'bg-fluent-info-bg text-fluent-brand-fg font-semibold shadow-sm'
                                        : 'bg-transparent text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'
                                }`}
                            >
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>Selected Permissions</span>
                                <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded-[4px] bg-fluent-bg-canvas border border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    {actions.length + notActions.length}
                                </span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                aria-selected={activeTab === 'json'}
                                onClick={() => setActiveTab('json')}
                                className={`flex items-center gap-1.5 px-3 h-[28px] rounded-[4px] text-[12px] font-medium transition-all duration-200 ease-in-out active:scale-95 ${
                                    activeTab === 'json'
                                        ? 'bg-fluent-info-bg text-fluent-brand-fg font-semibold shadow-sm'
                                        : 'bg-transparent text-fluent-fg-secondary hover:text-fluent-fg-primary hover:bg-fluent-bg-hover'
                                }`}
                            >
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Role JSON</span>
                            </button>
                        </div>

                        {/* Right Header Action / Info */}
                        {activeTab === 'json' ? (
                            <button
                                type="button"
                                onClick={handleCopy}
                                className={`h-[28px] px-2.5 rounded-[4px] text-[12px] font-medium transition-all duration-200 inline-flex items-center justify-center gap-1.5 border active:scale-95 ${
                                    copied
                                        ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]'
                                        : 'bg-fluent-bg-card border-fluent-stroke-strong text-fluent-fg-secondary hover:border-fluent-fg-primary hover:text-fluent-fg-primary'
                                }`}
                                title="Copy JSON"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                            </button>
                        ) : (
                            (actions.length > 0 || notActions.length > 0) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-fluent-fg-secondary hidden sm:inline">
                                        {actions.length} allowed · {notActions.length} denied
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleClearAll}
                                        className="h-[26px] px-2 rounded-[4px] text-[11px] font-medium transition-all inline-flex items-center justify-center gap-1 border bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-secondary hover:border-fluent-stroke-strong hover:text-fluent-state-danger active:scale-95"
                                        title="Clear all selected permissions"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        <span>Clear All</span>
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    {/* Tab 1: Selected Permissions Content */}
                    {activeTab === 'permissions' && (
                        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 rounded-b-lg animate-fade-in">
                            {/* Actions section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border-b border-fluent-stroke-subtle pb-1">
                                    <h4 className="text-[12px] font-bold text-fluent-cat-green-fg flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> Actions ({actions.length})
                                    </h4>
                                    {actions.length > 0 && onClearActions && (
                                        <button
                                            type="button"
                                            onClick={onClearActions}
                                            className="text-[11px] text-fluent-fg-tertiary hover:text-fluent-state-danger transition-colors"
                                        >
                                            Clear actions
                                        </button>
                                    )}
                                </div>
                                {actions.length === 0 ? (
                                    <div className="text-[12px] text-fluent-fg-tertiary italic py-1">No actions selected</div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {actions.map(op => (
                                            <div key={op} className="flex items-center justify-between gap-2 p-1.5 hover:bg-fluent-bg-hover rounded text-[12px] font-mono group border border-transparent hover:border-fluent-stroke-subtle">
                                                <span className="text-fluent-fg-primary truncate" title={op}>{op}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => onRemoveAction(op)} 
                                                    title="Remove Action"
                                                    className="text-fluent-fg-tertiary hover:text-fluent-state-danger p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* NotActions section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border-b border-fluent-stroke-subtle pb-1">
                                    <h4 className="text-[12px] font-bold text-fluent-cat-red-fg flex items-center gap-1.5">
                                        <Minus className="w-3.5 h-3.5" /> NotActions ({notActions.length})
                                    </h4>
                                    {notActions.length > 0 && onClearNotActions && (
                                        <button
                                            type="button"
                                            onClick={onClearNotActions}
                                            className="text-[11px] text-fluent-fg-tertiary hover:text-fluent-state-danger transition-colors"
                                        >
                                            Clear NotActions
                                        </button>
                                    )}
                                </div>
                                {notActions.length === 0 ? (
                                    <div className="text-[12px] text-fluent-fg-tertiary italic py-1">No NotActions selected</div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {notActions.map(op => (
                                            <div key={op} className="flex items-center justify-between gap-2 p-1.5 hover:bg-fluent-bg-hover rounded text-[12px] font-mono group border border-transparent hover:border-fluent-stroke-subtle">
                                                <span className="text-fluent-fg-primary truncate" title={op}>{op}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => onRemoveNotAction(op)} 
                                                    title="Remove NotAction"
                                                    className="text-fluent-fg-tertiary hover:text-fluent-state-danger p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Role JSON Output Content */}
                    {activeTab === 'json' && (
                        <div className="flex-1 bg-[#1E1E1E] w-full relative flex flex-col min-h-0 animate-fade-in">
                            <pre className="flex-1 text-[13px] leading-relaxed font-mono overflow-auto p-4 text-[#D4D4D4] m-0 select-all">
                                <code>{generatedJson}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

PermissionsSelector.propTypes = {
    roleName: PropTypes.string,
    description: PropTypes.string,
    assignableScopes: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.arrayOf(PropTypes.string).isRequired,
    notActions: PropTypes.arrayOf(PropTypes.string).isRequired,
    onAddAction: PropTypes.func.isRequired,
    onRemoveAction: PropTypes.func.isRequired,
    onAddNotAction: PropTypes.func.isRequired,
    onRemoveNotAction: PropTypes.func.isRequired,
    onClearPermissions: PropTypes.func,
    onClearActions: PropTypes.func,
    onClearNotActions: PropTypes.func
};



