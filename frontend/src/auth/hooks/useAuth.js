import { getMe, login, logout, register } from "../services/auth.api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setError, setUser, setInitialized, clearAuth } from "../../store/authSlice";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Reactively grab the auth state from our Redux Toolkit store
  const { user, loading, initialized, error } = useSelector((state) => state.auth);

  async function handleLogin(email, password) {
    dispatch(setLoading(true));
    dispatch(setError(""));
    try {
      const data = await login(email, password);
      const nextUser = data?.user || null;
      
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
      
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
      
      toast.success("Login successful! Welcome back.");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleRegister(username, email, password) {
    dispatch(setLoading(true));
    dispatch(setError(""));
    try {
      const data = await register(username, email, password);
      const nextUser = data?.user || null;
      
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
      
      toast.success("Account created successfully!");
      navigate("/");
    } catch (err) {
      const message = err?.response?.data?.message || "Registration failed";
      dispatch(setError(message));
      toast.error(message);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    dispatch(setLoading(true));
    try {
      await logout();
    } catch (err) {
      console.error("Backend logout failed:", err);
    } finally {
      dispatch(clearAuth());
      toast.info("Logged out successfully");
      navigate("/login");
      dispatch(setLoading(false));
    }
  }

  async function handleGetMe() {
    if (loading) return;
    dispatch(setLoading(true));
    try {
      const data = await getMe();
      const nextUser = data?.user || null;
      
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
      dispatch(setUser(nextUser));
      dispatch(setInitialized(true));
    } catch {
      dispatch(setUser(null));
      dispatch(setInitialized(true));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    user, loading, initialized, error, handleRegister, handleLogin, handleGetMe, handleLogout
  };
};
