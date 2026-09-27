import type { supabase as Client } from "./client";

/*
  The Supabase client, loaded on first use. It is 57 KB gzipped — a fifth of
  what every page downloaded before it could draw — and nothing on first
  paint needs it: sign-in state, reviews, reels and order logging all start
  after the page is up. Import the client through this, not ./client, in
  anything the first render reaches; the generated ./client stays untouched.
*/
let client: Promise<typeof Client> | undefined;

export const getSupabase = (): Promise<typeof Client> =>
  (client ??= import("./client").then(
    (module) => module.supabase,
    (error) => {
      client = undefined; // a failed download may be retried
      throw error;
    },
  ));
