import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import AddCircleOutlinedIcon from "@material-ui/icons/AddCircleOutlined";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";

import Button from "../../../Components/Button/Button.jsx";
import ConfirmDialog from "../../../Components/ConfirmDialog/ConfirmDialog.jsx";
import Flag from "../../../Components/Flag/Flag.jsx";
import Modal from "../../../Components/Modal/Modal.jsx";
import Table from "../../../Components/Table/Table.jsx";
import PackageForm from "../../../Forms/PackageForm/PackageForm.jsx";

import useSnack from "../../../hooks/useSnack.js";
import {
  getPackages,
  deletePackage,
  exportPackage,
} from "../../../utils/api.js";
import { findLanguageByCode, getLanguageString } from "../../../utils/index.js";
import { nodeRequire } from "../../../utils/index.js";

import "./AllPackages.scss";

const { ipcRenderer } = nodeRequire("electron");

const AllPackages = () => {
  const { t } = useTranslation();
  const { showSnack } = useSnack();

  const [data, setData] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [showExportConfirmationModal, setShowExportConfirmationModal] =
    useState(false);

  const languages = useSelector((state) => state.language.languages);

  const editPackage = useCallback((pack) => {
    setCurrentPackage(pack);
    setShowPackageModal(true);
  }, []);

  const openExportPackage = useCallback((pack) => {
    setCurrentPackage(pack);
    setShowExportConfirmationModal(true);
  }, []);

  const addPackage = useCallback(() => {
    setCurrentPackage(null);
    setShowPackageModal(true);
  }, []);

  const packageSubmitted = useCallback(() => {
    getPackages().then((response) => {
      setShowPackageModal(false);
      setData(response.data);
    });
  }, []);

  const onDeletePckge = useCallback((grp) => {
    setCurrentPackage(grp);
    setShowDeleteConfirmationModal(true);
  }, []);

  const deletePckge = useCallback(() => {
    if (currentPackage) {
      deletePackage(currentPackage.id)
        .then(() => {
          setCurrentPackage(null);
          getPackages().then((response) => {
            setData(response.data);
          });
          setShowDeleteConfirmationModal(false);
          showSnack("success", t("screens.allPackages.deleteSuccessMessage"));
        })
        .catch((e) => {
          showSnack("error", t("screens.allPackages.deleteFailMessage"));
        });
    }
  }, [currentPackage, showSnack, t]);

  const submitExportPackage = useCallback(() => {
    if (currentPackage) {
      exportPackage(currentPackage.id)
        .then((response) => {
          ipcRenderer.send("save-file", {
            title: response.data.name,
            text: JSON.stringify(response.data),
          });
          ipcRenderer.on("save-file-reply", (event, result) => {
            setShowExportConfirmationModal(false);
            showSnack("success", t("screens.allPackages.exportSuccessMessage"));
          });
          return () => {
            ipcRenderer.removeListener("save-file-reply");
          };
        })
        .catch((e) => {
          showSnack("error", t("screens.allPackages.exportFailMessage"));
        });
    }
  }, [currentPackage, showSnack, t]);

  const columns = useMemo(
    () => [
      {
        Header: t("screens.allPackages.packageName"),
        accessor: "name",
        Cell: ({ row }) => (
          <Link
            className="text-normal"
            to={`/library/allGroups/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        Header: t("screens.allPackages.foreignLanguage"),
        accessor: "foreignWordLanguage",
        Cell: ({ row }) => (
          <div className="flag-cell-wrapper">
            <Flag languageCode={row.original.foreignWordLanguage} border />
            {getLanguageString(
              findLanguageByCode(row.original.foreignWordLanguage, languages)
            )}
          </div>
        ),
      },
      {
        Header: t("screens.allPackages.translatedLanguage"),
        accessor: "translatedWordLanguage",
        Cell: ({ row }) => (
          <div className="flag-cell-wrapper">
            <Flag languageCode={row.original.translatedWordLanguage} border />
            {getLanguageString(
              findLanguageByCode(row.original.translatedWordLanguage, languages)
            )}
          </div>
        ),
      },
      {
        Header: t("screens.allPackages.vocabsPerDay"),
        accessor: "vocabsPerDay",
      },
      {
        Header: t("screens.allPackages.rightWords"),
        accessor: "rightWords",
      },
      {
        Header: "",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="action-col">
            <Button
              appearance="primary"
              onClick={() => openExportPackage(row.original)}
            >
              Export
            </Button>
            <Button
              appearance="primary"
              variant="link"
              onClick={() => editPackage(row.original)}
            >
              <EditOutlinedIcon />
            </Button>
            <Button
              appearance="red"
              variant="link"
              onClick={() => onDeletePckge(row.original)}
            >
              <DeleteOutlineIcon />
            </Button>
          </div>
        ),
      },
    ],
    [t, languages, openExportPackage, editPackage, onDeletePckge]
  );

  useEffect(() => {
    getPackages().then((response) => {
      setData(response.data);
    });
  }, []);

  return (
    <>
      <div className="all-packages-wrapper">
        <div className="header-wrapper">
          <h2 className="heading">{t("screens.allPackages.title")}</h2>
          <Button className="add" variant="transparent">
            <AddCircleOutlinedIcon onClick={addPackage} />
          </Button>
        </div>
        <div>
          <Table columns={columns} data={data} />
        </div>
      </div>

      <Modal
        title={
          currentPackage
            ? t("screens.allPackages.editPackage")
            : t("screens.allPackages.addPackage")
        }
        open={showPackageModal}
        onClose={() => setShowPackageModal(false)}
      >
        <PackageForm
          defaultData={currentPackage}
          onSubmitCallback={packageSubmitted}
        />
      </Modal>

      <ConfirmDialog
        title={"Export package"}
        description={t("screens.allPackages.deleteDescription", {
          name: currentPackage?.name,
        })}
        submitText={"Export"}
        onSubmit={submitExportPackage}
        onClose={() => setShowExportConfirmationModal(false)}
        show={showExportConfirmationModal}
      />

      {currentPackage && (
        <ConfirmDialog
          title={t("screens.allPackages.deleteTitle")}
          description={t("screens.allPackages.deleteDescription", {
            name: currentPackage.name,
          })}
          onSubmit={deletePckge}
          onClose={() => setShowDeleteConfirmationModal(false)}
          show={showDeleteConfirmationModal}
        />
      )}
    </>
  );
};

export default AllPackages;
