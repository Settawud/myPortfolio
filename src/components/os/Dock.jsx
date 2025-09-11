import React from 'react';
import { FaRegUserCircle, FaLaptopCode, FaTerminal } from 'react-icons/fa';

const items = [
  { id: 'about-window', title: 'My CV', Icon: FaRegUserCircle },
  { id: 'projects-window', title: 'Projects', Icon: FaLaptopCode },
  { id: 'terminal-window', title: 'Terminal', Icon: FaTerminal },
];

export default function Dock({ windows, onToggle }) {
  return (
    <div id="dock-container">
      <div id="dock">
        {items.map(({ id, title, Icon }) => (
          <div
            key={id}
            className="dock-item"
            data-window={id}
            data-active={windows?.[id]?.visible ? 'true' : 'false'}
            onClick={() => onToggle?.(id)}
          >
            <Icon className="dock-item-icon" />
            <span>{title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
