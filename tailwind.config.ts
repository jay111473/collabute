import type { Config } from "tailwindcss";
import { PluginAPI } from "tailwindcss/types/config";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
      colors: {
        primary: "#7300FF",
        primary2: "#A154FF",
        secondary: "#ffffff",
        darkGray: "#18181B",
        darkGray2: "#29292E",
        grayBorders: "#27272A",
        lightGray: "#222226",
        background: "#09090b",
        primaryLowOpacity: "#daabff33",
        accent: "#D4B0FF",
        darkPrimary: "#C69DF8",
      },
      keyframes: {
        meteor: {
          "0%": {
            transform: "rotate(215deg) translateX(0)",
            opacity: "1",
          },
          "70%": {
            opacity: "1",
          },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
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
        shine: {
          "0%": { left: "-100%" },
          "100%": { left: "100%" },
        },
        "shine-rotate": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        fadeInRight: {
          "0%": {
            opacity: "0",
            transform: "translateX(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        slideInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(40px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        meteor: "meteor 5s linear infinite",
        shine: "shine 8s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "shine-rotate": "shine-rotate 3s linear infinite",
        fadeIn: "fadeIn 0.6s ease-out",
        fadeInUp: "fadeInUp 0.6s ease-out",
        fadeInDown: "fadeInDown 0.6s ease-out",
        fadeInLeft: "fadeInLeft 0.6s ease-out",
        fadeInRight: "fadeInRight 0.6s ease-out",
        scaleIn: "scaleIn 0.6s ease-out",
        slideInUp: "slideInUp 0.6s ease-out",
      },
      backgroundImage: {
        "gradient-conic": "conic-gradient(var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)"],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#ffffff',
            '[class~="lead"]': {
              color: '#d1d5db',
            },
            a: {
              color: '#3b82f6',
              textDecoration: 'underline',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            strong: {
              color: '#ffffff',
              fontWeight: '700',
            },
            'ol[type="A"]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a"]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="A" s]': {
              '--list-counter-style': 'upper-alpha',
            },
            'ol[type="a" s]': {
              '--list-counter-style': 'lower-alpha',
            },
            'ol[type="I"]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i"]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="I" s]': {
              '--list-counter-style': 'upper-roman',
            },
            'ol[type="i" s]': {
              '--list-counter-style': 'lower-roman',
            },
            'ol[type="1"]': {
              '--list-counter-style': 'decimal',
            },
            'ol > li': {
              position: 'relative',
              color: '#ffffff',
            },
            'ol > li::marker': {
              fontWeight: '400',
              color: '#6b7280',
            },
            'ul > li': {
              position: 'relative',
              color: '#ffffff',
            },
            'ul > li::marker': {
              color: '#6b7280',
            },
            hr: {
              borderColor: '#4b5563',
              borderTopWidth: 1,
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'italic',
              color: '#d1d5db',
              borderLeftWidth: '0.25rem',
              borderLeftColor: '#6b7280',
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            h1: {
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '2rem',
              lineHeight: '1.2',
            },
            h2: {
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '1.5rem',
              lineHeight: '1.3',
            },
            h3: {
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '1.25rem',
              lineHeight: '1.4',
            },
            h4: {
              color: '#ffffff',
              fontWeight: '600',
            },
            'figure figcaption': {
              color: '#9ca3af',
            },
            code: {
              color: '#fbbf24',
              backgroundColor: 'rgba(55, 65, 81, 0.8)',
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              color: '#d1d5db',
              backgroundColor: 'rgba(17, 24, 39, 0.8)',
              overflowX: 'auto',
              fontSize: '0.875em',
              fontWeight: '400',
              lineHeight: '1.7142857',
              marginTop: '1rem',
              marginBottom: '1rem',
              borderRadius: '0.5rem',
              paddingTop: '1rem',
              paddingRight: '1rem',
              paddingBottom: '1rem',
              paddingLeft: '1rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: 'inherit',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
            },
            'pre code::before': {
              content: 'none',
            },
            'pre code::after': {
              content: 'none',
            },
            table: {
              width: '100%',
              tableLayout: 'auto',
              textAlign: 'left',
              marginTop: '2em',
              marginBottom: '2em',
              fontSize: '0.875em',
              lineHeight: '1.7142857',
            },
            thead: {
              borderBottomWidth: '1px',
              borderBottomColor: '#4b5563',
            },
            'thead th': {
              color: '#ffffff',
              fontWeight: '600',
              verticalAlign: 'bottom',
              paddingRight: '0.5714286em',
              paddingBottom: '0.5714286em',
              paddingLeft: '0.5714286em',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderBottomColor: '#374151',
            },
            'tbody tr:last-child': {
              borderBottomWidth: '0',
            },
            'tbody td': {
              color: '#d1d5db',
              verticalAlign: 'baseline',
            },
            tfoot: {
              borderTopWidth: '1px',
              borderTopColor: '#4b5563',
            },
            'tfoot td': {
              verticalAlign: 'top',
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["dark"],
      textColor: ["dark"],
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function ({ addBase, theme }: PluginAPI) {
      const colors = theme("colors") as Record<
        string,
        { light: string; dark: string }
      >;

      const baseStyles: Record<
        string,
        Record<string, string | Record<string, string>>
      > = {};

      // Loop through the colors and set light and dark modes dynamically using the 'dark' class
      Object.entries(colors).forEach(([colorName, colorValue]) => {
        if (
          typeof colorValue === "object" &&
          colorValue.light &&
          colorValue.dark
        ) {
          baseStyles[`.bg-${colorName}`] = {
            backgroundColor: colorValue.light,
            ".dark &": {
              backgroundColor: colorValue.dark,
            },
          };
          baseStyles[`.text-${colorName}`] = {
            color: colorValue.light,
            ".dark &": {
              color: colorValue.dark,
            },
          };
        }
      });

      addBase(baseStyles);
    },
    function ({ addUtilities }: PluginAPI) {
      const newUtilities = {
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;

export default config;
