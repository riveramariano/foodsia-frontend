import React, { useState } from "react";
import { Card, CardBody, Col, Button, ButtonToolbar, ButtonGroup } from "reactstrap";
import EditarEvento from "./EditarEvento";
import { useHistory } from "react-router-dom";

const ListaEventos = ({ tiposEvento, empleados }) => {

  const [evento, setEvento] = useState({});
  const [readonly, setReadonly] = useState(false);
  const [abrirModal, setModal] = useState(false);

  const history = useHistory();

  // Funcionalidad para abrir el modal versión agregar
  const agregarEvento = () => {
    setEvento({});
    setReadonly(false);
    setModal(true);
    history.push("/calendario?editar=true");
  };

  return (
    <Col md={12} lg={12} xl={3}>

      {/* Lista de eventos */}
      <Card className="card--not-full-height">
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">Lista de Eventos Green Pet Food</h5>
          </div>
          <p className="typography-message">
            <span className="calendar-label calendar-label--green" /> Cumpleaños Mascota
          </p>
          <p className="typography-message">
            <span className="calendar-label calendar-label--red" /> Día Festivo
          </p>
          <p className="typography-message">
            <span className="calendar-label calendar-label--blue" /> Aniversario Cliente
          </p>
          <p className="typography-message">
            <span className="calendar-label calendar-label--yellow" /> Aniversario GPF
          </p>
          <p className="typography-message">
            <span className="calendar-label calendar-label--purple" /> Ausencia Empleado
          </p>
          <p className="typography-message">
            <span className="calendar-label calendar-label--orange" /> Entrega Pedido
          </p>
          <ButtonToolbar>
            <ButtonGroup className="btn-group--justified mt-3">
              <Button color="success" onClick={() => agregarEvento()}>
                Agregar Evento
              </Button>
            </ButtonGroup>
          </ButtonToolbar>
        </CardBody>
      </Card>

      {/* Modal agregar evento */}
      {abrirModal && (
        <EditarEvento
          evento={evento}
          tiposEvento={tiposEvento}
          empleados={empleados}
          abierto={abrirModal}
          readonly={readonly}
          setModal={setModal}
        />
      )}

    </Col>
  );
};

export default ListaEventos;
