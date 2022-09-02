
// React
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";

// Context Providers
import { AuthContextProvider } from 'services/context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthContextProvider>
    <App />
  </AuthContextProvider>
);


{/* <Route path="/index" element={<Index />} />
  <Route
    path="/nucleo-icons"
    element={<NucleoIcons />}
  />
  <Route
    path="/landing-page"
    element={<LandingPage />}
  />
  <Route
    path="/profile-page"
    element={<ProfilePage />}
  />
  <Route
    path="/login-page"
    element={<LoginPage />}
  /> */}