import logo from './logo.svg';
import './App.css';
import MiniDrawer from './components/Drawer';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { io } from 'socket.io-client';
import getUserIdFromToken from './helpers/TokenDecode';
import 'react-toastify/dist/ReactToastify.css';
function App() {



  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
