const PRINTFUL_API_BASE = "https://api.printful.com";
const PRINTFUL_TIMEOUT_MS = 15000;

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRINTFUL_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${PRINTFUL_API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Printful API request timed out after ${PRINTFUL_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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
