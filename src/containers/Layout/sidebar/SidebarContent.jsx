import React, { Fragment, useContext, useEffect } from 'react';
import AuthContext from "../../../context/authContext";
import RouteContext from "../../../context/routing/routeContext";
import SidebarLink from './SidebarLink';
import { NavLink } from "react-router-dom";

const SidebarContent = ({ onClick }) => {
  const handleHideSidebar = () => {
    onClick();
  };

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext)
  const { usuarioAutenticado, cerrarSesion, usuario } = authContext;  

  // Retornar la ruta a la normalidad
  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  useEffect(() => {
    usuarioAutenticado();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logOut = () => {
    rutaActual("/inicio");
    cerrarSesion();
  }

  return (
    <div className="sidebar__content">
        <Fragment>
          {(usuario && usuario[0].nombreTipoUsuario === 'Administrador') || (usuario && usuario[0].nombreTipoUsuario === 'Superadmin')
            ? (<ul className="sidebar__block">
                <SidebarLink title="Inicio" icon="home" route="/inicio" onClick={handleHideSidebar} />
              </ul>)
            : null
          } 
          <ul className="sidebar__block">
            <SidebarLink title="Clientes" icon="paw" route="/lista/clientes" onClick={handleHideSidebar} />
            <SidebarLink title="Calendario" icon="calendar-full" route="/calendario" onClick={handleHideSidebar} />
          </ul>
          <ul className="sidebar__block">
            {(usuario && usuario[0].nombreTipoUsuario === 'Administrador') || (usuario && usuario[0].nombreTipoUsuario === 'Superadmin')
              ? (<Fragment>
                  <SidebarLink title="Recetas" icon="list" route="/lista/recetas" onClick={handleHideSidebar} />
                  <SidebarLink title="Juguetes" icon="list" route="/lista/juguetes" onClick={handleHideSidebar} />
                  <SidebarLink title="Ingredientes" icon="list" route="/lista/ingredientes" onClick={handleHideSidebar} />
                </Fragment>)
              : null
            } 
            <SidebarLink title="Proveedores" icon="list" route="/lista/proveedores" onClick={handleHideSidebar} />
          </ul>
          <ul className="sidebar__block">
            <SidebarLink title="Pedidos" icon="list" route="/lista/pedidos" onClick={handleHideSidebar} />
          </ul>
          {(usuario && usuario[0].nombreTipoUsuario === 'Administrador') || (usuario && usuario[0].nombreTipoUsuario === 'Superadmin')
            ? (<ul className="sidebar__block">
                <SidebarLink title="Empleados" icon="list" route="/lista/empleados" onClick={handleHideSidebar} />
                <SidebarLink title="Pagos Empleados" icon="list" route="/lista/pagos-empleados" onClick={handleHideSidebar} />
              </ul>)
            : null
          } 
        </Fragment>
        <Fragment>
          <ul className="sidebar__block">
            <NavLink to={"/iniciar-sesion"} onClick={() => logOut()} activeClassName="sidebar__link-active">
              <li className="sidebar__link">
                <span className={`sidebar__link-icon lnr lnr-exit`} />
                <p className="sidebar__link-title">Cerrar Sesión</p>
              </li>
            </NavLink>
          </ul>
        </Fragment>
    </div>
  );
};

export default SidebarContent;
