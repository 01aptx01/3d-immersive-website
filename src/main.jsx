import React, { lazy, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const KeyboardApp = lazy(() => import('./worlds/keyboard/App.jsx'));
const KigumiRoute = lazy(() => import('./worlds/kigumi/Route.jsx'));
const Home = lazy(() => import('./worlds/home/Home.jsx'));

function WorldRouter() {
  const params = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname;
  const queryWorld = params.get('world');
  const routeWorld = pathname === '/world/kigumi' || queryWorld === 'kigumi'
    ? 'kigumi'
    : pathname === '/world/keyboard' || queryWorld === 'mechanical-garden' || queryWorld === 'keyboard'
      ? 'mechanical-garden'
      : 'home';
  useEffect(() => {
    document.title = routeWorld === 'kigumi' ? 'Kigumi Pavilion · Immersive-Craft' : routeWorld === 'mechanical-garden' ? 'Mechanical Garden · Immersive-Craft' : 'Immersive-Craft · Worlds to wander';
  }, [routeWorld]);
  return <Suspense fallback={<main className="world-loading" role="status">Entering the world…</main>}>
    {routeWorld === 'kigumi' ? <KigumiRoute /> : routeWorld === 'mechanical-garden' ? <KeyboardApp /> : <Home />}
  </Suspense>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><WorldRouter /></React.StrictMode>);

