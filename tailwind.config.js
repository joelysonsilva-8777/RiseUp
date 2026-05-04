/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1051px",
      xl: "1200px",
      "2xl": "1536px",
      mq1050: { max: "1050px" },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
