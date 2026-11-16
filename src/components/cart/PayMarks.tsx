import type { CSSProperties } from "react";

/*
  The small marks the bag's trust block is drawn from: the card networks and a
  star row. Shapes, never text, so they look the same on every phone (the same
  reason UpiBadges draws GPay, PhonePe and Paytm). Sizes are inline styles: the
  shared Button squashes every svg inside it to 16px with [&_svg]:size-4.

  Visa is the Simple Icons wordmark in Visa blue, cropped to its own height.
  Mastercard is drawn here as its two circles and the lens where they meet, in
  the network's red, yellow and orange.
*/

const VISA =
  "M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z";

/** `height` in px; the wordmark is a little over three times as wide. */
export const VisaMark = ({ height = 10 }: { height?: number }) => (
  <svg data-mark="visa" viewBox="0 8.1 24 7.8" aria-hidden="true" style={{ height, width: Math.round((height * 24) / 7.8) }}>
    <path fill="#1A1F71" d={VISA} />
  </svg>
);

/** Two circles of radius 9.5, 11 apart; the lens is where they overlap. */
export const MastercardMark = ({ height = 15 }: { height?: number }) => (
  <svg data-mark="mastercard" viewBox="0 0 30 19" aria-hidden="true" style={{ height, width: Math.round((height * 30) / 19) }}>
    <circle cx="9.5" cy="9.5" r="9.5" fill="#EB001B" />
    <circle cx="20.5" cy="9.5" r="9.5" fill="#F79E1B" />
    <path fill="#FF5F00" d="M15 1.754A9.5 9.5 0 0 1 15 17.246A9.5 9.5 0 0 1 15 1.754Z" />
  </svg>
);

const STAR = "M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z";

const square = (size: number): CSSProperties => ({ width: size, height: size });

/**
 * Five stars filled to `rating` (4.5 is four and a half). Each star is a pale
 * star with a gold one over it, cut to its share, so a half star needs no
 * second drawing. Decorative: the rating is always written out beside it.
 */
export const Stars = ({ rating, size = 11 }: { rating: number; size?: number }) => (
  <span data-stars aria-hidden="true" className="inline-flex shrink-0 items-center gap-px">
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, rating - i));
      return (
        <span key={i} data-star-fill={fill} className="relative inline-block shrink-0" style={square(size)}>
          <svg viewBox="0 0 24 24" className="absolute inset-0 text-nf-gold/30" style={square(size)}>
            <path fill="currentColor" d={STAR} />
          </svg>
          <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <svg viewBox="0 0 24 24" className="text-nf-gold" style={square(size)}>
              <path fill="currentColor" d={STAR} />
            </svg>
          </span>
        </span>
      );
    })}
  </span>
);
