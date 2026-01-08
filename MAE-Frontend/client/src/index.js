import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './style.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Register from './Auth/pages/Register.tsx';
import Test from './components/test/Test.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import Lesson from './components/lesson/Lesson.tsx';
import LoginLinkRequest from './Auth/pages/LoginLinkRequest.tsx';
import CookieTest from './Auth/pages/CookieTest.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import LoginWithLink from './Auth/pages/LoginWithLink.tsx';
import CompleteRegistration from './Auth/pages/CompleteRegistration.tsx';
import { ErrorBoundary } from './components/general/ErrorBoundary.tsx';


//need to figure out route params for test (if it's a lesson/reviews, just one martial art or more)
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Dashboard />
        )
      },
      { path: "/lesson/:martialArtId/:moveId", element: 
        <Lesson />
      }, 
      { path: "register", element: <Register /> },
      { path: "login-link-request", element: <LoginLinkRequest /> },
      { path: "login-with-link", element: <LoginWithLink /> },
      { path: "complete-registration", element: <CompleteRegistration /> }
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
