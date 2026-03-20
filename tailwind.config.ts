import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        serif: ["DM Serif Display", "serif"],
      },
      colors: {
        green: {
          50: "#E1F5EE",
          500: "#1D9E75",
          700: "#0F6E56",
          900: "#085041",
        },
        brand: {
          amber: "#BA7517",
          "amber-light": "#FAEEDA",
          coral: "#D85A30",
          "coral-light": "#FAECE7",
          blue: "#185FA5",
          "blue-light": "#E6F1FB",
        },
      },
    },
  },
  plugins: [],
};
export default config;
