import {useState, useRef, useEffect} from "react";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function Home()
{
  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");
  const [price, setPrice] = useState("");
  const [mail, setMail] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const rName = useRef();
  const rItem = useRef();
  const rPrice = useRef();
  const rMail = useRef();
  const rImage = useRef();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");
    
    if(!userEmail)
    {
      toast.error("Please login first", {autoClose:1000});
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }
    else
    {
      setName(userName || "");
      setMail(userEmail || "");
    }
  }, [navigate]);
  
  const hName = (event) => {setName(event.target.value)};
  const hItem = (event) => {setItem(event.target.value)};
  const hCategory = (event) => {setCategory(event.target.value)};
  const hCondition = (event) => {setCondition(event.target.value)};
  const hPrice = (event) => {setPrice(event.target.value)};
  const hMail = (event) => {setMail(event.target.value)};
  
  const hImage = (event) => {
    const file = event.target.files[0];
    if(file)
    {
      if(file.size > 5000000) // 5MB limit
      {
        toast.error("Image size should be less than 5MB", {autoClose:2000});
        event.target.value = null; // Reset file input
        return;
      }
      
      // Validate file type
      if(!file.type.startsWith('image/'))
      {
        toast.error("Please upload a valid image file", {autoClose:2000});
        event.target.value = null;
        return;
      }
      
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error("Failed to read image", {autoClose:2000});
      };
      reader.readAsDataURL(file);
    }
  };
  
  const save = (event) => {
    event.preventDefault();
    
    if(isSubmitting) return; // Prevent double submission
    
    // Validation
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
    
    if(item.trim() === "")
    {
      toast.error("Enter item", {autoClose:1000});
      setItem("");
      rItem.current.focus();
      return;
    }
    
    if(!item.match(/^[A-Za-z0-9 ]+$/))
    {
      toast.error("Enter valid item name", {autoClose:1000});
      setItem("");
      rItem.current.focus();
      return;
    }
    
    if(price === "" || price <= 0)
    {
      toast.error("Enter valid price", {autoClose:1000});
      setPrice("");
      rPrice.current.focus();
      return;
    }
    
    if(mail === "")
    {
      toast.error("Enter mail", {autoClose:1000});
      setMail("");
      rMail.current.focus();
      return;
    }
    
    if(!image)
    {
      toast.error("Upload an image", {autoClose:1000});
      rImage.current.focus();
      return;
    }
    
    setIsSubmitting(true);
    
    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => {
      const base64Image = reader.result;
      
      let url = "https://campus-mart-irke.onrender.com/save";
      // let url = "http://localhost:1234/save";

      let data = {
        name, 
        item, 
        category, 
        condition, 
        price, 
        mail, 
        image: base64Image
      };
      
      console.log("Submitting data:", {
        ...data,
        image: base64Image.substring(0, 50) + "..." // Log truncated image
      });
      
      axios.post(url, data)
      .then(res => {
        console.log("Success response:", res.data);
        setMsg("Item added successfully!");
        toast.success("Item added!", {autoClose:1000});
        
        // Reset form
        setItem("");
        setPrice("");
        setCategory("Books");
        setCondition("Good");
        setImage(null);
        setImagePreview("");
        if(rImage.current) rImage.current.value = null;
        
        setIsSubmitting(false);
        
        setTimeout(() => {
          setMsg("");
          navigate("/mylistings"); // Redirect to see the new listing
        }, 1500);
      })
      .catch(err => {
        console.error("Error adding item:", err);
        console.error("Error response:", err.response?.data);
        
        if(err.response && err.response.data && err.response.data.error)
        {
          toast.error(err.response.data.error, {autoClose:2000});
        }
        else
        {
          toast.error("Failed to add item. Please try again.", {autoClose:2000});
        }
        setMsg("");
        setIsSubmitting(false);
      });
    };
    
    reader.onerror = () => {
      toast.error("Failed to process image", {autoClose:2000});
      setIsSubmitting(false);
    };
  }
  
  return(
    <>
      <ToastContainer/>
      <h1> Campus Mart </h1>
      
      <form onSubmit={save}>
        <label> Your Name: </label> <br/>
        <input type="text" value={name} onChange={hName} ref={rName} readOnly /> <br/><br/>
        
        <label> Enter Item to Sell: </label> <br/>
        <input type="text" placeholder="enter item name" onChange={hItem} ref={rItem} value={item} /> <br/><br/>
        
        <label> Select Category: </label> <br/>
        <select onChange={hCategory} value={category}>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Notes">Notes</option>
          <option value="Accessories">Accessories</option>
          <option value="Others">Others</option>
        </select> <br/><br/>
        
        <label> Select Condition of Item: </label> <br/>
        <input type="radio" name="C" value="Great" onChange={hCondition} checked={condition === "Great"} /> Great 
        <input type="radio" name="C" value="Good" onChange={hCondition} checked={condition === "Good"} /> Good 
        <input type="radio" name="C" value="Mid" onChange={hCondition} checked={condition === "Mid"} /> Mid 
        <input type="radio" name="C" value="Poor" onChange={hCondition} checked={condition === "Poor"} /> Poor <br/><br/>
        
        <label> Specify Selling Price: </label> <br/>
        <input type="number" placeholder="enter price" onChange={hPrice} ref={rPrice} value={price} min="1" /> <br/><br/>
        
        <label> Your Contact Email: </label> <br/>
        <input type="email" value={mail} onChange={hMail} ref={rMail} readOnly /> <br/><br/>
        
        <label> Upload Item Image: </label> <br/>
        <input type="file" accept="image/*" onChange={hImage} ref={rImage} /> <br/><br/>
        
        {imagePreview && (
          <>
            <label> Image Preview: </label> <br/>
            <img src={imagePreview} alt="preview" style={{width:"200px", height:"200px", objectFit:"cover", border:"1px solid #ccc"}} /> <br/><br/>
          </>
        )}
        
        <input type="submit" value={isSubmitting ? "Adding Item..." : "Add Item"} disabled={isSubmitting} />
        <h2 style={{color: msg ? "green" : "black"}}> {msg} </h2>
      </form>
    </>
  );
}

export default Home;