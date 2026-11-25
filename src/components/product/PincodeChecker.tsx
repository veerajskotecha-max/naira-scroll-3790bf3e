import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, AlertCircle, Info } from "lucide-react";
import {
  getServiceability,
  isValidPincode,
  addWorkingDays,
  formatDeliveryDate,
  type Serviceability,
} from "@/lib/serviceability";

interface Result extends Serviceability {
  eta: string;
}

/* A piece that is reserved rather than in stock (sold out, a sold-out colour,
   a size made to order) ships when it is ready: the courier's days still hold,
   but a dated "by Wed, 4 Nov" would be a promise the page does not make. */
/* `look="clean"` is the product page's (src/components/clean): one hairline
   field with its action inside, the same words as plain lines, no icons and
   no green, amber or red. Without it this renders as it always has, for the
   outfit page.
   `onChecked` hears each answer: the pincode it could vouch for, or null. The
   product page uses it to put that pincode's own date under its buttons. */
const PincodeChecker = ({
  preorder = false,
  look,
  onChecked,
}: {
  preorder?: boolean;
  look?: "clean";
  onChecked?: (pincode: string | null) => void;
}) => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* A well-formed pincode the page cannot vouch for (see isCourierZone). */
  const [unconfirmed, setUnconfirmed] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naira-pincode");
      if (saved && isValidPincode(saved)) {
        setPincode(saved);
        check(saved, false);
      }
    } catch {
      /* storage blocked: the shopper types the pincode instead */
    }
  }, []);

  const check = (value: string, save = true) => {
    setError(null);
    setUnconfirmed(null);
    if (!isValidPincode(value)) {
      setError("Enter a valid 6-digit pincode.");
      setResult(null);
      return;
    }
    const info = getServiceability(value);
    onChecked?.(info ? value : null);
    if (info) {
      const eta = formatDeliveryDate(addWorkingDays(new Date(), info.days));
      setResult({ ...info, eta });
    } else {
      setResult(null);
      setUnconfirmed(value);
    }
    if (save) {
      try {
        localStorage.setItem("naira-pincode", value);
      } catch {
        /* storage blocked: the check still shows, it is just not remembered */
      }
    }
  };


  if (look === "clean") {
    return (
      <div>
        <form
          className="nc-field"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            check(pincode);
          }}
        >
          <label htmlFor="pdp-pincode" className="nc-sr">
            Pincode
          </label>
          <input
            id="pdp-pincode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter pincode"
          />
          {/* The field's box is 44px with its hairline, so the button inside
              is 42: its target reaches over the hairline to the full 44. */}
          <button type="submit" className="relative before:absolute before:inset-x-0 before:-inset-y-px before:content-['']">
            Check
          </button>
        </form>

        {error && (
          <p role="alert" className="nc-small nc-small--ink mt-2">
            {error}
          </p>
        )}

        {/* The answer is read out when it arrives, as the error is. */}
        <div aria-live="polite">
        {unconfirmed && (
          <p className="nc-small mt-2">
            We can't confirm delivery to {unconfirmed} here. It is checked with your full address at checkout, before you pay.
          </p>
        )}

        {result && !error && (
          <div className="mt-2">
            <p className="nc-small nc-small--ink">
              {/* The same words; the date stays whole and the dot stays with
                  the line it ends, when a narrow phone wraps the sentence. */}
              Delivery to {result.pincode} in {result.days} working{" "}
              {preorder ? (
                "days once it ships"
              ) : (
                <>
                  <span className="whitespace-nowrap">days ·</span> <span className="whitespace-nowrap">by {result.eta}</span>
                </>
              )}
            </p>
            <p className="nc-small nc-small--ink">
              {/* No reason is given for a refusal: the list's own ("high
                  return rate on COD in this region") told a shopper her area
                  was a bad risk. What she can do is said instead. */}
              {result.cod === "blocked"
                ? "Cash on delivery is not available for this pincode. You can pay by UPI, card, wallet or net banking."
                : "Cash on delivery available. UPI, cards, wallets and net banking too."}
            </p>
          </div>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2.5">
        <MapPin size={13} strokeWidth={1.6} style={{ color: "hsl(186 35% 28%)" }} />
        <span
          className="text-[11px] uppercase tracking-[0.14em] font-medium"
          style={{ color: "hsl(0 0% 25%)" }}
        >
          Delivery
        </span>
      </div>
      <div className="flex items-stretch">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter pincode"
          /* min-w-0: a text field will not shrink below its default 20-character
             width, which pushed Check past the edge of every phone screen. */
          className="min-w-0 flex-1 h-11 px-3 text-[16px] md:text-[13px] tracking-[0.02em] border outline-none bg-transparent"
          style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}
        />
        <button
          onClick={() => check(pincode)}
          className="h-11 shrink-0 px-5 text-[11px] font-medium uppercase tracking-[0.14em] border border-l-0 transition-colors duration-200"
          style={{
            borderColor: "hsl(0 0% 20%)",
            backgroundColor: "hsl(0 0% 12%)",
            color: "hsl(0 0% 100%)",
          }}
        >
          Check
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2">
          <AlertCircle size={12} style={{ color: "hsl(0 65% 45%)" }} />
          <span className="text-[12px]" style={{ color: "hsl(0 65% 45%)" }}>
            {error}
          </span>
        </div>
      )}

      {unconfirmed && (
        <div className="mt-2.5 flex items-start gap-2">
          <Info size={12} className="mt-[3px] shrink-0" style={{ color: "hsl(28 70% 42%)" }} />
          <p className="text-[11px]" style={{ color: "hsl(0 0% 40%)" }}>
            We can't confirm delivery to {unconfirmed} here. It is checked with your full address at checkout, before you pay.
          </p>
        </div>
      )}

      {result && !error && (
        <div className="mt-2.5 space-y-1.5">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={13} className="mt-[2px] shrink-0" style={{ color: "hsl(142 50% 38%)" }} />
            <span className="text-[12px]" style={{ color: "hsl(0 0% 25%)" }}>
              Delivery to <strong className="font-medium">{result.pincode}</strong> in{" "}
              <strong className="font-medium">{result.days} working days</strong>
              {preorder ? (
                " once it ships"
              ) : (
                <>
                  {" "}· by <strong className="font-medium">{result.eta}</strong>
                </>
              )}
            </span>
          </div>
          {result.cod === "blocked" ? (
            <div className="flex items-start gap-2">
              <Info size={12} className="mt-[3px] shrink-0" style={{ color: "hsl(28 70% 42%)" }} />
              <p className="text-[11px]" style={{ color: "hsl(0 0% 40%)" }}>
                Cash on Delivery is unavailable for this pincode ({result.codReason}). Prepaid only ·
                UPI, cards, wallets and net banking accepted.
              </p>
            </div>
          ) : (
            <p className="text-[11px] pl-[21px]" style={{ color: "hsl(0 0% 50%)" }}>
              Cash on Delivery available · UPI, cards, wallets and net banking accepted
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default PincodeChecker;
