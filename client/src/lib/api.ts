import { normalizeVehicle, type Vehicle } from "@/lib/vehicles";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

async function readJsonResponse(response: Response) {
  return response.json().catch(() => null);
}

function unwrapData<T>(payload: ApiEnvelope<T> | T | null | undefined, fallbackMessage: string): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    if (payload.data === undefined || payload.data === null) {
      throw new Error(payload.message || fallbackMessage);
    }

    return payload.data;
  }

  if (payload === undefined || payload === null) {
    throw new Error(fallbackMessage);
  }

  return payload as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const payload = await readJsonResponse(response);
    throw new Error(payload?.message || `Request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function fetchVehicles(
  params?: Record<string, string | number | boolean | undefined>,
) {
  const search = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    }
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  const result = await request<ApiEnvelope<Vehicle[]> | Vehicle[]>(`/api/vehicles${suffix}`);
  return unwrapData(result, "No vehicle list returned from the server").map(normalizeVehicle);
}

export async function fetchVehicle(id: string) {
  const result = await request<ApiEnvelope<Vehicle> | Vehicle>(`/api/vehicles/${id}`);
  return normalizeVehicle(
    unwrapData(result, "No vehicle details returned from the server") as Record<string, any>,
  );
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

export async function fetchCategories() {
  const result = await request<ApiEnvelope<string[]> | string[]>("/api/vehicles/categories");
  return unwrapData(result, "No categories returned from the server");
}

export async function fetchMyVehicles(idToken?: string) {
  const result = await request<ApiEnvelope<Vehicle[]> | Vehicle[]>("/api/vehicles/mine", {
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
  });
  return unwrapData(result, "No vehicle list returned from the server").map(normalizeVehicle);
}

export async function deleteVehicle(id: string, idToken?: string) {
  await request(`/api/vehicles/${id}`, {
    method: "DELETE",
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
  });
}

export async function createVehicle(vehicle: Partial<Vehicle>, idToken?: string) {
  const result = await request<ApiEnvelope<Vehicle> | Vehicle>("/api/vehicles", {
    method: "POST",
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(vehicle),
  });

  return normalizeVehicle(
    unwrapData(result, "The server did not return the created vehicle") as Record<string, any>,
  );
}

export async function updateVehicle(id: string, vehicle: Partial<Vehicle>, idToken?: string) {
  const result = await request<ApiEnvelope<Vehicle> | Vehicle>(`/api/vehicles/${id}`, {
    method: "PATCH",
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify(vehicle),
  });

  return normalizeVehicle(
    unwrapData(result, "The server did not return the updated vehicle") as Record<string, any>,
  );
}
