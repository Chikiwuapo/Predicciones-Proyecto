import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Home from '@/pages/Home/Home';
import Stats from '@/pages/Stats/Stats';
import Profile from '@/pages/Settings/Profile';
import Users from '@/pages/Settings/Users';
import Vinos from '@/pages/Vinos/Vinos';
import Abandono from '@/pages/Abandono/Abandono';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
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
    </BrowserRouter>
  );
}

export default App;