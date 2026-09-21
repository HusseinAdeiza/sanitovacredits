module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b14",
        panel: "#0c1322",
        gold: "#e8b04b",
        golddim: "#b9873a",
        aqua: "#5eead4",
        water: "#16a34a",
        san: "#2563eb",
        waste: "#ea580c",
        health: "#dc2626",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
