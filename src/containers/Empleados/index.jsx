import React, { useState, useEffect } from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import Axios from "../../config/axios";
import EstructuraTabla from "./components/EstructuraTabla";

const TablaEmpleados = () => {

  const [empleados, setEmpleados] = useState([]);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [ausenciasEmpleados, setAusenciasEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);

  // Trae la lista de empleados, tipos de usuario y ausencias de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const empleados = await Axios.get("/api/empleados");
      const tiposUsuario = await Axios.get("/api/tiposUsuario");
      const ausencias = await Axios.get("/api/empleados/cantidad/ausencias");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setEmpleados(empleados.data.rows);
        setEmpleadosFiltrados(empleados.data.rows);
        setTiposUsuario(tiposUsuario.data.tiposUsuario.filter((t) => t.label !== 'Cliente' && t.label !== 'Superadmin'));
        setAusenciasEmpleados(ausencias.data.data);
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
              <h3 className="page-title">Empleados</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla
              empleados={empleados}
              tiposUsuario={tiposUsuario}
              ausenciasEmpleados={ausenciasEmpleados}
              empleadosFiltrados={empleadosFiltrados}
              setEmpleadosFiltrados={setEmpleadosFiltrados}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaEmpleados;
