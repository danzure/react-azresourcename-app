export default function Tooltip({ content, children, isDarkMode }) {
    return (
        <div className="relative group/tooltip w-full flex flex-col gap-1">
            {children}
            <div className={`absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block w-56 p-2 text-[12px] rounded-sm shadow-xl z-50 pointer-events-none border ${isDarkMode ? 'bg-[#252423] text-white border-[#484644]' : 'bg-white text-[#201f1e] border-[#edebe9]'}`}>
                {content}
            </div>
        </div>
    );
}
