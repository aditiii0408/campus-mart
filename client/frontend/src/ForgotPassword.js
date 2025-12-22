import {useState, useRef} from "react";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function ForgotPassword()
{
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const rEmail = useRef();
  const rCode = useRef();
  const rNewPassword = useRef();
  const rConfirmPassword = useRef();
  
  const navigate = useNavigate();
  
  const hEmail = (event) => {setEmail(event.target.value)};
  const hResetCode = (event) => {setResetCode(event.target.value)};
  const hNewPassword = (event) => {setNewPassword(event.target.value)};
  const hConfirmPassword = (event) => {setConfirmPassword(event.target.value)};
  
  const generateCode = (event) => {
    event.preventDefault();
    
    if(email.trim() === "")
    {
      toast.error("Enter email", {autoClose:1000});
      setEmail("");
      rEmail.current.focus();
      return;
    }
    
    let url = "https://campus-mart-irke.onrender.com/forgot-password";
    // let url = "http://localhost:1234/forgot-password";
    let data = {email};
    
    toast.info("Sending reset code...", {autoClose:1000});
    
    axios.post(url, data)
    .then(res => {
      toast.success("Reset code sent to your email!", {autoClose:3000});
      setStep(2);
    })
    .catch(err => {
      if(err.response && err.response.data.error)
      {
        toast.error(err.response.data.error, {autoClose:2000});
      }
      else
      {
        toast.error("Failed to send reset code", {autoClose:2000});
      }
    });
  }
  
  const resetPassword = (event) => {
    event.preventDefault();
    
    if(resetCode.trim() === "")
    {
      toast.error("Enter reset code", {autoClose:1000});
      setResetCode("");
      rCode.current.focus();
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
    
    // let url = "https://campus-mart-irke.onrender.com/reset-password";
    let url = "http://localhost:1234/reset-password";
    let data = {email, resetCode, newPassword};
    
    axios.post(url, data)
    .then(res => {
      if(res.data.message)
      {
        toast.success(res.data.message, {autoClose:1000});
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    })
    .catch(err => {
      if(err.response && err.response.data.error)
      {
        toast.error(err.response.data.error, {autoClose:2000});
      }
      else
      {
        toast.error("Password reset failed", {autoClose:2000});
      }
    });
  }
  
  return(
    <>
      <ToastContainer/>
      <h1> Campus Mart - Forgot Password </h1>
      
      {step === 1 && (
        <form onSubmit={generateCode}>
          <label> Enter Your Email: </label> <br/>
          <input type="email" placeholder="enter email" onChange={hEmail} ref={rEmail} value={email} /> <br/><br/>
          
          <input type="submit" value="Send Reset Code" />
          
          <p style={{textAlign:"center", color:"#6b7280", fontSize:"14px", marginTop:"15px"}}>
            📧 We'll send a 6-digit code to your email
          </p>
        </form>
      )}
      
      {step === 2 && (
        <>
          <div style={{textAlign:"center", backgroundColor:"#dbeafe", padding:"15px", margin:"20px auto", maxWidth:"600px", borderRadius:"8px"}}>
            <p style={{margin:"0", fontSize:"16px", fontWeight:"600", color:"#1e40af"}}>
              ✉️ Reset code sent to: <strong>{email}</strong>
            </p>
            <p style={{margin:"10px 0 0 0", fontSize:"14px", color:"#6b7280"}}>
              Check your email inbox (or spam folder) and enter the code below
            </p>
          </div>
          
          <form onSubmit={resetPassword}>
            <label> Email: </label> <br/>
            <input type="email" value={email} readOnly style={{backgroundColor:"#f3f4f6"}} /> <br/><br/>
            
            <label> Enter Reset Code (from email): </label> <br/>
            <input type="text" placeholder="enter 6-digit code" onChange={hResetCode} ref={rCode} value={resetCode} maxLength="6" /> <br/><br/>
            
            <label> Enter New Password: </label> <br/>
            <input type="password" placeholder="enter new password" onChange={hNewPassword} ref={rNewPassword} value={newPassword} /> <br/><br/>
            
            <label> Confirm New Password: </label> <br/>
            <input type="password" placeholder="confirm new password" onChange={hConfirmPassword} ref={rConfirmPassword} value={confirmPassword} /> <br/><br/>
            
            <input type="submit" value="Reset Password" />
          </form>
        </>
      )}
      
      <p> Remember your password? <a href="/login">Login here</a> </p>
    </>
  );
}

export default ForgotPassword;