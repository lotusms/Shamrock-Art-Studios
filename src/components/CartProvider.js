"use client";

import { CartProvider as Provider } from "@/context/CartContext";

export default function CartProvider({ children }) {
  return <Provider>{children}</Provider>;
}
