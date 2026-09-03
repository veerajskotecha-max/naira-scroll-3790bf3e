import { Link } from "react-router-dom";
import PageSEO from "@/components/PageSEO";
import Footer from "@/components/Footer";
import PortalShell, { LazyPanel } from "@/components/members/portal/PortalShell";
import { useAuth } from "@/contexts/AuthContext";

/* The Inner Circle — the members' conservatory.
   Live at /innercircle (and /inner-circle).

   Signed out this is still a real page: the invitation, the door, and the
   waitlist, all indexable. Signed in it becomes the member's own portal, and
   only that state carries noindex. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const WHATSAPP =
  "https://wa.me/919561557935?text=" +
  encodeURIComponent("Hi Naira Flore — I'd like to join the Inner Circle.");

/** The door, for anyone who already has an account. */
const SignInLink = () => (
  <Link
    to="/auth"
    className="border-b border-[#B0843A] pb-1 text-[10px] tracking-[0.3em] text-[#8A6A2F]"
    style={jost}
  >
    REGISTER NOW / SIGN IN →
  </Link>
);

/* Signed out: the invitation that has always lived here, with the gate above
   the waitlist. Every word of it is indexable, and it stands on its own if the
   gate has not been planted yet. */
const Invitation = () => (
  <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-16 text-center">
    <p className="max-w-md text-[1.05rem] italic leading-[1.6] text-[#1A1614]/70" style={editorial}>
      A small room for the people who wear us first — private previews, early
      access to every new piece, and prices kept for members alone.
    </p>

    <p className="mt-8 text-[11px] tracking-[0.42em] text-[#1A1614]/45" style={jost}>
      NOW OPEN TO MEMBERS
    </p>

    <div className="mt-10 w-full max-w-[420px]">
      <LazyPanel
        name="ConservatoryGate"
        label="MEMBERS ENTER HERE"
        props={{ onUnlocked: () => window.scrollTo({ top: 0, behavior: "smooth" }) }}
        fallback={
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[1.02rem] italic text-[#1A1614]/60" style={editorial}>
              Already a member? The door is this way.
            </p>
            <SignInLink />
          </div>
        }
      />
    </div>

    <p className="mt-10 text-[1.02rem] italic leading-[1.6] text-[#1A1614]/60" style={editorial}>
      Not on the list yet? Choose <span className="not-italic tracking-[0.16em] text-[#8A6A2F]">Join</span> above,
      and we will send you the key.
    </p>

    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex min-h-11 items-center text-[10px] tracking-[0.3em] text-[#1A1614]/45"
      style={jost}
    >
      OR REQUEST AN INVITATION ON WHATSAPP
    </a>
  </section>
);

/* Neither state, yet. Deliberately says nothing about being signed in or out:
   a member who is already signed in must never see the invitation flash past. */
const Unlatching = () => (
  <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24" aria-busy>
    <div className="w-full max-w-[300px] animate-pulse space-y-3 motion-reduce:animate-none" aria-hidden>
      <div className="mx-auto h-3 w-2/3 bg-[#1A1614]/10" />
      <div className="mx-auto h-3 w-1/2 bg-[#1A1614]/[0.07]" />
    </div>
    <span className="sr-only">Opening the conservatory</span>
  </section>
);

const InnerCircle = () => {
  const { user, loading } = useAuth();
  const signedIn = !!user;

  return (
    <>
      <PageSEO
        title="The Inner Circle | Naira Flore"
        description="Naira Flore's Inner Circle — early access to new jewellery, private previews and members-only pricing. Join the list, or sign in to your members' portal."
        canonical="https://nairaflore.com/innercircle"
        noindex={signedIn}
      />
      <main className="min-h-[100svh] bg-[#FBF3EC] pt-[110px] text-[#1A1614] md:pt-[130px]">
        <section className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-10 pt-16 text-center md:pt-24">
          <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
            {signedIn ? "THE CONSERVATORY" : "BY INVITATION"}
          </p>

          <h1 className="mt-5 text-[clamp(2.4rem,9vw,4.4rem)] leading-[1.05]" style={velista}>
            The Inner <span className="italic text-[#B0843A]" style={editorial}>Circle.</span>
          </h1>

          <span className="mt-8 block h-px w-16 bg-[#C99A4C]/60" aria-hidden />
        </section>

        {loading ? <Unlatching /> : signedIn ? <PortalShell /> : <Invitation />}

        <Footer />
      </main>
    </>
  );
};

export default InnerCircle;
