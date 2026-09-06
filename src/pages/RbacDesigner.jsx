import { useState, useCallback, useRef, useEffect } from 'react';
import { Info, Edit3, ChevronDown, ChevronUp, ExternalLink, Sparkles, Settings2 } from 'lucide-react';
import PermissionsSelector from '../components/rbac/PermissionsSelector';
import RbacPromptBar from '../components/ai/RbacPromptBar';
import ResetButton from '../components/shared/ResetButton';
import { RBAC_ROLE_TEMPLATES } from '../data/rbacData';

export default function RbacDesignerPage() {
    const [isConfigMinimized, setIsConfigMinimized] = useState(true);
    const [roleName, setRoleName] = useState('');
    const [description, setDescription] = useState('');
    const [assignableScopes, setAssignableScopes] = useState('');
    const [actions, setActions] = useState([]);
    const [notActions, setNotActions] = useState([]);
    const [isGuidanceExpanded, setIsGuidanceExpanded] = useState(false);
    const [isExamplesOpen, setIsExamplesOpen] = useState(false);
    const examplesRef = useRef(null);
    const aiInputRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (examplesRef.current && !examplesRef.current.contains(event.target)) {
                setIsExamplesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard shortcuts handler:
    // - Escape: Unfocus AI prompt bar or close flyouts
    // - Ctrl+K: Focus AI Prompt Bar
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (document.activeElement === aiInputRef.current) {
                    aiInputRef.current?.blur();
                } else if (isExamplesOpen) {
                    setIsExamplesOpen(false);
                }
            }

            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                aiInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExamplesOpen, aiInputRef]);

    const handleAddAction = useCallback((op) => {
        setActions(prev => prev.includes(op) ? prev : [...prev, op]);
        setNotActions(prev => prev.filter(a => a !== op));
    }, []);

    const handleRemoveAction = useCallback((op) => {
        setActions(prev => prev.filter(a => a !== op));
    }, []);

    const handleAddNotAction = useCallback((op) => {
        setNotActions(prev => prev.includes(op) ? prev : [...prev, op]);
        setActions(prev => prev.filter(a => a !== op));
    }, []);

    const handleRemoveNotAction = useCallback((op) => {
        setNotActions(prev => prev.filter(a => a !== op));
    }, []);

    const handleClearPermissions = useCallback(() => {
        setActions([]);
        setNotActions([]);
    }, []);

    const handleClearActions = useCallback(() => {
        setActions([]);
    }, []);

    const handleClearNotActions = useCallback(() => {
        setNotActions([]);
    }, []);

    // Convert comma separated string to array for export
    const parseScopes = (scopesString) => {
        return scopesString.split(',').map(s => s.trim()).filter(Boolean);
    };

    const applyTemplate = (templateId) => {
        if (templateId === 'clear') {
            setRoleName('');
            setDescription('');
            setAssignableScopes('');
            setActions([]);
            setNotActions([]);
            return;
        }

        const template = RBAC_ROLE_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setRoleName(template.name);
            setDescription(template.description);
            setAssignableScopes(template.assignableScopes);
            setActions(template.actions);
            setNotActions(template.notActions);
        }
    };

    return (
        <div className="flex flex-col min-w-0 w-full">
            <div className="max-w-[1600px] w-full min-w-0 mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex-1 flex flex-col gap-4 sm:gap-5 pb-12">
                
                {/* Header */}
                <div className="flex flex-col gap-3 mb-1">
                    <div>
                        <h1 className="text-[20px] sm:text-[24px] font-semibold text-fluent-fg-primary mb-2">
                            RBAC Custom Role Designer
                        </h1>
                        <p className="text-[14px] text-fluent-fg-secondary max-w-3xl mt-1 block">
                            Design and generate JSON definitions for Azure Custom Roles by selecting specific resource provider operations.
                        </p>
                    </div>
                </div>

                {/* About / Introduction */}
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
                                    This tool generates standardized JSON definitions for <a href="https://learn.microsoft.com/en-us/azure/role-based-access-control/custom-roles" target="_blank" rel="noopener noreferrer" className="text-fluent-brand-fg hover:underline inline-flex items-center gap-0.5 font-medium">Azure Custom Roles <ExternalLink className="w-3 h-3 ml-0.5" /></a> based on your selected actions and data actions.
                                </p>
                                <ul className="list-disc pl-5 ml-2 flex flex-col gap-2">
                                    <li><strong>Describe Intent:</strong> Type what your custom role needs to do in the AI prompt bar to generate permissions automatically.</li>
                                    <li><strong>Define Properties:</strong> Customize role name, description, and assignable scopes under manual configuration.</li>
                                    <li><strong>Select Permissions:</strong> Search and refine specific operations to allow (Actions) or explicitly deny (NotActions).</li>
                                    <li><strong>Export Definition:</strong> Copy or download the generated JSON role definition to deploy directly to Azure.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Smart Role Generator (Primary Interaction Point) */}
                <RbacPromptBar
                    ref={aiInputRef}
                    setRoleName={setRoleName}
                    setDescription={setDescription}
                    setAssignableScopes={setAssignableScopes}
                    setActions={setActions}
                    setNotActions={setNotActions}
                    onResetAll={() => applyTemplate('clear')}
                />

                {/* Manual Configuration Toggle */}
                <div className="flex justify-center -mt-1 mb-1">
                    <button
                        type="button"
                        onClick={() => setIsConfigMinimized(prev => !prev)}
                        className="flex items-center gap-1.5 px-3 h-[32px] rounded-[4px] text-[13px] font-medium text-fluent-fg-secondary hover:text-fluent-brand-fg hover:bg-fluent-brand-bg/10 border border-transparent hover:border-fluent-brand-bg/20 transition-all"
                    >
                        <Settings2 className="w-4 h-4" />
                        {isConfigMinimized ? 'Show manual configuration' : 'Hide manual configuration'}
                        {isConfigMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>

                {/* Collapsible Role Properties & Templates Card */}
                {!isConfigMinimized && (
                    <div className="animate-slide-up bg-fluent-bg-card rounded-lg border border-fluent-stroke-subtle shadow-soft p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-fluent-stroke-subtle pb-2">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-fluent-brand-fg" />
                                <h3 className="text-[14px] font-semibold text-fluent-fg-primary">Role Properties</h3>
                            </div>
                            <ResetButton
                                onClick={() => applyTemplate('clear')}
                                title="Reset all role properties"
                            >
                                Reset Role
                            </ResetButton>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-fluent-fg-primary block">Role Name</label>
                                <input 
                                    type="text"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    placeholder="e.g. Virtual Machine Operator"
                                    className="w-full px-3 h-[32px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-fluent-fg-primary block">Assignable Scopes</label>
                                <div className="relative" ref={examplesRef}>
                                    <div
                                        onClick={() => setIsExamplesOpen(!isExamplesOpen)}
                                        onKeyDown={(e) => {
                                            if (['Enter', ' ', 'ArrowDown'].includes(e.key) && !isExamplesOpen) {
                                                e.preventDefault();
                                                setIsExamplesOpen(true);
                                            } else if (e.key === 'Escape' && isExamplesOpen) {
                                                e.preventDefault();
                                                setIsExamplesOpen(false);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="combobox"
                                        aria-expanded={isExamplesOpen}
                                        aria-haspopup="listbox"
                                        aria-label="Assignable Scopes"
                                        className={`w-full flex items-center justify-between px-3 h-[32px] cursor-pointer transition-all border rounded text-[14px] outline-none bg-fluent-bg-card ${isExamplesOpen ? 'border-b-2 border-b-fluent-brand-bg border-x-transparent border-t-transparent' : 'border-fluent-stroke-strong hover:border-fluent-fg-primary'}`}
                                    >
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className={`text-[13px] font-mono truncate ${assignableScopes ? 'text-fluent-fg-primary' : 'text-fluent-fg-tertiary'}`}>
                                                {assignableScopes || 'Select or type scopes...'}
                                            </span>
                                        </div>
                                        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isExamplesOpen ? 'rotate-180 text-fluent-brand-fg' : 'text-fluent-fg-tertiary'}`} aria-hidden="true" />
                                    </div>
                                    
                                    {isExamplesOpen && (
                                        <div className="absolute top-[100%] left-0 right-0 z-[100] shadow-flyout border rounded overflow-hidden mt-1 bg-fluent-bg-card border-fluent-stroke-subtle animate-fade-in">
                                            <div className="p-2 border-b border-fluent-stroke-subtle">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={assignableScopes}
                                                    onChange={(e) => setAssignableScopes(e.target.value)}
                                                    placeholder="e.g. /subscriptions/00000000-0000-0000-0000-000000000000"
                                                    className="w-full px-2 py-1.5 text-[13px] font-mono border border-fluent-brand-bg outline-none bg-fluent-bg-canvas text-fluent-fg-primary placeholder:text-fluent-fg-tertiary"
                                                />
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto scroll-smooth">
                                                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 bg-fluent-bg-canvas/90 text-fluent-fg-tertiary">
                                                    EXAMPLES
                                                </div>
                                                {[
                                                    { label: 'Root (Tenant)', value: '/' },
                                                    { label: 'Management Group', value: '/providers/Microsoft.Management/managementGroups/my-mg' },
                                                    { label: 'Subscription', value: '/subscriptions/00000000-0000-0000-0000-000000000000' },
                                                    { label: 'Resource Group', value: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/my-rg' }
                                                ].map(ex => (
                                                    <div
                                                        key={ex.label}
                                                        onClick={() => {
                                                            setAssignableScopes(ex.value);
                                                            setIsExamplesOpen(false);
                                                        }}
                                                        className="flex flex-col justify-center px-3 py-2 cursor-pointer transition-colors hover:bg-fluent-bg-hover"
                                                    >
                                                        <span className="text-[13px] font-medium text-fluent-fg-primary">{ex.label}</span>
                                                        <span className="text-[11px] font-mono text-fluent-fg-secondary truncate mt-0.5">{ex.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-[13px] font-semibold text-fluent-fg-primary block">Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what this role allows..."
                                    className="w-full px-3 py-2 min-h-[60px] border rounded outline-none text-[13px] transition-all duration-200 focus:border-fluent-brand-bg focus:ring-2 focus:ring-fluent-brand-bg/20 bg-fluent-bg-canvas text-fluent-fg-primary border-fluent-stroke-strong placeholder:text-fluent-fg-tertiary resize-y"
                                />
                            </div>
                        </div>

                        {/* Pre-configured role templates */}
                        <div className="flex flex-col gap-2 pt-3 border-t border-fluent-stroke-subtle">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-fluent-brand-fg" />
                                <p className="text-[12px] font-semibold text-fluent-fg-secondary">Try a pre-configured role template:</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                                {RBAC_ROLE_TEMPLATES.map((tmpl) => {
                                    const isSelected = roleName === tmpl.name;
                                    return (
                                        <button
                                            key={tmpl.id}
                                            type="button"
                                            onClick={() => applyTemplate(tmpl.id)}
                                            title={`${tmpl.description} (${tmpl.category})`}
                                            className={`whitespace-nowrap flex-shrink-0 text-left text-[12px] px-2.5 py-1 rounded-[4px] shadow-sm transition-all duration-200 ease-in-out active:scale-[0.98] border ${
                                                isSelected 
                                                    ? 'bg-fluent-info-bg text-fluent-brand-fg font-semibold border-fluent-info-border shadow-sm' 
                                                    : 'bg-fluent-bg-subtle border-fluent-stroke-subtle text-fluent-fg-secondary hover:text-fluent-brand-fg hover:border-fluent-brand-bg hover:bg-fluent-bg-card'
                                            }`}
                                        >
                                            {tmpl.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Permissions Selector & Custom Role JSON Preview */}
                <div className="bg-fluent-bg-card rounded-lg border border-fluent-stroke-subtle shadow-soft p-4 flex flex-col">
                    <PermissionsSelector 
                        roleName={roleName}
                        description={description}
                        assignableScopes={parseScopes(assignableScopes)}
                        actions={actions}
                        notActions={notActions}
                        onAddAction={handleAddAction}
                        onRemoveAction={handleRemoveAction}
                        onAddNotAction={handleAddNotAction}
                        onRemoveNotAction={handleRemoveNotAction}
                        onClearPermissions={handleClearPermissions}
                        onClearActions={handleClearActions}
                        onClearNotActions={handleClearNotActions}
                    />
                </div>
            </div>
        </div>
    );
}

