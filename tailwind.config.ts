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
        defaultBackground: "#05050c",
        defaultBackgroundSecond: "#12122a",
        ink: {
          950: "#05050c",
          900: "#0a0a16",
          800: "#12122a",
          700: "#1b1b38",
        },
        brand: {
          50: "#f3f0ff",
          100: "#e6e0ff",
          200: "#cfc2ff",
          300: "#b39bff",
          400: "#9772f9",
          500: "#7c4dff",
          600: "#6737e6",
          700: "#5227b8",
          800: "#3c1c85",
          900: "#271258",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-figtree)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxHeight: {
        "screen-60": "60vh",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px -12px rgba(124,77,255,0.55)",
        "glow-sm": "0 10px 30px -12px rgba(124,77,255,0.6)",
        lift: "0 24px 60px -20px rgba(0,0,0,0.85)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.08)",
      },
      transitionTimingFunction: {
        ios: "cubic-bezier(0.32, 0.72, 0, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.32,0.72,0,1) both",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.32,0.72,0,1) both",
        "float-soft": "floatSoft 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
