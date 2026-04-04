import nodemailer from "nodemailer";
import { orgName } from "../../config/config.js";

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
 * - RESEND_API_KEY (optional) — when set, customer receipts use Resend’s API first (better
 *   deliverability to Outlook/Gmail than raw SMTP). Verify your From domain in Resend.
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

/** Resend: use for buyer-facing mail so Microsoft/others accept it (verify From in Resend). */
function resendApiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

/**
 * @param {{ to: string; from: string; replyTo?: string; cc?: string[]; bcc?: string[]; subject: string; text: string; html: string }} opts
 */
async function sendEmailViaResend(opts) {
  const key = resendApiKey();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const payload = {
    from: opts.from,
    to: [opts.to],
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };
  if (opts.replyTo) payload.reply_to = [opts.replyTo];
  if (opts.cc?.length) payload.cc = opts.cc;
  if (opts.bcc?.length) payload.bcc = opts.bcc;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message;
    const detail =
      typeof msg === "string"
        ? msg
        : Array.isArray(msg)
          ? msg.map((m) => m?.message || m).join("; ")
          : JSON.stringify(data || {});
    throw new Error(detail || `Resend HTTP ${res.status}`);
  }
  return data;
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

/** Styled line items table for customer receipts (email-safe inline CSS). */
function linesHtmlCustomer(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return '<p style="margin:0;color:#6b7280;font-size:14px;font-style:italic">No items.</p>';
  }
  const head =
    '<tr><th align="left" style="padding:12px 14px;background:#1a2e26;color:#e8e4dc;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif">Item</th><th align="right" style="padding:12px 14px;background:#1a2e26;color:#e8e4dc;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif">Qty</th><th align="right" style="padding:12px 14px;background:#1a2e26;color:#e8e4dc;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif">Each</th><th align="right" style="padding:12px 14px;background:#1a2e26;color:#e8e4dc;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif">Total</th></tr>';
  const rows = lines
    .map((l, i) => {
      const title = escapeHtml(l.title || l.slug || "Item");
      const qty = Number(l.quantity) || 0;
      const each = escapeHtml(formatUsd(l.priceUsd ?? 0));
      const lineTotal = escapeHtml(
        formatUsd((Number(l.priceUsd) || 0) * qty),
      );
      const bg = i % 2 === 0 ? "#faf8f4" : "#ffffff";
      return `<tr><td style="padding:14px;border-bottom:1px solid #e8e4dc;background:${bg};font-size:15px;color:#1f2937;font-family:system-ui,-apple-system,sans-serif">${title}</td><td style="padding:14px;border-bottom:1px solid #e8e4dc;background:${bg};text-align:right;font-size:14px;color:#4b5563;font-family:system-ui,-apple-system,sans-serif">${qty}</td><td style="padding:14px;border-bottom:1px solid #e8e4dc;background:${bg};text-align:right;font-size:14px;color:#4b5563;font-family:system-ui,-apple-system,sans-serif">${each}</td><td style="padding:14px;border-bottom:1px solid #e8e4dc;background:${bg};text-align:right;font-size:15px;font-weight:600;color:#1a2e26;font-family:system-ui,-apple-system,sans-serif">${lineTotal}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e0d9ce;border-radius:10px;overflow:hidden">${head}${rows}</table>`;
}

function paymentBlockTextCustomer(payment) {
  if (!payment || typeof payment !== "object") return "Payment: received";
  if (payment.provider === "paypal") return "Payment: PayPal";
  return `Payment: ${payment.provider || "received"}`;
}

function paymentSummaryCustomerHtml(payment) {
  if (!payment || typeof payment !== "object") {
    return '<p style="margin:0;font-size:14px;color:#6b7280">Your payment is recorded.</p>';
  }
  if (payment.provider === "paypal") {
    return '<p style="margin:0;font-size:15px;color:#1f2937;font-family:system-ui,-apple-system,sans-serif"><span style="color:#0070ba;font-weight:600">PayPal</span> — payment received</p>';
  }
  return `<p style="margin:0;font-size:15px;color:#1f2937;font-family:system-ui,-apple-system,sans-serif">${escapeHtml(String(payment.provider || "Payment"))}</p>`;
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

function buildCustomerReceiptHtml({
  header,
  ship,
  phone,
  lines,
  sub,
  shipCost,
  total,
  payment,
  notes,
}) {
  const shipBlock = escapeHtml(ship || "(missing)").replace(/\n/g, "<br/>");
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:24px 16px;background:#e8e2d6;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%"><tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(26,46,38,0.08),0 2px 8px rgba(0,0,0,0.04);border:1px solid #e0d9ce;">
      <tr>
        <td style="padding:28px 28px 20px;background:linear-gradient(165deg,#1a2e26 0%,#2d4a3e 55%,#1a2e26 100%);">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#c4b896;font-family:system-ui,-apple-system,sans-serif;">${orgName}</p>
          <h1 style="margin:0;font-size:24px;font-weight:400;color:#faf6f0;letter-spacing:-0.02em;line-height:1.25">${escapeHtml(header)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px 8px;font-family:system-ui,-apple-system,sans-serif;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#374151;">Thank you for your purchase. We’ve received your order and will send updates as it moves forward.</p>
          <p style="margin:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#78716c;">Ship to</p>
          <div style="background:#faf8f4;border:1px solid #e8e4dc;border-radius:10px;padding:16px 18px;font-size:14px;line-height:1.6;color:#1f2937;">${shipBlock}</div>
          ${phone ? `<p style="margin:14px 0 0;font-size:14px;color:#4b5563"><strong style="color:#374151">Phone</strong> · ${escapeHtml(phone)}</p>` : ""}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 28px 20px;font-family:system-ui,-apple-system,sans-serif;">
          <p style="margin:0 0 12px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#78716c;">Order summary</p>
          ${linesHtmlCustomer(lines)}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;font-family:system-ui,-apple-system,sans-serif">Subtotal</td><td style="padding:8px 0;text-align:right;font-size:14px;color:#1f2937;font-family:system-ui,-apple-system,sans-serif">${escapeHtml(sub)}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#6b7280;font-family:system-ui,-apple-system,sans-serif">Shipping</td><td style="padding:8px 0;text-align:right;font-size:14px;color:#1f2937;font-family:system-ui,-apple-system,sans-serif">${escapeHtml(shipCost)}</td></tr>
            <tr><td colspan="2" style="border-top:2px solid #1a2e26;padding-top:14px;padding-bottom:4px"></td></tr>
            <tr><td style="padding:4px 0;font-size:16px;font-weight:600;color:#1a2e26;font-family:system-ui,-apple-system,sans-serif">Total</td><td style="padding:4px 0;text-align:right;font-size:18px;font-weight:600;color:#1a2e26;font-family:system-ui,-apple-system,sans-serif">${escapeHtml(total)}</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 28px 24px;font-family:system-ui,-apple-system,sans-serif;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#78716c;">Payment</p>
          ${paymentSummaryCustomerHtml(payment)}
        </td>
      </tr>
      ${notes ? `<tr><td style="padding:0 28px 24px;font-family:system-ui,-apple-system,sans-serif;"><p style="margin:0 0 8px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#78716c;">Note</p><p style="margin:0;font-size:14px;color:#374151;line-height:1.5">${escapeHtml(notes)}</p></td></tr>` : ""}
      <tr>
        <td style="padding:18px 28px 24px;background:#faf8f4;border-top:1px solid #e8e4dc;text-align:center;font-family:system-ui,-apple-system,sans-serif;">
          <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5">Questions? Reply to this email — we’re happy to help.</p>
        </td>
      </tr>
    </table>
  </td></tr></table>
</body></html>`.trim();
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

  const textLines = internal
    ? [
        header,
        "",
        `Customer email: ${email}`,
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
      ]
    : [
        header,
        "",
        "Thank you for your order.",
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
        paymentBlockTextCustomer(payment),
        ...(notes ? ["", `Note: ${notes}`] : []),
      ];
  const text = textLines.join("\n");

  const html = internal
    ? `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:640px">
  <h1 style="font-size:20px">${escapeHtml(header)}</h1>
  <p><strong>Customer:</strong> ${escapeHtml(email)}</p>
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
</body></html>`.trim()
    : buildCustomerReceiptHtml({
        header,
        ship,
        phone,
        lines: order?.lines,
        sub,
        shipCost,
        total,
        payment,
        notes,
      });

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

  /** Same copy the customer gets — BCC shop so you can forward if Outlook/Gmail drops the To: line. */
  const bccShopOnReceipt =
    seller && seller.toLowerCase() !== buyer.toLowerCase() ? [seller] : undefined;

  let buyerOk = false;
  let sellerOk = false;
  let buyerForwardFallbackOk = false;
  /** @type {"resend" | "smtp" | undefined} */
  let buyerDeliveryChannel;
  const failures = [];

  if (resendApiKey() && from) {
    try {
      await sendEmailViaResend({
        to: buyer,
        from,
        replyTo: seller,
        bcc: bccShopOnReceipt,
        subject: `Order confirmation #${orderId} — ${orgName}`,
        text: buyerBodies.text,
        html: buyerBodies.html,
      });
      buyerOk = true;
      buyerDeliveryChannel = "resend";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[order-emails] Resend buyer send failed (verify domain + From in Resend); trying SMTP:",
        message,
      );
      failures.push(`buyer-resend: ${message}`);
    }
  }

  if (!buyerOk) {
    try {
      await transport.sendMail({
        from,
        to: buyer,
        ...(bccShopOnReceipt ? { bcc: bccShopOnReceipt } : {}),
        replyTo: seller,
        subject: `Order confirmation #${orderId} — ${orgName}`,
        text: buyerBodies.text,
        html: buyerBodies.html,
      });
      buyerOk = true;
      buyerDeliveryChannel = buyerDeliveryChannel || "smtp";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[order-emails] Buyer SMTP send failed (check SMTP relay / SES sandbox / recipient):",
        message,
      );
      failures.push(`buyer-smtp: ${message}`);

      // Many SMTP setups only allow mail to the shop inbox; the buyer send fails while the
      // internal "new order" send still works. Deliver the customer receipt to the seller so
      // they can forward it manually.
      try {
        await transport.sendMail({
          from,
          to: seller,
          replyTo: seller,
          subject: `[Forward to customer] Order #${orderId} — ${buyer}`,
          text: [
            `This receipt could not be delivered automatically to ${buyer}.`,
            "Please forward this entire message (or the section below) to the customer.",
            "",
            "--- Customer receipt ---",
            "",
            buyerBodies.text,
          ].join("\n"),
          html: `<p style="font-family:system-ui,sans-serif;line-height:1.5;color:#111"><strong>This receipt could not be delivered to the customer address:</strong> ${escapeHtml(buyer)}</p>
<p style="font-family:system-ui,sans-serif">Please forward the order details below to them.</p>
<hr style="border:none;border-top:1px solid #ccc;margin:16px 0"/>
${buyerBodies.html}`,
        });
        buyerForwardFallbackOk = true;
      } catch (err2) {
        const m2 = err2 instanceof Error ? err2.message : String(err2);
        console.error("[order-emails] Seller forward-fallback failed:", m2);
        failures.push(`buyer-forward-fallback: ${m2}`);
      }
    }
  }

  try {
    await transport.sendMail({
      from,
      to: seller,
      replyTo: seller,
      subject: `New order #${orderId} — ${orgName}`,
      text: sellerBodies.text,
      html: sellerBodies.html,
    });
    sellerOk = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[order-emails] Seller notification failed:", message);
    failures.push(`seller: ${message}`);
  }

  if (buyerOk && sellerOk) {
    return {
      ok: true,
      buyerOk: true,
      sellerOk: true,
      buyerDeliveryChannel,
    };
  }
  if (!buyerOk && buyerForwardFallbackOk && sellerOk) {
    return {
      ok: true,
      buyerOk: false,
      sellerOk: true,
      buyerReceiptViaSeller: true,
      note:
        "Customer inbox did not accept mail; receipt was sent to the shop for forwarding.",
    };
  }
  return {
    ok: false,
    buyerOk,
    sellerOk,
    buyerForwardFallbackOk,
    buyerDeliveryChannel,
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
  const replyToAddr = cc || from;

  if (resendApiKey() && from) {
    try {
      await sendEmailViaResend({
        to: buyer,
        from,
        replyTo: replyToAddr,
        cc: ccAddr ? [ccAddr] : undefined,
        subject: `Order #${orderId} — ${orgName}`,
        text: bodies.text,
        html: bodies.html,
      });
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        "[order-emails] Resend (dashboard resend) failed; trying SMTP:",
        message,
      );
    }
  }

  try {
    await transport.sendMail({
      from,
      to: buyer,
      cc: ccAddr,
      replyTo: replyToAddr,
      subject: `Order #${orderId} — ${orgName}`,
      text: bodies.text,
      html: bodies.html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[order-emails] Dashboard resend email (SMTP) failed:", message);
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
  if (result.buyerReceiptViaSeller) out.buyerReceiptViaSeller = true;
  if (result.buyerDeliveryChannel)
    out.buyerDeliveryChannel = result.buyerDeliveryChannel;
  if (result.note) out.note = String(result.note);
  if (!result.ok && result.error) out.error = result.error;
  return out;
}
