import React from "react";

import InfoIcon from "@material-ui/icons/Info";

import Tooltip from "../../Tooltip/Tooltip.jsx";

import "./Switch.scss";

const Switch = ({
  disabled = false,
  onChange = () => null,
  optionRight = "insert a label",
  infoRight = null,
  switcher = false,
  optionLeft = null,
  infoLeft = null,
  checked = false,
  label = null,
  appearance = "default",
}) => {
  return (
    <div className="switch-wrapper">
      {label && <label className="label-top">{label}</label>}
      <div
        className={`switch-wrapper-inner ${
          switcher && optionRight ? "switcher-left" : ""
        }`}
      >
        {optionLeft && (
          <div className="label-wrapper">
            <label className="label-left">{optionLeft}</label>
            {infoLeft && (
              <InfoIcon
                tabIndex={-1}
                data-tip={infoLeft}
                data-for="switch-tooltip"
                className="info-sign"
              />
            )}
          </div>
        )}
        <label className={`switch ${disabled ? "disabled" : ""}`}>
          <input
            tabIndex={-1}
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          <span className={`slider slider-${appearance}`}></span>
        </label>
        {switcher && optionRight && (
          <div className="label-wrapper">
            {infoRight && (
              <InfoIcon
                data-tip={infoRight}
                data-for="switch-tooltip"
                className="info-sign"
              />
            )}
            <label className="label-right">{optionRight}</label>
          </div>
        )}
      </div>
      <Tooltip id="switch-tooltip" />
    </div>
  );
};

export default Switch;
