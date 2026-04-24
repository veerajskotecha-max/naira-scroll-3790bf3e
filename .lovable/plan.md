

## Plan: Replace Navbar Logo with Uploaded SVG

Replace the current `/logo.png` reference in the navbar with the newly uploaded `naira_logo.svg` file.

### Steps

1. **Copy the uploaded SVG into the project**
   - Copy `user-uploads://naira_logo.svg` → `src/assets/naira-logo.svg`

2. **Edit `src/components/Navbar.tsx`**
   - Import the SVG as an ES6 module: `import nairaLogo from "@/assets/naira-logo.svg";`
   - Replace `src="/logo.png"` with `src={nairaLogo}` on the centered logo `<img>` tag
   - Keep existing responsive height classes (`h-8 sm:h-10 md:h-12 lg:h-14`) and `alt="NAIRA"` unchanged

### Files
- **Create**: `src/assets/naira-logo.svg` (copied from upload)
- **Edit**: `src/components/Navbar.tsx`

