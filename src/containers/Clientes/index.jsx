import React, { useState, useEffect } from "react";
import EstructuraTabla from "./components/EstructuraTabla";
import Layout from "../Layout/index";
import Axios from "../../config/axios";
import { Col, Container, Row } from "reactstrap";

const TablaClientes = () => {

  const [clientes, setClientes] = useState([]);
  const [clientesFlitrados, setClientesFlitrados] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [frecuenciaPedidos, setFrecuenciaPedidos] = useState([]);

  // Trae la lista de clientes, cantones y frecuencia de pedidos de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const clientes = await Axios.get("/api/clientes");
      const cantones = await Axios.get("/api/cantones");
      const frecuenciaPedidos = await Axios.get("/api/frecuenciaPedidos");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setClientes(clientes.data.rows);
        setClientesFlitrados(clientes.data.rows);
        setCantones(cantones.data.rows);
        setFrecuenciaPedidos(frecuenciaPedidos.data.rows);
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
              <h3 className="page-title">Clientes</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla
              clientes={clientes}
              cantones={cantones}
              frecuenciaPedidos={frecuenciaPedidos}
              clientesFlitrados={clientesFlitrados}
              setClientesFlitrados={setClientesFlitrados}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaClientes;
