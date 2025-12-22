import {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {toast, ToastContainer} from "react-toastify";

function MyListings()
{
  const [myItems, setMyItems] = useState([]);
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
    
    let url = `https://campus-mart-irke.onrender.com/mylistings?email=${userEmail}`;
      //  let url = `http://localhost:1234/mylistings?email=${userEmail}`;    
    axios.get(url)
    .then(res => {
      if(Array.isArray(res.data))
      {
        setMyItems(res.data);
      }
      else
      {
        setMyItems([]);
      }
    })
    .catch(err => {
      console.log(err);
      setMyItems([]);
    });
  }, [navigate]);
  
  const deleteItem = (id) => {
  const userEmail = localStorage.getItem("userEmail");
  
  if(window.confirm("Are you sure you want to delete this item?"))
  {
    let url = `https://campus-mart-irke.onrender.com/delete/${id}?email=${userEmail}`;
    // let url = `http://localhost:1234/delete/${id}?email=${userEmail}`;
    axios.delete(url)
    .then(res => {
      toast.success("Item deleted successfully", {autoClose:1000});
      setMyItems(myItems.filter(item => item.id !== id));
    })
    .catch(err => {
      if(err.response && err.response.data.error)
      {
        toast.error(err.response.data.error, {autoClose:2000});
      }
      else
      {
        toast.error("Failed to delete item", {autoClose:2000});
      }
    });
  }
};
  
 const updateStatus = (id, newStatus) => {
  const userEmail = localStorage.getItem("userEmail");
  
  let url = `https://campus-mart-irke.onrender.com/updatestatus/${id}?email=${userEmail}`;
// let url = `http://localhost:1234/updatestatus/${id}?email=${userEmail}`;
  let data = {status: newStatus};
  
  axios.put(url, data)
  .then(res => {
    toast.success("Status updated", {autoClose:1000});
    setMyItems(myItems.map(item => 
      item.id === id ? {...item, status: newStatus} : item
    ));
  })
  .catch(err => {
    if(err.response && err.response.data.error)
    {
      toast.error(err.response.data.error, {autoClose:2000});
    }
    else
    {
      toast.error("Failed to update status", {autoClose:2000});
    }
  });
};
  
  const logout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    toast.success("Logged out successfully", {autoClose:1000});
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }
  
  const getStatusColor = (status) => {
    if(status === "Available") return "green";
    if(status === "Reserved") return "orange";
    if(status === "Sold") return "red";
    return "black";
  };
  
  return(
    <>
      <ToastContainer/>
      <h1> My Listings </h1>
      
      <br/><br/>
      
      <table border={5}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Item</th>
            <th>Category</th>
            <th>Condition</th>
            <th>Price</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            myItems.map((e, index) => (
              <tr key={index}>
                <td>
                  {e.image_url ? (
                    <img src={e.image_url} alt={e.Item} style={{width:"100px", height:"100px", objectFit:"cover"}} />
                  ) : (
                    <span>No Image</span>
                  )}
                </td>
                <td> {e.Item} </td>
                <td> {e.category} </td>
                <td> {e.Condition} </td>
                <td> ₹{e.Price} </td>
                <td style={{color: getStatusColor(e.status), fontWeight:"bold"}}> {e.status} </td>
                <td>
                  <select 
                    value={e.status} 
                    onChange={(event) => updateStatus(e.id, event.target.value)}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => deleteItem(e.id)}> Delete </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      
      {myItems.length === 0 && <p>You have not listed any items yet</p>}
    </>
  );
}

export default MyListings;