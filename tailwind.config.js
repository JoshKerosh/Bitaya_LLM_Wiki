import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Noto Sans", "sans-serif"],
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.10)",
      },
    },
  },
  plugins: [typography],
};
