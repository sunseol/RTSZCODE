# Medieval RTS Design System

## Intent
The interface uses a compact medieval command-table style: dark wood panels, warm metal borders, parchment text, and restrained controls that leave the 3D battlefield unobstructed.

## Tokens
- Surface: `rgba(40, 28, 16, 0.92)` to `rgba(25, 18, 10, 0.92)`
- Border: `#6b4a2b`, raised border `#8a6a44`, active border `#c9962f`
- Text: `#f0e6d2`, muted `#c9b896`, body-muted `#d9c8a6`
- Gold accent: `#ffd54a`; food accent: `#ff8a5b`; danger accent: `#ff5b5b`
- Radius: panels and primary buttons `8px`; compact controls `5px`; flag corners `3px`
- Shadow: outer `0 4px 14px rgba(0, 0, 0, 0.6)`, inset rim `inset 0 1px 0 rgba(255, 220, 160, 0.15)`
- Type: system UI with Korean fallback `"Segoe UI", "Malgun Gothic", sans-serif`

## Components
- HUD panel: absolute-positioned dark wood surface, metal border, compact padding, blur only for legibility.
- Primary command button: bronze gradient, active gold border, transform hover only.
- Build button: compact full-width command row with clear affordance and disabled opacity.
- Minimap: fixed-format bottom-left panel with title, stable canvas size, and no layout shift.
- Start overlay: centered scroll-safe command sheet with title, short instructions, settings, and one primary action.
- Nation option: button with a CSS-rendered symbolic flag, Korean label, selected state via gold border and subtle lift.
- Campaign map: scroll-safe command sheet that pairs a framed peninsula image with absolute battle markers, a scenario detail ledger, and one primary `해당 시나리오 경험하기` action.
- Campaign HUD: compact top-center objective panel that names the active historical battle without blocking battlefield controls.
- End result card: centered status panel that states `승리` or `패배` as the highest-priority text before explanatory copy.

## Responsive Rules
- Desktop keeps HUD at the four corners and start settings in a dense grid.
- Campaign map uses a two-column map/detail layout on desktop and stacks map above detail on tablet and mobile.
- Tablet and mobile allow the start overlay to scroll inside the viewport.
- Mobile hides the hint, compacts minimap dimensions, and prevents top HUD overlap.

## Accessibility
- Settings choices are native buttons with `aria-pressed`.
- Start actions are explicit `type="button"`.
- Korean labels must not rely on flag color alone; every flag has a visible nation name.
