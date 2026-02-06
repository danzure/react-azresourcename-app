import { memo } from 'react';
import { Box, Copy, Check } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';
import ExpandedPanel from './ExpandedPanel';

function ResourceListItem({ id, resource, genName, isCopied, isExpanded, isTooLong, isDarkMode, onCopy, onToggle, selectedSubResource, onSubResourceChange }) {
    return (
        <div id={id} className={`rounded border transition-all ${isExpanded ? `border-[#0078d4] ring-1 ring-[#0078d4]` : isDarkMode ? 'border-[#484644]' : 'border-[#edebe9]'}`}>
            <div
                onClick={onToggle}
                className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-all ${isExpanded ? (isDarkMode ? 'bg-[#252423]' : 'bg-white') : isDarkMode ? 'bg-[#252423] hover:bg-[#323130]' : 'bg-white hover:bg-[#f3f2f1]'}`}
            >
                <div className={`p-2 rounded shrink-0 ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#deecf9] text-[#0078d4]'}`}>
                    <Box className="w-5 h-5" />
                </div>
                <div className="flex flex-col w-[180px] shrink-0">
                    <span className={`font-semibold text-[14px] truncate ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{resource.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] px-1.5 rounded ${isDarkMode ? 'bg-[#323130] text-[#c8c6c4]' : 'bg-[#f3f2f1] text-[#605e5c]'}`}>{resource.category}</span>
                        <span className={`text-[11px] font-mono opacity-60 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>({resource.abbrev})</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className={`relative flex items-center px-3 h-[32px] border rounded ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                        <div className={`text-[13px] font-medium font-mono truncate w-full pr-8 ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>
                            <ValidationHighlight name={genName} allowedCharsPattern={resource.chars} isDarkMode={isDarkMode} />
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCopy(e); }}
                            aria-label={isCopied ? 'Copied' : 'Copy name'}
                            className={`absolute right-1 p-1.5 rounded transition-colors ${isCopied ? 'text-[#107c10]' : isDarkMode ? 'text-[#c8c6c4] hover:text-[#60cdff] hover:bg-[#323130]' : 'text-[#605e5c] hover:text-[#0078d4] hover:bg-[#f3f2f1]'}`}
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
                <div className="w-[80px] flex flex-col items-end shrink-0">
                    <div className={`text-[11px] font-bold ${isTooLong ? 'text-[#a80000]' : 'text-[#107c10]'}`}>{genName.length} / {resource.maxLength || 64}</div>
                </div>
            </div>

            {isExpanded && (
                <ExpandedPanel
                    resource={resource}
                    genName={genName}
                    isCopied={isCopied}
                    isDarkMode={isDarkMode}
                    onCopy={onCopy}
                    selectedSubResource={selectedSubResource}
                    onSubResourceChange={onSubResourceChange}
                />
            )}
        </div>
    );
}

export default memo(ResourceListItem);
