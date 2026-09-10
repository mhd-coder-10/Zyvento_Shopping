

import { useCallback, useEffect, useId, useMemo, useState } from "react";

// Fallback categories used until a real category API is connected.
const FALLBACK_CATEGORIES = [
  { label: "All Products", href: "/products" },
  { label: "Electronics", href: "/products/electronics" },
  { label: "Mobiles", href: "/products/mobiles" },
  { label: "Fashion", href: "/products/fashion" },
  { label: "Beauty", href: "/products/beauty" },
  { label: "Home & Living", href: "/products/home" },
  { label: "Appliances", href: "/products/appliances" },
  { label: "Sports", href: "/products/sports" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "/help-center" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Shipping Information", href: "/shipping" },
  { label: "Returns & Refunds", href: "/returns-refunds" },
  { label: "Order Tracking", href: "/order-tracking" },
];

const COMPANY_LINKS = [
  { label: "About Zyvento", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Sell on Zyvento", href: "/sell" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

// Replace hrefs with the brand's real profile URLs when they go live.
const SOCIALS = [
  {
    label: "Zyvento Shopping on Facebook",
    href: "https://facebook.com/",
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.63A21 21 0 0 0 14.28 3.5c-2.4 0-4.05 1.47-4.05 4.16V9.9H7.5V13h2.73v8h3.27Z",
  },
  {
    label: "Zyvento Shopping on Instagram",
    href: "https://instagram.com/",
    path: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM17.8 7.2a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0ZM7.6 3h8.8A4.6 4.6 0 0 1 21 7.6v8.8a4.6 4.6 0 0 1-4.6 4.6H7.6A4.6 4.6 0 0 1 3 16.4V7.6A4.6 4.6 0 0 1 7.6 3Zm0 1.7A2.9 2.9 0 0 0 4.7 7.6v8.8a2.9 2.9 0 0 0 2.9 2.9h8.8a2.9 2.9 0 0 0 2.9-2.9V7.6a2.9 2.9 0 0 0-2.9-2.9H7.6Z",
  },
  {
    label: "Zyvento Shopping on X",
    href: "https://x.com/",
    path: "M17.53 3H20.5l-6.49 7.42L21.5 21h-5.9l-4.62-6.04L5.7 21H2.72l6.94-7.93L2.5 3h6.05l4.18 5.53L17.53 3Zm-1.04 16.2h1.64L7.6 4.71H5.84L16.49 19.2Z",
  },
  {
    label: "Zyvento Shopping on YouTube",
    href: "https://youtube.com/",
    path: "M21.6 7.9a2.5 2.5 0 0 0-1.76-1.77C18.26 5.7 12 5.7 12 5.7s-6.26 0-7.84.43A2.5 2.5 0 0 0 2.4 7.9 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.1 2.5 2.5 0 0 0 1.76 1.77c1.58.43 7.84.43 7.84.43s6.26 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.1ZM10.1 15V9l5.2 3-5.2 3Z",
  },
  {
    label: "Zyvento Shopping on LinkedIn",
    href: "https://linkedin.com/",
    path: "M6.94 8.75H3.6V21h3.34V8.75ZM5.27 3a1.94 1.94 0 1 0 0 3.88 1.94 1.94 0 0 0 0-3.88ZM20.4 13.9c0-3.2-1.71-4.7-4-4.7a3.45 3.45 0 0 0-3.13 1.72h-.05V8.75H9.9V21h3.34v-6.06c0-1.6.3-3.15 2.29-3.15 1.95 0 1.98 1.83 1.98 3.25V21h3.34v-7.1H20.4Z",
  },
];

const TRUST_ITEMS = [
  {
    title: "Secure Payments",
    copy: "Every transaction is encrypted and protected end to end.",
    path: "M12 2.5 4.5 5.6v6c0 4.5 3.2 8.7 7.5 9.9 4.3-1.2 7.5-5.4 7.5-9.9v-6L12 2.5Zm-1.1 12.6-3-3 1.4-1.4 1.6 1.6 4.3-4.3 1.4 1.4-5.7 5.7Z",
  },
  {
    title: "Easy Returns",
    copy: "Simple, hassle-free 7-day return window on eligible orders.",
    path: "M12 5V2L7.5 6.5 12 11V8a5 5 0 1 1-4.9 6h-2A7 7 0 1 0 12 5Z",
  },
  {
    title: "Fast Delivery",
    copy: "Reliable dispatch across 19,000+ pin codes nationwide.",
    path: "M3 6.5h10v8H3v-8Zm11 2.5h3.3l2.7 3.2v2.3h-6V9ZM6.5 19a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm10 0a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z",
  },
  {
    title: "24×7 Support",
    copy: "Real people, ready to help you whenever you need it.",
    path: "M12 2.8a8 8 0 0 0-8 8v5.4A2.8 2.8 0 0 0 6.8 19H9v-6.6H6v-1.6a6 6 0 1 1 12 0v1.6h-3V19h2.2A2.8 2.8 0 0 0 20 16.2v-5.4a8 8 0 0 0-8-8Z",
  },
];

const PAYMENTS = ["Visa", "Mastercard", "UPI", "RuPay", "Net Banking", "Cash on Delivery"];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Cookie Policy", href: "/cookies" },
];

const APP_STORES = [
  { store: "Google Play", tag: "Get it on", href: "/mobile-app" },
  { store: "App Store", tag: "Download on the", href: "/mobile-app" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Shared container so every footer band lines up on the same grid.
const CONTAINER = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

function FooterLinks({ links, id }) {
  return (
    <ul id={id} className="space-y-3.5 pb-6 md:pb-0">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            className="group inline-flex items-center gap-0 rounded-sm text-[15px] leading-6 text-slate-400 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:text-sm"
          >
            <span className="h-px w-0 bg-sky-400 transition-all duration-200 group-hover:mr-2 group-hover:w-3" />
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Footer column: accordion on mobile, always-open column on md+. */
function FooterColumn({ title, links, isOpen, onToggle }) {
  const panelId = `${useId()}-panel`;

  return (
    <nav aria-label={title} className="border-b border-white/10 md:border-0">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex min-h-[56px] w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 md:pointer-events-none md:mb-6 md:min-h-0 md:py-0 md:text-xs md:tracking-[0.18em] md:text-slate-200"
        >
          <span className="truncate">{title}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 md:hidden ${isOpen ? "rotate-180" : ""
              }`}
          >
            <path fill="currentColor" d="M12 15.4 5.6 9l1.4-1.4 5 5 5-5L18.4 9 12 15.4Z" />
          </svg>
        </button>
      </h3>

      {/* Grid-rows trick animates height without measuring the DOM. */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out md:!grid-rows-[1fr] md:opacity-100 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
      >
        <div className="overflow-hidden">
          <FooterLinks links={links} id={panelId} />
        </div>
      </div>
    </nav>
  );
}

function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  // Handles newsletter submission and prevents duplicate requests.
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (status === "loading") return;

      const value = email.trim();
      if (!EMAIL_PATTERN.test(value)) {
        setStatus("error");
        setMessage("Please enter a valid email address.");
        return;
      }

      setStatus("loading");
      setMessage("");
      try {
        // TODO(api): await ApiService.subscribeNewsletter({ email: value })
        setStatus("success");
        setMessage("You're subscribed. Watch your inbox for exclusive deals.");
        setEmail("");
      } catch {
        // Never surface raw technical errors to shoppers.
        setStatus("error");
        setMessage("We couldn't complete your subscription. Please try again.");
      }
    },
    [email, status],
  );

  return (
    <div className="border-b border-white/10 bg-slate-900/60">
      <div
        className={`${CONTAINER} grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-center lg:gap-16 lg:py-16`}
      >
        <div className="min-w-0">
          <p className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Zyvento Insider
          </p>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Stay updated with Zyvento
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-[15px] sm:leading-7">
            Get the latest deals, new arrivals and exclusive member offers delivered straight to
            your inbox. No spam — unsubscribe anytime.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="w-full min-w-0">
          <label htmlFor="zyvento2-newsletter" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <input
              id="zyvento2-newsletter"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Enter your email address"
              aria-invalid={status === "error"}
              aria-describedby="zyvento2-newsletter-status"
              className="h-14 w-full min-w-0 rounded-2xl border border-white/15 bg-slate-950/70 px-5 text-[15px] text-white placeholder:text-slate-500 transition duration-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-8 text-[15px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
          <p
            id="zyvento2-newsletter-status"
            role="status"
            aria-live="polite"
            className={`mt-3 min-h-[1.25rem] text-[13px] ${status === "error" ? "text-rose-400" : "text-emerald-400"
              }`}
          >
            {message}
          </p>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export default function Footer2() {
  // Controls which footer accordion is currently open on mobile.
  const [openSection, setOpenSection] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Categories would come from the category API once one exists; the fallback
  // list keeps the footer useful (and never blank) meanwhile.
  const categories = FALLBACK_CATEGORIES;

  const sections = useMemo(
    () => [
      { title: "Shop", links: categories },
      { title: "Customer Support", links: SUPPORT_LINKS },
      { title: "Company", links: COMPANY_LINKS },
    ],
    [categories],
  );

  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300">
      <NewsletterBand />

      {/* Main content: brand + navigation columns */}
      <div className={`${CONTAINER} py-12 sm:py-14 lg:py-20`}>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-16 lg:justify-between">

          {/* Brand */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <a
              href="/"
              className="flex items-center gap-3.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/30">
                Z
              </span>
              <span>
                <span className="block text-xl font-semibold leading-tight text-white">
                  Zyvento
                </span>
                <span className="block text-[0.7rem] uppercase tracking-[0.26em] text-slate-500">
                  Shopping
                </span>
              </span>
            </a>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-slate-400">
              Your trusted destination for quality products, great deals and a seamless shopping
              experience — backed by secure payments and dependable delivery.
            </p>

            {/* Socials */}
            <div className="mt-8 w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                Follow Zyvento
              </p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-sky-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                        <path fill="currentColor" d={social.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* App download */}
            <div className="mt-8 w-full">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                Shop on the go
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-md">
                {APP_STORES.map((app) => (
                  <a
                    key={app.store}
                    href={app.href}
                    className="inline-flex min-h-[60px] items-center gap-3.5 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0 text-sky-300">
                      <path fill="currentColor" d={app.path} />
                    </svg>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">
                        {app.tag}
                      </span>
                      <span className="block truncate text-[15px] font-semibold text-white">
                        {app.store}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12 items-start text-left">
              {sections.map((section) => (
                <FooterColumn
                  key={section.title}
                  title={section.title}
                  links={section.links}
                  isOpen={isDesktop || openSection === section.title}
                  onToggle={() =>
                    setOpenSection((prev) => (prev === section.title ? null : section.title))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust / service features */}
      <div className="border-y border-white/10 bg-slate-900/50">
        <div className={`${CONTAINER} grid grid-cols-2 gap-4 py-10 sm:gap-6 lg:grid-cols-4 lg:py-12`}>
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-white/20 sm:p-5 lg:flex-row lg:items-start lg:gap-4 lg:p-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600/15 text-sky-300">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                  <path fill="currentColor" d={item.path} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-white">{item.title}</span>
                <span className="mt-1.5 block text-[13px] leading-6 text-slate-400">
                  {item.copy}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Accepted payments */}
      <div className="border-b border-white/10">
        <div
          className={`${CONTAINER} flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Accepted payment methods
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {PAYMENTS.map((method) => (
              <li
                key={method}
                className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-medium text-slate-300"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className={`${CONTAINER} flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:justify-between`}
      >
        <p className="text-[13px] leading-6 text-slate-500">
          © {year} Zyvento Shopping. All rights reserved.
        </p>
        <nav aria-label="Legal">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="rounded-sm text-[13px] text-slate-500 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );

}
