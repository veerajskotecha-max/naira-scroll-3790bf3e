import type { CSSProperties, ReactNode } from "react";

/*
  Google Pay, PhonePe and Paytm on overlapping white discs, the way
  Shiprocket's own checkout button shows them. The owner asked for the badge
  the old bag carried, in the apps' own colours, on the buy buttons.

  Drawn as shapes rather than text so it looks the same on every phone: the
  old bag spelt PhonePe's "पे" in whatever Devanagari font the phone had.
  Decorative, so the button it sits in keeps its own name ("Buy Now",
  "Checkout").

  Shapes: the G is the four-colour mark from Google's Pay acceptance mark
  (assets/google-pay-mark.svg); PhonePe and Paytm are the Simple Icons marks
  in the brands' colours, Paytm's split into its navy "pay" and sky "tm".
  Sizes are inline styles because the shared Button sets [&_svg]:size-4 on
  every svg inside it, which would squash all three marks to 16px. The discs
  are rounded-[50%], not rounded-full: the site's corners are square by
  design and the theme sets every radius, "full" included, to 0px. These
  are the apps' marks, so they keep their own round shape.
*/

const G_MARK = [
  ["#4285F4", "M452.93,372c0-6.26-0.56-12.25-1.6-18.01h-80.48v33L417.2,387 c-1.88,10.98-7.93,20.34-17.2,26.58v21.41h27.59C443.7,420.08,452.93,398.04,452.93,372z"],
  ["#34A853", "M400.01,413.58c-7.68,5.18-17.57,8.21-29.14,8.21c-22.35,0-41.31-15.06-48.1-35.36 h-28.46v22.08c14.1,27.98,43.08,47.18,76.56,47.18c23.14,0,42.58-7.61,56.73-20.71L400.01,413.58z"],
  ["#FABB05", "M320.09,370.05c0-5.7,0.95-11.21,2.68-16.39v-22.08h-28.46 c-5.83,11.57-9.11,24.63-9.11,38.47s3.29,26.9,9.11,38.47l28.46-22.08C321.04,381.26,320.09,375.75,320.09,370.05z"],
  ["#E94235", "M370.87,318.3c12.63,0,23.94,4.35,32.87,12.85l24.45-24.43 c-14.85-13.83-34.21-22.32-57.32-22.32c-33.47,0-62.46,19.2-76.56,47.18l28.46,22.08C329.56,333.36,348.52,318.3,370.87,318.3z"],
] as const;

const PHONEPE = "M10.206 9.941h2.949v4.692c-.402.201-.938.268-1.34.268-1.072 0-1.609-.536-1.609-1.743V9.941zm13.47 4.816c-1.523 6.449-7.985 10.442-14.433 8.919C2.794 22.154-1.199 15.691.324 9.243 1.847 2.794 8.309-1.199 14.757.324c6.449 1.523 10.442 7.985 8.919 14.433zm-6.231-5.888a.887.887 0 0 0-.871-.871h-1.609l-3.686-4.222c-.335-.402-.871-.536-1.407-.402l-1.274.401c-.201.067-.268.335-.134.469l4.021 3.82H6.386c-.201 0-.335.134-.335.335v.67c0 .469.402.871.871.871h.938v3.217c0 2.413 1.273 3.82 3.418 3.82.67 0 1.206-.067 1.877-.335v2.145c0 .603.469 1.072 1.072 1.072h.938a.432.432 0 0 0 .402-.402V9.874h1.542c.201 0 .335-.134.335-.335v-.67z";

const PAYTM_PAY = "M0.232 9.4A.234.234 0 0 0 0 9.636v5.924c0 .132.096.238.216.241h1.09c.13 0 .237-.107.237-.24l.004-1.658H2.57c.857 0 1.453-.605 1.453-1.481v-1.538c0-.877-.596-1.484-1.453-1.484H.232zM9.264 9.4a.239.239 0 0 0-.237.241v2.47c0 .94.657 1.608 1.579 1.608h.675s.016 0 .037.004a.253.253 0 0 1 .222.253c0 .13-.096.235-.219.251l-.018.004-.303.006H9.739a.239.239 0 0 0-.236.24v1.09a.24.24 0 0 0 .236.242h1.75c.92 0 1.577-.669 1.577-1.608v-4.56a.239.239 0 0 0-.236-.24h-1.07a.239.239 0 0 0-.236.24c-.005.787 0 1.525 0 2.255a.253.253 0 0 1-.25.25h-.449a.253.253 0 0 1-.25-.255c.005-.754-.005-1.5-.005-2.25a.239.239 0 0 0-.236-.24zM5.26 9.406a.232.232 0 0 0-.238.226v1.023c0 .132.113.24.252.24h1.413c.112.017.2.1.213.23v.14c-.013.124-.1.214-.207.224h-.7c-.93 0-1.594.63-1.594 1.515v1.269c0 .88.57 1.506 1.495 1.506h1.94c.348 0 .63-.27.63-.6v-4.136c0-1.004-.508-1.637-1.72-1.637zM1.547 10.978h.678c.139 0 .25.115.25.256v.836a.253.253 0 0 1-.25.256h-.1c-.192.002-.386 0-.578 0zM6.217 12.955h.445c.139 0 .252.108.252.24v.932a.23.23 0 0 1-.014.076.25.25 0 0 1-.238.164h-.445a.247.247 0 0 1-.252-.24v-.933c0-.132.113-.239.252-.239Z";

const PAYTM_TM = "M15.85 8.167a.204.204 0 0 0-.04.004c-.68.19-.543 1.148-1.781 1.23h-.12a.23.23 0 0 0-.052.005h-.001a.24.24 0 0 0-.184.235v1.09c0 .134.106.241.237.241h.645v4.623c0 .132.104.238.233.238h1.058a.236.236 0 0 0 .233-.238v-4.623h.6c.13 0 .236-.107.236-.241v-1.09a.239.239 0 0 0-.236-.24h-.612V8.386a.218.218 0 0 0-.216-.22zM20.075 9.337c-.398 0-.762.15-1.042.395v-.124a.238.238 0 0 0-.234-.224h-1.07a.24.24 0 0 0-.236.242v5.92a.24.24 0 0 0 .236.242h1.07c.12 0 .217-.091.233-.209v-4.25a.393.393 0 0 1 .371-.408h.196a.41.41 0 0 1 .226.09.405.405 0 0 1 .145.319v4.074l.004.155a.24.24 0 0 0 .237.241h1.07a.239.239 0 0 0 .235-.23l-.001-4.246c0-.14.062-.266.174-.34a.419.419 0 0 1 .196-.068h.198c.23.02.37.2.37.408.005 1.396.004 2.8.004 4.224a.24.24 0 0 0 .237.241h1.07c.13 0 .236-.108.236-.241v-4.543c0-.31-.034-.442-.08-.577a1.601 1.601 0 0 0-1.51-1.09h-.015a1.58 1.58 0 0 0-1.152.5c-.291-.308-.7-.5-1.153-.5z";

const box = (width: number, height = width): CSSProperties => ({ width, height });

const Disc = ({ size, first = false, children }: { size: number; first?: boolean; children: ReactNode }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-[50%] border border-nf-ink bg-white"
    style={{ ...box(size), marginLeft: first ? 0 : -Math.round(size * 0.22) }}
  >
    {children}
  </span>
);

/** `size` is each disc's diameter in px; the three overlap by about a fifth. */
const UpiBadges = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <span data-upi-badges aria-hidden="true" className={`inline-flex shrink-0 items-center ${className}`}>
    <Disc size={size} first>
      <svg viewBox="283.4 284.4 171.3 171.3" style={box(Math.round(size * 0.58))}>
        {G_MARK.map(([fill, d]) => <path key={fill} fill={fill} d={d} />)}
      </svg>
    </Disc>
    <Disc size={size}>
      <svg viewBox="0 0 24 24" style={box(Math.round(size * 0.72))}>
        <path fill="#5F259F" d={PHONEPE} />
      </svg>
    </Disc>
    <Disc size={size}>
      <svg viewBox="0 8.1 24 7.8" style={box(Math.round(size * 0.8), Math.round(size * 0.8) * 0.325)}>
        <path fill="#002970" d={PAYTM_PAY} />
        <path fill="#00BAF2" d={PAYTM_TM} />
      </svg>
    </Disc>
  </span>
);

export default UpiBadges;
