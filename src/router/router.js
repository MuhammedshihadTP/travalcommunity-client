// src/routes/index.js (or wherever your router config is)
import { createBrowserRouter } from "react-router-dom";
import MiniDrawer from "../components/Drawer";
import PostCard from "../components/PostCard";
import ProfileCard from "../components/ProfileCard";
import Register from "../components/Register";
import Login from "../components/Login";
import ProtectedRoute from "../helpers/ProtectedRoute";


export const router = createBrowserRouter([
  {
    element: <MiniDrawer />,
    children: [
      {
        path: '/',
        element: <ProtectedRoute element={<PostCard />} />,
      },
      {
        path: '/profile',
        element: <ProtectedRoute element={<ProfileCard />} />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);
