// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001";

// Log the API URL in development to help with debugging
if (import.meta.env.DEV) {
  console.log("API Base URL:", API_BASE_URL);
}

export default API_BASE_URL;
