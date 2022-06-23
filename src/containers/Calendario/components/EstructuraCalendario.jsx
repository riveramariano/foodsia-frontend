import React, { useState } from "react";
import { Card, CardBody, Col } from "reactstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useHistory } from "react-router-dom";
import Axios from "../../../config/axios";
import EditarEvento from "./EditarEvento";

// Cambiar de idioma al calendario
require("moment/locale/es.js");
const localizer = momentLocalizer(moment);
const formats = { dayFormat: (date, culture) => localizer.format(date, "DD", culture) };

const EstructuraCalendario = ({ eventos, tiposEvento, empleados }) => {

  const [abrirModal, setModal] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [evento, setEvento] = useState();
  const history = useHistory();

  // Función que retorna un evento de la base de datos
  const seleccionarEvento = async (data) => {
    const evento = await Axios.get(`/api/eventos/${data.id}/${data.start}/${data.end}`);
    return evento.data;
  };

  const abrirEvento = (evento) => {
    seleccionarEvento(evento).then((response) => {
      setEvento(response.evento);
      ["Ausencia Empleado", "Festividad"].includes(response.evento.tipoEvento.label)
        ? setReadonly(false)
        : setReadonly(true);
      setModal(true);
      history.push(`/calendario?id=${response.evento.id}`);
    });
  };

  return (
    <Col md={12} lg={12} xl={9}>
      <Card>
        <CardBody>

          {/* Calendario */}
          <div className={`calendar`}>
            <Calendar
              localizer={localizer}
              events={eventos}
              views={['month']}
              popup
              formats={formats}
              step={60}
              timeslots={1}
              showMultiDayTimes
              eventPropGetter={(event) => ({
                style:
                  event.priority === "Cumpleaños Mascota"
                    ? { backgroundColor: "#238484" }
                    : event.priority === "Festividad"
                    ? { backgroundColor: "#c5384b" }
                    : event.priority === "Aniversario Cliente"
                    ? { backgroundColor: "#3d89cc" }
                    : event.priority === "Aniversario GPF"
                    ? { backgroundColor: "#d4b32d" }
                    : event.priority === "Ausencia Empleado"
                    ? { backgroundColor: "#8884d8" }
                    : event.priority === "Entrega Pedido"
                    ? { backgroundColor: "#ca5d1d" }
                    : null,
              })}
              onSelectEvent={abrirEvento}
              messages={{
                previous: <span className="lnr lnr-chevron-left" />,
                next: <span className="lnr lnr-chevron-right" />,
                today: <span className="lnr lnr-calendar-full" />,
                showMore: function showMore(total) {
                  return `+${total} más`;
                }
              }}
            />

            {/* Modal actualizar evento */}
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
          </div>

        </CardBody>
      </Card>
    </Col>
  );
};

export default EstructuraCalendario;
