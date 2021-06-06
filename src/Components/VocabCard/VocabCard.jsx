import React from "react";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button.jsx";

import "./VocabCard.scss";

const RenderForeignWord = ({ currVocab }) => {
  return (
    <div className="foreign-word-wrapper">
      <h1>{currVocab.name}</h1>
    </div>
  );
};

const RenderTranslatedWord = ({ currVocab }) => {
  return (
    <div className="translated-word-wrapper">
      <p className="my-20">{currVocab.description}</p>
      <div className="my-20 translations">
        {currVocab.Translations.map((el) => el.name).join(", ")}
      </div>
    </div>
  );
};

const VocabCard = ({
  currVocab,
  sendVocabCheck,
  onCheck,
  currDirection = "default",
  flip = false,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="vocab-card">
      <div className={`card-inner ${flip ? "flipped" : ""}`}>
        <div className="card-front" onClick={onCheck}>
          <div className="card-front-inner">
            {currDirection === "default" ? (
              <RenderForeignWord currVocab={currVocab} />
            ) : (
              <RenderTranslatedWord currVocab={currVocab} />
            )}
          </div>
        </div>
        <div className="card-back" onClick={onCheck}>
          <div className="card-back-inner">
            {currDirection === "default" ? (
              <RenderTranslatedWord currVocab={currVocab} />
            ) : (
              <RenderForeignWord currVocab={currVocab} />
            )}
            <div className="continue">
              <Button
                className="card-button"
                appearance="red"
                disabled={disabled}
                onClick={() => {
                  sendVocabCheck(currVocab.id, false, true);
                }}
              >
                {t("global.wrong")}
              </Button>
              <Button
                className="card-button"
                appearance="green"
                disabled={disabled}
                onClick={() => {
                  sendVocabCheck(currVocab.id, true, true);
                }}
              >
                {t("global.correct")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabCard;
