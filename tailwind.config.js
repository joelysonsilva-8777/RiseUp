/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      mq1050: {
        raw: "screen and (max-width: 1050px)",
      },
      lg: {
        raw: "screen and (min-width: 1051px) and (max-width: 1200px)",
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
};
