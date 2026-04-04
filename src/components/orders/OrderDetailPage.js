"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RiMailSendLine } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";
import { getFirebaseAuth } from "@firebase/client";
import { useDocumentThemeId } from "@/hooks/useDocumentThemeId";
import * as dash from "@/lib/dashboardChrome";
import * as overlayChrome from "@/lib/overlayChrome";
import { fetchOrderByIdForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";
import { isLightThemeId } from "@/theme";

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return String(iso);
  }
}

/**
 * @param {{ ordersBasePath?: string }} props
 */
export default function OrderDetailPage({
  ordersBasePath = "/dashboard/orders",
}) {
  const params = useParams();
  const orderId = params?.orderId ? decodeURIComponent(String(params.orderId)) : "";
  const themeId = useDocumentThemeId();
  const light = isLightThemeId(themeId);
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendState, setResendState] = useState({
    orderId: null,
    loading: false,
    message: null,
    error: null,
  });

  async function handleResendOrderEmail(e) {
    e.preventDefault();
    if (!isAdmin || !order?.id) return;
    setResendState({
      orderId: order.id,
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
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : "Could not send email.",
        );
      }
      setResendState({
        orderId: order.id,
        loading: false,
        message:
          "Order details emailed to the buyer. The shop inbox was CC'd when it is not the same as the buyer.",
        error: null,
      });
      window.setTimeout(() => {
        setResendState((s) => (s.message ? { ...s, message: null } : s));
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
    if (authLoading || !user || !orderId) {
      if (!authLoading && !user) setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const o = await fetchOrderByIdForCurrentUser(orderId);
        if (!cancelled) {
          if (!o) {
            setOrder(null);
            setError("Order not found or you do not have access.");
          } else {
            setOrder(o);
          }
        }
      } catch (e) {
        const code = e?.code;
        const msg =
          code === "permission-denied"
            ? "You do not have access to this order."
            : e instanceof Error
              ? e.message
              : "Could not load order.";
        if (!cancelled) {
          setError(msg);
          setOrder(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, orderId]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className={`text-sm ${overlayChrome.pageMutedText(light)}`}>Loading…</p>
      </div>
    );
  }

  const resendBusy =
    Boolean(order?.id) &&
    resendState.loading &&
    resendState.orderId === order.id;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={ordersBasePath} className={dash.ordersLinkAccent(light)}>
            ← All orders
          </Link>
          <h1 className={`mt-4 ${dash.dashboardPageTitle(light)}`}>
            Order details
          </h1>
        </div>
        {order && isAdmin ? (
          <button
            type="button"
            onClick={handleResendOrderEmail}
            disabled={resendBusy}
            title="Email HTML order details to the buyer (CC shop inbox)"
            aria-label={`Email order ${order.id} details to buyer`}
            className={`${dash.ordersResendIconButton(light)} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <RiMailSendLine
              className={`h-5 w-5 ${resendBusy ? "animate-pulse" : ""}`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>

      {order && isAdmin && resendState.message ? (
        <p className={`mb-4 ${dash.dashSuccessBanner(light)}`} role="status">
          {resendState.message}
        </p>
      ) : null}
      {order && isAdmin && resendState.error ? (
        <p className={`mb-4 ${dash.dashErrorBanner(light)}`} role="alert">
          {resendState.error}
        </p>
      ) : null}

      {loading ? (
        <p className={`text-sm ${overlayChrome.pageMutedText(light)}`}>
          Loading order…
        </p>
      ) : error ? (
        <p
          className={`text-sm ${light ? "text-red-700" : "text-red-400/90"}`}
          role="alert"
        >
          {error}
        </p>
      ) : order ? (
        <div className="space-y-8">
          <div className={dash.ordersPanel(light)}>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className={dash.dashboardStatCaption(light)}>Order ID</dt>
                <dd
                  className={`font-mono ${light ? "text-amber-900" : "text-amber-200/95"}`}
                >
                  {order.id}
                </dd>
              </div>
              <div>
                <dt className={dash.dashboardStatCaption(light)}>Placed</dt>
                <dd className={light ? "text-stone-800" : "text-stone-200"}>
                  {formatWhen(order.createdAt)}
                </dd>
              </div>
              <div>
                <dt className={dash.dashboardStatCaption(light)}>Email</dt>
                <dd className={light ? "text-stone-800" : "text-stone-200"}>
                  {order.email || "—"}
                </dd>
              </div>
              <div>
                <dt className={dash.dashboardStatCaption(light)}>Phone</dt>
                <dd className={light ? "text-stone-800" : "text-stone-200"}>
                  {order.phone || "—"}
                </dd>
              </div>
            </dl>
          </div>

          {order.shippingAddress ? (
            <div className={dash.ordersPanel(light)}>
              <h2 className={dash.dashboardActivityTitle(light)}>Shipping</h2>
              <address
                className={`mt-3 text-sm not-italic leading-relaxed ${light ? "text-stone-800" : "text-stone-200"}`}
              >
                {order.shippingAddress.fullName ? (
                  <p>{order.shippingAddress.fullName}</p>
                ) : null}
                <p>
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2
                    ? `, ${order.shippingAddress.address2}`
                    : ""}
                </p>
                <p>
                  {order.shippingAddress.city}
                  {order.shippingAddress.state
                    ? `, ${order.shippingAddress.state}`
                    : ""}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
            </div>
          ) : null}

          <div className={dash.ordersPanel(light)}>
            <h2 className={dash.dashboardActivityTitle(light)}>Items</h2>
            <ul className="mt-4 space-y-4">
              {Array.isArray(order.lines)
                ? order.lines.map((line, i) => (
                    <li
                      key={`${line.slug ?? line.variantId ?? i}-${i}`}
                      className={`flex gap-4 border-b pb-4 last:border-0 last:pb-0 ${light ? "border-stone-300/55" : "border-slate-700/35"}`}
                    >
                      {line.image ? (
                        <img
                          src={line.image}
                          alt=""
                          className={`h-16 w-16 shrink-0 rounded-lg object-cover ${light ? "border border-stone-300/80" : "border border-slate-600/40"}`}
                        />
                      ) : (
                        <div
                          className={`h-16 w-16 shrink-0 rounded-lg ${light ? "bg-stone-200/80" : "bg-slate-900"}`}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-medium ${light ? "text-stone-900" : "text-stone-100"}`}
                        >
                          {line.title}
                        </p>
                        {line.artist ? (
                          <p className={dash.dashboardStatCaption(light)}>
                            {line.artist}
                          </p>
                        ) : null}
                        <p
                          className={`mt-1 text-sm ${light ? "text-stone-600" : "text-slate-400"}`}
                        >
                          Qty {line.quantity ?? 0} · {formatUsd(line.priceUsd ?? 0)}{" "}
                          each
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-sm tabular-nums ${light ? "text-stone-800" : "text-stone-200"}`}
                      >
                        {formatUsd(
                          Number(line.priceUsd ?? 0) * Number(line.quantity ?? 0),
                        )}
                      </p>
                    </li>
                  ))
                : (
                  <li className={dash.dashboardStatCaption(light)}>
                    No line items.
                  </li>
                )}
            </ul>

            <div
              className={`mt-6 space-y-2 border-t pt-4 text-sm ${light ? "border-stone-300/55" : "border-slate-700/40"}`}
            >
              <div
                className={`flex justify-between ${dash.dashboardStatCaption(light)}`}
              >
                <span>Subtotal</span>
                <span
                  className={`tabular-nums ${light ? "text-stone-800" : "text-stone-300"}`}
                >
                  {formatUsd(order.subtotalUsd ?? 0)}
                </span>
              </div>
              <div
                className={`flex justify-between ${dash.dashboardStatCaption(light)}`}
              >
                <span>Shipping</span>
                <span
                  className={`tabular-nums ${light ? "text-stone-800" : "text-stone-300"}`}
                >
                  {formatUsd(order.shippingUsd ?? 0)}
                </span>
              </div>
              <div
                className={`flex justify-between text-base font-semibold ${light ? "text-stone-900" : "text-stone-100"}`}
              >
                <span>Total</span>
                <span className="tabular-nums">{formatUsd(order.totalUsd ?? 0)}</span>
              </div>
            </div>
          </div>

          {order.notes ? (
            <div className={dash.ordersPanel(light)}>
              <h2 className={dash.dashboardActivityTitle(light)}>Notes</h2>
              <p
                className={`mt-2 text-sm whitespace-pre-wrap ${light ? "text-stone-800" : "text-stone-300"}`}
              >
                {order.notes}
              </p>
            </div>
          ) : null}

          {order.fulfillment ? (
            <div className={dash.ordersPanel(light)}>
              <h2 className={dash.dashboardActivityTitle(light)}>Fulfillment</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className={dash.dashboardStatCaption(light)}>Provider</dt>
                  <dd className={light ? "text-stone-800" : "text-stone-200"}>
                    {String(order.fulfillment.provider ?? "—")}
                  </dd>
                </div>
                {order.fulfillment.providerOrderId ? (
                  <div className="flex justify-between gap-4">
                    <dt className={dash.dashboardStatCaption(light)}>
                      Provider order
                    </dt>
                    <dd
                      className={`font-mono text-xs ${light ? "text-stone-700" : "text-stone-300"}`}
                    >
                      {String(order.fulfillment.providerOrderId)}
                    </dd>
                  </div>
                ) : null}
                {order.fulfillment.providerStatus ? (
                  <div className="flex justify-between gap-4">
                    <dt className={dash.dashboardStatCaption(light)}>Status</dt>
                    <dd className={light ? "text-stone-800" : "text-stone-200"}>
                      {String(order.fulfillment.providerStatus)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {order.payment ? (
            <div className={dash.ordersPanel(light)}>
              <h2 className={dash.dashboardActivityTitle(light)}>Payment</h2>
              <pre
                className={`mt-2 overflow-x-auto text-xs ${light ? "text-stone-600" : "text-slate-400"}`}
              >
                {JSON.stringify(order.payment, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
