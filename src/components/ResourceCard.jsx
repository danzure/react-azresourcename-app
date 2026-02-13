import { memo } from 'react';
import { Box, Copy, Check, ShieldAlert, LayoutGrid, Cpu, Network, Database, Globe, DatabaseZap, ShieldCheck, Workflow, BarChart3, BrainCircuit, Settings2, Wifi, GitBranch } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';
import ExpandedPanel from './ExpandedPanel';
import { getCategoryColors } from '../data/categoryColors';
import PropTypes from 'prop-types';

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

function ResourceCard({ id, resource, genName, isCopied, isExpanded, isTooLong, isDarkMode, onCopy, onToggle, selectedSubResource, onSubResourceChange }) {
    const categoryColors = getCategoryColors(resource.category, isDarkMode);
    const CategoryIcon = CATEGORY_ICONS[resource.category] || Box;

    return (
        <div
            id={id}
            onClick={onToggle}
            className={`group relative flex flex-col rounded-lg border cursor-pointer transition-all duration-300 ${isExpanded ? 'ring-2 ring-[#0078d4] shadow-depth' : 'hover:-translate-y-1 hover:shadow-depth shadow-soft'} ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'} ${isTooLong ? 'border-l-4 border-l-[#a80000]' : ''}`}
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

                <div className="mt-auto pt-2">
                    <div className={`relative rounded px-3 h-[32px] border flex items-center ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                        <div className={`text-[13px] font-medium font-mono truncate w-full pr-8 ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-[#ffffff]' : 'text-[#242424]'}`}>
                            <ValidationHighlight name={genName} allowedCharsPattern={resource.chars} isDarkMode={isDarkMode} />
                        </div>
                        <button
                            onClick={onCopy}
                            aria-label={isCopied ? 'Copied' : 'Copy name'}
                            className={`absolute right-1 p-1.5 rounded transition-colors ${isCopied ? 'text-[#107c10]' : isDarkMode ? 'text-[#c8c6c4] hover:text-[#60cdff] hover:bg-[#323130]' : 'text-[#605e5c] hover:text-[#0078d4] hover:bg-[#f3f2f1]'}`}
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div className="flex justify-between items-center text-[10px] mt-2 px-0.5 opacity-70">
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
};

export default memo(ResourceCard);
