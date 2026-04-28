import { useCallback, useEffect, useRef, useState } from "react";

/** @type {string} */
const ASSET_BOX_ART = "/assets/pablo-escobar-box.jpg";
/** @type {string} */
const ASSET_PARTS_LIST = "/assets/pablo-escobar-parts.jpg";
/** @type {string} */
const ASSET_INSTRUCTIONS = "/assets/pablo-escobar-build.jpg";

const PLACEHOLDER_BOX =
  "https://placehold.co/400x520/1A1A1A/F5C518?text=Box+Art&font=jetbrains-mono";
const PLACEHOLDER_PARTS =
  "https://placehold.co/720x420/FAF7F2/1A1A1A?text=Parts+List&font=jetbrains-mono";
const PLACEHOLDER_INSTRUCTIONS =
  "https://placehold.co/720x520/1A1A1A/F5C518?text=Instructions&font=jetbrains-mono";

const LOADER_MESSAGES = [
  "Analyzing your prompt…",
  "Selecting bricks…",
  "Computing build order…",
  "Generating instructions…",
  "Finalizing kit…",
];

const FEED_BUILDS = [
  {
    id: "1",
    name: "Cozy Reading Nook",
    creator: "@brickwizard",
    hearts: 412,
    remixes: 31,
    ordered: 89,
    featured: true,
  },
  {
    id: "2",
    name: "Tiny Tokyo Ramen Stall",
    creator: "@blockchef",
    hearts: 387,
    remixes: 24,
    ordered: 76,
    featured: true,
  },
  {
    id: "3",
    name: "Astronaut on a Skateboard",
    creator: "@studlife",
    hearts: 356,
    remixes: 19,
    ordered: 64,
    featured: true,
  },
  {
    id: "4",
    name: "My Cat Mr. Whiskers",
    creator: "@petbricks",
    hearts: 298,
    remixes: 12,
    ordered: 51,
    featured: false,
  },
  {
    id: "5",
    name: "Coffee Cart",
    creator: "@morningbrick",
    hearts: 267,
    remixes: 15,
    ordered: 43,
    featured: false,
  },
  {
    id: "6",
    name: "Mini Eiffel Tower",
    creator: "@parisbuilds",
    hearts: 245,
    remixes: 22,
    ordered: 38,
    featured: false,
  },
  {
    id: "7",
    name: "Lofi Study Desk",
    creator: "@chillbricks",
    hearts: 234,
    remixes: 18,
    ordered: 47,
    featured: false,
  },
  {
    id: "8",
    name: "Wizard's Bookshelf",
    creator: "@arcanestud",
    hearts: 198,
    remixes: 9,
    ordered: 29,
    featured: false,
  },
  {
    id: "9",
    name: "Retro Arcade Cabinet",
    creator: "@pixelplay",
    hearts: 187,
    remixes: 14,
    ordered: 31,
    featured: false,
  },
  {
    id: "10",
    name: "Beach Sunset Diorama",
    creator: "@summerbricks",
    hearts: 167,
    remixes: 7,
    ordered: 24,
    featured: false,
  },
  {
    id: "11",
    name: "Espresso Machine",
    creator: "@baristabuild",
    hearts: 145,
    remixes: 11,
    ordered: 22,
    featured: false,
  },
  {
    id: "12",
    name: "Mini Hot Air Balloon",
    creator: "@flightbricks",
    hearts: 134,
    remixes: 6,
    ordered: 19,
    featured: false,
  },
];

function titleFromPrompt(text) {
  const cleaned = text.replace(/^Remix of:\s*[^—]+—\s*/i, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 4);
  if (!words.length) return "Untitled Kit";
  return (
    words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ") + " Kit"
  );
}

function randomSku() {
  return `BS-${String(Math.floor(10000 + Math.random() * 90000))}`;
}

function FallbackImage({ primary, fallback, alt, className }) {
  const [src, setSrc] = useState(primary);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSrc(fallback)}
    />
  );
}

function FloatingStuds({ className = "" }) {
  const studs = [
    { top: "8%", left: "6%", delay: "0s", size: "w-3 h-3" },
    { top: "22%", right: "12%", delay: "0.4s", size: "w-4 h-4" },
    { top: "70%", left: "10%", delay: "0.8s", size: "w-2.5 h-2.5" },
    { top: "45%", right: "8%", delay: "1.2s", size: "w-3.5 h-3.5" },
    { bottom: "12%", right: "20%", delay: "0.2s", size: "w-3 h-3" },
    { top: "55%", left: "4%", delay: "1s", size: "w-2 h-2" },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {studs.map((s, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-brick-yellow/80 shadow-sm ${s.size} animate-stud-pulse`}
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

function BrickLogoMark({ className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 gap-0.5 rounded-md bg-brick-ink p-0.5 shadow-md ${className}`}
      aria-hidden
    >
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-2 w-2 rounded-sm bg-brick-yellow" />
      ))}
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div
      className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2 rounded-2xl border border-black/5 bg-white px-5 py-3 text-sm font-medium text-brick-ink shadow-xl shadow-black/10 animate-fade-in opacity-0 [animation-duration:300ms] [animation-fill-mode:forwards]"
      role="status"
    >
      {message}
    </div>
  );
}

function NavBar({ view, onLogo, onBrowse, onBuild }) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-brick-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onLogo}
          className="group flex items-center gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-black/[0.03]"
        >
          <BrickLogoMark className="h-7 w-7 shrink-0 transition group-hover:scale-105" />
          <span className="font-display text-lg font-semibold tracking-tight text-brick-ink">
            🧱 brickstack<span className="text-brick-cobalt">.ai</span>
          </span>
        </button>
        <nav className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBrowse}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition hover:scale-[1.02] active:scale-[0.98] ${
              view === "feed"
                ? "bg-brick-ink text-white shadow-lg shadow-black/10"
                : "border border-black/10 bg-white text-brick-ink shadow-sm hover:border-black/15"
            }`}
          >
            Browse
          </button>
          <button
            type="button"
            onClick={onBuild}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition hover:scale-[1.02] active:scale-[0.98] ${
              view === "create"
                ? "bg-brick-yellow text-brick-ink shadow-lg shadow-brick-yellow/30"
                : "border border-black/10 bg-white text-brick-ink shadow-sm hover:border-black/15"
            }`}
          >
            Build
          </button>
        </nav>
      </div>
    </header>
  );
}

function LandingView({ onStart, onFeed, onCardClick }) {
  const preview = FEED_BUILDS.slice(0, 3);
  return (
    <main>
      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
        <FloatingStuds />
        <div className="relative grid gap-12 lg:grid-cols-[1fr_minmax(260px,380px)] lg:items-center lg:gap-8">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1 text-xs font-medium text-brick-ink/70 shadow-sm">
              🟨 🟥 Playful builds, serious quality
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-brick-ink sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Turn{" "}
              <span className="relative inline-block">
                <span className="relative z-10 rounded-lg bg-brick-yellow px-1.5 text-brick-ink">
                  anything
                </span>
              </span>{" "}
              into a LEGO® kit.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-brick-ink/75">
              Snap a photo or describe it. We&apos;ll generate a custom brick model, then ship the
              kit with printed instructions in 7 days.
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-brick-yellow px-8 py-4 text-lg font-semibold text-brick-ink shadow-xl shadow-brick-yellow/25 transition hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
            >
              Start building →
            </button>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "🧱 12,847 kits shipped",
                "⭐ 4.9 avg rating",
                "🚚 7-day delivery",
                "♻ 100% real LEGO bricks",
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-medium text-brick-ink/80 shadow-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none [perspective:1000px]">
            <div className="animate-float">
              <FallbackImage
                primary={ASSET_BOX_ART}
                fallback={PLACEHOLDER_BOX}
                alt="LEGO kit box art mockup"
                className="mx-auto w-full max-w-[280px] rounded-2xl border border-black/10 shadow-2xl shadow-black/20 sm:max-w-[320px] lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/5 bg-white/60 py-14 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center font-display text-2xl font-bold text-brick-ink sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "📸 Describe it",
                body: "Type a prompt or upload a photo.",
              },
              {
                title: "🧱 We brick-ify it",
                body: "Our AI generates a buildable model in seconds.",
              },
              {
                title: "📦 We ship it",
                body: "Real LEGO bricks + printed instructions, on your doorstep in a week.",
              },
            ].map((col) => (
              <div
                key={col.title}
                className="rounded-2xl border border-black/5 bg-brick-cream/80 p-6 text-center shadow-xl shadow-black/5 transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <h3 className="font-display text-xl font-semibold text-brick-ink">{col.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brick-ink/70">{col.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-brick-ink sm:text-3xl">
            Built by the community →
          </h2>
          <button
            type="button"
            onClick={onFeed}
            className="text-sm font-semibold text-brick-cobalt underline-offset-4 hover:underline"
          >
            See all
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {preview.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={onCardClick}
              className="group overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-xl shadow-black/5 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <FallbackImage
                primary={ASSET_BOX_ART}
                fallback={PLACEHOLDER_BOX}
                alt=""
                className="aspect-[4/5] w-full object-cover transition group-hover:scale-[1.02]"
              />
              <div className="p-4">
                <p className="font-display font-semibold text-brick-ink">{b.name}</p>
                <p className="mt-1 font-mono text-xs text-brick-ink/50">{b.creator}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <BrickLogoMark />
            <span className="font-display text-sm font-semibold text-brick-ink">brickstack.ai</span>
          </div>
          <p className="text-sm text-brick-ink/50">© 2026 brickstack.ai</p>
          <div className="flex gap-6 text-sm text-brick-ink/70">
            <a href="#" className="hover:text-brick-cobalt">
              About
            </a>
            <a href="#" className="hover:text-brick-cobalt">
              Pricing
            </a>
            <a href="#" className="hover:text-brick-cobalt">
              Discord
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CreateView({
  prompt,
  setPrompt,
  onGenerate,
  generating,
  loaderIndex,
  showResults,
  buildTitle,
  setBuildTitle,
  sku,
  onOrder,
  onShare,
  titleEditing,
  setTitleEditing,
}) {
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (titleEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [titleEditing]);

  const loaderMessage = LOADER_MESSAGES[loaderIndex % LOADER_MESSAGES.length];

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col lg:flex-row">
      <aside className="relative w-full border-b border-black/5 bg-white/80 p-4 backdrop-blur-sm lg:w-[40%] lg:border-b-0 lg:border-r lg:p-6">
        <FloatingStuds className="opacity-50" />
        <div className="relative">
          <h2 className="font-display text-xl font-bold text-brick-ink">✨ New build</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to build… e.g. 'a cozy reading nook with a cat'"
            rows={8}
            className="mt-4 w-full resize-none rounded-2xl border border-black/10 bg-brick-cream/50 p-4 font-sans text-sm text-brick-ink shadow-inner outline-none ring-brick-cobalt/30 transition placeholder:text-brick-ink/40 focus:border-brick-cobalt/40 focus:ring-2"
          />
          <div className="mt-3 flex min-h-[100px] items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-brick-cream/30 text-center text-sm text-brick-ink/50">
            or drop a photo here 📸
          </div>
          <button
            type="button"
            onClick={onGenerate}
            disabled={generating}
            className="mt-4 w-full rounded-2xl bg-brick-yellow py-4 text-base font-semibold text-brick-ink shadow-xl shadow-brick-yellow/20 transition hover:scale-[1.02] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
      </aside>

      <section className="relative flex-1 bg-brick-cream/40 p-4 lg:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(27,111,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,111,235,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <FloatingStuds />

        <div className="relative mx-auto max-w-xl">
          {!generating && !showResults && (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/40 p-8 text-center shadow-inner">
              <p className="text-brick-ink/45">Your build will appear here →</p>
            </div>
          )}

          {generating && (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/70 p-8 shadow-xl shadow-black/5">
              <span className="text-5xl animate-spin-slow" aria-hidden>
                🧱
              </span>
              <p className="mt-6 font-mono text-sm text-brick-ink/70">{loaderMessage}</p>
            </div>
          )}

          {showResults && !generating && (
            <div className="space-y-4">
              <div className="rounded-xl px-1">
                {titleEditing ? (
                  <input
                    ref={titleInputRef}
                    value={buildTitle}
                    onChange={(e) => setBuildTitle(e.target.value)}
                    onBlur={() => setTitleEditing(false)}
                    onKeyDown={(e) => e.key === "Enter" && setTitleEditing(false)}
                    className="w-full rounded-lg border border-brick-cobalt/40 bg-white px-3 py-2 font-display text-lg font-semibold text-brick-ink outline-none ring-2 ring-brick-cobalt/20"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setTitleEditing(true)}
                    className="w-full rounded-lg px-3 py-2 text-left font-display text-lg font-semibold text-brick-ink transition hover:bg-black/[0.04]"
                  >
                    {buildTitle}
                    <span className="ml-2 text-xs font-normal text-brick-ink/40">(click to edit)</span>
                  </button>
                )}
              </div>

              {[
                {
                  delay: "0ms",
                  header: "📦 Your kit",
                  body: (
                    <>
                      <FallbackImage
                        primary={ASSET_BOX_ART}
                        fallback={PLACEHOLDER_BOX}
                        alt="Kit box"
                        className="w-full rounded-xl border border-white/10 object-cover"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-white/90">
                        <span>SKU: {sku}</span>
                        <span className="text-white/40">·</span>
                        <span>107 PCS</span>
                        <span className="text-white/40">·</span>
                        <span>Difficulty: ●●●○○</span>
                      </div>
                    </>
                  ),
                  dark: true,
                },
                {
                  delay: "200ms",
                  header: "🧱 Parts list",
                  body: (
                    <>
                      <FallbackImage
                        primary={ASSET_PARTS_LIST}
                        fallback={PLACEHOLDER_PARTS}
                        alt="Parts list"
                        className="w-full rounded-xl border border-black/5 object-cover"
                      />
                      <p className="mt-3 text-xs leading-relaxed text-brick-ink/60">
                        All parts genuine LEGO® bricks, sourced and packed in our Berlin warehouse.
                      </p>
                    </>
                  ),
                  dark: false,
                },
                {
                  delay: "400ms",
                  header: "📖 Build instructions (preview)",
                  body: (
                    <>
                      <FallbackImage
                        primary={ASSET_INSTRUCTIONS}
                        fallback={PLACEHOLDER_INSTRUCTIONS}
                        alt="Instructions"
                        className="w-full rounded-xl border border-white/10 object-cover"
                      />
                      <p className="mt-3 text-xs leading-relaxed text-white/70">
                        Full color printed booklet ships with your kit.
                      </p>
                    </>
                  ),
                  dark: true,
                },
              ].map((card, i) => (
                <article
                  key={i}
                  style={{ animationDelay: card.delay }}
                  className={`animate-fade-in rounded-2xl border border-black/5 p-4 shadow-xl shadow-black/5 opacity-0 [animation-fill-mode:forwards] transition hover:-translate-y-0.5 hover:shadow-2xl ${
                    card.dark ? "bg-brick-ink text-white" : "bg-white text-brick-ink"
                  }`}
                >
                  <h3 className="mb-3 font-display text-sm font-semibold">{card.header}</h3>
                  {card.body}
                </article>
              ))}

              <div className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/95 p-4 shadow-2xl shadow-black/10 backdrop-blur-md sm:flex-row">
                <button
                  type="button"
                  onClick={onOrder}
                  className="flex-1 rounded-2xl bg-brick-yellow py-3.5 text-center text-base font-semibold text-brick-ink shadow-lg shadow-brick-yellow/25 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  Order kit — $49
                </button>
                <button
                  type="button"
                  onClick={onShare}
                  className="flex-1 rounded-2xl border-2 border-brick-ink/15 bg-transparent py-3.5 text-center text-base font-semibold text-brick-ink transition hover:scale-[1.02] hover:border-brick-ink/30 active:scale-[0.98]"
                >
                  Share to community
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function FeedView({ activeTab, setActiveTab, onRemix }) {
  const tabs = [
    { id: "trending", label: "🔥 Trending" },
    { id: "new", label: "🆕 New" },
    { id: "featured", label: "⭐ Featured this week" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6">
      <div className="mb-6 rounded-2xl border border-brick-yellow/30 bg-gradient-to-r from-brick-yellow/20 via-white to-brick-cobalt/10 px-4 py-3 text-center text-sm font-medium text-brick-ink shadow-sm">
        💰 Top weekly creators earn 10% on every remix order.
      </div>

      <h1 className="font-display text-3xl font-bold text-brick-ink sm:text-4xl">🧱 Community builds</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition hover:scale-[1.02] ${
              activeTab === t.id
                ? "bg-brick-ink text-white shadow-lg"
                : "border border-black/10 bg-white text-brick-ink shadow-sm"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {FEED_BUILDS.map((b) => {
          const showFeaturedBorder = activeTab === "featured" && b.featured;
          const inner = (
            <div className="group relative overflow-hidden bg-white">
              <div className="block w-full text-left">
                <FallbackImage
                  primary={ASSET_BOX_ART}
                  fallback={PLACEHOLDER_BOX}
                  alt=""
                  className="aspect-[4/5] w-full object-cover transition group-hover:scale-[1.01]"
                />
                <div className="p-4">
                  <p className="font-display font-semibold text-brick-ink">{b.name}</p>
                  <p className="mt-1 font-mono text-xs text-brick-ink/50">{b.creator}</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-brick-ink/60">
                    <span>❤ {b.hearts}</span>
                    <span>🔁 {b.remixes} remixes</span>
                    <span>📦 {b.ordered} ordered</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-brick-ink via-brick-ink/95 to-transparent p-4 pt-12 transition group-hover:translate-y-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemix(b);
                  }}
                  className="w-full rounded-xl bg-brick-yellow py-2.5 text-sm font-semibold text-brick-ink shadow-lg transition hover:scale-[1.02]"
                >
                  Remix this build →
                </button>
              </div>
            </div>
          );

          return (
            <div key={b.id} className="mb-4 break-inside-avoid">
              {showFeaturedBorder ? (
                <div className="rounded-2xl bg-gradient-to-br from-brick-yellow/70 via-brick-yellow/35 to-brick-cobalt/35 p-[2px] shadow-xl shadow-black/5 transition hover:-translate-y-1 hover:shadow-2xl">
                  <div className="overflow-hidden rounded-[14px]">{inner}</div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/5 shadow-xl shadow-black/5 transition hover:-translate-y-1 hover:shadow-2xl">
                  {inner}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loaderIndex, setLoaderIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [buildTitle, setBuildTitle] = useState("Untitled Kit");
  const [sku, setSku] = useState(() => randomSku());
  const [titleEditing, setTitleEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [feedTab, setFeedTab] = useState("trending");
  const genTimerRef = useRef(null);
  const loaderTimerRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (genTimerRef.current) clearTimeout(genTimerRef.current);
    if (loaderTimerRef.current) clearInterval(loaderTimerRef.current);
    genTimerRef.current = null;
    loaderTimerRef.current = null;
  }, []);

  const runGeneration = useCallback(
    (skipLoader = false) => {
      clearTimers();
      if (skipLoader) {
        setShowResults(true);
        setGenerating(false);
        setSku(randomSku());
        return;
      }
      setGenerating(true);
      setShowResults(false);
      setLoaderIndex(0);
      loaderTimerRef.current = setInterval(() => {
        setLoaderIndex((i) => i + 1);
      }, 700);
      genTimerRef.current = setTimeout(() => {
        if (loaderTimerRef.current) clearInterval(loaderTimerRef.current);
        setGenerating(false);
        setShowResults(true);
        setSku(randomSku());
      }, 3500);
    },
    [clearTimers]
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleGenerate = () => {
    if (generating) return;
    setBuildTitle(titleFromPrompt(prompt));
    runGeneration(false);
  };

  const goLanding = () => {
    clearTimers();
    setView("landing");
    setGenerating(false);
    setShowResults(false);
  };

  const goCreate = () => {
    setView("create");
  };

  const goFeed = () => {
    setView("feed");
  };

  const startFromLanding = () => {
    setView("create");
    setPrompt("");
    setShowResults(false);
    setGenerating(false);
    setBuildTitle("Untitled Kit");
    clearTimers();
  };

  const handleRemix = (build) => {
    setPrompt(`Remix of: ${build.name} — `);
    setBuildTitle(`${build.name} (Remix) Kit`);
    setView("create");
    runGeneration(true);
  };

  const handleLandingCard = () => {
    setView("feed");
  };

  return (
    <div className="min-h-screen">
      <NavBar
        view={view}
        onLogo={goLanding}
        onBrowse={goFeed}
        onBuild={goCreate}
      />

      {view === "landing" && (
        <LandingView onStart={startFromLanding} onFeed={goFeed} onCardClick={handleLandingCard} />
      )}

      {view === "create" && (
        <CreateView
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          generating={generating}
          loaderIndex={loaderIndex}
          showResults={showResults}
          buildTitle={buildTitle}
          setBuildTitle={setBuildTitle}
          sku={sku}
          titleEditing={titleEditing}
          setTitleEditing={setTitleEditing}
          onOrder={() => setToast("🚚 Order placed! Your kit ships in 7 days.")}
          onShare={() => setToast("✨ Posted to the community feed!")}
        />
      )}

      {view === "feed" && (
        <FeedView activeTab={feedTab} setActiveTab={setFeedTab} onRemix={handleRemix} />
      )}

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
