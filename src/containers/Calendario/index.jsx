import React, { useState, useEffect } from 'react';
import Axios from "../../config/axios";
import Layout from "../Layout/index";
import { Col, Container, Row } from 'reactstrap';
import EstructuraCalendario from './components/EstructuraCalendario';
import ListaEventos from './components/ListaEventos';

const Calendario = () => {

  const [eventos, setEventos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // Trae la lista de eventos, empleados y tipos de eventos de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const eventos = await Axios.get("/api/eventos");
      const tiposEvento = await Axios.get("/api/tiposEvento");
      const empleados = await Axios.get("/api/eventos/lista/empleados");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setEventos(eventos.data.eventosCalendario);
        setTiposEvento(tiposEvento.data.tiposEvento);
        setEmpleados(empleados.data.empleados);
      }
    })();
    return () => (isMounted = false); // Cancelar subscripciones asíncronas si el componente está inactivo
  }, []);

  return (
    <div>
      <Layout />
      <div className="container__wrap">
        <Container>
          <Row>
            <Col md={12}>
              <h3 className="page-title">Calendario</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraCalendario
              eventos={eventos}
              tiposEvento={tiposEvento}
              empleados={empleados}
            />
            <ListaEventos 
              tiposEvento={tiposEvento} 
              empleados={empleados} 
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Calendario
