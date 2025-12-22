import {useState, useRef} from "react";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Login()
{
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const rEmail = useRef();
  const rPassword = useRef();
  
  const navigate = useNavigate();
  
  const hEmail = (event) => {setEmail(event.target.value)};
  const hPassword = (event) => {setPassword(event.target.value)};
  
  const login = (event) => {
    event.preventDefault();
    
    if(email.trim() === "")
    {
      toast.error("Enter email", {autoClose:1000});
      setEmail("");
      rEmail.current.focus();
      return;
    }
    
    if(password === "")
    {
      toast.error("Enter password", {autoClose:1000});
      setPassword("");
      rPassword.current.focus();
      return;
    }
    
    let url = "https://campus-mart-irke.onrender.com/login";
    // let url = "http://localhost:1234/login";
    let data = {email, password};
    
    axios.post(url, data)
    .then(res => {
      if(res.data.message)
      {
        toast.success(res.data.message, {autoClose:1000});
        
        // Store user info in localStorage
        localStorage.setItem("userEmail", res.data.email);
        localStorage.setItem("userName", res.data.name);
        
        setTimeout(() => {
          navigate("/home");
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
        toast.error("Login failed", {autoClose:2000});
      }
    });
  }
  
  return(
    <>
      <ToastContainer/>
      <h1> Campus Mart </h1>
      <form onSubmit={login}>
        <label> Enter Email: </label> <br/>
        <input type="email" placeholder="enter email" onChange={hEmail} ref={rEmail} value={email} /> <br/><br/>
        
        <label> Enter Password: </label> <br/>
        <input type="password" placeholder="enter password" onChange={hPassword} ref={rPassword} value={password} /> <br/><br/>
        
        <input type="submit" value="Login" />
      </form>
      
      <p> Don't have an account? <a href="/register">Register here</a> </p>
      <p> <a href="/forgot-password">Forgot Password?</a> </p>

    </>
  );
}




export default Login;