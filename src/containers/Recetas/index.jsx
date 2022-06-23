import React, { useState, useEffect, useContext } from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import EstructuraTabla from "./components/EstructuraTabla";
import Axios from "../../config/axios";
import AuthContext from "../../context/authContext";
import { useHistory } from "react-router-dom";

const TablaRecetas = () => {

  const [recetas, setRecetas] = useState([]);
  const [recetasFiltradas, setRecetasFlitradas] = useState([]);
  const [tiposMascota, setTiposMascota] = useState([]);
  const history = useHistory();

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext);
  const { usuario } = authContext;

  if (usuario && usuario[0].nombreTipoUsuario === "Empleado") {
    history.push("/error/404");
  }

  // Trae la lista de recetas y tipos mascota de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const recetas = await Axios.get("/api/recetas");
      const tiposMascota = await Axios.get("/api/tiposMascota");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setRecetas(recetas.data.rows);
        setRecetasFlitradas(recetas.data.rows);
        setTiposMascota(tiposMascota.data.rows.filter((t) => ["Atlético", "Cachorro", "Normal", "Sobrepeso"].includes(t.nombreTipoMascota)));
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
              <h3 className="page-title">Recetas</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla 
              recetas={recetas}
              tiposMascota={tiposMascota} 
              recetasFiltradas={recetasFiltradas}
              setRecetasFiltradas={setRecetasFlitradas}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default TablaRecetas;
