/**
 * Class fragments for floating panels, dialogs, and form chrome on light vs dark themes.
 * Used with `useOverlayChrome()` (client) or `isLightThemeId` + this module on the server when needed.
 */

const LISTBOX_TRANSITION =
  "outline-none data-closed:data-leave:opacity-0 data-leave:transition data-leave:duration-100 data-leave:ease-in";

/** @param {boolean} light */
export function listboxFloatingPanel(light) {
  return light
    ? `z-50 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-stone-300/80 bg-white py-1 text-sm text-slate-800 shadow-lg shadow-stone-400/20 ring-1 ring-stone-200/60 ${LISTBOX_TRANSITION}`
    : `z-50 max-h-60 w-[var(--button-width)] overflow-auto rounded-xl border border-slate-600/60 bg-slate-900 py-1 text-sm text-stone-100 shadow-lg ${LISTBOX_TRANSITION}`;
}

/** @param {boolean} light */
export function listboxInFlowPanel(light) {
  return light
    ? `absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-stone-300/80 bg-white py-1 text-sm text-slate-800 shadow-lg shadow-stone-400/20 ring-1 ring-stone-200/60 ${LISTBOX_TRANSITION}`
    : `absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-600/60 bg-slate-900 py-1 text-sm text-stone-100 shadow-lg ${LISTBOX_TRANSITION}`;
}

/** @param {boolean} light */
export function listboxOption(light) {
  return light
    ? "group relative cursor-default select-none py-2.5 pl-4 pr-10 text-slate-800 data-focus:bg-amber-400/20 data-focus:text-slate-900 data-focus:outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40"
    : "group relative cursor-default select-none py-2.5 pl-4 pr-10 text-stone-100 data-focus:bg-amber-400/15 data-focus:text-stone-100 data-focus:outline-none data-disabled:cursor-not-allowed data-disabled:opacity-40";
}

/** @param {boolean} light */
export function listboxCheckIcon(light) {
  return light
    ? "absolute inset-y-0 right-0 flex items-center pr-4 text-amber-700/90 group-[:not([data-selected])]:hidden group-data-focus:text-amber-800"
    : "absolute inset-y-0 right-0 flex items-center pr-4 text-amber-400/90 group-[:not([data-selected])]:hidden group-data-focus:text-amber-200";
}

/** @param {boolean} light */
export function checkoutDialogModalPanel(light) {
  return light
    ? "w-full max-w-md rounded-2xl border border-stone-300/70 bg-white p-6 shadow-2xl shadow-stone-400/25 ring-1 ring-stone-200/50 transition data-closed:scale-95 data-closed:opacity-0"
    : "w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-950 p-6 shadow-2xl transition data-closed:scale-95 data-closed:opacity-0";
}

/** @param {boolean} light */
export function checkoutDialogDrawerPanel(light) {
  return light
    ? "flex h-full w-full max-w-full flex-col border-l border-stone-300/70 bg-white shadow-2xl shadow-stone-400/20 ring-1 ring-stone-200/40 transition data-closed:translate-x-8 data-closed:opacity-0 min-[400px]:max-w-[min(100vw,28rem)] sm:max-w-[min(100vw,36rem)] lg:max-w-[min(100vw-1rem,56rem)] xl:max-w-[min(100vw-2rem,72rem)]"
    : "flex h-full w-full max-w-full flex-col border-l border-slate-700/50 bg-slate-950 shadow-2xl transition data-closed:translate-x-8 data-closed:opacity-0 min-[400px]:max-w-[min(100vw,28rem)] sm:max-w-[min(100vw,36rem)] lg:max-w-[min(100vw-1rem,56rem)] xl:max-w-[min(100vw-2rem,72rem)]";
}

/** @param {boolean} light */
export function checkoutDialogDrawerHeaderBorder(light) {
  return light
    ? "shrink-0 border-b border-stone-200/90 px-4 py-4 sm:px-6 sm:py-5 lg:px-8"
    : "shrink-0 border-b border-slate-700/40 px-4 py-4 sm:px-6 sm:py-5 lg:px-8";
}

/** @param {boolean} light */
export function dialogTitleModal(light) {
  return light
    ? "font-serif text-xl font-medium tracking-[-0.02em] text-slate-900"
    : "font-serif text-xl font-medium tracking-[-0.02em] text-stone-100";
}

/** @param {boolean} light */
export function dialogTitleDrawer(light) {
  return light
    ? "font-serif text-xl font-medium tracking-[-0.02em] text-slate-900 sm:text-2xl"
    : "font-serif text-xl font-medium tracking-[-0.02em] text-stone-100 sm:text-2xl";
}

/** @param {boolean} light */
export function dialogSubtitle(light) {
  return light
    ? "mt-2 text-sm text-slate-600"
    : "mt-2 text-sm text-stone-400";
}

/** @param {boolean} light */
export function checkoutInputBase(light) {
  return light
    ? "mt-1.5 w-full rounded-xl border border-stone-300/80 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-amber-500/45 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
    : "mt-1.5 w-full rounded-xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm text-stone-100 placeholder:text-slate-600 focus:border-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-400/25";
}

/**
 * Merges with PasswordField’s built-in dark base — use important overrides for light.
 * @param {boolean} light
 */
export function checkoutPasswordInputClass(light) {
  return light
    ? "!rounded-xl !border-stone-300/80 !bg-white !px-4 !py-3 !pl-4 !pr-11 !text-sm !text-slate-900 placeholder:!text-slate-500 focus:!border-amber-500/50 focus:!ring-amber-400/30"
    : "rounded-xl border-slate-600/60 bg-slate-950/60 px-4 py-3 text-sm";
}

/** @param {boolean} light */
export function checkoutLabelUppercase(light) {
  return light
    ? "block text-xs font-medium uppercase tracking-wider text-slate-600"
    : "block text-xs font-medium uppercase tracking-wider text-slate-500";
}

/** @param {boolean} light */
export function checkoutCancelButton(light) {
  return light
    ? "rounded-full border border-stone-400/60 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-amber-500/40 hover:bg-stone-50 hover:text-slate-900"
    : "rounded-full border border-slate-600/50 bg-transparent px-6 py-2.5 text-sm font-medium text-stone-300 transition hover:border-amber-400/35 hover:text-stone-100";
}

/** @param {boolean} light */
export function registerFormFooter(light) {
  return light
    ? "shrink-0 border-t border-stone-200/90 bg-stone-50/95 px-4 py-4 sm:px-6 lg:px-8"
    : "shrink-0 border-t border-slate-700/40 bg-slate-950/95 px-4 py-4 sm:px-6 lg:px-8";
}

/** @param {boolean} light */
export function formSectionHeading(light) {
  return light
    ? "text-xs font-medium uppercase tracking-[0.2em] text-slate-600"
    : "text-xs font-medium uppercase tracking-[0.2em] text-slate-500";
}

/** @param {boolean} light */
export function formFieldLabel(light) {
  return light ? "block text-sm text-slate-600" : "block text-sm text-slate-400";
}

/** Listbox trigger chevron (SelectListbox). */
/** @param {boolean} light */
export function selectChevron(light) {
  return light
    ? "col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-600 sm:size-4"
    : "col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-500 sm:size-4";
}

/** @param {boolean} light */
export function formSectionColumnBorder(light) {
  return light
    ? "min-w-0 lg:border-l lg:border-stone-300/80 lg:pl-8 xl:pl-10"
    : "min-w-0 lg:border-l lg:border-slate-800/80 lg:pl-8 xl:pl-10";
}

/** @param {boolean} light */
export function registerErrorText(light) {
  return light ? "text-sm text-rose-700 lg:col-span-2" : "text-sm text-rose-300 lg:col-span-2";
}

/** @param {boolean} light */
export function addressSuggestPanel(light) {
  return light
    ? "mt-2 rounded-xl border border-stone-300/80 bg-white p-2 shadow-md shadow-stone-400/15 ring-1 ring-stone-200/50"
    : "mt-2 rounded-xl border border-slate-700/70 bg-slate-950/95 p-2";
}

/** @param {boolean} light */
export function addressSuggestMuted(light) {
  return light ? "px-3 py-2 text-xs text-slate-600" : "px-3 py-2 text-xs text-slate-400";
}

/** @param {boolean} light */
export function addressSuggestEmpty(light) {
  return light ? "px-3 py-2 text-xs text-slate-500" : "px-3 py-2 text-xs text-slate-500";
}

/** @param {boolean} light */
export function addressSuggestItem(light) {
  return light
    ? "w-full rounded-lg px-3 py-2 text-left text-xs text-slate-800 transition hover:bg-amber-100/60"
    : "w-full rounded-lg px-3 py-2 text-left text-xs text-stone-200 transition hover:bg-slate-800/80";
}

/** @param {boolean} light */
export function cartPreviewPanel(light) {
  return light
    ? "pointer-events-none invisible absolute right-0 top-full z-130 mt-2 w-80 translate-y-1 rounded-2xl border border-stone-300/70 bg-white/95 p-4 opacity-0 shadow-2xl shadow-stone-400/30 ring-1 ring-stone-200/60 backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
    : "pointer-events-none invisible absolute right-0 top-full z-130 mt-2 w-80 translate-y-1 rounded-2xl border border-white/10 bg-slate-950/95 p-4 opacity-0 shadow-2xl shadow-slate-950/60 ring-1 ring-white/5 backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100";
}

/** @param {boolean} light */
export function cartPreviewTitle(light) {
  return light
    ? "text-xs uppercase tracking-[0.25em] text-amber-800"
    : "text-xs uppercase tracking-[0.25em] text-amber-400";
}

/** @param {boolean} light */
export function cartPreviewEmptyText(light) {
  return light ? "mt-3 text-sm text-slate-600" : "mt-3 text-sm text-slate-400";
}

/** @param {boolean} light */
export function cartPreviewLineRow(light) {
  return light
    ? "flex items-start justify-between gap-3 rounded-xl border border-stone-200/90 bg-stone-50/90 px-3 py-2"
    : "flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/2 px-3 py-2";
}

/** @param {boolean} light */
export function cartPreviewLineTitle(light) {
  return light ? "truncate text-sm text-slate-800" : "truncate text-sm text-stone-200";
}

/** @param {boolean} light */
export function cartPreviewLineQty(light) {
  return light ? "text-xs text-slate-600" : "text-xs text-slate-500";
}

/** @param {boolean} light */
export function cartPreviewLinePrice(light) {
  return light
    ? "shrink-0 text-sm tabular-nums text-slate-800"
    : "shrink-0 text-sm tabular-nums text-stone-300";
}

/** @param {boolean} light */
export function cartPreviewMoreItems(light) {
  return light ? "mt-2 text-xs text-slate-600" : "mt-2 text-xs text-slate-500";
}

/** @param {boolean} light */
export function cartPreviewSubtotalLabel(light) {
  return light ? "text-sm text-slate-600" : "text-sm text-slate-400";
}

/** @param {boolean} light */
export function cartPreviewSubtotalValue(light) {
  return light
    ? "text-sm font-semibold tabular-nums text-amber-800"
    : "text-sm font-semibold tabular-nums text-amber-200";
}

/** @param {boolean} light */
export function secondaryButtonLightOutline(light) {
  return light
    ? "!border-stone-400/70 !bg-white !text-slate-800 !shadow-stone-400/20 hover:!border-amber-500/45 hover:!bg-amber-50/80 hover:!text-slate-900"
    : "";
}

/* --- Cart page (`/cart`) --- */

/** @param {boolean} light */
export function cartLineCard(light) {
  return light
    ? "flex gap-5 rounded-3xl border-2 border-stone-300/50 bg-white/90 p-4 shadow-lg shadow-stone-400/18 backdrop-blur-md sm:p-5"
    : "flex gap-5 rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-4 shadow-lg shadow-slate-950/25 sm:p-5";
}

/** @param {boolean} light */
export function cartThumbBorder(light) {
  return light
    ? "relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-stone-200/90 sm:h-32 sm:w-28"
    : "relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-32 sm:w-28";
}

/** @param {boolean} light */
export function cartTitleLink(light) {
  return light
    ? "font-serif text-lg font-medium tracking-[-0.02em] text-stone-900 transition hover:text-amber-800 sm:text-xl"
    : "font-serif text-lg font-medium tracking-[-0.02em] text-stone-100 transition hover:text-amber-100 sm:text-xl";
}

/** @param {boolean} light */
export function cartPriceEach(light) {
  return light
    ? "mt-3 text-sm tabular-nums text-amber-800/95"
    : "mt-3 text-sm tabular-nums text-amber-200/90";
}

/** @param {boolean} light */
export function cartQtyLabel(light) {
  return light
    ? "flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-600"
    : "flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500";
}

/** @param {boolean} light */
export function cartQtyInput(light) {
  return light
    ? "w-16 rounded-lg border border-stone-300/80 bg-white px-2 py-1.5 text-center text-sm text-stone-900 tabular-nums shadow-sm focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-400/35"
    : "w-16 rounded-lg border border-slate-600 bg-slate-950/80 px-2 py-1.5 text-center text-sm text-stone-200 tabular-nums focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30";
}

/** @param {boolean} light */
export function cartRemoveLink(light) {
  return light
    ? "text-xs uppercase tracking-[0.2em] text-stone-600 underline decoration-stone-400/80 underline-offset-4 transition hover:text-amber-800"
    : "text-xs uppercase tracking-[0.2em] text-slate-500 underline decoration-slate-600 underline-offset-4 transition hover:text-amber-200/90";
}

/** @param {boolean} light */
export function cartLineTotal(light) {
  return light
    ? "hidden text-right text-sm font-semibold tabular-nums text-stone-900 sm:block"
    : "hidden text-right text-sm font-semibold tabular-nums text-stone-100 sm:block";
}

/** @param {boolean} light */
export function cartSummaryAside(light) {
  return light
    ? "h-fit rounded-4xl border-2 border-stone-300/50 bg-white/92 p-8 shadow-xl shadow-stone-400/20 ring-1 ring-stone-200/55 backdrop-blur-md"
    : "h-fit rounded-4xl border-2 border-slate-600/35 bg-linear-to-br from-slate-800/40 to-slate-950/50 p-8 shadow-xl shadow-slate-950/35 ring-2 ring-slate-500/20 backdrop-blur-md";
}

/** @param {boolean} light */
export function cartSummaryHeading(light) {
  return light
    ? "text-xs uppercase tracking-[0.32em] text-amber-900/90"
    : "text-xs uppercase tracking-[0.32em] text-amber-300";
}

/** @param {boolean} light */
export function cartSummaryDt(light) {
  return light ? "text-stone-600" : "text-slate-400";
}

/** @param {boolean} light */
export function cartSummaryDd(light) {
  return light ? "tabular-nums text-stone-900" : "tabular-nums text-stone-200";
}

/** @param {boolean} light */
export function cartSummaryTotalRow(light) {
  return light
    ? "flex justify-between gap-4 border-t border-stone-200/90 pt-4 text-base font-semibold"
    : "flex justify-between gap-4 border-t border-white/10 pt-4 text-base font-semibold";
}

/** @param {boolean} light */
export function cartSummaryTotalLabel(light) {
  return light ? "text-stone-900" : "text-stone-200";
}

/** @param {boolean} light */
export function cartSummaryTotalValue(light) {
  return light ? "tabular-nums text-amber-800" : "tabular-nums text-amber-200";
}

/** @param {boolean} light */
export function cartSummaryShippingNote(light) {
  return light
    ? "border-t border-stone-200/90 pt-3 text-xs leading-relaxed text-stone-600"
    : "border-t border-white/5 pt-3 text-xs leading-relaxed text-slate-500";
}

/** @param {boolean} light */
export function cartShippingComplimentary(light) {
  return light ? "text-emerald-700" : "text-emerald-400/90";
}

/** Checkout order summary line inside `Card`. */
/** @param {boolean} light */
export function checkoutOrderLine(light) {
  return light
    ? "flex justify-between gap-3 text-stone-800"
    : "flex justify-between gap-3 text-site-fg/90";
}

/** @param {boolean} light */
export function checkoutOrderQty(light) {
  return light ? "text-stone-600" : "text-site-secondary";
}

/** @param {boolean} light */
export function checkoutSummaryBorder(light) {
  return light ? "border-t border-stone-300/55" : "border-t border-site-fg/10";
}

/** @param {boolean} light */
export function checkoutSummaryTotalBorder(light) {
  return light ? "border-t border-stone-300/60" : "border-t border-site-fg/15";
}

/** Muted helper text in checkout summary card. */
/** @param {boolean} light */
export function checkoutSummaryMuted(light) {
  return light ? "text-stone-600" : "text-site-secondary";
}

/** @param {boolean} light */
export function checkoutInlineError(light) {
  return light
    ? "mt-1.5 text-xs text-rose-700"
    : "mt-1.5 text-xs text-rose-300";
}

/** @param {boolean} light */
export function checkoutBannerError(light) {
  return light
    ? "mt-4 rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-900"
    : "mt-4 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200";
}

/** @param {boolean} light */
export function checkoutSubmitError(light) {
  return light
    ? "mt-3 rounded-xl border border-rose-300/50 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-900"
    : "mt-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200";
}

/** Empty / loading caption on cart & checkout. */
/** @param {boolean} light */
export function pageMutedText(light) {
  return light ? "text-stone-600" : "text-stone-400";
}

/** CTA link pill (e.g. Browse shop) on empty checkout. */
/** @param {boolean} light */
export function emptyStateCtaLink(light) {
  return light
    ? "inline-flex w-fit rounded-full border-2 border-stone-400/60 bg-white/90 px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-sm transition hover:border-amber-500/45 hover:bg-amber-50/80"
    : "inline-flex w-fit rounded-full border-2 border-slate-500/50 bg-slate-900/55 px-8 py-3.5 text-sm font-semibold text-stone-100 transition hover:border-amber-400/45";
}
