// // API Configuration
// const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3001";

// export default API_BASE_URL;


// API Configuration (Vercel + Vite safe)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "VITE_API_BASE_URL is not defined. Add it in Vercel → Settings → Environment Variables"
  );
}

export default API_BASE_URL;
