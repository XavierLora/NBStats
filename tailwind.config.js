/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/_includes/*.html", "./_site/*.html"],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")]
};