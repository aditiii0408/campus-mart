const express = require("express");
const cors = require("cors");
const mysql2 = require("mysql2");
const nodemailer = require("nodemailer");
require("dotenv").config();

const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

// Create connection pool for better performance
const pool = mysql2.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test connection
pool.getConnection((err, connection) => {
  if(err)
  {
    console.error('Database connection failed:', err.message);
    console.error('Host:', process.env.HOST);
    console.error('User:', process.env.USER);
    console.error('Database:', process.env.DATABASE);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Test query
  connection.query('SELECT 1', (err, result) => {
    if(err) {
      console.error('Test query failed:', err);
    } else {
      console.log('Test query successful');
    }
    connection.release();
  });
});

// Verify email configuration
transporter.verify((error, success) => {
  if(error)
  {
    console.error('Email configuration failed:', error);
  }
  else
  {
    console.log('Email server is ready');
  }
});

app.get("/", (req, res) => {
  res.send("Campus Mart API is running");
});

app.get("/health", (req, res) => {
  res.json({status: "ok", message: "API is healthy"});
});

app.post("/register", (req, res) => {
  console.log('POST /register received');
  
  const {name, email, password} = req.body;
  
  if(!name || !email || !password)
  {
    return res.status(400).json({error: "All fields are required"});
  }
  
  let checkSql = "SELECT * FROM users WHERE email = ?";
  pool.query(checkSql, [email], (error, result) => {
    if(error)
    {
      console.error('Check user error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length > 0)
    {
      return res.status(400).json({error: "Email already registered"});
    }
    
    let insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    let data = [name, email, password];
    
    pool.query(insertSql, data, (error, result) => {
      if(error)
      {
        console.error('Insert user error:', error);
        return res.status(500).json({error: "Registration failed"});
      }
      
      console.log('Registration success for:', email);
      res.json({message: "Registration successful"});
    });
  });
});

app.post("/login", (req, res) => {
  console.log('POST /login received');
  
  const {email, password} = req.body;
  
  if(!email || !password)
  {
    return res.status(400).json({error: "Email and password are required"});
  }
  
  let sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  let data = [email, password];
  
  pool.query(sql, data, (error, result) => {
    if(error)
    {
      console.error('Login error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(401).json({error: "Invalid email or password"});
    }
    
    console.log('Login success for:', email);
    res.json({
      message: "Login successful",
      email: result[0].email,
      name: result[0].name
    });
  });
});

app.post("/save", async (req, res) => {
  console.log('POST /save received');
  
  const {name, item, category, condition, price, mail, image} = req.body;
  
  if(!name || !item || !category || !condition || !price || !mail || !image)
  {
    return res.status(400).json({error: "All fields are required"});
  }
  
  try {
    // Upload image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'campus-mart',
      resource_type: 'image'
    });
    
    const imageUrl = uploadResult.secure_url;
    
    let sql = "INSERT INTO student (Name, Item, category, `Condition`, Price, Contact, status, image_url, seller_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let data = [name, item, category, condition, price, mail, 'Available', imageUrl, mail];
    
    pool.query(sql, data, (error, result) => {
      if(error)
      {
        console.error('Insert error:', error.message);
        return res.status(500).json({error: "Failed to add item"});
      }
      
      console.log('Item inserted with Cloudinary image');
      res.json({message: "Item added successfully", id: result.insertId});
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({error: "Failed to upload image"});
  }
});

app.get("/save", (req, res) => {
  console.log('GET /save received');
  
  let sql = "SELECT * FROM student ORDER BY id DESC";
  pool.query(sql, (error, result) => {
    if(error)
    {
      console.error('Select error:', error);
      return res.status(500).json({error: "Failed to fetch items"});
    }
    
    console.log('Found', result.length, 'items');
    res.json(result);
  });
});

app.get("/mylistings", (req, res) => {
  console.log('GET /mylistings received for:', req.query.email);
  
  const email = req.query.email;
  
  if(!email)
  {
    return res.status(400).json({error: "Email is required"});
  }
  
  let sql = "SELECT * FROM student WHERE seller_email = ? ORDER BY id DESC";
  pool.query(sql, [email], (error, result) => {
    if(error)
    {
      console.error('Select my listings error:', error);
      return res.status(500).json({error: "Failed to fetch listings"});
    }
    
    console.log('Found', result.length, 'listings for:', email);
    res.json(result);
  });
});

app.delete("/delete/:id", (req, res) => {
  console.log('DELETE /delete received for id:', req.params.id);
  
  const userEmail = req.query.email;
  const itemId = req.params.id;
  
  if(!userEmail)
  {
    return res.status(401).json({error: "Unauthorized"});
  }
  
  let checkSql = "SELECT * FROM student WHERE id = ? AND seller_email = ?";
  pool.query(checkSql, [itemId, userEmail], (error, result) => {
    if(error)
    {
      console.error('Check ownership error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(403).json({error: "You can only delete your own items"});
    }
    
    let deleteSql = "DELETE FROM student WHERE id = ?";
    pool.query(deleteSql, [itemId], (error, result) => {
      if(error)
      {
        console.error('Delete error:', error);
        return res.status(500).json({error: "Failed to delete item"});
      }
      
      console.log('Item deleted successfully');
      res.json({message: "Item deleted successfully"});
    });
  });
});

app.put("/updatestatus/:id", (req, res) => {
  console.log('PUT /updatestatus received for id:', req.params.id);
  
  const userEmail = req.query.email;
  const itemId = req.params.id;
  const {status} = req.body;
  
  if(!userEmail)
  {
    return res.status(401).json({error: "Unauthorized"});
  }
  
  if(!status || !['Available', 'Reserved', 'Sold'].includes(status))
  {
    return res.status(400).json({error: "Invalid status"});
  }
  
  let checkSql = "SELECT * FROM student WHERE id = ? AND seller_email = ?";
  pool.query(checkSql, [itemId, userEmail], (error, result) => {
    if(error)
    {
      console.error('Check ownership error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(403).json({error: "You can only update your own items"});
    }
    
    let updateSql = "UPDATE student SET status = ? WHERE id = ?";
    let data = [status, itemId];
    
    pool.query(updateSql, data, (error, result) => {
      if(error)
      {
        console.error('Update status error:', error);
        return res.status(500).json({error: "Failed to update status"});
      }
      
      console.log('Status updated successfully');
      res.json({message: "Status updated successfully"});
    });
  });
});

// Generate reset code and send via email
app.post("/forgot-password", (req, res) => {
  console.log('POST /forgot-password received');
  
  const {email} = req.body;
  
  if(!email)
  {
    return res.status(400).json({error: "Email is required"});
  }
  
  let checkSql = "SELECT * FROM users WHERE email = ?";
  pool.query(checkSql, [email], (error, result) => {
    if(error)
    {
      console.error('Check user error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(404).json({error: "Email not found"});
    }
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    let deleteSql = "DELETE FROM password_resets WHERE email = ?";
    pool.query(deleteSql, [email], (error) => {
      if(error)
      {
        console.error('Delete old codes error:', error);
      }
      
      let insertSql = "INSERT INTO password_resets (email, reset_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))";
      pool.query(insertSql, [email, resetCode], (error, result) => {
        if(error)
        {
          console.error('Insert reset code error:', error);
          return res.status(500).json({error: "Failed to generate reset code"});
        }
        
        // Send email with reset code
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Campus Mart - Password Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; text-align: center;">Campus Mart - Password Reset</h2>
              <p>Hello,</p>
              <p>You requested to reset your password. Use the code below to reset your password:</p>
              <div style="background-color: #fef3c7; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 5px; margin: 0;">${resetCode}</h1>
              </div>
              <p style="color: #6b7280;">This code will expire in <strong>15 minutes</strong>.</p>
              <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">Campus Mart Team</p>
            </div>
          `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
          if(error)
          {
            console.error('Email send error:', error);
            return res.status(500).json({error: "Failed to send email"});
          }
          
          console.log('Reset code sent to:', email);
          res.json({message: "Reset code sent to your email"});
        });
      });
    });
  });
});

// Reset password with code
app.post("/reset-password", (req, res) => {
  console.log('🔄 POST /reset-password received');
  
  const {email, resetCode, newPassword} = req.body;
  
  if(!email || !resetCode || !newPassword)
  {
    return res.status(400).json({error: "All fields are required"});
  }
  
  if(newPassword.length < 6)
  {
    return res.status(400).json({error: "Password must be at least 6 characters"});
  }
  
  let checkSql = "SELECT * FROM password_resets WHERE email = ? AND reset_code = ? AND used = FALSE AND expires_at > NOW()";
  pool.query(checkSql, [email, resetCode], (error, result) => {
    if(error)
    {
      console.error('Check reset code error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(400).json({error: "Invalid or expired reset code"});
    }
    
    let updateSql = "UPDATE users SET password = ? WHERE email = ?";
    pool.query(updateSql, [newPassword, email], (error) => {
      if(error)
      {
        console.error('Update password error:', error);
        return res.status(500).json({error: "Failed to update password"});
      }
      
      let markUsedSql = "UPDATE password_resets SET used = TRUE WHERE email = ? AND reset_code = ?";
      pool.query(markUsedSql, [email, resetCode], (error) => {
        if(error)
        {
          console.error('Mark code as used error:', error);
        }
        
        console.log('Password reset successful for:', email);
        res.json({message: "Password reset successful"});
      });
    });
  });
});

// Change password for logged-in user
app.post("/change-password", (req, res) => {
  console.log('🔐 POST /change-password received');
  
  const {email, currentPassword, newPassword} = req.body;
  
  if(!email || !currentPassword || !newPassword)
  {
    return res.status(400).json({error: "All fields are required"});
  }
  
  if(newPassword.length < 6)
  {
    return res.status(400).json({error: "Password must be at least 6 characters"});
  }
  
  // Verify current password
  let checkSql = "SELECT * FROM users WHERE email = ? AND password = ?";
  pool.query(checkSql, [email, currentPassword], (error, result) => {
    if(error)
    {
      console.error('Check password error:', error);
      return res.status(500).json({error: "Database error"});
    }
    
    if(result.length === 0)
    {
      return res.status(401).json({error: "Current password is incorrect"});
    }
    
    // Update to new password
    let updateSql = "UPDATE users SET password = ? WHERE email = ?";
    pool.query(updateSql, [newPassword, email], (error, result) => {
      if(error)
      {
        console.error('Update password error:', error);
        return res.status(500).json({error: "Failed to change password"});
      }
      
      console.log('Password changed successfully for:', email);
      res.json({message: "Password changed successfully"});
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({error: "Internal server error"});
});

const PORT = process.env.PORT || 1234;
app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});

