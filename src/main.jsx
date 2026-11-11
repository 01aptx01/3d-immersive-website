import React, { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const KeyboardApp = lazy(() => import('./worlds/keyboard/App.jsx'));
const KigumiRoute = lazy(() => import('./worlds/kigumi/Route.jsx'));

function WorldRouter() {
  const params = new URLSearchParams(window.location.search);
  const routeWorld = window.location.pathname === '/world/kigumi' ? 'kigumi' : params.get('world');
  useEffect(() => {
    document.title = routeWorld === 'kigumi' ? 'Kigumi Pavilion · Immersive-Craft' : 'Mechanical Garden · Immersive-Craft';
  }, [routeWorld]);
  return <Suspense fallback={<main className="world-loading" role="status">Entering the world…</main>}>
    {routeWorld === 'kigumi' ? <KigumiRoute /> : <KeyboardApp />}
  </Suspense>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><WorldRouter /></React.StrictMode>);

