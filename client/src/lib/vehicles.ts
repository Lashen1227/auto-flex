export type VehicleCategory = "electric-car" | "cargo-bike" | string;

export type VehicleStatus = "available" | "reserved" | "sold";

export interface Vehicle {
  id: string;
  slug?: string;
  category: VehicleCategory;
  model: string;
  year: number;
  priceEUR: number;
  status: VehicleStatus;
  location: string;
  summary?: string;
  description?: string;
  range?: number | null;
  rangeKm?: number | null;
  power?: string;
  drivetrain?: string;
  transmission?: string;
  color?: string;
  seats?: number | null;
  mileageKm?: number | null;
  bodyStyle?: string;
  condition?: string;
  features?: string[];
  createdBy?: string;
  stockCount?: number;
  availability?: boolean;
  featured?: boolean;
  isNew?: boolean;
  freshArrival?: boolean;
  stockNumber?: string;
}

export const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; accent: string; gradient: string }
> = {
  "electric-car": {
    label: "Electric Cars",
    emoji: "🚗",
    accent: "#8DD8FF",
    gradient: "linear-gradient(135deg, #1E3A8A 0%, #0EA5E9 55%, #1D4ED8 100%)",
  },
  "cargo-bike": {
    label: "Cargo Bikes",
    emoji: "🚲",
    accent: "#A7F3D0",
    gradient: "linear-gradient(135deg, #14532D 0%, #10B981 55%, #0F766E 100%)",
  },
  default: {
    label: "Vehicle",
    emoji: "🚗",
    accent: "#D1D5DB",
    gradient: "linear-gradient(135deg, #334155 0%, #475569 55%, #1E293B 100%)",
  },
};

export function normalizeVehicle(raw: Record<string, any> = {}): Vehicle {
  return {
    id: String(raw.id ?? raw._id ?? raw.slug ?? ""),
    slug: raw.slug,
    category: raw.category ?? "default",
    model: raw.model ?? "",
    year: Number(raw.year ?? 0),
    priceEUR: Number(raw.priceEUR ?? 0),
    status: raw.status ?? "available",
    location: raw.location ?? "",
    summary: raw.summary ?? "",
    description: raw.description ?? "",
    range: raw.range ?? raw.rangeKm ?? null,
    rangeKm: raw.rangeKm ?? raw.range ?? null,
    power: raw.power ?? "",
    drivetrain: raw.drivetrain ?? "",
    transmission: raw.transmission ?? "",
    color: raw.color ?? "",
    seats: raw.seats ?? null,
    mileageKm: raw.mileageKm ?? null,
    bodyStyle: raw.bodyStyle ?? "",
    condition: raw.condition ?? "",
    features: Array.isArray(raw.features) ? raw.features : [],
    createdBy: raw.createdBy ?? "",
    stockCount: raw.stockCount ?? 1,
    availability: raw.availability ?? true,
    featured: Boolean(raw.featured),
    isNew: Boolean(raw.isNew ?? raw.freshArrival),
    freshArrival: Boolean(raw.freshArrival ?? raw.isNew),
    stockNumber: raw.stockNumber ?? "",
  };
}
