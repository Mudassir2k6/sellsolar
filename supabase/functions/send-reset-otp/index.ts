import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * DISABLED on purpose.
 *
 * This endpoint used to e-mail an attacker-supplied "OTP" to any address from a
 * "SellSolar Security" sender (phishing / spam relay) and could echo the code back.
 * The website never calls it: password recovery uses Supabase Auth's own recovery
 * e-mail (supabase.auth.resetPasswordForEmail + verifyOtp), which is verified server-side.
 */
Deno.serve(() =>
  Response.json(
    { error: "gone", message: "This endpoint has been retired." },
    { status: 410 },
  ),
);
