import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'my-primary': '#fEFADE',
        'my-secondary': '#D47B01',
        'my-tertiary': '#1e1e1e',
        'my-primary-complement': '#DEE2FE'
      }
    },
  },
  plugins: [],
} satisfies Config;
