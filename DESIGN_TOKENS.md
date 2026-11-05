# Watchly design tokens

## Palette

The app is dark-only. The full `buttercup` and `makara` scales live in
[`tailwind.config.js`](./tailwind.config.js).

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#1A1917` | Page background |
| `surface` | `#272320` | Cards and inputs |
| `line` | `#45403C` | Borders and dividers |
| `fg` | `#F3F3F1` | Primary text |
| `fg-secondary` | `#ADA79B` | Secondary text |
| `fg-muted` | `#948D7B` | Muted text; dimmest allowed |
| `brand` | `#F0AE26` | Primary actions and active navigation |
| `brand-hover` | `#DF9421` | Brand hover state |
| `on-brand` | `#1A1917` | Text on brand fills |
| `rating` | `#F6C54F` | Ratings |
| `danger-text` | `#FF5A5F` | Danger text |
| `danger` | `#E81818` | Danger outlines/fills |
| `on-danger` | `#FFFFFF` | Text on danger fills |

These semantic tokens are CSS variables in [`src/index.css`](./src/index.css)
and are exposed as Tailwind colors.

## Typography

Sora is self-hosted from `@fontsource/sora`, using latin weights 400, 500,
600, and 700. Page titles are 28px semibold, section titles are 20px
semibold, body text is 15px regular with 1.5 line-height, and metadata is
13px. No text is smaller than 12px and weights below 400 are not used.

## Shape and components

- `sm` is 6px, `md` is 10px, and `lg` is 16px. `rounded-full` is reserved for
  avatars and toggle switches.
- Cards use `surface` with a 1px `line` border and no shadow.
- Primary buttons use solid `brand` with `on-brand` text and `brand-hover` on
  hover. Secondary buttons are transparent with a `line` border and `fg`
  text. Danger buttons are outlined with `danger` and `danger-text`; only a
  final confirmation action may use a solid danger fill.
- Inputs use `surface` and `line`, with a `brand` focus border. All interactive
  elements have a visible 2px brand focus ring.
- Active navigation uses `brand`. Toggle-on uses a brand track and dark knob;
  toggle-off uses an outlined line track and muted knob.
- Stars and rating values use `rating`.
- Red is reserved for danger. Other status/action hues use brand or neutral
  tokens. Rating bars use buttercup shades and neutral for the lowest tier.
- The page, header, and bottom navigation use flat background/surface colors;
  gradients and colored glows are not used.

## Glass

The glass tokens and reusable `.glass` utility are defined in
[`src/index.css`](./src/index.css) and exposed through the Tailwind theme.
Glass is limited to the bottom navigation and the sticky top header. It uses
the `--glass-bg`, `--glass-bg-nav`, `--glass-bg-solid`, `--glass-border`,
`--glass-highlight`, `--glass-blur`, and `--glass-shadow` tokens. Neutral black
shadows are allowed for floating glass elements. The only gradient allowed is
the bottom fade behind the mobile navigation.

## Navigation

- Mobile navigation is a floating, icons-only glass bar below the `md`
  breakpoint: it is 60px tall, has 20px side margins, a 12px bottom offset, a
  400px maximum width, a 28px full-pill radius, and the nav glass background.
- Mobile tabs use House, CalendarBlank, BookmarksSimple, SealCheck, and
  UserCircle icons at 24px. Inactive icons are regular weight and use
  `fg-secondary`; the active icon is filled and the 16px by 3px top indicator
  uses `brand`. Each tab has a 48px minimum tap
  area and a screen-reader-only label.
- The mobile bar hides while the on-screen keyboard is open. The app wrapper
  reserves 92px of mobile bottom space so page content clears the floating bar.
- Desktop navigation is a text-only menu using Sora medium at 15px. Links use
  `fg-secondary`, active links use `brand` with a 2px underline, and the
  wordmark and search control remain in the header.
