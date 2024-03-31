/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/_includes/*.html", "./_site/*.html", "./_site/**/*.html"],
  theme: {
    extend: {
      colors: {
        'backgroundColor': "#212124",
      },
      gridTemplateColumns: {
        'auto-fill-325': 'repeat(auto-fill, minmax(300px, 1fr));',
      },
    }
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#ffffff",
          "secondary": "#ff00ff",
          "accent": "#00ffff",
          "neutral": "#212124",
          "base-100": "#161618",
          "info": "#0000ff",
          "success": "#00ff00",
          "warning": "#00ff00",
          "error": "#ff0000",
        },
        darktheme: {
          "primary": "#161618",
          "secondary": "#4338ca",
          "accent": "#c8102e",
          "neutral": "#ffffff",
          "base-100": "#f6f6f6",
          "info": "#0000ff",
          "success": "#00ff00",
          "warning": "#00ff00",
          "error": "#ff0000",
        }
      }
    ]
  },
  plugins: [require("daisyui")]
};