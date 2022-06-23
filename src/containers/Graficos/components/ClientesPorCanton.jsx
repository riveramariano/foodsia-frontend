import React, { Fragment } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from '@react-google-maps/api';
import Panel from "../../../shared/components/Panel";

const containerStyle = {
  height: '550px',
};

const center = {
  lat: 9.732898,
  lng: -84.078285,
};

const createKey = (location, index) => location.lat + location.lng + index;

const ClientesPorCanton = ({ clientesCanton }) => {

  const { isLoaded } = useJsApiLoader({
    id: "google-map-id",
  });

  return (
    <Panel lg={12} xl={12} md={12} title={"Número de clientes por cantón"} subhead={`Amplie el mapa para obtener un mejor detalle`}>

      {isLoaded ? (
        <GoogleMap id="clientesPorCanton" mapContainerStyle={containerStyle} center={center} zoom={8}>
          <MarkerClusterer options={clientesCanton}>
            {cluster => clientesCanton.map((location, index) => (
              <Marker key={createKey(location, index)} position={location} clusterer={cluster} />
            ))}
          </MarkerClusterer>
        </ GoogleMap>
      ) : (
        <Fragment />
      )}
  
    </Panel>
  );
};

export default ClientesPorCanton;
