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
          "50": "#eff9ff",
          "100": "#dbf0fe",
          "200": "#bfe6fe",
          "300": "#93d8fd",
          "400": "#60c0fa",
          "500": "#3ba3f6",
          "600": "#2586eb",
          "700": "#1d6fd8",
          "800": "#1e5aaf",
          "900": "#1e4d8a",
          "950": "#162e51",
          DEFAULT: "#162e51",
        },

        surface: {
          "50": "#f8f7f5",
          "100": "#e7e6e0",
          "200": "#cfccc0",
          "300": "#b0ad98",
          "400": "#8f8c72",
          "500": "#747258",
          "600": "#5c5b45",
          "700": "#4b4a3a",
          "800": "#3e3d31",
          "900": "#35352c",
          "950": "#040403",
          DEFAULT: "#040403",
        },

        danger: {
          "50": "#fff1f2",
          "100": "#ffe4e6",
          "200": "#ffccd2",
          "300": "#fea3ae",
          "400": "#fd6f84",
          "500": "#f62d4f",
          "600": "#e41a46",
          "700": "#c10f3b",
          "800": "#a11038",
          "900": "#8a1136",
          "950": "#4d0419",
          DEFAULT: "#e41a46",
        },

        on: {
          primary: "#FDF7FA",
          surface: "#FDF7FA",
          danger: "#FDF7FA",
        },
      },
    },
  },
  plugins: [],
};
export default config;
