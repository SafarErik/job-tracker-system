import type { Config } from 'tailwindcss';
import spartanPreset from '@spartan-ng/brain/hlm-tailwind-preset';

export default {
    presets: [spartanPreset],
    darkMode: 'class',
    content: [
        "./src/**/*.{html,ts}",
        "./libs/ui/**/*.{html,ts}",
    ],
    theme: {
        // Container configuration - centered and padded
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
                xl: '3rem',
                '2xl': '4rem',
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1280px',
                '2xl': '1400px',
            },
        },
        extend: {
            // Typography - Inter as primary
            fontFamily: {
                sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },

            // Signature Border Radius (Soft Architecture)
            borderRadius: {
                lg: 'var(--radius)',                    // 14px - Standard
                xl: '0.875rem',                          // 14px - Buttons
                '2xl': '1.125rem',                       // 18px - Cards (Signature)
                '3xl': '1.5rem',                         // 24px - Dialogs/Modals
            },

            // Color System - Maps to CSS variables
            colors: {
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                primary: {
                    DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
                    foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
                    foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
                    foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
                    foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
                    foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
                    foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
                },
                card: {
                    DEFAULT: 'hsl(var(--card) / <alpha-value>)',
                    foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
                },
                // Chart colors for data visualization
                chart: {
                    1: 'hsl(var(--chart-1) / <alpha-value>)',
                    2: 'hsl(var(--chart-2) / <alpha-value>)',
                    3: 'hsl(var(--chart-3) / <alpha-value>)',
                    4: 'hsl(var(--chart-4) / <alpha-value>)',
                    5: 'hsl(var(--chart-5) / <alpha-value>)',
                },
            },

            // Animation & Motion (ease-out for premium feel)
            transitionTimingFunction: {
                'out-premium': 'cubic-bezier(0.33, 1, 0.68, 1)',
            },

            // Box Shadows for elevation
            boxShadow: {
                'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                'premium': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            },
        },
    },
    plugins: [],
} satisfies Config;