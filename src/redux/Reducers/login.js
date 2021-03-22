import { REGISTER, SIGN_IN, SIGN_OUT, SET_SERVER_URL, SET_SELF_HOSTED } from "../Actions";
import { setBaseUrl } from "../../utils/api";
import { vocascanServer } from "../../utils/constants";

const initialState = {
  user: {
    username: "",
    email: "",
    token: "",
  },
  selfHosted: false,
  serverAddress: "",
  isLoggedIn: false,
  firstLogin: false,
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER:
      return {
        ...state,
        user: {
          username: action.payload.username,
          email: action.payload.email,
          token: action.payload.token,
        },
        isLoggedIn: true,
        firstLogin: true,
      };

    case SIGN_IN:
      return {
        ...state,
        user: {
          username: action.payload.username,
          email: action.payload.email,
          token: action.payload.token,
        },
        isLoggedIn: true,
      };

    case SIGN_OUT:
      return {
        ...state,
        user: {
          username: "",
          email: "",
          token: "",
        },
        isLoggedIn: false,
        firstLogin: false,
      };

    case SET_SERVER_URL:
      setBaseUrl(action.payload.serverAddress);

      return {
        ...state,
        serverAddress: action.payload.serverAddress,
      };

    case SET_SELF_HOSTED:
      if (!action.payload.selfHosted) {
        setBaseUrl(vocascanServer);
      } else {
        setBaseUrl(state.serverAddress);
      }

      return {
        ...state,
        selfHosted: action.payload.selfHosted,
      };

    default:
      return state;
  }
};

export default loginReducer;
