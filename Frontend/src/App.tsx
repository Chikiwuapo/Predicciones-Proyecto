import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

import Dashboard from '@/pages/Dashboard/Dashboard';
import Home from '@/pages/Home/Home';
import Stats from '@/pages/Stats/Stats';
import Profile from '@/pages/Settings/Profile';
import Users from '@/pages/Settings/Users';
import Vinos from '@/pages/Vinos/Vinos';
import Abandono from '@/pages/Abandono/Abandono';
import FacialLogin from '@/auth/FacialLogin';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <div style={{ height: '100vh' }}>
            <FacialLogin onLogin={handleLogin} />
          </div>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="clasificacion-vinos" element={<Vinos />} />
          <Route path="abandono" element={<Abandono />} />
          <Route path="estadisticas" element={<Stats />} />
          
          {/* Nested settings routes */}
          <Route path="configuraciones">
            <Route index element={<Navigate to="perfil" replace />} />
            <Route path="perfil" element={<Profile />} />
            <Route path="usuarios" element={<Users />} />
          </Route>
          
          {/* Redirect any unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {isAuthenticated && <ThemeToggle />}
    </BrowserRouter>
  );
}

export default App;