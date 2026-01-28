import type { Config } from 'tailwindcss';

export default {
    content: [
        "./src/**/*.{html,ts}",
        "./libs/ui/**/*.{html,ts}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
