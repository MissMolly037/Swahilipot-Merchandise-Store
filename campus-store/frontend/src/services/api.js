import axios from "axios";

const API_BASE = "http://localhost:8000/api";

const api = axios.create({
	baseURL: API_BASE,
	headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;
			const refresh = localStorage.getItem("refresh_token");
			if (refresh) {
				try {
					const { data } = await axios.post(`${API_BASE}/token/refresh/`, {
						refresh,
					});
					localStorage.setItem("access_token", data.access);
					original.headers.Authorization = `Bearer ${data.access}`;
					return api(original);
				} catch {
					localStorage.clear();
					window.location.href = "/login";
				}
			}
		}
		return Promise.reject(error);
	},
);

export default api;

// Auth
export const authService = {
	register: (data) => api.post("/register/", data),
	login: (data) => api.post("/login/", data),
	getProfile: () => api.get("/profile/"),
	updateProfile: (data) => api.patch("/profile/", data),
};

// Products
export const productService = {
	getAll: (params) => api.get("/products/", { params }),
	getOne: (id) => api.get(`/products/${id}/`),
	getCategories: () => api.get("/categories/"),
};

// Orders
export const orderService = {
	create: (data) => api.post("/orders/", data),
	getAll: () => api.get("/orders/"),
	getOne: (id) => api.get(`/orders/${id}/`),
	downloadReceipt: (id) =>
		api.get(`/orders/${id}/receipt/`, { responseType: "blob" }),
};

// Team
export const teamService = {
	getAll: () => api.get("/team/"),
};

// Contact
export const contactService = {
	send: (data) => api.post("/contact/", data),
};
