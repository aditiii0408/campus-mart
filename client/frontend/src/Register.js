import {useState, useRef} from "react";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Register()
{
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const rName = useRef();
  const rEmail = useRef();
  const rPassword = useRef();
  const rConfirmPassword = useRef();
  
  const navigate = useNavigate();
  
  const hName = (event) => {setName(event.target.value)};
  const hEmail = (event) => {setEmail(event.target.value)};
  const hPassword = (event) => {setPassword(event.target.value)};
  const hConfirmPassword = (event) => {setConfirmPassword(event.target.value)};
  
  const register = (event) => {
    event.preventDefault();
    
    if(name.trim() === "")
    {
      toast.error("Enter name", {autoClose:1000});
      setName("");
      rName.current.focus();
      return;
    }
    
    if(!name.match(/^[A-Za-z ]+$/))
    {
      toast.error("Enter valid name", {autoClose:1000});
      setName("");
      rName.current.focus();
      return;
    }
    
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
    
    if(password.length < 6)
    {
      toast.error("Password must be at least 6 characters", {autoClose:1000});
      setPassword("");
      rPassword.current.focus();
      return;
    }
    
    if(confirmPassword === "")
    {
      toast.error("Confirm your password", {autoClose:1000});
      setConfirmPassword("");
      rConfirmPassword.current.focus();
      return;
    }
    
    if(password !== confirmPassword)
    {
      toast.error("Passwords do not match", {autoClose:1000});
      setConfirmPassword("");
      rConfirmPassword.current.focus();
      return;
    }
    
    let url = "https://campus-mart-irke.onrender.com/register";
    // let url = "http://localhost:1234/register";
    let data = {name, email, password};
    
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
        toast.error("Registration failed", {autoClose:2000});
      }
    });
  }
  
  return(
    <>
      <ToastContainer/>
      <h1> Campus Mart - Register </h1>
      <form onSubmit={register}>
        <label> Enter Name: </label> <br/>
        <input type="text" placeholder="enter name" onChange={hName} ref={rName} value={name} /> <br/><br/>
        
        <label> Enter Email: </label> <br/>
        <input type="email" placeholder="enter email" onChange={hEmail} ref={rEmail} value={email} /> <br/><br/>
        
        <label> Enter Password: </label> <br/>
        <input type="password" placeholder="enter password" onChange={hPassword} ref={rPassword} value={password} /> <br/><br/>
        
        <label> Confirm Password: </label> <br/>
        <input type="password" placeholder="confirm password" onChange={hConfirmPassword} ref={rConfirmPassword} value={confirmPassword} /> <br/><br/>
        
        <input type="submit" value="Register" />
      </form>
      
      <p> Already have an account? <a href="/login">Login here</a> </p>
    </>
  );
}

export default Register;