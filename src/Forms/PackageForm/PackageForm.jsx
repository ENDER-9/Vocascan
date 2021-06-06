import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Button from "../../Components/Button/Button.jsx";
import Select, {
  SelectOptionWithFlag,
} from "../../Components/Form/Select/Select.jsx";
import TextInput from "../../Components/Form/TextInput/TextInput.jsx";

import useSnack from "../../hooks/useSnack.js";
import { createPackage, modifyPackage } from "../../utils/api.js";
import {
  maxNameLength,
  rightVocabs,
  numberField,
} from "../../utils/constants.js";
import { findLanguageByCode, getLanguageString } from "../../utils/index.js";

import "./PackageForm.scss";

const PackageForm = ({
  defaultData = null,
  onSubmitCallback = null,
  onLoad = null,
  canSave = true,
}) => {
  const { t } = useTranslation();
  const { showSnack } = useSnack();

  const languages = useSelector((state) => state.language.languages);

  const [name, setName] = useState(defaultData ? defaultData.name : "");
  const [foreignLanguage, setForeignLanguage] = useState(
    defaultData
      ? {
          value: defaultData.foreignWordLanguage,
          code: defaultData.code,
          label: (
            <SelectOptionWithFlag
              name={getLanguageString(
                findLanguageByCode(defaultData.foreignWordLanguage, languages)
              )}
              foreignLanguageCode={defaultData.foreignWordLanguage}
            />
          ),
        }
      : ""
  );
  const [translatedLanguage, setTranslatedLanguage] = useState(
    defaultData
      ? {
          value: defaultData.translatedWordLanguage,
          code: defaultData.code,
          label: (
            <SelectOptionWithFlag
              name={getLanguageString(
                findLanguageByCode(
                  defaultData.translatedWordLanguage,
                  languages
                )
              )}
              foreignLanguageCode={defaultData.translatedWordLanguage}
            />
          ),
        }
      : ""
  );
  const [vocabsPerDay, setVocabsPerDay] = useState(
    defaultData ? defaultData.vocabsPerDay : 100
  );
  const [rightTranslations, setRightTranslations] = useState(
    defaultData ? defaultData.rightWords : 2
  );
  const [canSubmit, setCanSubmit] = useState(false);

  //make api call to add vocab package
  const submitHandler = useCallback(async () => {
    if (!canSubmit) {
      return;
    }

    const packageToSave = {
      name: name,
      foreignWordLanguage: foreignLanguage.code,
      translatedWordLanguage: translatedLanguage.code,
      vocabsPerDay: vocabsPerDay,
      rightWords: rightTranslations,
    };

    if (defaultData?.id) {
      packageToSave.id = defaultData.id;

      modifyPackage(packageToSave)
        .then(({ data }) => {
          onSubmitCallback && onSubmitCallback(data);
          showSnack(
            "success",
            t("components.packageForm.modifyPackageSuccessMessage")
          );
        })
        .catch((error) => {
          if (error?.response?.status === 401) {
            console.log("jwt expired");
            showSnack(
              "error",
              t("components.packageForm.modifyPackageFailedMessage")
            );
          }
        });

      return;
    }

    createPackage(packageToSave)
      .then(({ data }) => {
        onSubmitCallback && onSubmitCallback(data);
        showSnack(
          "success",
          t("components.packageForm.savePackageSuccessMessage")
        );
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          console.log("jwt expired");
        }
        showSnack("error", t("components.packageForm.savePackageFailMessage"));
      });
  }, [
    canSubmit,
    defaultData?.id,
    foreignLanguage.code,
    name,
    onSubmitCallback,
    rightTranslations,
    showSnack,
    t,
    translatedLanguage.code,
    vocabsPerDay,
  ]);

  const selectOptions = useMemo(
    () =>
      languages.map((language) => ({
        value: getLanguageString(language),
        code: language.code,
        label: (
          <SelectOptionWithFlag
            name={getLanguageString(language)}
            foreignLanguageCode={language.code}
          />
        ),
      })),
    [languages]
  );

  useEffect(() => {
    setCanSubmit(
      !(
        !name ||
        !foreignLanguage ||
        !translatedLanguage ||
        !vocabsPerDay ||
        !rightTranslations ||
        !canSave
      )
    );
  }, [
    foreignLanguage,
    name,
    rightTranslations,
    translatedLanguage,
    vocabsPerDay,
    canSave,
  ]);

  useEffect(() => {
    onLoad && onLoad();
  }, [onLoad]);

  return (
    <form className="language-package-form" onSubmit={submitHandler}>
      <div className="form-wrapper">
        <TextInput
          required
          placeholder={t("global.name")}
          onChange={(value) => {
            setName(value);
          }}
          value={name}
          maxLength={maxNameLength}
        />

        <div className="dropdown">
          <div className="select-wrapper">
            <Select
              required
              label={t("components.packageForm.foreignLanguage")}
              options={selectOptions}
              onChange={(value) => {
                setForeignLanguage(value);
              }}
              value={foreignLanguage}
            />
          </div>
          <div className="select-wrapper">
            <Select
              required
              label={t("components.packageForm.translatedLanguage")}
              options={selectOptions}
              onChange={(value) => {
                setTranslatedLanguage(value);
              }}
              value={translatedLanguage}
            />
          </div>
        </div>

        <TextInput
          required
          placeholder={t("components.packageForm.vocabsPerDay")}
          onChange={(value) => {
            setVocabsPerDay(value);
          }}
          value={vocabsPerDay}
          type="number"
          max={numberField[1]}
          min={numberField[0]}
        />

        <TextInput
          required
          placeholder={t("components.packageForm.correctTranslationsGoal")}
          onChange={(value) => {
            setRightTranslations(value);
          }}
          value={rightTranslations}
          type="number"
          max={rightVocabs[1]}
          min={rightVocabs[0]}
        />
      </div>

      <Button disabled={!canSubmit} type="submit">
        {t("global.submit")}
      </Button>
    </form>
  );
};

export default PackageForm;
