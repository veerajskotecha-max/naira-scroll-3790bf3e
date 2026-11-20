/**
 * The fidelity-locked reference prompts used for every Gilded Hour SKU.
 *
 * Every generation takes TWO reference images:
 *   IMAGE 1 — the product packshot (the thing that must NOT change)
 *   IMAGE 2 — a staging plate (the set or the body the product moves into)
 *
 * The prompt's only job is to make that split unambiguous: the product's
 * length, breadth, size, colour and finish are frozen; the set, light and
 * palette come wholly from the plate.
 *
 * Each SKU gets three frames, and no two repeat the same camera:
 *   1. ecom   — cream plaster block set. Compulsory for every SKU.
 *   2. worn   — on the body, plate chosen by category.
 *   3. angle  — the ecom set again from a deliberately different camera.
 */

export const MODEL = "nano_banana_pro";
export const ASPECT_RATIO = "4:5";
export const RESOLUTION = "2k";

export type Category = "Rings" | "Bracelets" | "Earrings" | "Necklaces";
export type Shot = "ecom" | "worn" | "angle";

/** Staging plates — empty sets and bare-skin model plates, generated once. */
export type PlateId = "ecom" | "hand" | "wrist" | "ear" | "neck";

/** Which body plate each category is worn on. */
export const WORN_PLATE: Record<Category, PlateId> = {
  Rings: "hand",
  Bracelets: "wrist",
  Earrings: "ear",
  Necklaces: "neck",
};

/** The lock. Identical on every frame of every SKU — this is the whole point. */
const LOCK = `PRODUCT — LOCKED, NOTHING HERE MAY CHANGE. It is a real photographed object being relocated, not redrawn. Keep the exact LENGTH, the exact BREADTH and thickness, the exact overall SIZE, and the exact proportion of every part to every other part. Keep the exact COLOUR — same metal tone, same warmth, same polish, same stone colours in the same order. Keep the exact COUNT and POSITION of every stone, link, prong, bead and bezel. Do not lengthen, shorten, fatten, thin, rescale, straighten, restyle, add or remove anything. No invented engraving, branding, logos or text. The product's silhouette in the output must overlay IMAGE 1.`;

const HOUSE = `Editorial e-commerce still life for a luxury petite jewellery house — clean, quiet, expensive. No text, no logos, no watermark, no extra props.`;

const ECOM_STAGING: Record<Category, string> = {
  Rings:
    "Stand the ring upright on the block's top face, tilted a few degrees to three-quarter so the band opening reads as a true circle and the centre stone catches the key light.",
  Bracelets:
    "Lay the bracelet on the block's top face in its natural relaxed curve, clasp visible, full length in frame.",
  Earrings:
    "Place the pair on the block's top face, side by side with a slight offset — one facing camera, one turned to three-quarter. Both identical to each other.",
  Necklaces:
    "Lay the chain on the block's top face in a soft open loop, pendant forward and resting flat as the sharpest point in frame.",
};

const ANGLE_STAGING: Record<Category, string> = {
  Rings:
    "Shoot low, near the block's top face, camera swung to the opposite side, so the band profile and setting height read. Do not repeat the straight three-quarter hero view.",
  Bracelets:
    "Shoot from directly overhead looking straight down, the full line and every bezel readable flat. Do not repeat the low three-quarter hero view.",
  Earrings:
    "Tight macro from a raised angle on ONE earring turned to show its side profile and closure, the second soft and out of focus behind. Do not repeat the flat pair view.",
  Necklaces:
    "Tight macro on the pendant from a low three-quarter angle, chain running out of focus into the background. Do not repeat the flat-lay loop.",
};

const WORN_STAGING: Record<Category, string> = {
  Rings:
    "Place the ring on the ring finger, sitting naturally at the base of the finger with the setting facing camera, the band wrapping the finger with correct contact and skin visible through the band opening. Scale it true and believable for that finger — petite, never oversized.",
  Bracelets:
    "Clasp the bracelet around the wrist, following the wrist's curve with a natural relaxed drape and a little slack, the way a real bracelet hangs under gravity. Keep every link. Scale it true for that wrist.",
  Earrings:
    "Place ONE earring on the near earlobe with the post or hinge correctly through the lobe and the weight hanging naturally. Scale it true against the ear — petite, never oversized.",
  Necklaces:
    "Fasten the necklace at the neck, chain following the collarbones with a natural gravity drape, pendant resting flat and centred at the hollow of the throat. Scale it true for that neck.",
};

export interface PromptInput {
  name: string;
  sku: string;
  category: Category;
  materials: string;
  shot: Shot;
}

export function buildPrompt({
  name,
  sku,
  category,
  materials,
  shot,
}: PromptInput): string {
  const product = `IMAGE 1 = the product: "${name}" (${sku}) — ${materials}.`;

  if (shot === "worn") {
    return `${product}
IMAGE 2 = the model plate: bare skin wearing no jewellery at all.

Move the product from IMAGE 1 onto the body in IMAGE 2.

${LOCK}

MODEL — COPY FROM IMAGE 2: same person, same skin tone and texture, same pose, same hair, same clothing, same background, same crop. Match its light direction, softness and shadow behaviour exactly. Add nothing else to the body — this piece is the only jewellery in frame.

WEARING: ${WORN_STAGING[category]}

Ground it with correct contact — a soft occlusion shadow where metal meets skin and a faint warm skin bounce into the underside of the metal. Metal reflects the scene; the object itself does not change. Sharp critical focus on the product, the body falling off gently.

${HOUSE} No other jewellery, no coloured nail polish, no face above the lips.`;
  }

  const staging = shot === "ecom" ? ECOM_STAGING : ANGLE_STAGING;

  return `${product}
IMAGE 2 = the set: a cream plaster display block on a warm ivory studio sweep.

Move the product from IMAGE 1 into the set from IMAGE 2.

${LOCK}

SET — COPY FROM IMAGE 2: same block, same surface, same palette, same light direction, same shadow hardness and length, same camera feel. Its empty top face is the resting place. Nothing else carries over.

STAGING: ${staging[category]}

Ground it with a correct contact shadow and a tight soft occlusion where it meets the block, cast in the same direction as every shadow in IMAGE 2. Metal reflects the scene and stones refract its key light; the object itself does not change. Sharp critical focus on the product, falling off into the sweep. Product in the middle third of the frame, never cropped.

${HOUSE}`;
}
