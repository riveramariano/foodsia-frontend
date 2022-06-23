import React, { Fragment, useState, useContext, useEffect } from 'react';
import DownIcon from 'mdi-react/ChevronDownIcon';
import { Collapse } from 'reactstrap';
import TopbarMenuLink from './TopbarMenuLink';
import AuthContext from "../../../context/authContext";
import RouteContext from "../../../context/routing/routeContext";
import { NavLink } from 'react-router-dom';

const Ava = `${process.env.PUBLIC_URL}/img/ava.png`;

const TopbarProfile = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext);
  const { usuario, usuarioAutenticado, cerrarSesion } = authContext;

  // Retornar la ruta a la normalidad
  const routeContext = useContext(RouteContext);
  const { rutaActual } = routeContext;

  useEffect(() => {
    usuarioAutenticado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const logOut = () => {
    rutaActual("/inicio");
    cerrarSesion();
  };

  return (
    <div className="topbar__profile">
      <button
        type="button"
        className="topbar__avatar"
        onClick={handleToggleCollapse}
      >
        <img className="topbar__avatar-img" src={Ava} alt="avatar" />
        <p className="topbar__avatar-name">
          {usuario ? (
            <span>
              {usuario[0].nombreUsuario} {usuario[0].primerApellido}
            </span>
          ) : null}
        </p>
        <DownIcon className="topbar__icon" />
      </button>
      {isCollapsed && (
        <button
          type="button"
          aria-label="button collapse"
          className="topbar__back"
          onClick={handleToggleCollapse}
        />
      )}
      <Collapse isOpen={isCollapsed} className="topbar__menu-wrap">
        <div className="topbar__menu">
          {(usuario && usuario[0].nombreTipoUsuario === 'Administrador') || (usuario && usuario[0].nombreTipoUsuario === 'Superadmin') ? (
            <Fragment>
              <TopbarMenuLink title="Inicio" icon="home" path="/inicio" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Clientes" icon="paw" path="/lista/clientes" />
              <TopbarMenuLink title="Calendario" icon="calendar-full" path="/calendario" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Recetas" icon="list" path="/lista/recetas" />
              <TopbarMenuLink title="Juguetes" icon="list" path="/lista/juguetes" />
              <TopbarMenuLink title="Ingredientes" icon="list" path="/lista/ingredientes" />
              <TopbarMenuLink title="Proveedores" icon="list" path="/lista/proveedores" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Pedidos" icon="list" path="/lista/pedidos" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Empleados" icon="list" path="/lista/empleados" />
              <TopbarMenuLink title="Pagos Empleados" icon="list" path="/lista/pagos-empleados" />
              <div className="topbar__menu-divider" />
              <NavLink className="topbar__link" to={"/iniciar-sesion"} onClick={() => logOut()}>
                <span className={`topbar__link-icon lnr lnr-exit`} />
                <p className="topbar__link-title">Cerrar Sesión</p>
              </NavLink>
            </Fragment>
          ) : null}
          {usuario && usuario[0].nombreTipoUsuario === "Empleado" ? (
            <Fragment>
              <TopbarMenuLink title="Clientes" icon="paw" path="/lista/clientes" />
              <TopbarMenuLink title="Calendario" icon="calendar-full" path="/calendario" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Proveedores" icon="list" path="/lista/proveedores" />
              <div className="topbar__menu-divider" />
              <TopbarMenuLink title="Pedidos" icon="list" path="/lista/pedidos" />
              <div className="topbar__menu-divider" />
              <NavLink className="topbar__link" to={"/iniciar-sesion"} onClick={() => logOut()}>
                <span className={`topbar__link-icon lnr lnr-exit`} />
                <p className="topbar__link-title">Cerrar Sesión</p>
              </NavLink>
            </Fragment>
          ) : null}
        </div>
      </Collapse>
    </div>
  );
};

export default TopbarProfile;
