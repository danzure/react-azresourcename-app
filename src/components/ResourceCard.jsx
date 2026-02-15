import { memo } from 'react';
import { Box, Copy, Check, ShieldAlert, LayoutGrid, Cpu, Network, Database, Globe, DatabaseZap, ShieldCheck, Workflow, BarChart3, BrainCircuit, Settings2, Wifi, GitBranch } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';
import ExpandedPanel from './ExpandedPanel';
import { getCategoryColors } from '../data/categoryColors';
import { getBundleResources } from '../utils/bundleGenerator';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

const CATEGORY_ICONS = {
    'General': LayoutGrid,
    'Compute': Cpu,
    'Networking': Network,
    'Storage': Database,
    'Web': Globe,
    'Databases': DatabaseZap,
    'Containers': Box,
    'Security': ShieldCheck,
    'Integration': Workflow,
    'Analytics': BarChart3,
    'AI + ML': BrainCircuit,
    'Management + Governance': Settings2,
    'IoT': Wifi,
    'DevOps': GitBranch,
};

function ResourceCard({ id, resource, genName, isCopied, isExpanded, isTooLong, isDarkMode, onCopy, onToggle, selectedSubResource, onSubResourceChange, generateName }) {
    const categoryColors = getCategoryColors(resource.category, isDarkMode);
    const CategoryIcon = CATEGORY_ICONS[resource.category] || Box;

    const [topology, setTopology] = useState('single');
    const [selectedSpokes, setSelectedSpokes] = useState([]);

    const handleSpokeToggle = (spokeValue) => {
        setSelectedSpokes(prev => {
            if (prev.includes(spokeValue)) return prev.filter(s => s !== spokeValue);
            return [...prev, spokeValue];
        });
    };

    const bundle = getBundleResources(resource, topology, selectedSpokes);
    const hasBundle = bundle && bundle.length > 0;

    // Helper to generate name - utilizing the passed generateName function with modified resource context
    const getGeneratedName = (resItem) => generateName(resItem, null);


    return (
        <div
            id={id}
            onClick={onToggle}
            className={`group relative flex flex-col rounded-lg border cursor-pointer transition-all duration-300 h-full ${isExpanded ? 'ring-2 ring-[#0078d4] shadow-depth' : 'hover:-translate-y-1 hover:shadow-depth shadow-soft'} ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'} ${isTooLong ? 'border-l-4 border-l-[#a80000]' : ''}`}
        >
            <div className="p-4 flex flex-col h-full gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div
                            className="p-2 rounded shrink-0 transition-colors"
                            style={{ backgroundColor: categoryColors.bg, color: categoryColors.icon }}
                        >
                            <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className={`text-[14px] font-semibold truncate ${isDarkMode ? 'text-white' : 'text-[#242424]'}`}>{resource.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span
                                    className="text-[11px] px-1.5 py-0.5 rounded font-medium transition-colors"
                                    style={{ backgroundColor: categoryColors.bg, color: categoryColors.icon }}
                                >{resource.category}</span>
                                <span className={`text-[11px] font-mono opacity-60 ${isDarkMode ? 'text-[#d2d2d2]' : 'text-[#616161]'}`}>{resource.abbrev}</span>
                            </div>
                        </div>
                    </div>
                    {isTooLong && <ShieldAlert className="w-4 h-4 text-[#a80000] shrink-0" aria-label="Name exceeds maximum length" />}
                </div>

                <p className={`text-[12px] leading-relaxed line-clamp-2 ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#605e5c]'}`}>
                    {resource.desc}
                </p>

                <div className="mt-auto pt-2">
                    <div className={`relative rounded px-3 border flex flex-col justify-center h-[32px] ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                        <div className={`text-[13px] font-medium font-mono truncate w-full pr-8 flex items-center gap-2 ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-[#ffffff]' : 'text-[#242424]'}`}>
                            <ValidationHighlight name={hasBundle ? getGeneratedName(bundle[0]) : genName} allowedCharsPattern={hasBundle ? bundle[0].chars : resource.chars} isDarkMode={isDarkMode} />
                            {hasBundle && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#f3f2f1] text-[#0078d4]'}`}>
                                    +{bundle.length - 1}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={(e) => {
                                if (hasBundle) {
                                    const allNames = bundle.map(item => `${item.name}: ${getGeneratedName(item)}`).join('\n');
                                    onCopy(e, allNames);
                                } else {
                                    onCopy(e);
                                }
                            }}
                            aria-label={isCopied ? 'Copied' : 'Copy name'}
                            className={`absolute right-1 top-1 h-[24px] px-2 rounded text-[11px] font-semibold transition-all flex items-center gap-1 z-10 ${isCopied
                                ? 'bg-[#107c10] text-white'
                                : 'bg-[#0078d4] text-white hover:bg-[#106ebe]'
                                }`}
                        >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {/* Mobile visual optimization: hide text on very small screens if needed, but keeping separate for now */}
                        </button>
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-2 px-0.5 opacity-70 shrink-0">
                        <span className={isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}>Max: {resource.maxLength || 64}</span>
                        <span className={`font-bold ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{genName.length} chars</span>
                    </div>
                </div>
            </div>




            {isExpanded && (
                <div className="animate-fade-in">
                    <ExpandedPanel
                        resource={resource}
                        genName={genName}
                        isCopied={isCopied}
                        isDarkMode={isDarkMode}
                        onCopy={onCopy}
                        selectedSubResource={selectedSubResource}
                        onSubResourceChange={onSubResourceChange}
                        topology={topology}
                        setTopology={setTopology}
                        selectedSpokes={selectedSpokes}
                        handleSpokeToggle={handleSpokeToggle}
                        bundle={bundle}
                        getBundleName={getGeneratedName}
                    />
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
    isTooLong: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    onCopy: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    selectedSubResource: PropTypes.string,
    onSubResourceChange: PropTypes.func,
    generateName: PropTypes.func,
};

export default memo(ResourceCard);
