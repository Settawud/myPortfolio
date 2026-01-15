import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Minimalist Dev Portfolio – Multi‑Style (Production‑ready JS)
 * * Upgrades in this version:
 * - Theme now has a user-toggle that persists, and a system-based toggle is removed.
 * - Added LANGUAGE toggle (TH/EN) with simple i18n dictionary + persistence.
 * - Added new "Resume" layout with print‑friendly design + Print button.
 * - Project tag FILTER chips (All + tags) for quick browsing.
 * - Active section highlighting in the header (IntersectionObserver).
 * - External links open in new tab; mailto/tel keep default behavior.
 * - Kept Terminal layout in English commands (per your request).
 * - Sanity tests via console.assert to reduce regressions.
 */

// ————————————————————————————————————————————————————————————————
// Theme (manual & persisted)
// ————————————————————————————————————————————————————————————————
const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// NEW: Helper function to get the initial theme mode
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {}
  return prefersDark() ? 'dark' : 'light';
}

// ————————————————————————————————————————————————————————————————
// i18n (TH/EN)
// ————————————————————————————————————————————————————————————————
const DICT = {
  th: {
    nav: { projects: "ผลงาน", about: "เกี่ยวกับผม", contact: "ติดต่อ" },
    hero: {
      kicker: "แนะนำตัว",
      title: "สวัสดีครับ ผมเสฏฐวุฒิ — นักพัฒนาซอฟต์แวร์ Full‑stack",
      subtitle:
        "ผมคือเสฏฐวุฒิ (Best) นักพัฒนาซอฟต์แวร์สาย Full‑stack เน้นความเร็ว การเข้าถึง และความปลอดภัย ใส่ใจ DX โครงสร้างโค้ดที่สะอาด และประสบการณ์ใช้งานที่ราบรื่น",
      cta_projects: "ดูผลงาน",
      cta_contact: "ติดต่อ",
    },
    sections: {
      selected_projects: "ผลงานเด่น",
      about: "เกี่ยวกับผม",
      contact: "ติดต่อ",
      all_work: "ทั้งหมด →",
    },
    about_body:
      "ผมชื่อ เสฏฐวุฒิ (Best) เป็นนักพัฒนาซอฟต์แวร์สาย Full‑stack ถนัด React, Node/Express และ MongoDB โฟกัสที่ประสิทธิภาพ (Lighthouse ≥ 90), ดีไซน์แบบมินิมอล และมาตรฐานความปลอดภัยตั้งแต่ต้นทาง",
    contact_head: "พร้อมร่วมงานเพื่อส่งมอบงานที่เรียบง่าย คุณภาพสูง",
    contact_body: "เปิดรับงานประจำและงานร่วมมือ หากสนใจพูดคุยโปรดติดต่อได้เลย",
    resume: {
      heading: "เรซูเม่",
      summary: "นักพัฒนา Full‑stack ที่เน้นคุณภาพ ประสิทธิภาพ และความปลอดภัยของระบบ ด้วยประสบการณ์ React, Node/Express, MongoDB",
      experience: "ประสบการณ์",
      skills: "ทักษะ",
      education: "การศึกษา",
      print: "พิมพ์/บันทึก PDF",
    },
  },
  en: {
    nav: { projects: "Projects", about: "About", contact: "Contact" },
    hero: {
      kicker: "Portfolio",
      title: "Hello, I'm Settawud — Full‑stack Software Developer",
      subtitle:
        "I build fast, accessible web apps with React and Node, with a security‑first mindset and clean developer experience.",
      cta_projects: "View Projects",
      cta_contact: "Contact",
    },
    sections: {
      selected_projects: "Selected Projects",
      about: "About",
      contact: "Contact",
      all_work: "All →",
    },
    about_body:
      "I'm a full‑stack developer focusing on React, Node/Express, and MongoDB. I care about performance (≥90 Lighthouse), minimal UI, and security best practices.",
    contact_head: "Let's build something minimal.",
    contact_body: "Open to full‑time roles and collaborations.",
    resume: {
      heading: "Résumé",
      summary:
        "Full‑stack developer focused on quality, performance and security. Experienced with React, Node/Express, MongoDB.",
      experience: "Experience",
      skills: "Skills",
      education: "Education",
      print: "Print/Save PDF",
    },
  },
};

function getInitialLocale() {
  try {
    const saved = localStorage.getItem("locale");
    if (saved === "th" || saved === "en") return saved;
  } catch {}
  // Default to English
  return "en";
}

const STYLES = ["classic", "sidebar", "split", "mono", "terminal", "resume"];

const LINKS = {
  ragNotes: "https://rag-my-note-817etklfz-settawuds-projects.vercel.app",
  generationBarometer: "https://generation-barometer.vercel.app",
  ginRaiDee: "https://ginraidee.onrender.com",
  wellBeingLab: "https://group7-project-sprint2.vercel.app/",
  nextflix: "https://nextflix-frontend.vercel.app",
  todoList: "https://todo-list-frontend.vercel.app",
  baroGoFiber: "#",
  github: "https://github.com/Settawud",
  linkedin: "https://linkedin.com/in/settawud-promyos",
  email: "mailto:settawud.pr@gmail.com",
  phone: "tel:0952807070",
};

export default function DevPortfolioMultiStyle() {
  // Theme state: Now controlled by the user and persisted in localStorage
  const [theme, setTheme] = useState(getInitialTheme);
  
  const [style, setStyle] = useState("classic");
  const [locale, setLocale] = useState(getInitialLocale());
  const [activeSection, setActiveSection] = useState("home");
  const [filterTag, setFilterTag] = useState("All");

  // i18n helper
  const t = (path) => {
    const parts = path.split(".");
    let obj = (DICT[locale] || DICT.th);
    for (const p of parts) obj = obj?.[p];
    return obj ?? path;
  };

  // NEW: Persist theme state and sync <html>.dark
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Persist style & locale
  useEffect(() => {
    try { localStorage.setItem("portfolio_style", style); } catch {}
  }, [style]);
  useEffect(() => {
    try { localStorage.setItem("locale", locale); } catch {}
  }, [locale]);

  // Restore style
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio_style");
      if (saved && STYLES.includes(saved)) setStyle(saved);
    } catch {}
  }, []);

  // Active section tracking
  useEffect(() => {
    const ids = ["home", "projects", "about", "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0.15, 0.3, 0.6] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [style]);

  // Projects data
  const projects = useMemo(
    () => [
      {
        title: "Livin' Lab – Ergonomic Store",
        desc: "E‑commerce demo: cart, checkout, admin. Performance‑minded React.",
        link: LINKS.wellBeingLab,
        tags: ["E‑commerce", "React", "Perf"],
        image: "/LivinLab.png",
      },
      {
        title: "GinRaiDee – Food Suggester",
        desc: "Random food recommendations with filters. MERN stack, responsive UI.",
        link: LINKS.ginRaiDee,
        tags: ["MERN", "UX", "Filters"],
        image: "/Ginraidee.png",
      },
      {
        title: "RAG Notes – AI Notes",
        desc: "Retrieval‑augmented notes with embeddings and chat interface.",
        link: LINKS.ragNotes,
        tags: ["RAG", "Embeddings", "AI"],
        image: "/rag_noteApp.png",
      },
      {
        title: "NextFlix – Streaming Service",
        desc: "Streaming service with movie recommendations.",
        link: LINKS.nextflix,
        tags: ["Next.js", "Recommendations"],
        image: "/nextflixApp.png",
      },
      {
        title: "Kanban Board",
        desc: "Task manager with TypeScript",
        link: LINKS.todoList,
        tags: ["HTML", "CSS", "TypeScript", "Task Manager"],
        image: "/KanbanBoard.png",
      },
    ],
    []
  );

  const allTags = useMemo(() => {
    const set = new Set(["All"]);
    projects.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filterTag === "All") return projects;
    return projects.filter((p) => p.tags?.includes(filterTag));
  }, [projects, filterTag]);

  // ——— Sanity checks (dev only) ———
  useEffect(() => {
    try {
      console.assert(["th", "en"].includes(locale), "locale must be th|en");
      console.assert(typeof prefersDark() === "boolean", "prefersDark boolean");
      // html.dark must reflect theme state
      console.assert(document.documentElement.classList.contains('dark') === (theme === 'dark'), '<html>.dark sync');
      console.assert(STYLES.includes("resume"), "resume style exists");
      console.assert(cap("classic") === "Classic", "cap works");
      // i18n keys
      ["nav.projects", "hero.kicker", "sections.selected_projects"].forEach((k) => {
        const val = t(k);
        console.assert(typeof val === "string" && val.length > 0, `i18n key ${k}`);
      });
      // filterTag must be in allTags
      console.assert(allTags.includes(filterTag), "filterTag must be valid");
      // extProps
      const a = extProps("https://example.com");
      const b = extProps("mailto:a@b.com");
      console.assert(a.target === "_blank" && /noopener/.test(a.rel), "http link opens new tab");
      console.assert(!("target" in b), "mailto has no target");
    } catch {}
  }, [locale, theme, filterTag, allTags]);

  return (
    <div>
      <div className="min-h-dvh bg-white text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-stone-900 focus:text-white dark:focus:bg-white dark:focus:text-stone-900 px-3 py-2">Skip to content</a>

        <SiteHeader
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          styleKey={style}
          onStyleChange={setStyle}
          locale={locale}
          onLocaleChange={setLocale}
          t={t}
          activeSection={activeSection}
        />

        {/* Render selected layout */}
        {style === "classic" && (
          <ClassicLayout t={t} projects={filteredProjects} socials={SOCIALS} allTags={allTags} filterTag={filterTag} setFilterTag={setFilterTag} />
        )}
        {style === "sidebar" && (
          <SidebarLayout t={t} projects={filteredProjects} socials={SOCIALS} allTags={allTags} filterTag={filterTag} setFilterTag={setFilterTag} />
        )}
        {style === "split" && <SplitLayout t={t} projects={filteredProjects} socials={SOCIALS} />}
        {style === "mono" && <MonoLayout t={t} projects={filteredProjects} socials={SOCIALS} />}
        {style === "terminal" && <TerminalLayout projects={filteredProjects} socials={SOCIALS} />}
        {style === "resume" && <ResumeLayout t={t} socials={SOCIALS} />}

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Settawud Promyos",
              jobTitle: locale === "th" ? "นักพัฒนาซอฟต์แวร์" : "Software Developer",
              url: LINKS.generationBarometer || LINKS.ragNotes || "https://example.com",
              sameAs: [LINKS.github, LINKS.linkedin],
            }),
          }}
        />

        <SiteFooter />
      </div>
    </div>
  );
}

// Socials (centralized)
const SOCIALS = [
  { label: "GitHub", href: LINKS.github },
  { label: "LinkedIn", href: LINKS.linkedin },
  { label: "Email", href: LINKS.email },
  { label: "Phone", href: LINKS.phone },
];

// ————————————————————————————————————————————————————————————————
// Header
// ————————————————————————————————————————————————————————————————
function SiteHeader({ theme, onThemeToggle, styleKey, onStyleChange, locale, onLocaleChange, t, activeSection }) {
  const isDark = theme === "dark";
  const nav = [
    { id: "projects", label: t("nav.projects") },
    { id: "about", label: t("nav.about") },
    { id: "contact", label: t("nav.contact") },
  ];
  const canPrint = styleKey === "resume";

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 justify-between">
        <a href="#home" className="font-semibold tracking-tight">Settawud • Software Developer</a>

        <nav className="hidden gap-6 text-sm md:flex">
          {nav.map((n) => (
            <a key={n.id} className={`hover:opacity-80 ${activeSection === n.id ? "underline underline-offset-4" : ""}`} href={`#${n.id}`}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Style select */}
          <label className="sr-only" htmlFor="style-select">Select layout style</label>
          <select
            id="style-select"
            aria-label="Select layout style"
            value={styleKey}
            onChange={(e) => onStyleChange(e.target.value)}
            className="rounded-2xl border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-sm bg-transparent"
          >
            {STYLES.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-stone-900">{cap(s)}</option>
            ))}
          </select>

          {/* Day/Night toggle */}
          <button
            aria-label={theme === 'dark' ? 'Switch to Day' : 'Switch to Night'}
            title={theme === 'dark' ? 'Switch to Day' : 'Switch to Night'}
            onClick={onThemeToggle}
            className="rounded-2xl border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-sm bg-transparent hover:bg-stone-50 dark:hover:bg-stone-900"
          >
            {theme === 'dark' ? (
              // Sun icon
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.41 1.41M8.34 17.66l-1.41 1.41m0-12.72 1.41 1.41m9.32 9.32 1.41 1.41"/>
              </svg>
            ) : (
              // Moon icon
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Locale select */}
          <select
            aria-label="Language"
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value)}
            className="rounded-2xl border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-sm bg-transparent"
          >
            <option className="bg-white dark:bg-stone-900" value="th">ไทย</option>
            <option className="bg-white dark:bg-stone-900" value="en">EN</option>
          </select>

          {canPrint && (
            <button onClick={() => window.print()} className="rounded-2xl border border-stone-300 dark:border-stone-700 px-3 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-900">
              {t("resume.print")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ————————————————————————————————————————————————————————————————
// Layouts
// ————————————————————————————————————————————————————————————————
function ClassicLayout({ t, projects, socials, allTags, filterTag, setFilterTag }) {
  return (
    <main id="main">
      {/* Hero */}
      <section id="home" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-center">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">{t("hero.kicker")}</p>
            <h1 className="text-4xl/tight md:text-5xl/tight font-extrabold tracking-tight">{t("hero.title")}</h1>
            <p className="text-stone-600 dark:text-stone-300 max-w-prose">{t("hero.subtitle")}</p>
            <div className="flex gap-3 pt-2">
              <a
                href="#projects"
                // className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 text-white px-5 py-2.5 text-sm font-semibold shadow hover:shadow-lg hover:brightness-105 active:scale-[.99] transition-transform"
                className="group inline-flex items-center gap-2 
           rounded-lg bg-white/10 backdrop-blur-md 
           text-gray-900 px-5 py-2.5 text-sm font-semibold 
           border border-gray-300 
           shadow-md hover:shadow-lg 
           active:scale-95 transition-all duration-200"

              >
            
                <span>{t("hero.cta_projects")}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#contact"
                // className="rounded-2xl border border-emerald-200 dark:border-emerald-700 px-4 py-2 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition"
                className="group inline-flex items-center gap-2 
           rounded-lg bg-white/10 backdrop-blur-md 
           text-gray-900 px-5 py-2.5 text-sm font-semibold 
           border border-gray-300 
           shadow-md hover:shadow-lg 
           active:scale-95 transition-all duration-200"

              >
                {t("hero.cta_contact")}
              </a>
            </div>
          </div>
          <div className="justify-self-end">
            {/* <div className="aspect-[4/3] w-full max-w-sm rounded-3xl border border-stone-200 dark:border-stone-800 p-6">
              <div className="h-full w-full rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800" />
            </div> */}
          </div>
        </div>
      </section>

      <SectionTitle title={t("sections.selected_projects")} moreLabel={t("sections.all_work")} />
      <TagFilter allTags={allTags} value={filterTag} onChange={setFilterTag} />
      <CardGrid projects={projects} />

      <AboutSection t={t} />
      <ContactSection t={t} socials={socials} />
    </main>
  );
}

function SidebarLayout({ t, projects, socials, allTags, filterTag, setFilterTag }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-[280px_1fr]" id="main">
      <aside className="sticky top-[72px] self-start rounded-3xl border border-stone-200 dark:border-stone-800 p-5 h-max">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settawud</h1>
        <p className="text-stone-600 dark:text-stone-300 mb-4">Software Developer</p>
        <nav className="grid gap-2 text-sm">
          <a href="#projects" className="hover:underline">{t("nav.projects")}</a>
          <a href="#about" className="hover:underline">{t("nav.about")}</a>
          <a href="#contact" className="hover:underline">{t("nav.contact")}</a>
        </nav>
      </aside>

      <section className="space-y-10">
        <header className="rounded-3xl border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-xl font-semibold tracking-tight">Minimalist code. Maximum clarity.</h2>
          <p className="text-stone-600 dark:text-stone-300">I build fast, accessible web apps with React, Node, and a security‑first mindset.</p>
        </header>
        <SectionAnchor id="projects" title={t("nav.projects")} />
        <TagFilter allTags={allTags} value={filterTag} onChange={setFilterTag} />
        <CardGrid projects={projects} />
        <SectionAnchor id="about" title={t("nav.about")} />
        <AboutCards />
        <SectionAnchor id="contact" title={t("nav.contact")} />
        <ContactSection t={t} socials={socials} compact />
      </section>
    </main>
  );
}

function SplitLayout({ t, projects, socials }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16" id="main">
      <div className="grid md:grid-cols-2 gap-6 items-stretch mb-10">
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">Hello</p>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Settawud Promyos</h1>
            <p className="text-stone-600 dark:text-stone-300">Full‑stack developer focused on React, Node, MongoDB, and secure design.</p>
          </div>
          <div className="pt-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoCard k="Frontend" v="React · Vite · Tailwind" />
              <InfoCard k="Backend" v="Node · Express · JWT" />
              <InfoCard k="Database" v="MongoDB · Indexing" />
              <InfoCard k="DevOps" v="Vercel · Render · CI" />
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 p-6">
          <div className="h-full w-full rounded-2xl aspect-[4/3] bg-stone-100 dark:bg-stone-900" />
        </div>
      </div>

      <SectionTitle title={t("sections.selected_projects")} />
      <CardGrid projects={projects} />

      <SectionAnchor id="contact" title={t("sections.contact")} />
      <ContactSection t={t} socials={socials} />
    </main>
  );
}

function MonoLayout({ t, projects, socials }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-14 font-mono" id="main">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Settawud / Software Developer</h1>
      <p className="text-stone-600 dark:text-stone-300 mb-8">Minimal code, reliable systems, and strong security baselines.</p>

      <section id="projects" className="mb-10">
        <h2 className="text-lg uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">{t("nav.projects")}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.title} className="rounded-xl border border-dashed border-stone-300 dark:border-stone-700 p-4">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">{p.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="mb-10">
        <h2 className="text-lg uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">{t("sections.about")}</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <InfoCard k="Frontend" v="React · Vite · Tailwind" mono />
          <InfoCard k="Backend" v="Node · Express · JWT" mono />
          <InfoCard k="Database" v="MongoDB · Indexing" mono />
          <InfoCard k="DevOps" v="Vercel · Render · CI" mono />
        </div>
      </section>

      <ContactSection t={t} socials={socials} compact />
    </main>
  );
}

function TerminalLayout({ projects, socials }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-14" id="main">
      <div className="rounded-2xl border border-stone-300 dark:border-stone-700 overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-stone-300 dark:border-stone-700 text-xs">
          <span className="h-3 w-3 rounded-full bg-red-500/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <span className="h-3 w-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-stone-500">bash — portfolio.sh</span>
        </div>
        <div className="bg-stone-950 text-stone-100 p-5 font-mono text-sm leading-relaxed">
          <p className="text-green-400">$ whoami</p>
          <p className="text-sky-300">Settawud (Best) — full‑stack developer</p>
          <p className="mt-4 text-green-400">$ skills --list</p>
          <p className="text-sky-300">React, Node/Express, MongoDB, Tailwind, Vercel/Render, CI</p>
          <p className="mt-4 text-green-400">$ ls projects/</p>
          <ul className="mt-1 list-disc list-inside space-y-1 text-sky-300">
            {projects.map((p) => (
              <li key={p.title}>
                <a href={p.link} {...extProps(p.link)} className="underline text-emerald-400 hover:text-emerald-300">{p.title}</a> — {p.desc}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-green-400">$ contact --info</p>
          <ul className="list-disc list-inside space-y-1 text-sky-300">
            <li>Email: <a className="underline text-emerald-400" href="mailto:settawud.pr@gmail.com">settawud.pr@gmail.com</a></li>
            <li>LinkedIn: <a className="underline text-emerald-400" {...extProps("https://linkedin.com/in/settawud-promyos")} href="https://linkedin.com/in/settawud-promyos">linkedin.com/in/settawud-promyos</a></li>
            <li>GitHub: <a className="underline text-emerald-400" {...extProps("https://github.com/Settawud")} href="https://github.com/Settawud">github.com/Settawud</a></li>
            <li>Phone: <a className="underline text-emerald-400" href="tel:0952807070">095-280-7070</a></li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function ResumeLayout({ t, socials }) {
  return (
    <main id="main" className="mx-auto max-w-4xl px-6 py-12 print:px-0">
      <section id="home" className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settawud Promyos</h1>
        <p className="text-stone-600 dark:text-stone-300">{t("resume.summary")}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...extProps(s.href)} className="underline hover:opacity-80">{s.label}</a>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">{t("resume.experience")}</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-medium">Freelance / Open‑source</p>
              <p className="text-stone-600 dark:text-stone-300">RAG Notes, dashboards, GoFiber APIs, e‑commerce demos</p>
            </li>
            <li>
              <p className="font-medium">Full‑stack Projects</p>
              <p className="text-stone-600 dark:text-stone-300">React, Node/Express, MongoDB, Tailwind, CI/CD</p>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">{t("resume.skills")}</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li className="rounded-xl border border-stone-200 dark:border-stone-800 p-3">React • Vite • Tailwind</li>
            <li className="rounded-xl border border-stone-200 dark:border-stone-800 p-3">Node • Express • JWT</li>
            <li className="rounded-xl border border-stone-200 dark:border-stone-800 p-3">MongoDB • Indexing</li>
            <li className="rounded-xl border border-stone-200 dark:border-stone-800 p-3">Vercel • Render • CI</li>
          </ul>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">{t("resume.education")}</h2>
        <div className="text-sm">B.S. (or equivalent experience) — Software Engineering</div>
      </section>

      {/* Print styles are handled by Tailwind defaults; keep backgrounds simple for printers */}
    </main>
  );
}

// ————————————————————————————————————————————————————————————————
// Reusable bits
// ————————————————————————————————————————————————————————————————
function SectionTitle({ title, moreLabel }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {moreLabel && <a href="#" className="text-sm text-stone-500 hover:underline">{moreLabel}</a>}
      </div>
    </section>
  );
}

function SectionAnchor({ id, title }) {
  return (
    <div id={id} className="flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <a href="#" className="text-sm text-stone-500 hover:underline">All →</a>
    </div>
  );
}

function TagFilter({ allTags, value, onChange }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-4 flex flex-wrap gap-2">
      {allTags.map((tag) => {
        const active = value === tag;
        return (
          <button
            key={tag}
            onClick={() => onChange(tag)}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition transform focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-stone-950 ${
              active
                ? "bg-emerald-600 dark:bg-emerald-400 dark:text-stone-900 border-emerald-600 dark:border-emerald-400 shadow-md ring-2 ring-emerald-300/60 ring-offset-2 ring-offset-white dark:ring-offset-stone-950 scale-[1.03]"
                : "border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 hover:ring-1 hover:ring-stone-300 dark:hover:ring-stone-600"
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {active && (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {tag}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CardGrid({ projects }) {
  return (
    <ul className="mx-auto max-w-6xl px-4 grid gap-4 md:grid-cols-3">
      {projects.map((p) => (
        <li key={p.title} className="group">
          <a href={p.link} {...extProps(p.link)} className="block rounded-3xl border border-stone-200 dark:border-stone-800 p-4 hover:bg-stone-50 dark:hover:bg-stone-900 transition">
            {p.image ? (
              <img
                src={p.image}
                alt={p.title}
                className="aspect-video w-full rounded-2xl object-cover mb-3"
                loading="lazy"
              />
            ) : (
              <div className="aspect-video rounded-2xl bg-stone-100 dark:bg-stone-900 mb-3" />
            )}
            <h3 className="font-medium tracking-tight">{p.title}</h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-2 mb-2">{p.desc}</p>
            <div className="flex flex-wrap gap-1">
              {(p.tags || []).map((t) => (
                <span key={t} className="text-[11px] rounded-md border border-stone-200 dark:border-stone-800 px-2 py-0.5">{t}</span>
              ))}
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

function AboutSection({ t }) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-12 border-y border-stone-200 dark:border-stone-800">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">{t("sections.about")}</h2>
          <p className="text-stone-700 dark:text-stone-300 max-w-prose">{t("about_body")}</p>
        </div>
        <AboutCards />
      </div>
    </section>
  );
}

function AboutCards() {
  const data = [
    ["Frontend", "React · Vite · Tailwind"],
    ["Backend", "Node · Express · JWT"],
    ["Database", "MongoDB · Indexing"],
    ["DevOps", "Vercel · Render · CI"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {data.map(([k, v]) => (
        <div key={k} className="rounded-2xl border border-stone-200 dark:border-stone-800 p-4">
          <p className="text-stone-500 dark:text-stone-400 text-xs mb-1 uppercase tracking-wider">{k}</p>
          <p className="font-medium">{v}</p>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ k, v, mono }) {
  return (
    <div className={`rounded-2xl border border-stone-200 dark:border-stone-800 p-4 ${mono ? "border-dashed" : ""}`}>
      <p className="text-stone-500 dark:text-stone-400 text-xs mb-1 uppercase tracking-wider">{k}</p>
      <p className="font-medium">{v}</p>
    </div>
  );
}

function ContactSection({ t, socials = [], compact }) {
  return (
    <section id="contact" className={`mx-auto max-w-6xl px-4 ${compact ? "py-6" : "py-12"}`}>
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight mb-2">{t("contact_head")}</h2>
        <p className="text-stone-600 dark:text-stone-300 mb-4">{t("contact_body")}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          {socials.map((s) => (
            <a key={s.label} href={s.href} {...extProps(s.href)} className="flex items-center gap-1.5 hover:opacity-80">
              <span className="underline">{s.label}</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L18 6" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-6 text-sm text-center text-stone-500 dark:text-stone-400">
      <p>Made by Settawud Promyos. All Rights Reserved.</p>
    </footer>
  );
}

// ————————————————————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————————————————————
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extProps(href) {
  const isExternal = href.startsWith("http") || href.startsWith("//");
  const isSpecial = href.startsWith("mailto:") || href.startsWith("tel:");
  if (isExternal && !isSpecial) {
    return { target: "_blank", rel: "noopener noreferrer" };
  }
  return {};
}
