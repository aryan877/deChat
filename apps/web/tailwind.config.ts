import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Orange variations
          100: "#fff7ed",
          200: "#ffedd5",
          300: "#fed7aa",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          // Brown variations
          100: "#1c1917",
          200: "#292524",
          300: "#44403c",
          400: "#57534e",
          500: "#78716c",
          600: "#a8a29e",
          700: "#d6d3d1",
          800: "#e7e5e4",
          900: "#f5f5f4",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Warm brown variations
          100: "#431407",
          200: "#7c2d12",
          300: "#b45309",
          400: "#d97706",
          500: "#f59e0b",
          600: "#fbbf24",
          700: "#fcd34d",
          800: "#fde68a",
          900: "#fef3c7",
        },
        border: "hsl(var(--border))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          // Warm gray variations
          100: "#1c1917",
          200: "#292524",
          300: "#44403c",
          400: "#57534e",
          500: "#78716c",
          600: "#a8a29e",
          700: "#d6d3d1",
          800: "#e7e5e4",
          900: "#f5f5f4",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "hsl(var(--foreground))",
            a: {
              color: "hsl(var(--primary))",
              "&:hover": {
                color: "hsl(var(--primary))",
              },
            },
            code: {
              color: "hsl(var(--foreground))",
              backgroundColor: "hsl(var(--muted))",
              borderRadius: "0.25rem",
              padding: "0.15rem 0.3rem",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: "hsl(var(--muted))",
              borderRadius: "0.375rem",
              padding: "1rem",
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: "hsl(var(--muted-foreground))",
            },
            hr: {
              borderColor: "hsl(var(--border))",
            },
            "h1,h2,h3,h4,h5,h6": {
              color: "hsl(var(--foreground))",
            },
            "ul > li::marker": {
              color: "hsl(var(--muted-foreground))",
            },
            "ol > li::marker": {
              color: "hsl(var(--muted-foreground))",
            },
          },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config;
