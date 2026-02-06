import { memo } from 'react';
import { Box, Copy, Check, ShieldAlert } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';
import ExpandedPanel from './ExpandedPanel';

function ResourceCard({ id, resource, genName, isCopied, isExpanded, isTooLong, isDarkMode, onCopy, onToggle, selectedSubResource, onSubResourceChange }) {
    return (
        <div
            id={id}
            onClick={onToggle}
            className={`group relative flex flex-col rounded border shadow-sm cursor-pointer transition-all duration-200 ${isExpanded ? 'col-span-full ring-2 ring-[#0078d4] z-10' : 'hover:shadow-md hover:border-[#0078d4]/30'} ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'} ${isTooLong ? 'border-l-4 border-l-[#a80000]' : ''}`}
        >
            <div className="p-4 flex flex-col h-full gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded shrink-0 ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#deecf9] text-[#0078d4]'}`}>
                            <Box className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className={`text-[14px] font-semibold truncate ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{resource.name}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isDarkMode ? 'bg-[#323130] text-[#c8c6c4]' : 'bg-[#f3f2f1] text-[#605e5c]'}`}>{resource.category}</span>
                                <span className={`text-[10px] font-mono opacity-60 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>{resource.abbrev}</span>
                            </div>
                        </div>
                    </div>
                    {isTooLong && <ShieldAlert className="w-4 h-4 text-[#a80000] shrink-0" aria-label="Name exceeds maximum length" />}
                </div>

                <div className="mt-auto pt-2">
                    <div className={`relative rounded px-3 h-[32px] border flex items-center ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                        <div className={`text-[13px] font-medium font-mono truncate w-full pr-8 ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>
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

export default memo(ResourceCard);
