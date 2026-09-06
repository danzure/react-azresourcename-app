import { memo, useState, useMemo, lazy, Suspense } from 'react';
import { Copy, Check, ShieldAlert, AlertTriangle, X } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';
import AzureServiceIcon from './AzureServiceIcon';

const ExpandedPanel = lazy(() => import('./ExpandedPanel'));
import { getCategoryColors } from '../../data/categoryColors';
import { getBundleResources } from '../../utils/bundleGenerator';
import { validateName } from '../../utils/nameValidator';
import PropTypes from 'prop-types';



/**
 * ResourceCard Component
 * 
 * Highly interactive card component representing a single Azure resource type.
 * Displays resource metadata (name, abbreviation, category icon).
 * Handles the generation of the compliant name based on the current global configuration.
 * Includes inline validation status warnings/errors, a quick copy button, and manages
 * local state for sub-resource selection and topology expansion.
 * Renders the ExpandedPanel conditionally when the card is toggled open.
 * 
 * @param {Object} props
 * @param {string} props.id - HTML ID attribute for the card container.
 * @param {Object} props.resource - The dictionary definition of the target Azure resource.
 * @param {string} props.genName - The primary generated name for this resource.
 * @param {boolean} props.isCopied - Global flag tracking whether a copy interaction recently occurred.
 * @param {boolean} props.isExpanded - Whether this specific card is currently expanded into detailed view.
 * @param {Function} props.onCopy - Click handler to manually execute a copy action.
 * @param {Function} props.onToggle - Click handler specifically for expanding/collapsing this card.
 * @param {string} [props.selectedSubResource] - The currently selected target subresource suffix (if applicable).
 * @param {Function} [props.onSubResourceChange] - State setter for the active subresource selection.
 * @param {Function} props.generateName - Parent context utility to regenerate names dynamically for bundled assets.
 * @returns {JSX.Element}
 */
function ResourceCard({ id, resource, genName, isCopied, isExpanded, onCopy, onToggle, selectedSubResource, onSubResourceChange, generateName }) {
    const categoryColors = getCategoryColors(resource.category);


    const [topology, setTopology] = useState('single');
    const [spokeCount, setSpokeCount] = useState(1);
    const [spokeStartValue, setSpokeStartValue] = useState(1);

    const bundle = useMemo(() => {
        if (!isExpanded && topology === 'single') return null;
        return getBundleResources(resource, topology, { spokeCount, spokeStartValue });
    }, [resource, topology, spokeCount, spokeStartValue, isExpanded]);
    const hasBundle = bundle && bundle.length > 0;

    // Helper to generate name - utilizing the passed generateName function with modified resource context
    const getGeneratedName = (resItem, patternOverride = null) => generateName(resItem, null, resItem.instanceOverride, patternOverride);

    // Validation
    const validationIssues = useMemo(() => validateName(genName, resource), [genName, resource]);
    const hasErrors = validationIssues.some(i => i.type === 'error');
    const hasWarnings = validationIssues.some(i => i.type === 'warning');
    const isTooLong = validationIssues.some(i => i.code === 'TOO_LONG');


    return (
        <div
            id={id}
            onClick={() => onToggle(resource.name, isExpanded)}
            className={`group relative flex flex-col min-w-0 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out h-full ${isExpanded ? 'ring-2 ring-fluent-brand-bg shadow-depth border-transparent dark:border-transparent' : `hover:shadow-depth shadow-soft ${hasErrors ? 'hover:border-fluent-state-danger' : hasWarnings ? 'hover:border-fluent-cat-orange-fg' : 'hover:border-fluent-stroke-strong'}`} bg-fluent-bg-card ${hasErrors ? 'border-fluent-state-danger' : hasWarnings ? 'border-fluent-cat-orange-fg' : 'border-fluent-stroke-subtle'}`}
        >
            <div className="p-3 sm:p-4 flex flex-col h-full gap-3 min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <AzureServiceIcon resourceName={resource.name} category={resource.category} className="w-8 h-8 shrink-0" />
                        <div className="flex flex-col min-w-0">
                            <h3 className="text-[14px] font-semibold truncate text-fluent-fg-primary">{resource.name} <span className="font-normal text-fluent-fg-tertiary">({resource.abbrev})</span></h3>
                            <div className="flex items-center mt-1 gap-1.5 flex-wrap">
                                <span
                                    className={`text-[11px] px-2 py-0.5 rounded-[4px] font-medium ${categoryColors.bgClass} ${categoryColors.textClass}`}
                                >{resource.category}</span>
                                {resource.isNew && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-[4px] font-medium bg-fluent-info-bg text-fluent-info-text border border-fluent-info-border">
                                        New
                                    </span>
                                )}
                                {resource.legacy && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-[4px] font-medium bg-fluent-bg-subtle text-fluent-fg-secondary border border-fluent-stroke-subtle">
                                        Legacy
                                    </span>
                                )}
                                {resource.retired && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-[4px] font-medium bg-fluent-bg-subtle text-fluent-fg-secondary border border-fluent-stroke-subtle">
                                        Retired
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {validationIssues.length > 0 && !isExpanded && (
                            <div className="relative group/validation animate-scale-in">
                                <div className={`flex items-center justify-center w-6 h-6 rounded-[4px] cursor-help shadow-sm transition-all duration-200 hover:brightness-95 dark:hover:brightness-110 active:scale-95 ${hasErrors ? 'bg-fluent-cat-red-bg text-fluent-state-danger' : 'bg-fluent-cat-orange-bg text-fluent-cat-orange-fg'}`}>
                                    {hasErrors
                                        ? <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.5} aria-label={`${validationIssues.length} validation issue(s)`} />
                                        : <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} aria-label={`${validationIssues.length} validation warning(s)`} />
                                    }
                                </div>
                                <div className="absolute right-0 top-7 z-50 w-56 max-w-[calc(100vw-32px)] p-2.5 rounded shadow-lg border text-[11px] leading-relaxed hidden group-hover/validation:block bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-secondary">
                                    {validationIssues.map((issue, i) => (
                                        <div key={i} className={`flex items-start gap-1.5 ${i > 0 ? 'mt-1.5 pt-1.5 border-t' : ''} border-fluent-stroke-subtle`}>
                                            <span className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${issue.type === 'error' ? 'bg-fluent-state-danger' : 'bg-fluent-cat-orange-fg'}`} />
                                            <span>{issue.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {isExpanded && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggle(resource.name, isExpanded); }}
                                className="p-1 -mr-1 rounded-sm text-fluent-fg-tertiary hover:bg-fluent-bg-hover transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {!isExpanded && (
                    <p className="text-[13px] leading-relaxed line-clamp-2 text-fluent-fg-secondary">
                        {resource.desc}
                    </p>
                )}


                {/* Generated Name Section - Collapsed only (Expanded moved to ExpandedPanel) */}
                {!isExpanded && (
                    <div className="mt-auto pt-2 min-w-0 w-full">
                        <div className="group/copy relative flex items-center gap-2 px-3 py-1.5 min-h-[32px] w-full min-w-0 rounded-[4px] border bg-fluent-bg-canvas hover:bg-fluent-bg-hover border-transparent transition-all">
                            <div className={`flex-1 min-w-0 font-mono text-[13px] font-medium pr-16 ${isTooLong ? 'text-fluent-state-danger' : 'text-fluent-fg-primary'} truncate flex items-center gap-2`}>
                                <span className="truncate min-w-0 block">
                                    <ValidationHighlight name={hasBundle ? getGeneratedName(bundle[0]) : genName} allowedCharsPattern={hasBundle ? bundle[0].chars : resource.chars} />
                                </span>
                                {hasBundle && (
                                    <span className="text-[11px] px-1.5 py-0.5 rounded font-bold bg-fluent-bg-card text-fluent-brand-fg shadow-sm border border-fluent-stroke-subtle">
                                        +{bundle.length - 1}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (hasBundle) {
                                        const allNames = bundle.map(item => `${item.name}: ${getGeneratedName(item)}`).join('\n');
                                        onCopy(allNames, resource.name, e);
                                    } else {
                                        onCopy(genName, resource.name, e);
                                    }
                                }}
                                aria-label={isCopied ? 'Copied' : 'Copy name'}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 shrink-0 flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-[4px] border text-[11px] font-medium transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg z-10 ${isCopied 
                                    ? 'bg-[#f1faf1] dark:bg-[#1b2b1b] border-[#c6ebc9] dark:border-[#1e4620] text-[#107c10] dark:text-[#a3d4a3]' 
                                    : 'bg-fluent-bg-card border-fluent-stroke-subtle text-fluent-fg-primary hover:bg-fluent-bg-hover hover:border-fluent-stroke-strong'}`}
                            >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center text-[11px] mt-2 px-0.5 opacity-70 shrink-0">
                            <span className="text-fluent-fg-tertiary">Max: {resource.maxLength || 64}</span>
                            <span className={`font-bold ${isTooLong ? 'text-fluent-state-danger' : 'text-fluent-fg-primary'}`}>{genName.length} chars</span>
                        </div>
                    </div>
                )}
            </div>




            {isExpanded && (
                <div className="animate-fade-in">
                    <Suspense fallback={
                        <div className="p-8 flex items-center justify-center text-[13px] text-fluent-fg-tertiary">
                            <div className="w-5 h-5 rounded-full border-2 border-fluent-brand-bg/20 border-t-fluent-brand-bg animate-spin mr-2" />
                            Loading details...
                        </div>
                    }>
                        <ExpandedPanel
                            resource={resource}
                            genName={genName}
                            isCopied={isCopied}
                            onCopy={onCopy}
                            selectedSubResource={selectedSubResource}
                            onSubResourceChange={(suffix) => onSubResourceChange(resource.name, suffix)}
                            topology={topology}
                            setTopology={setTopology}
                            spokeCount={spokeCount}
                            setSpokeCount={setSpokeCount}
                            spokeStartValue={spokeStartValue}
                            setSpokeStartValue={setSpokeStartValue}
                            bundle={bundle}
                            getBundleName={getGeneratedName}
                            onClose={() => onToggle(resource.name, isExpanded)}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
}

ResourceCard.propTypes = {
    id: PropTypes.string.isRequired,
    resource: PropTypes.shape({
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        abbrev: PropTypes.string.isRequired,
        maxLength: PropTypes.number,
        chars: PropTypes.string,
        subResources: PropTypes.array,
    }).isRequired,
    genName: PropTypes.string.isRequired,
    isCopied: PropTypes.bool.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    onCopy: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    selectedSubResource: PropTypes.string,
    onSubResourceChange: PropTypes.func,
    generateName: PropTypes.func,
};

export default memo(ResourceCard);
