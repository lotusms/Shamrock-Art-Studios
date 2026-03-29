import { NextResponse } from "next/server";
import { normalizeStateCodeForPrintful } from "@/lib/printful/address";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const MAPBOX_GEOCODE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

const USER_AGENT =
  "ShamrockArtStudio/1.0 (checkout-address-autocomplete; +https://shamrockartstudio.com)";

function allowedCountryCodes(country) {
  const normalized = String(country || "").toUpperCase();
  if (normalized === "US") return "us";
  if (normalized === "CA") return "ca";
  if (normalized === "GB") return "gb";
  return "us,ca,gb";
}

/** Mapbox `country` query param (omit for worldwide). */
function mapboxCountryFilter(checkoutCountry) {
  const n = String(checkoutCountry || "US").toUpperCase();
  if (n === "OTHER") return null;
  return n.toLowerCase();
}

function regionFromIso(address) {
  const iso = address?.["ISO3166-2-lvl4"];
  if (typeof iso !== "string" || !iso.includes("-")) return "";
  const part = iso.split("-").pop();
  return part && /^[A-Za-z]{2,3}$/.test(part) ? part.toUpperCase() : "";
}

function humanReadableSuggestionLabel({
  address1,
  city,
  state,
  postalCode,
  country,
  nominatimDisplay,
}) {
  const line1 = String(address1 || "").trim();
  const c = String(city || "").trim();
  let st = String(state || "").trim();
  const zip = String(postalCode || "").trim();
  const cc = String(country || "").toUpperCase();

  if (cc === "US" || cc === "CA") {
    st = normalizeStateCodeForPrintful(cc, st);
  }

  let locality = "";
  if (cc === "US" || cc === "CA") {
    if (c && st && zip) locality = `${c}, ${st} ${zip}`;
    else if (c && st) locality = `${c}, ${st}`;
    else if (c && zip) locality = `${c} ${zip}`;
    else locality = [c, st, zip].filter(Boolean).join(", ");
  } else {
    locality = [c, st, zip].filter(Boolean).join(", ");
  }

  if (line1 && locality) return `${line1} · ${locality}`;
  if (line1) return line1;
  if (locality) return locality;

  const raw = String(nominatimDisplay || "").trim();
  if (!raw) return "";
  const chunks = raw.split(",").map((x) => x.trim()).filter(Boolean);
  if (chunks.length <= 3) return chunks.join(" · ");
  return `${chunks.slice(0, 2).join(" · ")} · ${chunks.slice(-2).join(", ")}`;
}

/** Mapbox Geocoding context → city, region, postcode, ISO country. */
function parseMapboxContext(context) {
  const out = {
    city: "",
    state: "",
    postalCode: "",
    countryCode: "",
  };
  if (!Array.isArray(context)) return out;

  for (const item of context) {
    const id = String(item?.id || "");
    if (id.startsWith("postcode.")) {
      out.postalCode = String(item.text || "").trim();
    } else if (id.startsWith("region.")) {
      const sc = String(item.short_code || "");
      if (sc.includes("-")) {
        out.state = sc.split("-").pop()?.toUpperCase() || String(item.text || "").trim();
      } else {
        out.state = String(item.text || "").trim();
      }
    } else if (
      id.startsWith("place.") ||
      id.startsWith("locality.") ||
      id.startsWith("district.")
    ) {
      if (!out.city) out.city = String(item.text || "").trim();
    } else if (id.startsWith("country.")) {
      const sc = String(item.short_code || "").toLowerCase();
      if (sc.length >= 2) {
        out.countryCode = sc.slice(0, 2).toUpperCase();
      }
    }
  }
  return out;
}

function mapboxFeatureToSuggestion(feature, index) {
  const placeName = String(feature?.place_name || "").trim();
  const num =
    feature?.address != null && feature.address !== ""
      ? String(feature.address).trim()
      : "";
  const street = String(feature?.text || "").trim();
  let address1 = [num, street].filter(Boolean).join(" ").trim();
  if (!address1 && placeName) {
    address1 = placeName.split(",")[0].trim();
  }

  const ctx = parseMapboxContext(feature?.context);
  let cc = ctx.countryCode || "";
  if (cc === "UK") cc = "GB";

  let state = ctx.state;
  if (cc === "US" || cc === "CA") {
    state = normalizeStateCodeForPrintful(cc, state);
  }

  const label = humanReadableSuggestionLabel({
    address1,
    city: ctx.city,
    state,
    postalCode: ctx.postalCode,
    country: cc,
    nominatimDisplay: placeName,
  });

  const id =
    feature?.id != null && String(feature.id) !== ""
      ? String(feature.id)
      : `mapbox-${index}`;

  return {
    id,
    label: label || placeName,
    address1,
    city: ctx.city,
    state,
    postalCode: ctx.postalCode,
    country: cc,
  };
}

function normalizeNominatimRow(item, index = 0) {
  const address = item?.address ?? {};
  const cc = String(address.country_code || "").toUpperCase();

  const streetParts = [address.house_number, address.road].filter(Boolean);
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.hamlet ||
    address.municipality ||
    address.suburb ||
    address.city_district ||
    (cc === "gb" || cc === "ie" ? address.county : null) ||
    "";

  const isoRegion = regionFromIso(address);
  const stateFromName = String(address.state || address.region || "").trim();
  const state =
    cc === "US" || cc === "CA"
      ? isoRegion || stateFromName
      : stateFromName;

  const postalCode = String(address.postcode || "").trim();
  const countryCode = cc;

  const id =
    item?.place_id != null && String(item.place_id) !== ""
      ? String(item.place_id)
      : item?.osm_id != null
        ? `osm-${String(item.osm_type || "rel")}-${item.osm_id}`
        : `nom-${index}`;

  const address1 = streetParts.join(" ").trim();
  const cityStr = String(city || "").trim();
  const nominatimDisplay = String(item?.display_name ?? "");

  const label = humanReadableSuggestionLabel({
    address1,
    city: cityStr,
    state,
    postalCode,
    country: countryCode,
    nominatimDisplay,
  });

  return {
    id,
    label: label || nominatimDisplay,
    address1,
    city: cityStr,
    state,
    postalCode,
    country: countryCode || "",
  };
}

async function fetchMapboxSuggestions(q, checkoutCountry) {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!token) return [];

  const path = encodeURIComponent(q);
  const params = new URLSearchParams({
    access_token: token,
    autocomplete: "true",
    limit: "8",
    types: "address",
  });
  const country = mapboxCountryFilter(checkoutCountry);
  if (country) params.append("country", country);

  const url = `${MAPBOX_GEOCODE}/${path}.json?${params.toString()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];

  const data = await response.json().catch(() => ({}));
  const features = Array.isArray(data?.features) ? data.features : [];

  return features
    .map((f, i) => mapboxFeatureToSuggestion(f, i))
    .filter((s) => s.id && s.label);
}

async function fetchNominatimSuggestions(q, checkoutCountry) {
  const countrycodes = allowedCountryCodes(checkoutCountry);
  const params = new URLSearchParams({
    q,
    format: "jsonv2",
    addressdetails: "1",
    limit: "8",
    countrycodes,
  });
  const url = `${NOMINATIM_BASE}?${params.toString()}`;

  let response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  });
  if (response.status === 429) {
    await new Promise((r) => setTimeout(r, 1000));
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
  }
  if (!response.ok) return [];

  const data = await response.json().catch(() => []);
  const rows = Array.isArray(data) ? data : [];

  return rows
    .map((row, i) => normalizeNominatimRow(row, i))
    .filter((s) => s.id && s.label);
}

function dedupeSuggestions(list) {
  const seenLabels = new Set();
  const out = [];
  for (const s of list) {
    const key = s.label.toLowerCase();
    if (seenLabels.has(key)) continue;
    seenLabels.add(key);
    out.push(s);
    if (out.length >= 8) break;
  }
  return out;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = String(searchParams.get("q") || "").trim();
  const checkoutCountry = String(searchParams.get("country") || "US").trim() || "US";

  if (q.length < 4) {
    return NextResponse.json({ ok: true, suggestions: [] });
  }

  try {
    const hasMapbox = Boolean(process.env.MAPBOX_ACCESS_TOKEN?.trim());

    let list = [];
    if (hasMapbox) {
      list = await fetchMapboxSuggestions(q, checkoutCountry);
    }
    if (list.length === 0) {
      list = await fetchNominatimSuggestions(q, checkoutCountry);
    }

    const suggestions = dedupeSuggestions(list);
    return NextResponse.json({ ok: true, suggestions });
  } catch {
    return NextResponse.json({ ok: false, suggestions: [] }, { status: 502 });
  }
}
