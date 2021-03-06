import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import Select, { SelectOptionWithFlag } from "../Form/Select/Select.jsx";

import { languages } from "../../i18n/I18nProvider.js";
import { setLanguage } from "../../redux/Actions/setting.js";

const mapLanguages = ({ code, name }) => ({
  value: code,
  label: <SelectOptionWithFlag name={name} foreignLanguageCode={code} />,
});

const LanguageSelector = () => {
  const language = useSelector((state) => state.setting.language);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <div>
      <Select
        label={t("components.languageSelector.label")}
        value={
          [languages.find(({ code }) => code === language)].map(mapLanguages)[0]
        }
        options={languages.map(mapLanguages)}
        onChange={({ value }) => {
          dispatch(setLanguage({ language: value }));
        }}
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
    </div>
  );
};

export default LanguageSelector;
