/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      position: {
        "sticky-col": "sticky",
      },
      inset: {
        "sticky-col-right": "0",
      },
      backgroundColor: {
        "sticky-col-bg": "#ffffff",
      },
      boxShadow: {
        "sticky-col-shadow": "-1px 0 0 rgba(0, 0, 0, 0.1)", // Optional: shadow to indicate stickiness
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".sticky-col": {
          position: "sticky",
          right: "0",
          backgroundColor: "#ffffff",
          boxShadow: "-1px 0 0 rgba(0, 0, 0, 0.1)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
