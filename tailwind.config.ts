import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.10), 0 30px 80px rgba(0,0,0,0.55)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.35), 0 0 40px rgba(99, 102, 241, 0.25)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(1200px circle at 10% 0%, rgba(99, 102, 241, 0.25), transparent 60%), radial-gradient(900px circle at 80% 20%, rgba(16, 185, 129, 0.18), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
