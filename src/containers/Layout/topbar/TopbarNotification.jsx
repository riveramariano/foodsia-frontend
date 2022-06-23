import React, { useState } from "react";
import { Collapse } from "reactstrap";
import NotificationsIcon from "mdi-react/NotificationsIcon";
import CumpleañosMascota from "../../../shared/img/notificaciones/mascota.png";
import Festividad from "../../../shared/img/notificaciones/festividad.png";
import AniversarioCliente from "../../../shared/img/notificaciones/aniversario.jpg";
import AniversarioGPF from "../../../shared/img/notificaciones/isotipo.png";
import AusenciaEmpleado from "../../../shared/img/notificaciones/ausencia.png";
import EntregaPedido from "../../../shared/img/notificaciones/entrega.png";

const TopbarNotification = ({ notificaciones }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleNotification = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="topbar__collapse">
      <button className="topbar__btn topbar__btn--mail topbar__btn--new" type="button" onClick={toggleNotification}>
        <NotificationsIcon />
        <div className="topbar__btn-new-label">
          <div />
        </div>
      </button>
      {isCollapsed && (<button className="topbar__back" aria-label="topbar__back" type="button" onClick={toggleNotification} />)}
      <Collapse isOpen={isCollapsed} className="topbar__collapse-content">
        <div className="topbar__collapse-title-wrap">
          <p className="topbar__collapse-title">Notificaciones</p>
        </div>

        {/* Lista de notificaciones */}
        {notificaciones.map((notificacion) => (
          <div className="topbar__collapse-item" key={notificacion.id}>
            <div className="topbar__collapse-img-wrap">
              {notificacion.tipoEvento === "CumpleañosMascota" && (
                <img
                  className="topbar__collapse-img"
                  src={CumpleañosMascota}
                  alt="imagen-notificacion"
                />
              )}
              {notificacion.tipoEvento === "Festividad" && (
                <img
                  className="topbar__collapse-img"
                  src={Festividad}
                  alt="imagen-notificacion"
                />
              )}
              {notificacion.tipoEvento === "AniversarioCliente" && (
                <img
                  className="topbar__collapse-img"
                  src={AniversarioCliente}
                  alt="imagen-notificacion"
                />
              )}
              {notificacion.tipoEvento === "AniversarioGPF" && (
                <img
                  className="topbar__collapse-img"
                  src={AniversarioGPF}
                  alt="imagen-notificacion"
                />
              )}
              {notificacion.tipoEvento === "AusenciaEmpleado" && (
                <img
                  className="topbar__collapse-img"
                  src={AusenciaEmpleado}
                  alt="imagen-notificacion"
                />
              )}
              {notificacion.tipoEvento === "EntregaPedido" && (
                <img
                  className="topbar__collapse-img"
                  src={EntregaPedido}
                  alt="imagen-notificacion"
                />
              )}
            </div>
            <p className="topbar__collapse-message">
              {notificacion.tipoEvento === "CumpleañosMascota" && (
                <span className="topbar__collapse-name-green">
                  Cumpleaños Mascota
                </span>
              )}
              {notificacion.tipoEvento === "Festividad" ? (
                <span className="topbar__collapse-name-red">
                  Festividad
                </span>
              ) : (
                ""
              )}
              {notificacion.tipoEvento === "AniversarioCliente" && (
                <span className="topbar__collapse-name-blue">
                  Aniversario Cliente
                </span>
              )}
              {notificacion.tipoEvento === "AniversarioGPF" && (
                <span className="topbar__collapse-name-yellow">
                  Aniversario GPF
                </span>
              )}
              {notificacion.tipoEvento === "AusenciaEmpleado" && (
                <span className="topbar__collapse-name-purple">
                  Ausencia Empleado
                </span>
              )}
              {notificacion.tipoEvento === "EntregaPedido" && (
                <span className="topbar__collapse-name-orange">
                  Entrega Pedido
                </span>
              )}
              {notificacion.mensaje}
            </p>
          </div>
        ))}

        {!notificaciones.length 
          ? <p className="topbar__collapse-item font-weight-bold">No hay notificaciones.</p> 
          : null
        }
  
      </Collapse>
    </div>
  );
};

export default TopbarNotification;
