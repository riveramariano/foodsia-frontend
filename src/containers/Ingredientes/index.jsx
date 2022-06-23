import React, { useContext, useEffect, useState } from "react";
import Layout from "../Layout/index";
import Axios from "../../config/axios";
import { Col, Container, Row } from "reactstrap";
import EstructuraTabla from "./components/EstructuraTabla";
import AuthContext from "../../context/authContext";
import { useHistory } from "react-router-dom";

const Ingredientes = () => {	

  const [ingredientes, setIngredientes] = useState([]);
  const [ingredientesFlitrados, setIngredientesFlitrados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [unidades, setUnidades] = useState([]);

  const history = useHistory();

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext);
  const { usuario } = authContext;

  // Trae la lista de ingredientes, proveedores y unidades de la bd
  useEffect(() => {
    let isMounted = true; // Verificar si el componente está activo o no
    (async () => {
      const ingredientes = await Axios.get("/api/ingredientes");
      const proveedores = await Axios.get("/api/proveedores");
      const unidades = await Axios.get("/api/unidades");
      if (isMounted) {
        // Actualizar los states únicamente si el componente está activo
        setIngredientes(ingredientes.data.rows);
        setIngredientesFlitrados(ingredientes.data.rows);
        setProveedores(proveedores.data.rows);
        setUnidades(unidades.data.unidades);
      }
    })();
    return () => (isMounted = false); // Cancelar subscripciones asíncronas si el componente está inactivo
  }, []);

  if (usuario && usuario[0].nombreTipoUsuario === "Empleado") {
    history.push("/error/404");
  }

  return (
    <div>
      <Layout />
      <div className="container__wrap">
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">Ingredientes</h3>
            </Col>
          </Row>
          <Row>
            <EstructuraTabla 
              ingredientes={ingredientes}
              proveedores={proveedores}
              unidades={unidades}
              ingredientesFlitrados={ingredientesFlitrados}
              setIngredientesFlitrados={setIngredientesFlitrados}
            />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Ingredientes;