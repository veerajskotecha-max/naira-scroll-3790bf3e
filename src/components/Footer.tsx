import { useState } from "react";
import { Link } from "react-router-dom";

const shopLinks = [
  { label: "Dresses", to: "/shop/dresses" },
  { label: "Co-ord Sets", to: "/shop/coord-sets" },
  { label: "Fusion Sarees", to: "/shop/fusion-sarees" },
  { label: "Festive Collection", to: "/shop/festive" },
  { label: "New Arrivals", to: "/shop/new-arrivals" },
];

const careLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "Track Your Order", to: "/track-order" },
  { label: "Shipping & Delivery", to: "/shipping" },
  { label: "Return & Exchange Policy", to: "/returns" },
  { label: "Size Guide", to: "/size-guide" },
  { label: "FAQs", to: "/faqs" },
];

const policyLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
];


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
    className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200"
    style={{ backgroundColor: "hsla(0,0%,100%,0.08)" }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "hsla(0,0%,100%,0.18)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "hsla(0,0%,100%,0.08)")
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
        style={{ color: "hsl(0 0% 100%)" }}
      >
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="font-cormorant text-[14px] transition-colors duration-200"
              style={{ color: "hsl(0 0% 55%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 85%)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 55%)")}
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
      style={{ backgroundColor: "hsl(0 0% 10%)" }}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-10 md:gap-8 lg:gap-10 pb-12 md:pb-16">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3
              className="font-cormorant text-[24px] md:text-[28px] font-semibold tracking-[0.06em] mb-4"
              style={{ color: "hsl(0 0% 100%)" }}
            >
              NAIRA
            </h3>
            <p
              className="font-cormorant text-[14px] leading-relaxed mb-6 max-w-[280px]"
              style={{ color: "hsl(0 0% 55%)" }}
            >
              Where tradition meets contemporary. Premium Indo-Western fashion
              for the modern woman who embraces her heritage with style.
            </p>
            <div className="flex gap-3">
              <SocialIcon href="#" label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 75%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="hsl(0 0% 75%)" stroke="none" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(0 0% 75%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="hsl(0 0% 75%)">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

          {/* Explore */}
          {renderLinkColumn("Explore", exploreLinks)}

          {/* Newsletter */}
          <div>
            <h4
              className="font-cormorant text-[16px] font-semibold uppercase tracking-[0.1em] mb-5"
              style={{ color: "hsl(0 0% 100%)" }}
            >
              Newsletter
            </h4>
            <p
              className="font-cormorant text-[14px] leading-relaxed mb-5"
              style={{ color: "hsl(0 0% 55%)" }}
            >
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-2.5 rounded-md text-[13px] font-cormorant outline-none transition-colors duration-200"
                style={{
                  backgroundColor: "hsla(0,0%,100%,0.07)",
                  border: "1px solid hsla(0,0%,100%,0.12)",
                  color: "hsl(0 0% 85%)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "hsla(0,0%,100%,0.3)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "hsla(0,0%,100%,0.12)")}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-md font-cormorant text-[13px] font-medium uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: "hsl(155 18% 48%)",
                  color: "hsl(0 0% 100%)",
                }}
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 text-center"
          style={{ borderTop: "1px solid hsla(0,0%,100%,0.1)" }}
        >
          <p
            className="font-cormorant text-[13px]"
            style={{ color: "hsl(0 0% 40%)" }}
          >
            © 2026 NAIRA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
