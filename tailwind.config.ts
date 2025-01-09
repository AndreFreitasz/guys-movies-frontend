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
        defaultBackgroundSecond: "#1a1f2e",
      },
      fontFamily: {
        sans: ["Raleway", "sans-serif"],
      },
      maxHeight: {
        "screen-60": "60vh",
      },
    },
  },
  plugins: [],
};
export default config;
