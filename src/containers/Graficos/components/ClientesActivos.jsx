import React, { Fragment } from "react";
import { Card, CardBody, Progress } from "reactstrap";
import Panel from "../../../shared/components/Panel";

const ClientesActivos = ({ data }) => {
  const { numeroClientes, porcentageClientes, clientesTotales, titulo } = data;

  return (
    <Panel md={4} lg={4} xl={4} title={numeroClientes > 0 ?`Número de clientes activos - ${titulo}` : `No hay Datos`} 
      subhead={`Clientes que han realizo un pedido durante el semestre actual`}>
      <Card>
        <CardBody className="dashboard__card-widget">
          <div className="mobile-app-widget">
              {numeroClientes > 0 
              ? <Fragment>
                  <div className="dashboard__stat dashboard__stat--budget">
                    <div className="dashboard__stat-main">
                      <h4 className="dashboard__stat-main-title">Clientes Activos</h4>
                      <p className="dashboard__stat-main-number">{numeroClientes}</p>
                      <p className="dashboard__stat-main-title text-mtr">Clientes Totales: {clientesTotales}</p>
                    </div>
                  </div>
                  <div className="progress-wrap progress-wrap--small progress-wrap--turquoise-gradient progress-wrap--label-top mt-4">
                    <Progress value={porcentageClientes}>
                      <p className="progress__label">{porcentageClientes}%</p>
                    </Progress>
                  </div>
                </Fragment>
              : <Fragment>
                  <div className="dashboard__stat dashboard__stat--budget">
                    <h4 className="dashboard__stat-main-title text-mt mt-3 ml-5">No hay información de clientes disponible.</h4>
                  </div>
                </Fragment>}
          </div>
        </CardBody>
      </Card>
    </Panel>
  );
};

export default ClientesActivos;
