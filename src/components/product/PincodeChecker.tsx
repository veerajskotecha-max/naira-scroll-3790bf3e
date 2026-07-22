import { useEffect, useState } from "react";
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react";

const METRO_PREFIXES = ["11", "40", "56", "60", "70", "50", "38", "20", "12", "16", "62"]; // Delhi, Mumbai, Blr, Chennai, Kol, Hyd, Ahmedabad, Noida, Faridabad, Gurgaon, Chandigarh

const addBusinessDays = (start: Date, days: number) => {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

interface Result {
  pincode: string;
  eta: string;
  isMetro: boolean;
}

const PincodeChecker = () => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naira-pincode");
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        check(saved, false);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const check = (value: string, save = true) => {
    setError(null);
    if (!/^\d{6}$/.test(value)) {
      setError("Enter a valid 6-digit pincode.");
      setResult(null);
      return;
    }
    const isMetro = METRO_PREFIXES.some((p) => value.startsWith(p));
    const eta = formatDate(addBusinessDays(new Date(), isMetro ? 5 : 9));
    setResult({ pincode: value, eta, isMetro });
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
          className="flex-1 h-11 px-3 text-[13px] tracking-[0.02em] border outline-none bg-transparent"
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
              Delivery to <strong className="font-medium">{result.pincode}</strong> by{" "}
              <strong className="font-medium">{result.eta}</strong>
            </span>
          </div>
          <p className="text-[11px] pl-[21px]" style={{ color: "hsl(0 0% 50%)" }}>
            Prepaid only · COD not available
          </p>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
