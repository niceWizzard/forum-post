import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "50": "var(--primary-color-50)",
          "100": "var(--primary-color-100)",
          "200": "var(--primary-color-200)",
          "300": "var(--primary-color-300)",
          "400": "var(--primary-color-400)",
          "500": "var(--primary-color-500)",
          "600": "var(--primary-color-600)",
          "700": "var(--primary-color-700)",
          "800": "var(--primary-color-800)",
          "900": "var(--primary-color-900)",
          "950": "var(--primary-color-950)",
          DEFAULT: "var(--primary-color)",
        },
        surface: {
          DEFAULT: "var(--surface-color)",
          accent: "var(--surface-color-accent)",
        },
        danger: {
          "50": "var(--danger-color-50)",
          "100": "var(--danger-color-100)",
          "200": "var(--danger-color-200)",
          "300": "var(--danger-color-300)",
          "400": "var(--danger-color-400)",
          "500": "var(--danger-color-500)",
          "600": "var(--danger-color-600)",
          "700": "var(--danger-color-700)",
          "800": "var(--danger-color-800)",
          "900": "var(--danger-color-900)",
          "950": "var(--danger-color-950)",
          DEFAULT: "var(--danger-color)",
        },

        on: {
          primary: "var(--on-primary-color)",
          surface: {
            DEFAULT: "var(--on-surface-color)",
          },
          danger: "var(--on-danger-color)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
