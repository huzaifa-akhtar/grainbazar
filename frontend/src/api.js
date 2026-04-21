/**
 * api.js — Central API configuration
 * 
 * LOCAL DEV:  set VITE_API_URL in frontend/.env  (or leave blank to use default below)
 * PRODUCTION: set VITE_API_URL in Vercel environment variables to your Railway/Render backend URL
 *
 * Example .env file:
 *   VITE_API_URL=https://grainbazar-backend.up.railway.app/api
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default API_URL;
