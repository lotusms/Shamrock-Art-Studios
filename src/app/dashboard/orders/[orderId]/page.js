"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchOrderByIdForCurrentUser } from "@/lib/orders-queries";
import { formatUsd } from "@/lib/money";

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

export default function DashboardOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId ? decodeURIComponent(String(params.orderId)) : "";
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <p className="text-sm text-stone-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-amber-200/95 underline decoration-amber-400/35 underline-offset-4 transition hover:text-amber-100"
        >
          ← All orders
        </Link>
        <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl">
          Order details
        </h1>
      </div>

      {loading ? (
        <p className="text-sm text-stone-400">Loading order…</p>
      ) : error ? (
        <p className="text-sm text-red-400/90" role="alert">
          {error}
        </p>
      ) : order ? (
        <div className="space-y-8">
          <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Order ID</dt>
                <dd className="font-mono text-amber-200/95">{order.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Placed</dt>
                <dd className="text-stone-200">{formatWhen(order.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-stone-200">{order.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-stone-200">{order.phone || "—"}</dd>
              </div>
            </dl>
          </div>

          {order.shippingAddress ? (
            <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
              <h2 className="text-sm font-medium text-slate-400">Shipping</h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-stone-200">
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

          <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
            <h2 className="text-sm font-medium text-slate-400">Items</h2>
            <ul className="mt-4 space-y-4">
              {Array.isArray(order.lines)
                ? order.lines.map((line, i) => (
                    <li
                      key={`${line.slug ?? line.variantId ?? i}-${i}`}
                      className="flex gap-4 border-b border-slate-700/35 pb-4 last:border-0 last:pb-0"
                    >
                      {line.image ? (
                        <img
                          src={line.image}
                          alt=""
                          className="h-16 w-16 shrink-0 rounded-lg border border-slate-600/40 object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-lg bg-slate-900" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-stone-100">{line.title}</p>
                        {line.artist ? (
                          <p className="text-xs text-slate-500">{line.artist}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-slate-400">
                          Qty {line.quantity ?? 0} · {formatUsd(line.priceUsd ?? 0)}{" "}
                          each
                        </p>
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-stone-200">
                        {formatUsd(
                          Number(line.priceUsd ?? 0) * Number(line.quantity ?? 0),
                        )}
                      </p>
                    </li>
                  ))
                : (
                  <li className="text-slate-500">No line items.</li>
                )}
            </ul>

            <div className="mt-6 space-y-2 border-t border-slate-700/40 pt-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="tabular-nums text-stone-300">
                  {formatUsd(order.subtotalUsd ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="tabular-nums text-stone-300">
                  {formatUsd(order.shippingUsd ?? 0)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold text-stone-100">
                <span>Total</span>
                <span className="tabular-nums">{formatUsd(order.totalUsd ?? 0)}</span>
              </div>
            </div>
          </div>

          {order.notes ? (
            <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
              <h2 className="text-sm font-medium text-slate-400">Notes</h2>
              <p className="mt-2 text-sm text-stone-300 whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          ) : null}

          {order.fulfillment ? (
            <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
              <h2 className="text-sm font-medium text-slate-400">Fulfillment</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Provider</dt>
                  <dd className="text-stone-200">
                    {String(order.fulfillment.provider ?? "—")}
                  </dd>
                </div>
                {order.fulfillment.providerOrderId ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Provider order</dt>
                    <dd className="font-mono text-xs text-stone-300">
                      {String(order.fulfillment.providerOrderId)}
                    </dd>
                  </div>
                ) : null}
                {order.fulfillment.providerStatus ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="text-stone-200">
                      {String(order.fulfillment.providerStatus)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          {order.payment ? (
            <div className="rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur">
              <h2 className="text-sm font-medium text-slate-400">Payment</h2>
              <pre className="mt-2 overflow-x-auto text-xs text-slate-400">
                {JSON.stringify(order.payment, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
