import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import Splash from './components/SplashScreen';
// VM view is disconnected; routes switch between OS and Minimal only
import Desktop from './components/os/Desktop';
import PortfolioMinimal from './pages/portfolioMinimal.jsx';
// import React from 'react';
// SplashScreen moved to ./components/SplashScreen for clarity

//================================================================
// Main App Component (Controls the view)
//================================================================
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  // optional alert (currently unused)
  const loadSoundPlayed = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isOsView = location.pathname === '/os';
  const isMinimal = location.pathname === '/minimal';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); // Duration of splash screen
    return () => clearTimeout(timer);
  }, []);

  // Default route to /os (show OS first)
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/os', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Initialize global SFX and play a subtle load chime once allowed
  useEffect(() => {
    if (window.__sfx?.__inited) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const click = () => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 660;
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.09);
      };
      const load = () => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(440, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.18);
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.22);
      };
      window.__sfx = { click, load, __inited: true };
      const resume = () => { ctx.resume?.(); document.removeEventListener('pointerdown', resume); };
      document.addEventListener('pointerdown', resume, { once: true });
    } catch {}
  }, []);

  // Try to play load sound when splash completes
  useEffect(() => {
    if (!isLoading && !loadSoundPlayed.current) {
      if (!window.__sfx?.__playedLoad) {
        loadSoundPlayed.current = true;
        try { window.__sfx?.load?.(); window.__sfx.__playedLoad = true; } catch {}
      }
    }
  }, [isLoading]);

  const showAlert = () => {};

  return (
    <div className="portfolio-container">
      <style>{`
        :root {
            --os-bg: #0f172a;
            --os-win-bg: rgba(15, 23, 42, 0.85);
            --os-text: #e5e7eb;
            --os-border: #334155;
            --os-title-bar: rgba(2, 6, 23, 0.9);
        }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        /* Fancy Switch */
        .fancy-switch { position: fixed; top: 28px; right: 18px; z-index: 10000; display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; color: #0b1024; font-size: 14px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #a7f3d0, #93c5fd, #fbcfe8); box-shadow: 0 10px 30px rgba(0,0,0,.25); border: 1px solid rgba(255,255,255,.35); backdrop-filter: blur(10px); transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; }
        .fancy-switch .icon{ font-size: 18px; }
        .fancy-switch:hover{ transform: translateY(-2px); box-shadow: 0 14px 40px rgba(0,0,0,.35); }
        .fancy-switch:active{ transform: translateY(0); }
        .fancy-switch .shine{ position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,.35), transparent 60%); pointer-events: none; mix-blend-mode: screen; animation: glow 3s ease-in-out infinite; }
        @keyframes glow { 0%,100%{ opacity:.6 } 50%{ opacity: .3 } }
        .custom-alert { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 12px 24px; background-color: #2d3748; color: #e2e8f0; border: 1px solid #4a5568; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); z-index: 10001; opacity: 0; transition: opacity 0.3s ease, top 0.3s ease; animation: fadeInAndOut 3s ease-in-out forwards; }
        @keyframes fadeInAndOut { 0% { opacity: 0; top: 0; } 15% { opacity: 1; top: 20px; } 85% { opacity: 1; top: 20px; } 100% { opacity: 0; top: 0; } }
      `}</style>

      <AnimatePresence>
        {isLoading ? (
          <motion.div key="splash">
            <Splash />
          </motion.div>
        ) : (
          <motion.div
            key="main-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
          >
            <FancySwitch
              label={isMinimal ? 'Back to OS' : 'Explore Minimal'}
              emoji={isMinimal ? '↩️' : '✨'}
              onClick={() => {
                try { window.__sfx?.click(); } catch {}
                navigate(isMinimal ? '/os' : '/minimal');
              }}
            />
            {isMinimal ? <PortfolioMinimal /> : <Desktop />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

//================================================================
// View Switcher Button
//================================================================
function FancySwitch({ label, emoji, onClick }) {
  return (
    <button onClick={onClick} className="fancy-switch" title={label}>
      <span className="icon" aria-hidden>{emoji}</span>
      <span>{label}</span>
      <span className="shine" aria-hidden />
    </button>
  );
}

//================================================================
// COMPONENT 1: Portfolio OS (Desktop Interface)
//================================================================
const PortfolioOS = () => {
  const animationFrameId = useRef(null);

  useEffect(() => {
    const listeners = [];
    let isMounted = true;

    const portfolioData = {
      summary:
        "A highly motivated and detail-oriented software developer transitioning from a successful background in banking, where I developed strong client-facing, analytical, and compliance skills. With experience advising diverse clients, processing high-volume transactions with accuracy, and ensuring strict adherence to regulations such as AML and PDPA, I bring a unique blend of precision, problem-solving, and teamwork to software development. As a recent completer of the intensive Full Stack Development Bootcamp (JSD10), I am proficient in modern technologies including React, Node.js, JavaScript, SQL, and MongoDB. I am now seeking a Junior Software Developer role where I can leverage both my technical expertise and professional experience to contribute to a dynamic organization's growth.",
      profilePic: "/profile.jpg",
      skills: {
        technical: [
          { skill: "Frontend", value: "HTML, CSS, Javascript, React.js" },
          { skill: "Backend", value: "Node.js, Express.js" },
          { skill: "Database", value: "Python, Mongodb, Mysql, Postgresql" },
          {
            skill: "Tools & Platforms",
            value:
              "Git, VS Code, Jupyter Notebook, SQL Workbench, Docker (Learning), Google Workspace, Excel",
          },
        ],
        soft: [
          "Adaptability",
          "Growth Mindset",
          "Accountability",
          "Time Management",
          "Problem-solving",
          "Teamwork & Collaboration",
          "Attention to Detail",
          "Communication",
        ],
        languages: ["Thai (Native)", "English - Intermediate (B1 CEFR)"],
      },
      projects: [
        {
          id: 1,
          name: "E-commerce Furniture Platform (Livin' Lab)",
          tech: ["React", "Node.js", "Express", "MongoDB", "RESTful API"],
          description: [
            "Engineered a complete user authentication system, implementing features for registration, login, and password recovery to secure user data.",
            "Developed a dynamic product search and filtering system using React Hooks, enabling a responsive and intuitive user shopping experience.",
            "Collaborated effectively within an Agile team, participating in and facilitating Scrum ceremonies to ensure timely delivery of project milestones.",
            "Constructed RESTful API endpoints with Node.js and Express for seamless communication between the client-side and server-side.",
          ],
          imageUrl: "/LivinLab.png",
          contributors: ["Settawud P.", "Team Member 1", "Team Member 2"],
          repoUrl: "#",
          demoUrl: "#",
        },
        {
          id: 2,
          name: "Food Randomizer App (Gin-Rai-Dee)",
          tech: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
          description: [
            "Architected and deployed a full-stack MERN application from concept to completion, designed to help users discover new meal ideas.",
            "Designed and implemented a comprehensive RESTful API to handle all CRUD (Create, Read, Update, Delete) operations for the food menu data stored in MongoDB.",
            "Built a responsive, mobile-first user interface with React and Tailwind CSS, incorporating interactive elements to create an engaging user experience.",
          ],
          imageUrl: "/Ginraidee.png",
          repoUrl: "#",
          demoUrl: "#",
        },
      ],
      experience: [
        {
          company: "TMBThanachart Bank (TTB) - Bangkok, Thailand",
          role: "Bank Teller",
          period: "Oct 2023 - May 2024",
          details: [
            "Advised a diverse client base on complex financial products, effectively resolving inquiries to help clients meet their goals and ensure high levels of satisfaction.",
            "Processed a high volume of daily financial transactions, including deposits, withdrawals, and transfers, with exceptional accuracy and efficiency.",
            "Managed and balanced a daily cash drawer while ensuring strict adherence to all banking regulations and legal policies, including AML and PDPA.",
            "Collaborated effectively with team members to achieve collective sales and service targets, ensuring smooth daily branch operations.",
          ],
        },
      ],
      education: [
        {
          degree: "Certificate, Junior Software Developer (JSD10)",
          institution: "Generation Thailand x GenKX",
          period: "Jun 2025 - Sep 2025",
        },
        {
          degree: "Bachelor of Engineering (B.Eng.), Industrial Engineering",
          institution: "Kasetsart University, Bangkok, Thailand",
          period: "Jul 2019 - April 2023",
        },
      ],
      contact: {
        email: "settawud.pr@gmail.com",
        linkedin: "https://linkedin.com/in/settawud-promyos",
        github: "https://github.com/Settawud",
        phone: "095-280-7070",
        location: "Yantakhao, Trang",
      },
    };

    // background handled by <PlexusBackground />

    // --- OS UI LOGIC ---
    let zIndexCounter = 10;
    function makeElementDraggable(elmnt) {
      let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
      const header = elmnt.querySelector(".title-bar");
      if (!header) return () => {};

      const dragMouseDown = (e) => {
        e.preventDefault();
        if (e.target.closest(".title-bar-buttons")) return;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.zIndex = ++zIndexCounter;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      };
      const elementDrag = (e) => {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // --- 🔽 เพิ่มโค้ดส่วนจำกัดขอบเขตเข้ามา 🔽 ---

    const parentBounds = elmnt.parentElement.getBoundingClientRect();
    const titleBarHeight = header.offsetHeight; // ความสูงของ Title Bar

    // คำนวณตำแหน่งใหม่
    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    // จำกัดขอบเขตบน-ล่าง
    // ไม่ให้ Title bar หลุดขอบบน และไม่ให้หลุดขอบล่างจนลากไม่ได้
    newTop = Math.max(0, newTop);
    newTop = Math.min(parentBounds.height - titleBarHeight, newTop);

    // จำกัดขอบเขตซ้าย-ขวา
    // ไม่ให้หน้าต่างหลุดไปทางซ้ายทั้งหมด หรือขวาจนสุดขอบ
    newLeft = Math.max(-elmnt.offsetWidth + titleBarHeight * 2, newLeft);
    newLeft = Math.min(parentBounds.width - titleBarHeight * 2, newLeft);

    // กำหนดตำแหน่งใหม่ที่ถูกจำกัดขอบเขตแล้ว
    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
};
      const closeDragElement = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      header.addEventListener("mousedown", dragMouseDown);
      return () => {
        header.removeEventListener("mousedown", dragMouseDown);
        closeDragElement();
      };
    }

    function toggleMaximize(windowEl) {
      const dock = document.getElementById('dock');
      const reserve = dock ? dock.offsetWidth + 24 : 120; // space for dock + margin
      if (windowEl.classList.contains('maximized')) {
        windowEl.classList.remove('maximized');
        windowEl.style.right = windowEl.dataset.oldRight || '';
        windowEl.style.bottom = windowEl.dataset.oldBottom || '';
        windowEl.style.width = windowEl.dataset.oldWidth;
        windowEl.style.height = windowEl.dataset.oldHeight;
        windowEl.style.top = windowEl.dataset.oldTop;
        windowEl.style.left = windowEl.dataset.oldLeft;
      } else {
        // Save precise computed values before maximizing
        const cs = getComputedStyle(windowEl);
        windowEl.dataset.oldWidth = cs.width;
        windowEl.dataset.oldHeight = cs.height;
        windowEl.dataset.oldTop = cs.top;
        windowEl.dataset.oldLeft = cs.left;
        windowEl.dataset.oldRight = cs.right;
        windowEl.dataset.oldBottom = cs.bottom;

        windowEl.classList.add('maximized');
        windowEl.style.top = '0';
        windowEl.style.left = '0';
        windowEl.style.right = `${reserve}px`;
        windowEl.style.bottom = '0';
        windowEl.style.width = 'auto';
        windowEl.style.height = 'auto';
      }
    }

    function initializeDock() {
      const dock = document.getElementById("dock");
      if (!dock) return;
      const items = dock.querySelectorAll(".dock-item");
      const handleMouseMove = (e) => {
        const dockRect = dock.getBoundingClientRect();
        items.forEach((item) => {
          const itemRect = item.getBoundingClientRect();
          const itemCenterY = itemRect.top + itemRect.height / 2;
          const distance = Math.abs(e.clientY - itemCenterY);
          const scale = Math.max(
            1,
            (1.5 - distance / (dockRect.height / 2)) * 1.2
          );
          const icon = item.querySelector(".dock-item-icon");
          if (icon) icon.style.transform = `scale(${scale})`;
        });
      };
      const handleMouseLeave = () =>
        items.forEach((item) => {
          const icon = item.querySelector(".dock-item-icon");
          if (icon) icon.style.transform = "scale(1)";
        });
      dock.addEventListener("mousemove", handleMouseMove);
      dock.addEventListener("mouseleave", handleMouseLeave);
      listeners.push({
        target: dock,
        event: "mousemove",
        handler: handleMouseMove,
      });
      listeners.push({
        target: dock,
        event: "mouseleave",
        handler: handleMouseLeave,
      });
    }

    function initializeDesktop() {
      const cleanups = [];
      document
        .querySelectorAll(".window")
        .forEach((el) => cleanups.push(makeElementDraggable(el)));

      const desktopEl = document.getElementById('desktop');
      const setDockActive = (winId, active) => {
        const item = document.querySelector(`.dock-item[data-window="${winId}"]`);
        if (item) item.setAttribute('data-active', active ? 'true' : 'false');
      };

      const clampWithinDesktop = (el) => {
        if (!desktopEl) return;
        const parent = desktopEl.getBoundingClientRect();
        let left = parseFloat(getComputedStyle(el).left) || 0;
        let top = parseFloat(getComputedStyle(el).top) || 0;
        // clamp position
        left = Math.min(Math.max(left, 0), parent.width - el.offsetWidth);
        top = Math.min(Math.max(top, 0), parent.height - el.offsetHeight);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;
        // clamp size
        const maxW = parent.width - left;
        const maxH = parent.height - top;
        const r = el.getBoundingClientRect();
        if (r.width > maxW) el.style.width = `${maxW}px`;
        if (r.height > maxH) el.style.height = `${maxH}px`;
      };

      // Observe resizes to keep windows within the desktop bounds
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) clampWithinDesktop(entry.target);
      });
      document.querySelectorAll('.window').forEach(w => ro.observe(w));
      cleanups.push(() => ro.disconnect());

      const handleIconClick = (e) => {
        try { window.__sfx?.click(); } catch {}
        const id = e.currentTarget.dataset.window;
        const windowEl = document.getElementById(id);
        if (!windowEl) return;
        if (windowEl.classList.contains('hidden')) {
          windowEl.classList.remove('hidden');
          windowEl.style.zIndex = ++zIndexCounter;
          setDockActive(id, true);
        } else {
          windowEl.classList.add('hidden');
          setDockActive(id, false);
        }
      };
      document.querySelectorAll(".dock-item").forEach((icon) => {
        icon.addEventListener("click", handleIconClick);
        listeners.push({
          target: icon,
          event: "click",
          handler: handleIconClick,
        });
      });

      const handleWindowButtonClick = (e) => {
        e.stopPropagation();
        try { window.__sfx?.click(); } catch {}
        const windowEl = document.getElementById(e.target.dataset.window);
        if (!windowEl) return;
        if (
          e.target.classList.contains("close-btn") ||
          e.target.classList.contains("min-btn")
        ) {
          windowEl.classList.add("hidden");
          setDockActive(e.target.dataset.window, false);
        }
        else if (e.target.classList.contains("max-btn"))
          toggleMaximize(windowEl);
      };
      document.querySelectorAll(".title-bar-buttons").forEach((bar) => {
        bar.addEventListener("click", handleWindowButtonClick);
        listeners.push({
          target: bar,
          event: "click",
          handler: handleWindowButtonClick,
        });
      });

      // Double-click title bar to toggle maximize/restore
      document.querySelectorAll('.window .title-bar').forEach(bar => {
        const onDb = (ev) => {
          const win = ev.currentTarget.closest('.window');
          if (win) toggleMaximize(win);
        };
        bar.addEventListener('dblclick', onDb);
        cleanups.push(() => bar.removeEventListener('dblclick', onDb));
      });

      // Mark initial active windows
      document.querySelectorAll('.window').forEach(w => setDockActive(w.id, !w.classList.contains('hidden')));

      renderGraphicalContent();
      initializeDock();
      return () => cleanups.forEach((cleanup) => cleanup());
    }

  function renderGraphicalContent() {
    const aboutContent = document.querySelector('#about-window .content');
    if(aboutContent) {
        const { skills, experience, education, contact } = portfolioData;

        // --- 🔽 ใช้ innerHTML ชุดใหม่นี้ทั้งหมด 🔽 ---
        aboutContent.innerHTML = `
            <div class="profile-header">
                <img src="${portfolioData.profilePic}" alt="Settawud Promyos Profile" class="profile-pic"/>
                <div class="profile-info">
                    <h1 class="profile-name">Settawud Promyos</h1>
                    <p class="profile-title">Aspiring Software Developer</p>
                </div>
            </div>

            <p class="summary-text">${portfolioData.summary}</p>

            <h2>Skills</h2>
            <div class="skills-section">
                <h3>Technical Skills</h3>
                ${skills.technical.map(s => `
                    <div class="tech-skill">
                        <strong class="skill-label">${s.skill}:</strong> 
                        <span>${s.value}</span>
                    </div>
                `).join('')}
                
                <h3>Soft Skills & Languages</h3>
                <p>${skills.soft.join(', ')}</p>
                <p>${skills.languages.join(', ')}</p>
            </div>

            <h2>Work Experience</h2>
            ${experience.map(e => `
                <div class="mb-4">
                    <h3 class="text-lg">${e.role} <span class="text-gray-400">@ ${e.company}</span></h3>
                    <p class="text-sm text-gray-500">${e.period}</p>
                    <ul class="list-disc list-inside text-gray-300 text-sm mt-1">${e.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            `).join('')}

            <h2>Education</h2>
            ${education.map(e => `
                <div class="mb-4">
                    <h3 class="text-lg">${e.degree}</h3>
                    <p class="text-gray-400">${e.institution}</p>
                    <p class="text-sm text-gray-500">${e.period}</p>
                </div>
            `).join('')}

            <h2>Contact</h2>
            <div class="contact-grid">
                <strong>Email:</strong> 
                <a href="mailto:${contact.email}" class="text-sky-300 hover:underline">${contact.email}</a>
                
                <strong>LinkedIn:</strong> 
                <a href="${contact.linkedin}" target="_blank" class="text-sky-300 hover:underline">linkedin.com/in/settawud-promyos</a>
                
                <strong>GitHub:</strong> 
                <a href="${contact.github}" target="_blank" class="text-sky-300 hover:underline">github.com/Settawud</a>
                
                <strong>Phone:</strong> 
                <span>${contact.phone}</span>
            </div>
        `;
      }
      const projectsContent = document.querySelector(
        "#projects-window .content"
      );
      if (projectsContent) {
        projectsContent.innerHTML = portfolioData.projects
          .map(
            (p) =>
              `<div class="project-card"><img src="${p.imageUrl}" alt="${
                p.name
              } project screenshot"/><div class="flex-1"><h2 class="text-xl font-bold text-white">${
                p.name
              }</h2><p class="text-sm text-sky-300 mb-2">${p.tech.join(
                ", "
              )}</p><ul class="list-disc list-inside text-gray-400 text-sm mb-3">${p.description
                .map((d) => `<li>${d}</li>`)
                .join("")}</ul><div class="mt-4"><a href="${
                p.repoUrl
              }" target="_blank" rel="noopener noreferrer" class="mr-4 text-white hover:text-sky-300">[ GitHub ]</a><a href="${
                p.demoUrl
              }" target="_blank" rel="noopener noreferrer" class="text-white hover:text-sky-300">[ Demo ]</a></div></div></div>`
          )
          .join("");
      }
    }

    function initializeTerminal() {
      const terminalWindow = document.getElementById("terminal-window");
      if (!terminalWindow) return;
      const outputEl = terminalWindow.querySelector("#output");
      const inputEl = terminalWindow.querySelector("#input");
      const bodyEl = terminalWindow.querySelector("#terminal-body");

      // Lightweight SFX setup (initialized on first user gesture)
      if (!window.__sfx) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const click = () => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 660;
            g.gain.setValueAtTime(0.12, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            o.connect(g); g.connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.09);
          };
          window.__sfx = { click };
          const resume = () => { ctx.resume?.(); document.removeEventListener('pointerdown', resume); };
          document.addEventListener('pointerdown', resume, { once: true });
        } catch {}
      }

      const handleTerminalClick = (e) => {
        if (e.target !== inputEl) inputEl.focus();
      };
      terminalWindow.addEventListener("click", handleTerminalClick);
      listeners.push({
        target: terminalWindow,
        event: "click",
        handler: handleTerminalClick,
      });

      const bannerArt = `<pre class="text-sky-300">
  ____      _        _      __        __         _     _
 / ___|  __| |  ___ | | __  \\ \\      / /   ___  | | __| |
 \\___ \\ / _\` | / __|| |/ /   \\ \\ /\\ / /   / _ \\ | |/ /| |
  ___) | (_| || (__ |   <     \\ V  V /   | (_) ||   < |_|
 |____/ \\__,_| \\___||_|\\_\\     \\_/\\_/     \\___/ |_|\\_\\ (_)
</pre>`;

      const changeTheme = (args) => {
        const root = document.documentElement;
        const theme = args[0];
        if (theme === "light") {
          root.style.setProperty("--os-bg", "#e2e8f0");
          root.style.setProperty("--os-win-bg", "rgba(255, 255, 255, 0.85)");
          root.style.setProperty("--os-text", "#1a202c");
          root.style.setProperty("--os-border", "#cbd5e0");
          root.style.setProperty("--os-title-bar", "#f8fafc");
          return "Theme set to light.";
        } else if (theme === "dark") {
          root.style.setProperty("--os-bg", "#0f172a");
          root.style.setProperty("--os-win-bg", "rgba(15, 23, 42, 0.85)");
          root.style.setProperty("--os-text", "#e5e7eb");
          root.style.setProperty("--os-border", "#334155");
          root.style.setProperty("--os-title-bar", "rgba(2, 6, 23, 0.9)");
          return "Theme set to dark.";
        }
        return `Usage: theme [light|dark]`;
      };

      const fullCommands = {
        help: {
          description: "Shows this help message",
          func: () => {
            const rows = Object.keys(fullCommands)
              .map((c) => `${c.padEnd(10)} - ${fullCommands[c].description}`)
              .join("\n");
            return `<pre class="help-list">${rows}</pre>`;
          },
        },
        about: {
          description: "Summary about me",
          func: () =>
            `<div class="flex items-center mb-4"><img src="${
              portfolioData.profilePic
            }" style="max-width: 200px; height: auto; margin: auto; display: block;"/><div><div class="font-bold text-lg">${"Settawud Promyos".toUpperCase()}</div><div class="text-gray-400">ASPIRING SOFTWARE DEVELOPER</div></div></div><div class="clear-both pt-2 text-gray-300">${
              portfolioData.summary
            }</div>`,
        },
        skills: {
          description: "List my technical and soft skills",
          func: () =>
            '<div><span class="keyword">-- Technical Skills --</span></div>' +
            portfolioData.skills.technical
              .map(
                (s) =>
                  `<div><span class="variable">${s.skill.padEnd(
                    18,
                    " "
                  )}:</span><span class="string">'${s.value}'</span></div>`
              )
              .join("") +
            '<div class="mt-2"><span class="keyword">-- Soft Skills --</span></div>' +
            `<div class="text-gray-400">${portfolioData.skills.soft.join(
              ", "
            )}</div>` +
            '<div class="mt-2"><span class="keyword">-- Languages --</span></div>' +
            `<div class="text-gray-400">${portfolioData.skills.languages.join(
              ", "
            )}</div>`,
        },
        projects: {
          description: "Show my projects",
          func: () =>
            '<div><span class="keyword">-- Projects --</span></div>' +
            portfolioData.projects
              .map(
                (p) =>
                  `<div class="mt-4 p-2 border border-dashed border-gray-700 rounded flex flex-col sm:flex-row gap-4"><img src="${p.imageUrl}" style="max-width: 200px; height: auto; margin: auto; display: block;" class="object-contain border border-gray-700 rounded"/><div class="flex-1"><div><span class="variable">${
                    p.id
                  }. ${
                    p.name
                  }</span></div><div class="text-sm text-gray-500 mb-2"><span class="keyword">Tech:</span> <span class="string">'${p.tech.join(
                    ", "
                  )}'</span></div><ul class="list-disc list-inside text-gray-400 text-sm mb-2">${p.description
                    .map((d) => `<li>${d}</li>`)
                    .join("")}</ul>${
                    p.contributors
                      ? `<div class="text-sm text-gray-500"><span class="keyword">Contributors:</span> ${p.contributors.join(
                          ", "
                        )}</div>`
                      : ""
                  }<div class="text-sm mt-2"><a href="${
                    p.repoUrl
                  }" target="_blank" class="mr-4">[ GitHub Repo ]</a><a href="${
                    p.demoUrl
                  }" target="_blank">[ Live Demo ]</a></div></div></div>`
              )
              .join(""),
        },
        experience: {
          description: "My work experience",
          func: () =>
            '<div><span class="keyword">-- Work Experience --</span></div>' +
            portfolioData.experience
              .map(
                (e) =>
                  `<div class="mt-2"><div><span class="variable">${
                    e.role
                  }</span> @ ${
                    e.company
                  }</div><div class="pl-4"><div class="text-sm text-gray-500">${
                    e.period
                  }</div><ul class="list-disc list-inside text-gray-400">${e.details
                    .map((d) => `<li>${d}</li>`)
                    .join("")}</ul></div></div>`
              )
              .join(""),
        },
        education: {
          description: "My education background",
          func: () =>
            '<div><span class="keyword">-- Education --</span></div>' +
            portfolioData.education
              .map(
                (e) =>
                  `<div class="mt-2"><div><span class="variable">${e.degree}</span></div><div class="pl-4"><div>${e.institution}</div><div class="text-sm text-gray-500">${e.period}</div></div></div>`
              )
              .join(""),
        },
        contact: {
          description: "How to reach me",
          func: () =>
            `<div><span class="keyword">-- Contact Me --</span></div><div class="grid grid-cols-[auto,1fr] gap-x-4 mt-2"><span class="variable">Email:</span><a href="mailto:${portfolioData.contact.email}">${portfolioData.contact.email}</a><span class="variable">LinkedIn:</span><a href="${portfolioData.contact.linkedin}" target="_blank">${portfolioData.contact.linkedin}</a><span class="variable">GitHub:</span><a href="${portfolioData.contact.github}" target="_blank">${portfolioData.contact.github}</a><span class="variable">Phone:</span><span>${portfolioData.contact.phone}</span><span class="variable">Location:</span><span>${portfolioData.contact.location}</span></div>`,
        },
        all: {
          description: "Display all information",
          func: () =>
            Object.keys(fullCommands)
              .filter(
                (c) =>
                  ![
                    "all",
                    "clear",
                    "help",
                    "ls",
                    "whoami",
                    "date",
                    "echo",
                    "neofetch",
                    "banner",
                    "theme",
                    "sudo",
                  ].includes(c)
              )
              .map((c) => `<div class="mb-4">${fullCommands[c].func()}</div>`)
              .join(""),
        },
        ls: {
          description: "List files on the desktop",
          func: () =>
            `<div class="flex gap-4"><span class="text-sky-300">My_CV.app</span><span class="text-sky-300">Projects.app</span><span class="text-sky-300">Terminal.app</span></div>`,
        },
        whoami: {
          description: "Prints the current user",
          func: () => `<span class="text-gray-300">guest</span>`,
        },
        date: {
          description: "Prints the current date and time in Thailand",
          func: () =>
            `<span class="text-gray-300">${new Date().toLocaleString("en-GB", {
              timeZone: "Asia/Bangkok",
              hour12: false,
            })} (ICT)</span>`,
        },
        echo: {
          description: "Prints the given text",
          func: (args) =>
            `<span class="text-gray-300">${args.join(" ")}</span>`,
        },
        neofetch: {
          description: "Shows system info",
          func: () => `<div><pre class="float-left mr-4 text-sky-300">  _______
 /  12   \\
/  9   3  \\
|    o    |
|         |
 \\   6   /
  \\_______/
</pre><div class="overflow-hidden"><div><span class="variable">guest</span>@<span class="keyword">settawud-os</span></div><div>-----------</div><div><span class="keyword">OS</span>: Portfolio OS 1.0</div><div><span class="keyword">Host</span>: Web Browser</div><div><span class="keyword">Kernel</span>: JavaScript</div><div><span class="keyword">Uptime</span>: ${Math.floor(
            performance.now() / 1000
          )}s</div><div><span class="keyword">Shell</span>: portfolio-sh</div></div></div><div class="clear-both"></div>`,
        },
        banner: { description: "Display a cool banner", func: () => bannerArt },
        theme: {
          description: "Change UI theme. Usage: theme <light|dark>",
          func: (args) => changeTheme(args),
        },
        sudo: {
          description: "Super user command",
          func: () =>
            "Permission denied. This is a portfolio, not a real server! 😉",
        },
        clear: {
          description: "Clear the terminal",
          func: () => {
            outputEl.innerHTML = "";
            return "";
          },
        },
      };

      const executeCommand = (cmd) => {
        const parts = cmd.trim().split(" ");
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        const cmdLine = document.createElement("div");
        cmdLine.innerHTML = `<span class="command-prompt"><span class="prompt-user">guest@settawud.dev</span>:~$</span><span class="ml-2">${cmd}</span>`;
        outputEl.appendChild(cmdLine);
        const output = document.createElement("div");
        output.classList.add("command-output", "mb-4");
        const command = fullCommands[commandName];
        if (command) output.innerHTML = command.func(args);
        else if (cmd.trim() !== "")
          output.innerHTML = `Command not found: ${commandName}. Type '<span class="keyword">help</span>' for a list of available commands.`;
        if (output.innerHTML) outputEl.appendChild(output);
        bodyEl.scrollTop = bodyEl.scrollHeight;
      };

      let helpShown = false;
      const maybeShowHelp = () => {
        if (!helpShown && inputEl.value.length > 0) {
          const out = document.createElement('div');
          out.classList.add('command-output', 'mb-4');
          out.innerHTML = fullCommands.help.func();
          outputEl.appendChild(out);
          bodyEl.scrollTop = bodyEl.scrollHeight;
          helpShown = true;
        }
      };
      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          executeCommand(inputEl.value);
          inputEl.value = "";
          return;
        }
        // show help on first typing interaction
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
          maybeShowHelp();
        }
      };
      inputEl.addEventListener("keydown", handleKeyDown);
      listeners.push({
        target: inputEl,
        event: "keydown",
        handler: handleKeyDown,
      });

      const typeEffect = (element, text, delay = 20) =>
        new Promise((resolve) => {
          let i = 0;
          function type() {
            if (!isMounted) return;
            if (i < text.length) {
              element.innerHTML += text.charAt(i++);
              bodyEl.scrollTop = bodyEl.scrollHeight;
              setTimeout(type, delay);
            } else {
              resolve();
            }
          }
          type();
        });

      // Start with a blank terminal; help will show after the user starts typing.
    }

    const desktopCleanup = initializeDesktop();

    return () => {
      isMounted = false;
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      listeners.forEach(({ target, event, handler }) =>
        target.removeEventListener(event, handler)
      );
      if (desktopCleanup) desktopCleanup();
    };
  }, []);

  return (
    <>
      <style>{`
                #portfolio-os-root { font-family: 'Inter', sans-serif; overflow: hidden; background-color: var(--os-bg); color: var(--os-text); width: 100vw; height: 100vh; position: relative; transition: background-color 0.3s ease, color 0.3s ease; }
                #bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
                #desktop {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    z-index: 1;
    box-sizing: border-box; /* สำคัญมาก เพื่อให้ padding ไม่ขยายขนาด div */
    /* --- 🔽 เพิ่มบรรทัดนี้เข้ามา 🔽 --- */
    padding: 20px; /* เพิ่มระยะขอบรอบด้าน 20px (ปรับค่าได้ตามชอบ) */
}
                
                #dock-container { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); z-index: 50; }
                #dock { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 12px 8px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4); width: 95px; }

                /* Attention animation for dock items */
                @keyframes dockNudge { 0%, 80%, 100% { transform: translateY(0) } 85% { transform: translateY(-6px) } 90% { transform: translateY(0) } 95% { transform: translateY(-3px) } }
                .dock-item { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; cursor: pointer; width: 100%; will-change: transform; animation: dockNudge 6s ease-in-out infinite; }
                .dock-item::after { content: ''; position: absolute; bottom: 6px; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px rgba(34,197,94,.6); opacity: 0; transition: opacity .2s ease; }
                .dock-item[data-active="true"]::after { opacity: 1; }
                .dock-item:nth-child(1) { animation-delay: .3s }
                .dock-item:nth-child(2) { animation-delay: .9s }
                .dock-item:nth-child(3) { animation-delay: 1.5s }
                .dock-item:hover { animation-play-state: paused }
                @media (prefers-reduced-motion: reduce) { .dock-item { animation: none } }
                .dock-item-icon { width: 45px; height: 45px; transition: transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94); fill: white; color: white; }
                .dock-item span { font-size: 12px; margin-top: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); opacity: 0; transition: opacity 0.2s ease; position: absolute; left: -110px; background: rgba(0,0,0,0.7); padding: 4px 8px; border-radius: 6px; pointer-events: none; white-space: nowrap; }
                .dock-item:hover span { opacity: 1; }

                .window { position: absolute; background-color: var(--os-win-bg); backdrop-filter: blur(15px); color: var(--os-text); border: 1px solid var(--os-border); border-radius: 8px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6); min-width: 300px; min-height: 200px; display: flex; flex-direction: column; resize: both; overflow: auto; transition: background-color 0.3s ease, color 0.3s ease, border 0.3s ease; }
                .window.maximized { border-radius: 0; resize: none; transition: all 0.2s ease-in-out; }
                .title-bar { background-color: var(--os-title-bar); padding: 8px 12px; cursor: move; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--os-border); user-select: none; flex-shrink: 0; transition: background-color 0.3s ease, border 0.3s ease; }
                .title-bar-buttons { display: flex; gap: 8px; cursor: default; }
                .title-bar-buttons span { width: 12px; height: 12px; border-radius: 50%; cursor: pointer; }
                .close-btn { background-color: #ef4444; } .min-btn { background-color: #f59e0b; } .max-btn { background-color: #22c55e; }
                .content { padding: 16px; flex-grow: 1; overflow-y: auto; }
                .terminal-content { font-family: 'Fira Code', monospace; padding: 0; display: flex; flex-direction: column; height: 100%; }
                .help-list { font-family: 'Fira Code', monospace; white-space: pre; line-height: 1.5; margin: 0; }
                #terminal-body { flex-grow: 1; overflow-y: auto; padding: 1rem; }
                #input { background: transparent; border: none; outline: none; color: var(--os-text); width: 100%; font-family: 'Fira Code', monospace; }
                
                /* Project Card Layout */
                .project-card { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid var(--os-border); border-radius: 0.5rem; display: grid; grid-template-columns: 1fr; gap: 1rem; align-items: center; }
                .project-card img { display: block; max-width: 100%; width: 100%; height: auto; object-fit: cover; border-radius: 6px; aspect-ratio: 3 / 4; }
                @media (min-width: 768px) { .project-card { grid-template-columns: minmax(0,1fr) 2fr; } }


                .cursor { background-color: #48bb78; animation: blink 1s step-end infinite; }
                @keyframes blink { from, to { background-color: transparent; } 50% { background-color: #48bb78; } }
                
                .command-output a { color: #63b3ed; text-decoration: none; border-bottom: 1px dashed #63b3ed; } .command-output a:hover { color: #90cdf4; }
                .keyword { color: #48bb78; } .string { color: #f6ad55; } .variable { color: #ed64a6; }
                .command-prompt { color: #48bb78; } .prompt-user { color: #63b3ed; }
                .hidden { display: none; }
                .content h2 { font-size: 1.25rem; font-weight: bold; color: #90cdf4; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--os-border); padding-bottom: 0.25rem; }
                .content h3 { font-weight: bold; color: #a0aec0; margin-top: 1rem; }
                .profile-header {
                display: flex;
                align-items: center;
                gap: 1.5rem; /* ระยะห่างระหว่างรูปกับข้อความ */
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid var(--os-border);
            }

            .profile-pic {
                width: 100px;
                height: 100px;
                border-radius: 50%; /* ทำให้รูปเป็นวงกลม */
                border: 3px solid #4a5568;
                object-fit: cover; /* ทำให้รูปเต็มกรอบวงกลมสวยงาม */
            }

            .profile-info {
                display: flex;
                flex-direction: column;
            }

            .profile-name {
                font-size: 2rem; /* ขนาดตัวอักษรชื่อ */
                font-weight: bold;
                color: #ffffff;
                margin: 0;
            }

            .profile-title {
                font-size: 1.1rem;
                color: #ed64a6; /* สีชมพูเหมือนตัวอย่าง */
                margin: 0;
            }

            .summary-text {
                color: #cbd5e0; /* สีเทาอ่อนสำหรับเนื้อหา */
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .skills-section h3 {
                margin-top: 1rem;
                margin-bottom: 0.5rem;
                color: #a0aec0;
            }

            .tech-skill {
                display: flex;
                gap: 0.5rem;
                margin-bottom: 0.25rem;
                color: #cbd5e0;
            }

            .skill-label {
                color: #f59e0b; /* สีส้ม/ทองสำหรับ Label */
                font-weight: bold;
                flex-shrink: 0; /* ป้องกันการถูกบีบ */
            }

            .contact-grid {
                display: grid;
                /* สร้างตาราง 2 คอลัมน์: คอลัมน์แรกกว้างตามเนื้อหา, คอลัมน์สองกว้างเต็มพื้นที่ที่เหลือ */
                grid-template-columns: auto 1fr;
                /* ระยะห่าง: 0.5rem ระหว่างแถว, 1rem ระหว่างคอลัมน์ */
                gap: 0.5rem 1rem;
                align-items: center; /* ทำให้เนื้อหาในแต่ละแถวอยู่กึ่งกลางแนวตั้ง */
            }
            `}</style>
      <div id="portfolio-os-root">
        <PlexusBackground />
        <div id="desktop">
          <Window
            id="about-window"
            title="My CV"
            defaultStyle={{ top: "10%", left: "15%", width: "60vw", height: "80vh" }}
          >
            <div className="content"></div>
          </Window>

          <Window
            id="projects-window"
            title="My Projects"
            defaultStyle={{ top: "20%", left: "25%", width: "60vw", height: "70vh" }}
            hidden
          >
            <div className="content"></div>
          </Window>

          <Window
            id="terminal-window"
            title="Terminal"
            defaultStyle={{ top: "15%", left: "20%", width: "65vw", height: "60vh" }}
            hidden
          >
            <OsTerminal onOpenWindow={(id) => {
              const el = document.getElementById(id);
              if (el) el.classList.remove('hidden');
            }} />
          </Window>
        </div>
        <Dock />
      </div>
    </>
  );
};
//================================================================
// COMPONENT 2: Portfolio VM (Terminal Interface) - CORRECTED
//================================================================
const PortfolioVM = ({ showAlert }) => {
  return (
    <div style={{ minHeight: "100vh",minWidth:"100vw", color: "var(--text)" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root{ --bg:#071a17; --panel:#0b221d; --text:#f8fafc; --muted:#c7f9ff; --line:rgba(255,255,255,.12); --chip:rgba(255,255,255,.06); --ok:#22c55e; --acc:#06b6d4; --warn:#f59e0b; --shadow:0 14px 40px rgba(0,0,0,.45); --term:#22c55e; --term-dim:#14532d; --term-glow:#34d399; }
            #portfolio-vm-root *{box-sizing:border-box}
            #portfolio-vm-root .app-bg{ background: radial-gradient(1400px 600px at 10% 10%, #043229 0%, #05211b 45%, #031713 100%), linear-gradient(120deg, rgba(34,197,94,.15), rgba(6,182,212,.08)); position:relative; overflow:hidden; min-height: 100vh; }
            #portfolio-vm-root a{color:inherit;text-decoration:none}
            #portfolio-vm-root img{max-width:100%;display:block}
            #portfolio-vm-root :target{scroll-margin-top:72px}
            
            /* --- 1. CONTAINER EDITED FOR A CENTERED, RESPONSIVE LAYOUT --- */
            #portfolio-vm-root .container{
              width: 100%;
              max-width: 1280px; /* Sets a max-width for large screens */
              margin: 0 auto; 
              padding: 0 2rem; /* Adds nice spacing on the sides */
            }

            #portfolio-vm-root .site-header{position:sticky;top:0;z-index:30;height:64px;background:rgba(7,26,23,.65);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);display:flex;align-items:center}
            #portfolio-vm-root .site-header nav{display:flex;flex-wrap:wrap;gap:clamp(8px,2vw,16px)}
            #portfolio-vm-root .brand{font-weight:600;letter-spacing:.2px}
            #portfolio-vm-root .hstack{display:flex;align-items:center;gap:12px}
            #portfolio-vm-root .space-between{justify-content:space-between}
            #portfolio-vm-root .btn{border:1px solid var(--line);padding:10px 14px;border-radius:12px;display:inline-block;background:linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02));cursor:pointer;transition:transform .18s ease, box-shadow .18s ease}
            #portfolio-vm-root .btn:hover{box-shadow:0 10px 28px rgba(6,182,212,.22);transform:translateY(-2px)}
            #portfolio-vm-root .muted{color:var(--muted)}
            #portfolio-vm-root .chip{border:1px solid var(--line);background:var(--chip);padding:6px 10px;border-radius:12px;font-size:13px}
            
            /* --- 2. SPLIT LAYOUT EDITED FOR VERTICAL CENTERING --- */
            #portfolio-vm-root .split{
              display:grid;
              grid-template-columns:repeat(auto-fit,minmax(350px,1fr));
              gap:clamp(16px,3vw,32px); /* Increased gap slightly */
              align-items:center; /* Vertically center items */
            }
            
            /* --- 3. THUMB (IMAGE CONTAINER) EDITED FOR BETTER LOOK --- */
            #portfolio-vm-root .thumb{
              background: transparent; /* Cleaner look */
              border-radius:16px;
              aspect-ratio:16/10;
              overflow:hidden;
              display:flex;
              align-items:center;
              justify-content:center;
              box-shadow: var(--shadow);
              transform:perspective(1200px) rotateX(0) rotateY(0);
              transition:transform .4s ease;
            }
            
            /* --- 4. IMAGE STYLE EDITED WITH HOVER EFFECT --- */
            #portfolio-vm-root .thumb>img{
              width:100%;
              height:100%;
              object-fit:cover; /* Fills the container nicely */
              border-radius: 8px; /* Softens the image edges */
              transition: transform 0.4s ease;
            }
            #portfolio-vm-root .card:hover .thumb>img {
              transform: scale(1.05); /* Nice zoom on hover */
            }

            #portfolio-vm-root .thumb:hover{transform:perspective(1200px) rotateX(3deg) rotateY(-4deg) translateY(-2px)}
            #portfolio-vm-root .card{border:1px solid var(--line);border-radius:16px;padding:18px;background:linear-gradient(180deg, var(--panel), #091b17);box-shadow:var(--shadow);transition:transform .2s ease, box-shadow .2s ease}
            #portfolio-vm-root .card:hover{transform:translateY(-2px); box-shadow:0 16px 44px rgba(0,0,0,.5)}
            #portfolio-vm-root .hero{padding:56px 0 28px}
            #portfolio-vm-root h1{font-size:clamp(28px,4vw,46px);margin:8px 0;line-height:1.15}
            #portfolio-vm-root h2{font-size:clamp(20px,3vw,28px);margin:8px 0;color:#b6ffde}
            #portfolio-vm-root h3{font-size:18px;margin:6px 0;color:#a7f3d0}
            #portfolio-vm-root .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace}
            #portfolio-vm-root .cli{border:1px solid #1f4f3a;background:linear-gradient(180deg,#0b1e19,#071a17);border-radius:16px;padding:14px;box-shadow:0 0 0 1px rgba(52,211,153,.08) inset}
            #portfolio-vm-root .prompt{color:var(--term)}
            #portfolio-vm-root .input-line{position:relative}
            #portfolio-vm-root .input-line input{background:transparent;border:none;outline:none;color:var(--text);width:100%;font:inherit;caret-color:var(--term)}
            #portfolio-vm-root .input-line input::placeholder{color:rgba(255,255,255,.35)}
            #portfolio-vm-root .blink{display:inline-block;width:.6ch;margin-left:4px;background:var(--term);height:1.1em;transform:translateY(2px);animation:blink 1s step-end infinite;box-shadow:0 0 8px var(--term-glow)}
            @keyframes blink{50%{opacity:0}}
            #portfolio-vm-root .fade{opacity:0;transform:translateY(10px);transition:opacity .5s ease-out, transform .5s ease-out}
            #portfolio-vm-root .fade.show{opacity:1;transform:none}
            #portfolio-vm-root footer{border-top:1px solid var(--line);margin-top:20px}
            #portfolio-vm-root .orb{position:absolute;border-radius:50%;filter:blur(18px);opacity:.18;animation:float 12s ease-in-out infinite}
            #portfolio-vm-root .orb.teal{width:360px;height:360px;background:#22c55e; left:-120px; top:-80px}
            #portfolio-vm-root .orb.cyan{width:280px;height:280px;background:#06b6d4; right:-80px; bottom:20%}
            @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
            @media (max-width: 640px){ #portfolio-vm-root .hero{padding:32px 0 16px} #portfolio-vm-root .site-header{height:56px} #portfolio-vm-root .site-header nav{gap:12px} }
            @media (prefers-reduced-motion: reduce){ #portfolio-vm-root .fade, #portfolio-vm-root .thumb, #portfolio-vm-root .card {transition:none; opacity:1; transform:none;} }
          `,
        }}
      />

      <div id="portfolio-vm-root" className="app-bg">
        <span className="orb teal" aria-hidden="true" />
        <span className="orb cyan" aria-hidden="true" />
        <header className="site-header">
          <div className="container hstack space-between">
            <div className="brand">Settawud — Portfolio</div>
            <nav className="hstack" aria-label="Main">
              <a className="muted" href="#projects">Projects</a>
              <a className="muted" href="#about">About</a>
              <a className="muted" href="#contact">Contact</a>
            </nav>
          </div>
        </header>
        <main>
          <section className="container hero split">
            <Fade>
              <div className="thumb">
                <img id="vm-profile-img" alt="Profile of Settawud" width={720} height={720} loading="eager" />
              </div>
            </Fade>
            <Fade>
              <Terminal showAlert={showAlert} />
            </Fade>
          </section>

          <section id="projects" className="container" style={{ padding: "8px 0 8px" }}>
            <Fade><h2>Selected Projects</h2></Fade>

            <ParallaxCard>
              <article className="card split" style={{ marginTop: 12 }}>
                <div className="thumb">
                  <img id="vm-ginraidee-img" alt="GinRaiDee project" width={1000} loading="lazy" />
                </div>
                <div>
                  <h3>GinRaiDee — Random Food Suggester</h3>
                  <p className="muted">Concept → MERN delivery: RESTful CRUD (MongoDB), responsive UI with Tailwind, calm interactions.</p>
                  <div className="hstack" style={{ marginTop: 8, flexWrap: "wrap" }}>
                    <a className="btn" href="#!" onClick={(e) => { e.preventDefault(); showAlert("Opening Live Demo..."); }}>Live</a>
                    <a className="btn" href="#!" onClick={(e) => { e.preventDefault(); showAlert("Opening GitHub Repo..."); }}>Repo</a>
                  </div>
                </div>
              </article>
            </ParallaxCard>

            <ParallaxCard>
              <article className="card split" style={{ marginTop: 12 }}>
                <div className="thumb" style={{ order: 2 }}>
                  <img id="vm-livinlab-img" alt="Livin'Lab project" width={1000} loading="lazy" />
                </div>
                <div style={{ order: 1 }}>
                  <h3>Livin’Lab — E‑commerce Furniture (Team)</h3>
                  <p className="muted">Built authentication (register/login/reset), product search & filters, and RESTful APIs in an Agile setup.</p>
                  <div className="hstack" style={{ marginTop: 8, flexWrap: "wrap" }}>
                    <a className="btn" href="#!" onClick={(e) => { e.preventDefault(); showAlert("Opening Live Demo..."); }}>Live</a>
                    <a className="btn" href="#!" onClick={(e) => { e.preventDefault(); showAlert("Opening GitHub Repo..."); }}>Repo</a>
                  </div>
                </div>
              </article>
            </ParallaxCard>
          </section>

          <section id="about" className="container" style={{ padding: "20px 0" }}>
            <div className="split">
              <Fade>
                <div className="card">
                  <h2>About</h2>
                  <ul className="muted" style={{ margin: "10px 0 0 18px", lineHeight: 1.6, paddingLeft: 0, listStylePosition: "inside" }}>
                    <li>Junior Software Developer transitioning from banking.</li>
                    <li>Projects: E‑commerce furniture & GinRaiDee food randomizer.</li>
                    <li>Tech: React, Node.js, Express, MongoDB, REST API, Tailwind.</li>
                    <li>Soft skills: Adaptability, problem‑solving, teamwork.</li>
                  </ul>
                </div>
              </Fade>
              <Fade>
                <div className="cli mono">
                  <div><span className="prompt">&gt;</span> contact --list</div>
                  <div><span className="prompt">$</span> email: <a href="mailto:settawud.pr@gmail.com">settawud.pr@gmail.com</a></div>
                  <div><span className="prompt">$</span> phone: <a href="tel:+66952807070">095‑280‑7070</a></div>
                  <div><span className="prompt">$</span> linkedin: <a href="https://www.linkedin.com/in/settawud-promyos" target="_blank" rel="noopener noreferrer">/in/settawud-promyos</a></div>
                  <div><span className="prompt">$</span> github: <a href="https://github.com/Settawud" target="_blank" rel="noopener noreferrer">@Settawud</a></div>
                </div>
              </Fade>
            </div>
          </section>
        </main>

        <footer id="contact">
          <div className="container" style={{ padding: "20px 0" }}>
            <div className="hstack space-between" style={{ flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontWeight: 600 }}>Let’s work together</div>
                <div className="muted">Open to Junior Software Developer roles & collaborations.</div>
              </div>
              <div className="hstack">
                <a className="btn" href="mailto:settawud.pr@gmail.com">Email</a>
                <a className="btn" href="https://www.linkedin.com/in/settawud-promyos" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
            <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
              © {new Date().getFullYear()} Settawud Promyos
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};


// ---------- Helpers & components for PortfolioVM ----------
function Fade({ children }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="fade">
      {children}
    </div>
  );
}

function ParallaxCard({ children }) {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <Fade>
      <div
        ref={ref}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "16px",
        }}
      >
        <motion.div style={{ y }}>{children}</motion.div>
      </div>
    </Fade>
  );
}

function Terminal({ showAlert }) {
  const [val, setVal] = React.useState("");
  const outRef = React.useRef(null);
  const history = React.useRef([]);
  const histIdx = React.useRef(history.current.length);

  const handlers = useMemo(
    () => ({
      help: () =>
        [
          "Commands:",
          "- help      Show this help",
          "- whoami    Brief intro",
          "- skills    Tech stack",
          "- projects  Jump to projects",
          "- about     About summary",
          "- contact   Contact links",
          "- clear     Clear output",
        ].join("\n"),
      whoami: () => "Settawud Promyos — Junior Software Developer.",
      skills: () =>
        "html css javascript react node express mongodb sql mysql postgresql tailwind git",
      projects: () => {
        const el = document.getElementById("projects");
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return "Scrolling to projects…";
      },
      about: () =>
        [
          "Junior Software Developer — transitioning from banking.",
          "Client-facing, analytical, compliance (AML/PDPA).",
          "Bootcamp JSD10 — React, Node.js, JavaScript, SQL, MongoDB.",
        ].join("\n"),
      contact: () =>
        [
          "email: settawud.pr@gmail.com",
          "phone: 095-280-7070",
          "linkedin: /in/settawud-promyos",
          "github: @Settawud",
        ].join("\n"),
      clear: () => {
        if (outRef.current) outRef.current.textContent = "";
        return "";
      },
    }),
    []
  );

  const print = (cmd, res) => {
    if (res !== "" && outRef.current) {
      outRef.current.textContent += `\n> ${cmd}\n${res}\n`;
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = val;
      const c = raw.trim().toLowerCase();
      if (!c) return;
      if (history.current[history.current.length - 1] !== raw)
        history.current.push(raw);
      histIdx.current = history.current.length;
      const out = handlers[c] ? handlers[c]() : `command not found: ${c}`;
      print(c, out);
      setVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.current.length > 0) {
        histIdx.current = Math.max(0, histIdx.current - 1);
        setVal(history.current[histIdx.current] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current < history.current.length - 1) {
        histIdx.current++;
        setVal(history.current[histIdx.current]);
      } else {
        histIdx.current = history.current.length;
        setVal("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const q = val.trim().toLowerCase();
      if (!q) return;
      const match = Object.keys(handlers).find((x) => x.startsWith(q));
      if (match) setVal(match);
    }
  };

  useEffect(() => {
    // Assume images are in the /public folder
    const PROFILE_IMG = '/profile.jpg';
    const GINRAIDEE_IMG = '/Ginraidee.png';
    const LIVINLAB_IMG = '/LivinLab.png';

    const prof = document.getElementById('vm-profile-img');
    const gin = document.getElementById('vm-ginraidee-img');
    const livinlab = document.getElementById('vm-livinlab-img'); // หา element รูปใหม่

    if(prof) prof.src = PROFILE_IMG;
    if(gin) gin.src = GINRAIDEE_IMG;
    if(livinlab) livinlab.src = LIVINLAB_IMG; // กำหนด src ให้รูป Livin' Lab
  }, []);

  return (
    <div
      className="cli mono"
      aria-label="terminal panel"
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      <div>
        <span className="prompt">&gt;</span> welcome
      </div>
      <div>
        <span className="prompt">$</span> type{" "}
        <span className="chip">help</span> to explore
      </div>
      <div
        ref={outRef}
        aria-live="polite"
        style={{
          minHeight: "clamp(96px,18vh,140px)",
          marginTop: 8,
          whiteSpace: "pre-wrap",
          maxHeight: "clamp(160px,32vh,320px)",
          overflow: "auto",
        }}
      />
      <div className="input-line hstack">
        <span className="prompt">&gt;</span>
        <input
          aria-label="terminal input"
          placeholder="whoami | skills | projects..."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
