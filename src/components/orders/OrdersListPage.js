"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  RiArrowRightSLine,
  RiFileList2Line,
  RiMailSendLine,
  RiSearchLine,
} from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseAuth } from "@firebase/client";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import * as overlayChrome from "@/lib/overlayChrome";
import { fetchOrdersForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";
import { isLightThemeId } from "@/theme";

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

/** @param {unknown[]} lines */
function totalLineQuantity(lines) {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, l) => sum + Number(l?.quantity ?? 0), 0);
}

/** @param {unknown[]} lines */
function linesPreview(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { primary: "No line items", extra: 0 };
  }
  const titles = lines
    .map((l) => (l && typeof l.title === "string" ? l.title.trim() : ""))
    .filter(Boolean);
  if (titles.length === 0) {
    return { primary: `${lines.length} item(s)`, extra: 0 };
  }
  const [first, ...rest] = titles;
  return { primary: first, extra: rest.length };
}

/** @param {Record<string, unknown> | null | undefined} addr */
function shipToSummary(addr) {
  if (!addr || typeof addr !== "object") return null;
  const fullName =
    typeof addr.fullName === "string" ? addr.fullName.trim() : "";
  const city = typeof addr.city === "string" ? addr.city.trim() : "";
  const state = typeof addr.state === "string" ? addr.state.trim() : "";
  const country = typeof addr.country === "string" ? addr.country.trim() : "";
  const locality = [city, state].filter(Boolean).join(", ");
  const tail = [locality, country].filter(Boolean).join(" · ");
  if (fullName && tail) return `${fullName} · ${tail}`;
  if (fullName) return fullName;
  if (tail) return tail;
  return null;
}

/** @param {Record<string, unknown> | null | undefined} f */
function fulfillmentLabel(f) {
  if (!f || typeof f !== "object") return null;
  const provider = f.provider != null ? String(f.provider) : "";
  const status = f.providerStatus != null ? String(f.providerStatus) : "";
  if (provider && status) return `${provider} · ${status}`;
  if (status) return status;
  if (provider) return provider;
  return null;
}

/** @param {unknown} payment */
function paymentHint(payment) {
  if (!payment || typeof payment !== "object") return null;
  if (payment.provider === "paypal") return "PayPal";
  if (typeof payment.provider === "string" && payment.provider)
    return payment.provider;
  if ("paypalCaptureId" in payment || "paypalOrderId" in payment) return "PayPal";
  return null;
}

/** @param {Record<string, unknown> | null | undefined} order @param {string} q */
function orderMatchesSearch(order, q) {
  if (!order || typeof order !== "object") return false;
  const haystacks = [];
  if (order.id != null) haystacks.push(String(order.id));
  if (typeof order.email === "string") haystacks.push(order.email);
  if (typeof order.phone === "string") haystacks.push(order.phone);
  if (typeof order.notes === "string") haystacks.push(order.notes);
  const addr = order.shippingAddress;
  if (addr && typeof addr === "object") {
    const a = /** @type {Record<string, unknown>} */ (addr);
    for (const k of [
      "fullName",
      "address1",
      "address2",
      "city",
      "state",
      "postalCode",
      "country",
    ]) {
      const v = a[k];
      if (typeof v === "string") haystacks.push(v);
    }
  }
  const lines = order.lines;
  if (Array.isArray(lines)) {
    for (const line of lines) {
      if (!line || typeof line !== "object") continue;
      const l = /** @type {Record<string, unknown>} */ (line);
      for (const k of ["title", "slug", "artist", "sku"]) {
        const v = l[k];
        if (typeof v === "string") haystacks.push(v);
      }
    }
  }
  const fulfillment = order.fulfillment;
  if (fulfillment && typeof fulfillment === "object") {
    const f = /** @type {Record<string, unknown>} */ (fulfillment);
    for (const k of ["provider", "providerOrderId", "providerStatus"]) {
      const v = f[k];
      if (v != null) haystacks.push(String(v));
    }
  }
  const payment = order.payment;
  if (payment && typeof payment === "object") {
    const p = /** @type {Record<string, unknown>} */ (payment);
    for (const k of ["provider", "paypalOrderId", "paypalCaptureId"]) {
      const v = p[k];
      if (v != null) haystacks.push(String(v));
    }
  }
  const combined = haystacks.filter(Boolean).join(" ").toLowerCase();
  return combined.includes(q);
}

const PAGE_SIZE = 10;

/**
 * @param {{ ordersBasePath?: string }} props
 */
export default function OrdersListPage({
  ordersBasePath = "/dashboard/orders",
}) {
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [resendState, setResendState] = useState({
    orderId: null,
    loading: false,
    message: null,
    error: null,
  });
  const [expandedById, setExpandedById] = useState({});

  function toggleOrderExpanded(orderId) {
    setExpandedById((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  }

  async function handleResendOrderEmail(orderId, e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAdmin) return;
    setResendState({
      orderId,
      loading: true,
      message: null,
      error: null,
    });
    try {
      const auth = getFirebaseAuth();
      const u = auth.currentUser;
      if (!u) throw new Error("Sign in again to send email.");
      const token = await u.getIdToken();
      const res = await fetch("/api/orders/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not send email.",
        );
      }
      setResendState({
        orderId,
        loading: false,
        message:
          "Order details emailed to the buyer. The shop inbox was CC'd when it is not the same as the buyer.",
        error: null,
      });
      window.setTimeout(() => {
        setResendState((s) =>
          s.message ? { ...s, message: null } : s,
        );
      }, 6000);
    } catch (err) {
      setResendState({
        orderId: null,
        loading: false,
        message: null,
        error: err instanceof Error ? err.message : "Could not send email.",
      });
    }
  }

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await fetchOrdersForCurrentUser();
        if (!cancelled) setOrders(list);
      } catch (e) {
        const code = e?.code;
        const msg =
          code === "permission-denied"
            ? "Could not load orders. Deploy updated Firestore rules if you just added dashboard reads."
            : e instanceof Error
              ? e.message
              : "Could not load orders.";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    setPage(1);
  }, [user?.uid]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, emailFilter]);

  const uniqueEmails = useMemo(() => {
    const set = new Set();
    for (const o of orders) {
      if (o && typeof o === "object" && typeof o.email === "string") {
        const e = o.email.trim();
        if (e) set.add(e);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => orderMatchesSearch(o, q));
    }
    if (emailFilter.trim()) {
      const want = emailFilter.trim().toLowerCase();
      list = list.filter(
        (o) =>
          typeof o.email === "string" &&
          o.email.trim().toLowerCase() === want,
      );
    }
    return list;
  }, [orders, searchQuery, emailFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const rangeStart =
    filteredOrders.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredOrders.length);

  const hasActiveFilters = Boolean(searchQuery.trim() || emailFilter);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className={`text-sm ${overlayChrome.pageMutedText(light)}`}>Loading…</p>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="mx-auto max-w-4xl">
        <p className={overlayChrome.pageMutedText(light)}>
          Sign in to see orders linked to your email.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className={dash.dashboardPageTitle(light)}>Orders</h1>
        <p className={`mt-3 max-w-2xl text-lg leading-relaxed ${light ? "text-stone-700" : "text-stone-300/95"}`}>
          Orders placed with{" "}
          <span className={light ? "text-stone-900" : "text-stone-200"}>{user.email}</span>{" "}
          at checkout.
        </p>
      </div>

      {loading ? (
        <p className={`text-sm ${overlayChrome.pageMutedText(light)}`}>Loading orders…</p>
      ) : error ? (
        <p
          className={`text-sm ${light ? "text-rose-700" : "text-red-400/90"}`}
          role="alert"
        >
          {error}
        </p>
      ) : orders.length === 0 ? (
        <div className={dash.ordersEmptyPanel(light)}>
          <p className={overlayChrome.pageMutedText(light)}>No orders yet.</p>
          <Link
            href="/shop"
            className={`mt-4 inline-block text-sm font-semibold ${dash.ordersLinkAccent(light)}`}
          >
            Browse the shop →
          </Link>
        </div>
      ) : (
        <>
        {resendState.message ? (
          <p className={dash.dashSuccessBanner(light)} role="status">
            {resendState.message}
          </p>
        ) : null}
        {resendState.error ? (
          <p className={dash.dashErrorBanner(light)} role="alert">
            {resendState.error}
          </p>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[min(100%,18rem)]">
            <label
              htmlFor="orders-search"
              className={`mb-1.5 block text-xs font-medium uppercase tracking-wider ${light ? "text-stone-600" : "text-slate-500"}`}
            >
              Search
            </label>
            <div className="relative">
              <RiSearchLine
                className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${light ? "text-stone-500" : "text-slate-500"}`}
                aria-hidden
              />
              <input
                id="orders-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order ID, items, address, phone…"
                autoComplete="off"
                className={dash.ordersSearchInput(light)}
              />
            </div>
          </div>
          {isAdmin ? (
            <div className="w-full sm:w-72">
              <label
                htmlFor="orders-email-filter"
                className={`mb-1.5 block text-xs font-medium uppercase tracking-wider ${light ? "text-stone-600" : "text-slate-500"}`}
              >
                Customer email
              </label>
              <select
                id="orders-email-filter"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className={dash.ordersSelect(light)}
              >
                <option value="">All addresses</option>
                {uniqueEmails.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setEmailFilter("");
              }}
              className={dash.ordersGhostButton(light)}
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {filteredOrders.length === 0 ? (
          <div className={dash.ordersEmptyPanel(light)}>
            <p className={overlayChrome.pageMutedText(light)}>
              {isAdmin
                ? "No orders match your search or email filter."
                : "No orders match your search."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setEmailFilter("");
                }}
                className={`mt-4 text-sm font-semibold ${dash.ordersLinkAccent(light)}`}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
        <ul className="flex flex-col gap-4">
          {pagedOrders.map((o) => {
            const lines = Array.isArray(o.lines) ? o.lines : [];
            const lineCount = lines.length;
            const qty = totalLineQuantity(lines);
            const preview = linesPreview(lines);
            const shipTo = shipToSummary(o.shippingAddress);
            const fulfill = fulfillmentLabel(o.fulfillment);
            const pay = paymentHint(o.payment);
            const sub = Number(o.subtotalUsd ?? 0);
            const ship = Number(o.shippingUsd ?? 0);

            const resendBusy =
              resendState.loading && resendState.orderId === o.id;
            const isOpen = Boolean(expandedById[o.id]);

            return (
              <li key={o.id}>
                <div className={dash.ordersListRow(light)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() => toggleOrderExpanded(o.id)}
                        aria-expanded={isOpen}
                        aria-controls={`order-panel-${o.id}`}
                        id={`order-expand-${o.id}`}
                        title={isOpen ? "Collapse order" : "Expand order"}
                        className={dash.ordersExpandButton(light)}
                      >
                        <RiArrowRightSLine
                          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                          aria-hidden
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`${ordersBasePath}/${encodeURIComponent(o.id)}`}
                              className={dash.ordersMonoLink(light)}
                            >
                              {o.id}
                            </Link>                            
                          </div>
                          <div className="shrink-0 text-right">
                            <p
                              className={`text-lg font-semibold tabular-nums ${light ? "text-stone-900" : "text-stone-100"}`}
                            >
                              {formatUsd(o.totalUsd ?? 0)}
                            </p>
                          </div>
                        </div>

                        {!isOpen ? (
                          <p
                            className={`mt-3 line-clamp-2 text-sm ${light ? "text-stone-600" : "text-stone-400"}`}
                          >
                            <span className={light ? "text-stone-500" : "text-slate-600"}>
                              Summary ·{" "}
                            </span>
                            {preview.primary}
                            {preview.extra > 0 ? (
                              <span className={light ? "text-stone-500" : "text-slate-600"}>
                                {" "}
                                (+{preview.extra} more)
                              </span>
                            ) : null}
                            {shipTo ? (
                              <>
                                <span className={light ? "text-stone-500" : "text-slate-600"}>
                                  {" "}
                                  ·{" "}
                                </span>
                                <span className={light ? "text-stone-700" : "text-stone-500"}>
                                  {shipTo}
                                </span>
                              </>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {isOpen ? (
                      <div
                        id={`order-panel-${o.id}`}
                        role="region"
                        aria-labelledby={`order-expand-${o.id}`}
                        className={`border-t px-4 pb-5 pt-0 sm:px-5 ${light ? "border-stone-300/55" : "border-slate-700/35"}`}
                      >
                        <div className="space-y-4 pt-4">
                          {shipTo ? (
                            <p
                              className={`text-sm ${light ? "text-stone-800" : "text-stone-300/95"}`}
                            >
                              <span className={light ? "text-stone-500" : "text-slate-500"}>
                                Ship to{" "}
                              </span>
                              {shipTo}
                            </p>
                          ) : null}

                          <p
                            className={`mt-0.5 text-xs ${light ? "text-stone-500" : "text-slate-500"}`}
                          >
                            Placed {formatWhen(o.createdAt)}
                          </p>

                          <div>
                            <p
                              className={`text-xs font-medium uppercase tracking-wider ${light ? "text-stone-600" : "text-slate-500"}`}
                            >
                              Items ({lineCount} line{lineCount === 1 ? "" : "s"}{" "}
                              · {qty} unit{qty === 1 ? "" : "s"})
                            </p>
                            <p
                              className={`mt-1 text-sm leading-snug ${light ? "text-stone-800" : "text-stone-200"}`}
                            >
                              {preview.primary}
                              {preview.extra > 0 ? (
                                <span className={light ? "text-stone-500" : "text-slate-500"}>
                                  {" "}
                                  · +{preview.extra} more
                                </span>
                              ) : null}
                            </p>
                          </div>

                          <div
                            className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${light ? "text-stone-600" : "text-slate-500"}`}
                          >
                            {fulfill ? (
                              <span>
                                <span className={light ? "text-stone-500" : "text-slate-600"}>
                                  Fulfillment:{" "}
                                </span>
                                <span className={light ? "text-stone-700" : "text-slate-400"}>
                                  {fulfill}
                                </span>
                              </span>
                            ) : null}
                            {pay ? (
                              <span>
                                <span className={light ? "text-stone-500" : "text-slate-600"}>
                                  Payment:{" "}
                                </span>
                                <span className={light ? "text-stone-700" : "text-slate-400"}>
                                  {pay}
                                </span>
                              </span>
                            ) : null}
                            {o.phone ? (
                              <span>
                                <span className={light ? "text-stone-500" : "text-slate-600"}>
                                  Phone:{" "}
                                </span>
                                <span className={light ? "text-stone-700" : "text-slate-400"}>
                                  {o.phone}
                                </span>
                              </span>
                            ) : null}
                          </div>

                          <div
                            className={`flex flex-wrap items-end justify-between gap-4 border-t pt-4 ${light ? "border-stone-300/50" : "border-slate-700/30"}`}
                          >
                            <div
                              className={`text-xs tabular-nums ${light ? "text-stone-600" : "text-slate-500"}`}
                            >
                              <p>Subtotal {formatUsd(sub)}</p>
                              <p>Shipping {formatUsd(ship)}</p>
                            </div>
                            <Link
                              href={`${ordersBasePath}/${encodeURIComponent(o.id)}`}
                              className={`text-sm font-medium transition ${light ? "text-amber-900 hover:text-amber-950" : "text-amber-200/90 hover:text-amber-100"}`}
                            >
                              View full order →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div
                    className={`flex shrink-0 flex-col gap-1 border-l p-2 sm:p-3 ${light ? "border-stone-300/55" : "border-slate-700/35"}`}
                  >
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={(e) => handleResendOrderEmail(o.id, e)}
                        disabled={resendBusy}
                        title="Email HTML order details to the buyer (CC shop inbox)"
                        aria-label={`Email order ${o.id} details to buyer`}
                        className={`${dash.ordersIconButton(light)} disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <RiMailSendLine
                          className={`h-5 w-5 ${resendBusy ? "animate-pulse" : ""}`}
                          aria-hidden
                        />
                      </button>
                    ) : null}
                    <Link
                      href={`${ordersBasePath}/${encodeURIComponent(o.id)}`}
                      title="View order details"
                      aria-label={`View order ${o.id}`}
                      className={dash.ordersIconButton(light)}
                    >
                      <RiFileList2Line className="h-5 w-5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        )}

        {filteredOrders.length > 0 ? (
        <nav
          className={`mt-8 flex flex-col items-stretch gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between ${light ? "border-stone-300/55" : "border-slate-700/40"}`}
          aria-label="Orders pagination"
        >
          <p
            className={`text-center text-sm sm:text-left ${light ? "text-stone-600" : "text-slate-500"}`}
          >
            Showing{" "}
            <span
              className={`tabular-nums ${light ? "text-stone-800" : "text-stone-400"}`}
            >
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span
              className={`tabular-nums ${light ? "text-stone-800" : "text-stone-400"}`}
            >
              {filteredOrders.length}
            </span>
          </p>
          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={dash.ordersPaginationButton(light)}
            >
              Previous
            </button>
            <span
              className={`min-w-28 text-center text-sm ${light ? "text-stone-700" : "text-stone-400"}`}
            >
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={dash.ordersPaginationButton(light)}
            >
              Next
            </button>
          </div>
        </nav>
        ) : null}
        </>
      )}
    </div>
  );
}
