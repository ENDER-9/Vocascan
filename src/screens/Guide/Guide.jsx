import React, { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router";

import Button from "../../Components/Button/Button.jsx";
import { SelectOptionWithFlag } from "../../Components/Form/Select/Select.jsx";
import Modal from "../../Components/Modal/Modal.jsx";
import SlideShow from "../../Components/SlideShow/SlideShow.jsx";
import GroupForm from "../../Forms/GroupForm/GroupForm.jsx";
import PackageForm from "../../Forms/PackageForm/PackageForm.jsx";
import VocabForm from "../../Forms/VocabForm/VocabForm.jsx";
import End from "./Pages/End/End.jsx";
import GroupDescription from "./Pages/GroupDescription/GroupDescription.jsx";
import PackageDescription from "./Pages/PackageDescription/PackageDescription.jsx";
import Start from "./Pages/Start/Start.jsx";
import VocabDescription from "./Pages/VocabDescription/VocabDescription.jsx";

import useSnack from "../../hooks/useSnack.js";
import { closeGuide } from "../../redux/Actions/login.js";

import "./Guide.scss";

const Guide = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { showSnack } = useSnack();
  const history = useHistory();

  const isFirstLogin = useSelector((state) => state.login.firstLogin);
  const [show, setShow] = useState(false);

  const [canContinue, setCanContinue] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [fallbackPackage, setFallbackPackage] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [fallbackGroup, setFallbackGroup] = useState(null);

  const [fallbackVocab, setFallbackVocab] = useState(null);

  const [hasPackage, setHasPackage] = useState(false);
  const [hasGroup, setHasGroup] = useState(false);
  const [hasVocab, setHasVocab] = useState(false);

  useEffect(() => {
    setShow(isFirstLogin);
  }, [isFirstLogin]);

  const onEnd = useCallback(() => {
    setCanContinue(false);
    setSelectedPackage(null);
    setFallbackPackage(null);
    setSelectedGroup(null);
    setFallbackGroup(null);
    setFallbackVocab(null);
    setHasPackage(false);
    setHasGroup(false);
    setHasVocab(false);
    dispatch(closeGuide());

    //reload windows in order to show up created package
    history.replace("/");
  }, [dispatch, history]);

  const packageAdded = useCallback(
    (newPackage) => {
      setFallbackPackage({
        name: newPackage.name,
        code: newPackage.code,
        foreignWordLanguage: newPackage.foreignWordLanguage,
        translatedWordLanguage: newPackage.translatedWordLanguage,
        vocabsPerDay: newPackage.vocabsPerDay,
        rightWords: newPackage.rightWords,
      });
      setSelectedPackage({
        value: newPackage.id,
        label: (
          <SelectOptionWithFlag
            name={newPackage.name}
            foreignLanguageCode={newPackage.foreignWordLanguage}
            translatedLanguageCode={newPackage.translatedWordLanguage}
          />
        ),
      });
      showSnack("success", t("screens.firstStartup.savePackageSuccessMessage"));
      setHasPackage(true);
      setCanContinue(true);
    },
    [setCanContinue, showSnack, t]
  );

  const groupAdded = useCallback(
    (newGroup) => {
      setFallbackGroup({
        name: newGroup.name,
        description: newGroup.description,
        active: newGroup.active,
      });
      setSelectedGroup({ value: newGroup.id, label: newGroup.name });
      showSnack("success", t("screens.firstStartup.saveGroupSuccessMessage"));
      setCanContinue(true);
      setHasGroup(true);
    },
    [setCanContinue, showSnack, t]
  );

  const vocabAdded = useCallback(
    (newVocab) => {
      setFallbackVocab({
        name: newVocab.name,
        Translations: newVocab.translations,
        description: newVocab.description,
        active: newVocab.active,
        activate: newVocab.activate,
      });
      setHasVocab(true);
      showSnack("success", t("screens.firstStartup.saveVocabSuccessMessage"));
      setCanContinue(true);
    },
    [setCanContinue, showSnack, t]
  );

  const onLoadPackageForm = useCallback(() => {
    if (!hasPackage) {
      setCanContinue(false);
    }
  }, [hasPackage, setCanContinue]);

  const onLoadGroupForm = useCallback(() => {
    if (!hasGroup) {
      setCanContinue(false);
    }
  }, [hasGroup, setCanContinue]);

  const onLoadVocabForm = useCallback(() => {
    if (!hasVocab) {
      setCanContinue(false);
    }
  }, [hasVocab, setCanContinue]);

  const guidePages = [
    <Start setCanContinue={setCanContinue} />,
    <PackageDescription setCanContinue={setCanContinue} />,
    <PackageForm
      onSubmitCallback={packageAdded}
      defaultData={fallbackPackage}
      onLoad={onLoadPackageForm}
      canSave={!hasPackage}
    />,
    <GroupDescription setCanContinue={setCanContinue} />,
    <GroupForm
      fixedPackage
      defaultData={fallbackGroup}
      selectedPackage={selectedPackage}
      onSubmitCallback={groupAdded}
      onLoad={onLoadGroupForm}
      canSave={!hasGroup}
    />,
    <VocabDescription setCanContinue={setCanContinue} />,
    <VocabForm
      onSubmitCallback={vocabAdded}
      defaultData={fallbackVocab}
      packageId={selectedPackage?.value}
      groupId={selectedGroup?.value}
      onLoad={onLoadVocabForm}
      canSave={!hasVocab}
      clearOnSubmit={false}
    />,
    <End setCanContinue={setCanContinue} />,
  ];

  if (!isFirstLogin) {
    return null;
  }

  return (
    <Modal
      open={show}
      onClose={() => setShow(false)}
      renderClose={false}
      closeOnEscape={false}
      size="large"
    >
      <div className="skip-button">
        <Button block uppercase variant={"outline"} onClick={() => onEnd()}>
          {t("global.skip")}
        </Button>
      </div>

      <SlideShow pages={guidePages} onEnd={onEnd} canContinue={canContinue} />
    </Modal>
  );
};

export default Guide;
