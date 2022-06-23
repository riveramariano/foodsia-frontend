import React, { useState, useEffect } from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import EstructuraTabla from "./components/EstructuraTabla";
import Axios from "../../config/axios";

const TablaPagos = () => {

  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposEntrega, setTiposEntrega] = useState([]);

  // Trae la lista de pedidos, clientes, productos y tipos entrega de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const pedidos = await Axios.get("/api/pedidos");
      const clientes = await Axios.get("/api/clientes");
      const productos = await Axios.get("/api/pedidos/productos");
      const tiposEntrega = await Axios.get("/api/tiposEntrega");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setPedidos(pedidos.data.rows);
        setPedidosFiltrados(pedidos.data.rows);
        setClientes(clientes.data.rows);
        setProductos(productos.data.rows);
        setTiposEntrega(tiposEntrega.data.rows);
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
              <h3 className="page-title">Pedidos</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla
              pedidos={pedidos}
              pedidosFiltrados={pedidosFiltrados}
              setPedidosFiltrados={setPedidosFiltrados}
              clientes={clientes}
              productos={productos}
              tiposEntrega={tiposEntrega}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaPagos;
