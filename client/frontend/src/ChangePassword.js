import {useState, useRef} from "react";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function ChangePassword()
{
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  
  const rCurrentPassword = useRef();
  const rNewPassword = useRef();
  const rConfirmPassword = useRef();
  
  const navigate = useNavigate();
  
  const hCurrentPassword = (event) => {setCurrentPassword(event.target.value)};
  const hNewPassword = (event) => {setNewPassword(event.target.value)};
  const hConfirmPassword = (event) => {setConfirmPassword(event.target.value)};
  
  const changePassword = (event) => {
    event.preventDefault();
    
    if(isChanging) return; // Prevent double submission
    
    const userEmail = localStorage.getItem("userEmail");
    
    if(!userEmail)
    {
      toast.error("Please login first", {autoClose:1000});
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    
    if(currentPassword === "")
    {
      toast.error("Enter current password", {autoClose:1000});
      setCurrentPassword("");
      rCurrentPassword.current.focus();
      return;
    }
    
    if(newPassword === "")
    {
      toast.error("Enter new password", {autoClose:1000});
      setNewPassword("");
      rNewPassword.current.focus();
      return;
    }
    
    if(newPassword.length < 6)
    {
      toast.error("Password must be at least 6 characters", {autoClose:1000});
      setNewPassword("");
      rNewPassword.current.focus();
      return;
    }
    
    if(confirmPassword === "")
    {
      toast.error("Confirm your password", {autoClose:1000});
      setConfirmPassword("");
      rConfirmPassword.current.focus();
      return;
    }
    
    if(newPassword !== confirmPassword)
    {
      toast.error("Passwords do not match", {autoClose:1000});
      setConfirmPassword("");
      rConfirmPassword.current.focus();
      return;
    }
    
    if(currentPassword === newPassword)
    {
      toast.error("New password must be different from current password", {autoClose:2000});
      setNewPassword("");
      setConfirmPassword("");
      rNewPassword.current.focus();
      return;
    }
    
    setIsChanging(true);
    
    let url = "https://campus-mart-irke.onrender.com/change-password";
    // let url = "http://localhost:1234/change-password";
    let data = {email: userEmail, currentPassword, newPassword};
    
    axios.post(url, data)
    .then(res => {
      if(res.data.message)
      {
        toast.success(res.data.message, {autoClose:1500});
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Log out the user after successful password change
        setTimeout(() => {
          toast.info("Please login with your new password", {autoClose:2000});
          
          // Clear all user data from localStorage
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          
          // Redirect to login page
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }, 1500);
      }
    })
    .catch(err => {
      setIsChanging(false);
      
      if(err.response && err.response.data.error)
      {
        toast.error(err.response.data.error, {autoClose:2000});
      }
      else
      {
        toast.error("Password change failed", {autoClose:2000});
      }
    });
  }
  
  return(
    <>
      <ToastContainer/>
      <h1> Change Password </h1>
      <form onSubmit={changePassword}>
        <label> Current Password: </label> <br/>
        <input 
          type="password" 
          placeholder="enter current password" 
          onChange={hCurrentPassword} 
          ref={rCurrentPassword} 
          value={currentPassword}
          disabled={isChanging}
        /> <br/><br/>
        
        <label> New Password: </label> <br/>
        <input 
          type="password" 
          placeholder="enter new password (min 6 characters)" 
          onChange={hNewPassword} 
          ref={rNewPassword} 
          value={newPassword}
          disabled={isChanging}
        /> <br/><br/>
        
        <label> Confirm New Password: </label> <br/>
        <input 
          type="password" 
          placeholder="confirm new password" 
          onChange={hConfirmPassword} 
          ref={rConfirmPassword} 
          value={confirmPassword}
          disabled={isChanging}
        /> <br/><br/>
        
        <input 
          type="submit" 
          value={isChanging ? "Changing Password..." : "Change Password"}
          disabled={isChanging}
        />
      </form>
    </>
  );
}

export default ChangePassword;