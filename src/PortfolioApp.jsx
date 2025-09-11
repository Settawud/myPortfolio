import React from 'react';

// --- CONSTANTS & CONFIGURATION ---
// Encoded SVG for noise/grain texture to prevent breaking CSS template strings.
const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.4"/></svg>`;
const NOISE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}")`;

const THEMES = ['midnight', 'coral', 'sage', 'royal', 'mono'];
const SCENE_COUNT = 3;

// --- CORE UI COMPONENTS ---

/**
 * Renders the site header with branding, navigation, and theme switcher.
 * Stays sticky at the top of the viewport.
 */
function SceneHeader() {
  return (
    <header className="site-header">
      <div className="container hstack space-between">
        <div className="brand">Settawud — Portfolio VM</div>
        <nav className="hstack" aria-label="Main">
          <a className="muted" href="#projects">Projects</a>
          <a className="muted" href="#about">About</a>
          <a className="muted" href="#contact">Contact</a>
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}

/**
 * Displays side navigation dots that indicate the current scene.
 * Allows users to jump to a specific scene on click.
 */
function SceneDots() {
  const [active, setActive] = React.useState(1);

  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-scene]'));
    if (!sections.length) return;

    // This observer determines which scene is most visible in the viewport center.
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(e => e.isIntersecting);
        if (visibleEntry) {
          setActive(Number(visibleEntry.target.getAttribute('data-scene') || 1));
        }
      },
      // The rootMargin is configured to create a "trigger zone" in the middle of the viewport.
      { threshold: 0.5, rootMargin: '-50% 0px -50% 0px' }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const goToScene = (sceneNumber) => {
    const el = document.querySelector(`[data-scene="${sceneNumber}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="scene-dots" aria-label="Scene navigation">
      {Array.from({ length: SCENE_COUNT }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          className="scene-dot"
          aria-current={active === n}
          onClick={() => goToScene(n)}
          aria-label={`Go to scene ${n}`}
        />
      ))}
    </div>
  );
}

/**
 * A simple fade-in component that uses IntersectionObserver to trigger visibility once.
 */
function Fade({ children }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target); // Stop observing after animation triggers.
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="fade">{children}</div>;
}

/**
 * An interactive terminal component with command handling, history, and personalized welcome.
 */
function Terminal() {
    // State for the terminal's output lines
  const [lines, setLines] = React.useState([
    { type: 'out', text: 'Last login: Thursday, August 14, 2025 at 10:57 PM'},
    { type: 'out', text: 'Location detected: Thailand.'},
    { type: 'out', text: 'Welcome to Portfolio VM. Type "help" for a list of commands.'}
  ]);
  // State for the current input value
  const [value, setValue] = React.useState('');
  // Refs for command history and current index
  const history = React.useRef([]);
  const historyIndex = React.useRef(-1);
  // Ref to the output div for scrolling
  const outputRef = React.useRef(null);

  // Scroll to the bottom of the terminal output whenever new lines are added.
  React.useEffect(() => {
    if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Defines the available commands and their corresponding output.
  function getCommandOutput(cmd) {
    const handlers = {
      help: () => [
        'Available Commands:',
        '  - whoami    › Brief intro',
        '  - skills    › Tech stack summary',
        '  - projects  › Jump to projects section',
        '  - about     › Detailed background',
        '  - contact   › Show contact information',
        '  - clear     › Clear terminal output'
      ].join('\n'),
      whoami: () => 'Settawud Promyos — Software Developer. Security-minded professional transitioning from banking.',
      skills: () => 'React, Node.js, Express, MongoDB, SQL, Tailwind CSS, JavaScript (ES6+), HTML5, CSS3, Git.',
      projects: () => {
        const projectsEl = document.getElementById('projects');
        if (projectsEl) projectsEl.scrollIntoView({ behavior: 'smooth' });
        return 'Navigating to projects...';
      },
      about: () => [
        'Software Developer with a foundation in client service and compliance from the banking sector.',
        'Completed Generation Thailand\'s JSD10 bootcamp, mastering the MERN stack.',
        'Passionate about building performant, accessible, and secure web applications with a great user experience.'
      ].join('\n'),
      contact: () => [
        'email:    settawud.pr@gmail.com',
        'phone:    095-280-7070',
        'linkedin: /in/settawud-promyos',
        'github:   @Settawud'
      ].join('\n'),
      clear: () => { setLines([]); return ''; }
    };
    const handler = handlers[cmd];
    return handler ? handler() : `command not found: ${cmd}`;
  }

  // Handles key presses in the input field.
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = value.trim().toLowerCase();
      if (!cmd) return;

      history.current.push(value);
      historyIndex.current = history.current.length;
      
      const output = getCommandOutput(cmd);
      // Create a new line for the entered command
      const newLines = [...lines, { type: 'in', text: value }];
      // If the command produces output, add it as a new line
      if (output) newLines.push({ type: 'out', text: output });
      
      if (cmd === 'clear') {
        setLines([]);
      } else {
        setLines(newLines);
      }
      setValue(''); // Clear the input field
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex.current > 0) {
            historyIndex.current--;
            setValue(history.current[historyIndex.current]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current++;
            setValue(history.current[historyIndex.current]);
        } else {
            // If at the end of history, clear the input
            historyIndex.current = history.current.length;
            setValue('');
        }
    }
  };

  return (
    <div className="cli mono" aria-label="Interactive Terminal">
      <div ref={outputRef} aria-live="polite" style={{ whiteSpace: 'pre-wrap', maxHeight: 'clamp(160px, 32vh, 320px)', overflowY: 'auto' }}>
        {lines.map((line, index) => (
          <div key={index}>
            {line.type === 'in' 
                ? <><span className="prompt">&gt;</span> {line.text}</>
                : <><span className="prompt" style={{color: 'var(--term-dim)'}}>$</span> {line.text}</>}
          </div>
        ))}
      </div>
      <div className="input-line hstack">
        <span className="prompt">&gt;</span>
        <input
          aria-label="Terminal input"
          placeholder="Try 'skills' or 'contact'"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="blink" aria-hidden="true" />
      </div>
    </div>
  );
}


// --- MOTION & EFFECTS HOOKS ---

/**
 * Custom hook to manage scene transitions and background parallax effect.
 */
function useSceneWatcher() {
    React.useEffect(() => {
        const root = document.getElementById('appBg');
        const layers = Array.from(document.querySelectorAll('.bg-layer'));
        const sections = Array.from(document.querySelectorAll('[data-scene]'));
        if (!root || !layers.length || !sections.length) return;

        // Observer for scene changes
        const observer = new IntersectionObserver((entries) => {
            const visibleEntry = entries.find(e => e.isIntersecting);
            if (visibleEntry) {
                const sceneId = Number(visibleEntry.target.getAttribute('data-scene') || '1');
                root.setAttribute('data-scene', String(sceneId));
                visibleEntry.target.querySelector('[data-scene-el]')?.classList.add('scene-active');
            }
        }, { threshold: 0.5 });

        sections.forEach(s => observer.observe(s));

        // Parallax effect on mouse move
        const onMouseMove = (e) => {
            const { innerWidth: w, innerHeight: h } = window;
            const x = (e.clientX - w / 2) / w;
            const y = (e.clientY - h / 2) / h;
            layers.forEach((l, i) => {
                const depth = (i + 1) * 6;
                l.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
            });
        };
        window.addEventListener('mousemove', onMouseMove);

        // Cleanup function
        return () => {
            observer.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);
}


/**
 * Custom hook to manage advanced motion effects like scroll animations and custom cursor.
 */
function useMotionEffects() {
    React.useEffect(() => {
        // Trigger mount animations by adding a class to the body.
        document.body.classList.add('is-mounted');

        // Scroll-linked card animations
        const cards = Array.from(document.querySelectorAll('.scroll-fx'));
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const ih = window.innerHeight;
                    cards.forEach((el) => {
                        const r = el.getBoundingClientRect();
                        const center = r.top + r.height * 0.5;
                        const p = 1 - Math.min(1, Math.abs(center - ih * 0.55) / (ih * 0.85)); // 0..1 progress based on proximity to viewport center
                        const t = 1 - p; // inverted progress
                        el.style.transform = `translateY(${t * 18}px) scale(${1 - t * 0.02}) rotate(${t * 0.15}deg)`;
                        el.style.opacity = String(0.85 + p * 0.15);
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial call to set positions

        // Custom cursor logic (enabled only when body has 'cursor-enabled')
        let cleanupCursor = () => {};
        if (document.body.classList.contains('cursor-enabled')) {
          const dot = document.createElement('div');
          dot.className = 'cursor-dot';
          const ring = document.createElement('div');
          ring.className = 'cursor-ring';
          document.body.append(dot, ring);

          let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
          const lerp = (a, b, t) => a + (b - a) * t;
          const updateCursor = () => {
            ringX = lerp(ringX, mouseX, 0.2);
            ringY = lerp(ringY, mouseY, 0.2);
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(updateCursor);
          };
          requestAnimationFrame(updateCursor);

          const handleMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY; };
          const handleMouseOver = (e) => { if (e.target.closest('a, button, .btn')) document.body.classList.add('cursor-active'); };
          const handleMouseOut = (e) => { if (e.target.closest('a, button, .btn')) document.body.classList.remove('cursor-active'); };

          window.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseover', handleMouseOver);
          document.addEventListener('mouseout', handleMouseOut);
          cleanupCursor = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
            dot.remove();
            ring.remove();
          };
        }

        // Magnetic buttons & Ripple effect
        const magnets = Array.from(document.querySelectorAll('.btn.magnetic'));
        const handleMagneticMove = (e) => {
            const el = e.currentTarget;
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
        };
        const handleMagneticLeave = (e) => { e.currentTarget.style.transform = ''; };
        
        const handleRippleClick = (e) => {
            const target = e.target.closest('.ripple-wrap');
            if (!target) return;
            const r = target.getBoundingClientRect();
            const s = document.createElement('span');
            s.className = 'ripple';
            s.style.left = `${e.clientX - r.left}px`;
            s.style.top = `${e.clientY - r.top}px`;
            target.appendChild(s);
            setTimeout(() => s.remove(), 650);
        };
        document.addEventListener('click', handleRippleClick);

        // Subtle SFX on clicks (job-friendly, very soft)
        let sfxListener;
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const click = () => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'triangle';
            o.frequency.value = 520;
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.08);
          };
          const resume = () => { ctx.resume?.(); document.removeEventListener('pointerdown', resume); };
          document.addEventListener('pointerdown', resume, { once: true });
          sfxListener = (e) => { if (e.target.closest('a,button,.btn')) click(); };
          document.addEventListener('click', sfxListener);
        } catch {}

        magnets.forEach(el => {
            el.classList.add('ripple-wrap');
            el.addEventListener('mousemove', handleMagneticMove);
            el.addEventListener('mouseleave', handleMagneticLeave);
        });

        // Cleanup function for all event listeners and created elements
        return () => {
            window.removeEventListener('scroll', onScroll);
            cleanupCursor();
            document.removeEventListener('click', handleRippleClick);
            if (sfxListener) document.removeEventListener('click', sfxListener);
            magnets.forEach(el => {
                el.removeEventListener('mousemove', handleMagneticMove);
                el.removeEventListener('mouseleave', handleMagneticLeave);
            });
            dot.remove();
            ring.remove();
        };
    }, []);
}


/**
 * Manages theme switching and persistence in localStorage.
 */
function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = React.useState('midnight');

  // On mount, load the saved theme from localStorage or use the default.
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'midnight';
    applyTheme(savedTheme);
  }, []);

  // Applies a new theme and saves it.
  const applyTheme = (theme) => {
    if (THEMES.includes(theme)) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      setCurrentTheme(theme);
    }
  };

  return (
    <div className="hstack" style={{ gap: 6 }}>
      {THEMES.map(name => (
        <button
          key={name}
          className="btn"
          onClick={() => applyTheme(name)}
          style={{ padding: '6px 10px', fontSize: 12, opacity: currentTheme === name ? 1 : 0.6 }}
          aria-pressed={currentTheme === name}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

// --- MAIN APPLICATION COMPONENT ---
export default function PortfolioApp() {
  // Activate the custom hooks that manage all motion and scene effects.
  useSceneWatcher();
  useMotionEffects();

  return (
    <div style={{ minHeight: '100vh', color: 'var(--text)', background: 'var(--bg)' }}>
      {/* All CSS is inlined within this component for portability. 
        This includes theme variables, base styles, component styles, and motion/animation effects.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root{
          --bg:#0b1024; --panel:#0e1533; --text:#eaf2ff; --muted:#bcd3ff;
          --line:rgba(160,195,255,.18); --chip:rgba(160,195,255,.08);
          --ok:#60a5fa; --acc:#22d3ee; --warn:#f59e0b; --shadow:0 18px 50px rgba(0,0,0,.5);
          --term:#7dd3fc; --term-dim:#0a2547; --term-glow:#93c5fd;
          --a1:#60a5fa; --a2:#22d3ee; --a3:#a78bfa;
        }
        html[data-theme="midnight"]{ --bg:#0b1024; --panel:#0e1533; --text:#eaf2ff; --muted:#bcd3ff; --line:rgba(160,195,255,.18); --chip:rgba(160,195,255,.08); --ok:#60a5fa; --acc:#22d3ee; --warn:#f59e0b; --term:#7dd3fc; --term-dim:#0a2547; --term-glow:#93c5fd; --a1:#60a5fa; --a2:#22d3ee; --a3:#a78bfa; }
        html[data-theme="coral"]{ --bg:#1a0e0f; --panel:#220f12; --text:#fff1f1; --muted:#ffd2cc; --line:rgba(255,180,170,.2); --chip:rgba(255,180,170,.08); --ok:#fb7185; --acc:#f59e0b; --warn:#f43f5e; --term:#fb7185; --term-dim:#40191c; --term-glow:#fecdd3; --a1:#fb7185; --a2:#f59e0b; --a3:#f0abfc; }
        html[data-theme="sage"]{ --bg:#0d1a14; --panel:#10211a; --text:#eefbf5; --muted:#c9f2e3; --line:rgba(180,255,220,.18); --chip:rgba(180,255,220,.08); --ok:#34d399; --acc:#22d3ee; --warn:#eab308; --term:#34d399; --term-dim:#123828; --term-glow:#a7f3d0; --a1:#34d399; --a2:#22d3ee; --a3:#86efac; }
        html[data-theme="royal"]{ --bg:#120c1e; --panel:#1a1230; --text:#f4f0ff; --muted:#d9ccff; --line:rgba(200,180,255,.2); --chip:rgba(200,180,255,.08); --ok:#a78bfa; --acc:#22d3ee; --warn:#fb7185; --term:#c4b5fd; --term-dim:#281f4a; --term-glow:#ddd6fe; --a1:#a78bfa; --a2:#22d3ee; --a3:#f472b6; }
        html[data-theme="mono"]{ --bg:#0b0b0b; --panel:#121212; --text:#f3f3f3; --muted:#cfcfcf; --line:rgba(255,255,255,.12); --chip:rgba(255,255,255,.06); --ok:#e5e5e5; --acc:#d4d4d4; --warn:#a3a3a3; --term:#e5e5e5; --term-dim:#2a2a2a; --term-glow:#fafafa; --a1:#d4d4d4; --a2:#a3a3a3; --a3:#737373; }
        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;}
        .app-bg{position:relative; overflow:hidden; min-height:100vh; transition: background-color .8s ease;}
        .bg-layer{position:absolute; inset:-20vh -20vw; pointer-events:none; z-index:0; opacity:.35; filter:blur(6px); mix-blend-mode:screen; transition: transform .1s linear}
        .bg-1{background:radial-gradient(60% 60% at 10% 10%, var(--a1) 0%, transparent 60%), radial-gradient(50% 50% at 90% 20%, var(--a2) 0%, transparent 60%), radial-gradient(40% 40% at 60% 90%, var(--a3) 0%, transparent 60%); animation:floatXY 28s ease-in-out infinite}
        .bg-2{background:conic-gradient(from 0deg at 30% 70%, color-mix(in oklab, var(--a2) 35%, transparent), transparent 40%), conic-gradient(from 180deg at 80% 30%, color-mix(in oklab, var(--a1) 35%, transparent), transparent 45%); animation:pan 40s linear infinite}
        .grain{position:absolute; inset:0; pointer-events:none; opacity:.06; background-image:${NOISE_URL}; mix-blend-mode:overlay}
        @keyframes pan{to{transform:translate3d(-15%, -10%, 0) rotate(1deg)}}
        @keyframes floatXY{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(3%, -2%, 0)}}
        a{color:inherit;text-decoration:none}
        img{max-width:100%;display:block}
        .thumb>img{width:100%;height:100%;object-fit:cover}
        :target{scroll-margin-top:72px}
        .container{width:min(1120px, 100% - 2rem);margin:0 auto;position:relative; z-index:1}
        .site-header{position:sticky;top:0;z-index:40;height:64px;background:rgba(0,0,0,.35);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);display:flex;align-items:center}
        .site-header nav{display:flex;flex-wrap:wrap;gap:clamp(8px,2vw,16px)}
        .brand{font-weight:600;letter-spacing:.2px}
        .hstack{display:flex;align-items:center;gap:12px}
        .space-between{justify-content:space-between}
        .btn{border:1px solid var(--line);padding:10px 14px;border-radius:12px;display:inline-block;background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));cursor:pointer;transition:transform .18s ease, box-shadow .18s ease; will-change:transform}
        .btn:hover{box-shadow:0 10px 28px rgba(var(--acc),.22);transform:translateY(-2px)}
        .muted{color:var(--muted); transition: color .25s ease} a.muted:hover{color: var(--text)}
        .chip{border:1px solid var(--line);background:var(--chip);padding:6px 10px;border-radius:12px;font-size:13px}
        .split{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(16px,3vw,24px);align-items:start}
        .thumb{background:var(--chip);border-radius:16px;aspect-ratio:16/10;overflow:hidden;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow);transform:perspective(1200px) rotateX(0) rotateY(0);transition:transform .4s ease}
        .thumb:hover{transform:perspective(1200px) rotateX(2deg) rotateY(-3deg) translateY(-1px)}
        .card{border:1px solid var(--line);border-radius:16px;padding:24px;background:linear-gradient(180deg, var(--panel), color-mix(in oklab, var(--panel) 90%, #000));box-shadow:var(--shadow);transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s cubic-bezier(.22,1,.36,1)}
        .card:hover{transform:translateY(-2px); box-shadow:0 20px 60px rgba(0,0,0,.6)}
        .hero{padding:72px 0 28px}
        h1{font-size:clamp(28px,4vw,46px);margin:8px 0;line-height:1.15}
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
        .scene{min-height:100vh; display:flex; align-items:center; scroll-snap-align: start; scroll-margin-top:64px;}
        .scene-enter{opacity:0; transform:translateY(24px) scale(.98)}
        .scene-enter.scene-active{opacity:1; transform:none; transition:opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)}
        .divider{height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent); margin:48px 0}
        .assemble{opacity:0; transform:translateY(18px) scale(.98)}
        body.is-mounted .assemble{animation:assemble .7s cubic-bezier(.22,1,.36,1) forwards; animation-delay:var(--d,0s)}
        @keyframes assemble{to{opacity:1; transform:none}}
        .scroll-fx{will-change:transform,opacity}
        .app-bg{transition:filter .8s ease}
        .app-bg[data-scene="1"]{filter:hue-rotate(0deg) saturate(1.08) brightness(1.02)}
        .app-bg[data-scene="2"]{filter:hue-rotate(20deg) saturate(1.12) brightness(1.04)}
        .app-bg[data-scene="3"]{filter:hue-rotate(300deg) saturate(1.08) brightness(1.03)}
        @media (pointer:fine){
          body.cursor-enabled{cursor:none}
          .cursor-dot,.cursor-ring{position:fixed;top:-20px;left:-20px;pointer-events:none;z-index:9999}
          .cursor-dot{width:6px;height:6px;border-radius:50%;background:var(--acc);box-shadow:0 0 10px var(--acc);transition:transform .1s ease-out;}
          .cursor-ring{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.5);transition:transform .2s ease-out,border-color .2s ease,width .2s ease,height .2s ease,opacity .2s ease;opacity:.85}
          body.cursor-active .cursor-ring{transform-origin:center; width:56px;height:56px;border-color:var(--ok)}
        }
        main{scroll-snap-type: y mandatory;}
        .scene-dots{position:fixed; right:18px; top:50%; transform:translateY(-50%); z-index:60; display:flex; flex-direction:column; gap:10px}
        .scene-dot{width:10px;height:10px;border-radius:50%; background:rgba(255,255,255,.35); border:1px solid rgba(255,255,255,.5); transition:all .25s ease; cursor:pointer;}
        .scene-dot[aria-current="true"]{width:18px;height:18px;background:var(--ok); box-shadow:0 0 0 4px color-mix(in srgb, var(--ok) 25%, transparent)}
        .btn.magnetic{will-change:transform}
        .ripple-wrap{position:relative; overflow:hidden; transform: translateZ(0);}
        .ripple{position:absolute; border-radius:50%; transform:translate(-50%,-50%); pointer-events:none; background:rgba(255,255,255,.35); width:8px;height:8px; opacity:.6; animation:ripple .6s ease-out forwards}
        @keyframes ripple{to{opacity:0; width:180px; height:180px}}
        @media (prefers-reduced-motion: reduce){ *{animation:none!important; transition:none!important; scroll-behavior:auto!important} }
      `}} />

      <div className="app-bg" id="appBg">
        <div className="bg-layer bg-1" aria-hidden="true"></div>
        <div className="bg-layer bg-2" aria-hidden="true"></div>
        <div className="grain" aria-hidden="true"></div>
        
        <SceneDots />
        <SceneHeader />

        <main>
          {/* SCENE 1: Hero */}
          <section className="scene" data-scene="1">
            <div className="container hero split scene-enter" data-scene-el>
              <Fade>
                <div className="thumb">
                   <img src="/profile.jpg" alt="My Profile" loading="lazy"/>
                  
                </div>
              </Fade>
              <Fade><Terminal /></Fade>
            </div>
          </section>

          <div className="divider" />

          {/* SCENE 2: Projects */}
          <section className="scene" data-scene="2">
            <div className="container scene-enter" data-scene-el>
              <Fade><h2 id="projects">Selected Projects</h2></Fade>
              
              <div className="split">
                  <Fade>
                    <article className="card scroll-fx">
                      <div className="thumb"><img src="/Ginraidee.png" alt="GinRaiDee project placeholder" loading="lazy" /></div>
                      <h3 style={{marginTop: 16}}>GinRaiDee — Random Food Suggester</h3>
                      <p className="muted">Full-stack MERN application from concept to deployment. Features a CRUD REST API with MongoDB and a responsive, interactive UI built with React and Tailwind CSS.</p>
                      <div className="hstack" style={{ marginTop: 12 }}>
                        <a className="btn magnetic" href="#_">Live</a>
                        <a className="btn magnetic" href="#_">Repo</a>
                      </div>
                    </article>
                  </Fade>
                  <Fade>
                    <article className="card scroll-fx">
                      <div className="thumb">
                        <img src="/LivinLab.png" alt="LivinLab project placeholder" loading="lazy" />
                      </div>
                      <h3 style={{marginTop: 16}}>Livin’Lab — E-commerce Furniture (Team)</h3>
                      <p className="muted">Contributed to an Agile team project, developing secure authentication flows (register, login, password reset) and implementing product search and filtering with React Hooks.</p>
                      <div className="hstack" style={{ marginTop: 12 }}>
                        <a className="btn magnetic" href="#_">Live</a>
                        <a className="btn magnetic" href="#_">Repo</a>
                      </div>
                    </article>
                  </Fade>
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* SCENE 3: About & Contact */}
          <section className="scene" data-scene="3">
            <div className="container split scene-enter" data-scene-el>
              <Fade>
                <div className="card">
                  <h2 id="about">About Me</h2>
                  <p className="muted" style={{lineHeight: 1.6, marginTop:10}}>
                    I am a software developer with a background in banking, where I honed skills in client analysis, risk management, and compliance. Now, I apply that same attention to detail and problem-solving mindset to building secure, efficient, and user-friendly web applications. My focus is on the MERN stack, crafting performant back-ends and delightful front-end experiences.
                  </p>
                </div>
              </Fade>
              <Fade>
                <div className="card">
                    <h2 id="contact">Get In Touch</h2>
                    <p className="muted" style={{lineHeight: 1.6, marginTop:10}}>
                        I'm currently seeking Junior Software Developer opportunities and am open to freelance collaborations. Let's build something great together.
                    </p>
                    <div className="hstack" style={{marginTop: 16, flexWrap: 'wrap'}}>
                        <a className="btn magnetic" href="mailto:settawud.pr@gmail.com">Email Me</a>
                        <a className="btn magnetic" href="https://www.linkedin.com/in/settawud-promyos" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a className="btn magnetic" href="https://github.com/Settawud" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </div>
              </Fade>
            </div>
          </section>
        </main>

        <footer style={{borderTop:'1px solid var(--line)', marginTop:40, padding: '20px 0'}}>
            <div className="container muted" style={{textAlign: 'center', fontSize: 14}}>
                © {new Date().getFullYear()} Settawud Promyos. Built with React & lots of ☕.
            </div>
        </footer>

      </div>
    </div>
  );
}
