import { roundUsd2 } from "@/lib/money";
import { printfulRequest, isPrintfulEnabled } from "@/lib/printful/client";
import { slugify } from "@/lib/slug";

const SHIPPING_INCLUDED_BY_DEFAULT =
  process.env.NEXT_PUBLIC_PRICES_INCLUDE_SHIPPING === "true";

function normalizeMedium(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("canvas")) return "Canvas";
  return "Print";
}

async function getVariantCatalogDetails(variantId) {
  if (!variantId) return null;
  try {
    const data = await printfulRequest(`/products/variant/${variantId}`);
    return data?.result ?? null;
  } catch {
    return null;
  }
}

function parsePrice(retailPrice) {
  const num = Number.parseFloat(String(retailPrice ?? ""));
  if (Number.isFinite(num)) return roundUsd2(num);
  return 0;
}

function derivePriceBounds(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const prices = variants
    .map((v) => parsePrice(v?.retail_price))
    .filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length === 0) return null;
  return {
    minPriceUsd: roundUsd2(Math.min(...prices)),
    maxPriceUsd: roundUsd2(Math.max(...prices)),
  };
}

function mapVariantsForDisplay(variants) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((v) => {
      const priceUsd = parsePrice(v?.retail_price);
      return {
        id: v?.id ?? null,
        catalogVariantId: v?.variant_id ?? null,
        name: String(v?.name || v?.size || "Variant").trim(),
        size: String(v?.size || "").trim(),
        sku: v?.sku ?? null,
        priceUsd,
      };
    })
    .filter((v) => v.priceUsd > 0)
    .sort((a, b) => a.priceUsd - b.priceUsd);
}

/** Prefer variants Printful has not marked ignored; fall back if every row is ignored. */
function variantsForPricing(syncVariants) {
  if (!Array.isArray(syncVariants) || syncVariants.length === 0) return [];
  const active = syncVariants.filter((v) => v?.is_ignored !== true);
  return active.length > 0 ? active : syncVariants;
}

function pickPrimaryVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const withPrice = variants.find((v) => parsePrice(v?.retail_price) > 0);
  return withPrice ?? variants[0];
}

const STORE_PRODUCTS_PAGE_SIZE = 100;

/** Walk all paging offsets — a single `limit=100` request drops everything past 100 sync products. */
export async function listAllStoreProductSummaries() {
  const summaries = [];
  let offset = 0;
  let reportedTotal = null;

  for (;;) {
    const res = await printfulRequest(
      `/store/products?limit=${STORE_PRODUCTS_PAGE_SIZE}&offset=${offset}`,
    );
    const batch = Array.isArray(res?.result) ? res.result : [];
    if (reportedTotal === null && res?.paging != null) {
      const t = Number(res.paging.total);
      if (Number.isFinite(t)) reportedTotal = t;
    }
    summaries.push(...batch);
    if (batch.length === 0) break;
    offset += batch.length;
    if (reportedTotal !== null && summaries.length >= reportedTotal) break;
    if (batch.length < STORE_PRODUCTS_PAGE_SIZE) break;
  }

  return summaries;
}

function pickImage(sync, variant) {
  const files = Array.isArray(variant?.files) ? variant.files : [];
  const preferredFile =
    files.find((f) => f?.type === "default" && f?.preview_url) ||
    files.find((f) => f?.preview_url) ||
    null;
  const preview = preferredFile?.preview_url;
  if (preview) return preview;

  const thumb =
    files.find((f) => f?.type === "default" && f?.thumbnail_url)?.thumbnail_url ||
    files.find((f) => f?.thumbnail_url)?.thumbnail_url;
  if (thumb) return thumb;

  const fromSync = sync?.thumbnail_url || sync?.image;
  if (fromSync) return fromSync;

  if (variant?.image) return variant.image;

  return "";
}

function pickPrintFileUrl(sync, variant) {
  const files = Array.isArray(variant?.files) ? variant.files : [];
  const preferredFile =
    files.find((f) => f?.type === "default" && f?.url) ||
    files.find((f) => f?.url) ||
    null;
  if (preferredFile?.url) return preferredFile.url;

  // Fallback for stores where file metadata is sparse.
  if (sync?.thumbnail_url) return sync.thumbnail_url;
  if (sync?.image) return sync.image;
  if (variant?.image) return variant.image;
  return "";
}

function pickImageSize(variant) {
  const files = Array.isArray(variant?.files) ? variant.files : [];
  const withDims = files.find((f) => Number(f?.width) > 0 && Number(f?.height) > 0);
  if (withDims) {
    return {
      width: Number(withDims.width),
      height: Number(withDims.height),
    };
  }
  return { width: 1200, height: 1500 };
}

function splitArtistAndYear(name) {
  // Expected common format: "Title - Artist - Year"
  const parts = String(name || "")
    .split(" - ")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      title: parts[0],
      artist: parts[1],
      year: parts.slice(2).join(" - "),
    };
  }
  return { title: name, artist: "Studio", year: "" };
}

function toCatalogItem(detail, catalogDetails) {
  const sync = detail?.sync_product ?? {};
  const rawVariants = Array.isArray(detail?.sync_variants)
    ? detail.sync_variants
    : [];
  const variants = variantsForPricing(rawVariants);
  const variant = pickPrimaryVariant(variants) ?? {};
  const priceBounds = derivePriceBounds(variants);
  const mappedVariants = mapVariantsForDisplay(variants);
  const parsed = splitArtistAndYear(sync.name);
  const title = parsed.title || sync.name || "Untitled";
  const slug = slugify(sync.external_id || title);
  const providerProduct = catalogDetails?.product ?? {};
  const providerVariant = catalogDetails?.variant ?? {};
  const imageSize = pickImageSize(variant);
  const providerMedium =
    providerProduct.type_name || providerProduct.title || variant.product?.name || sync.name;
  const normalizedMedium = normalizeMedium(providerMedium);
  const image = pickImage(sync, variant) || providerVariant.image || "";
  const printFileUrl = pickPrintFileUrl(sync, variant) || image;
  const providerDescription = providerProduct.description || "";
  const providerSize = providerVariant.size || variant.size || variant.name || "Selected variant";
  const catalogUpdatedAt =
    Number(sync.updated) ||
    Number(sync.created) ||
    Number(sync.updated_at) ||
    Number(sync.created_at) ||
    0;
  return {
    id: `pf-${sync.id}`,
    catalogUpdatedAt,
    printfulProductId: sync.id,
    variantId: variant.id ?? null,
    catalogVariantId: variant.variant_id ?? null,
    externalId: sync.external_id ?? null,
    slug,
    title,
    artist: parsed.artist || "Studio",
    year: parsed.year || "",
    medium: normalizedMedium,
    dimensions: providerSize,
    description:
      providerDescription ||
      "This piece is fulfilled on demand and ships directly after order processing.",
    edition: "Open edition",
    priceUsd: parsePrice(variant.retail_price),
    minPriceUsd: priceBounds?.minPriceUsd ?? parsePrice(variant.retail_price),
    maxPriceUsd: priceBounds?.maxPriceUsd ?? parsePrice(variant.retail_price),
    variants: mappedVariants,
    image,
    originalImage: printFileUrl,
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    shippingIncluded: SHIPPING_INCLUDED_BY_DEFAULT,
    sku: variant.sku ?? null,
  };
}

function fallbackFromReference() {
  return [];
}

export async function getCatalogProducts() {
  if (!isPrintfulEnabled()) {
    return fallbackFromReference();
  }

  try {
    const products = await listAllStoreProductSummaries();
    const details = await Promise.all(
      products.map((p) => printfulRequest(`/store/products/${p.id}`)),
    );
    const catalogDetails = await Promise.all(
      details.map((d) => {
        const variants = Array.isArray(d?.result?.sync_variants)
          ? d.result.sync_variants
          : [];
        const primary = pickPrimaryVariant(variants);
        return getVariantCatalogDetails(primary?.variant_id);
      }),
    );
    const mapped = details
      .map((d, i) => ({ detail: d?.result, catalog: catalogDetails[i] }))
      .filter((x) => x.detail)
      .map(({ detail, catalog }) => toCatalogItem(detail, catalog))
      .filter(Boolean)
      .filter((p) => p.variantId && p.priceUsd > 0);
    return mapped;
  } catch {
    return [];
  }
}

export async function getCatalogProductBySlug(slug) {
  const products = await getCatalogProducts();
  return products.find((p) => p.slug === slug) ?? null;
}
