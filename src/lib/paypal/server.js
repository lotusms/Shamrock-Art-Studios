const DEFAULT_BASE = "https://api-m.sandbox.paypal.com";

function paypalApiBase() {
  const raw = process.env.PAYPAL_API_BASE?.replace(/\/$/, "") || DEFAULT_BASE;
  return raw;
}

function clientId() {
  return (
    process.env.PAYPAL_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ||
    ""
  );
}

function clientSecret() {
  return process.env.PAYPAL_CLIENT_SECRET?.trim() || "";
}

let tokenCache = { token: null, expiresAtMs: 0 };

export function isPayPalConfigured() {
  return Boolean(clientId() && clientSecret());
}

async function getAccessToken() {
  const id = clientId();
  const secret = clientSecret();
  if (!id || !secret) {
    throw new Error("PayPal is not configured (client id / secret).");
  }

  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAtMs - 60_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error_description === "string"
        ? data.error_description
        : "PayPal OAuth failed.";
    throw new Error(msg);
  }

  const token = data?.access_token;
  const expiresInSec = Number(data?.expires_in) || 3600;
  if (!token) {
    throw new Error("PayPal OAuth returned no access token.");
  }

  tokenCache = {
    token,
    expiresAtMs: now + expiresInSec * 1000,
  };
  return token;
}

function moneyString(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid amount for PayPal order.");
  }
  if (n > 1_000_000) {
    throw new Error("Amount exceeds allowed maximum.");
  }
  return n.toFixed(2);
}

export async function paypalCreateCheckoutOrder(amountUsd, currencyCode = "USD") {
  const token = await getAccessToken();
  const value = moneyString(amountUsd);
  const res = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currencyCode, value },
        },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data?.message ||
      data?.details?.[0]?.description ||
      JSON.stringify(data);
    throw new Error(`PayPal could not create order: ${detail}`);
  }
  return data;
}

export async function paypalCaptureCheckoutOrder(paypalOrderId) {
  const token = await getAccessToken();
  const res = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data?.message ||
      data?.details?.[0]?.description ||
      JSON.stringify(data);
    throw new Error(`PayPal capture failed: ${detail}`);
  }
  return data;
}

/** @param {unknown} captureResponse */
export function paypalCapturedAmountUsd(captureResponse) {
  const unit = captureResponse?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const value = capture?.amount?.value;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function paypalCaptureId(captureResponse) {
  const unit = captureResponse?.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return typeof capture?.id === "string" ? capture.id : null;
}
