export const gbp = (n) =>
  n == null ? "Price on request"
    : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(n));

export const PROFESSIONS = [
  "M&A lawyer", "Real estate lawyer", "Accountant", "Real estate appraiser",
  "Business valuator", "Tax advisor", "Broker",
];

export const TYPES = {
  business: { label: "Business", path: "/businesses", plural: "Businesses for sale" },
  realestate: { label: "Real estate", path: "/real-estate", plural: "Real estate for sale" },
  event: { label: "Event", path: "/events", plural: "Events" },
  community: { label: "Community", path: "/communities", plural: "Communities" },
};

export const eventDate = (d) =>
  d == null ? null : new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
