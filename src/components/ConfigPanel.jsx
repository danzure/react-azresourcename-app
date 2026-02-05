import { ChevronDown, ChevronUp, Edit3, Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import Tooltip from './Tooltip';
import { AZURE_REGIONS, ENVIRONMENTS } from '../data/constants';

export default function ConfigPanel({
    isDarkMode, isMinimized, onToggleMinimize,
    workload, setWorkload, envValue, setEnvValue, regionValue, setRegionValue,
    instance, onInstanceChange, orgPrefix, setOrgPrefix, showOrg, setShowOrg,
    namingOrder, onMoveItem, liveSchemaStr, copiedId, onCopy
}) {
    return (
        <nav className={`mt-[48px] shadow-sm transition-all border-b ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
            <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`text-[18px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Configuration</h2>
                        <p className={`text-[12px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Define global parameters for resource names.</p>
                    </div>
                    <button onClick={onToggleMinimize} className="text-[14px] font-semibold text-[#0078d4] hover:underline flex items-center gap-1">
                        {isMinimized ? 'Show' : 'Hide'}
                        {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>

                {!isMinimized && (
                    <div className="animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-start mb-3">
                            <div className="relative group flex-1 min-w-[200px] flex flex-col gap-1">
                                <Tooltip content="Identifies the application or workload." isDarkMode={isDarkMode}>
                                    <label className={`block text-[14px] font-semibold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>Workload</label>
                                    <input type="text" value={workload} onChange={(e) => setWorkload(e.target.value)} className={`w-full px-3 h-[32px] border rounded-sm outline-none text-[14px] ${isDarkMode ? 'bg-[#252423] text-white border-[#605e5c] focus:border-[#0078d4]' : 'bg-white text-[#201f1e] border-[#8a8886] focus:border-[#0078d4]'}`} />
                                </Tooltip>
                            </div>
                            <SearchableSelect label="Environment" items={ENVIRONMENTS} value={envValue} onChange={setEnvValue} isDarkMode={isDarkMode} description="Development lifecycle stage." />
                            <SearchableSelect label="Region" items={AZURE_REGIONS} value={regionValue} onChange={setRegionValue} isDarkMode={isDarkMode} placeholder="Select region..." description="Azure deployment location." />
                            <div className="relative group min-w-[120px] flex flex-col gap-1">
                                <Tooltip content="Three-digit sequence number." isDarkMode={isDarkMode}>
                                    <label className={`block text-[14px] font-semibold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>Instance</label>
                                    <input type="text" value={instance} onChange={onInstanceChange} maxLength={3} className={`w-full px-3 h-[32px] border rounded-sm outline-none text-[14px] ${isDarkMode ? 'bg-[#252423] text-white border-[#605e5c] focus:border-[#0078d4]' : 'bg-white text-[#201f1e] border-[#8a8886] focus:border-[#0078d4]'}`} />
                                </Tooltip>
                            </div>
                        </div>

                        <div className={`mb-3 p-3 rounded-sm border flex flex-col gap-3 ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                            <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: isDarkMode ? '#484644' : '#edebe9' }}>
                                <Edit3 className="w-4 h-4 text-[#0078d4]" />
                                <h3 className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Pattern Builder</h3>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-4 items-start">
                                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                                    <label className={`block text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Org Prefix</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={orgPrefix} onChange={(e) => setOrgPrefix(e.target.value)} placeholder="e.g. cts" disabled={!showOrg} className={`flex-1 px-3 h-[32px] border rounded-sm outline-none text-[14px] disabled:opacity-50 ${isDarkMode ? 'bg-[#1b1a19] border-[#605e5c] text-white' : 'bg-white border-[#8a8886] text-[#201f1e]'}`} />
                                        <button onClick={() => setShowOrg(!showOrg)} className={`h-[32px] w-[32px] flex items-center justify-center rounded-sm border ${showOrg ? (isDarkMode ? 'bg-[#323130] border-[#484644] text-[#0078d4]' : 'bg-[#f3f2f1] border-[#edebe9] text-[#0078d4]') : (isDarkMode ? 'bg-transparent border-[#605e5c] text-[#797775]' : 'bg-white border-[#8a8886] text-[#605e5c]')}`}>
                                            {showOrg ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 w-full overflow-hidden">
                                    <label className={`block text-[14px] font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Sequence</label>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {namingOrder.map((item, index) => (
                                            <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-sm border min-w-max h-[32px] ${item === 'Org' && !showOrg ? 'opacity-50 border-dashed' : ''} ${isDarkMode ? 'bg-[#323130] border-[#484644]' : 'bg-[#f3f2f1] border-[#edebe9]'}`}>
                                                <span className={`text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{item}</span>
                                                <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: isDarkMode ? '#484644' : '#d2d0ce' }}>
                                                    <button onClick={() => onMoveItem(index, -1)} disabled={index === 0} className={`p-1 hover:bg-black/5 rounded disabled:opacity-20 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}><ArrowLeft className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => onMoveItem(index, 1)} disabled={index === namingOrder.length - 1} className={`p-1 hover:bg-black/5 rounded disabled:opacity-20 ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}><ArrowRight className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex flex-col p-3 rounded border shadow-sm ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#f3f2f1] border-transparent'}`}>
                            <span className={`text-[12px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>Preview Schema</span>
                            <div className="flex items-center gap-3 mt-2">
                                <code className={`flex-1 font-mono text-[16px] font-semibold truncate lowercase ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{liveSchemaStr}</code>
                                <button onClick={onCopy} className={`px-3 h-[32px] rounded-sm text-[13px] font-semibold ${isDarkMode ? 'bg-[#323130] text-white hover:bg-[#484644]' : 'bg-white text-[#0078d4] shadow-sm'}`}>
                                    {copiedId === 'live-pill' ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
