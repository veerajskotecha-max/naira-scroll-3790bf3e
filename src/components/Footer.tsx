import { useState } from "react";
import { Link } from "react-router-dom";
import nairaLogo from "@/assets/naira-logo-footer.svg";

const shopLinks = [
  { label: "Dresses", to: "/shop?category=dresses" },
  { label: "Co-ord Sets", to: "/shop?category=co-ord-sets" },
  { label: "Fusion Sarees", to: "/shop?category=fusion-sarees" },
  { label: "Festive Collection", to: "/shop?category=festive" },
  { label: "New Arrivals", to: "/shop?category=new" },
  { label: "Zircone Rings", to: "/jewellery/collections/rings" },
  { label: "Earrings", to: "/jewellery/collections/earrings" },
  { label: "Bracelets", to: "/jewellery/collections/bracelets" },
  { label: "Necklaces", to: "/jewellery/collections/necklaces" },
  { label: "Demi-Fine Jewellery", to: "/jewellery/collections/demi-fine-jewellery" },
  { label: "Anti-Tarnish Jewellery", to: "/jewellery/collections/anti-tarnish-jewellery" },
  { label: "American Diamond", to: "/jewellery/collections/american-diamond-jewellery" },
  { label: "18K Gold Plated", to: "/jewellery/collections/18k-gold-plated-jewellery" },
  { label: "Office Wear Jewellery", to: "/jewellery/collections/office-wear-jewellery" },
];

const careLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "The Journal", to: "/journal" },
  { label: "Ring Size Guide", to: "/journal/ring-size-guide-india" },
  { label: "Jewellery Care", to: "/journal/how-to-care-for-gold-plated-jewellery" },
  { label: "Anti-Tarnish Explained", to: "/journal/anti-tarnish-jewellery-guide" },
  { label: "American Diamond vs Moissanite", to: "/journal/american-diamond-vs-cubic-zirconia-vs-moissanite" },
  { label: "Choosing a Demi-Fine Brand", to: "/journal/best-demi-fine-jewellery-brands-india" },
  { label: "Return & Exchange Policy", to: "/exchange-return-policy" },
  { label: "FAQs", to: "/faqs" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];

// Brand palette derived from Naira logo
const SAGE = "hsl(162 14% 61%)";        // ~ #8aada4
const SAGE_DEEP = "hsl(162 18% 38%)";   // deeper sage for button
const CREAM = "hsl(33 33% 95%)";        // ~ #f9f5f0
const CREAM_MUTED = "hsla(33,33%,95%,0.78)";
const CREAM_FAINT = "hsla(33,33%,95%,0.6)";

const SocialIcon = ({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-8 h-8 flex items-center justify-center transition-colors duration-200"
    style={{ borderRadius: '50%', backgroundColor: "hsla(33,33%,95%,0.12)" }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "hsla(33,33%,95%,0.25)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "hsla(33,33%,95%,0.12)")
    }
  >
    {children}
  </a>
);

const Footer = () => {
  const [email, setEmail] = useState("");

  const renderLinkColumn = (title: string, links: { label: string; to: string }[]) => (
    <div>
      <h4
        className="font-cormorant text-[16px] font-semibold uppercase tracking-[0.1em] mb-5"
        style={{ color: CREAM }}
      >
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="font-cormorant text-[14px] transition-colors duration-200"
              style={{ color: CREAM_MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
              onMouseLeave={(e) => (e.currentTarget.style.color = CREAM_MUTED)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer
      className="w-full pt-[60px] md:pt-[70px] lg:pt-[80px] pb-6"
      style={{ backgroundColor: SAGE }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] gap-8 lg:gap-12 pb-12 md:pb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src={nairaLogo}
              alt="NAIRA"
              className="w-[100px] md:w-[120px] lg:w-[150px] h-auto max-w-full mb-4 brightness-0 invert"
            />
            <p
              className="font-cormorant text-[14px] leading-relaxed mb-6 max-w-[280px]"
              style={{ color: CREAM_MUTED }}
            >
              Where tradition meets the contemporary. Indo-Western fashion,
              handcrafted for the modern woman who carries her heritage with ease.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="https://www.instagram.com/nairaflore/" label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill={CREAM} stroke="none" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://wa.me/919561557935" label="WhatsApp">
                <svg width="16" height="16" viewBox="0 0 24 24" fill={CREAM}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="mailto:shopatnaira@gmail.com" label="Email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Shop */}
          {renderLinkColumn("Shop", shopLinks)}

          {/* Customer Care */}
          {renderLinkColumn("Customer Care", careLinks)}

          {/* Policies */}
          {renderLinkColumn("Policies", policyLinks)}

          {/* Newsletter */}
          <div>
            <h4
              className="font-cormorant text-[16px] font-semibold uppercase tracking-[0.1em] mb-5"
              style={{ color: CREAM }}
            >
              Newsletter
            </h4>
            <p
              className="font-cormorant text-[14px] leading-relaxed mb-5"
              style={{ color: CREAM_MUTED }}
            >
              Occasional letters from the atelier: new pieces, previews and early access.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // No mailing-list backend yet: route signups to the atelier's
                // WhatsApp line so every address actually reaches the team.
                const addr = email.trim();
                if (!addr) return;
                window.open(
                  `https://wa.me/919561557935?text=${encodeURIComponent(
                    `Hi Naira Flore, please add me to your updates list. Email: ${addr}`
                  )}`,
                  "_blank",
                  "noopener,noreferrer"
                );
                setEmail("");
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 rounded-md text-[13px] font-cormorant outline-none transition-colors duration-200 placeholder:text-[hsla(33,33%,95%,0.85)]"
                style={{
                  backgroundColor: "hsla(0,0%,100%,0.18)",
                  border: "1.5px solid hsl(33 33% 95%)",
                  color: CREAM,
                }}
                onFocus={(e) => (e.currentTarget.style.backgroundColor = "hsla(0,0%,100%,0.28)")}
                onBlur={(e) => (e.currentTarget.style.backgroundColor = "hsla(0,0%,100%,0.18)")}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-md font-cormorant text-[13px] font-medium uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: SAGE_DEEP,
                  color: CREAM,
                }}
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Popular Searches, SEO */}
        <div
          className="mt-12 pt-6"
          style={{ borderTop: "1px solid hsla(33,33%,95%,0.18)" }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.16em] mb-3"
            style={{ color: CREAM_FAINT }}
          >
            Popular Searches
          </p>
          <p
            className="text-[12px] leading-[1.9]"
            style={{ color: CREAM_FAINT }}
          >
            {[
              "Handcrafted Kurtas",
              "Chikankari Suits",
              "Cotton Anarkali",
              "Bridal Lehenga",
              "Zardosi Embroidery",
              "Silk Saree",
              "Made to Measure",
              "Custom Bridalwear",
              "Wedding Sets",
              "Festive Kurtas",
              "Sustainable Fashion",
              "Indian Occasion Wear",
              "Nashik Designer",
              "Slow Fashion India",
              "Hand Embroidered",
              "Luxury Prêt",
            ].map((term, i, arr) => (
              <span key={term}>
                <Link
                  to={`/shop?search=${encodeURIComponent(term)}`}
                  className="transition-colors duration-200 hover:opacity-100"
                  style={{ color: CREAM_FAINT }}
                >
                  {term}
                </Link>
                {i < arr.length - 1 && <span className="mx-2 opacity-40">·</span>}
              </span>
            ))}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 mt-8 text-center"
          style={{ borderTop: "1px solid hsla(33,33%,95%,0.22)" }}
        >
          <p
            className="font-cormorant text-[13px]"
            style={{ color: CREAM_FAINT }}
          >
            © 2026 NAIRA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
