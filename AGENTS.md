# Project rules

- Keep the bag gift-box preview in a dedicated CSS-only component; it must not import three.js, so opening the bag stays lightweight.
- Pass the bag's existing catalogue to its gift-box row rather than subscribing again; one catalogue observer avoids duplicate mapping and refresh work.