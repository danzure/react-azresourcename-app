import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Shield, Settings2 } from 'lucide-react';
import { PREMADE_POLICIES, CA_CATEGORIES, getReadableTitle } from '../data/conditionalAccessData';
import PatternBuilderCard from '../components/ca/PatternBuilderCard';
import ServiceFilter from '../components/shared/ServiceFilter';
import PolicyGroupCard from '../components/ca/PolicyGroupCard';

// Pre-compute groupings outside the render lifecycle for performance
const INITIAL_GROUPS = {};
PREMADE_POLICIES.forEach(policy => {
    const parts = policy.name.split('-');
    const requirement = parts.length === 5 ? parts[4] : 'Other';
    if (!INITIAL_GROUPS[requirement]) INITIAL_GROUPS[requirement] = [];
    INITIAL_GROUPS[requirement].push(policy);
});

const PRE_GROUPED_POLICIES = Object.entries(INITIAL_GROUPS)
    .map(([requirement, policies]) => ({ requirement, policies }))
    .sort((a, b) => getReadableTitle(a.requirement).localeCompare(getReadableTitle(b.requirement)));


/**
 * The Conditional Access Policy Builder Page component.
 * Provides an interactive UI to generate standardized Microsoft Entra Conditional Access policy names.
 * Allows users to construct names from various parts (Prefix, Persona, Resource, Platform, Requirement)
 * or to view and copy from a curated list of Microsoft-recommended defaults.
 * 
 * @returns {JSX.Element} The rendered Conditional Access page.
 */
export default function ConditionalAccessPage() {
    // UI state for copy feedback
    const [copiedId, setCopiedId] = useState(null);
    const [globalExpandState, setGlobalExpandState] = useState(false);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const searchInputRef = useRef(null);

    const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
    const handleClearSearch = useCallback(() => setSearchTerm(''), []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (searchTerm) {
                    setSearchTerm('');
                    searchInputRef.current?.blur();
                }
            }

            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [searchTerm]);

    /**
     * Asynchronously copies the provided text to the user's clipboard and triggers temporary UI feedback.
     * 
     * @param {string} text - The string value to copy to the clipboard.
     * @param {string} id - A unique identifier to track which element triggered the copy (for setting UI state).
     */
    const handleCopy = useCallback(async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    }, []);

    const groupedPolicies = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();

        return PRE_GROUPED_POLICIES.map(({ requirement, policies }) => {
            const matchingPolicies = policies.filter(policy => {
                const matchesCategory = activeCategory === 'All' || policy.categories.includes(activeCategory);
                if (!matchesCategory) return false;
                if (!lowerSearch) return true;
                return policy.name.toLowerCase().includes(lowerSearch) || policy.desc.toLowerCase().includes(lowerSearch);
            });

            if (matchingPolicies.length === 0) return null;
            return { requirement, policies: matchingPolicies };
        }).filter(Boolean);
    }, [searchTerm, activeCategory]);



    return (
        <div className="flex flex-col min-w-0 w-full animate-fade-in">
            <div className="max-w-[1600px] w-full min-w-0 mx-auto px-3 sm:px-6 pt-4 sm:pt-6 flex-1 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-[20px] sm:text-[24px] font-semibold text-fluent-fg-primary mb-2">
                        Conditional Access Naming Generator
                    </h1>
                    <p className="text-[14px] text-fluent-fg-secondary max-w-3xl mt-1 block">
                        Design and generate standardized Microsoft Entra Conditional Access policy names.
                    </p>
                </div>

                <PatternBuilderCard copiedId={copiedId} handleCopy={handleCopy} />
            </div>

            <div className="max-w-[1600px] w-full min-w-0 mx-auto px-3 sm:px-6 pt-6 pb-12 flex flex-col gap-4">
                {/* Pre-made Policies Section - styled like ResourceCards */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-fluent-brand-fg" />
                        <h2 className="text-[16px] font-semibold text-fluent-fg-primary">Common Microsoft Defaults</h2>
                    </div>
                    <button
                        onClick={() => setGlobalExpandState(!globalExpandState)}
                        className="px-3 h-[32px] rounded-[4px] border border-fluent-stroke-strong bg-fluent-bg-card text-fluent-fg-secondary hover:text-fluent-fg-primary hover:border-fluent-fg-primary hover:bg-fluent-bg-hover transition-all duration-200 ease-in-out inline-flex items-center justify-center gap-1.5 text-[13px] font-medium shadow-sm active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg/50"
                    >
                        <Settings2 className="w-3.5 h-3.5 text-fluent-brand-fg" />
                        {globalExpandState ? 'Collapse All Templates' : 'Expand All Templates'}
                    </button>
                </div>

                <div className="sticky top-0 z-30 py-2.5 bg-fluent-bg-canvas border-b border-fluent-stroke-subtle" style={{ contain: 'layout style', backfaceVisibility: 'hidden' }}>
                    <ServiceFilter
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        categories={CA_CATEGORIES}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        onClearSearch={handleClearSearch}
                        searchInputRef={searchInputRef}
                    />
                </div>

                {groupedPolicies.length === 0 ? (
                    <div className="text-center py-16 text-fluent-fg-tertiary">
                        <p className="text-[14px]">No policies found matching your criteria.</p>
                        <p className="text-[12px] mt-2">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {groupedPolicies.map((group) => (
                            <PolicyGroupCard
                                key={group.requirement}
                                requirement={group.requirement}
                                policies={group.policies}
                                copiedId={copiedId}
                                handleCopy={handleCopy}
                                globalExpandState={globalExpandState}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
