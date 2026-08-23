/**
 * Optional transactional email via Resend.
 * Without RESEND_API_KEY, notifications are logged and skipped (bids still save).
 */
export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const to = input.to.trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { sent: false, reason: "invalid_recipient" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "NaijaPass <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email] skipped (no RESEND_API_KEY):", input.subject, "→", to);
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend failed", res.status, body.slice(0, 300));
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (err) {
    console.error("[email]", err);
    return { sent: false, reason: "network_error" };
  }
}
