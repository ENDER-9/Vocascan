import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useHistory } from "react-router-dom";

import AddCircleOutlinedIcon from "@material-ui/icons/AddCircleOutlined";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";

import Button from "../../../Components/Button/Button.jsx";
import ConfirmDialog from "../../../Components/ConfirmDialog/ConfirmDialog.jsx";
import { SelectOptionWithFlag } from "../../../Components/Form/Select/Select.jsx";
import Modal from "../../../Components/Modal/Modal.jsx";
import Table from "../../../Components/Table/Table.jsx";
import Tooltip from "../../../Components/Tooltip/Tooltip.jsx";
import GroupForm from "../../../Forms/GroupForm/GroupForm.jsx";

import useSnack from "../../../hooks/useSnack.js";
import { getGroups, getPackages, deleteGroup } from "../../../utils/api.js";

import "./AllGroups.scss";

const AllGroups = () => {
  const { t } = useTranslation();
  const { showSnack } = useSnack();
  const history = useHistory();
  const { packageId } = useParams();

  const [data, setData] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const editGroup = useCallback(
    (grp) => {
      getPackages()
        .then(({ data }) => {
          const currPack = data.find((ele) => ele.id === packageId);

          setCurrentPackage({
            value: currPack.id,
            label: (
              <SelectOptionWithFlag
                name={currPack.name}
                foreignLanguageCode={currPack.foreignWordLanguage}
                translatedLanguageCode={currPack.translatedWordLanguage}
              />
            ),
          });
        })
        .then(() => {
          setCurrentGroup(grp);
          setShowGroupModal(true);
        });
    },
    [packageId]
  );

  const addGroup = useCallback(() => {
    getPackages()
      .then(({ data }) => {
        const currPack = data.find((ele) => ele.id === packageId);

        setCurrentPackage({
          value: currPack.id,
          label: (
            <SelectOptionWithFlag
              name={currPack.name}
              foreignLanguageCode={currPack.foreignWordLanguage}
              translatedLanguageCode={currPack.translatedWordLanguage}
            />
          ),
        });
      })
      .then(() => {
        setCurrentGroup(null);
        setShowGroupModal(true);
      });
  }, [packageId]);

  const groupSubmitted = useCallback(() => {
    getGroups(packageId).then((response) => {
      setShowGroupModal(false);
      setData(response.data);
    });
  }, [packageId]);

  const onDeleteGroup = useCallback((grp) => {
    setCurrentGroup(grp);
    setShowDeleteConfirmationModal(true);
  }, []);

  const deleteGrp = useCallback(() => {
    if (currentGroup) {
      deleteGroup(currentGroup.id)
        .then(() => {
          setCurrentGroup(null);
          getGroups(packageId).then((response) => {
            setData(response.data);
          });
          setShowDeleteConfirmationModal(false);
          showSnack("success", t("screens.allGroups.deleteSuccessMessage"));
        })
        .catch((e) => {
          showSnack("error", t("screens.allGroups.deleteFailMessage"));
        });
    }
  }, [currentGroup, packageId, showSnack, t]);

  const columns = useMemo(
    () => [
      {
        Header: t("screens.allGroups.groupName"),
        accessor: "name",
        Cell: ({ row }) => (
          <Link
            className="text-normal"
            to={`/library/allVocabs/${packageId}/${row.original.id}`}
          >
            {row.original.name}
          </Link>
        ),
        headerClassName: "w-25",
      },
      {
        Header: t("screens.allGroups.groupDescription"),
        accessor: "description",
        Cell: ({ row }) => (
          <>
            <p
              className="group-description-cell"
              data-tip={row.original.description}
              data-for={`description-tooltip-${row.original.id}`}
            >
              {row.original.description}
            </p>
            <Tooltip id={`description-tooltip-${row.original.id}`} />
          </>
        ),
        headerClassName: "w-50",
      },
      {
        Header: t("screens.allGroups.active"),
        accessor: "active",
        Cell: ({ row }) => (
          <div style={{ textAlign: "left" }}>
            {row.original.active ? (
              <CheckCircleIcon className="text-success" />
            ) : (
              <RemoveCircleIcon className="text-error" />
            )}
          </div>
        ),
      },
      {
        Header: "",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="action-col">
            <Button variant="link" onClick={() => editGroup(row.original)}>
              <EditOutlinedIcon />
            </Button>
            <Button
              appearance="red"
              variant="link"
              onClick={() => onDeleteGroup(row.original)}
            >
              <DeleteOutlineIcon />
            </Button>
          </div>
        ),
      },
    ],
    [editGroup, onDeleteGroup, packageId, t]
  );

  useEffect(() => {
    getGroups(packageId).then((response) => {
      setData(response.data);
    });
  }, [packageId]);

  return (
    <>
      <div className="all-groups-wrapper">
        <div className="header-wrapper">
          <Button
            className="back"
            variant="transparent"
            onClick={history.goBack}
          >
            <ArrowBackIcon />
          </Button>
          <h2 className="heading">{t("screens.allGroups.title")}</h2>
          <Button className="add" variant="transparent">
            <AddCircleOutlinedIcon onClick={addGroup} />
          </Button>
        </div>
        <div>
          <Table columns={columns} data={data} />
        </div>
      </div>

      <Modal
        title={
          currentGroup
            ? t("screens.allGroups.editGroup")
            : t("screens.allGroups.addGroup")
        }
        open={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      >
        <GroupForm
          fixedPackage
          defaultData={currentGroup}
          selectedPackage={currentPackage}
          onSubmitCallback={groupSubmitted}
        />
      </Modal>

      {currentGroup && (
        <ConfirmDialog
          title={t("screens.allGroups.deleteTitle")}
          description={t("screens.allGroups.deleteDescription", {
            name: currentGroup.name,
          })}
          onSubmit={deleteGrp}
          onClose={() => setShowDeleteConfirmationModal(false)}
          show={showDeleteConfirmationModal}
        />
      )}
    </>
  );
};

export default AllGroups;
