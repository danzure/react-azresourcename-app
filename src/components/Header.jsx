import { Moon, Sun } from 'lucide-react';

export default function Header({ isDarkMode, onToggleTheme }) {
    return (
        <header className={`h-[48px] flex items-center justify-between px-5 border-b z-50 fixed top-0 w-full ${isDarkMode ? 'bg-[#1b1a19] border-[#323130]' : 'bg-primary-gradient border-transparent text-white shadow-soft'}`}>
            <div className="flex items-center gap-4">
                <span className="font-semibold text-[16px] text-white tracking-tight">a-z-ure.namer</span>
            </div>
            <button
                onClick={onToggleTheme}
                className={`flex items-center gap-2 px-3 h-[32px] rounded border transition-all text-[13px] font-semibold ${isDarkMode ? 'bg-[#323130] border-[#484644] text-white hover:bg-[#484644]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
        </header>
    );
}
