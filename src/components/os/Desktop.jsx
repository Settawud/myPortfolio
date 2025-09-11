import React from 'react';
import Window from './Window';
import Dock from './Dock';
import PlexusBackground from './PlexusBackground';
import OsTerminal from './terminal/Terminal';
import useOsWindows from '../../hooks/useOsWindows';
import '../../styles/os.css';

export default function Desktop() {
  const desktopRef = React.useRef(null);
  const { windows, open, close, toggle, move, resize, focus, maximize, restore } = useOsWindows();
  const prevGeom = React.useRef({});

  const portfolioData = React.useMemo(() => ({
    summary:
      "A highly motivated and detail-oriented software developer transitioning from a successful background in banking, where I developed strong client-facing, analytical, and compliance skills. With experience advising diverse clients, processing high-volume transactions with accuracy, and ensuring strict adherence to regulations such as AML and PDPA, I bring a unique blend of precision, problem-solving, and teamwork to software development. As a recent completer of the intensive Full Stack Development Bootcamp (JSD10), I am proficient in modern technologies including React, Node.js, JavaScript, SQL, and MongoDB. I am now seeking a Junior Software Developer role where I can leverage both my technical expertise and professional experience to contribute to a dynamic organization's growth.",
    profilePic: "/profile.jpg",
    skills: {
      technical: [
        { skill: "Frontend", value: "HTML, CSS, Javascript, React.js" },
        { skill: "Backend", value: "Node.js, Express.js" },
        { skill: "Database", value: "Python, Mongodb, Mysql, Postgresql" },
        { skill: "Tools & Platforms", value: "Git, VS Code, Jupyter Notebook, SQL Workbench, Docker (Learning), Google Workspace, Excel" },
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
  }), []);

  // keyboard shortcuts: Cmd+M minimize, Ctrl+Cmd+F maximize
  React.useEffect(() => {
    const handler = (e) => {
      const entries = Object.values(windows).filter(w => w.visible);
      if (!entries.length) return;
      const top = entries.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
      if (e.metaKey && !e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        close(top.id);
      } else if (e.metaKey && e.ctrlKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        const id = top.id;
        if (windows[id].maximized) {
          const prev = prevGeom.current[id] || { top: '10%', left: '15%', width: '60vw', height: '80vh' };
          restore(id, prev);
        } else {
          prevGeom.current[id] = { top: windows[id].top, left: windows[id].left, width: windows[id].width, height: windows[id].height };
          maximize(id);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [windows, close, maximize, restore]);

  const onMaximizeToggle = (id) => {
    if (windows[id].maximized) {
      const prev = prevGeom.current[id] || { top: '15%', left: '20%', width: '65vw', height: '60vh' };
      restore(id, prev);
    } else {
      prevGeom.current[id] = { top: windows[id].top, left: windows[id].left, width: windows[id].width, height: windows[id].height };
      maximize(id);
    }
  };

  const onMoveEnd = (id) => {
    const desktop = desktopRef.current;
    if (!desktop) return;
    const dock = document.getElementById('dock');
    const reserve = (dock?.offsetWidth || 96) + 24; // dock + margin
    const rect = desktop.getBoundingClientRect();
    const w = windows[id];
    const left = parseFloat(w.left) || 0;
    const top = parseFloat(w.top) || 0;
    const thresh = 32;
    // Snap left
    if (left <= thresh) {
      move(id, { left: '0px', top: '0px' });
      const half = Math.max(200, Math.floor((rect.width - reserve) / 2));
      resize(id, { width: `${half}px`, height: `${Math.floor(rect.height)}px` });
      focus(id);
      return;
    }
    // Snap right
    if (rect.width - left - (parseFloat(w.width) || 0) <= thresh) {
      const half = Math.max(200, Math.floor((rect.width - reserve) / 2));
      move(id, { left: `${Math.floor((rect.width - reserve) / 2)}px`, top: '0px' });
      resize(id, { width: `${half}px`, height: `${Math.floor(rect.height)}px` });
      focus(id);
      return;
    }
    // Snap top (maximize)
    if (top <= thresh) {
      onMaximizeToggle(id);
    }
  };

  return (
    <div id="portfolio-os-root">
      <PlexusBackground />
      <div id="desktop" ref={desktopRef}>
        <Window
          id="about-window"
          title="My CV"
          state={windows['about-window']}
          onFocus={focus}
          onMove={move}
          onMoveEnd={onMoveEnd}
          onMinimize={(id) => close(id)}
          onClose={(id) => close(id)}
          onMaximize={onMaximizeToggle}
        >
          <AboutContent data={portfolioData} />
        </Window>

        <Window
          id="projects-window"
          title="My Projects"
          state={windows['projects-window']}
          onFocus={focus}
          onMove={move}
          onMoveEnd={onMoveEnd}
          onMinimize={(id) => close(id)}
          onClose={(id) => close(id)}
          onMaximize={onMaximizeToggle}
        >
          <ProjectsContent projects={portfolioData.projects} />
        </Window>

        <Window
          id="terminal-window"
          title="Terminal"
          state={windows['terminal-window']}
          onFocus={focus}
          onMove={move}
          onMoveEnd={onMoveEnd}
          onMinimize={(id) => close(id)}
          onClose={(id) => close(id)}
          onMaximize={onMaximizeToggle}
        >
          <OsTerminal onOpenWindow={open} onCloseWindow={close} />
        </Window>
      </div>
      <Dock windows={windows} onToggle={toggle} />
    </div>
  );
}

function AboutContent({ data }) {
  const { skills, experience, education, contact } = data;
  return (
    <div className="content">
      <div className="profile-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--os-border)' }}>
        <img src={data.profilePic} alt="Settawud Promyos Profile" className="profile-pic" style={{ width: 100, height: 100, borderRadius: '50%', border: '3px solid #4a5568', objectFit: 'cover' }} />
        <div className="profile-info">
          <h1 className="profile-name" style={{ fontSize: '2rem', margin: 0 }}>Settawud Promyos</h1>
          <p className="profile-title" style={{ margin: 0, color: '#ed64a6' }}>Aspiring Software Developer</p>
        </div>
      </div>
      <p className="summary-text" style={{ color: '#cbd5e0', lineHeight: 1.6 }}>{data.summary}</p>
      <h2>Skills</h2>
      <div className="skills-section">
        <h3>Technical Skills</h3>
        {skills.technical.map((s, i) => (
          <div key={i} className="tech-skill" style={{ display: 'flex', gap: '.5rem', color: '#cbd5e0' }}>
            <strong className="skill-label" style={{ color: '#f59e0b' }}>{s.skill}:</strong>
            <span>{s.value}</span>
          </div>
        ))}
        <h3>Soft Skills & Languages</h3>
        <p>{skills.soft.join(', ')}</p>
        <p>{skills.languages.join(', ')}</p>
      </div>
      <h2>Work Experience</h2>
      {experience.map((e, i) => (
        <div key={i} className="mb-4">
          <h3 className="text-lg">{e.role} <span className="text-gray-400">@ {e.company}</span></h3>
          <p className="text-sm text-gray-500">{e.period}</p>
          <ul className="list-disc list-inside text-gray-400 text-sm" style={{ marginTop: 8 }}>
            {e.details.map((d, j) => <li key={j}>{d}</li>)}
          </ul>
        </div>
      ))}
      <h2>Education</h2>
      {education.map((e, i) => (
        <div key={i} className="mb-4">
          <h3 className="text-lg">{e.degree}</h3>
          <p className="text-gray-400">{e.institution}</p>
          <p className="text-sm text-gray-500">{e.period}</p>
        </div>
      ))}
      <h2>Contact</h2>
      <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '.5rem 1rem', alignItems: 'center' }}>
        <strong>Email:</strong> <a href={`mailto:${contact.email}`} className="text-sky-300">{contact.email}</a>
        <strong>LinkedIn:</strong> <a href={contact.linkedin} target="_blank" rel="noreferrer" className="text-sky-300">linkedin.com/in/settawud-promyos</a>
        <strong>GitHub:</strong> <a href={contact.github} target="_blank" rel="noreferrer" className="text-sky-300">github.com/Settawud</a>
        <strong>Phone:</strong> <span>{contact.phone}</span>
      </div>
    </div>
  );
}

function ProjectsContent({ projects }) {
  return (
    <div className="content">
      {projects.map((p) => (
        <div key={p.id} className="project-card">
          <img src={p.imageUrl} alt={`${p.name} project screenshot`} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{p.name}</h2>
            <p className="text-sm text-sky-300 mb-2">{p.tech.join(', ')}</p>
            <ul className="list-disc list-inside text-gray-400 text-sm mb-3">
              {p.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <div className="mt-4">
              <a href={p.repoUrl} target="_blank" rel="noreferrer" className="mr-4 text-white">[ GitHub ]</a>
              <a href={p.demoUrl} target="_blank" rel="noreferrer" className="text-white">[ Demo ]</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
