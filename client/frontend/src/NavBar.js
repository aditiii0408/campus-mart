import {Link, useNavigate, useLocation} from "react-router-dom";
import {toast} from "react-toastify";
import {useEffect, useState} from "react";

function NavBar()
{
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const name = localStorage.getItem("userName");
    
    if(userEmail)
    {
      setIsLoggedIn(true);
      setUserName(name);
    }
    else
    {
      setIsLoggedIn(false);
    }
  }, [location]);
  
  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    toast.success("Logged out successfully", {autoClose:1000});
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }
  
  return(
    <>
      <nav style={{backgroundColor:"#333", padding:"10px", marginBottom:"20px"}}>
        <span style={{color:"white", marginRight:"20px", fontSize:"18px", fontWeight:"bold"}}>
          Campus Mart
        </span>
        
        {!isLoggedIn ? (
          <>
            <Link to="/login" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> Login </Link>
            <Link to="/register" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> Register </Link>
          </>
        ) : (
          <>
            <Link to="/home" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> Add Item </Link>
            <Link to="/show" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> All Items </Link>
            <Link to="/mylistings" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> My Listings </Link>
            <Link to="/change-password" style={{color:"white", marginRight:"15px", textDecoration:"none"}}> Change Password </Link> {/* ✅ Add this */}
            
            <span style={{color:"white", marginRight:"15px"}}>
              Welcome, {userName}!
            </span>
            
            <button 
              onClick={logout} 
              style={{
                backgroundColor:"#ff4444", 
                color:"white", 
                border:"none", 
                padding:"5px 15px", 
                cursor:"pointer",
                borderRadius:"3px"
              }}
            > 
              Logout 
            </button>
          </>
        )}
      </nav>
    </>
  );
}

export default NavBar;