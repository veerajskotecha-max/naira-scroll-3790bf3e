import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // Utility name kept as `cormorant` to preserve all existing class usages.
        // Velista is the brand serif; legacy Cormorant + Georgia provide graceful fallback.
        // Equivalent to var(--nf-font-display) in src/index.css; keep the two in sync.
        cormorant: ['Velista', '"Cormorant Garamond"', 'Georgia', 'serif'],
        // Naira Flore token stacks (single source of truth: src/index.css).
        "nf-display": "var(--nf-font-display)",
        "nf-editorial": "var(--nf-font-editorial)",
        "nf-label": "var(--nf-font-label)",
      },
      letterSpacing: {
        // Naira Flore tracking ladder; names are hundredths of an em
        // (tracking-nf-24 = 0.24em). Values live in src/index.css.
        "nf-4": "var(--nf-track-4)",
        "nf-8": "var(--nf-track-8)",
        "nf-10": "var(--nf-track-10)",
        "nf-16": "var(--nf-track-16)",
        "nf-18": "var(--nf-track-18)",
        "nf-20": "var(--nf-track-20)",
        "nf-24": "var(--nf-track-24)",
        "nf-25": "var(--nf-track-25)",
        "nf-28": "var(--nf-track-28)",
        "nf-30": "var(--nf-track-30)",
        "nf-32": "var(--nf-track-32)",
        "nf-34": "var(--nf-track-34)",
        "nf-40": "var(--nf-track-40)",
        "nf-50": "var(--nf-track-50)",
      },
      colors: {
        // Naira Flore primitives (single source of truth: the *-rgb /
        // *-hsl channel triplets in src/index.css). Channel syntax keeps
        // Tailwind opacity modifiers working: text-nf-ink/60 etc.
        nf: {
          ivory: "rgb(var(--nf-ivory-rgb) / <alpha-value>)",
          "ivory-deep": "rgb(var(--nf-ivory-deep-rgb) / <alpha-value>)",
          ink: "rgb(var(--nf-ink-rgb) / <alpha-value>)",
          gold: "rgb(var(--nf-gold-rgb) / <alpha-value>)",
          "gold-deep": "rgb(var(--nf-gold-deep-rgb) / <alpha-value>)",
          "gold-shadow": "rgb(var(--nf-gold-shadow-rgb) / <alpha-value>)",
          sage: "rgb(var(--nf-sage-rgb) / <alpha-value>)",
          blush: "rgb(var(--nf-blush-rgb) / <alpha-value>)",
          cream: "hsl(var(--nf-cream-hsl) / <alpha-value>)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      boxShadow: {
        // Naira Flore component token: jewel-card packshot shadow.
        // Must be a typed boxShadow entry; a bare shadow-[var(...)] arbitrary
        // value is parsed by Tailwind as a shadow COLOUR and emits no box-shadow.
        "nf-card": "var(--nf-card-shadow)",
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        DEFAULT: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
        "600": "600ms",
        "1200": "1200ms",
      },
      transitionTimingFunction: {
        // Enter curve for drawers and sheets (iOS-like, from Ionic).
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
        // Quick exit curve: accelerate away, get out of the way fast.
        "exit-in": "cubic-bezier(0.4, 0, 1, 1)",
        // Shared reveal curve used by scroll-in content.
        reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.26s cubic-bezier(0.22, 1, 0.36, 1)",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
