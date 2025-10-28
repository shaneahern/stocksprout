import type { Config } from "tailwindcss";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  darkMode: ["class"],
  content: [
    resolve(__dirname, "client/index.html"), 
    resolve(__dirname, "client/src/**/*.{js,jsx,ts,tsx}"),
    resolve(__dirname, "client/**/*.html")
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "20px",
        badge: "var(--badge-radius)",
      },
      fontSize: {
        'xs-7': '7px',
        'xs-8': '8px',
        'xs-9': '9px',
        'xs-10': '10px',
        'xs-11': '11px',
        'xs': '12px',
        'sm-13': '13px',
        'sm': '14px',
        'base-15': '15px',
        'base': '16px',
        'lg-20': '20px',
        'xl-40': '40px',
      },
      height: {
        'button': 'var(--button-height)',
        'form-field': 'var(--form-field-height)',
        'progress': 'var(--progress-height)',
      },
      spacing: {
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '20px': '20px',
        '24px': '24px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        figma: {
          green: {
            timeline: "var(--green-timeline)",
            light: "var(--green-light)",
            dark: "var(--green-dark)",
            primary: "var(--green-primary)",
          },
          blue: {
            primary: "var(--blue-primary)",
            light: "var(--blue-light)",
          },
          yellow: {
            gold: "var(--yellow-gold)",
          },
          gray: {
            light: "var(--gray-light)",
            medium: "var(--gray-medium)",
            background: "var(--gray-background)",
            "background-alt": "var(--gray-background-alt)",
            "background-light": "var(--gray-background-light)",
            border: "var(--gray-border)",
            "border-alt": "var(--gray-border-alt)",
            "border-light": "var(--gray-border-light)",
          },
          indicator: {
            green: "var(--green-indicator)",
          },
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        celebrationPulse: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "celebration-pulse": "celebrationPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
