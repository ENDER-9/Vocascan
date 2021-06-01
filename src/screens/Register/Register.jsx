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
import { setServerUrl, register } from "../../redux/Actions/login.js";
import { register as registerAPI, getLanguages } from "../../utils/api.js";
import {
  maxTextfieldLength,
  maxUsernameLength,
} from "../../utils/constants.js";

import "./Register.scss";

const Register = ({ image }) => {
  const { t } = useTranslation();

  const serverAddress = useSelector((state) => state.login.serverAddress);
  const selfHosted = useSelector((state) => state.login.selfHosted);
  const languages = useSelector((state) => state.language.languages);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [serverAddressInput, setServerAddressInput] = useState(serverAddress);
  const [isSamePassword, setIsSamePassword] = useState(true);
  const [usernameIsUsed, setUsernameIsUsed] = useState(false);
  const [emailIsUsed, setEmailIsUsed] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [isServerValid, setIsServerValid] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  const handleClickLogin = useCallback(() => {
    history.push("/login");
  }, [history]);

  // check if typed in passwords are the same
  const checkPassword = useCallback(() => {
    if (password !== passwordRepeat) {
      setIsSamePassword(false);
      return false;
    } else {
      setIsSamePassword(true);
      return true;
    }
  }, [password, passwordRepeat]);

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

  //make api call to register user
  const submitRegisterPerson = useCallback(
    async (e) => {
      e.preventDefault();

      if (!canSubmit) {
        return;
      }

      if (!checkPassword()) {
        return;
      }

      registerAPI({
        username,
        email,
        password,
      })
        .then((response) => {
          dispatch(
            register({
              username: response.data.user.username,
              email,
              token: response.data.token,
            })
          );
          //fetch languages from server
          fetchLanguages();
        })
        .catch((error) => {
          if (error.response?.status === 409) {
            setServerError(false);
            if (
              error.response.data.fields.find((elem) => {
                return elem.field === "username";
              })
            ) {
              setUsernameIsUsed(true);
            } else if (
              error.response.data.fields.find((elem) => {
                return elem.field === "email";
              })
            ) {
              setEmailIsUsed(true);
            }
            return;
          }
          setServerError(true);
        });
    },
    [
      canSubmit,
      checkPassword,
      dispatch,
      email,
      fetchLanguages,
      password,
      username,
    ]
  );

  useEffect(() => {
    if (selfHosted && !serverAddress) {
      setCanSubmit(false);

      return;
    }

    setCanSubmit(
      !(!username || !email || !password || !passwordRepeat || !isServerValid)
    );
  }, [
    username,
    email,
    password,
    passwordRepeat,
    selfHosted,
    serverAddress,
    isServerValid,
  ]);

  useEffect(() => {
    try {
      const { origin } = new URL(serverAddressInput);

      dispatch(setServerUrl({ serverAddress: origin }));
    } catch (err) {}
  }, [dispatch, serverAddressInput]);

  return (
    <UnauthenticatedLayout>
      <div className="register-form">
        <ArrowBackIcon
          className="back-icon"
          onClick={() => history.push("/plans")}
        />
        <div className="register-form-header">
          <img
            className="register-form-header-logo"
            src={image}
            alt="server-logo"
          />
          <h1 className="register-form-header-heading">
            {t("screens.register.title")}
          </h1>
        </div>
        <form onSubmit={submitRegisterPerson}>
          <div className="register-form-input">
            <TextInput
              required
              autoFocus
              placeholder={t("global.username")}
              autoComplete="current-password"
              onChange={(value) => {
                setUsernameIsUsed(false);
                setEmailIsUsed(false);
                setServerError(false);
                setUsername(value);
              }}
              value={username}
              error={usernameIsUsed}
              errorText={t("screens.register.usernameInUse")}
              maxLength={maxUsernameLength}
            />
            <TextInput
              required
              type="email"
              placeholder={t("global.email")}
              onChange={(value) => {
                setEmailIsUsed(false);
                setServerError(false);
                setEmail(value);
              }}
              value={email}
              error={emailIsUsed}
              errorText={t("screens.register.emailInUse")}
              maxLength={maxTextfieldLength}
            />
            <TextInput
              required
              type="password"
              placeholder={t("global.password")}
              onChange={(value) => {
                setIsSamePassword(true);
                setServerError(false);
                setPassword(value);
              }}
              value={password}
              error={!isSamePassword}
              errorText={t("screens.register.passwordsDontMatch")}
              maxLength={maxTextfieldLength}
            />
            <TextInput
              required
              type="password"
              placeholder={t("global.passwordRepeat")}
              onChange={(value) => {
                setIsSamePassword(true);
                setServerError(false);
                setPasswordRepeat(value);
              }}
              value={passwordRepeat}
              error={!isSamePassword}
              errorText={t("screens.register.passwordsDontMatch")}
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
          <div className="register-form-submit">
            <Button
              block
              uppercase
              onClick={submitRegisterPerson}
              disabled={!canSubmit}
            >
              {t("global.signUp")}
            </Button>
            <div className="register-form-submit-register">
              {t("screens.register.alreadyHaveAccount")}{" "}
              <div
                className="register-form-submit-register-link"
                onClick={handleClickLogin}
              >
                {t("global.signIn")}
              </div>
            </div>
          </div>
        </form>
      </div>
    </UnauthenticatedLayout>
  );
};

export default Register;
