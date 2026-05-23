<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hynox Campus UI Rules & Guidelines

All components and modules must strictly adhere to the following design system parameters:

## Color Palette
* **Primary**: `#2563EB` (Professional Blue)
* **Secondary**: `#0F172A` (Deep Navy)
* **Accent**: `#06B6D4` (Cyan Accent)
* **Background**: `#F8FAFC`
* **Surface**: `#FFFFFF`
* **Muted Surface**: `#E2E8F0`
* **Text Primary**: `#0F172A`
* **Text Secondary**: `#475569`
* **Success**: `#16A34A`
* **Warning**: `#F59E0B`
* **Error**: `#DC2626`

## Typography
* **Primary UI Font**: Geist Sans
* **Fallback / Supporting Font**: Inter
* **Style**: Clean, spacious, readable, medium font weights. Avoid oversized headings. Utilize modern SaaS spacing.

## UI Style Rules
* **Borders & Corners**: Soft shadows, `rounded-xl` corners, subtle borders.
* **Aesthetics**: Glassmorphism only where necessary. Avoid excessive gradients, neon colors, and gaming-style UI.
* **Layouts**: Responsive layouts are mandatory. Consistent spacing system.
* **Theme**: Use Tailwind CSS variables and centralized theme tokens. Maintain strict design consistency across all modules.

## Animation Rules
* Smooth transitions.
* Subtle hover states.
* Minimal Framer Motion usage; avoid over-animation.

## Dashboard Feel
* Resemble: Notion, Linear, Vercel, modern university ERP.
* Avoid: Gaming dashboards, crypto dashboards, flashy/neon admin panels.
