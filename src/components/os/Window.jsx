import React from 'react';

export default function Window({
  id,
  title,
  state,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onMoveEnd,
  children,
}) {
  const ref = React.useRef(null);
  const drag = React.useRef({ active: false, x: 0, y: 0, left: 0, top: 0 });

  const style = {
    top: state.top,
    left: state.left,
    width: state.width,
    height: state.height,
    zIndex: state.zIndex,
  };

  const onMouseDown = () => onFocus?.(id);

  const onTitleMouseDown = (e) => {
    if (state.maximized) return; // no drag when maximized
    const el = ref.current;
    if (!el) return;
    const cs = window.getComputedStyle(el);
    drag.current = {
      active: true,
      x: e.clientX,
      y: e.clientY,
      left: parseFloat(cs.left) || 0,
      top: parseFloat(cs.top) || 0,
    };
    window.addEventListener('mousemove', onTitleMouseMove);
    window.addEventListener('mouseup', onTitleMouseUp, { once: true });
  };

  const onTitleMouseMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    onMove?.(id, { left: `${drag.current.left + dx}px`, top: `${drag.current.top + dy}px` });
  };

  const onTitleMouseUp = () => {
    drag.current.active = false;
    window.removeEventListener('mousemove', onTitleMouseMove);
    onMoveEnd?.(id);
  };

  const onTitleDoubleClick = () => onMaximize?.(id);

  return (
    <div
      id={id}
      ref={ref}
      className={`window${state.maximized ? ' maximized' : ''}${state.visible ? '' : ' hidden'}`}
      style={style}
      onMouseDown={onMouseDown}
    >
      <div className="title-bar" onMouseDown={onTitleMouseDown} onDoubleClick={onTitleDoubleClick}>
        <span>{title}</span>
        <div className="title-bar-buttons">
          <span className="min-btn" onClick={() => onMinimize?.(id)}></span>
          <span className="max-btn" onClick={() => onMaximize?.(id)}></span>
          <span className="close-btn" onClick={() => onClose?.(id)}></span>
        </div>
      </div>
      {children}
    </div>
  );
}
