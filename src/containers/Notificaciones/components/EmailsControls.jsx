import React from "react";
import PropTypes from "prop-types";
import MagnifyIcon from "mdi-react/MagnifyIcon";
import PaginationComponent from "../../../shared/components/pagination/PaginationComponent";
import { EmailsProps } from "../../../shared/prop-types/EmailProps";

const EmailsControls = ({ emails, onChangePage, onChangeSelect }) => (
  <div className="inbox__emails-controls-wrap">
    <div className="inbox__emails-controls"></div>
    <div className="inbox__emails-controls-right">
      <div className="inbox__emails-control-search">
        <input placeholder="Search" />
        <div className="inbox__emails-control-search-icon">
          <MagnifyIcon />
        </div>
      </div>
      <PaginationComponent
        items={emails}
        onChangePage={onChangePage}
        initialPage={1}
      />
    </div>
  </div>
);

EmailsControls.propTypes = {
  emails: EmailsProps.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangeSelect: PropTypes.func.isRequired,
};

export default EmailsControls;
