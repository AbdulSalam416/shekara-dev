/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },

    },
    backgroundImage :{
      'gradient-blue': 'linear-gradient(95deg, #155dfc 0%, #9810fa 100%)',
      'light': 'linear-gradient(95deg, #eff6ff 0%, #ffff 50%, #faf5ff 100%)'
    ,

    }
  },
  corePlugins: {

    backgroundOpacity: true,
  },
  plugins: [require('tailwindcss-animate')]};
