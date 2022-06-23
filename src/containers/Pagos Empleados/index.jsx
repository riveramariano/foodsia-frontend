import React, { useEffect, useState } from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import Axios from "../../config/axios";
import EstructuraTabla from "./components/EstructuraTabla";

const TablaPagos = () => {
  const [pagoEmpleados, setPagoEmpleados] = useState([]);
  const [pagoEmpleadosFiltrados, setPagoEmpleadosFiltrados] = useState([]);
  const [reportePagoEmpleados, setReportePagoEmpleados] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  // Trae la lista de los pagos a los empleados, empleados de la db
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const pagoEmpleados = await Axios.get("/api/pagoEmpleados");
      const empleados = await Axios.get("/api/pagoEmpleados/lista/empleados");
      const reportePagoEmpleados = await Axios.get("/api/pagoEmpleados/reporte");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setPagoEmpleados(pagoEmpleados.data.rows);
        setPagoEmpleadosFiltrados(pagoEmpleados.data.rows);
        setEmpleados(empleados.data.empleados);
        setReportePagoEmpleados(reportePagoEmpleados.data.data);
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
                <h3 className="page-title">Pagos Empleados</h3>
              </Col>
            </Row>
            <Row>
              <EstructuraTabla
                pagoEmpleados={pagoEmpleados}
                reportePagoEmpleados={reportePagoEmpleados}
                empleados={empleados}
                pagoEmpleadosFiltrados={pagoEmpleadosFiltrados}
                setPagoEmpleadosFiltrados={setPagoEmpleadosFiltrados}
              />
            </Row>
          </Container>
        </div>
    </div>
  );
};

export default TablaPagos;
