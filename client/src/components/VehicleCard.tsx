import { Link } from "@tanstack/react-router";
import { Battery, Gauge, MapPin } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { CATEGORY_META, type Vehicle } from "@/lib/vehicles";

const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const meta = CATEGORY_META[vehicle.category];

  return (
    <Link
      to="/vehicles/$id"
      params={{ id: vehicle.id }}
      className="group block"
    >
      <GlassCard className="overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/15">
        <div
          className="relative h-44 overflow-hidden"
          style={{ background: meta.gradient }}
        >
          <div className="absolute inset-0 grid place-items-center text-7xl opacity-80 transition group-hover:scale-110">
            {meta.emoji}
          </div>
          <span
            className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur"
            style={{ color: meta.accent }}
          >
            {meta.label}
          </span>
          <StatusPill status={vehicle.status} />
        </div>

        <div className="space-y-3 p-5 text-white">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50">
              {vehicle.year} · {vehicle.make}
            </div>
            <div className="text-lg font-semibold">{vehicle.model}</div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {vehicle.location}
            </span>
            {vehicle.range && (
              <span className="inline-flex items-center gap-1">
                <Battery className="h-3.5 w-3.5" /> {vehicle.range} km
              </span>
            )}
            {vehicle.power && (
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" /> {vehicle.power}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-white/10 pt-3">
            <div className="text-xs text-white/50">From</div>
            <div className="text-xl font-bold tracking-tight">
              {euro.format(vehicle.priceEUR)}
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

function StatusPill({ status }: { status: Vehicle["status"] }) {
  const map = {
    available: { label: "Available", color: "#22C55E" },
    reserved: { label: "Reserved", color: "#F59E0B" },
    sold: { label: "Sold", color: "#EF4444" },
  } as const;
  const { label, color } = map[status];
  return (
    <span
      className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur"
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {label}
    </span>
  );
}
