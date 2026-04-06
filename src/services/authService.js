import api from "../api/axios";

export const login = async (email, password) => {

  const res = await api.post("/login", {
    email,
    password
  });

  localStorage.setItem("access_token", res.data.access_token);
  localStorage.setItem("refresh_token", res.data.refresh_token);
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const logout = () => {

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  window.location.href = "/login";
};