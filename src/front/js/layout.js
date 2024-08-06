import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "./component/scrollToTop";
import { BackendURL } from "./component/backendURL";
import injectContext from "./store/appContext";

import { Home } from "./pages/home.js";

import styles2 from "./component/Layout/Navbar.module.css";
import Navbar from "./component/Layout/Navbar.jsx";
import Footer from "./component/Layout/Footer.jsx";

import LoginReister from "./component/Auth/LoginRegister.jsx";
import PasswordResetRequest from "./component/Auth/PasswordResetRequest.jsx";
import ResetPassword from "./component/Auth/ResetPassword.jsx";
import ConfirmarEmail from "./component/Auth/ConfirmEmail.jsx";

import UserProfile from "./component/Profile/UserProfile.jsx";
import AllPosts from "./pages/AllPosts.jsx";
import ProfileOtherUser from "./component/Profile/ProfileOtherUser.jsx";

//create your first component
const Layout = () => {
  //the basename is used when your project is published in a subdirectory and not in the root of the domain
  // you can set the basename on the .env file located at the root of this project, E.g: BASENAME=/react-hello-webapp/
  const basename = process.env.BASENAME || "";

  if (!process.env.BACKEND_URL || process.env.BACKEND_URL == "")
    return <BackendURL />;

  return (
    <div className={styles2.mainContent}>
      <BrowserRouter basename={basename}>
        <ScrollToTop>
          <Navbar />
          <Routes>
            <Route element={<AllPosts />} path="/" />
            <Route element={<LoginReister />} path="/login-register" />
            <Route element={<UserProfile />} path="/my-account" />
            <Route element={<PasswordResetRequest />} path="/forgot-password" />
            <Route element={<ResetPassword />} path="/reset-password" />
            <Route element={<ConfirmarEmail />} path="/ConfirmEmail" />
            <Route element={<ProfileOtherUser />} path="/profile/:username" />

            <Route element={<h1>Not found!</h1>} />
          </Routes>
          <Footer />
        </ScrollToTop>
      </BrowserRouter>
    </div>
  );
};

export default injectContext(Layout);
