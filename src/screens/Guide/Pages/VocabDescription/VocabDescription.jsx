import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import image1 from "./addVocab.png";

import "./VocabDescription.scss";

const VocabDescription = ({ setCanContinue }) => {
  const { t } = useTranslation();

  const bulletPoints = t("screens.guide.vocabDescription.bulletPoints", {
    returnObjects: true,
  });

  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  return (
    <div className="vocab-description">
      <div className="images">
        <img src={image1} alt="" />
      </div>
      <div className="description">
        <h1 className="heading">{t("global.vocabs")}</h1>
        <p>{t("screens.guide.vocabDescription.heading")}</p>
        <ul>
          {bulletPoints.map((bulletPoint, index) => (
            <li key={index}>{bulletPoint}</li>
          ))}
        </ul>
        <p className="end-text">
          {t("screens.guide.vocabDescription.endText")}
        </p>
      </div>
    </div>
  );
};

export default VocabDescription;
