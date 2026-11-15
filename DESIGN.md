---
name: Buildit
description: Bold yellow tool-brand world for the website, with the live 3D bookcase as its only picture.
colors:
  signal-yellow: "#FFC400"
  workshop-black: "#111111"
  press-black: "#2B2B2B"
  paper-white: "#FFFFFF"
  bench-grey: "#F2F2F2"
  sunk-grey: "#E6E6E6"
  pencil-grey: "#4A4A4A"
  band-grey: "#C9C9C9"
  footer-grey: "#BDBDBD"
  yellow-ink: "#3A3000"
  yellow-ink-deep: "#2B2400"
  pale-yellow: "#FFF7D6"
  doubt-red: "#C8211A"
  doubt-red-bg: "#FBE9E7"
typography:
  display:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(62px, 9.4vw, 172px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  headline:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 120px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  page-title:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(42px, 6vw, 60px)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 75"
  price:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(44px, 5.4vw, 84px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "'wdth' 75"
  title:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "clamp(22px, 2vw, 28px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0em"
    fontVariation: "'wdth' 85"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  lead:
    fontFamily: "Atkinson Hyperlegible, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "clamp(17px, 1.5vw, 20px)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    letterSpacing: "0.06em"
  button:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    letterSpacing: "0.04em"
  wordmark:
    fontFamily: "Archivo Variable, Archivo, Arial Narrow, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 110"
rounded:
  tag: "4px"
  control: "6px"
  panel: "8px"
  card: "10px"
spacing:
  page-gutter: "max(clamp(20px, 5vw, 64px), calc((100% - 1312px) / 2))"
  band-y: "clamp(56px, 8vw, 120px)"
  band-gap: "clamp(28px, 4vw, 48px)"
  row-y: "24px"
components:
  button-primary:
    backgroundColor: "{colors.workshop-black}"
    textColor: "{colors.signal-yellow}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.press-black}"
    textColor: "{colors.signal-yellow}"
  button-outline:
    textColor: "{colors.workshop-black}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "50px"
  button-outline-hover:
    backgroundColor: "{colors.workshop-black}"
    textColor: "{colors.signal-yellow}"
  button-big:
    padding: "16px 28px"
    height: "60px"
  button-small:
    padding: "8px 18px"
    height: "42px"
  field:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.workshop-black}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
    height: "52px"
  card:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.card}"
    padding: "28px 26px"
  guide-item:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.panel}"
  status-tag:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.workshop-black}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "5px 9px"
  step-number:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.workshop-black}"
    rounded: "{rounded.control}"
    padding: "10px 16px 4px"
  stage-caption:
    backgroundColor: "{colors.workshop-black}"
    textColor: "{colors.signal-yellow}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  footer:
    backgroundColor: "{colors.workshop-black}"
    textColor: "{colors.footer-grey}"
    padding: "28px"
---

# Design System: Buildit

Scope: the website (landing, sign-in, My guides, legal and message pages, header and footer), defined in `web/src/site.css` and scoped to `body:not([data-view="build"])`. The build screen keeps its own look in `web/src/styles.css` and is not described here, except where the website relies on it (see Layout and Components).

## Overview

**Creative North Star: "The Tool Brand"**

The page is the logo's yellow. It is loud and sure of itself, like the box of a power tool: a solid signal-yellow field set with huge black condensed capitals, solid black bands, and black buttons with yellow letters. Nothing is sketched, drawn or decorated. The only picture is the live 3D bookcase building itself on the yellow hero, with no frame around it.

Pages alternate solid colour fields stacked edge to edge: yellow for the hero, the closing call to action, sign-in and message pages and the header; black for the feature band, the honesty band and the footer, with yellow headings; white and light grey for reading sections (how it works, pricing, questions, legal). Structure inside a section comes from thick black rules and big type, never from boxes, grids or line art.

The world rejects the technical-drawing look tried before it: no line art, no drawing grids, no hand-drawn marks.

**Key Characteristics:**
- Solid full-bleed colour bands: yellow, black, white, light grey. No gradients, no textures.
- Display type is Archivo 900 at 75% width, uppercase, leading 0.88, at sizes up to 172px.
- Black buttons with yellow text, or a 2px black outline; 6px corners.
- Thick black rules: 4px over a list, 2px between its rows.
- The live 3D model is the only image; no photos, no illustrations.
- Red appears only for "may be wrong" and errors.

## Colors

Two brand colours at full strength, signal yellow and workshop black, carry everything; neutrals are flat greys for reading, and one red is held back for doubt.

### Primary
- **Signal Yellow** (`signal-yellow`): the brand field. Header background on every website page, hero, closing band, the whole sign-in and message pages. Also the text colour of black buttons, headings on black bands, the step-number blocks, status tags and the logo disc outside the header.
- **Workshop Black** (`workshop-black`): all text on yellow, white and grey; primary buttons; 2px outlines and rules; the feature band, honesty band and footer.
- **Press Black** (`press-black`): hover state of black buttons only.

### Neutral
- **Paper White** (`paper-white`): reading bands (how it works, pricing), cards, fields, guide items, legal page column, the warning demo on black.
- **Bench Grey** (`bench-grey`): page background and the questions band; menu item hover.
- **Sunk Grey** (`sunk-grey`): recessed surfaces.
- **Pencil Grey** (`pencil-grey`): secondary text on white and grey (sub-lines, step and FAQ answers, labels).
- **Band Grey** (`band-grey`): body text on black bands. **Footer Grey** (`footer-grey`): footer text; footer links are white.
- **Yellow Ink** (`yellow-ink`, `yellow-ink-deep`): secondary and fine text on the yellow field, where grey would look dirty.
- **Pale Yellow** (`pale-yellow`): hover fill of a guide item.

### Tertiary
- **Doubt Red** (`doubt-red`, background `doubt-red-bg`): the dashed "3D view may be wrong in this step" outline and its warning triangle, invalid fields, error text, the delete-account menu item.

### Named Rules
**The Two Colour Rule.** Every band is one solid colour: yellow, black, white or light grey. A section never mixes fields or fades between them.

**The Red Means Doubt Rule.** Doubt red is used only for "may be wrong", errors and destructive actions. Never decorative, never for emphasis.

**The Two Yellows Rule.** On the website yellow is the brand field. Inside the build screen and 3D view, yellow means "new in this step". Website copy that mentions the build screen may say so ("What's new is marked in yellow"); website surfaces never use yellow to mean "new".

## Typography

**Display Font:** Archivo Variable (fallback Archivo, Arial Narrow, system-ui), self-hosted via @fontsource-variable/archivo with the width axis.
**Body Font:** Atkinson Hyperlegible 400 and 700 (fallback system-ui), self-hosted.

**Character:** A narrow, heavy grotesk shouts the headings like stencilled lettering on a crate; Atkinson Hyperlegible keeps every paragraph easy to read on a phone held over the parts.

### Hierarchy
- **Display** (900, 75% width, `clamp(62px, 9.4vw, 172px)`, leading 0.88, uppercase): hero headline only. Phones under 600px: `clamp(56px, 17vw, 84px)`.
- **Headline** (900, 75% width, `clamp(48px, 7vw, 120px)`, leading 0.88, uppercase): band headings. Sign-in and message titles run near this size (`clamp(56px, 8vw, 120px)`).
- **Page title** (900, 75% width, `clamp(42px, 6vw, 60px)`, uppercase): legal page titles; card headings at 34px, legal subheads at 30px.
- **Price** (900, 75% width, `clamp(44px, 5.4vw, 84px)`): prices on the right of the price list; step numbers at `clamp(88px, 9vw, 140px)`.
- **Title** (800, 85% width, `clamp(22px, 2vw, 28px)`, leading 1.05, uppercase): h3 in bands, price-row names; FAQ questions at `clamp(20px, 2vw, 26px)`.
- **Body** (Atkinson 400, 16px, leading 1.5): running text. Band paragraphs 17-19px; lead `clamp(17px, 1.5vw, 20px)` at leading 1.55, max 31em. Paragraphs cap at 30-46em.
- **Label** (800, 13px, letter-spacing 0.06em, uppercase): labels, the stage caption, status tags (12px). Field labels 14px at 0.04em.
- **Button** (800, 16px, letter-spacing 0.04em, uppercase): all buttons; nav links use 800 at 15px in sentence case.
- **Wordmark** (900, 110% width, 26px, uppercase; 22px on phones, 20px small): "BUILDIT" beside the logo.

### Named Rules
**The Capitals Speak Rule.** Every heading, button, label and question is Archivo in uppercase; every sentence of explanation is Atkinson in sentence case. Body text is never set in Archivo, and headings never in Atkinson.

**The Narrow Display Rule.** Headings use the 75% width at weight 900 with leading 0.88 and `text-wrap: balance`. The 110% width belongs to the wordmark alone.

## Layout

Full-bleed bands stacked vertically, each with the same horizontal gutter: `max(clamp(20px, 5vw, 64px), (100% - 1312px) / 2)`, so content aligns to a 1312px column on wide screens while colour runs edge to edge. Bands use `clamp(56px, 8vw, 120px)` vertical padding and a `clamp(28px, 4vw, 48px)` gap; the feature band is tighter (`clamp(44px, 5vw, 72px)`).

- Hero: two columns from 960px (1.1fr text, 0.9fr live model), at least the viewport height minus the header; one column below. The canvas is `clamp(360px, 46vw, 720px)` tall.
- Feature band: 1 column, 2 from 720px, 4 from 1100px split by 1px #333 vertical rules.
- How it works: 3 columns from 860px, each under a 4px black top rule.
- Honesty band: two columns from 960px (1.1fr / 0.9fr).
- Price list and questions: full-width rows, 4px rule on top, 2px between rows; questions cap at 980px.
- Sign-in and messages: a 620px column on the yellow field; legal: a 780px reading column.
- Phones (600px and under): big buttons go full width; price rows stack; the stage caption moves left. Header padding tightens at 720px.

The website depends on `styles.css` for base layout: body font and size, `.wrap`, `.row`, `.btn.wide`, `.home` grid, `.skip` and `.sr`.

## Elevation & Depth

Flat. Depth comes from solid colour fields meeting edge to edge and from 2px black outlines, never from shadows. The one exception is the account menu, a popover that floats over the page with `0 18px 36px -14px rgba(0,0,0,.4)` and a 2px black border. The 3D model carries its own lighting and shadow on the yellow.

### Named Rules
**The Flat Field Rule.** Bands, cards, buttons and fields carry no shadow. Only floating menus may cast one.

## Shapes

Small, firm corners on a short scale: 4px for status tags and menu items, 6px for buttons, fields, nav links, step-number blocks, the stage caption and FAQ plus tiles; 8px for guide items, notices, empty states, the warning demo and the menu; 10px for cards. Outlines are 2px solid black; dashed 2px marks an old guide or an empty state, and dashed red marks doubt. Rules are 4px over a list and 2px between rows. The legal column has square corners under its 4px rule.

The logo is a disc with an allen-key L across it: white disc on the yellow header, yellow disc everywhere else (footer, favicon), the L in black (white in the footer).

## Components

### Buttons
Heavy, square-shouldered and loud.
- **Shape:** firm corners (6px), 2px border.
- **Primary:** workshop black with signal-yellow uppercase Archivo 800 text, `12px 22px`, 50px tall. Hover: press black.
- **Outline:** transparent with a 2px black border and black text. Hover: fills black with yellow text.
- **Sizes:** big (60px tall, `16px 28px`, 17px; full width on phones), small (42px, `8px 18px`, 15px; header Sign in).
- **Arrow:** primary "Try the example build" carries an inline SVG arrow after the label.
- **Focus:** from `styles.css`: 3px black outline at 2px offset plus a 7px yellow halo (the halo disappears on yellow; the black outline carries it there).
- **Disabled:** 40% opacity. Colour transitions 0.15s, removed for reduced motion.

### Status tags
Small signal-yellow chips with black uppercase label text (12-14px, 4px corners): "Coming soon", "Opening soon" in the price list, "Draft" on legal pages. They state a fact about availability, never introduce a heading.

### Cards / Containers
- **Corner Style:** 10px for cards, 8px for guide items.
- **Background:** paper white.
- **Border:** 2px solid black; dashed for old guides and empty states.
- **Internal Padding:** `28px 26px`.
- On sign-in and message pages the card dissolves: no background, no border, content sits straight on the yellow.

### Inputs / Fields
- **Style:** 2px black border, white fill, 6px corners, 18px Atkinson text, at least 52px tall.
- **Focus:** border stays black; the shared focus ring applies.
- **Error:** border turns doubt red; error text below in red, 14px.

### Navigation
Header on signal yellow on every website page: logo and wordmark left; nav links (Archivo 800 15px, black, 6px corners, hover 10% black tint) and a black small Sign in button right. Signed in, the account button is a black disc with a yellow initial; its menu has a 2px black border, 8px corners and the only shadow in the system.

### Footer
Workshop black, footer-grey 14px text, white links and white logo, `28px` padding with the page gutter.

### Price list
Rows under a 4px black rule, 2px rules between them; name and note on the left, the price in display weight at `clamp(44px, 5.4vw, 84px)` on the right.

### Questions
Native disclosure rows: uppercase Archivo 800 question, 2px rule below, a 40px black tile with a yellow plus (minus when open) on the right.

### Step number blocks
A big Archivo 900 numeral (`clamp(88px, 9vw, 140px)`) in black on a signal-yellow block with 6px corners, heading each step of "How it works".

### Stage caption
A black pill with yellow uppercase label text in the corner of the live 3D model, naming the current step ("Step 3 of 9 · Join the boards to the side"); the step title hides under 600px.

### Doubt callout
The build screen's real warning, shown on the honesty band: white panel, 8px corners, 22px padding, 18px text, a 2px dashed doubt-red outline inset 8px, and a red outline triangle icon.

## Do's and Don'ts

### Do:
- **Do** build every page from solid full-bleed bands of signal yellow, workshop black, paper white or bench grey, using the shared page gutter.
- **Do** set headings in Archivo 900 at 75% width, uppercase, leading 0.88; set body text in Atkinson Hyperlegible.
- **Do** use black buttons with yellow text for the main action and 2px black outline buttons for the second, both with 6px corners.
- **Do** structure lists with a 4px black rule on top and 2px rules between rows.
- **Do** put yellow headings on black bands, and yellow-ink text (not grey) for small print on yellow.
- **Do** let the live 3D model be the only picture, unframed on yellow.
- **Do** keep doubt red for "may be wrong", errors and destructive actions.

### Don't:
- **Don't** use line art, drawing grids, dimension lines or hand-drawn marks.
- **Don't** add photos, illustrations or stock imagery; the 3D model is the image.
- **Don't** add shadows to bands, cards, buttons or fields; only floating menus cast one.
- **Don't** use gradients, textures or tints between fields.
- **Don't** use yellow on the website to mean "new"; that meaning belongs to the build screen.
- **Don't** set body paragraphs in Archivo or in uppercase.
- **Don't** use red for emphasis or decoration.
