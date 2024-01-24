import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'my-primary': '#D47B01',
        'my-primary-darken-01': '#aa6201',
        'my-primary-darken-02': '#7f4a01',
        'my-primary-darken-03': '#553100',
        'my-primary-darken-04': '#2a1900',
        'my-primary-lighten-01': '#fea730',
        'my-primary-lighten-02': '#fecd89',
        'my-primary-lighten-03': '#fff2e1',
        'my-secondary': '#01D47B',
        'my-secondary-darken-01': '#01aa62',
        'my-secondary-darken-02': '#017f4a',
        'my-secondary-darken-03': '#005531',
        'my-secondary-darken-04': '#002a19',
        'my-secondary-lighten-01': '#30fea7',
        'my-secondary-lighten-02': '#89fecd',
        'my-secondary-lighten-03': '#e1fff2',
        'my-tertiary': '#7B01D4',
        'my-tertiary-darken-01': '#6201aa',
        'my-tertiary-darken-02': '#4a017f',
        'my-tertiary-darken-03': '#310055',
        'my-tertiary-darken-04': '#19002a',
        'my-tertiary-lighten-01': '#a730fe',
        'my-tertiary-lighten-02': '#cd89fe',
        'my-tertiary-lighten-03': '#f2e1ff',
      }
    },
  },
  plugins: [],
} satisfies Config;
