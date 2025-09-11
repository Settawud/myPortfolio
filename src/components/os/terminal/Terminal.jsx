import React from 'react';
import { buildCommands } from './commands';

export default function Terminal({ onOpenWindow, onCloseWindow }) {
  const USER = 'guest';
  const HOST = 'settawud.dev';
  const PROMPT = `${USER}@${HOST}:~$`;
  const [val, setVal] = React.useState('');
  const outRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const history = React.useRef([]);
  const histIdx = React.useRef(0);
  const helpShown = React.useRef(false);

  const profile = React.useMemo(() => ({
    name: 'Settawud Promyos',
    nick: 'SP',
    applying: 'Junior Software Developer',
    company: 'your company',
    latestRole: 'Bank Teller',
    latestCompany: 'TMBThanachart Bank (TTB)',
    course: "Generation's JSD",
    courseProject: "E‑commerce (Livin' Lab) & GinRaiDee",
    tech: 'React, Node.js, Express, MongoDB'
  }), []);
  const commands = React.useMemo(() => buildCommands({ openWindow: onOpenWindow, closeWindow: onCloseWindow, profile }), [onOpenWindow, onCloseWindow, profile]);

  const print = (text) => {
    if (!outRef.current) return;
    if (text === '') { outRef.current.textContent = ''; return; }
    outRef.current.textContent += `${text}\n`;
    outRef.current.scrollTop = outRef.current.scrollHeight;
  };

  const showHelpIfNeeded = () => {
    if (helpShown.current) return;
    helpShown.current = true;
    const rows = commands.help.func();
    print(rows);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = val.trim();
      const cmd = raw.split(' ')[0].toLowerCase();
      const args = raw.split(' ').slice(1);
      if (!raw) return;
      if (history.current[history.current.length - 1] !== raw) history.current.push(raw);
      histIdx.current = history.current.length;
      const handler = commands[cmd];
      const out = handler ? handler.func(args) : `command not found: ${cmd}`;
      if (cmd === 'clear') {
        print('');
      } else {
        print(`${PROMPT} ${raw}`);
        if (out) print(out);
      }
      setVal('');
      return;
    }
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') showHelpIfNeeded();
    if (e.key === 'ArrowUp') {
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
      const match = Object.keys(commands).find((x) => x.startsWith(q));
      if (match) setVal(match);
    }
  };

  return (
    <div className="content terminal-content" onClick={() => inputRef.current?.focus()}>
      <div id="terminal-body">
     <div className="term-header" role="status" aria-live="polite">
        <span className="user">Settawud.Dev</span>
        <span>@</span>
        <span className="host">~ whoami : Curious Coder</span>
      </div>


         <div className="input-line">
          <span className="command-prompt">{PROMPT}</span>
          <span className="typed" aria-live="polite">{val}</span>
          <span className="cursor" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            id="input"
            className="sr-input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
          />
        </div>
        <pre ref={outRef} id="output" style={{ margin: 0, whiteSpace: 'pre-wrap', minHeight: 120 }} />
       
      </div>
    </div>
  );
}
