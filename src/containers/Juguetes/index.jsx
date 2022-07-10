import React, { useState, useEffect, useContext } from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import EstructuraTabla from "./components/EstructuraTabla";
import AuthContext from "../../context/authContext";
import Axios from "../../config/axios";
import { useHistory } from "react-router-dom";

const TablaJuguetes = () => {

  const [juguetes, setJuguetes] = useState([]);
  const [juguetesFlitrados, setJuguetesFlitrados] = useState([]);
  const [productos, setProductos] = useState([]);
  const [tiposMascota, setTiposMascota] = useState([]);
  const history = useHistory();

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext);
  const { usuario } = authContext;

  if (usuario && usuario[0].nombreTipoUsuario === "Empleado") {
    history.push("/error/404");
  }

  // Trae la lista de juguetes y tipos de mascota de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const juguetes = await Axios.get("/api/juguetes");
      const productos = await Axios.get("/api/recetas/lista/productos");
      const tiposMascota = await Axios.get("/api/tiposMascota");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setJuguetes(juguetes.data.rows);
        setJuguetesFlitrados(juguetes.data.rows);
        setProductos(productos.data.rows);
        setTiposMascota(tiposMascota.data.rows.filter((t) => ["Grande", "Mediano", "Pequeño"].includes(t.nombreTipoMascota)));
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
              <h3 className="page-title">Juguetes</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla
              juguetes={juguetes}
              productos={productos}
              tiposMascota={tiposMascota}
              juguetesFlitrados={juguetesFlitrados}
              setJuguetesFlitrados={setJuguetesFlitrados}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaJuguetes;
