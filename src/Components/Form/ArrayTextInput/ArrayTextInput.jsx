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
  inputProps,
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

  useEffect(() => {
    const listener = (event) => {
      if (event.keyCode === 40) {
        event.preventDefault();
        addArrayData();
      }
      if (event.keyCode === 38) {
        event.preventDefault();
        if (arrayData.length === 1) {
          return;
        }
        setArrayData((lastItems) =>
          lastItems.filter((item, i) => i !== arrayData.length - 1)
        );
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [addArrayData, arrayData.length, removeArrayData]);

  return (
    <>
      {arrayData.map((elem, key) => {
        return (
          <div key={elem.id} className="array-input-wrapper">
            <TextInput
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
              {...inputProps}
            />
            <Button
              tabIndex={-1}
              disabled={!key}
              appearance="red"
              type="button"
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
          type="button"
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
