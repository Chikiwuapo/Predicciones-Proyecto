import {
  AddressBook,
  CalendarDots,
  ChartBar,
  FileDoc,
  House,
  Nut,
  Person,
} from '@phosphor-icons/react';
import { ConfigProvider, Menu } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../routes/AuthContext';
import Style from './Menu.module.css';
export default function MenuDashboard() {
  const { userRole } = useAuth();
  const [isMenuMode, setIsMenuMode] = useState(window.innerHeight > 804);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsMenuMode(window.innerHeight > 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = [
    {
      key: '1',
      label: <Link to="/Inicio"> Inicio </Link>,
      icon: (
        <div className={Style.icon}>
          <House />
        </div>
      ),
    },
    {
      key: '2',
      label: 'Pacientes',
      icon: (
        <div className={Style.icon}>
          <Person />
        </div>
      ),
      children: [
        {
          key: '3',
          label: <Link to="pacientes"> Pacientes</Link>,
        },
        {
          key: '5',
          label: <Link to="citas"> Citas</Link>,
        },
        {
          key: '6',
          label: <Link to="citasCompletas"> Citas completas</Link>,
        },
      ],
    },
    {
      key: '7',
      label: 'Terapeutas',
      icon: (
        <div className={Style.icon}>
          <AddressBook />
        </div>
      ),
      children: [
        {
          key: '8',
          label: <Link to="terapeutas"> Terapeutas</Link>,
        },
      ],
    },
    {
      key: '9',
      label: <Link to="reportes"> Reportes </Link>,
      icon: (
        <div className={Style.icon}>
          <FileDoc />
        </div>
      ),
    },
    {
      key: '10',
      label: <Link to="calendar"> Calendario </Link>,
      icon: (
        <div className={Style.icon}>
          <CalendarDots />
        </div>
      ),
    },
    {
      key: '11',
      label: <Link to="estadisticas"> Estadisticas </Link>,
      icon: (
        <div className={Style.icon}>
          <ChartBar />
        </div>
      ),
    },
    {
      key: '12',
      label: 'Configuraciones',
      icon: (
        <div className={Style.icon}>
          <Nut />
        </div>
      ),
      children: [
        ...(userRole === 1
          ? [
              {
                key: '33',
                label: <Link to="configPagos">Pagos</Link>,
              },
            ]
          : []),
        {
          key: '16',
          label: <Link to="configPerfil">Perfil</Link>,
        },
        ...(userRole === 1
          ? [
              {
                key: '17',
                label: <Link to="configSistema">Sistema</Link>,
              },
              {
                key: '14',
                label: <Link to="configUser">Usuarios</Link>,
              },
            ]
          : []),
      ],
    },
  ];

  //////Funciones para tener solo 1 submenu abierto/////////
  const [stateOpenKeys, setStateOpenKeys] = useState([]);
  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1,
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };
  const getLevelKeys = (items1) => {
    const key = {};
    const func = (items2, level = 1) => {
      items2.forEach((item) => {
        if (item.key) {
          key[item.key] = level;
        }
        if (item.children) {
          func(item.children, level + 1);
        }
      });
    };
    func(items1);
    return key;
  };
  const levelKeys = getLevelKeys(items);
  //////////////////////////////////////////////////////////

  /////Funciones para cambiar el modo del menu/////////////

  ////////////////////////////////////////////////////////
  return (
    <div className={Style.menuContainer}>
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemMarginInline: 0,
              iconSize: 18,
              itemColor: '#ffffff',
              itemHoverColor: '#ffffff',
              itemHoverBg: '#19803885',
              itemSelectedColor: '#ffffff',
              itemSelectedBg: '#1CB54A',
              itemActiveBg: '#1CB54A',
              subMenuItemSelectedColor: '#8ad366',
              itemSelectedColor: '#ffffff',
            },
            menuItem: {
              color: '#ffffff',
              backgroundColor: '#1E1E1E',
            },
          },
          token: {
            colorBgBase: '#1E1E1E+',
          },
        }}
      >
        <Menu
          mode={isMenuMode ? 'inline' : 'vertical'}
          items={items}
          style={{
            borderInlineEnd: 'none',
            backgroundColor: '#1E1E1E',
          }}
          defaultSelectedKeys={['1']}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
        />
      </ConfigProvider>
      <div style={{ marginTop: 'auto', padding: 16, textAlign: 'center' }}>
        <button className={Style.buttontheme}
          type="button"
          onClick={toggleTheme}
          style={{
            background: '#ffffff',
            border: '1px solid #888',
            color: 'black',
            fontWeight: 'bolder',
            borderRadius: 6,
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'}
        </button>
      </div>
    </div>
  );
}
