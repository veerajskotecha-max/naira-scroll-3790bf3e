import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/integrations/supabase/lazy";

export type MemberProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  birthday: string | null;
  city: string | null;
  /** Member accepted having their email used (scrambled) for ad matching. */
  ad_matching_consent?: boolean | null;
};

type AuthValue = {
  session: Session | null;
  user: User | null;
  profile: MemberProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The client loads after first paint (see integrations/supabase/lazy.ts);
    // `loading` stays true until it has answered.
    let cancelled = false;
    let unsubscribe = () => {};
    getSupabase()
      .then((supabase) => {
        if (cancelled) return;
        // Listener first, then the existing session — so no event is missed.
        const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
          setSession(next);
          setLoading(false);
        });
        unsubscribe = () => sub.subscription.unsubscribe();
        return supabase.auth.getSession().then(({ data }) => {
          if (cancelled) return;
          setSession(data.session);
          setLoading(false);
        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false); // signed out is the safe reading
      });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const supabase = await getSupabase();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile((data as unknown as MemberProfile) ?? null);
  }, [userId]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
