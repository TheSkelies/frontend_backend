import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
    }
});

// Перехватчик запросов — добавляет токен из localStorage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    createProduct: async (product) => {
        const response = await apiClient.post("/products", product);
        return response.data;
    },

    getProducts: async () => {
        const response = await apiClient.get("/products");
        return response.data;
    },

    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },

    login: async (credentials) => {
        const response = await apiClient.post("/auth/login", credentials);
        return response.data; // { accessToken, refreshToken }
    },

    register: async (userData) => {
        const response = await apiClient.post("/auth/register", userData);
        return response.data;
    },

    me: async () => {
        const response = await apiClient.get(`auth/me`);
        return response.data;
    },

    getUsers: async () => {
        const response = await apiClient.get("/users");
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data;
    }

};