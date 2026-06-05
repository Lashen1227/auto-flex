import React, { useEffect, useState } from "react";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
} from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_META,
  normalizeVehicle,
  type Vehicle,
} from "@/lib/vehicles";
import {
  createVehicle,
  fetchSummary,
  fetchVehicle,
  fetchVehicles,
} from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const vehiclesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "vehicles",
  component: VehiclesPage,
});

const vehicleDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "vehicles/$id",
  component: VehicleDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  vehiclesRoute,
  vehicleDetailRoute,
  adminRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RootLayout() {
  return (
    <div className="min-h-screen text-white">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSummary>>["data"] | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    void fetchVehicles({ featured: true, limit: 4 })
      .then((items) => {
        if (active) setVehicles(items);
      })
      .catch(() => {
        if (active) setVehicles([]);
      });

    void fetchSummary()
      .then((result) => {
        if (active) setSummary(result.data);
      })
      .catch(() => {
        if (active) setSummary(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const featured = vehicles.length > 0 ? vehicles : defaultVehicles;

  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-[color:var(--panel)] p-8 shadow-2xl shadow-black/30 backdrop-blur md:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60">
            Germany dealership prototype
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
            A flexible inventory platform for electric cars and cargo bikes.
          </h1>
          <p className="max-w-2xl text-base text-white/70 md:text-lg">
            AutoFlex is built to grow. The backend can add new vehicle categories
            over time without changing the front door of the app.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-[color:var(--electric)] text-black hover:bg-[color:var(--electric-2)]">
              <Link to="/vehicles">Browse inventory</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link to="/admin">Add a vehicle</Link>
            </Button>
          </div>
        </div>

        <GlassCard tone="strong" className="space-y-5 p-6">
          <div className="text-sm uppercase tracking-[0.35em] text-white/50">Live stats</div>
          {summary ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat label="Vehicles" value={summary.totals.count} />
              <Stat
                label="Avg price"
                value={new Intl.NumberFormat("de-DE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(summary.totals.averagePrice)}
              />
              <Stat label="Lowest" value={formatCurrency(summary.totals.minPrice)} />
              <Stat label="Highest" value={formatCurrency(summary.totals.maxPrice)} />
            </div>
          ) : (
            <div className="text-sm text-white/60">Loading live inventory stats...</div>
          )}
        </GlassCard>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured vehicles</h2>
            <p className="text-sm text-white/60">
              Seed inventory coming from MongoDB, ready to expand with more models.
            </p>
          </div>
          <Link className="text-sm text-[color:var(--electric)] hover:underline" to="/vehicles">
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </section>
    </div>
  );
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    void fetchVehicles({
      search: search || undefined,
      category: category || undefined,
    })
      .then((items) => {
        if (active) setVehicles(items);
      })
      .catch(() => {
        if (active) setVehicles([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <p className="text-white/65">
          Filter the current stock and let the inventory grow with the business.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search make, model, city, category..."
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/35 focus:border-[color:var(--electric)]"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[color:var(--electric)]"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_META)
            .filter(([key]) => key !== "default")
            .map(([key, meta]) => (
              <option key={key} value={key} className="bg-slate-900">
                {meta.label}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading inventory...</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleDetailPage() {
  const { id } = vehicleDetailRoute.useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);

    void fetchVehicle(id)
      .then((item) => {
        if (active) setVehicle(item);
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return <div className="text-sm text-red-300">{error}</div>;
  }

  if (!vehicle) {
    return <div className="text-sm text-white/60">Loading vehicle details...</div>;
  }

  const meta = CATEGORY_META[vehicle.category] ?? CATEGORY_META.default;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="overflow-hidden">
        <div className="relative h-72" style={{ background: meta.gradient }}>
          <div className="absolute inset-0 grid place-items-center text-8xl">{meta.emoji}</div>
          <div className="absolute left-5 top-5 rounded-full bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80 backdrop-blur">
            {meta.label}
          </div>
        </div>
        <div className="space-y-4 p-6">
          <div className="text-sm uppercase tracking-[0.3em] text-white/45">
            {vehicle.year} · {vehicle.make}
          </div>
          <h1 className="text-3xl font-semibold">{vehicle.model}</h1>
          <p className="text-white/70">{vehicle.description || vehicle.summary}</p>
          <div className="flex flex-wrap gap-2 text-sm text-white/65">
            <InfoPill text={vehicle.location} />
            {vehicle.range ? <InfoPill text={`${vehicle.range} km range`} /> : null}
            {vehicle.power ? <InfoPill text={vehicle.power} /> : null}
            {vehicle.drivetrain ? <InfoPill text={vehicle.drivetrain} /> : null}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-5 p-6">
        <div className="text-sm uppercase tracking-[0.3em] text-white/45">Price</div>
        <div className="text-4xl font-semibold">{formatCurrency(vehicle.priceEUR)}</div>
        <div className="space-y-2 text-sm text-white/70">
          <div>Status: {vehicle.status}</div>
          <div>Body style: {vehicle.bodyStyle || "n/a"}</div>
          <div>Condition: {vehicle.condition || "n/a"}</div>
        </div>
        <div className="space-y-3 border-t border-white/10 pt-4">
          <div className="text-sm uppercase tracking-[0.3em] text-white/45">Features</div>
          <div className="flex flex-wrap gap-2">
            {(vehicle.features || []).map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function AdminPage() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <GlassCard className="p-6">
        <h1 className="text-2xl font-semibold">Sign in to add inventory</h1>
        <p className="mt-2 text-white/70">
          The admin route is available after signing in with the demo auth stub.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Add vehicle</h1>
        <p className="text-white/70">
          A lightweight form for creating new vehicle records in MongoDB.
        </p>
      </div>

      <VehicleForm
        onCreated={(message) => {
          setStatus(message);
        }}
      />
      {status ? <div className="text-sm text-emerald-300">{status}</div> : null}
    </GlassCard>
  );
}

function VehicleForm({ onCreated }: { onCreated: (message: string) => void }) {
  const [form, setForm] = useState({
    category: "electric-car",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    priceEUR: 0,
    location: "Berlin",
  });

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const created = await createVehicle({
          ...form,
          summary: `${form.make} ${form.model}`.trim(),
          status: "available",
          featured: false,
          isNew: true,
        });
        onCreated(`Created ${created.make} ${created.model} (${created.id})`);
      }}
    >
      <Field
        label="Category"
        value={form.category}
        onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
      />
      <Field
        label="Make"
        value={form.make}
        onChange={(value) => setForm((prev) => ({ ...prev, make: value }))}
      />
      <Field
        label="Model"
        value={form.model}
        onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
      />
      <Field
        label="Location"
        value={form.location}
        onChange={(value) => setForm((prev) => ({ ...prev, location: value }))}
      />
      <Field
        label="Year"
        type="number"
        value={String(form.year)}
        onChange={(value) => setForm((prev) => ({ ...prev, year: Number(value) }))}
      />
      <Field
        label="Price EUR"
        type="number"
        value={String(form.priceEUR)}
        onChange={(value) => setForm((prev) => ({ ...prev, priceEUR: Number(value) }))}
      />
      <div className="md:col-span-2">
        <Button className="bg-[color:var(--electric)] text-black hover:bg-[color:var(--electric-2)]">
          Save vehicle
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-white/60">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[color:var(--electric)]"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InfoPill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      {text}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const defaultVehicles = [
  normalizeVehicle({
    id: "demo-1",
    category: "electric-car",
    make: "Tesla",
    model: "Model Y",
    year: 2025,
    priceEUR: 49990,
    status: "available",
    location: "Berlin",
    rangeKm: 533,
    power: "378 kW",
  }),
  normalizeVehicle({
    id: "demo-2",
    category: "cargo-bike",
    make: "UrbanRide",
    model: "Cargo Longtail",
    year: 2025,
    priceEUR: 5290,
    status: "available",
    location: "Hamburg",
    rangeKm: 110,
    power: "250 W",
  }),
];
