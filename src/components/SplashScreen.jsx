import React from 'react';
import { motion } from 'framer-motion';

const biosContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const lineVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const progressBarVariants = (delay = 0) => ({
  hidden: { width: 0 },
  visible: {
    width: '100%',
    transition: {
      duration: 0.6,
      delay,
      ease: 'linear',
    }
  }
});

export default function SplashScreen() {
  const biosLines = [
    'SP-BIOS v2.5 (c) 2025 Settawud Promyos.',
    'Main Processor: React Core @ 3.0GHz',
    'Memory Testing: 65536KB OK',
    '',
    'Initializing Portfolio Kernels...',
    'Detecting Virtual Drives... 1 found.',
    '  -> PORTFOLIO_OS.SYS',
    '',
    'Loading resources:',
    "Booting Settawud's Portfolio...",
  ];

  // total delay before progress bar should run (after lines appear)
  const barDelay = biosLines.length * 0.10; // seconds
  const playedRef = React.useRef(false);

  return (
    <motion.div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        fontFamily: "'VT323', monospace",
        color: '#33ff33',
        fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
        textShadow: '0 0 5px rgba(51,255,51,.5)'
      }}
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
    >
      <div style={{ width: 'min(90%, 800px)' }}>
        <motion.div variants={biosContainerVariants} initial="hidden" animate="visible">
          {biosLines.map((line, i) => (
            <motion.p key={i} variants={lineVariants} style={{ margin: 0 }}>
              {line}
            </motion.p>
          ))}
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
          <span style={{ marginRight: 10 }}>[</span>
          <div style={{ flex: 1, height: 20, border: '1px solid #33ff33' }}>
            <motion.div
              style={{ width: 0, height: '100%', background: '#33ff33' }}
              variants={progressBarVariants(barDelay)}
              initial="hidden"
              animate="visible"
              onAnimationComplete={() => {
                if (playedRef.current) return;
                playedRef.current = true;
                try {
                  if (window.__sfx && typeof window.__sfx.load === 'function') {
                    window.__sfx.load();
                    window.__sfx.__playedLoad = true;
                  }
                } catch {}
              }}
            />
          </div>
          <span style={{ marginLeft: 10 }}>]</span>
        </div>

        <motion.p
          style={{ margin: '10px 0 0 0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: biosLines.length * 0.2 }}
        >
          completed <span className="blinking-cursor">_</span>
        </motion.p>
      </div>

      <style>{`
        .blinking-cursor { font-weight: bold; animation: blink 1s step-end infinite; }
        @keyframes blink { from, to { color: transparent; } 50% { color: #33ff33; } }
      `}</style>
    </motion.div>
  );
}
