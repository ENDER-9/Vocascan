import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import Button from "../../Components/Button/Button.jsx";
import TextInput from "../../Components/Form/TextInput/TextInput.jsx";
import ServerValidIndicator from "../../Components/Indicators/ServerValidIndicator/ServerValidIndicator.jsx";
import UnauthenticatedLayout from "../../Components/Layout/UnauthenticatedLayout/UnauthenticatedLayout.jsx";

import { setLanguages } from "../../redux/Actions/language.js";
import { setServerUrl, signIn } from "../../redux/Actions/login.js";
import { login, getLanguages } from "../../utils/api.js";
import { maxTextfieldLength } from "../../utils/constants.js";

import "./Login.scss";

const Login = ({ image }) => {
  const { t } = useTranslation();

  const serverAddress = useSelector((state) => state.login.serverAddress);
  const selfHosted = useSelector((state) => state.login.selfHosted);
  const languages = useSelector((state) => state.language.languages);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverAddressInput, setServerAddressInput] = useState(serverAddress);
  const [error, setError] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [isServerValid, setIsServerValid] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  const handleClickRegister = useCallback(() => {
    history.push("/register");
  }, [history]);

  //fetch languages
  const fetchLanguages = useCallback(() => {
    // when array is empty no languages were stored. Then add them to the store
    if (languages.length === 0) {
      getLanguages({ nativeNames: true }).then((res) => {
        dispatch(
          setLanguages({
            languages: res.data,
          })
        );
      });
    }
  }, [dispatch, languages.length]);

  //make api call to login
  const submitLogin = useCallback(
    async (e) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      login({
        email,
        password,
      })
        .then((response) => {
          setError(false);

          //store username, email and jwt token in redux store
          dispatch(
            signIn({
              username: response.data.user.username,
              email,
              token: response.data.token,
            })
          );
          //fetch languages from server
          fetchLanguages();
        })
        .catch((event) => {
          if (
            event.response?.status === 401 ||
            event.response?.status === 404
          ) {
            setServerError(false);
            setError(true);
            return;
          }

          setServerError(true);
        });
    },
    [canSubmit, dispatch, email, fetchLanguages, password]
  );

  useEffect(() => {
    if (selfHosted && !serverAddress) {
      setCanSubmit(false);

      return;
    }

    setCanSubmit(!(!email || !password || !isServerValid));
  }, [email, password, selfHosted, serverAddress, isServerValid]);

  useEffect(() => {
    try {
      const { origin } = new URL(serverAddressInput);

      dispatch(setServerUrl({ serverAddress: origin }));
    } catch (err) {}
  }, [dispatch, serverAddressInput]);

  return (
    <UnauthenticatedLayout>
      <div className="login-form">
        <ArrowBackIcon
          className="back-icon"
          onClick={() => history.push("/plans")}
        />
        <div className="header">
          <img className="header-logo" src={image} alt="server-logo" />
          <h1 className="login-form-header-heading">
            {t("screens.login.title")}
          </h1>
        </div>
        <form onSubmit={submitLogin}>
          <div className="form-input">
            <TextInput
              autoFocus
              required
              placeholder={t("global.email")}
              onChange={(value) => {
                setError(false);
                setEmail(value);
              }}
              value={email}
              maxLength={maxTextfieldLength}
            />
            <TextInput
              required
              type="password"
              placeholder={t("global.password")}
              autoComplete="current-password"
              onChange={(value) => {
                setError(false);
                setPassword(value);
              }}
              value={password}
              error={error}
              errorText={t("screens.login.wrongCredentials")}
              maxLength={maxTextfieldLength}
            />
            {selfHosted && (
              <TextInput
                required
                placeholder={t("global.server")}
                onChange={(value) => {
                  setServerError(false);
                  setServerAddressInput(value);
                }}
                value={serverAddressInput}
                maxLength={maxTextfieldLength}
              />
            )}
            {serverError ? (
              <p className="form-error">{t("global.serverNotResponding")}</p>
            ) : (
              <ServerValidIndicator setValid={setIsServerValid} />
            )}
          </div>
          <div className="login-footer">
            <Button block uppercase onClick={submitLogin} disabled={!canSubmit}>
              {t("global.signIn")}
            </Button>
            <div className="submit-register">
              {t("screens.login.dontHaveAccount")}{" "}
              <div
                className="submit-register-link"
                onClick={handleClickRegister}
              >
                {t("global.signUp")}
              </div>
            </div>
          </div>
        </form>
      </div>
    </UnauthenticatedLayout>
  );
};

export default Login;
