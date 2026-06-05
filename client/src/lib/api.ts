import { normalizeVehicle, type Vehicle } from "@/lib/vehicles";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `Request failed with ${response.status}`);
  }

  return response.json();
}

export async function fetchVehicles(params?: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    }
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  const result = await request<{ data: Vehicle[] }>(`/api/vehicles${suffix}`);
  return result.data.map(normalizeVehicle);
}

export async function fetchVehicle(id: string) {
  const result = await request<{ data: Vehicle }>(`/api/vehicles/${id}`);
  return normalizeVehicle(result.data);
}

export async function fetchSummary() {
  return request<{
    data: {
      byCategory: Array<{ _id: string; count: number; minPrice: number; maxPrice: number }>;
      byStatus: Array<{ _id: string; count: number }>;
      totals: { count: number; averagePrice: number; minPrice: number; maxPrice: number };
    };
  }>("/api/vehicles/summary");
}

export async function createVehicle(vehicle: Partial<Vehicle>) {
  const result = await request<{ data: Vehicle }>("/api/vehicles", {
    method: "POST",
    body: JSON.stringify(vehicle),
  });

  return normalizeVehicle(result.data);
}
