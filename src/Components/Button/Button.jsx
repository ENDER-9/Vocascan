import clsx from "clsx";
import React from "react";

import "./Button.scss";

const Button = ({
  uppercase = false,
  variant = "default",
  disabled = false,
  appearance = "primary",
  block = false,
  onClick = () => null,
  children,
  className = "",
  tabIndex = null,
  type = null,
}) => {
  const classes = clsx(
    "btn",
    `btn-${appearance}`,
    `btn-${variant}`,
    uppercase && "btn-uppercase",
    block && "btn-block",
    disabled && "btn-disabled",
    className
  );

  return (
    <button
      type={type}
      tabIndex={tabIndex}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
};

export default Button;
