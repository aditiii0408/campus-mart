import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Register from "./Register";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ChangePassword from "./ChangePassword";
import Home from "./Home";
import Show from "./Show";
import MyListings from "./MyListings";
import NavBar from "./NavBar";
import "./App.css";

function App()
{
  return(
    <BrowserRouter>
      <ToastContainer />
      <NavBar />
      <div style={{padding:"20px"}}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/show" element={<Show />} />
          <Route path="/mylistings" element={<MyListings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;