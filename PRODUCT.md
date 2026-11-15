# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People in the UK and Germany assembling flat-pack furniture at home. The primary visitor is mid-build or about to start: the box is open on the floor, the paper manual is next to them, the phone is in their hand, and they are stuck on a drawing or want to avoid a mistake. Later audiences (people deciding before they buy, furniture makers and retailers) are not the first audience of the website.

## Product Purpose
Buildit turns a paper flat-pack assembly manual into a 3D guide: every board and fitting labelled, each step animated, viewable from any side, so a person can match the screen to the real parts on their floor (which board, which way it faces, which hole, which screw). Success is fewer assembly mistakes and less frustration.

## Positioning
A 3D view built from the person's own manual that is honest about uncertainty: it marks the steps where the 3D may be wrong and shows the original manual page beside each step. Accuracy matters more than polish; a wrong instruction is worse than a missing one.

## Operating Context
Used on a phone, on the floor or at a table, in ordinary room light, often with one hand free. The paper manual stays alongside. Scanning is done with the phone camera, one page at a time, or by uploading the maker's PDF. A long manual can take ten minutes or more to read.

## Capabilities and Constraints
- Example guide (bookcase) is free and needs no account. Live 3D preview of it can be embedded anywhere.
- Accounts by emailed sign-in link (no password). Scanning own manuals is early access (admins only) until payments exist.
- Planned business: free curated library of popular products (coming soon); paid scans per manual, prices planned £1.99 / £2.99 / £4.99 by page count (placeholders, may change). No subscription. No free scans.
- Features: parts bench with a picture and count per part, actual-size hardware view calibrated with a bank card, manual page beside each step, "Stuck on this step?" questions, a warning on steps that may be wrong.
- Stack: plain JS ES modules, Vite, Three.js, Express. Fonts self-hosted (no Google Fonts, German privacy law). Strict CSP: no external scripts, fonts or images.
- English now; German version planned.

## Brand Commitments
- Name: Buildit. Logo direction chosen by the user: a symbol only, with the name shown in plain text beside it. It must be simple, sophisticated and easy to remember.
- Brand-neutral: independent, not connected with any furniture brand. No IKEA branding, no tracing of IKEA manual artwork, no imitation of any maker's look.
- Must not look like a generic AI-generated website. The user finds the current look not good; no part of the current visual style is binding.
- In the 3D view and build screen, marker yellow means "new in this step".
- UI copy: plain, short, active voice.

## Evidence on Hand
- The example bookcase guide (`web/public/examples/bookcase.json`) and its live 3D renderer.
- No customers, testimonials, reviews, press or usage numbers exist. Do not invent any.
- No product photography exists.

## Product Principles
- Match the real object: everything shown should help a person find the same thing on their floor.
- Honest over impressive: say what may be wrong and point to the paper manual.
- Plain and calm: short words, no hype, no pressure.
- Phone first: the person is holding the phone near the parts.
