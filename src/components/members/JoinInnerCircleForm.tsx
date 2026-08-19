import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { joinInnerCircle } from "@/lib/innerCircle";
import { useAuth } from "@/contexts/AuthContext";

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;

/** Email capture for the Inner Circle list. Used on /innercircle and elsewhere. */
const JoinInnerCircleForm = ({
  source = "inner-circle",
  withName = true,
  cta = "Join the Inner Circle",
  dark = false,
}: {
  source?: string;
  withName?: boolean;
  cta?: string;
  dark?: boolean;
}) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState("busy");
    setMessage(null);
    const result = await joinInnerCircle({ email, name, source, userId: user?.id ?? null });
    if (!result.ok) {
      setState("idle");
      setMessage(result.message);
      return;
    }
    setState("done");
    setMessage(result.already ? "You are already on the list." : "You're in. Watch your inbox.");
  };

  const border = dark ? "border-[#FFF8F5]/30" : "border-[#1A1614]/15";
  const text = dark ? "text-[#FFF8F5]" : "text-[#1A1614]";

  if (state === "done") {
    return (
      <p className={`text-[1.05rem] italic ${dark ? "text-[#FFF8F5]/80" : "text-[#1A1614]/70"}`} style={editorial}>
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[360px] space-y-3">
      {withName && (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={80}
          className={`w-full border-b bg-transparent px-1 py-3 text-[13px] outline-none placeholder:text-current/40 ${border} ${text}`}
          style={jost}
        />
      )}
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="Email address"
        maxLength={255}
        className={`w-full border-b bg-transparent px-1 py-3 text-[13px] outline-none placeholder:text-current/40 ${border} ${text}`}
        style={jost}
      />
      {message && (
        <p className="text-[11px] text-[#B0843A]" style={jost}>
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "busy"}
        className="group relative block w-full overflow-hidden bg-[#1A1614] px-6 py-4 text-center disabled:opacity-70"
      >
        <span className="absolute inset-0 translate-y-full bg-[#99B4AF] transition-transform duration-500 ease-out group-hover:translate-y-0" />
        <span
          className="relative inline-flex items-center justify-center gap-2 text-[11px] font-light uppercase tracking-[0.32em] text-[#FFF8F5]"
          style={jost}
        >
          {state === "busy" && <Loader2 size={13} className="animate-spin" />}
          {cta}
        </span>
      </button>
    </form>
  );
};

export default JoinInnerCircleForm;
