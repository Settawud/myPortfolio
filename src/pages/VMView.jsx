// src/pages/VMView.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import SplashScreen from "../components/SplashScreen";
import PortfolioVM from "../components/PortfolioVM";

export default function VMView() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [alertMessage, setAlertMessage] = React.useState(null);

  React.useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const showAlert = (message) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), 1000);
  };

  return (
    <div className="vmview-page">
      {/* สไตล์กล่อง alert แบบเดียวกับใน App */}
      <style>{`
        .custom-alert {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          padding: 12px 24px; background-color: #2d3748; color: #e2e8f0;
          border: 1px solid #4a5568; border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4); z-index: 10001;
          animation: fadeInAndOut 3s ease-in-out forwards;
        }
        @keyframes fadeInAndOut {
          0% { opacity: 0; top: 0; }
          15% { opacity: 1; top: 20px; }
          85% { opacity: 1; top: 20px; }
          100% { opacity: 0; top: 0; }
        }
      `}</style>

      <AnimatePresence>
        {isLoading ? (
          <motion.div key="splash">
            <SplashScreen />
          </motion.div>
        ) : (
          <motion.div
            key="vm-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
          >
            {alertMessage && <div className="custom-alert">{alertMessage}</div>}
            <PortfolioVM showAlert={showAlert} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
