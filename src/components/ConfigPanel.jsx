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
                                    <input type="text" value={workload} onChange={(e) => setWorkload(e.target.value)} placeholder="e.g. app" className={`w-full px-3 h-[32px] border rounded outline-none text-[14px] transition-colors ${isDarkMode ? 'bg-[#1b1a19] text-white border-[#605e5c] focus:border-b-2 focus:border-b-[#0078d4] placeholder:text-[#605e5c]' : 'bg-white text-[#201f1e] border-[#8a8886] focus:border-b-2 focus:border-b-[#0078d4] placeholder:text-[#a19f9d]'}`} />
                                </Tooltip>
                            </div>
                            <SearchableSelect label="Environment" items={ENVIRONMENTS} value={envValue} onChange={setEnvValue} isDarkMode={isDarkMode} description="Development lifecycle stage." />
                            <SearchableSelect label="Region" items={AZURE_REGIONS} value={regionValue} onChange={setRegionValue} isDarkMode={isDarkMode} placeholder="Select region..." description="Azure deployment location." />
                            <div className="relative group min-w-[120px] flex flex-col gap-1">
                                <Tooltip content="Three-digit sequence number." isDarkMode={isDarkMode}>
                                    <label className={`block text-[14px] font-semibold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>Instance</label>
                                    <input type="text" value={instance} onChange={onInstanceChange} maxLength={3} placeholder="001" className={`w-full px-3 h-[32px] border rounded outline-none text-[14px] transition-colors ${isDarkMode ? 'bg-[#1b1a19] text-white border-[#605e5c] focus:border-b-2 focus:border-b-[#0078d4] placeholder:text-[#605e5c]' : 'bg-white text-[#201f1e] border-[#8a8886] focus:border-b-2 focus:border-b-[#0078d4] placeholder:text-[#a19f9d]'}`} />
                                </Tooltip>
                            </div>
                        </div>

                        <div className={`mb-3 p-4 rounded border flex flex-col gap-3 ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-white border-[#edebe9] shadow-sm'}`}>
                            <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: isDarkMode ? '#484644' : '#edebe9' }}>
                                <Edit3 className="w-4 h-4 text-[#0078d4]" />
                                <h3 className={`text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Pattern Builder</h3>
                            </div>
                            <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>
                                Build your naming pattern using the <a href="https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming" target="_blank" rel="noopener noreferrer" className="text-[#0078d4] hover:underline">Cloud Adoption Framework (CAF)</a> recommended format: <code className={`px-1 py-0.5 rounded text-[11px] ${isDarkMode ? 'bg-[#323130]' : 'bg-[#f3f2f1]'}`}>{'{resource}-{workload}-{env}-{region}-{instance}'}</code>. Reorder components to match your organization's standards.
                            </p>
                            <div className="flex flex-col lg:flex-row gap-4 items-start">
                                <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
                                    <label className={`block text-[14px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Org Prefix</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={orgPrefix} onChange={(e) => setOrgPrefix(e.target.value)} placeholder="e.g. cts" disabled={!showOrg} className={`flex-1 px-3 h-[32px] border rounded outline-none text-[14px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDarkMode ? 'bg-[#1b1a19] border-[#605e5c] text-white placeholder:text-[#605e5c]' : 'bg-white border-[#8a8886] text-[#201f1e] placeholder:text-[#a19f9d]'}`} />
                                        <button onClick={() => setShowOrg(!showOrg)} className={`h-[32px] w-[32px] flex items-center justify-center rounded border transition-colors ${showOrg ? (isDarkMode ? 'bg-[#323130] border-[#0078d4] text-[#0078d4]' : 'bg-[#deecf9] border-[#0078d4] text-[#0078d4]') : (isDarkMode ? 'bg-transparent border-[#605e5c] text-[#797775] hover:border-[#8a8886]' : 'bg-white border-[#8a8886] text-[#605e5c] hover:border-[#201f1e]')}`}>
                                            {showOrg ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 w-full overflow-hidden">
                                    <label className={`block text-[14px] font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>Sequence</label>
                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                        {namingOrder.map((item, index) => (
                                            <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded border min-w-max h-[32px] ${item === 'Org' && !showOrg ? 'opacity-50 border-dashed' : ''} ${isDarkMode ? 'bg-[#323130] border-[#484644]' : 'bg-[#f3f2f1] border-[#edebe9]'}`}>
                                                <span className={`text-[13px] font-semibold ${isDarkMode ? 'text-white' : 'text-[#201f1e]'}`}>{item}</span>
                                                <div className="flex items-center gap-1 border-l pl-2" style={{ borderColor: isDarkMode ? '#484644' : '#d2d0ce' }}>
                                                    <button onClick={() => onMoveItem(index, -1)} disabled={index === 0} className={`p-1 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${isDarkMode ? 'text-[#c8c6c4] hover:bg-[#484644]' : 'text-[#605e5c] hover:bg-[#edebe9]'}`}><ArrowLeft className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => onMoveItem(index, 1)} disabled={index === namingOrder.length - 1} className={`p-1 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${isDarkMode ? 'text-[#c8c6c4] hover:bg-[#484644]' : 'text-[#605e5c] hover:bg-[#edebe9]'}`}><ArrowRight className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex flex-col p-4 rounded border ${isDarkMode ? 'bg-[#1b1a19] border-[#484644]' : 'bg-[#f3f2f1] border-[#edebe9]'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className={`text-[12px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-[#a19f9d]' : 'text-[#605e5c]'}`}>Preview Schema</span>
                                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-[#8a8886]' : 'text-[#8a8886]'}`}>Live preview of your naming pattern</p>
                                </div>
                                <button
                                    onClick={onCopy}
                                    className={`px-4 py-1.5 rounded text-[13px] font-semibold transition-all duration-150 ${copiedId === 'live-pill'
                                        ? 'bg-[#107c10] text-white'
                                        : isDarkMode
                                            ? 'bg-[#0078d4] text-white hover:bg-[#106ebe] active:bg-[#005a9e]'
                                            : 'bg-[#0078d4] text-white hover:bg-[#106ebe] active:bg-[#005a9e]'
                                        }`}
                                >
                                    {copiedId === 'live-pill' ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                            <div className={`mt-2 px-4 py-3 rounded font-mono text-[18px] font-semibold tracking-wide ${isDarkMode ? 'bg-[#252423] text-[#60cdff]' : 'bg-white text-[#0078d4] border border-[#edebe9]'}`}>
                                {liveSchemaStr}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
