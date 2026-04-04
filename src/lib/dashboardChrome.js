/**
 * Dashboard admin UI — light vs dark surfaces (mirrors site `isLightThemeId`).
 * @param {boolean} light
 */

export function dashboardRoot(light) {
  return light
    ? "relative flex min-h-dvh overflow-hidden text-site-fg"
    : "relative flex min-h-dvh overflow-hidden bg-slate-950 text-stone-100";
}

export function dashboardAside(light) {
  return light
    ? "relative z-10 flex w-[4.25rem] shrink-0 flex-col border-r border-stone-300/60 bg-white/92 px-2 py-6 backdrop-blur-md lg:w-56 lg:px-4 lg:py-8"
    : "relative z-10 flex w-[4.25rem] shrink-0 flex-col border-r border-white/[0.06] bg-slate-950/85 px-2 py-6 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/75 lg:w-56 lg:px-4 lg:py-8";
}

export function dashboardNavLabel(light) {
  return light
    ? "mb-4 hidden px-3 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-stone-500 lg:mb-6 lg:block"
    : "mb-4 hidden px-3 text-[0.65rem] font-medium uppercase tracking-[0.35em] text-slate-500 lg:mb-6 lg:block";
}

export function dashboardNavLink(light, active) {
  if (active) {
    return light
      ? "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 bg-amber-400/30 text-amber-950 ring-1 ring-amber-500/35"
      : "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 bg-amber-400/12 text-amber-100 ring-1 ring-amber-400/25";
  }
  return light
    ? "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900"
    : "flex items-center justify-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition lg:justify-start lg:px-3 text-stone-400 hover:bg-white/[0.04] hover:text-stone-100";
}

export function dashboardHeader(light) {
  return light
    ? "flex h-16 shrink-0 items-center justify-between border-b border-stone-300/60 bg-white/90 px-6 shadow-sm backdrop-blur-xl sm:px-8"
    : "flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-slate-950/80 px-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-slate-950/70 sm:px-8";
}

export function dashboardBrandLink(light) {
  return light
    ? "font-serif text-lg font-medium tracking-[-0.03em] text-stone-900 transition hover:text-amber-800"
    : "font-serif text-lg font-medium tracking-[-0.03em] text-stone-100 transition hover:text-amber-100";
}

export function dashboardWelcome(light) {
  return light
    ? "hidden text-sm text-stone-600 sm:inline"
    : "hidden text-sm text-stone-400 sm:inline";
}

export function dashboardWelcomeName(light) {
  return light ? "font-medium text-stone-900" : "font-medium text-stone-200";
}

export function dashboardMain(light) {
  return light
    ? "relative min-h-0 flex-1 overflow-auto bg-stone-100/50 p-6 sm:p-8"
    : "relative min-h-0 flex-1 overflow-auto bg-slate-950/40 p-6 sm:p-8";
}

/** Stat / content cards on dashboard home */
export function dashboardStatCard(light) {
  return light
    ? "rounded-3xl border-2 border-stone-300/50 bg-white/95 p-6 shadow-lg shadow-stone-400/15 backdrop-blur ring-1 ring-stone-200/45"
    : "rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur";
}

export function dashboardStatHeading(light) {
  return light
    ? "text-sm font-medium uppercase tracking-wider text-stone-600"
    : "text-sm font-medium uppercase tracking-wider text-slate-400";
}

export function dashboardStatNumberAmber(light) {
  return light
    ? "text-3xl font-semibold text-amber-900 tabular-nums"
    : "text-3xl font-semibold text-amber-200/95 tabular-nums";
}

export function dashboardStatNumberSky(light) {
  return light
    ? "text-3xl font-semibold text-sky-800 tabular-nums"
    : "text-3xl font-semibold text-sky-200/90 tabular-nums";
}

export function dashboardStatCaption(light) {
  return light ? "text-xs text-stone-600" : "text-xs text-slate-500";
}

export function dashboardStatSub(light) {
  return light ? "mt-4 text-xs text-stone-600" : "mt-4 text-xs text-slate-500";
}

export function dashboardPageTitle(light) {
  return light
    ? "font-serif text-4xl font-medium tracking-[-0.03em] text-stone-900 sm:text-5xl"
    : "font-serif text-4xl font-medium tracking-[-0.03em] text-stone-100 sm:text-5xl";
}

export function dashboardPageSubtitle(light) {
  return light
    ? "mt-2 text-lg leading-relaxed text-stone-700 sm:text-xl"
    : "mt-2 text-lg leading-relaxed text-stone-300/95 sm:text-xl";
}

export function dashboardChartOuter(light) {
  return light
    ? "mt-10 rounded-3xl border-2 border-stone-300/50 bg-white/95 p-6 shadow-lg shadow-stone-400/15 backdrop-blur ring-1 ring-stone-200/45"
    : "mt-10 rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur";
}

export function dashboardChartInner(light) {
  return light
    ? "mt-4 min-h-[280px] rounded-2xl border border-stone-300/55 bg-stone-50/90 p-2 sm:p-4"
    : "mt-4 min-h-[280px] rounded-2xl border border-slate-700/35 bg-slate-950/50 p-2 sm:p-4";
}

export function dashboardActivityTitle(light) {
  return light
    ? "text-sm font-medium uppercase tracking-wider text-stone-600"
    : "text-sm font-medium uppercase tracking-wider text-slate-400";
}

export function dashboardActivityCaption(light) {
  return light ? "mt-1 text-xs text-stone-600" : "mt-1 text-xs text-slate-500";
}

/** Orders / order detail panels */
export function ordersPanel(light) {
  return light
    ? "rounded-3xl border-2 border-stone-300/50 bg-white/95 p-6 shadow-lg shadow-stone-400/15 backdrop-blur ring-1 ring-stone-200/45"
    : "rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 backdrop-blur";
}

export function ordersEmptyPanel(light) {
  return light
    ? "rounded-3xl border-2 border-stone-300/50 bg-white/95 p-10 text-center shadow-lg shadow-stone-400/15 backdrop-blur ring-1 ring-stone-200/45"
    : "rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-10 text-center shadow-lg shadow-slate-950/30 backdrop-blur";
}

export function ordersListRow(light) {
  return light
    ? "flex rounded-2xl border border-stone-300/55 bg-white/90 shadow-md shadow-stone-400/10 backdrop-blur-sm transition hover:border-amber-400/40 hover:bg-amber-50/40"
    : "flex rounded-2xl border border-slate-700/35 bg-slate-900/40 shadow-md shadow-slate-950/25 backdrop-blur-sm transition hover:border-amber-400/35 hover:bg-slate-900/60";
}

export function ordersSearchInput(light) {
  return light
    ? "w-full rounded-xl border border-stone-300/80 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-500 outline-none ring-amber-400/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-400/25"
    : "w-full rounded-xl border border-slate-600/50 bg-slate-950/50 py-2.5 pl-9 pr-3 text-sm text-stone-100 placeholder:text-slate-600 outline-none ring-amber-400/0 transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/25";
}

export function ordersSelect(light) {
  return light
    ? "w-full rounded-xl border border-stone-300/80 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-amber-400/0 transition focus:border-amber-500/50 focus:ring-2 focus:ring-amber-400/25"
    : "w-full rounded-xl border border-slate-600/50 bg-slate-950/50 px-3 py-2.5 text-sm text-stone-100 outline-none ring-amber-400/0 transition focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/25";
}

export function ordersGhostButton(light) {
  return light
    ? "rounded-xl border border-stone-400/60 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:border-amber-500/45 hover:bg-amber-50/80"
    : "rounded-xl border border-slate-600/50 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-stone-200 transition hover:border-amber-400/35 hover:bg-slate-800/80";
}

export function ordersPaginationButton(light) {
  return (
    (light
      ? "rounded-lg border border-stone-400/60 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-amber-500/45 hover:bg-amber-50/80"
      : "rounded-lg border border-slate-600/50 bg-slate-900/60 px-4 py-2 text-sm font-medium text-stone-200 transition hover:border-amber-400/35 hover:bg-slate-800/80") +
    " disabled:cursor-not-allowed disabled:opacity-40"
  );
}

export function ordersLinkAccent(light) {
  return light
    ? "font-semibold text-amber-900 underline decoration-amber-600/40 underline-offset-4 transition hover:text-amber-800"
    : "font-semibold text-amber-200/95 underline decoration-amber-400/40 underline-offset-4 transition hover:text-amber-100";
}

export function ordersMonoLink(light) {
  return light
    ? "font-mono text-sm text-amber-900 underline decoration-amber-600/30 underline-offset-2 transition hover:text-amber-800 hover:decoration-amber-600/50"
    : "font-mono text-sm text-amber-200/95 underline decoration-amber-500/25 underline-offset-2 transition hover:text-amber-100 hover:decoration-amber-400/50";
}

export function ordersExpandButton(light) {
  return light
    ? "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-300/80 bg-white text-stone-600 transition hover:border-amber-500/40 hover:bg-amber-50/80 hover:text-amber-900"
    : "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-600/40 bg-slate-950/50 text-slate-400 transition hover:border-amber-400/30 hover:bg-slate-800/80 hover:text-amber-200/90";
}

export function ordersIconButton(light) {
  return light
    ? "flex h-10 w-10 items-center justify-center rounded-xl text-amber-900 transition hover:bg-stone-200/90 hover:text-amber-950"
    : "flex h-10 w-10 items-center justify-center rounded-xl text-amber-200/90 transition hover:bg-slate-800/90 hover:text-amber-100";
}

export function ordersResendIconButton(light) {
  return light
    ? "flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl border border-stone-300/70 bg-white text-amber-900 transition hover:border-amber-500/45 hover:bg-amber-50/80 sm:mt-8"
    : "flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-xl border border-slate-600/50 bg-slate-900/60 text-amber-200/90 transition hover:border-amber-400/35 hover:bg-slate-800/80 hover:text-amber-100 sm:mt-8";
}

export function dashSuccessBanner(light) {
  return light
    ? "mb-4 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
    : "mb-4 rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100/95";
}

export function dashErrorBanner(light) {
  return light
    ? "mb-4 rounded-xl border border-rose-300/60 bg-rose-50 px-4 py-3 text-sm text-rose-900"
    : "mb-4 rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-sm text-rose-100/95";
}

export function authGateBar(light) {
  return light
    ? "pointer-events-auto fixed left-0 right-0 top-0 z-[9999] flex justify-end gap-4 border-b border-stone-300/70 bg-white/95 px-4 py-2 text-xs backdrop-blur-md"
    : "pointer-events-auto fixed left-0 right-0 top-0 z-[9999] flex justify-end gap-4 border-b border-white/[0.06] bg-slate-950/95 px-4 py-2 text-xs backdrop-blur-md";
}

export function authGateLink(light) {
  return light
    ? "font-medium text-amber-900 transition hover:text-amber-800"
    : "font-medium text-amber-200/95 transition hover:text-amber-100";
}

export function authGateMutedLink(light) {
  return light
    ? "text-stone-600 transition hover:text-stone-900"
    : "text-stone-500 transition hover:text-stone-300";
}

export function changePasswordFormShell(light) {
  return light
    ? "mt-10 space-y-4 rounded-3xl border-2 border-stone-300/50 bg-white/95 p-6 shadow-lg shadow-stone-400/15 ring-1 ring-stone-200/45 sm:p-8"
    : "mt-10 space-y-4 rounded-3xl border-2 border-slate-700/40 bg-slate-900/45 p-6 shadow-lg shadow-slate-950/30 sm:p-8";
}

export function changePasswordSuccess(light) {
  return light
    ? "rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
    : "rounded-xl border border-emerald-500/35 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100/95";
}
