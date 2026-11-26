import { useCallback, useEffect, useState } from "react";

// The products and the orders live in the Laravel + MySQL backend.
// In development, vite.config.js sends  /api  and  /storage  to  http://127.0.0.1:8000

async function api(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  let payload;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`/api/${path}`, { method, headers, body: payload });
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
    return Array.isArray(list) && list.length > 0 ? list : null; // an empty saved list is not useful
  } catch {
    return null;
  }
};

// asks the server up to 3 times (the first request after "php artisan serve" can be slow)
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
  // start with the last list from the database, so the page never shows an old list first
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