import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect, { components } from "react-select";

import Flag from "../../Flag/Flag.jsx";

import "./Select.scss";

export const SelectOptionWithFlag = ({
  name,
  foreignLanguageCode = null,
  translatedLanguageCode = null,
}) => {
  return (
    <span className="custom-option-wrapper">
      <p className="custom-option-wrapper-name">{name}</p>
      <small className="postfix">
        {foreignLanguageCode && (
          <Flag languageCode={foreignLanguageCode} size="small" border />
        )}
        {foreignLanguageCode && translatedLanguageCode && "-"}
        {translatedLanguageCode && (
          <Flag languageCode={translatedLanguageCode} size="small" border />
        )}
      </small>
    </span>
  );
};

const Menu = (props) => {
  const { children, selectProps } = props;

  return (
    <>
      <components.Menu {...props}>
        <div>
          <div>{children}</div>
          {selectProps.createOption ? (
            <button className={"select-create"} onClick={selectProps.onCreate}>
              {selectProps.createText}
            </button>
          ) : null}
        </div>
      </components.Menu>
    </>
  );
};

const Select = ({
  noOptionsMessage = false,
  defaultValue = "",
  multi = false,
  onChange = () => null,
  required = false,
  options = [],
  label = "",
  value,
  disabled = false,
  creatable = false,
  onCreate = () => null,
  createText = "Create",
  ...props
}) => {
  const { t } = useTranslation();

  const [flow, setFlow] = useState(false);
  const [selectOptions, setSelectOptions] = useState(options);

  const handleChange = useCallback(
    (newValue) => {
      onChange(newValue);
    },
    [onChange]
  );

  const handleFocus = () => setFlow(true);

  const onBlur = useCallback(() => {
    setFlow(!!value);
  }, [value]);

  useEffect(() => {
    setFlow(!!value);
  }, [value]);

  useEffect(() => {
    setSelectOptions(options);
  }, [options]);

  return (
    <div
      className={`select-input-container${disabled ? " select-disabled" : ""}`}
    >
      <span className={`select-label ${flow ? "flow" : ""}`}>{`${label}${
        required ? " *" : ""
      }`}</span>
      <ReactSelect
        components={{ Menu }}
        required={required}
        isMulti={multi}
        className="react-select"
        classNamePrefix="react-select"
        options={selectOptions}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        value={value}
        placeholder={false}
        noOptionsMessage={() =>
          noOptionsMessage ? noOptionsMessage : t("global.noOptionMessage")
        }
        createOption={creatable}
        onCreate={onCreate}
        createText={createText}
        styles={{
          input: (provided) => ({
            ...provided,
            margin: 0,
          }),
        }}
        {...props}
      />
    </div>
  );
};

export default Select;
