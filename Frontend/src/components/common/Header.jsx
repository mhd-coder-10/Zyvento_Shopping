import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser, clearAuthData } from "../../store/slices/authSlice";

import {
  Menu,
  Search,
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  X,
  Home,
  Package,
  Settings,
  Bell,
  LogOut,
  LogIn,
  MapPin,
  LifeBuoy,
  TrendingUp,
  Clock,
  ShoppingBag,
  Store,
} from "lucide-react";

import ApiService from "../../api/ApiService";

const ROUTES = {
  home: "/",
  login: "/login",
  products: "/products",
  profile: "/profile",
  orders: "/orders",
  wishlist: "/wishlist",
  cart: "/cart",
  addresses: "/addresses",
  notifications: "/notifications",
  settings: "/settings",
  seller: "/become-seller",
  help: "/help-center",
};

const go = (url) => {
  if (typeof window !== "undefined") window.location.assign(url);
};

const qs = (params) => {
  const sp = new URLSearchParams();
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v !== undefined && v !== null && String(v).length > 0) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
};

const goToProducts = (params) => go(ROUTES.products + qs(params));

const AUTH_EVENT = "zv-auth-change";

const readToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setToken(readToken());
    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!token) {
      setUser(null);
      return undefined;
    }
    ApiService.getProfile()
      .then((res) => {
        if (!alive) return;
        const d = res && res.data ? res.data : {};
        setUser(d.user || d.data || d);
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return { isAuthenticated: !!token, user, ready };
};

const pickCount = (payload, keys) => {
  if (!payload) return 0;
  const d = payload.data !== undefined ? payload.data : payload;
  if (typeof d === "number") return d;
  const src = d && typeof d === "object" ? d : {};
  for (let i = 0; i < keys.length; i += 1) {
    const v = src[keys[i]];
    if (typeof v === "number") return v;
  }
  const list = src.items || src.products || src.wishlist || src.notifications || src.results;
  if (Array.isArray(list)) return list.length;
  if (Array.isArray(d)) return d.length;
  return 0;
};

const useHeaderCounts = (isAuthenticated) => {
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0, notifications: 0 });

  useEffect(() => {
    let alive = true;
    if (!isAuthenticated) {
      setCounts({ cart: 0, wishlist: 0, notifications: 0 });
      return undefined;
    }

    const set = (key, value) =>
      alive && setCounts((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));

    ApiService.getCartCount()
      .then((res) => set("cart", pickCount(res.data, ["count", "totalItems", "itemCount", "cartCount"])))
      .catch(() => set("cart", 0));

    ApiService.getWishlist({ page: 1, limit: 1 })
      .then((res) => set("wishlist", pickCount(res.data, ["count", "total", "totalItems", "totalCount"])))
      .catch(() => set("wishlist", 0));

    ApiService.getUnreadNotifications({ page: 1, limit: 1 })
      .then((res) =>
        set("notifications", pickCount(res.data, ["count", "unreadCount", "total", "totalCount"])),
      )
      .catch(() => set("notifications", 0));

    return () => {
      alive = false;
    };
  }, [isAuthenticated]);

  return counts;
};

const getCategoryIcon = (categoryName) => {
  const icons = {
    "Electronics": "💻",
    "Mobiles": "📱",
    "Fashion": "👔",
    "Beauty": "💄",
    "Home": "🏠",
    "Appliances": "🔌",
    "Grocery": "🛒",
    "Furniture": "🪑",
    "Sports": "⚽",
    "Books": "📚",
    "Toys": "🧸",
  };
  return icons[categoryName] || "📂";
};

const fallbackCategories = [
  { name: "Electronics" },
  { name: "Mobiles" },
  { name: "Fashion" },
  { name: "Beauty" },
  { name: "Home" },
  { name: "Appliances" },
  { name: "Grocery" },
  { name: "Furniture" },
  { name: "Sports" },
  { name: "Books" },
  { name: "Toys" },
].map((c) => ({ ...c, id: null, icon: getCategoryIcon(c.name) }));

const normaliseCategories = (payload) => {
  const d = payload && payload.data !== undefined ? payload.data : payload;
  const list = Array.isArray(d)
    ? d
    : (d && (d.categories || d.data || d.items || d.results)) || [];
  if (!Array.isArray(list)) return [];

  return list
    .filter((c) => c && (c.name || c.title))
    .map((c) => {
      const name = c.name || c.title;
      return {
        id: c._id || c.id || null,
        name: name,
        icon: getCategoryIcon(name),
      };
    });
};

const useCategories = () => {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    ApiService.getActiveCategories()
      .then((res) => {
        if (!alive) return;

        const next = normaliseCategories(res.data);

        if (next.length) {
          setCategories(next);
        }
      })
      .catch((error) => {
        console.error("getActiveCategories error:", error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);


  return { categories, loading };
};

const openCategory = (cat) => goToProducts({ category: cat.id || undefined, categoryName: cat.name });

const css = `
.zv-header *,
.zv-header *::before,
.zv-header *::after { box-sizing: border-box; }
.zv-header,
.zv-drawer-root {
  --zv-primary: #2563EB;
  --zv-primary-dark: #1D4ED8;
  --zv-dark: #0F172A;
  --zv-bg: #FFFFFF;
  --zv-bg-2: #F8FAFC;
  --zv-border: #E2E8F0;
  --zv-muted: #64748B;
  font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.zv-header {
  position: sticky; top: 0; z-index: 60;
  background: var(--zv-bg);
  border-bottom: 1px solid transparent;
  transition: box-shadow .2s ease, border-color .2s ease;
}
.zv-header.zv-scrolled {
  border-bottom-color: var(--zv-border);
  box-shadow: 0 6px 20px -12px rgba(15,23,42,.35);
}
.zv-header button { font: inherit; cursor: pointer; }
.zv-header a { text-decoration: none; color: inherit; }
.zv-header :focus-visible,
.zv-drawer-root :focus-visible {
  outline: 2px solid var(--zv-primary); outline-offset: 2px; border-radius: 8px;
}
.zv-wrap { max-width: 1440px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 1024px) { .zv-wrap { padding: 0 24px; } }

.zv-top { display: flex; align-items: center; gap: 12px; height: 60px; }
@media (min-width: 1024px) { .zv-top { height: 72px; gap: 24px; } }

.zv-logo { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; min-width: 0; }
.zv-logo-mark {
  width: 36px; height: 36px; border-radius: 10px; flex: 0 0 auto;
  display: grid; place-items: center; color: #fff;
  background: linear-gradient(135deg, #2563EB, #1E3A8A);
  box-shadow: 0 6px 14px -6px rgba(37,99,235,.7);
}
@media (min-width: 1024px) { .zv-logo-mark { width: 40px; height: 40px; } }
.zv-logo-text { display: flex; flex-direction: column; line-height: 1; min-width: 0; }
.zv-logo-1 {
  font-size: 18px; font-weight: 800; letter-spacing: -.4px; color: var(--zv-dark);
  white-space: nowrap;
}
@media (min-width: 1024px) { .zv-logo-1 { font-size: 21px; } }
.zv-logo-2 {
  font-size: 10px; font-weight: 600; letter-spacing: 2.4px; text-transform: uppercase;
  color: var(--zv-primary); margin-top: 3px; white-space: nowrap;
}

.zv-search { position: relative; flex: 1 1 auto; min-width: 0; }
.zv-search-box {
  display: flex; align-items: center; gap: 10px;
  background: var(--zv-bg-2);
  border: 1px solid var(--zv-border);
  border-radius: 10px; padding: 0 10px 0 12px; height: 44px;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.zv-search-box:hover { border-color: #CBD5E1; }
.zv-search-box.zv-focus {
  background: #fff; border-color: var(--zv-primary);
  box-shadow: 0 0 0 3px rgba(37,99,235,.15);
}
.zv-search-box input {
  flex: 1 1 auto; min-width: 0; border: 0; background: transparent; outline: none;
  font-size: 14px; color: var(--zv-dark); height: 100%;
}
.zv-search-box input::placeholder { color: var(--zv-muted); }
.zv-icon-muted { color: var(--zv-muted); flex: 0 0 auto; }
.zv-clear {
  border: 0; background: transparent; color: var(--zv-muted);
  display: grid; place-items: center; width: 28px; height: 28px; border-radius: 999px;
}
.zv-clear:hover { background: #E2E8F0; color: var(--zv-dark); }
.zv-search-go {
  border: 0; background: var(--zv-primary); color: #fff; height: 32px;
  padding: 0 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
  display: none;
}
.zv-search-go:hover { background: var(--zv-primary-dark); }
@media (min-width: 768px) { .zv-search-go { display: inline-flex; align-items: center; } }

.zv-suggest {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0;
  background: #fff; border: 1px solid var(--zv-border); border-radius: 12px;
  box-shadow: 0 24px 50px -20px rgba(15,23,42,.35); padding: 8px; z-index: 70;
  max-height: 70vh; overflow-y: auto;
  animation: zv-fade .14s ease-out;
}
.zv-suggest-title {
  font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: var(--zv-muted); padding: 10px 12px 6px;
}
.zv-suggest-item {
  width: 100%; display: flex; align-items: center; gap: 10px; text-align: left;
  border: 0; background: transparent; padding: 10px 12px; border-radius: 8px;
  font-size: 14px; color: var(--zv-dark);
}
.zv-suggest-item:hover { background: var(--zv-bg-2); }

.zv-actions { display: flex; align-items: center; gap: 4px; flex: 0 0 auto; }
@media (min-width: 1024px) { .zv-actions { gap: 8px; } }
.zv-action {
  position: relative; display: inline-flex; align-items: center; gap: 8px;
  min-height: 44px; min-width: 44px; justify-content: center;
  padding: 0 10px; border: 0; background: transparent; border-radius: 10px;
  font-size: 14px; font-weight: 600; color: var(--zv-dark);
}
.zv-action:hover { background: var(--zv-bg-2); color: var(--zv-primary); }
.zv-action-label { display: none; }
@media (min-width: 1024px) { .zv-action-label { display: inline; } }
.zv-badge {
  position: absolute; top: 4px; left: 50%; transform: translateX(2px);
  min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
  background: #EF4444; color: #fff; font-size: 10px; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  border: 2px solid #fff; line-height: 1;
}
@media (min-width: 1024px) { .zv-badge { left: 26px; transform: none; } }
.zv-only-mobile { display: inline-flex; }
@media (min-width: 1024px) { .zv-only-mobile { display: none; } }
.zv-only-desktop { display: none; }
@media (min-width: 1024px) { .zv-only-desktop { display: inline-flex; } }

.zv-account { position: relative; }
.zv-menu {
  position: absolute; right: 0; top: calc(100% + 8px); width: 240px;
  background: #fff; border: 1px solid var(--zv-border); border-radius: 12px;
  box-shadow: 0 24px 50px -20px rgba(15,23,42,.35); padding: 8px; z-index: 70;
  animation: zv-fade .14s ease-out;
}
.zv-menu-head { padding: 10px 12px; border-bottom: 1px solid var(--zv-border); margin-bottom: 6px; }
.zv-menu-head b { display: block; font-size: 14px; color: var(--zv-dark); }
.zv-menu-head span { font-size: 12px; color: var(--zv-muted); }
.zv-menu-item {
  width: 100%; display: flex; align-items: center; gap: 10px; text-align: left;
  border: 0; background: transparent; padding: 10px 12px; border-radius: 8px;
  font-size: 14px; color: var(--zv-dark);
}
.zv-menu-item:hover { background: var(--zv-bg-2); color: var(--zv-primary); }
.zv-menu-sep { height: 1px; background: var(--zv-border); margin: 6px 4px; }
.zv-danger { color: #DC2626; }
.zv-danger:hover { background: #FEF2F2; color: #DC2626; }

.zv-mobile-search { padding-bottom: 10px; }
@media (min-width: 1024px) { .zv-mobile-search { display: none; } }

.zv-nav { border-top: 1px solid var(--zv-border); background: #fff; }
.zv-nav-scroll {
  display: flex; align-items: center; gap: 2px; overflow-x: auto; scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.zv-nav-scroll::-webkit-scrollbar { display: none; }
.zv-nav-item {
  display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
  border: 0; background: transparent; padding: 12px 12px; font-size: 13.5px;
  font-weight: 600; color: var(--zv-dark); border-bottom: 2px solid transparent;
}
.zv-nav-item:hover, .zv-nav-item.zv-open { color: var(--zv-primary); border-bottom-color: var(--zv-primary); }
.zv-nav-item.zv-all { color: var(--zv-primary); }
.zv-chev { transition: transform .18s ease; }
.zv-nav-item.zv-open .zv-chev { transform: rotate(180deg); }

.zv-nav-relative { position: relative; }

.zv-mega-wrapper {
  position: absolute;
  left: 12px;
  top: 100%;
  padding-top: 8px;
  z-index: 65;
  min-width: 220px;
  max-width: 280px;
  width: auto;
}

.zv-mega {
  background: #fff;
  border: 1px solid var(--zv-border);
  border-radius: 12px;
  box-shadow: 0 24px 50px -20px rgba(15,23,42,.35);
  animation: zv-slide .16s ease-out;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.zv-mega::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
.zv-mega {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.zv-mega-vertical {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zv-mega-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  width: 100%;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: var(--zv-dark);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.zv-mega-item:hover {
  background: var(--zv-bg-2);
  color: var(--zv-primary);
}
.zv-mega-item .zv-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.zv-backdrop {
  position: fixed; inset: 0; background: rgba(15,23,42,.5); z-index: 90;
  animation: zv-fade .18s ease-out; border: 0; width: 100%;
}
.zv-drawer {
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
  width: min(86vw, 340px); background: #fff; display: flex; flex-direction: column;
  animation: zv-in .22s cubic-bezier(.22,.61,.36,1);
  box-shadow: 24px 0 60px -30px rgba(15,23,42,.6);
}
.zv-drawer-head {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 16px; border-bottom: 1px solid var(--zv-border);
}
.zv-drawer-body { overflow-y: auto; padding: 8px 8px 32px; flex: 1 1 auto; }
.zv-drawer-sec {
  font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--zv-muted); padding: 16px 12px 6px;
}
.zv-drawer-item {
  width: 100%; display: flex; align-items: center; gap: 12px; text-align: left;
  border: 0; background: transparent; padding: 12px; border-radius: 10px;
  min-height: 46px; font-size: 14.5px; font-weight: 500; color: var(--zv-dark);
}
.zv-drawer-item:hover { background: var(--zv-bg-2); color: var(--zv-primary); }
.zv-drawer-item .zv-grow { flex: 1 1 auto; }
.zv-drawer-item .zv-item-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}
.zv-close {
  border: 0; background: transparent; color: var(--zv-muted);
  width: 44px; height: 44px; border-radius: 10px; display: grid; place-items: center;
}
.zv-close:hover { background: var(--zv-bg-2); color: var(--zv-dark); }

@keyframes zv-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes zv-slide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
@keyframes zv-in { from { transform: translateX(-100%); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .zv-header *, .zv-drawer, .zv-backdrop { animation: none !important; transition: none !important; }
}

@media (max-width: 1024px) {
  .zv-mega-wrapper {
    left: 8px;
    max-width: 260px;
    min-width: 200px;
  }
}
@media (max-width: 768px) {
  .zv-mega-wrapper {
    left: 4px;
    max-width: 220px;
    min-width: 180px;
  }
}
`;

const Logo = () => (
  <a href={ROUTES.home} className="zv-logo" aria-label="Zyvento Shopping home">
    <span className="zv-logo-mark" aria-hidden="true">
      <ShoppingBag size={20} strokeWidth={2.2} />
    </span>
    <span className="zv-logo-text">
      <span className="zv-logo-1">Zyvento</span>
      <span className="zv-logo-2">Shopping</span>
    </span>
  </a>
);

const RECENT_KEY = "zv-recent-searches";
const trendingSearches = ["Laptops", "Smart Watches", "Men's Fashion", "Air Fryer"];

const readRecent = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, 5) : [];
  } catch {
    return [];
  }
};

const pushRecent = (term) => {
  try {
    const list = [term, ...readRecent().filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    return list;
  } catch {
    return readRecent();
  }
};

const normaliseProducts = (payload) => {
  const d = payload && payload.data !== undefined ? payload.data : payload;
  const list = Array.isArray(d) ? d : (d && (d.products || d.data || d.items || d.results)) || [];
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p && (p.name || p.title))
    .slice(0, 6)
    .map((p) => ({ id: p._id || p.id || null, name: p.name || p.title }));
};

const SearchBar = ({ id }) => {

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      ApiService.getAllProducts({ search: term, page: 1, limit: 10 })
        .then((res) => {
          if (alive) setSuggestions(normaliseProducts(res.data));
        })
        .catch(() => {
          if (alive) setSuggestions([]);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [value]);

  const runSearch = useCallback((raw) => {
    const term = (raw || "").trim();
    if (!term) return;
    setRecent(pushRecent(term));
    setOpen(false);
    navigate(`/search-results?q=${encodeURIComponent(term)}`);
  }, [navigate]);

  const submit = (e) => {
    e.preventDefault();
    runSearch(value);
  };

  const typing = value.trim().length >= 2;

  return (
    <div className="zv-search" ref={ref}>
      <form
        className={"zv-search-box" + (open ? " zv-focus" : "")}
        role="search"
        onSubmit={submit}
      >
        <Search size={18} className="zv-icon-muted" aria-hidden="true" />
        <label htmlFor={id} className="zv-sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Search products
        </label>
        <input
          id={id}
          ref={inputRef}
          type="search"
          value={value}
          autoComplete="off"
          placeholder="Search for products, brands and more..."
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              runSearch(value);
            }
          }}
        />
        {value && (
          <button type="button" className="zv-clear" aria-label="Clear search" onClick={() => { setValue(""); setSuggestions([]); inputRef.current && inputRef.current.focus(); }}>
            <X size={16} />
          </button>
        )}
        <button type="submit" className="zv-search-go">Search</button>
      </form>

      {open && (
        <div className="zv-suggest" role="listbox" aria-label="Search suggestions">
          {typing ? (
            <>
              <p className="zv-suggest-title">{loading ? "Searching..." : "Suggestions"}</p>
              {!loading && suggestions.length === 0 && (
                <button type="button" className="zv-suggest-item" onClick={() => runSearch(value)}>
                  <Search size={16} className="zv-icon-muted" aria-hidden="true" />
                  {`Search for "${value.trim()}"`}
                </button>
              )}
              {suggestions.map((s) => (
                <button
                  key={(s.id || "") + s.name}
                  type="button"
                  className="zv-suggest-item"
                  onClick={() => { setValue(s.name); runSearch(s.name); }}
                >
                  <Search size={16} className="zv-icon-muted" aria-hidden="true" />
                  {s.name}
                </button>
              ))}
            </>
          ) : (
            <>
              {recent.length > 0 && <p className="zv-suggest-title">Recent Searches</p>}
              {recent.map((s) => (
                <button key={s} type="button" className="zv-suggest-item" onClick={() => { setValue(s); runSearch(s); }}>
                  <Clock size={16} className="zv-icon-muted" aria-hidden="true" />
                  {s}
                </button>
              ))}
              <p className="zv-suggest-title">Trending Searches</p>
              {trendingSearches.map((s) => (
                <button key={s} type="button" className="zv-suggest-item" onClick={() => { setValue(s); runSearch(s); }}>
                  <TrendingUp size={16} className="zv-icon-muted" aria-hidden="true" />
                  {s}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const authedLinks = [
  { label: "My Profile", icon: User, to: ROUTES.profile },
  { label: "My Orders", icon: Package, to: ROUTES.orders },
  { label: "Wishlist", icon: Heart, to: ROUTES.wishlist },
  { label: "Saved Addresses", icon: MapPin, to: ROUTES.addresses },
  { label: "Notifications", icon: Bell, to: ROUTES.notifications },
  { label: "Become a Seller", icon: Store, to: ROUTES.seller },
  { label: "Settings", icon: Settings, to: ROUTES.settings },
];

const AccountMenu = ({ isAuthenticated, user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const displayName = useMemo(() => {
    if (!user) return null;
    return user.name || user.fullName || user.firstName || user.username || user.email || null;
  }, [user]);

  return (
    <div className="zv-account" ref={ref}>
      <button
        type="button"
        className="zv-action"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <User size={20} aria-hidden="true" />
        <span className="zv-action-label">Account</span>
        <ChevronDown size={14} className="zv-only-desktop zv-chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="zv-menu" role="menu">
          <div className="zv-menu-head">
            <b>{isAuthenticated ? (displayName ? `Hi, ${displayName}` : "Welcome back") : "Welcome"}</b>
            <span>{isAuthenticated ? "Manage your account and orders" : "Sign in to access your orders"}</span>
          </div>

          {isAuthenticated ? (
            <>
              {authedLinks.map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  className="zv-menu-item"
                  onClick={() => { setOpen(false); go(to); }}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              ))}
              <div className="zv-menu-sep" />
              <button
                type="button"
                role="menuitem"
                className="zv-menu-item zv-danger"
                onClick={() => { setOpen(false); onLogout(); }}
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="zv-menu-item"
              onClick={() => { setOpen(false); go(ROUTES.login); }}
            >
              <LogIn size={16} aria-hidden="true" />
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryNav = ({ categories }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!categories.length) return null;

  return (
    <nav className="zv-nav zv-nav-relative" aria-label="Product categories" ref={ref}>
      <div className="zv-wrap">
        <div className="zv-nav-scroll">
          <button
            type="button"
            className={"zv-nav-item zv-all" + (open ? " zv-open" : "")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={() => setOpen(true)}
          >
            <Menu size={16} aria-hidden="true" />
            All Categories
            <ChevronDown size={14} className="zv-chev" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="zv-mega-wrapper"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="zv-mega" role="region" aria-label="All categories">
            <div className="zv-mega-vertical">
              {categories.map((cat) => (
                <button
                  key={(cat.id || "") + cat.name}
                  type="button"
                  className="zv-mega-item"
                  onClick={() => { setOpen(false); openCategory(cat); }}
                >
                  <span className="zv-icon">{cat.icon || "📂"}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const MobileDrawer = ({ open, onClose, categories, isAuthenticated, onLogout }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="zv-drawer-root">
      <div className="zv-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="zv-drawer" role="dialog" aria-modal="true" aria-label="Main menu">
        <div className="zv-drawer-head">
          <Logo />
          <button type="button" className="zv-close" aria-label="Close menu" onClick={onClose}>
            <X size={22} />
          </button>
        </div>
        <div className="zv-drawer-body">
          <button type="button" className="zv-drawer-item" onClick={() => { onClose(); go(ROUTES.home); }}>
            <Home size={18} aria-hidden="true" /> Home
          </button>

          <p className="zv-drawer-sec">Shop by Category</p>
          <button
            type="button"
            className="zv-drawer-item"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            <Menu size={18} aria-hidden="true" />
            <span className="zv-grow">All Categories</span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .18s ease" }}
            />
          </button>
          {expanded && categories.map((cat) => (
            <button
              key={(cat.id || "") + cat.name}
              type="button"
              className="zv-drawer-item"
              style={{ paddingLeft: "32px" }}
              onClick={() => { onClose(); openCategory(cat); }}
            >
              <span className="zv-item-icon">{cat.icon || "📂"}</span>
              <span className="zv-grow">{cat.name}</span>
            </button>
          ))}

          <p className="zv-drawer-sec">My Account</p>
          {isAuthenticated ? (
            authedLinks.map(({ label, icon: Icon, to }) => (
              <button key={label} type="button" className="zv-drawer-item" onClick={() => { onClose(); go(to); }}>
                <Icon size={18} aria-hidden="true" /> {label}
              </button>
            ))
          ) : (
            <button type="button" className="zv-drawer-item" onClick={() => { onClose(); go(ROUTES.login); }}>
              <LogIn size={18} aria-hidden="true" /> Login
            </button>
          )}
          <button type="button" className="zv-drawer-item" onClick={() => { onClose(); go(ROUTES.help); }}>
            <LifeBuoy size={18} aria-hidden="true" /> Help & Support
          </button>
          {isAuthenticated && (
            <>
              <div className="zv-menu-sep" />
              <button type="button" className="zv-drawer-item zv-danger" onClick={() => { onClose(); onLogout(); }}>
                <LogOut size={18} aria-hidden="true" /> Logout
              </button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

const Header2 = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { categories } = useCategories();
  const counts = useHeaderCounts(isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle Logout
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const result = await dispatch(logoutUser());
      // Navigation handled here
      if (result.meta.requestStatus === 'fulfilled') {
        navigate('/login', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }, [dispatch, navigate, isLoggingOut]);


  const fmt = (n) => (n > 999 ? "999+" : String(n));
  const wishlistCount = counts.wishlist;
  const cartCount = counts.cart;

  return (
    <>
      <style>{css}</style>
      <header className={"zv-header" + (scrolled ? " zv-scrolled" : "")}>
        <div className="zv-wrap">
          <div className="zv-top">
            <button
              type="button"
              className="zv-action zv-only-mobile"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={22} aria-hidden="true" />
            </button>

            <Logo />

            <div className="zv-only-desktop" style={{ flex: "1 1 auto", minWidth: 0 }}>
              <SearchBar id="zv-search-desktop" />
            </div>

            <div className="zv-actions">
              <div className="zv-only-desktop">
                <AccountMenu isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
              </div>
              <button
                type="button"
                className="zv-action"
                aria-label={`Wishlist, ${wishlistCount} items`}
                onClick={() => go(isAuthenticated ? ROUTES.wishlist : ROUTES.login)}
              >
                <Heart size={20} aria-hidden="true" />
                <span className="zv-action-label">Wishlist</span>
                {wishlistCount > 0 && <span className="zv-badge">{fmt(wishlistCount)}</span>}
              </button>
              <button
                type="button"
                className="zv-action"
                aria-label={`Cart, ${cartCount} items`}
                onClick={() => go(isAuthenticated ? ROUTES.cart : ROUTES.login)}
              >
                <ShoppingCart size={20} aria-hidden="true" />
                <span className="zv-action-label">Cart</span>
                {cartCount > 0 && <span className="zv-badge">{fmt(cartCount)}</span>}
              </button>
            </div>
          </div>

          <div className="zv-mobile-search">
            <SearchBar id="zv-search-mobile" />
          </div>
        </div>

        <CategoryNav categories={categories} />
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header2;