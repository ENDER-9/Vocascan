import { CancelToken, Cancel } from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { gte } from "semver";

import LoadingIndicator from "../LoadingIndicator/LoadingIndicator.jsx";

import useDebounce from "../../../hooks/useDebounce.js";
import { getInfo } from "../../../utils/api.js";
import { minServerVersion } from "../../../utils/constants.js";

import "./ServerValidIndicator.scss";

const ServerValidIndicator = ({ setValid }) => {
  const serverAddress = useSelector((state) => state.login.serverAddress);
  const debouncedServerAddress = useDebounce(serverAddress, 500);

  const [isLoading, setIsLoading] = useState(true);
  const [isValidServer, setIsValidServer] = useState(null);
  const [isValidVersion, setIsValidVersion] = useState(null);
  const [isServerResponding, setIsServerResponding] = useState(null);
  const [serverVersion, setServerVersion] = useState(null);

  const timer = useRef(null);

  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(true);
    setIsValidServer(null);
    setIsValidVersion(null);
    setServerVersion(null);

    const cancelToken = CancelToken.source();

    getInfo(cancelToken.token)
      .then((res) => {
        setIsValidServer(res?.data?.identifier === "vocascan-server");
        setIsValidVersion(gte(res?.data?.version, minServerVersion));
        setServerVersion(res?.data?.version);
        setIsServerResponding(true);
      })
      .catch((err) => {
        if (!(err instanceof Cancel)) {
          setIsServerResponding(false);
        }
      })
      .finally(() => {
        timer.current = setTimeout(() => setIsLoading(false), 500);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [debouncedServerAddress]);

  useEffect(() => {
    setValid(
      isValidServer === true &&
        isValidVersion === true &&
        isServerResponding === true
    );
  }, [setValid, isValidServer, isValidVersion, isServerResponding]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  if (isLoading && serverAddress !== "") {
    return <LoadingIndicator position="center" />;
  }

  return (
    <div className="server-valid-indicator">
      {isValidServer === true &&
        isValidVersion === true &&
        isServerResponding === true && (
          <p className="success">
            {t("components.validServerIndicator.validServer", {
              version: serverVersion,
            })}
          </p>
        )}

      {isValidServer === false && (
        <p className="error">
          {t("components.validServerIndicator.serverNotVocascanServer")}
        </p>
      )}

      {isValidVersion === false && (
        <p className="error">
          {t("components.validServerIndicator.versionToOld", {
            version: serverVersion,
            minVersion: minServerVersion,
          })}
        </p>
      )}

      {isServerResponding === false && serverAddress !== "" && (
        <p className="error">
          {t("components.validServerIndicator.serverNotResponding")}
        </p>
      )}
    </div>
  );
};

export default ServerValidIndicator;
