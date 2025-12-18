import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

function Fade({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="fade">{children}</div>;
}

function ParallaxCard({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  return (
    <Fade>
      <div ref={ref} style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
        <motion.div style={{ y }}>{children}</motion.div>
      </div>
    </Fade>
  );
}

function Terminal() {
  const [val, setVal] = useState('');
  const outRef = useRef(null);
  const history = useRef([]);
  const histIdx = useRef(0);

  const handlers = useMemo(() => ({
    help: () => [
      'Commands:',
      '- help      Show this help',
      '- whoami    Brief intro',
      '- skills    Tech stack',
      '- projects  Jump to projects',
      '- about     About summary',
      '- contact   Contact links',
      '- clear     Clear output',
    ].join('\n'),
    whoami: () => 'Settawud Promyos — Junior Software Developer.',
    skills: () => 'html css javascript react node express mongodb sql mysql postgresql tailwind git next.js python ai/rag',
    projects: () => {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return [
        'Scrolling to projects…',
        '1. GinRaiDee (MERN)',
        '2. Livin\' Lab (React)',
        '3. RAG Notes (AI/RAG)',
        '4. NextFlix (Next.js)',
      ].join('\n');
    },
    about: () => [
      'Junior Software Developer — transitioning from banking.',
      'Client-facing, analytical, compliance (AML/PDPA).',
      'Bootcamp JSD10 — React, Node.js, JavaScript, SQL, MongoDB.',
    ].join('\n'),
    contact: () => [
      'email: settawud.pr@gmail.com',
      'phone: 095-280-7070',
      'linkedin: /in/settawud-promyos',
      'github: @Settawud',
    ].join('\n'),
    clear: () => {
      if (outRef.current) outRef.current.textContent = '';
      return '';
    },
  }), []);

  const print = (cmd, res) => {
    if (res !== '' && outRef.current) {
      outRef.current.textContent += `\n> ${cmd}\n${res}\n`;
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = val;
      const c = raw.trim().toLowerCase();
      if (!c) return;
      if (history.current[history.current.length - 1] !== raw) history.current.push(raw);
      histIdx.current = history.current.length;
      const out = handlers[c] ? handlers[c]() : `command not found: ${c}`;
      print(c, out);
      setVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.current.length > 0) {
        histIdx.current = Math.max(0, histIdx.current - 1);
        setVal(history.current[histIdx.current] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx.current < history.current.length - 1) {
        histIdx.current++;
        setVal(history.current[histIdx.current]);
      } else {
        histIdx.current = history.current.length;
        setVal('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const q = val.trim().toLowerCase();
      if (!q) return;
      const match = Object.keys(handlers).find((x) => x.startsWith(q));
      if (match) setVal(match);
    }
  };

  return (
    <div className="cli mono" aria-label="terminal panel" onClick={(e) => e.currentTarget.querySelector('input')?.focus()}>
      <div><span className="prompt">&gt;</span> welcome</div>
      <div><span className="prompt">$</span> type <span className="chip">help</span> to explore</div>
      <div ref={outRef} aria-live="polite" style={{ minHeight: 'clamp(96px,18vh,140px)', marginTop: 8, whiteSpace: 'pre-wrap', maxHeight: 'clamp(160px,32vh,320px)', overflow: 'auto' }} />
      <div className="input-line hstack">
        <span className="prompt">&gt;</span>
        <input aria-label="terminal input" placeholder="whoami | skills | projects..." value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={onKeyDown} />
        <span className="blink" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function PortfolioVM() {
  useEffect(() => {
    const PROFILE_IMG = '/profile.jpg';
    const GINRAIDEE_IMG = '/Ginraidee.png';
    const LIVINLAB_IMG = '/LivinLab.png';
    const prof = document.getElementById('vm-profile-img');
    const gin = document.getElementById('vm-ginraidee-img');
    const livinlab = document.getElementById('vm-livinlab-img');
    if (prof) prof.src = PROFILE_IMG;
    if (gin) gin.src = GINRAIDEE_IMG;
    if (livinlab) livinlab.src = LIVINLAB_IMG;
  }, []);

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', color: 'var(--text)', background: 'var(--bg)' }}>
      <style>{`
        :root{ --bg:#0b1024; --panel:#0e1533; --text:#eaf2ff; --muted:#bcd3ff; --line:rgba(160,195,255,.18); --chip:rgba(160,195,255,.08); --ok:#60a5fa; --acc:#22d3ee; --warn:#f59e0b; --shadow:0 18px 50px rgba(0,0,0,.5); --term:#7dd3fc; --term-dim:#0a2547; --term-glow:#93c5fd; }
        *{box-sizing:border-box}
        a{color:inherit;text-decoration:none}
        img{max-width:100%;display:block}
        .container{width:min(1120px, 100% - 2rem);margin:0 auto;position:relative; z-index:1}
        .hstack{display:flex;align-items:center;gap:12px}
        .split{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(16px,3vw,24px);align-items:start}
        .thumb{background:var(--chip);border-radius:16px;aspect-ratio:16/10;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow)}
        .thumb>img{width:100%;height:100%;object-fit:cover}
        .card{border:1px solid var(--line);border-radius:16px;padding:24px;background:linear-gradient(180deg, var(--panel), color-mix(in oklab, var(--panel) 90%, #000));box-shadow:var(--shadow)}
        .hero{padding:72px 0 28px}
        h2{font-size:clamp(22px,3vw,32px);margin:8px 0;color:var(--ok)}
        h3{font-size:18px;margin:6px 0;color:var(--acc)}
        .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace}
        .cli{border:1px solid var(--line);background:linear-gradient(180deg,var(--panel), color-mix(in oklab, var(--panel) 90%, #000));border-radius:16px;padding:18px;box-shadow:0 0 0 1px rgba(255,255,255,.06) inset}
        .prompt{color:var(--term)}
        .input-line{position:relative}
        .input-line input{background:transparent;border:none;outline:none;color:var(--text);width:100%;font:inherit;caret-color:var(--term)}
        .input-line input::placeholder{color:rgba(255,255,255,.35)}
        .blink{display:inline-block;width:.6ch;margin-left:4px;background:var(--term);height:1.1em;transform:translateY(2px);animation:blink 1s step-end infinite;box-shadow:0 0 8px var(--term-glow)}
        @keyframes blink{50%{opacity:0}}
        .fade{opacity:0;transform:translateY(10px);transition:opacity .5s ease-out, transform .5s ease-out}
        .fade.show{opacity:1;transform:none}
        .scene{min-height:100vh; display:flex; align-items:center;}
        .divider{height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent); margin:24px 0}
        .btn{border:1px solid var(--line);padding:10px 14px;border-radius:12px;display:inline-block;background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));cursor:pointer}
        .muted{color:var(--muted)}
        .chip{border:1px solid var(--line);background:var(--chip);padding:6px 10px;border-radius:12px;font-size:13px}
      `}</style>
      <main>
        <section className="scene" data-scene="1">
          <div className="container hero split scene-enter" data-scene-el>
            <Fade>
              <div className="thumb">
                <img src="/profile.jpg" alt="My Profile" loading="lazy" />
              </div>
            </Fade>
            <Fade>
              <Terminal />
            </Fade>
          </div>
        </section>

        <div className="divider" />

        <section className="scene" data-scene="2" id="projects">
          <div className="container scene-enter" data-scene-el>
            <Fade><h2>Selected Projects</h2></Fade>
            <div className="split">
              <ParallaxCard>
                <article className="card scroll-fx">
                  <div className="thumb"><img src="/Ginraidee.png" alt="GinRaiDee project" loading="lazy" /></div>
                  <h3 style={{ marginTop: 16 }}>GinRaiDee — Food Suggester</h3>
                  <p className="muted">Random food recommendations with filters. MERN stack, responsive UI.</p>
                  <div className="hstack" style={{ marginTop: 12 }}>
                    <a className="btn magnetic" href="https://ginraidee.onrender.com" target="_blank" rel="noopener noreferrer">Live</a>
                  </div>
                </article>
              </ParallaxCard>
              <ParallaxCard>
                <article className="card scroll-fx">
                  <div className="thumb"><img src="/LivinLab.png" alt="LivinLab project" loading="lazy" /></div>
                  <h3 style={{ marginTop: 16 }}>Livin' Lab — Ergonomic Store</h3>
                  <p className="muted">E‑commerce demo: cart, checkout, admin. Performance‑minded React.</p>
                  <div className="hstack" style={{ marginTop: 12 }}>
                    <a className="btn magnetic" href="https://group7-project-sprint2.vercel.app/" target="_blank" rel="noopener noreferrer">Live</a>
                  </div>
                </article>
              </ParallaxCard>
              <ParallaxCard>
                <article className="card scroll-fx">
                  <div className="thumb"><img src="/rag_noteApp.png" alt="RAG Notes project" loading="lazy" /></div>
                  <h3 style={{ marginTop: 16 }}>RAG Notes – AI Notes</h3>
                  <p className="muted">Retrieval‑augmented notes with embeddings and chat interface.</p>
                  <div className="hstack" style={{ marginTop: 12 }}>
                    <a className="btn magnetic" href="https://rag-my-note-817etklfz-settawuds-projects.vercel.app" target="_blank" rel="noopener noreferrer">Live</a>
                  </div>
                </article>
              </ParallaxCard>
              <ParallaxCard>
                <article className="card scroll-fx">
                  <div className="thumb"><img src="/nextflixApp.png" alt="NextFlix project" loading="lazy" /></div>
                  <h3 style={{ marginTop: 16 }}>NextFlix – Streaming Service</h3>
                  <p className="muted">Streaming service with movie recommendations.</p>
                  <div className="hstack" style={{ marginTop: 12 }}>
                    <a className="btn magnetic" href="https://nextflix-frontend.vercel.app" target="_blank" rel="noopener noreferrer">Live</a>
                  </div>
                </article>
              </ParallaxCard>
            </div>
          </div>
        </section>

        <div className="divider" />

        <section className="scene" data-scene="3">
          <div className="container split scene-enter" data-scene-el>
            <Fade>
              <div className="card">
                <h2>About Me</h2>
                <p className="muted" style={{ lineHeight: 1.6, marginTop: 10 }}>
                  Software developer with a background in banking. Detail-oriented, problem solver, focusing on MERN stack and great UX.
                </p>
              </div>
            </Fade>
            <Fade>
              <div className="card">
                <h2>Get In Touch</h2>
                <div className="hstack" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                  <a className="btn magnetic" href="mailto:settawud.pr@gmail.com">Email</a>
                  <a className="btn magnetic" href="https://www.linkedin.com/in/settawud-promyos" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                  <a className="btn magnetic" href="https://github.com/Settawud" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
              </div>
            </Fade>
          </div>
        </section>
      </main>
    </div>
  );
}
