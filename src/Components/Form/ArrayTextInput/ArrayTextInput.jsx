import React, { useEffect, useCallback, useState } from "react";
import uniqid from "uniqid";

import AddCircleIcon from "@material-ui/icons/AddCircle";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";

import Button from "../../Button/Button.jsx";
import TextInput from "../TextInput/TextInput.jsx";

import "./ArrayTextInput.scss";

const ArrayTextInput = ({
  data = [],
  max = 10,
  onChange = () => null,
  placeholder = null,
  addText = null,
  required = false,
  maxLength = null,
}) => {
  const [arrayData, setArrayData] = useState(() => {
    if (!data || !data.length) {
      return [
        {
          id: uniqid(),
          value: "",
        },
      ];
    }

    return data.map((elem) => {
      return {
        id: uniqid(),
        value: elem.value,
      };
    });
  });

  const addArrayData = useCallback(() => {
    if (arrayData.length >= max) {
      return;
    }

    setArrayData((trans) => [
      ...trans,
      {
        id: uniqid(),
        value: "",
      },
    ]);
  }, [arrayData, max]);

  const removeArrayData = useCallback((key) => {
    setArrayData((trans) => trans.filter((elem) => elem.id !== key));
  }, []);

  useEffect(() => {
    onChange(arrayData.map((elem) => elem.value));
  }, [arrayData, onChange]);

  useEffect(() => {
    if (!data) {
      setArrayData([
        {
          id: uniqid(),
          value: "",
        },
      ]);
    }
  }, [data]);

  return (
    <>
      {arrayData.map((elem, key) => {
        return (
          <div key={elem.id} className="array-input-wrapper">
            <TextInput
              required={required}
              placeholder={`${key + 1}. ${placeholder ? placeholder : ""}`}
              tabIndex={1}
              onChange={(value) => {
                setArrayData((trans) => {
                  return trans.map((element) =>
                    element.id === elem.id
                      ? {
                          id: elem.id,
                          value,
                        }
                      : element
                  );
                });
              }}
              value={elem.value}
              maxLength={maxLength}
            />
            <Button
              tabIndex={-1}
              disabled={!key}
              appearance="red"
              variant="transparent"
              onClick={() => removeArrayData(elem.id)}
            >
              <RemoveCircleIcon />
            </Button>
          </div>
        );
      })}
      <div className="add-input-wrapper">
        <Button
          tabIndex={-1}
          variant="transparent"
          onClick={addArrayData}
          disabled={arrayData.length >= max}
        >
          <AddCircleIcon />
          {addText && <span className="add-text">{addText}</span>}
        </Button>
      </div>
    </>
  );
};

export default ArrayTextInput;
