/**
 * Send buyer + seller order emails using the same helper as the API routes.
 *
 * Usage (Node 20+ loads env from .env.local):
 *   pnpm email:test -- path/to/order.json
 *   node --env-file=.env.local scripts/send-order-email.mjs path/to/order.json
 *
 * order.json: either the full `order` object, or `{ "order": { ... }, "payment": { ... }, "fulfillment": { ... } }`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sendOrderConfirmationEmails } from "../src/lib/email/order-emails.mjs";

const pathArg = process.argv[2];
if (!pathArg) {
  console.error(
    "Usage: pnpm email:test -- <order.json>",
  );
  process.exit(1);
}

const raw = readFileSync(resolve(pathArg), "utf8");
const parsed = JSON.parse(raw);
const order = parsed.order ?? parsed;
const payment = parsed.payment ?? null;
const fulfillment = parsed.fulfillment ?? {
  provider: "demo",
  printfulOrderId: null,
  printfulStatus: null,
};

const result = await sendOrderConfirmationEmails({
  order,
  payment,
  fulfillment,
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || result.skipped ? 0 : 1);
