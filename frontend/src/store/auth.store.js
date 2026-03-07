import { createStore } from "redux";

const persistedUser = (() => {
  try {
    const raw = localStorage.getItem("movie_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: persistedUser,
  loading: false,
  initialized: Boolean(persistedUser),
  error: "",
};

const SET_LOADING = "auth/setLoading";
const SET_USER = "auth/setUser";
const SET_ERROR = "auth/setError";
const SET_INITIALIZED = "auth/setInitialized";
const CLEAR_AUTH = "auth/clearAuth";

function authReducer(state = initialState, action) {
  switch (action.type) {
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_USER:
      return { ...state, user: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload };
    case SET_INITIALIZED:
      return { ...state, initialized: action.payload };
    case CLEAR_AUTH:
      return { ...state, user: null, loading: false, initialized: true, error: "" };
    default:
      return state;
  }
}

export const authStore = createStore(authReducer);

export const authActions = {
  setLoading: (value) => ({ type: SET_LOADING, payload: value }),
  setUser: (user) => ({ type: SET_USER, payload: user }),
  setError: (message) => ({ type: SET_ERROR, payload: message }),
  setInitialized: (value) => ({ type: SET_INITIALIZED, payload: value }),
  clearAuth: () => ({ type: CLEAR_AUTH }),
};
