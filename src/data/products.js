/**
 * Sale inventory — replace with CMS or database in production.
 * `priceUsd` is the listed price in US dollars (whole dollars).
 * `printfulVariantId` must be set when Printful integration is enabled.
 */
export const products = [
  {
    id: "p1",
    slug: "degas-landscape-study",
    title: "Landscape Study",
    artist: "Edgar Degas",
    year: "1892",
    medium: "Oil on canvas",
    dimensions: '18" × 24" framed',
    priceUsd: 4200,
    printfulVariantId: null,
    edition: "Unique",
    description:
      "Atmospheric study with the restrained palette and motion Degas brought to landscape—quiet horizon, soft earth, and light held in reserve. Suitable for a focused collection or a calm residential focal wall.",
    image:
      "https://images.metmuseum.org/CRDImages/dp/web-large/DP815958.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/dp/original/DP815958.jpg",
  },
  {
    id: "p2",
    slug: "rembrandt-portrait-lairesse",
    title: "Portrait of Gerard de Lairesse",
    artist: "Rembrandt",
    year: "1665–67",
    medium: "Oil on canvas",
    dimensions: '22" × 28" framed',
    priceUsd: 12800,
    printfulVariantId: 5243634308,
    edition: "Unique",
    description:
      "A masterclass in chiaroscuro and psychological presence. For collectors who want a historic anchor piece with museum-grade presence in the frame.",
    image:
      "https://images.metmuseum.org/CRDImages/rl/web-large/DP121332.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/rl/original/DP121332.jpg",
  },
  {
    id: "p3",
    slug: "blakelock-twilight-landscape",
    title: "Twilight Landscape",
    artist: "Ralph Albert Blakelock",
    year: "1885–95",
    medium: "Oil on canvas",
    dimensions: '20" × 30" framed',
    priceUsd: 7600,
    printfulVariantId: null,
    edition: "Unique",
    description:
      "Deep tonal field work—twilight read as texture. Ideal for interiors that favor low light and layered neutrals.",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/ap29.35.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/ad/original/ap29.35.jpg",
  },
  {
    id: "p4",
    slug: "inness-hudson-valley",
    title: "Hudson River Mood",
    artist: "George Inness",
    year: "1884",
    medium: "Oil on canvas",
    dimensions: '24" × 36" framed',
    priceUsd: 9100,
    printfulVariantId: null,
    edition: "Unique",
    description:
      "Tonal landscape with Inness’s spiritual softness—reads like memory rather than documentation. Strong pairing with contemporary minimal rooms.",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/DP276951.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/ad/original/DP276951.jpg",
  },
  {
    id: "p5",
    slug: "ryder-nocturne",
    title: "Nocturne Coast",
    artist: "Albert Pinkham Ryder",
    year: "1897–98",
    medium: "Oil on canvas",
    dimensions: '16" × 22" framed',
    priceUsd: 5400,
    printfulVariantId: null,
    edition: "Unique",
    description:
      "Small but intense—Ryder’s night sea as a single mood. Excellent for a study, landing, or paired salon hang.",
    image:
      "https://images.metmuseum.org/CRDImages/ad/web-large/ap52.199.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/ad/original/ap52.199.jpg",
  },
  {
    id: "p6",
    slug: "liu-yu-hanging-scroll",
    title: "Ink Landscape Scroll",
    artist: "Liu Yu",
    year: "1680",
    medium: "Hanging scroll, ink on silk",
    dimensions: "46 × 18 in mounted",
    priceUsd: 15200,
    printfulVariantId: null,
    edition: "Unique",
    description:
      "Vertical composition with disciplined brush rhythm—ideal for tall ceilings or a narrow architectural niche.",
    image:
      "https://images.metmuseum.org/CRDImages/as/web-large/DP205858_CRD.jpg",
    originalImage:
      "https://images.metmuseum.org/CRDImages/as/original/DP205858_CRD.jpg",
  },
];

const bySlug = new Map(products.map((p) => [p.slug, p]));

export function getProductBySlug(slug) {
  return bySlug.get(slug) ?? null;
}

export function getAllSlugs() {
  return products.map((p) => p.slug);
}
