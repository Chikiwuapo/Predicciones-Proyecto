import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

const Placeholder = ({ title }: { title: string }) => <h1>{title}</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          {/* index -> Inicio */}
          <Route index element={<Placeholder title="Inicio" />} />

          {/* Rutas principales */}
          <Route path="reportes" element={<Placeholder title="Cáncer de mama" />} />
          <Route path="calendario" element={<Placeholder title="Clasificación multiclases" />} />
          {/* Si deseas un Reportes general separado, cambia la ruta o ajusta el Sidebar */}

          {/* Configuraciones */}
          <Route path="configuraciones">
            <Route path="pagos" element={<Placeholder title="Pagos" />} />
            <Route path="perfil" element={<Placeholder title="Perfil" />} />
            <Route path="sistema" element={<Placeholder title="Sistema" />} />
            <Route path="usuarios" element={<Placeholder title="Usuarios" />} />
          </Route>
        </Route>

        {/* Redirección para rutas inexistentes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;