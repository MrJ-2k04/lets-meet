
// React
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Context Providers
import { AuthContextProvider } from 'services/context/AuthContext';
// Hooks
import { useAuth } from "services/hooks/useAuth";
// Components
import FourDotLoader from "components/Loaders/FourDotLoader";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthContextProvider>
    <Router>
      <App />
    </Router>
  </AuthContextProvider>
);

function Router({ children }) {
  const { authIsReady } = useAuth()
  return (
    <div className="App">
      {/* <OneTapLogin /> */}
      {authIsReady &&
        <BrowserRouter>
          {children}
        </BrowserRouter>
      }
      {!authIsReady && <FourDotLoader />}
    </div>
  );
}