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

  // Tab khác đổi site → tải lại tab này để giao diện và X-Site-Code khớp site mới,
  // tránh lưu nhầm dữ liệu sang site kia.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== 'website' || event.newValue === event.oldValue) return;
      window.alert('Site đã được chuyển ở tab khác. Trang sẽ tải lại theo site mới.');
      window.location.reload();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div>
      <AppRoute />
    </div>
  );
};

export default App;
