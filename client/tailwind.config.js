/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-body)', 'Poppins', 'Segoe UI', 'sans-serif'],
				display: ['var(--font-display)', 'Poppins', 'Segoe UI', 'sans-serif'],
				heading: ['var(--font-display)', 'Poppins', 'Segoe UI', 'sans-serif'],
				script: ['var(--font-script)', 'Poppins', 'cursive'],
			},
			letterSpacing: {
				luxe: '0.06em',
				'luxe-lg': '0.1em',
				'luxe-xl': '0.14em',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',

				/* ── Shop Genuine brand palette (from logo) ── */
				brand: {
					black: '#2A2A35',
					white: '#FFFFFF',
					gray: '#FFF5F9',
					silver: '#F1E1E9',
					dark: '#2A2A35',
					heading: '#2A2A35',
					paragraph: '#726A78',
					/* legacy "gold" keys now carry the signature pink */
					gold: '#F97316',
					goldLight: '#FB923C',
					goldDark: '#D95E08',
					pink: '#F97316',
					blue: '#1D4ED8',
					orange: '#F97316',
					green: '#8DC63F',
					success: '#3D9A5B',
					error: '#DC3545',
				},

				/* Signature magenta — the primary accent across the site.
				   Kept under the `gold` key so every existing text-gold /
				   bg-gold / border-gold usage picks up the new brand colour. */
				gold: {
					DEFAULT: '#F97316',
					light: '#FB923C',
					dark: '#D95E08',
				},
				pink: {
					DEFAULT: '#F97316',
					50: '#FFF5F9',
					100: '#FCE7F0',
					200: '#F9CADD',
					300: '#F49CC2',
					400: '#EE5F9E',
					500: '#F97316',
					600: '#CC1170',
					700: '#D95E08',
					800: '#8F0B4D',
					900: '#6B0839',
					light: '#FB923C',
					dark: '#D95E08',
				},
				blueberry: {
					DEFAULT: '#1D4ED8',
					light: '#3B82F6',
					dark: '#1E3A8A',
					50: '#EEF3FC',
				},
				tangerine: {
					DEFAULT: '#F97316',
					light: '#FB923C',
					dark: '#D95E08',
					50: '#FFF4EC',
				},
				leaf: {
					DEFAULT: '#8DC63F',
					light: '#A8D866',
					dark: '#6FA32B',
					50: '#F4FAEA',
				},

				/* Dark neutral used for headings/text — softened charcoal */
				noir: {
					DEFAULT: '#2A2A35',
					soft: '#3A3A48',
					mist: '#4C4C5C',
				},
				/* Soft blush surfaces replace the old ivory */
				ivory: {
					DEFAULT: '#FFF5F9',
					deep: '#FCE7F0',
					warm: '#FFF9FB',
				},
				stone: {
					DEFAULT: '#726A78',
					dark: '#4A4453',
				},
				line: '#F1E1E9',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 4px)',
				sm: 'calc(var(--radius) - 6px)',
			},
			boxShadow: {
				soft: '0 2px 12px rgba(249, 115, 22, 0.06)',
				card: '0 4px 20px rgba(42, 42, 53, 0.06)',
				'card-hover': '0 12px 32px rgba(249, 115, 22, 0.14)',
				pink: '0 8px 24px rgba(249, 115, 22, 0.22)',
			},
			backgroundImage: {
				'brand-gradient': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
				'brand-gradient-soft': 'linear-gradient(135deg, #FFF5F9 0%, #FCE7F0 100%)',
				'brand-sunset': 'linear-gradient(135deg, #F97316 0%, #FB923C 55%, #1D4ED8 100%)',
			},
			transitionDuration: {
				400: '400ms',
				600: '600ms',
				800: '800ms',
				1200: '1200ms',
			},
			transitionTimingFunction: {
				luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
			},
			keyframes: {
				'marquee-x': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(-50%)' },
				},
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'slow-zoom': {
					from: { transform: 'scale(1.04)' },
					to: { transform: 'scale(1)' },
				},
				shimmer: {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'spin-slow': {
					to: { transform: 'rotate(360deg)' },
				},
				'float-y': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
				},
				'pop-in': {
					from: { opacity: '0', transform: 'scale(0.94)' },
					to: { opacity: '1', transform: 'scale(1)' },
				},
			},
			animation: {
				'marquee-x': 'marquee-x 40s linear infinite',
				'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
				'slow-zoom': 'slow-zoom 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
				shimmer: 'shimmer 2s linear infinite',
				'spin-slow': 'spin-slow 20s linear infinite',
				'float-y': 'float-y 6s ease-in-out infinite',
				'pop-in': 'pop-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
};
