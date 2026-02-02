/** 
 * Tailwind Configuration for DevDiscuss
 * 
 * WHY WE CUSTOMIZE THIS:
 * - Default Tailwind is great, but we need custom animations
 * - Custom colors ensure brand consistency
 * - Extended utilities improve developer experience
 */
export default {
  // CONTENT: Tell Tailwind where to look for class usage
  // This enables "tree-shaking" - removing unused CSS
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      // ==========================================
      // CUSTOM ANIMATIONS
      // ==========================================
      // WHY: Tailwind doesn't include complex animations by default
      // These enable smooth micro-interactions throughout the app
      animation: {
        // Dropdown slide animation - smooth appearance
        "slide-down": "slideDown 0.2s ease-out",
        // Fade in for page transitions
        "fade-in": "fadeIn 0.3s ease-out",
        // Subtle pulse for loading states
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        // Bounce for attention-grabbing elements
        "bounce-soft": "bounceSoft 0.5s ease-out",
        // Spin for loading spinners
        "spin-slow": "spin 1.5s linear infinite",
      },

      // KEYFRAMES: Define the actual animation steps
      // WHY: CSS animations need start/end states defined
      keyframes: {
        slideDown: {
          "0%": { 
            opacity: "0", 
            transform: "translateY(-10px)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0)" 
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },

      // ==========================================
      // CUSTOM SHADOWS
      // ==========================================
      // WHY: Custom shadows create depth and visual hierarchy
      // Default shadows are often too harsh
      boxShadow: {
        // Soft shadow for cards
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        // Elevated shadow for hover states
        "elevated": "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
        // Glow effect for buttons
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-purple": "0 0 20px rgba(147, 51, 234, 0.5)",
      },

      // ==========================================
      // BACKDROP BLUR (glassmorphism)
      // ==========================================
      // WHY: Creates frosted glass effect for modern UI
      backdropBlur: {
        xs: "2px",
      },

      // ==========================================
      // TRANSITION TIMING
      // ==========================================
      // WHY: Custom timing creates more natural animations
      transitionDuration: {
        "250": "250ms",
      },
    },
  },

  plugins: [],
};
