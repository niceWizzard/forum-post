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
          "50": "#eefbfd",
          "100": "#d3f4fa",
          "200": "#ade8f4",
          "300": "#75d7eb",
          "400": "#35bcdb",
          "500": "#1a9fc0",
          "600": "#1880a2",
          "700": "#1c6e8c",
          "800": "#1e556c",
          "900": "#1d485c",
          "950": "#0e2e3e",
          DEFAULT: "#1c6e8c",
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
          "100": "#ffe3e6",
          "200": "#ffccd3",
          "300": "#ffa2b1",
          "400": "#fe6781",
          "500": "#f83b60",
          "600": "#e5194c",
          "700": "#c20e3f",
          "800": "#a20f3c",
          "900": "#8b1039",
          "950": "#4e031a",
          DEFAULT: "#e5194c",
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
