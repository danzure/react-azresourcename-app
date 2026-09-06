/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Segoe UI"', '"Segoe UI Web (West European)"', '-apple-system', 'BlinkMacSystemFont', 'Roboto', '"Helvetica Neue"', 'sans-serif'],
                mono: ['Cascadia Code', 'Consolas', 'ui-monospace', 'monospace'],
            },
            colors: {
                fluent: {
                    'bg-card': 'var(--colorNeutralBackground1)',
                    'bg-canvas': 'var(--colorNeutralBackground2)',
                    'bg-hover': 'var(--colorNeutralBackground3)',
                    'bg-subtle': 'var(--colorNeutralBackground4)',
                    'bg-darker': 'var(--colorNeutralBackground5)',
                    'fg-primary': 'var(--colorNeutralForeground1)',
                    'fg-secondary': 'var(--colorNeutralForeground2)',
                    'fg-tertiary': 'var(--colorNeutralForeground3)',
                    'stroke-strong': 'var(--colorNeutralStroke1)',
                    'stroke-subtle': 'var(--colorNeutralStroke2)',
                    'brand-bg': 'var(--colorBrandBackground)',
                    'brand-hover': 'var(--colorBrandBackgroundHover)',
                    'brand-pressed': 'var(--colorBrandBackgroundPressed)',
                    'brand-fg': 'var(--colorBrandForeground)',
                    'info-bg': 'var(--colorInfoBackground)',
                    'info-border': 'var(--colorInfoBorder)',
                    'info-text': 'var(--colorInfoText)',
                    'state-danger': 'var(--colorStateDanger)',
                    
                    // Category specific colors
                    'cat-blue-bg': 'var(--colorCategoryBlueBg)',
                    'cat-blue-fg': 'var(--colorCategoryBlueFg)',
                    'cat-orange-bg': 'var(--colorCategoryOrangeBg)',
                    'cat-orange-fg': 'var(--colorCategoryOrangeFg)',
                    'cat-green-bg': 'var(--colorCategoryGreenBg)',
                    'cat-green-fg': 'var(--colorCategoryGreenFg)',
                    'cat-purple-bg': 'var(--colorCategoryPurpleBg)',
                    'cat-purple-fg': 'var(--colorCategoryPurpleFg)',
                    'cat-cyan-bg': 'var(--colorCategoryCyanBg)',
                    'cat-cyan-fg': 'var(--colorCategoryCyanFg)',
                    'cat-teal-bg': 'var(--colorCategoryTealBg)',
                    'cat-teal-fg': 'var(--colorCategoryTealFg)',
                    'cat-red-bg': 'var(--colorCategoryRedBg)',
                    'cat-red-fg': 'var(--colorCategoryRedFg)',
                    'cat-magenta-bg': 'var(--colorCategoryMagentaBg)',
                    'cat-magenta-fg': 'var(--colorCategoryMagentaFg)',
                    'cat-yellow-bg': 'var(--colorCategoryYellowBg)',
                    'cat-yellow-fg': 'var(--colorCategoryYellowFg)',
                    'cat-neutral-bg': 'var(--colorCategoryNeutralBg)',
                    'cat-neutral-fg': 'var(--colorCategoryNeutralFg)',
                }
            },
            boxShadow: {
                'soft': '0 2px 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06)', // Standard card
                'depth': '0 8px 16px rgba(0, 0, 0, 0.08), 0 0 2px rgba(0, 0, 0, 0.04)', // Hover / active
                'flyout': '0 16px 32px rgba(0, 0, 0, 0.12), 0 0 4px rgba(0, 0, 0, 0.08)', // Panels / Modals
                'glow': '0 0 15px rgba(0, 120, 212, 0.3)',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #0f6cbd 0%, #115ea3 100%)',
                'primary-gradient-hover': 'linear-gradient(135deg, #115ea3 0%, #0f548c 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s cubic-bezier(0.1, 0.9, 0.2, 1) both',
                'slide-up': 'slideUp 0.2s cubic-bezier(0.1, 0.9, 0.2, 1) both',
                'scale-in': 'scaleIn 0.15s cubic-bezier(0.1, 0.9, 0.2, 1) both',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(6px)', opacity: '0' },
                    '100%': { transform: 'none', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.96)', opacity: '0' },
                    '100%': { transform: 'none', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
