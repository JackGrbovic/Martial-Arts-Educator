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
import Register from './pages/Auth/Register.tsx';
import Test from './components/test/Test.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import Lesson from './components/lesson/Lesson.tsx';
import LogIn from './pages/Auth/LogIn.tsx';
import CookieTest from './pages/Auth/CookieTest.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';


//need to figure out route params for test (if it's a lesson/reviews, just one martial art or more)
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      { path: "/lesson/:martialArtId/:moveId", element: 
        <ProtectedRoute>
          <Lesson />
        </ProtectedRoute> 
      }, 
      { path: "register", element: <Register /> },
      { path: "login", element: <LogIn /> },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
