/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        khaki: {
          50: "#faf8f2",
          100: "#f3ede0",
          200: "#e6d7be",
          300: "#d6be96",
          400: "#c4a370",
          500: "#b58c54",
          600: "#9e7445",
          700: "#7f5a38",
          800: "#694931",
          900: "#573d2b",
          950: "#301f15",
        },
        mumbai: {
          navy: "#0a192f",
          gold: "#d4af37",
          crimson: "#9b111e",
          slate: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};
