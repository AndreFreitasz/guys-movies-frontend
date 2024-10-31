import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        defaultBackground: "#020617",
      },
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;