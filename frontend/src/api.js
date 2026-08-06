// Petit client HTTP basé sur fetch (aucune dépendance externe à installer).
const API_BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // pas de corps JSON
  }

  if (!res.ok) {
    const message = (data && data.detail) || `Erreur ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  me: () => request("/api/auth/me", { auth: true }),

  createBooking: (payload) => request("/api/consultations", { method: "POST", body: payload }),
  myBookings: () => request("/api/consultations/mine", { auth: true }),

  listPacks: () => request("/api/packs"),
  myPurchases: () => request("/api/packs/mine", { auth: true }),
  checkoutPack: (packId) =>
    request("/api/payments/checkout-pack", { method: "POST", body: { pack_id: packId }, auth: true }),
  checkoutConsultation: (bookingId) =>
    request(`/api/payments/checkout-consultation/${bookingId}`, { method: "POST" }),

  getTcfQuestions: (section) => request(`/api/tcf/questions?section=${section}`),
  getExpressionPrompt: (section) => request(`/api/tcf/expression-prompts?section=${section}`),
  submitTcfTest: (payload) => request("/api/tcf/submit", { method: "POST", body: payload, auth: true }),
  myAttempts: () => request("/api/tcf/attempts", { auth: true }),
  correctionCredits: () => request("/api/tcf/correction-credits", { auth: true }),
  submitExpression: (payload) =>
    request("/api/tcf/expression/submit", { method: "POST", body: payload, auth: true }),
  myExpressions: () => request("/api/tcf/expression/mine", { auth: true }),
};

export { getToken };
