import React, { useContext } from "react";
import Logo from "../../shared/img/logo/gpf-logo.png";
import { Link } from "react-router-dom";
import AuthContext from "../../context/authContext";

const Error404 = () => {

  // Extraer la información de autenticación
  const authContext = useContext(AuthContext)
  const { usuario } = authContext;  

  return (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card-404">
          <div className="login_logo mb-4">
            <img src={Logo} alt="3312" />
          </div>
          <h2 className="text-center">Página no encontrada 404</h2>
          <h5 className="text-center mt-2">
            La página que estás buscando no existe o ha ocurrido un error.
          </h5>
          {usuario && (usuario[0].nombreTipoUsuario === 'Administrador' || usuario[0].nombreTipoUsuario === 'Superadmin')
            ? (<Link className="mt-5" to="/inicio">
                <h5 className="text-center mt-4 go-back-404">Regresar a inicio</h5>
              </Link>)
            : (<Link className="mt-5" to="/lista/clientes">
                <h5 className="text-center mt-4 go-back-404">Regresar a lista clientes</h5>
              </Link>)
          }
        </div>
      </div>
    </div>
  );
}

export default Error404;
