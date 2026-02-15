import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, X, Filter, ArrowUp } from 'lucide-react';

import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ResourceCard from './components/ResourceCard';
import useDebounce from './hooks/useDebounce';
import useLocalStorage from './hooks/useLocalStorage';

import { AZURE_REGIONS, RESOURCE_DATA_SORTED, CATEGORIES } from './data/constants';

/**
 * Main Application Component
 * 
 * Manages global state for the Azure Resource Naming Tool, including:
 * - Theme preferences (Light/Dark mode)
 * - Naming configuration (Workload, Environment, Region, Instance)
 * - Search filtering and active category selection
 * - Resource data and generation logic
 */
export default function App() {
    // Persistent state using local storage for user preferences
    const [isDarkMode, setIsDarkMode] = useLocalStorage('azres_darkMode', false);
    const [isConfigMinimized, setIsConfigMinimized] = useState(false);

    const [workload, setWorkload] = useLocalStorage('azres_workload', '');
    const [envValue, setEnvValue] = useLocalStorage('azres_env', 'prod');
    const [regionValue, setRegionValue] = useLocalStorage('azres_region', 'uksouth');
    const [instance, setInstance] = useLocalStorage('azres_instance', '001');
    const [orgPrefix, setOrgPrefix] = useLocalStorage('azres_orgPrefix', '');
    const [namingOrder, setNamingOrder] = useLocalStorage('azres_namingOrder', ['Org', 'Resource', 'Workload', 'Environment', 'Region', 'Instance']);
    const [showOrg, setShowOrg] = useLocalStorage('azres_showOrg', false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useLocalStorage('azres_category', 'All');
    const [copiedId, setCopiedId] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const [subResourceSelections, setSubResourceSelections] = useLocalStorage('azres_subResources', {}); // Track selected sub-resource per resource
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [visibleCount, setVisibleCount] = useState(24); // Initial visible count for infinite scroll

    const searchInputRef = useRef(null);

    // Debounce search term to prevent expensive filtering on every keystroke
    // Delays search execution by 300ms until user stops typing
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Keyboard shortcuts handler
    // - Escape: Close expanded cards or clear search
    // - Ctrl+K / Forward Slash: Focus search input
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape to close expanded card or clear search
            if (e.key === 'Escape') {
                if (expandedCard) {
                    setExpandedCard(null);
                } else if (searchTerm) {
                    setSearchTerm('');
                    searchInputRef.current?.blur();
                }
            }

            // Ctrl+K or / to focus search
            if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [expandedCard, searchTerm]);

    // Scroll-to-top visibility and Infinite Scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);

            // Infinite scroll: load more when near bottom
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
                setVisibleCount(prev => Math.min(prev + 24, 1000)); // Load next 24 items, cap at sensible MAX
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset visible count on filter change
    useEffect(() => {
        setVisibleCount(24);
    }, [debouncedSearchTerm, activeCategory]);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);



    const currentRegion = useMemo(() => AZURE_REGIONS.find(r => r.value === regionValue) || AZURE_REGIONS.find(r => !r.type), [regionValue]);
    const formattedInstance = useMemo(() => (instance || '001').padStart(3, '0'), [instance]);

    const moveItem = useCallback((index, direction) => {
        setNamingOrder(prev => {
            const newOrder = [...prev];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= newOrder.length) return prev;
            [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
            return newOrder;
        });
    }, []);

    const handleInstanceChange = useCallback((e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 3) setInstance(val);
    }, []);

    /**
     * Generates a compliant Azure resource name based on configuration and resource specific rules.
     * 
     * @param {Object} resource - The resource definition object from constants.js
     * @param {string} [selectedSubResource=null] - Optional suffix for sub-resources (e.g., 'vnet-hub')
     * @returns {string} The generated resource name
     */
    const generateName = useCallback((resource, selectedSubResource = null) => {
        let resAbbrev = resource.abbrev || "res";

        // If resource has subResources and one is selected, append the suffix
        if (resource.subResources && selectedSubResource) {
            resAbbrev = `${resAbbrev}-${selectedSubResource}`;
        }

        // Special handling for Azure Firewall and Bastion subnets (must be exact names)
        if (resource.name === 'Subnet') {
            if (selectedSubResource === 'afw') return 'AzureFirewallSubnet';
            if (selectedSubResource === 'bas') return 'AzureBastionSubnet';
            if (selectedSubResource === 'gw') return 'GatewaySubnet';
            if (selectedSubResource === 'afwm') return 'AzureFirewallManagementSubnet';
            if (selectedSubResource === 'rs') return 'RouteServerSubnet';
        }

        const cleanWorkload = workload.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanOrg = orgPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
        const regAbbrev = currentRegion?.abbrev || 'uks';
        const suffix = formattedInstance;

        // Check if resource allows hyphens based on chars field
        const charsList = resource.chars ? resource.chars.split(',').map(c => c.trim()) : [];
        const allowsHyphens = charsList.includes('-');

        // Special handling for Windows VM (15 char limit)
        if (resAbbrev === 'vmw') {
            const maxWorkload = 15 - 3 - 1 - 3 - 3;
            return `${resAbbrev}${cleanWorkload.substring(0, maxWorkload)}${envValue.substring(0, 1)}${regAbbrev.substring(0, 3)}${suffix}`.toLowerCase();
        }

        // Build parts based on naming order
        let parts = [];
        namingOrder.forEach(part => {
            if (part === 'Org' && showOrg && cleanOrg) parts.push(cleanOrg);
            if (part === 'Resource') parts.push(resAbbrev);
            if (part === 'Workload') parts.push(cleanWorkload);
            if (part === 'Environment') parts.push(envValue);
            if (part === 'Region') {
                if (resource.name !== 'Subscription' && resource.name !== 'Management group') {
                    parts.push(regAbbrev);
                }
            }
            if (part === 'Instance') parts.push(suffix);
        });

        const separator = allowsHyphens ? '-' : '';
        let result = parts.join(separator);

        return result.toLowerCase();
    }, [workload, orgPrefix, currentRegion, formattedInstance, envValue, namingOrder, showOrg]);

    const filteredResources = useMemo(() => {
        const filtered = RESOURCE_DATA_SORTED.filter(rt => {
            const matchesSearch = String(rt.name).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || String(rt.abbrev).toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || rt.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
        return filtered;
    }, [debouncedSearchTerm, activeCategory]);

    const displayedResources = useMemo(() => {
        return filteredResources.slice(0, visibleCount);
    }, [filteredResources, visibleCount]);

    const copyToClipboard = useCallback(async (text, id, e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    }, []);

    const handleCardToggle = useCallback((resourceName, isCurrentlyExpanded) => {
        if (isCurrentlyExpanded) {
            setExpandedCard(null);
        } else {
            setExpandedCard(resourceName);
            // Scroll to center the card after a brief delay to allow expansion
            setTimeout(() => {
                const element = document.getElementById(`resource-${resourceName}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 50);
        }
    }, []);

    const handleSubResourceChange = useCallback((resourceName, suffix) => {
        setSubResourceSelections(prev => ({ ...prev, [resourceName]: suffix }));
    }, []);

    // Generate the schema pattern (shows placeholders like {resource}-{workload}-{env}-{region}-{instance})
    const liveSchemaStr = useMemo(() => {
        let parts = [];
        namingOrder.forEach(part => {
            if (part === 'Org' && showOrg) parts.push('{org}');
            if (part === 'Resource') parts.push('{resource}');
            if (part === 'Workload') parts.push('{workload}');
            if (part === 'Environment') parts.push('{environment}');
            if (part === 'Region') parts.push('{region}');
            if (part === 'Instance') parts.push('{instance}');
        });
        return parts.join('-');
    }, [namingOrder, showOrg]);

    return (
        <div className={`min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'bg-[#111009] text-white' : 'bg-[#faf9f8] text-[#242424]'}`}>
            <Header
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            />

            <ConfigPanel
                isDarkMode={isDarkMode}
                isMinimized={isConfigMinimized}
                onToggleMinimize={() => setIsConfigMinimized(!isConfigMinimized)}
                workload={workload}
                setWorkload={setWorkload}
                envValue={envValue}
                setEnvValue={setEnvValue}
                regionValue={regionValue}
                setRegionValue={setRegionValue}
                instance={instance}
                onInstanceChange={handleInstanceChange}
                orgPrefix={orgPrefix}
                setOrgPrefix={setOrgPrefix}
                showOrg={showOrg}
                setShowOrg={setShowOrg}
                namingOrder={namingOrder}
                onMoveItem={moveItem}
                liveSchemaStr={liveSchemaStr}
                copiedId={copiedId}
                onCopy={(e) => copyToClipboard(liveSchemaStr, 'live-pill', e)}
            />

            <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
                {/* Services Header Card */}
                <div className={`p-5 rounded-lg shadow-soft border flex flex-col gap-4 ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className={`text-[18px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#242424]'}`}>Services</h2>
                            <p className={`text-[13px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#616161]'}`}>Select a resource to generate a name</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
                            <div className={`relative flex-1 w-full flex items-center px-2 h-[32px] border rounded ${isDarkMode ? 'bg-[#1b1a19] border-[#605e5c]' : 'bg-white border-[#8a8886]'}`}>
                                <Search className="w-4 h-4 mr-2 text-[#0078d4]" />
                                <input ref={searchInputRef} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter services... (Ctrl+K)" className={`w-full bg-transparent border-none outline-none text-[14px] ${isDarkMode ? 'text-white placeholder:text-[#605e5c]' : 'text-[#201f1e] placeholder:text-[#a19f9d]'}`} />
                                {searchTerm && <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-black/10 rounded-full"><X className={`w-3 h-3 ${isDarkMode ? 'text-white' : 'text-black'}`} /></button>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t pt-3" style={{ borderColor: isDarkMode ? '#484644' : '#edebe9' }}>
                        <Filter className={`w-3.5 h-3.5 mr-2 shrink-0 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`} />
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-[13px] rounded-full whitespace-nowrap border transition-all ${activeCategory === cat ? (isDarkMode ? 'bg-primary-gradient border-transparent text-white font-semibold shadow-sm' : 'bg-primary-gradient border-transparent text-white font-semibold shadow-md') : (isDarkMode ? 'bg-transparent border-[#484644] text-[#c8c6c4] hover:bg-[#323130] hover:border-[#605e5c]' : 'bg-transparent border-[#edebe9] text-[#605e5c] hover:bg-[#f3f2f1] hover:border-[#c8c6c4]')}`}>{cat}</button>
                        ))}
                    </div>
                </div>

                {/* Resource Grid */}
                {displayedResources.length === 0 ? (
                    <div className={`text-center py-16 ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>
                        <p className="text-[14px]">No resources found matching your criteria.</p>
                        <p className="text-[12px] mt-2">Try adjusting your search or category filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {displayedResources.map((resource, index) => {
                            const selectedSubResource = subResourceSelections[resource.name] || (resource.subResources?.[0]?.suffix);
                            const genName = generateName(resource, selectedSubResource);
                            const isCopied = copiedId === resource.name;
                            const isExpanded = expandedCard === resource.name;
                            const isTooLong = resource.maxLength && genName.length > resource.maxLength;
                            // Cap stagger delay at 10 items to prevent long waits
                            const staggerClass = index < 10 ? `stagger-${index + 1}` : '';

                            return (
                                <div key={resource.name} className={`animate-fade-in opacity-0 ${staggerClass} ${isExpanded ? 'col-span-full z-10' : 'h-full'}`}>
                                    <ResourceCard
                                        id={`resource-${resource.name}`}
                                        resource={resource}
                                        genName={genName}
                                        isCopied={isCopied}
                                        isExpanded={isExpanded}
                                        isTooLong={isTooLong}
                                        isDarkMode={isDarkMode}
                                        onCopy={(e, textOverride) => copyToClipboard(textOverride || genName, resource.name, e)}
                                        onToggle={() => handleCardToggle(resource.name, isExpanded)}
                                        selectedSubResource={selectedSubResource}
                                        onSubResourceChange={(suffix) => handleSubResourceChange(resource.name, suffix)}
                                        generateName={generateName}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <footer className={`py-6 text-center text-[12px] ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>
                    Published by <a href="https://www.linkedin.com/in/danielpowley92/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0078d4] hover:underline">Daniel Powley</a> • <a href="https://github.com/danzure/azres-naming-tool" target="_blank" rel="noopener noreferrer" className="text-[#0078d4] hover:underline">GitHub</a> • Licensed under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-[#0078d4] hover:underline">MIT License</a>
                </footer>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg hover:shadow-depth transition-all duration-300 z-50 animate-scale-in ${isDarkMode ? 'bg-[#323130] text-white hover:bg-[#484644]' : 'bg-primary-gradient text-white hover:shadow-glow'}`}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
