// cms-hisweetie/src/App.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoute from './routes';

const App = () => {
  const location = useLocation();

  // ═══════════════════════════════════════════════════════
  // VALIDATE LOCALSTORAGE ON EVERY ROUTE CHANGE
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const currentSite = localStorage.getItem('website');

    if (!currentSite) {
      // Nếu chưa set → default 'lermao'
      localStorage.setItem('website', 'lermao');
      console.info('[Site Init] Set default site: lermao');
    } else {
      // Log current site mỗi lần navigate để debug
      console.info(`[Site Active] ${currentSite.toUpperCase()} | Route: ${location.pathname}`);
    }
  }, [location.pathname]);

  return (
    <div>
      <AppRoute />
    </div>
  );
};

export default App;
