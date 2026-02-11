/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['Cascadia Code', 'Consolas', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'soft': '0 2px 4px rgba(0, 0, 0, 0.04), 0 0 2px rgba(0, 0, 0, 0.06)', // Standard card
                'depth': '0 8px 16px rgba(0, 0, 0, 0.08), 0 0 2px rgba(0, 0, 0, 0.04)', // Hover / active
                'flyout': '0 16px 32px rgba(0, 0, 0, 0.12), 0 0 4px rgba(0, 0, 0, 0.08)', // Panels / Modals
                'glow': '0 0 15px rgba(0, 120, 212, 0.3)',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #0078d4 0%, #106ebe 100%)',
                'primary-gradient-hover': 'linear-gradient(135deg, #106ebe 0%, #005a9e 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'scale-in': 'scaleIn 0.2s ease-out forwards',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
