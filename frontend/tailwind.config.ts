import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          100: "#fde3e3",
          200: "#fbcaca",
          300: "#f7a3a3",
          400: "#f16f6f",
          500: "#e63946",
          600: "#d21f2c",
          700: "#af1720",
          800: "#8f171f",
          900: "#78181f",
          950: "#420a0d",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef1",
          200: "#d5dae0",
          300: "#b0bac5",
          400: "#8493a3",
          500: "#647588",
          600: "#4f5d6f",
          700: "#414c5a",
          800: "#39414c",
          900: "#1a1e24",
          950: "#101317",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.06), 0 1px 3px 0 rgb(0 0 0 / 0.08)",
        popover: "0 10px 40px -10px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
