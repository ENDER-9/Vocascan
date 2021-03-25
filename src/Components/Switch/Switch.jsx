import React from "react";

import "./Switch.scss";

const Switch = ({
  disabled = false,
  onChange = () => null,
  optionRight = "insert a label",
  switcher = false,
  optionLeft = null,
  checked = false,
  label = null,
}) => {
  return (
    <div className="switch-wrapper">
      <h3>{label}</h3>
      <div className="switch-wrapper-inner">
        {switcher && optionLeft && <label className="label-left">{optionLeft}</label>}
        <label className={`switch ${disabled ? "disabled" : ""}`}>
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider"></span>
        </label>
        {optionRight && <label className="label-right">{optionRight}</label>}
      </div>
    </div>
  );
};

export default Switch;