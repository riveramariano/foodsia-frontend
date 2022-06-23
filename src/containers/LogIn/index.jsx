import React from 'react';
import LogInForm from './components/LogInForm';
import Logo from '../../shared/img/logo/gpf-logo.png';

const LogIn = () => {

  sessionStorage.removeItem('token');
  sessionStorage.removeItem('usuario');

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="login_logo">
            <img src={Logo} alt="3312" className="mb-3" />
          </div>
          <LogInForm />
          <div className="account__or">
            <p>Bienvenido</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
