import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { trackPixel } from "@/lib/pixel";

export const memberEmailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const memberNameSchema = z
  .string()
  .trim()
  .max(80, { message: "Name must be less than 80 characters" });

type JoinInput = {
  email: string;
  name?: string;
  phone?: string;
  source?: string;
  userId?: string | null;
};

export type JoinResult = { ok: true; already: boolean } | { ok: false; message: string };

/** Adds an email to the Inner Circle list. Duplicates are treated as success. */
export const joinInnerCircle = async ({
  email,
  name,
  phone,
  source = "inner-circle",
  userId = null,
}: JoinInput): Promise<JoinResult> => {
  const parsedEmail = memberEmailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return { ok: false, message: parsedEmail.error.issues[0].message };
  }
  const parsedName = memberNameSchema.safeParse(name ?? "");
  if (!parsedName.success) {
    return { ok: false, message: parsedName.error.issues[0].message };
  }

  const { error } = await supabase.from("inner_circle_signups").insert({
    email: parsedEmail.data,
    name: parsedName.data || null,
    phone: phone?.trim().slice(0, 20) || null,
    source,
    user_id: userId,
  });

  if (error) {
    // Unique index on lower(email) — they are already on the list.
    if (error.code === "23505") return { ok: true, already: true };
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  /* Meta Pixel: an email handed over for future contact is a Lead, and the
     Inner Circle list itself is an opt-in subscription. */
  trackPixel("Lead", { content_name: "Inner Circle", content_category: source });
  trackPixel("Subscribe", { value: "0.00", currency: "INR", predicted_ltv: "0.00" });
  return { ok: true, already: false };
};
