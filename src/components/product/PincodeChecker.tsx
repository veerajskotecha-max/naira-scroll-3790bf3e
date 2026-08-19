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

const PincodeChecker = () => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naira-pincode");
      if (saved && isValidPincode(saved)) {
        setPincode(saved);
        check(saved, false);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = (value: string, save = true) => {
    setError(null);
    const info = getServiceability(value);
    if (!info) {
      setError("Enter a valid 6-digit pincode.");
      setResult(null);
      return;
    }
    const eta = formatDeliveryDate(addWorkingDays(new Date(), info.days));
    setResult({ ...info, eta });
    if (save) {
      try {
        localStorage.setItem("naira-pincode", value);
      } catch {}
    }
  };


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
          className="flex-1 h-11 px-3 text-[16px] md:text-[13px] tracking-[0.02em] border outline-none bg-transparent"
          style={{ borderColor: "hsl(0 0% 80%)", color: "hsl(0 0% 20%)" }}
        />
        <button
          onClick={() => check(pincode)}
          className="h-11 px-5 text-[11px] font-medium uppercase tracking-[0.14em] border border-l-0 transition-colors duration-200"
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

      {result && !error && (
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={13} style={{ color: "hsl(142 50% 38%)" }} />
            <span className="text-[12px]" style={{ color: "hsl(0 0% 25%)" }}>
              Estimated delivery to <strong className="font-medium">{result.pincode}</strong> by{" "}
              <strong className="font-medium">{result.eta}</strong> · confirmed at checkout
            </span>
          </div>
          <p className="text-[11px] pl-[21px]" style={{ color: "hsl(0 0% 50%)" }}>
            Cash on Delivery available · UPI, cards, wallets and net banking accepted
          </p>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
