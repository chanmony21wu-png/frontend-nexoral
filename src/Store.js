import { useCallback, useEffect, useState } from "react";

// Live site: VITE_API_URL is set in Vercel (https://backend-nexoral-app.onrender.com/api)
// Local dev: not set, so it falls back to "/api" and the Vite proxy sends it to Laravel
const API_URL = import.meta.env.VITE_API_URL || "/api";

async function api(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}/${path}`, { method, headers, body: payload });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty answer */
  }

  if (!res.ok) throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
  return data;
}

const CACHE_KEY = "nexora_products_cache";

const readCache = () => {
  try {
    const list = JSON.parse(localStorage.getItem(CACHE_KEY));
    return Array.isArray(list) && list.length > 0 ? list : null;
  } catch {
    return null;
  }
};

// asks the server up to 3 times (Render's free server can take a while to wake up)
async function fetchProducts() {
  let lastError;
  for (let n = 0; n < 3; n++) {
    try {
      return await api("products");
    } catch (e) {
      lastError = e;
      await new Promise((r) => setTimeout(r, 700 * (n + 1)));
    }
  }
  throw lastError;
}

let running = null; // one request at a time

export function useProducts() {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return { products: cached || [], loaded: Boolean(cached), error: false, loading: !cached };
  });

  const reload = useCallback(() => {
    if (!running) {
      running = fetchProducts().finally(() => {
        running = null;
      });
    }
    return running.then(
      (products) => {
        try {
          if (products.length > 0) localStorage.setItem(CACHE_KEY, JSON.stringify(products));
          else localStorage.removeItem(CACHE_KEY);
        } catch {
          /* storage full */
        }
        setState({ products, loaded: true, error: false, loading: false });
      },
      () => setState((s) => ({ ...s, error: true, loading: false }))
    );
  }, []);

  useEffect(() => {
    reload();
    const onShow = () => document.visibilityState === "visible" && reload();
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("focus", reload);
    const timer = setInterval(reload, 30000);
    return () => {
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("focus", reload);
      clearInterval(timer);
    };
  }, [reload]);

  return { ...state, reload };
}

// the cart is sent as a list of product ids; the server works out the prices
export const addOrder = (cart, customer = {}) =>
  api("orders", { method: "POST", body: { items: cart.map((p) => p.id), ...customer } });