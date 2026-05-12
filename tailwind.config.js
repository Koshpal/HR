/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          lightest: "#eff1f8",
          light: "#ccd3ea",
          mid: "#99a6d6",
          primary: "#334eac",
          darkest: "#081f5c",
        },
        secondary: {
          lightest: "#eeeeee",
          light: "#7bb5be",
          mid: "#2b8997",
          primary: "#17a2b8",
          darkest: "#117a8a",
        },
        black: {
          lightest: "#4d4d4d",
          light: "#333333",
          dark: "#1a1a1a",
          mid: "#262626",
          darkest: "#000000",
        },
        grey: {
          lightest: "#e0e0e0",
          light: "#b3b3b3",
          mid: "#999999",
          dark: "#808080",
          darkest: "#666666",
        },
        white: {
          lightest: "#eaeaea",
          light: "#f0f0f0",
          mid: "#f5f5f5",
          dark: "#fafafa",
          darkest: "#ffffff",
        },
        "semantic-red": {
          0: "#fff0f0",
          10: "#fa817a",
          20: "#f55a51",
          30: "#d5332a",
        },
        "semantic-orange": {
          0: "#fff6eb",
          20: "#f5a038",
          30: "#eb8a14",
        },
        "semantic-green": {
          0: "#e6f0ea",
          90: "#1b7a43",
        },
      },
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        "jakarta": ["Plus Jakarta Sans", "sans-serif"],
        sans: ["Plus Jakarta Sans", "Outfit", "system-ui", "sans-serif"],
      },
      fontSize: {
        "h1": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "h2": ["28px", { lineHeight: "36px", letterSpacing: "0", fontWeight: "600" }],
        "h3": ["22px", { lineHeight: "30px", letterSpacing: "0", fontWeight: "600" }],
        "h4": ["18px", { lineHeight: "26px", letterSpacing: "0.01em", fontWeight: "600" }],
        "h5": ["16px", { lineHeight: "24px", letterSpacing: "0.01em", fontWeight: "600" }],
        "h6": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "500" }],
        "subtitle": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "0.01em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "400" }],
        "button": ["14px", { lineHeight: "20px", letterSpacing: "0.06em", fontWeight: "600" }],
        "label": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "caption": ["11px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "400" }],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
}
