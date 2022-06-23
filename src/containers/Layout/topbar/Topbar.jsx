import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import TopbarSidebarButton from './TopbarSidebarButton';
import TopbarNotification from './TopbarNotification';
import TopbarProfile from './TopbarProfile';

const Topbar = ({ changeMobileSidebarVisibility, changeSidebarVisibility, notificaciones }) => (
  <div className="topbar">
    <div className="topbar__wrapper">
      <div className="topbar__left">
        <TopbarSidebarButton
          changeMobileSidebarVisibility={changeMobileSidebarVisibility}
          changeSidebarVisibility={changeSidebarVisibility}
        />
        <Link className="topbar__logo" to="/inicio" />
      </div>
      <div className="topbar__right">
          <TopbarNotification notificaciones={notificaciones} />
          <TopbarProfile />
      </div>
    </div>
  </div>
);

Topbar.propTypes = {
  changeMobileSidebarVisibility: PropTypes.func.isRequired,
  changeSidebarVisibility: PropTypes.func.isRequired,
};

export default Topbar;
