

## Luxury Fashion Header Implementation

### Files to Modify
1. **index.html** — Add Cormorant Garamond Google Font link, update title to "NAIRA"
2. **tailwind.config.ts** — Add `font-cormorant` family, `marquee` keyframe and animation
3. **src/index.css** — Add marquee hover-pause utility
4. **src/App.tsx** — Add Header component above Routes

### Files to Create
1. **src/components/AnnouncementBar.tsx** — Sage green (#AEBDB6) strip with CSS marquee animation. Text duplicated for seamless loop. Pauses on hover. Responsive height (40/36/34px).

2. **src/components/Navbar.tsx** — Three-column flex layout on off-white (#F4F1ED). Left: HOME, SHOP, ABOUT, MADE FOR YOU links with center-out underline hover. Center: uploaded logo image, linked to "/". Right: CONTACT link + Search, User, ShoppingBag Lucide icons with opacity hover. Scroll listener adds backdrop-blur and shadow when scrolled.

3. **src/components/MobileMenu.tsx** — Full-screen slide-in overlay from left (300ms ease). All nav items stacked vertically + icons at bottom. Uses Sheet-like pattern but custom for left slide.

4. **src/components/Header.tsx** — Combines AnnouncementBar + Navbar in a sticky `fixed top-0 w-full z-50` wrapper. Passes scroll state to Navbar.

5. **src/pages/Index.tsx** — Add `pt-[116px] md:pt-[100px] lg:pt-[120px]` to account for fixed header height.

### Key Technical Details
- Marquee: CSS-only using `@keyframes marquee` translating duplicated text from 0% to -50%
- Underline hover: `::after` pseudo-element with `scaleX` transform from center
- Sticky blur: `useEffect` scroll listener toggling `backdrop-blur-md` and `shadow-sm`
- Mobile: hamburger (Menu icon) left, logo center, cart right — hidden desktop nav
- Logo: referenced as `/user-uploads/logo.webp`
- All icons from `lucide-react`: Search, User, ShoppingBag, Menu, X

