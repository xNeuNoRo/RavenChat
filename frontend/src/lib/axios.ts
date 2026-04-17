import axios from "axios";

// Instancia de Axios configurada para comunicarse con la API del backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  proxy: false,
});
