export function buildCommands({ openWindow, closeWindow, profile }) {
  const commands = {
    help: {
      description: 'Shows this help message',
      func: () => '', // will be replaced below to reference the full map
    },
    whoami: { description: 'Current user', func: () => 'guest' },
    about: { description: 'Summary about me', func: () => 'Settawud Promyos — Junior Software Developer.' },
    skills: { description: 'Tech stack', func: () => 'HTML CSS JavaScript React Node Express MongoDB SQL' },
    projects: { description: 'Open Projects window', func: () => { openWindow('projects-window'); return 'Opening Projects window…'; } },
    contact: { description: 'Contact links', func: () => 'email: settawud.pr@gmail.com | github: @Settawud | linkedin: /in/settawud-promyos' },
    clear: { description: 'Clear terminal', func: () => '' },
    exit: {
      description: 'Close terminal window',
      func: () => {
        try { if (typeof closeWindow === 'function') closeWindow('terminal-window'); } catch {}
        return 'closing terminal…';
      }
    },
    greet: {
      description: 'Print a tailored intro',
      func: () => {
        const hour = new Date().getHours();
        const tod = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        const p = profile || {};
        const name = p.name || 'Settawud Promyos';
        const nick = p.nick || 'SP';
        const applying = p.applying || 'Junior Software Developer';
        const company = p.company || 'your company';
        const latestRole = p.latestRole || 'Bank Teller';
        const latestCompany = p.latestCompany || 'TMBThanachart Bank (TTB)';
        const course = p.course || "Generation's JSD";
        const courseProject = p.courseProject || "E‑commerce (Livin' Lab) & GinRaiDee";
        const tech = p.tech || 'React, Node.js, Express, MongoDB';
        return [
          `${tod}, my name is ${name}, you can call me ${nick}.`,
          `I am applying for ${applying} at ${company}.`,
          `My latest experience is ${latestRole} at ${latestCompany}.`,
          `I recently finished ${course} and my course project is ${courseProject} using ${tech}.`,
          'As a career switcher, I hope to contribute my skills and mindset to the team.'
        ].join('\n');
      }
    },
  };
  // Bind help after all commands exist, so it can see the full map.
  commands.help.func = () => Object.keys(commands)
    .map((c) => `${c.padEnd(10)} - ${commands[c].description}`)
    .join('\n');
  return commands;
}
