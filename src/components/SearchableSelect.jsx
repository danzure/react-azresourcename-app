import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, HelpCircle } from 'lucide-react';
import Tooltip from './Tooltip';

export default function SearchableSelect({ items, value, onChange, label, isDarkMode, placeholder = "Select...", description }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    const selectedItem = items.find(i => i.value === value && !i.type) || items.find(i => !i.type);
    const filteredItems = items.filter(i => {
        if (i.type === 'header') return true;
        return String(i.label).toLowerCase().includes(search.toLowerCase());
    });

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative flex-1 group min-w-[200px] flex flex-col gap-2">
            <Tooltip content={description} isDarkMode={isDarkMode}>
                <div className="flex items-center gap-1">
                    <label className={`block text-[14px] font-semibold cursor-help ${isDarkMode ? 'text-[#ffffff]' : 'text-[#201f1e]'}`}>{label}</label>
                    <HelpCircle className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`} />
                </div>
                <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between px-3 h-[32px] cursor-pointer transition-all border rounded text-[14px] ${isDarkMode ? 'bg-[#252423]' : 'bg-white'} ${isOpen ? 'border-b-2 border-b-[#0078d4] border-x-transparent border-t-transparent' : isDarkMode ? 'border-[#605e5c] hover:border-[#8a8886]' : 'border-[#8a8886] hover:border-[#201f1e]'}`}>
                    <div className="flex items-center gap-2 truncate">
                        <span className={isDarkMode ? 'text-white' : 'text-[#201f1e]'}>{selectedItem?.label}</span>
                        {selectedItem?.abbrev && <span className={`text-[12px] ${isDarkMode ? 'text-[#c8c6c4]' : 'text-[#605e5c]'}`}>({selectedItem.abbrev})</span>}
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </Tooltip>

            {isOpen && (
                <div className={`absolute top-[100%] left-0 right-0 z-[100] shadow-lg border rounded-b-sm overflow-hidden mt-1 ${isDarkMode ? 'bg-[#252423] border-[#484644]' : 'bg-white border-[#edebe9]'}`}>
                    <div className="p-2 border-b border-opacity-10 border-current">
                        <input autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} className={`w-full px-2 py-1 text-[14px] border-b outline-none bg-transparent ${isDarkMode ? 'text-white border-gray-600' : 'text-[#201f1e] border-gray-300'}`} />
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                        {filteredItems.map((item, idx) => {
                            if (item.type === 'header') {
                                const nextItem = filteredItems[idx + 1];
                                if (!nextItem || nextItem.type === 'header') return null;
                                return <div key={`header-${item.label}`} className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10 ${isDarkMode ? 'bg-[#1b1a19]/90 text-[#c8c6c4]' : 'bg-[#faf9f8]/90 text-[#605e5c]'}`}>{item.label}</div>;
                            }
                            return (
                                <div key={item.value} onClick={() => { onChange(item.value); setIsOpen(false); setSearch(''); }} className={`flex items-center justify-between px-3 py-2 text-[14px] cursor-pointer transition-colors ${value === item.value ? (isDarkMode ? 'bg-[#292827] text-white font-semibold' : 'bg-[#f3f2f1] text-[#201f1e] font-semibold') : (isDarkMode ? 'text-[#ffffff] hover:bg-[#323130]' : 'text-[#201f1e] hover:bg-[#edebe9]')}`}>
                                    <span>{item.label}</span>
                                    {value === item.value && <Check className="w-4 h-4 text-[#0078d4]" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
