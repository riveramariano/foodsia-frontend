import React, { useState, useEffect } from 'react';
import Axios from "../../config/axios";
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import Topbar from './topbar/Topbar';
import Sidebar from './sidebar/Sidebar';

const Layout = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isSidebarShown, setIsSidebarShown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const layoutClass = classNames({
    layout: true,
    "layout--collapse": isSidebarCollapsed,
  });

  const changeSidebarVisibility = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const changeMobileSidebarVisibility = () => {
    setIsSidebarShown(!isSidebarShown);
  };

  // Trae la lista de notificaciones de la bd
  useEffect(() => {
    const realizarPeticiones = async () => {
      const notificaciones = await Axios.get("/api/eventos/lista/notificaciones/filtradas/proximidad");
      setNotificaciones(notificaciones.data.notificaciones);
    };
    realizarPeticiones();
  }, []);

  return (
    <div className={layoutClass}>
      <Topbar
        changeMobileSidebarVisibility={changeMobileSidebarVisibility}
        changeSidebarVisibility={changeSidebarVisibility}
        notificaciones={notificaciones}
      />
      <Sidebar
        sidebarShow={isSidebarShown}
        sidebarCollapse={isSidebarCollapsed}
        changeMobileSidebarVisibility={changeMobileSidebarVisibility}
      />
    </div>
  );
};

export default withRouter(Layout);
