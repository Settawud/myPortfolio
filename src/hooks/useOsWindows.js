import React from 'react';

const DEFAULTS = {
  'about-window': { title: 'My CV', top: '10%', left: '15%', width: '60vw', height: '80vh', visible: true },
  'projects-window': { title: 'My Projects', top: '20%', left: '25%', width: '60vw', height: '70vh', visible: false },
  'terminal-window': { title: 'Terminal', top: '10%', left: '15%', width: '60vw', height: '70vh', visible: false },
};

export default function useOsWindows() {
  const [state, setState] = React.useState(() => {
    const zBase = 10;
    const map = {};
    let i = 0;
    for (const id of Object.keys(DEFAULTS)) {
      const d = DEFAULTS[id];
      map[id] = { id, ...d, maximized: false, zIndex: zBase + i++ };
    }
    return map;
  });

  const maxZ = React.useMemo(() => Math.max(...Object.values(state).map(w => w.zIndex || 0)), [state]);

  const focus = (id) => setState(s => ({ ...s, [id]: { ...s[id], zIndex: maxZ + 1 } }));
  const open = (id) => setState(s => ({ ...s, [id]: { ...s[id], visible: true, zIndex: maxZ + 1 } }));
  const close = (id) => setState(s => ({ ...s, [id]: { ...s[id], visible: false } }));
  const toggle = (id) => setState(s => ({ ...s, [id]: { ...s[id], visible: !s[id].visible, zIndex: !s[id].visible ? maxZ + 1 : s[id].zIndex } }));
  const move = (id, pos) => setState(s => ({ ...s, [id]: { ...s[id], ...pos } }));
  const resize = (id, size) => setState(s => ({ ...s, [id]: { ...s[id], ...size } }));
  const maximize = (id, dockReserve = 120) => setState(s => ({ ...s, [id]: { ...s[id], maximized: true, top: '0', left: '0', width: `calc(100% - ${dockReserve}px)`, height: '100%', zIndex: maxZ + 1 } }));
  const restore = (id, prev) => setState(s => ({ ...s, [id]: { ...s[id], maximized: false, ...prev, zIndex: maxZ + 1 } }));

  return {
    windows: state,
    open, close, toggle, move, resize, focus, maximize, restore,
  };
}
