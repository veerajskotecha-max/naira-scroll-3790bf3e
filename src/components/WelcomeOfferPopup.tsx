import { useEffect, useState } from "react";
import { X, Check, Mail, MessageCircle } from "lucide-react";
import {
  WELCOME_PROMO_CODE,
  hasSeenPromoPopup,
  markPromoPopupSeen,
  savePromoLead,
  setPromoCode,
} from "@/lib/promo";

type Channel = "email" | "whatsapp";

const isValid = (channel: Channel, value: string) =>
  channel === "email"
    ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
    : /^\+?[0-9\s-]{10,15}$/.test(value.trim());

const WelcomeOfferPopup = () => {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<Channel>("email");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (hasSeenPromoPopup()) return;
    const timer = window.setTimeout(() => setOpen(true), 9000);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    markPromoPopupSeen();
    setOpen(false);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid(channel, value)) {
      setError(channel === "email" ? "Please enter a valid email address." : "Please enter a valid phone number.");
      return;
    }
    setError("");
    savePromoLead({ channel, value: value.trim() });
    setPromoCode(WELCOME_PROMO_CODE);
    markPromoPopupSeen();
    setClaimed(true);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome offer"
    >
      <button
        aria-label="Close offer"
        onClick={close}
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(0 0% 8% / 0.5)" }}
      />
      <div
        className="relative w-full max-w-[420px] px-6 py-7 sm:px-8 sm:py-9 animate-fade-in"
        style={{ backgroundColor: "hsl(33 41% 97%)", border: "1px solid hsl(150 12% 78%)" }}
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center"
          style={{ color: "hsl(0 0% 45%)" }}
        >
          <X size={16} strokeWidth={1.6} />
        </button>

        {claimed ? (
          <div className="text-center">
            <div
              className="mx-auto w-12 h-12 flex items-center justify-center"
              style={{ backgroundColor: "hsl(150 18% 88%)", color: "hsl(186 35% 28%)" }}
            >
              <Check size={20} strokeWidth={1.6} />
            </div>
            <h2 className="mt-5 font-cormorant text-[26px] font-semibold" style={{ color: "hsl(0 0% 14%)" }}>
              Your 10% is ready
            </h2>
            <p className="mt-2 font-cormorant text-[15px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>
              We&rsquo;ve saved the code to your cart, it applies automatically at checkout.
            </p>
            <button
              onClick={copyCode}
              className="mt-5 w-full h-[52px] text-[13px] font-semibold uppercase tracking-[0.24em] border border-dashed"
              style={{ borderColor: "hsl(186 35% 40%)", color: "hsl(186 35% 28%)", backgroundColor: "hsl(0 0% 100%)" }}
            >
              {copied ? "Copied" : WELCOME_PROMO_CODE}
            </button>
            <button
              onClick={close}
              className="mt-4 w-full h-[48px] text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.32em] font-medium" style={{ color: "hsl(186 35% 28%)" }}>
              Welcome to Naira Flore
            </p>
            <h2 className="mt-3 font-cormorant text-[30px] leading-[1.1] font-semibold" style={{ color: "hsl(0 0% 12%)" }}>
              10% off your first order
            </h2>
            <p className="mt-2 font-cormorant text-[15px] leading-[1.7]" style={{ color: "hsl(0 0% 45%)" }}>
              Tell us where to send it. The code is applied for you at checkout.
            </p>

            <div className="flex mt-5" style={{ border: "1px solid hsl(0 0% 84%)" }}>
              {([
                { key: "email" as Channel, label: "Email", icon: Mail },
                { key: "whatsapp" as Channel, label: "WhatsApp", icon: MessageCircle },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setChannel(key);
                    setValue("");
                    setError("");
                  }}
                  className="flex-1 h-[42px] inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] transition-colors"
                  style={{
                    backgroundColor: channel === key ? "hsl(186 35% 28%)" : "transparent",
                    color: channel === key ? "hsl(0 0% 100%)" : "hsl(0 0% 40%)",
                  }}
                >
                  <Icon size={13} strokeWidth={1.5} /> {label}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-3">
              <label className="sr-only" htmlFor="welcome-offer-input">
                {channel === "email" ? "Email address" : "WhatsApp number"}
              </label>
              <input
                id="welcome-offer-input"
                type={channel === "email" ? "email" : "tel"}
                inputMode={channel === "email" ? "email" : "tel"}
                value={value}
                maxLength={120}
                onChange={(e) => setValue(e.target.value)}
                placeholder={channel === "email" ? "you@email.com" : "+91 98765 43210"}
                className="w-full h-[48px] px-4 text-[14px] outline-none"
                style={{ border: "1px solid hsl(0 0% 82%)", backgroundColor: "hsl(0 0% 100%)", color: "hsl(0 0% 18%)" }}
              />
              {error && (
                <p className="mt-2 text-[12px]" style={{ color: "hsl(0 65% 45%)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="press-scale w-full h-[50px] mt-3 text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ backgroundColor: "hsl(0 0% 12%)", color: "hsl(0 0% 100%)" }}
              >
                Send my 10% code
              </button>
            </form>

            <button onClick={close} className="w-full mt-3 min-h-[40px] font-cormorant text-[13px] underline underline-offset-4" style={{ color: "hsl(0 0% 50%)" }}>
              No thanks, I&rsquo;ll pay full price
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WelcomeOfferPopup;
