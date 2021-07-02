import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button.jsx";

import "./VocabCard.scss";

const RenderForeignWord = ({ currVocab, isTranslation }) => {
  return (
    <div className="foreign-word-wrapper">
      {isTranslation ? (
        <p className="description">{currVocab.description}</p>
      ) : null}
      <h1 className={`${isTranslation ? "translations" : ""}`}>
        {currVocab.name}
      </h1>
    </div>
  );
};

const RenderTranslatedWord = ({ currVocab, isTranslation }) => {
  return (
    <div className="translated-word-wrapper">
      {isTranslation ? <p className="my-20">{currVocab.description}</p> : null}
      <div className={`my-20 ${isTranslation ? "translations" : ""}`}>
        {currVocab.Translations.map((el) => el.name).join(", ")}
      </div>
    </div>
  );
};

const VocabCard = ({
  currVocab,
  onCorrect = () => null,
  onWrong = () => null,
  onFlip = () => null,
  currDirection = "default",
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [flip, setFlip] = useState(false);

  const onFlipHandler = useCallback(() => {
    setFlip((prev) => {
      onFlip(!prev);
      return !prev;
    });
  }, [onFlip]);

  return (
    <div className="vocab-card">
      <div className={`card-inner ${flip ? "flipped" : ""}`}>
        <div className="card-front" onClick={onFlipHandler}>
          <div className="card-front-inner">
            {currDirection === "default" ? (
              <RenderForeignWord currVocab={currVocab} isTranslation={false} />
            ) : (
              <RenderTranslatedWord
                currVocab={currVocab}
                isTranslation={false}
              />
            )}
          </div>
        </div>
        <div className="card-back" onClick={onFlipHandler}>
          <div className="card-back-inner">
            {currDirection === "default" ? (
              <RenderTranslatedWord
                currVocab={currVocab}
                isTranslation={true}
              />
            ) : (
              <RenderForeignWord currVocab={currVocab} isTranslation={true} />
            )}
            <div className="continue">
              <Button
                className="card-button"
                appearance="red"
                disabled={disabled}
                onClick={onWrong}
              >
                {t("global.wrong")}
              </Button>
              <Button
                className="card-button"
                appearance="green"
                disabled={disabled}
                onClick={onCorrect}
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
