import { useState, useMemo, useEffect } from 'react';
import { Search, X, LayoutGrid, List as ListIcon, Filter } from 'lucide-react';

import Header from './components/Header';
import ConfigPanel from './components/ConfigPanel';
import ResourceCard from './components/ResourceCard';
import ResourceListItem from './components/ResourceListItem';
import { AZURE_REGIONS, RESOURCE_DATA_SORTED, CATEGORIES } from './data/constants';

export default function App() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isConfigMinimized, setIsConfigMinimized] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [workload, setWorkload] = useState('app');
    const [envValue, setEnvValue] = useState('prod');
    const [regionValue, setRegionValue] = useState('uksouth');
    const [instance, setInstance] = useState('001');
    const [orgPrefix, setOrgPrefix] = useState('');
    const [namingOrder, setNamingOrder] = useState(['Org', 'Resource', 'Workload', 'Environment', 'Region', 'Instance']);
    const [showOrg, setShowOrg] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [copiedId, setCopiedId] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        const styleId = 'fluent-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
        @import url('https://fonts.cdnfonts.com/css/segoe-ui-4');
        body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
      `;
            document.head.appendChild(style);
        }
    }, []);

    const currentRegion = useMemo(() => AZURE_REGIONS.find(r => r.value === regionValue) || AZURE_REGIONS.find(r => !r.type), [regionValue]);
    const formattedInstance = useMemo(() => (instance || '001').padStart(3, '0'), [instance]);

    const moveItem = (index, direction) => {
        const newOrder = [...namingOrder];
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= newOrder.length) return;
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        setNamingOrder(newOrder);
    };

    const handleInstanceChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 3) setInstance(val);
    };

    const generateName = (resource) => {
        const resAbbrev = resource.abbrev || "res";
        const cleanWorkload = workload.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanOrg = orgPrefix.toLowerCase().replace(/[^a-z0-9]/g, '');
        const regAbbrev = currentRegion?.abbrev || 'uks';
        const suffix = formattedInstance;

        // Check if resource allows hyphens based on chars field (look for standalone '-' in comma-separated list)
        const charsList = resource.chars ? resource.chars.split(',').map(c => c.trim()) : [];
        const allowsHyphens = charsList.includes('-');
        // Check if resource only allows lowercase
        const lowercaseOnly = resource.chars ? !resource.chars.includes('A-Z') : false;

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
            if (part === 'Region') parts.push(regAbbrev);
            if (part === 'Instance') parts.push(suffix);
        });

        // Join with or without hyphens based on resource constraints
        const separator = allowsHyphens ? '-' : '';
        let result = parts.join(separator);

        // Apply case constraint
        return lowercaseOnly ? result.toLowerCase() : result.toLowerCase();
    };

    const filteredResources = useMemo(() => {
        return RESOURCE_DATA_SORTED.filter(rt => {
            const matchesSearch = String(rt.name).toLowerCase().includes(searchTerm.toLowerCase()) || String(rt.abbrev).toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || rt.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const copyToClipboard = (text, id, e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.cssText = "position:fixed;top:0;left:0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) { console.error('Copy failed', err); }
        document.body.removeChild(textArea);
    };

    // Generate the schema pattern (shows placeholders like {resource}-{workload}-{env}-{region}-{instance})
    const liveSchemaStr = useMemo(() => {
        let parts = [];
        namingOrder.forEach(part => {
            if (part === 'Org' && showOrg) parts.push(orgPrefix || '{org}');
            if (part === 'Resource') parts.push('{resource}');
            if (part === 'Workload') parts.push(workload || '{workload}');
            if (part === 'Environment') parts.push(envValue || '{env}');
            if (part === 'Region') parts.push(currentRegion?.abbrev || '{region}');
            if (part === 'Instance') parts.push(formattedInstance || '{instance}');
        });
        return parts.join('-');
    }, [namingOrder, showOrg, orgPrefix, workload, envValue, currentRegion, formattedInstance]);

    return (
        <div className={`min-h-screen font-sans pb-24 transition-colors duration-200 ${isDarkMode ? 'bg-[#111009] text-white' : 'bg-[#faf9f8] text-[#201f1e]'}`}>
            <Header isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />

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
                <div className={`p-5 rounded shadow-sm border flex flex-col gap-4 ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className={`text-[18px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Services</h2>
                            <p className={`text-[12px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Azure Resource Inventory</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:max-w-xl">
                            <div className={`relative flex-1 w-full flex items-center px-2 h-[32px] border rounded ${isDarkMode ? 'bg-[#1b1a19] border-[#605e5c]' : 'bg-white border-[#8a8886]'}`}>
                                <Search className="w-4 h-4 mr-2 text-[#0078d4]" />
                                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter services..." className={`w-full bg-transparent border-none outline-none text-[14px] ${isDarkMode ? 'text-white placeholder:text-[#605e5c]' : 'text-[#201f1e] placeholder:text-[#a19f9d]'}`} />
                                {searchTerm && <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-black/10 rounded-full"><X className={`w-3 h-3 ${isDarkMode ? 'text-white' : 'text-black'}`} /></button>}
                            </div>
                            <div className={`flex rounded overflow-hidden border ${isDarkMode ? 'border-[#605e5c]' : 'border-[#8a8886]'}`}>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 px-3 ${viewMode === 'grid' ? (isDarkMode ? 'bg-[#323130] text-white' : 'bg-[#f3f2f1] text-[#201f1e]') : (isDarkMode ? 'bg-transparent text-[#c8c6c4]' : 'bg-transparent text-[#605e5c]')}`}><LayoutGrid className="w-4 h-4" /></button>
                                <div className={`w-px ${isDarkMode ? 'bg-[#605e5c]' : 'bg-[#8a8886]'}`}></div>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 px-3 ${viewMode === 'list' ? (isDarkMode ? 'bg-[#323130] text-white' : 'bg-[#f3f2f1] text-[#201f1e]') : (isDarkMode ? 'bg-transparent text-[#c8c6c4]' : 'bg-transparent text-[#605e5c]')}`}><ListIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t pt-3" style={{ borderColor: isDarkMode ? '#484644' : '#edebe9' }}>
                        <Filter className={`w-3.5 h-3.5 mr-2 shrink-0 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`} />
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1 text-[13px] rounded-full whitespace-nowrap border transition-colors ${activeCategory === cat ? (isDarkMode ? 'bg-[#0078d4] border-[#0078d4] text-white font-semibold' : 'bg-[#0078d4] border-[#0078d4] text-white font-semibold') : (isDarkMode ? 'bg-transparent border-[#484644] text-[#c8c6c4] hover:bg-[#323130] hover:border-[#605e5c]' : 'bg-transparent border-[#edebe9] text-[#605e5c] hover:bg-[#f3f2f1] hover:border-[#c8c6c4]')}`}>{cat}</button>
                        ))}
                    </div>
                </div>

                {/* Resource Grid/List */}
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
                    {filteredResources.map((resource) => {
                        const genName = generateName(resource);
                        const isCopied = copiedId === resource.name;
                        const isExpanded = expandedCard === resource.name;
                        const isTooLong = resource.maxLength && genName.length > resource.maxLength;

                        if (viewMode === 'list') {
                            return (
                                <ResourceListItem
                                    key={resource.name}
                                    resource={resource}
                                    genName={genName}
                                    isCopied={isCopied}
                                    isExpanded={isExpanded}
                                    isTooLong={isTooLong}
                                    isDarkMode={isDarkMode}
                                    onCopy={(e) => copyToClipboard(genName, resource.name, e)}
                                    onToggle={() => setExpandedCard(isExpanded ? null : resource.name)}
                                />
                            );
                        }

                        return (
                            <ResourceCard
                                key={resource.name}
                                resource={resource}
                                genName={genName}
                                isCopied={isCopied}
                                isExpanded={isExpanded}
                                isTooLong={isTooLong}
                                isDarkMode={isDarkMode}
                                onCopy={(e) => copyToClipboard(genName, resource.name, e)}
                                onToggle={() => setExpandedCard(isExpanded ? null : resource.name)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
