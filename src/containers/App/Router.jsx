import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import MainWrapper from './MainWrapper';
import AuthState from '../../context/authState';
import RouteState from '../../context/routing/routeState';
import RutaPrivada from './RutaPrivada';
import LogIn from '../LogIn/index';
import EnviarCorreo from '../Correo/index';
import RecuperarCredenciales from '../Recuperacion/index';
import Error404 from '../Error';
import Graficos from '../Graficos/index';
import TablaClientes from '../Clientes/index';
import Calendario from '../Calendario/index';
import TablaRecetas from '../Recetas/index';
import TablaJuguetes from "../Juguetes/index";
import TablaIngredientes from '../Ingredientes/index';
import TablaProveedores from '../Proveedores/index';
import TablaPedidos from "../Pedidos/index";
import TablaEmpleados from '../Empleados/index';
import TablaPagosEmpleados from '../Pagos Empleados/index';
import TablaNotificaciones from '../Notificaciones/index';

const Router = () => (
  <MainWrapper>
    <main>
      <AuthState>
        <RouteState>
          <Switch>
            <Route exact path="/" component={LogIn} />
            <Route exact path="/iniciar-sesion" component={LogIn} />
            <Route exact path="/enviar-correo" component={EnviarCorreo} />
            <Route exact path="/recuperar-credenciales" component={RecuperarCredenciales} />
            <RutaPrivada exact path="/error/404" component={Error404} />
            <RutaPrivada exact path="/inicio" component={Graficos} />
            <RutaPrivada exact path="/lista/clientes" component={TablaClientes} />
            <RutaPrivada exact path="/calendario" component={Calendario} />
            <RutaPrivada exact path="/lista/recetas" component={TablaRecetas} />
            <RutaPrivada exact path="/lista/juguetes" component={TablaJuguetes} />
            <RutaPrivada exact path="/lista/ingredientes" component={TablaIngredientes} />
            <RutaPrivada exact path="/lista/proveedores" component={TablaProveedores} />
            <RutaPrivada exact path="/lista/pedidos" component={TablaPedidos} />
            <RutaPrivada exact path="/lista/empleados" component={TablaEmpleados} />
            <RutaPrivada exact path="/lista/pagos-empleados" component={TablaPagosEmpleados} />
            <RutaPrivada exact path="/lista/notificaciones" component={TablaNotificaciones} />
            <RutaPrivada path="*"><Redirect to="/error/404" /></RutaPrivada>
          </Switch>
        </RouteState>
      </AuthState>
    </main>
  </MainWrapper>
);

export default Router;
