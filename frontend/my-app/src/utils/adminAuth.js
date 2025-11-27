// Admin Authentication Helper

export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

export const setAdminToken = (token) => {
  localStorage.setItem('adminToken', token);
};

export const removeAdminToken = () => {
  localStorage.removeItem('adminToken');
};

export const getAdminUser = () => {
  const user = localStorage.getItem('adminUser');
  return user ? JSON.parse(user) : null;
};

export const setAdminUser = (user) => {
  localStorage.setItem('adminUser', JSON.stringify(user));
};

export const removeAdminUser = () => {
  localStorage.removeItem('adminUser');
};

export const isAdminLoggedIn = () => {
  return !!getAdminToken();
};

export const logoutAdmin = () => {
  removeAdminToken();
  removeAdminUser();
};

export default {
  getAdminToken,
  setAdminToken,
  removeAdminToken,
  getAdminUser,
  setAdminUser,
  removeAdminUser,
  isAdminLoggedIn,
  logoutAdmin
};