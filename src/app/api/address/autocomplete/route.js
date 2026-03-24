import { NextResponse } from "next/server";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

function allowedCountryCodes(country) {
  const normalized = String(country || "").toUpperCase();
  if (normalized === "US") return "us";
  if (normalized === "CA") return "ca";
  if (normalized === "GB") return "gb";
  return "us,ca,gb";
}

function normalizeSuggestion(item) {
  const address = item?.address ?? {};
  const streetParts = [address.house_number, address.road].filter(Boolean);
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.county ||
    "";
  const state = address.state || address.region || "";
  const postalCode = address.postcode || "";
  const countryCode = String(address.country_code || "").toUpperCase();

  return {
    id: String(item?.place_id ?? ""),
    label: String(item?.display_name ?? ""),
    address1: streetParts.join(" ").trim(),
    city: String(city),
    state: String(state),
    postalCode: String(postalCode),
    country: countryCode || "",
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();
  const country = allowedCountryCodes(searchParams.get("country"));
  if (q.length < 4) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "6",
    countrycodes: country,
  });

  try {
    const response = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, {
      headers: {
        // Nominatim requires identifying User-Agent/Referer on server requests.
        "User-Agent": "ShamrockArtStudio/1.0 (checkout-address-autocomplete)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, suggestions: [] }, { status: 502 });
    }

    const data = await response.json().catch(() => []);
    const suggestions = Array.isArray(data)
      ? data.map(normalizeSuggestion).filter((s) => s.id && s.label)
      : [];
    return NextResponse.json({ ok: true, suggestions });
  } catch {
    return NextResponse.json({ ok: false, suggestions: [] }, { status: 502 });
  }
}
