/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Claude's signature warm accent colors
        claude: {
          50: "#FFF5F2",
          100: "#FFE8E0",
          200: "#FFD4C7",
          300: "#FFB5A0",
          400: "#FF8B66",
          500: "#D97757", // Claude's primary orange
          600: "#C15F3C", // Darker warm orange
          700: "#A64D2E",
          800: "#8B3F24",
          900: "#6B2F1A",
        },
        // Neutral colors for backgrounds and text
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },
        // Semantic colors
        background: {
          primary: "#FFFFFF",
          secondary: "#FAFAF9",
          tertiary: "#F5F5F4",
        },
        text: {
          primary: "#1C1917",
          secondary: "#44403C",
          tertiary: "#78716C",
          inverse: "#FFFFFF",
        },
        accent: {
          primary: "#D97757",
          hover: "#C15F3C",
          light: "#FFE8E0",
        },
        border: {
          light: "#E7E5E4",
          DEFAULT: "#D6D3D1",
          dark: "#A8A29E",
        },
      },
    },
  },
  plugins: [],
};
