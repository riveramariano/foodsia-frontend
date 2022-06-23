import React from "react";
import Layout from "../Layout/index";
import { Col, Container, Row } from "reactstrap";
import InboxCard from "./components/InboxCard";

const Notificaciones = () => {
  return (
    <div>
      <Layout />
      <div className="container__wrap">
        <Container>
          <Row>
            <Col md={12}>
              <h3 className="page-title">{"Lista de notificaciones"}</h3>
              <h3 className="page-subhead subhead">
                Aquí se registran todas las notificaciones del sistema
              </h3>
            </Col>
          </Row>
          <Row>
            <InboxCard />
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Notificaciones;
