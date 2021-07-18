import React from "react";
import { NavLink } from "react-router-dom";

import "./NavButton.scss";

const NavButton = ({
  name,
  design = "default",
  link,
  icon = null,
  exact = false,
}) => {
  return (
    <NavLink
      to={link}
      activeClassName="nav-button-active"
      className="nav-button-wrapper"
      exact={exact}
      tabIndex={-1}
    >
      <button tabIndex={-1} className={`nav-button nav-button-${design}`}>
        {icon ? <span className="button-icon">{icon}</span> : null}
        <span className="button-name">{name}</span>
      </button>
    </NavLink>
  );
};

export default NavButton;
