import React, { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  Link,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_META,
  type Vehicle,
} from "@/lib/vehicles";
import {
  createVehicle,
  fetchCategories,
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
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchSummary>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadHome = async () => {
      setLoading(true);
      setError(null);

      try {
        const [liveVehicles, liveSummary] = await Promise.all([
          fetchVehicles({ limit: 4, sort: "-createdAt" }),
          fetchSummary(),
        ]);

        if (!active) {
          return;
        }

        setVehicles(liveVehicles);
        setSummary(liveSummary.data);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard data");
        setVehicles([]);
        setSummary(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

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
          {loading ? (
            <div className="space-y-3">
              <div className="h-12 rounded-2xl bg-white/5" />
              <div className="h-12 rounded-2xl bg-white/5" />
              <div className="h-12 rounded-2xl bg-white/5" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-200">{error}</div>
          ) : summary ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat label="Vehicles" value={summary.totals.count} />
              <Stat
                label="Avg price"
                value={formatCurrency(summary.totals.averagePrice)}
              />
              <Stat label="Lowest" value={formatCurrency(summary.totals.minPrice)} />
              <Stat label="Highest" value={formatCurrency(summary.totals.maxPrice)} />
            </div>
          ) : null}
        </GlassCard>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
          <h2 className="text-2xl font-semibold">Latest vehicles</h2>
          <p className="text-sm text-white/60">
              Live inventory coming directly from MongoDB.
            </p>
          </div>
          <Link className="text-sm text-[color:var(--electric)] hover:underline" to="/vehicles">
            View all
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-white/60">
            No vehicles are stored in MongoDB yet. Add one from the admin page to
            populate the cards here.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-createdAt");

  useEffect(() => {
    let active = true;

    const loadVehicles = async () => {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchVehicles({
          search: search || undefined,
          category: category || undefined,
          status: status || undefined,
          sort,
        });

        if (active) {
          setVehicles(items);
        }
      } catch (loadError) {
        if (active) {
          setVehicles([]);
          setError(loadError instanceof Error ? loadError.message : "Failed to load inventory");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadVehicles();

    return () => {
      active = false;
    };
  }, [search, category, status, sort]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Inventory</h1>
        <p className="text-white/65">
          Search the current stock with a single query or a few quick filters.
        </p>
      </div>

      <GlassCard className="space-y-4 p-5">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr]">
          <div className="space-y-2 lg:col-span-1">
            <div className="text-sm text-white/60">Search</div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, city..."
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none placeholder:text-white/35 focus:border-[color:var(--electric)]"
            />
          </div>
          <SelectField
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { label: "All categories", value: "" },
              { label: "Electric cars", value: "electric-car" },
              { label: "Cargo bikes", value: "cargo-bike" },
            ]}
          />
          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { label: "All statuses", value: "" },
              { label: "Available", value: "available" },
              { label: "Reserved", value: "reserved" },
              { label: "Sold", value: "sold" },
            ]}
          />
          <SelectField
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Newest first", value: "-createdAt" },
              { label: "Price low to high", value: "priceEUR" },
              { label: "Price high to low", value: "-priceEUR" },
              { label: "Year newest", value: "-year" },
            ]}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-white/55">
            Showing the current inventory directly from MongoDB.
          </div>
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => {
              setSearch("");
              setCategory("");
              setStatus("");
              setSort("-createdAt");
            }}
          >
            Clear
          </Button>
        </div>
      </GlassCard>

      {loading ? (
        <div className="text-sm text-white/60">Loading inventory...</div>
      ) : error ? (
        <div className="text-sm text-red-200">{error}</div>
      ) : vehicles.length === 0 ? (
        <GlassCard className="border border-dashed border-white/15 bg-white/5 p-8">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
              ✦
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">
                {search || category || status ? "No vehicles match your filters" : "Your inventory is empty"}
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-white/65">
                {search || category || status
                  ? "Try clearing the filters or broadening your search to see vehicles already stored in MongoDB."
                  : "Add the first vehicle in the admin screen and it will appear here as a live MongoDB-backed card."}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {(search || category || status) && (
                <Button
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setStatus("");
                    setSort("-createdAt");
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Button asChild className="bg-[color:var(--electric)] text-black hover:bg-[color:var(--electric-2)]">
                <Link to="/admin">Add first vehicle</Link>
              </Button>
            </div>
          </div>
        </GlassCard>
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
          <div>Status: {prettyStatus(vehicle.status)}</div>
          <div>Body style: {vehicle.bodyStyle || "n/a"}</div>
          <div>Condition: {vehicle.condition || "n/a"}</div>
          <div>Fresh arrival: {vehicle.isNew ? "Yes" : "No"}</div>
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
  const auth = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(vehicleFormDefaults);

  const categoryOptions = useMemo(
    () => [
      { label: "Electric car", value: "electric-car" },
      { label: "Cargo bike", value: "cargo-bike" },
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { label: "Available", value: "available" },
      { label: "Reserved", value: "reserved" },
      { label: "Sold", value: "sold" },
    ],
    [],
  );

  if (!auth.isAuthenticated) {
    return (
      <GlassCard className="p-6">
        <h1 className="text-2xl font-semibold">Sign in to add inventory</h1>
        <p className="mt-2 text-white/70">
          The admin route is available after signing in with Asgardeo.
        </p>
      </GlassCard>
    );
  }

  const setField = <K extends keyof typeof vehicleFormDefaults>(key: K, value: (typeof vehicleFormDefaults)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <GlassCard className="space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Add vehicle</h1>
        <p className="text-white/70">
          A simple form for adding one clean inventory record at a time.
        </p>
      </div>

      <form
        className="space-y-6"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);
          setStatus(null);

          try {
            const idToken = await auth.getIdToken();
            const created = await createVehicle(
              {
                ...form,
                images: form.imageUrl
                  ? [{ url: form.imageUrl, alt: `${form.make} ${form.model}`.trim() }]
                  : [],
                priceEUR: Number(form.priceEUR),
                year: Number(form.year),
                summary: form.summary || `${form.make} ${form.model}`.trim(),
                featured: form.featured,
                freshArrival: form.freshArrival,
              },
              idToken,
            );

            setStatus(`Created ${created.make} ${created.model} in MongoDB.`);
            setForm(vehicleFormDefaults);
            navigate({ to: "/vehicles" });
          } catch (createError) {
            setError(createError instanceof Error ? createError.message : "Failed to save vehicle");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label="Category"
            value={form.category}
            onChange={(value) => setField("category", value)}
            options={categoryOptions}
          />
          <SelectField
            label="Status"
            value={form.status}
            onChange={(value) => setField("status", value)}
            options={statusOptions}
          />
          <Field label="Make" value={form.make} onChange={(value) => setField("make", value)} />
          <Field label="Model" value={form.model} onChange={(value) => setField("model", value)} />
          <Field label="Year" type="number" value={form.year} onChange={(value) => setField("year", value)} />
          <Field label="Price EUR" type="number" value={form.priceEUR} onChange={(value) => setField("priceEUR", value)} />
          <Field label="Location" value={form.location} onChange={(value) => setField("location", value)} />
          <Field label="Image URL" value={form.imageUrl} onChange={(value) => setField("imageUrl", value)} />
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Summary" value={form.summary} onChange={(value) => setField("summary", value)} />
          </div>
          <div className="flex flex-wrap gap-4 md:col-span-2 xl:col-span-3">
            <ToggleField
              label="Featured"
              checked={form.featured}
              onChange={(checked) => setField("featured", checked)}
            />
            <ToggleField
              label="Fresh arrival"
              checked={form.freshArrival}
              onChange={(checked) => setField("freshArrival", checked)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[color:var(--electric)] text-black hover:bg-[color:var(--electric-2)]"
          >
            {submitting ? "Saving..." : "Save vehicle"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={() => setForm(vehicleFormDefaults)}
          >
            Reset form
          </Button>
        </div>

        {status ? <div className="text-sm text-emerald-300">{status}</div> : null}
        {error ? <div className="text-sm text-red-200">{error}</div> : null}
      </form>
    </GlassCard>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-white/60">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[color:var(--electric)]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <label className="space-y-2">
      <div className="text-sm text-white/60">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-[color:var(--electric)]"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-sm text-white/70">{label}</span>
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

function prettyStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const vehicleFormDefaults = {
  category: "electric-car",
  status: "available",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  priceEUR: 0,
  location: "Berlin",
  imageUrl: "",
  summary: "",
  featured: true,
  freshArrival: true,
};
