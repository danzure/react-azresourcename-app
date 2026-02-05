import { Box, Copy, Check, ShieldAlert, BookOpen, Info } from 'lucide-react';
import ValidationHighlight from './ValidationHighlight';

export default function ResourceCard({ resource, genName, isCopied, isExpanded, isTooLong, isDarkMode, onCopy, onToggle }) {
    return (
        <div
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
                    {isTooLong && <ShieldAlert className="w-4 h-4 text-[#a80000] shrink-0" />}
                </div>

                <div className="mt-auto pt-2">
                    <div className={`relative rounded px-3 h-[32px] border flex items-center ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                        <div className={`text-[13px] font-medium font-mono truncate w-full pr-8 ${isTooLong ? 'text-[#a80000]' : isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>
                            <ValidationHighlight name={genName} allowedCharsPattern={resource.chars} isDarkMode={isDarkMode} />
                        </div>
                        <button onClick={onCopy} className={`absolute right-1 p-1.5 rounded transition-colors ${isCopied ? 'text-[#107c10]' : isDarkMode ? 'text-[#c8c6c4] hover:text-[#60cdff] hover:bg-[#323130]' : 'text-[#605e5c] hover:text-[#0078d4] hover:bg-[#f3f2f1]'}`}>
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
                <div onClick={(e) => e.stopPropagation()} className={`p-6 border-t cursor-default ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#faf9f8] border-[#edebe9]'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#0078d4]" />
                            <h4 className={`text-[14px] font-bold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Resource Guidance</h4>
                        </div>
                        <a href={resource.learnUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] flex items-center gap-1.5 text-[#0078d4] hover:underline">
                            View Documentation
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Description & Best Practice */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <span className={`text-[11px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Description</span>
                                <p className={`text-[13px] mt-1.5 leading-relaxed ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#323130]'}`}>{resource.desc}</p>
                            </div>
                            <div>
                                <span className={`text-[11px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>CAF Best Practice</span>
                                <div className={`mt-1.5 p-3 rounded border-l-4 ${isDarkMode ? 'bg-[#252423] border-[#0078d4]' : 'bg-white border-[#0078d4]'}`}>
                                    <div className="flex gap-3">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0078d4]" />
                                        <p className={`text-[13px] leading-relaxed ${isDarkMode ? 'text-[#d2d0ce]' : 'text-[#323130]'}`}>{resource.bestPractice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Naming Rules Card */}
                        <div className={`p-4 rounded border ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-4 h-4 text-[#0078d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className={`text-[12px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Naming Rules</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Scope</span>
                                    <span className={`text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{resource.scope || 'Resource group'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Abbreviation</span>
                                    <code className={`text-[12px] px-2 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#323130] text-[#60cdff]' : 'bg-[#f3f2f1] text-[#0078d4]'}`}>{resource.abbrev}</code>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-[13px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Characters</span>
                                    <div className="flex items-center gap-1.5">
                                        {resource.chars?.split(',').map((char, i) => (
                                            <span key={i} className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#323130] text-[#c8c6c4]' : 'bg-[#f3f2f1] text-[#605e5c]'}`}>{char.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copy Name Button */}
                    <button
                        onClick={onCopy}
                        className={`mt-6 w-full h-[40px] rounded font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors ${isCopied
                                ? 'bg-[#107c10] text-white'
                                : 'bg-[#0078d4] text-white hover:bg-[#106ebe] active:bg-[#005a9e]'
                            }`}
                    >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {isCopied ? 'Copied!' : 'Copy Name'}
                    </button>
                </div>
            )}
        </div>
    );
}
