import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        overlay: "var(--bg-overlay)",
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
          hover: "var(--border-hover)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          glow: "var(--accent-glow)",
          dim: "var(--accent-dim)",
        },
        data: {
          positive: "var(--data-positive)",
          negative: "var(--data-negative)",
          neutral: "var(--data-neutral)",
          warning: "var(--data-warning)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
      },
      spacing: {
        "page-x": "var(--space-page-x)",
        "page-y": "var(--space-page-y)",
        section: "var(--space-section)",
        card: "var(--space-card)",
        "card-gap": "var(--space-card-gap)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [],
}
export default config
