import { User, Coffee } from 'lucide-react';
import Tooltip from '../shared/Tooltip';

/**
 * Footer Component
 * 
 * Styled according to Microsoft Fluent UI 2 guidelines.
 * Displays copyright info, brand mark, support callout, and navigation links.
 */
export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto w-full border-t border-fluent-stroke-subtle bg-fluent-bg-canvas transition-colors duration-200" role="contentinfo">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-6 pt-2.5 sm:pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">

                {/* Left Side: Brand & Copyright */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Brand logo */}
                    <div className="flex items-center justify-center w-8 h-8 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95">
                        <img src="/atozazure-favicon-192x192.png" alt="atozazure logo" className="w-7 h-7 object-contain" />
                    </div>

                    <div className="flex flex-col justify-center gap-0.5">
                        <div className="flex items-center gap-1.5 leading-none">
                            <span className="font-semibold text-[13px] sm:text-[14px] text-fluent-fg-primary tracking-tight">
                                atozazure
                            </span>
                            <span className="text-[12px] text-fluent-fg-tertiary opacity-70 font-normal leading-none">|</span>
                            <span className="text-[12px] text-fluent-fg-tertiary font-medium leading-none">
                                Azure Governance Tools
                            </span>
                        </div>
                        <span className="text-[11px] text-fluent-fg-tertiary opacity-80 leading-none">
                            &copy; {currentYear} Daniel Powley. All rights reserved.
                        </span>
                    </div>
                </div>

                {/* Right Side: Navigation Links with Tooltip */}
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3.5">

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <Tooltip
                            content="Enjoying the toolkit? A coffee helps support development and keep the tools free for everyone! ☕"
                            position="top"
                            align="start-mobile-end-desktop"
                        >
                            <a
                                href="https://buymeacoffee.com/danielpowley"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium bg-fluent-cat-yellow-bg text-fluent-cat-yellow-fg hover:opacity-90 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg transition-all duration-150 active:scale-98 shadow-xs"
                            >
                                <Coffee className="w-3.5 h-3.5 text-fluent-cat-yellow-fg shrink-0 group-hover:-rotate-6 group-hover:scale-105 transition-transform duration-200 ease-in-out" />
                                <span>Buy me a Coffee</span>

                                {/* Subtle glowing indicator dot */}
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fluent-cat-yellow-fg opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fluent-cat-yellow-fg"></span>
                                </span>
                            </a>
                        </Tooltip>

                        <a
                            href="https://atozazure.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[12.5px] font-medium bg-fluent-cat-blue-bg text-fluent-cat-blue-fg hover:opacity-90 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fluent-brand-bg transition-all duration-150 active:scale-98 shadow-xs"
                        >
                            <User className="w-3.5 h-3.5 text-fluent-cat-blue-fg shrink-0 group-hover:-rotate-6 group-hover:scale-105 transition-transform duration-200 ease-in-out" />
                            <span>About me</span>
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
