import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d7fd",
          300: "#a5bcfb",
          400: "#8097f7",
          500: "#6172f3",
          600: "#4a50e8",
          700: "#3c3fcd",
          800: "#3236a6",
          900: "#2d3283",
          950: "#1c1e4c",
        },
        slate: {
          950: "#0a0f1e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
