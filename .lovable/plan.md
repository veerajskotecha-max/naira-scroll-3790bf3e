I’ll enhance the existing hero scroll sequence rather than rebuilding it, so the current model movement, New Arrivals reveal, card animation, and final model exit stay intact. (MAKE SURE YOU ARE ONLY EDITING CODE OF HERO SECTION ANIMATION AND NO WHERE ELSE - LAST TIME UPON MAKING THESE CHANGES WE HAD A PROBLEM WITH OUR SHOPIFY INTEGRATION- PLEASE BE VERY MINDFUL

Plan:

1. Add the handcrafted background layer to the New Arrivals transition area

- Reuse the same floral graphic from the About Us Handcrafted section: `background_image_flora.webp`.
- Place it inside the pinned New Arrivals wrapper as a lightweight absolute layer behind the model/cards.
- Keep the existing top-left floating flower and bottom-right floral decoration.
- Use opacity and transform only for animation, so it remains GPU-friendly and smooth.

2. Add a NAIRA logo reveal layer during the model travel

- Add a large, centered “NAIRA” wordmark behind the model but above the floral background.
- The logo will begin nearly hidden as the model enters the second section, then reveal itself during the model’s downward/shrink movement.
- The reveal will use performant properties only: `opacity`, `clip-path`/mask-like reveal, and slight vertical movement.
- It will fade back/soften before the New Arrivals heading and product cards become the focus, so it does not compete with products.

3. Integrate with the existing GSAP timeline

- Extend `HeroScrollyWrapper.tsx` with refs for:
  - floral background layer
  - NAIRA reveal layer
- On desktop:
  - initial state: background subtle/hidden, logo masked and low opacity
  - while model scales into the second section: floral pattern fades in and logo reveals smoothly
  - before/while New Arrivals heading appears: logo fades to a soft watermark or out
  - product card timing remains as-is
  - model still exits right as-is
- On mobile:
  - use a lighter/faster version so it does not feel heavy on the 390px viewport
  - keep the current shorter mobile scroll timing and avoid adding long delays

4. Preserve current hero animations

- No changes to `HeroSection.tsx` headline reveal, cursor glow, watermark parallax, or model image behavior inside the hero.
- No changes to the existing Shopify product loading or product cards.
- No changes to hero section animations outside the transition layer requested.

5. Performance safeguards

- Avoid scroll event listeners for the new effect; attach it directly to the existing GSAP ScrollTrigger timeline.
- Animate only compositor-friendly properties where possible.
- Keep the background image as one repeated layer, not multiple DOM graphics.
- Add `pointer-events: none`, `aria-hidden`, and `will-change` only on the animated layers.
- Ensure z-index order remains clean:

```text
New Arrivals section background color
  floral handcrafted pattern layer
  large NAIRA reveal layer
  existing decorative flowers
  product content / New Arrivals text / cards
  fixed model layer during transition
```

Files to update:

- `src/components/HeroScrollyWrapper.tsx`

Expected result:

- As the model travels into the second section, the handcrafted floral pattern appears in the background.
- A large NAIRA logo reveals smoothly behind the model, giving the transition a more premium editorial feel.
- Then New Arrivals text and product cards appear exactly in the current sequence, and the model exits right as before.
- Overall scroll remains smooth and fast, especially on mobile.