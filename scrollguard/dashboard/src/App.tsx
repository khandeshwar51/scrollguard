import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './pages/Overview';
import Heatmap from './pages/Heatmap';
import Platforms from './pages/Platforms';
import Sessions from './pages/Sessions';
import Coach from './pages/Coach';
import type { BackupData } from './shared/types';
import { createEmptyBackupData } from './shared/emptyState';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<string>('overview');
  const [data, setData] = useState<BackupData | null>(null);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(2); // Remove '#/'
      const validRoutes = ['overview', 'heatmap', 'platforms', 'sessions', 'coach'];
      if (validRoutes.includes(hash)) {
        setActiveRoute(hash);
      } else {
        window.location.hash = '/overview';
        setActiveRoute('overview');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run once on mount

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Sync backupData storage from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('scrollguard_backup');
    if (cached) {
      try {
        setData(JSON.parse(cached));
      } catch (_) {
        setData(createEmptyBackupData());
      }
    }
  }, []);

  // Poll real-time synced data from backend server
  useEffect(() => {
    const fetchSyncData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:3000/api/data');
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            setData(result.data);
          }
        }
      } catch (err) {
        console.error('[ScrollGuard Dashboard] Sync fetch failed:', err);
      }
    };

    fetchSyncData(); // Initial load
    const interval = setInterval(fetchSyncData, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const handleUpload = (newData: BackupData) => {
    localStorage.setItem('scrollguard_backup', JSON.stringify(newData));
    setData(newData);
  };


  const currentData = data || createEmptyBackupData();
  const isMock = false; // We completely removed the concept of Demo Mode. 

  const renderActivePage = () => {
    switch (activeRoute) {
      case 'overview':
        return <Overview data={currentData} isMock={isMock} />;
      case 'heatmap':
        return <Heatmap data={currentData} />;
      case 'platforms':
        return <Platforms data={currentData} />;
      case 'sessions':
        return <Sessions data={currentData} />;
      case 'coach':
        return <Coach data={currentData} />;
      default:
        return <Overview data={currentData} isMock={isMock} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute={activeRoute} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          activeRoute={activeRoute}
          onUpload={handleUpload}
          isMock={isMock}
        />
        {renderActivePage()}
      </div>
    </div>
  );
}
