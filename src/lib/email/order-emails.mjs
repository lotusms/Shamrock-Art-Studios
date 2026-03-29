import nodemailer from "nodemailer";

const usdFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsd(amount) {
  return usdFmt.format(Number(amount));
}

/**
 * Env (server only):
 * - SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE (optional "true" for port 465)
 * - SMTP_USER
 * - SMTP_PASS or SMTP_PASSWORD (Gmail app passwords often use SMTP_PASSWORD)
 * - SMTP_FROM — full From header, OR SMTP_FROM_EMAIL + optional SMTP_FROM_NAME
 * - ORDER_NOTIFICATION_EMAIL — seller inbox (defaults to SMTP_USER if unset)
 */

function smtpPassword() {
  return (
    process.env.SMTP_PASS?.trim() || process.env.SMTP_PASSWORD?.trim() || ""
  );
}

/** Nodemailer "from" string: "Name <email>" or plain email */
function smtpFromAddress() {
  const single = process.env.SMTP_FROM?.trim();
  if (single) return single;
  const email = process.env.SMTP_FROM_EMAIL?.trim();
  if (!email) return "";
  const name = process.env.SMTP_FROM_NAME?.trim();
  if (!name) return email;
  const safe = name.replace(/[\r\n<>]/g, "");
  return `${safe} <${email}>`;
}

function sellerInbox() {
  return (
    process.env.ORDER_NOTIFICATION_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ""
  );
}

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      smtpPassword() &&
      smtpFromAddress() &&
      sellerInbox(),
  );
}

/** Non-secret hints for logs / support (which env keys are unset). */
export function smtpMissingParts() {
  const missing = [];
  if (!process.env.SMTP_HOST?.trim()) missing.push("SMTP_HOST");
  if (!process.env.SMTP_USER?.trim()) missing.push("SMTP_USER");
  if (!smtpPassword()) missing.push("SMTP_PASS or SMTP_PASSWORD");
  if (!smtpFromAddress()) {
    missing.push("SMTP_FROM or SMTP_FROM_EMAIL (+ optional SMTP_FROM_NAME)");
  }
  if (!sellerInbox()) missing.push("ORDER_NOTIFICATION_EMAIL or SMTP_USER");
  return missing;
}

function createTransport() {
  const port = Number(process.env.SMTP_PORT || "587") || 587;
  const secure =
    process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1";
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: smtpPassword(),
    },
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAddress(a) {
  if (!a || typeof a !== "object") return "";
  const parts = [
    a.fullName,
    a.address1,
    a.address2,
    [a.city, a.state, a.postalCode].filter(Boolean).join(", "),
    a.country,
  ].filter(Boolean);
  return parts.join("\n");
}

function linesText(lines) {
  if (!Array.isArray(lines)) return "";
  return lines
    .map((l) => {
      const title = l.title || l.slug || "Item";
      const qty = Number(l.quantity) || 0;
      const each = formatUsd(l.priceUsd ?? 0);
      const lineTotal = formatUsd((Number(l.priceUsd) || 0) * qty);
      return `  - ${title} × ${qty} @ ${each} = ${lineTotal}`;
    })
    .join("\n");
}

function linesHtml(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return "<p><em>No line items.</em></p>";
  }
  const rows = lines
    .map((l) => {
      const title = escapeHtml(l.title || l.slug || "Item");
      const qty = Number(l.quantity) || 0;
      const each = escapeHtml(formatUsd(l.priceUsd ?? 0));
      const lineTotal = escapeHtml(
        formatUsd((Number(l.priceUsd) || 0) * qty),
      );
      return `<tr><td style="padding:8px;border-bottom:1px solid #eee">${title}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${qty}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${each}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${lineTotal}</td></tr>`;
    })
    .join("");
  return `<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th align="left" style="padding:8px;border-bottom:2px solid #ccc">Item</th><th align="right" style="padding:8px;border-bottom:2px solid #ccc">Qty</th><th align="right" style="padding:8px;border-bottom:2px solid #ccc">Each</th><th align="right" style="padding:8px;border-bottom:2px solid #ccc">Line</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function paymentBlockText(payment) {
  if (!payment || typeof payment !== "object") return "Payment: (not recorded)";
  if (payment.provider === "paypal") {
    return [
      "Payment: PayPal",
      payment.paypalOrderId && `  PayPal order: ${payment.paypalOrderId}`,
      payment.paypalCaptureId && `  Capture id: ${payment.paypalCaptureId}`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return `Payment: ${payment.provider || "unknown"}`;
}

function paymentBlockHtml(payment) {
  if (!payment || typeof payment !== "object") {
    return "<p><em>Payment details not recorded.</em></p>";
  }
  if (payment.provider === "paypal") {
    return `<p><strong>PayPal</strong><br/>Order: ${escapeHtml(payment.paypalOrderId || "—")}<br/>Capture: ${escapeHtml(payment.paypalCaptureId || "—")}</p>`;
  }
  return `<p>${escapeHtml(String(payment.provider || "Payment"))}</p>`;
}

function fulfillmentBlockText(fulfillment) {
  if (!fulfillment || typeof fulfillment !== "object") {
    return "Fulfillment: (not recorded)";
  }
  const lines = [`Fulfillment: ${fulfillment.provider || "unknown"}`];
  if (fulfillment.printfulOrderId != null) {
    lines.push(`  Printful order id: ${fulfillment.printfulOrderId}`);
  }
  if (fulfillment.printfulStatus != null) {
    lines.push(`  Printful status: ${fulfillment.printfulStatus}`);
  }
  return lines.join("\n");
}

function fulfillmentBlockHtml(fulfillment) {
  if (!fulfillment || typeof fulfillment !== "object") {
    return "<p><em>Fulfillment not recorded.</em></p>";
  }
  return `<p><strong>${escapeHtml(fulfillment.provider || "Fulfillment")}</strong><br/>Printful order: ${escapeHtml(String(fulfillment.printfulOrderId ?? "—"))}<br/>Status: ${escapeHtml(String(fulfillment.printfulStatus ?? "—"))}</p>`;
}

/** Stored orders may use `providerOrderId` / `providerStatus` instead of Printful field names. */
function normalizeFulfillmentForEmail(raw) {
  if (!raw || typeof raw !== "object") {
    return { provider: "unknown", printfulOrderId: null, printfulStatus: null };
  }
  return {
    provider: String(raw.provider || "unknown"),
    printfulOrderId: raw.printfulOrderId ?? raw.providerOrderId ?? null,
    printfulStatus: raw.printfulStatus ?? raw.providerStatus ?? null,
  };
}

function buildBodies({ order, payment, fulfillment, options = {} }) {
  const internal = Boolean(options.internal);
  const id = order?.id || "—";
  const email = order?.email || "—";
  const ship = formatAddress(order?.shippingAddress);
  const sub = formatUsd(order?.subtotalUsd ?? 0);
  const shipCost = formatUsd(order?.shippingUsd ?? 0);
  const total = formatUsd(order?.totalUsd ?? 0);
  const phone = order?.phone ? String(order.phone) : "";
  const notes = order?.notes ? String(order.notes) : "";

  const header = internal
    ? `New order #${id}`
    : `Thank you — order #${id}`;

  const textLines = [
    header,
    "",
    internal ? `Customer email: ${email}` : "We received your order.",
    "",
    "Ship to:",
    ship || "(missing)",
    ...(phone ? [`Phone: ${phone}`] : []),
    "",
    "Items:",
    linesText(order?.lines),
    "",
    `Subtotal: ${sub}`,
    `Shipping: ${shipCost}`,
    `Total: ${total}`,
    "",
    paymentBlockText(payment),
    "",
    fulfillmentBlockText(fulfillment),
    ...(notes ? ["", `Notes: ${notes}`] : []),
  ];
  const text = textLines.join("\n");

  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:640px">
  <h1 style="font-size:20px">${escapeHtml(header)}</h1>
  ${internal ? `<p><strong>Customer:</strong> ${escapeHtml(email)}</p>` : "<p>We received your order and will follow up if anything is needed.</p>"}
  <h2 style="font-size:16px;margin-top:24px">Shipping address</h2>
  <pre style="white-space:pre-wrap;font-family:inherit;background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(ship || "(missing)")}</pre>
  ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
  <h2 style="font-size:16px;margin-top:24px">Items</h2>
  ${linesHtml(order?.lines)}
  <p style="margin-top:16px"><strong>Subtotal:</strong> ${escapeHtml(sub)}<br/><strong>Shipping:</strong> ${escapeHtml(shipCost)}<br/><strong>Total:</strong> ${escapeHtml(total)}</p>
  <h2 style="font-size:16px;margin-top:24px">Payment</h2>
  ${paymentBlockHtml(payment)}
  <h2 style="font-size:16px;margin-top:24px">Fulfillment</h2>
  ${fulfillmentBlockHtml(fulfillment)}
  ${notes ? `<h2 style="font-size:16px;margin-top:24px">Customer notes</h2><p>${escapeHtml(notes)}</p>` : ""}
</body></html>`.trim();

  return { text, html };
}

/**
 * Sends order confirmation to the buyer and a notification to the seller.
 * Does not throw on SMTP failure — logs and returns { ok, error? }.
 */
export async function sendOrderConfirmationEmails({ order, payment, fulfillment }) {
  if (!smtpConfigured()) {
    const missing = smtpMissingParts();
    console.warn(
      "[order-emails] SMTP incomplete. Missing or empty:",
      missing.join(", ") || "(unknown)",
    );
    return { ok: false, skipped: true, reason: "smtp_not_configured" };
  }

  const buyer = order?.email?.trim();
  if (!buyer) {
    console.warn("[order-emails] No buyer email; skipping sends.");
    return { ok: false, skipped: true, reason: "no_buyer_email" };
  }

  const seller = sellerInbox();
  const from = smtpFromAddress();
  const orderId = order?.id || "order";

  const transport = createTransport();
  const buyerBodies = buildBodies({ order, payment, fulfillment });
  const sellerBodies = buildBodies({
    order,
    payment,
    fulfillment,
    options: { internal: true },
  });

  let buyerOk = false;
  let sellerOk = false;
  const failures = [];

  try {
    await transport.sendMail({
      from,
      to: buyer,
      subject: `Order confirmation #${orderId} — Shamrock Art Studio`,
      text: buyerBodies.text,
      html: buyerBodies.html,
    });
    buyerOk = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[order-emails] Buyer send failed:", message);
    failures.push(`buyer: ${message}`);
  }

  try {
    await transport.sendMail({
      from,
      to: seller,
      subject: `New order #${orderId} — Shamrock Art Studio`,
      text: sellerBodies.text,
      html: sellerBodies.html,
    });
    sellerOk = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[order-emails] Seller notification failed:", message);
    failures.push(`seller: ${message}`);
  }

  if (buyerOk && sellerOk) return { ok: true, buyerOk: true, sellerOk: true };
  return {
    ok: false,
    buyerOk,
    sellerOk,
    error: failures.join("; ") || "unknown",
  };
}

/**
 * One HTML email to the buyer with the studio address in CC (same template as checkout confirmation).
 */
export async function sendOrderDetailsEmailBuyerWithCc({ order, payment, fulfillment }) {
  if (!smtpConfigured()) {
    const missing = smtpMissingParts();
    console.warn(
      "[order-emails] Resend: SMTP incomplete:",
      missing.join(", ") || "(unknown)",
    );
    return { ok: false, skipped: true, reason: "smtp_not_configured" };
  }

  const buyer = order?.email?.trim();
  if (!buyer) {
    return { ok: false, skipped: true, reason: "no_buyer_email" };
  }

  const cc = sellerInbox();
  const from = smtpFromAddress();
  const orderId = order?.id || "order";
  const fulfillmentNorm = normalizeFulfillmentForEmail(fulfillment);
  const bodies = buildBodies({ order, payment, fulfillment: fulfillmentNorm });
  const transport = createTransport();

  const ccAddr =
    cc && cc.toLowerCase() !== buyer.toLowerCase() ? cc : undefined;

  try {
    await transport.sendMail({
      from,
      to: buyer,
      cc: ccAddr,
      subject: `Order #${orderId} — Shamrock Art Studio`,
      text: bodies.text,
      html: bodies.html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[order-emails] Resend failed:", message);
    return { ok: false, error: message };
  }
}

/** Safe subset for JSON responses (no internal env details). */
export function emailResultForClient(result) {
  if (!result || typeof result !== "object") return undefined;
  const out = { ok: Boolean(result.ok) };
  if (result.skipped) out.skipped = true;
  if (result.reason) out.reason = result.reason;
  if (result.buyerOk != null) out.buyerOk = result.buyerOk;
  if (result.sellerOk != null) out.sellerOk = result.sellerOk;
  if (!result.ok && result.error) out.error = result.error;
  return out;
}
