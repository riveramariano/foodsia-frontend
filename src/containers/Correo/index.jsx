import React from 'react';
import Logo from '../../shared/img/logo/gpf-logo.png';
import EnviarCorreo from "./components/EnviarCorreo";

const RecuperacionCredenciales = () => (
  <div className="account">
    <div className="account__wrapper">
      <div className="account__card">
        <div className="login_logo mb-4">
          <img src={ Logo } alt="3312"/>
        </div>
        <EnviarCorreo />
        <div className="account__or">
          <p>Recuperación de Credenciales</p>
        </div>
      </div>
    </div>
  </div>
);

export default RecuperacionCredenciales;
