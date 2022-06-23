import React, { useState, useEffect } from "react";
import EstructuraTabla from "./components/EstructuraTabla";
import Layout from "../Layout/index";
import Axios from "../../config/axios";
import { Col, Container, Row } from "reactstrap";

const TablaProveedores = () => {

  const [proveedores, setProveedores] = useState([]);
  const [proveedoresFlitrados, setProveedoresFlitrados] = useState([]);

  // Trae la lista de proveedores de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const proveedores = await Axios.get("/api/proveedores");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setProveedores(proveedores.data.rows);
        setProveedoresFlitrados(proveedores.data.rows);
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
              <h3 className="page-title">Proveedores</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla
              proveedores={proveedores}
              proveedoresFlitrados={proveedoresFlitrados}
              setProveedoresFlitrados={setProveedoresFlitrados}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaProveedores;
