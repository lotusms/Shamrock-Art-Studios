const PRINTFUL_API_BASE = "https://api.printful.com";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function isPrintfulEnabled() {
  return Boolean(process.env.PRINTFUL_API_KEY);
}

export async function printfulRequest(path, init = {}) {
  const apiKey = required("PRINTFUL_API_KEY");
  const response = await fetch(`${PRINTFUL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const err = json?.error;
    const nested =
      err && typeof err === "object"
        ? err.message || err.reason || err.hint
        : null;
    const reason =
      nested ||
      (typeof err === "string" ? err : null) ||
      json?.result ||
      response.statusText;
    throw new Error(`Printful API ${response.status}: ${String(reason)}`);
  }
  return json;
}
