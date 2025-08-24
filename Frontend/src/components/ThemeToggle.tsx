import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return null;
  const { theme, toggleTheme } = ctx;

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <span className="theme-toggle__icon" aria-hidden>
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
