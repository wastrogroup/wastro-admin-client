# Wastro --- Brand & Digital Design Specification

> **Brand positioning:** Premium medical apparel for professionals\
> **Brand promise:** Comfort / Performance / Trust\
> **Brand descriptor:** Medical Apparel \| Equipment \| More

------------------------------------------------------------------------

## 1. Brand Overview

Wastro is a premium medical apparel and equipment brand built for
healthcare professionals. The visual identity should communicate:

-   **Quality & safety** --- dependable products for professional
    environments.
-   **Comfort** --- apparel designed to feel good throughout demanding
    workdays.
-   **Premium fabric** --- a considered, high-quality product
    experience.
-   **Healthcare focus** --- a clear connection to medical professionals
    and their needs.

The overall look should feel modern, confident, minimal, and premium
rather than overly clinical or decorative.

## 2. Logo System

Use the supplied Wastro logo artwork as the source of truth. Do not
redraw, distort, stretch, or alter its proportions.

### Approved variations

1.  **Primary logo:** Black symbol and wordmark on a light background.
2.  **Reverse logo:** White symbol and wordmark on a charcoal/black
    background.
3.  **Icon / app icon:** The circular W symbol used independently where
    space is limited.

### Usage guidance

-   Use the primary logo on white or light-gray surfaces.
-   Use the reverse logo on charcoal or other sufficiently dark
    surfaces.
-   Use the icon on small-format applications such as app icons,
    favicons, and compact labels.
-   Keep clear space around the logo; do not crowd it with text or other
    elements.
-   Avoid placing the logo over visually busy photography.

## 3. Color Palette

The brand board defines four core colors:

  -----------------------------------------------------------------------
  Color                   Hex                     Recommended role
  ----------------------- ----------------------- -----------------------
  Charcoal Black          `#111111`               Primary text, dark
                                                  backgrounds, premium
                                                  panels

  Light Gray              `#E5E7EB`               Subtle surfaces,
                                                  borders, secondary
                                                  backgrounds

  White                   `#FFFFFF`               Main canvas, negative
                                                  space, reverse-logo
                                                  contrast

  Neon Lime               `#C7FF00`               Accent, small
                                                  highlights, active
                                                  states, calls to action
  -----------------------------------------------------------------------

### Color balance

-   Keep white and charcoal as the dominant colors.
-   Use light gray to create separation without adding visual noise.
-   Reserve neon lime for deliberate moments of emphasis. It should be
    an accent, not a large background color everywhere.
-   Check contrast before using lime for text, especially at small
    sizes.

## 4. Typography

The brand board specifies **Montserrat** as the primary type family.

-   **Montserrat Bold:** Headlines, strong labels, and high-emphasis
    statements.
-   **Montserrat Regular:** Body copy, navigation, descriptions, and
    supporting information.

The board also shows Arabic Regular and Arabic Bold styles. Use the
appropriate Arabic styles when producing Arabic-language brand material.

### Typographic character

-   Prefer clear, confident headings.
-   Use uppercase sparingly for navigation, short labels, and brand
    statements.
-   Keep body copy readable and comfortably spaced.
-   Maintain a consistent hierarchy between page titles, section
    headings, body text, and captions.

## 5. Visual Language & Brand Elements

The visual identity combines simple geometry, restrained layouts, and
recognizable healthcare-related cues.

The brand board identifies these themes:

-   Quality & Safety
-   Comfort
-   Premium Fabric
-   Healthcare Focused

Use these ideas in supporting iconography, product descriptions, and
content sections. Icons should be simple, consistent in stroke weight,
and easy to understand.

### Pattern / texture

The W symbol may be used as a subtle oversized brand pattern or
watermark.

-   Keep the pattern low contrast.
-   Avoid competing with product imagery or important text.
-   Use it as a background detail rather than a primary graphic.

## 6. Photography & Art Direction

The brand board's applications show medical professionals wearing navy
and deep-green scrubs, along with close-up fabric, garment labels, tags,
packaging, and brand collateral.

### Photography direction

-   Show medical apparel being worn by healthcare professionals.
-   Prioritize authentic, professional-looking people and natural poses.
-   Include close-up details of fabric, stitching, labels, and garment
    construction.
-   Use clean, uncluttered settings and controlled lighting.
-   Keep the apparel clearly visible and visually central.

### Image treatment

-   Favor neutral or softly lit backgrounds.
-   Use charcoal panels and small lime accents to connect photography to
    the identity.
-   Avoid overly saturated filters or busy stock-photo compositions.

## 7. Brand Voice & Messaging

The brand should sound professional, reassuring, direct, and human.

### Core message

**Premium medical apparel for professionals.**

### Supporting themes from the board

-   Comfort
-   Performance
-   Trust
-   Premium fabric
-   Exceptional comfort
-   Made for professionals
-   Built for those who care

Use concise, benefit-led copy. Avoid exaggerated claims or unsupported
medical, safety, or performance promises.

## 8. Digital Design Direction

For a Wastro website or digital storefront, translate the brand board
into a clean, premium shopping experience.

### Layout

-   Use a white or very light-gray page canvas.
-   Use charcoal for navigation, footer areas, and selected high-impact
    sections.
-   Introduce neon lime as a restrained highlight for key actions and
    active states.
-   Use generous spacing and clear section boundaries.
-   Keep product photography prominent and easy to inspect.

### Suggested page structure

1.  **Header:** Wastro logo, clear navigation, and a prominent shopping
    action.
2.  **Hero:** Strong medical-apparel image, concise headline, supporting
    sentence, and one primary call to action.
3.  **Product categories:** Clear routes into apparel and equipment.
4.  **Brand benefits:** Comfort, performance, quality, and healthcare
    focus.
5.  **Featured products:** Consistent product cards with clear imagery
    and product information.
6.  **Brand story:** A short explanation of Wastro and the professionals
    it serves.
7.  **Footer:** Logo, navigation, contact details, and the descriptor
    "Medical Apparel \| Equipment \| More".

### UI components

-   **Buttons:** Charcoal with white text as the default; use lime for
    selected primary actions or small action accents.
-   **Cards:** White surfaces with subtle gray borders or restrained
    shadows.
-   **Navigation:** Minimal, readable, and uncluttered.
-   **Badges:** Use only when they communicate useful product
    information.
-   **Forms:** Simple fields, clear labels, and visible focus states.

## 9. Physical Brand Applications

The board demonstrates the identity across:

-   Apparel labels and garment branding
-   Hang tags
-   Business cards
-   Packaging and presentation boxes
-   Brand photography
-   Website or digital brand surfaces

Maintain the same logo, palette, and typography across all touchpoints.
Ensure small logo applications remain legible when printed or
embroidered.

## 10. Do / Don't

### Do

-   Use the supplied logo variations correctly.
-   Keep the palette focused on charcoal, white, gray, and lime.
-   Use Montserrat consistently.
-   Let product and people photography carry the story.
-   Keep layouts spacious, direct, and professional.
-   Use lime as a controlled accent.

### Don't

-   Stretch, rotate, or recolor the logo arbitrarily.
-   Introduce unrelated colors without a brand-system decision.
-   Overuse neon lime.
-   Use decorative fonts that conflict with Montserrat.
-   Place important text over busy images.
-   Make unverified claims about product performance, fabric properties,
    or safety.

## 11. Design Tokens

``` css
:root {
  --wastro-charcoal: #111111;
  --wastro-light-gray: #E5E7EB;
  --wastro-white: #FFFFFF;
  --wastro-neon-lime: #C7FF00;

  --wastro-font: "Montserrat", sans-serif;
  --wastro-font-weight-regular: 400;
  --wastro-font-weight-bold: 700;
}
```

## 12. Source Notes

This specification is based on the supplied **Wastro Brand Board**
(one-page PDF). It captures the identity elements visible in that board
and translates them into practical guidance for digital and physical
applications.

The board does not specify exact font sizes, spacing scales, responsive
breakpoints, accessibility targets, product-category taxonomy, or
detailed e-commerce behavior. Those items should be defined during the
website or product-design phase rather than treated as existing brand
rules.
