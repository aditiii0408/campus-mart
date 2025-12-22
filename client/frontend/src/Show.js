import {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";

function Show()
{
  const [info, setInfo] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if(!userEmail)
    {
      toast.error("Please login first", {autoClose:1000});
      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }
    
    let url = "https://campus-mart-irke.onrender.com/save";
    // let url = "http://localhost:1234/save";
    axios.get(url)
    .then(res => {
      console.log("Data received:", res.data);
      if(Array.isArray(res.data))
      {
        setInfo(res.data);
        setFilteredInfo(res.data);
      }
      else
      {
        setInfo([]);
        setFilteredInfo([]);
      }
    })
    .catch(err => {
      console.log(err);
      setInfo([]);
      setFilteredInfo([]);
    });
  }, [navigate]);
  
  useEffect(() => {
    filterData();
  }, [selectedCategory, selectedStatus, selectedPriceRange, info]);
  
  const filterData = () => {
  let filtered = info;
  
  // Filter by category
  if(selectedCategory !== "All")
  {
    filtered = filtered.filter(e => e.category === selectedCategory);
  }
  
  // Filter by status
  if(selectedStatus !== "All")
  {
    filtered = filtered.filter(e => e.status === selectedStatus);
  }
  
  // Filter by price range
  if(selectedPriceRange !== "All")
  {
    if(selectedPriceRange === "0-500")
    {
      filtered = filtered.filter(e => parseFloat(e.Price) <= 500);
    }
    else if(selectedPriceRange === "500-1000")
    {
      filtered = filtered.filter(e => parseFloat(e.Price) > 500 && parseFloat(e.Price) <= 1000);
    }
    else if(selectedPriceRange === "1000-2000")
    {
      filtered = filtered.filter(e => parseFloat(e.Price) > 1000 && parseFloat(e.Price) <= 2000);
    }
    else if(selectedPriceRange === "2000-5000")
    {
      filtered = filtered.filter(e => parseFloat(e.Price) > 2000 && parseFloat(e.Price) <= 5000);
    }
    else if(selectedPriceRange === "5000+")
    {
      filtered = filtered.filter(e => parseFloat(e.Price) > 5000);
    }
  }
  
  setFilteredInfo(filtered);
};
  
  const hCategory = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  const hStatus = (event) => {
    setSelectedStatus(event.target.value);
  };
  
  const hPriceRange = (event) => {
    setSelectedPriceRange(event.target.value);
  };
  
  const getStatusColor = (status) => {
    if(status === "Available") return "green";
    if(status === "Reserved") return "orange";
    if(status === "Sold") return "red";
    return "black";
  };
  
  return(
    <>
      <ToastContainer/>
      <h1> Items for Sale </h1>
    
      <div>
        <label style={{marginLeft:"20px" , color:"white"}}> Filter by Category: </label>
        <select onChange={hCategory} value={selectedCategory}>
          <option value="All">All Categories</option>
          <option value="Books">Books</option>
          <option value="Electronics">Electronics</option>
          <option value="Notes">Notes</option>
          <option value="Accessories">Accessories</option>
          <option value="Others">Others</option>
        </select>
        
        <label style={{marginLeft:"20px" , color:"white"}}> Filter by Status: </label>
        <select onChange={hStatus} value={selectedStatus}>
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Sold">Sold</option>
        </select>
        
        <label style={{marginLeft:"20px", color:"white"}}> Filter by Price Range: </label>
        <select onChange={hPriceRange} value={selectedPriceRange}>
          <option value="All">All Prices</option>
          <option value="0-500">Under ₹500</option>
          <option value="500-1000">₹500 - ₹1,000</option>
          <option value="1000-2000">₹1,000 - ₹2,000</option>
          <option value="2000-5000">₹2,000 - ₹5,000</option>
          <option value="5000+">Above ₹5,000</option>
        </select>
      </div>
      <br/>
      
      <table border={5}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Item</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Price</th>
            <th>Status</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {
            filteredInfo.map((e, index) => (
              <tr key={index}>
                <td>
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.Item} style={{width:"100px", height:"100px", objectFit:"cover"}} />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td> {e.Name} </td>
                <td> {e.Item} </td>
                <td> {e.category} </td>
                <td> {e.Condition} </td>
                <td> ₹{e.Price} </td>
                <td style={{color: getStatusColor(e.status), fontWeight:"bold"}}> {e.status} </td>
                <td> {e.Contact} </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      
      {filteredInfo.length === 0 && <p>No items found</p>}
    </>
  );
}

export default Show;