const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mysql = require("mysql2");
const path = require('path');

 
const session = require("express-session");
 
const app = express();
const port = 3003;
 
const bcrypt = require("bcrypt");

 
// Connection MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
});
 
// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

app.use(
  session({
    secret: "@secretEiEi",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
 
app.post("/register", (req, res) => {
  const { username, password, role } = req.body;
 
  // Check if the username already exists
  const query = "SELECT * FROM `users` WHERE username = ?";
  connection.query(query, [username], function (err, results) {
    if (err) {
      return res
        .status(500)
        .json({ message: err, error: "An error occurred while registering." });
    }
 
    // If the username already exists, send a 400 response
    if (results.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
 
    // Hash the password
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        return res.status(500).json({
          message: err,
          error: "An error occurred while registering.",
        });
      }
 
      // Insert the new user into the database
      const insertQuery =
        "INSERT INTO `users` (username, password, role) VALUES (?, ?, ?)";
      connection.query(
        insertQuery,
        [username, hash, role],
        function (err, results) {
          if (err) {
            return res.status(500).json({
              message: err,
              error: "An error occurred while registering.",
            });
          }
 
          // If successful, send a 201 response
          res.status(201).json({ message: "User registered successfully" });
        }
      );
    });
  });
});
app.use(express.static(path.join(__dirname, '../public')));
app.post("/login", (req, res) => {
  const { username, password } = req.body;
 
  // SQL query to find the user by username
  const query = "SELECT * FROM `users` WHERE username = ?";
  connection.query(query, [username], function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      return res
        .status(500)
        .json({ message: err, error: "An error occurred while logging in." });
    }
 
    // If no user is found, send a 401 response
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
 
    // Compare the provided password with the hashed password stored in the database
    bcrypt.compare(password, results[0].password, function (err, isMatch) {
      if (err) {
        return res
          .status(500)
          .json({ message: err, error: "An error occurred while logging in." });
      }
      if (isMatch) {
        // If the user is authenticated, create a session
        req.session.user = { username: username, role: results[0].role };
        const result = {
          user_id: results[0].user_id,
          username: results[0].username,
          role: results[0].role,
        };
        res
          .status(200)
          .json({ message: "Logged in successfully", data: result });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    });
  });
});
 
app.post("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});
 
// role: Individual & Business
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
 
// role: Business
function ensureAuthenBusiness(req, res, next) {
  if (req.session.user) {
    console.log(req.session);
    // Check if the user's role is 'business'
    if (req.session.user.role === "business") {
      return next();
    } else {
      // If the user's role is not 'business', deny access
      return res.status(403).json({
        message:
          "Access denied. You must be a business user to access this route.",
      });
    }
  }
  // If the user is not authenticated, deny access
  res.status(401).json({ message: "Unauthorized" });
}
app.use(express.static(path.join(__dirname, '../html2')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});
//User login
app.get("/users", ensureAuthenBusiness, function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `users`", function (err, results, fields) {
    res.json(results);
  });
});
 
app.get("/user", ensureAuthenticated, function (req, res, next) {
  const { userId } = req.query;
  // simple query
  connection.query(
    `SELECT * FROM users WHERE user_id = '${userId}'`,
    function (err, results, fields) {
      if (err) {
        // If there's an error, send a 500 response
        res.status(500).json({
          message: err,
          error: "An error occurred while creating the user.",
        });
      } else {
        // If successful, send a 201 response with the inserted user's ID
        res
          .status(201)
          .json({ message: "Find user by id successfully.", data: results });
      }
    }
  );
});
 
app.post("/user", ensureAuthenticated, function (req, res, next) {
  // Extract user data from request body
  const { username } = req.body;
 
  // SQL query to insert a new user
  const query = "INSERT INTO `users` (username) VALUES (?)";
 
  // Execute the query
  connection.query(query, [username], function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while creating the user.",
      });
    } else {
      // If successful, send a 201 response with the inserted user's ID
      res
        .status(201)
        .json({ message: "User created successfully.", id: results.insertId });
    }
  });
});
app.get('/category', (req, res) => {res.render('business/CategoriesBusiness')});
app.get("/category", function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `Category`", function (err, results, fields) {
    res.json(results);
  });

});


app.post("/category",  function (req, res, next) {
  // Extract user data from request body
  const { category_type } = req.body;

  // SQL query to insert a new user
  const query = "INSERT INTO `Category` (category_type) VALUES (?)";
  const values = [category_type];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while creating the Category.",
      });
    } else {
      // If successful, send a 201 response with the inserted user's ID
      res.status(201).json({ message: "Category created successfully." });
    }
  });
});

app.put("/category/:id", function (req, res, next) {
  // Extract product data from request body
  const { category_type } = req.body;
  const { id } = req.params; // Get the product ID from the URL parameters

  // SQL query to update the product
  const query = "UPDATE `Category` SET category_type = ? WHERE category_ID = ?";
  const values = [category_type, id];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while updating the Category.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res
        .status(200)
        .json({ message: "Category updated successfully.", results });
    }
  });
});

app.delete("/category/:id", function (req, res, next) {
  // Extract product ID from the URL parameters
  const { id } = req.params; // Get the product ID from the URL parameters

  // SQL query to delete the product
  const query = "DELETE FROM `Category` WHERE category_ID = ?";
  const values = [id];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while deleting the category.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res.status(200).json({ message: "Category deleted successfully." });
    }
  });
});

//Edit Product
app.get("/product", function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `Product`", function (err, results, fields) {
    res.json(results);
  });
});

app.get("/product-popular", function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `Product` ORDER BY sold_count DESC LIMIT 8;", function (err, results, fields) {
    res.json(results);
  });
});

app.get("/product-new", function (req, res, next) {
  // simple query
  connection.query("SELECT * FROM `Product` ORDER BY product_ID DESC LIMIT 8;", function (err, results, fields) {
    res.json(results);
  });
});

app.get("/product-id/:id", function (req, res, next) {
  const { id } = req.params; 
  const values = [id]
  // simple query
  connection.query("SELECT * FROM `Product` WHERE product_ID = ?",values, function (err, results, fields) {
    res.json(results);
  });
});

app.get("/product/:id", function (req, res, next) {
  const { id } = req.params; 
  const values = [id]
  // simple query
  connection.query("SELECT * FROM `Product` WHERE category_ID = ?",values, function (err, results, fields) {
    res.json(results);
  });
});

app.get("/products", async function (req, res, next) {
  try {
    // Step 1: Fetch all categories
    const categories = await new Promise((resolve, reject) => {
      connection.query("SELECT * FROM `Category`", (err, results, fields) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Function to fetch products for a given category
    const fetchProductsForCategory = async (category) => {
      return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM `Product` WHERE `category_ID` = ?", [category.category_ID], (err, products, fields) => {
          if (err) reject(err);
          else {
            // Add products to the category object
            category.products = products;
            resolve(category);
          }
        });
      });
    };

    // Step 2: Fetch products for each category and combine results
    const categoriesWithProducts = await Promise.all(categories.map(fetchProductsForCategory));

    // Send the combined results as the response
    res.json(categoriesWithProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching categories or products.' });
  }
});


app.get("/product-category/:id", function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8; // Default limit to 8 items per page
  const offset = (page - 1) * limit; // Corrected offset calculation
 
  const { id } = req.params;
  const query = "SELECT * FROM `Product` WHERE category_ID = ? LIMIT ? OFFSET ?";
  const values = [id, limit, offset];
 
  // Fetch products
  connection.query(query, values, function (err, results) {
     if (err) {
       res.status(500).json({
         message: err,
         error: "An error occurred while fetching products.",
       });
     } else {
       // Count total products
       const countQuery = "SELECT COUNT(*) as totalProducts FROM Product WHERE category_ID = ?";
       connection.query(countQuery, [id], function (err, countResult) {
         if (err) {
           res.status(500).json({
             message: err,
             error: "An error occurred while counting products.",
           });
         } else {
           const totalProducts = countResult[0].totalProducts;
           const totalPages = Math.ceil(totalProducts / limit);
           res.status(200).json({
             products: results,
             totalPages: totalPages,
             currentPage: page
           });
         }
       });
     }
  });
 });
 
app.post("/product/:id", function (req, res, next) {
  // Extract user data from request body
  const { productName, price, promotion, description, imagesrc } = req.body;
  const { id } = req.params; // Get the product ID from the URL parameters

  // SQL query to insert a new user
  const query =
    "INSERT INTO `Product` (product_Name, price, promotion, description, imagesrc, category_ID  ) VALUES (?,?,?,?,?,?)";
  const values = [productName, price, promotion, description, imagesrc, id];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while creating the user.",
      });
    } else {
      // If successful, send a 201 response with the inserted user's ID
      res.status(201).json({ message: "User created successfully." });
    }
  });
});
 
app.put("/product/:id", function (req, res, next) {
  // Extract product data from request body
  const { productName, price, promotion, description } = req.body;
  const { id } = req.params; // Get the product ID from the URL parameters
 
  // SQL query to update the product
  const query =
    "UPDATE `Product` SET product_Name = ?, price = ?, promotion = ?, description = ? WHERE product_ID = ?";
  const values = [productName, price, promotion, description, id];
 
  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while updating the product.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res.status(200).json({ message: "Product updated successfully." });
    }
  });
});
 
//Delete Product
app.delete("/product/:id", function (req, res, next) {
  // Extract product ID from the URL parameters
  const { id } = req.params; // Get the product ID from the URL parameters
 
  // SQL query to delete the product
  const query = "DELETE FROM `Product` WHERE product_ID = ?";
  const values = [id];
 
  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while deleting the product.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res.status(200).json({ message: "Product deleted successfully." });
    }
  });
});

app.get("/cart/:id", function (req, res, next) {
  // simple query
  const { id } = req.params;
  const values = [id];
  connection.query(
    "SELECT * FROM `cart` JOIN `Product` ON `cart`.`product_ID` = `Product`.`product_ID` WHERE `cart`.`user_id` = ?",
    values,
    function (err, results, fields) {
      console.log(results);
      if (err) {
        // If there's an error, send a 500 response
        res.status(500).json({
          message: err,
          error: "Can't check cart",
        });
      }
      res.json(results);
    }
  );
});

app.put('/cart-update/:id', function (req, res, next) {
  const { id } = req.params; // This is now the user_id

  // Prepare the SQL query to fetch products and their amounts from the cart for the user
  const selectSql = `SELECT Product.product_ID, cart.amount FROM cart JOIN Product ON cart.product_ID = Product.product_ID WHERE cart.user_id = ?`;
  const selectValues = [id];

  // Execute the query to fetch the products and their amounts
  connection.query(selectSql, selectValues, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      return res.status(500).json({
        message: err,
        error: 'Can\'t fetch cart items',
      });
    }

    // Prepare to update the sold_count for each product
    const updatePromises = results.map(item => {
      const updateSql = `UPDATE Product SET sold_count = sold_count + ? WHERE product_ID = ?`;
      const updateValues = [item.amount, item.product_ID];
      return new Promise((resolve, reject) => {
        connection.query(updateSql, updateValues, function (err, updateResults) {
          if (err) {
            reject(err);
          } else {
            resolve(updateResults);
          }
        });
      });
    });

    // Execute all update promises
    Promise.all(updatePromises)
      .then(updateResults => {
        // If all updates are successful, proceed to delete the cart items for the user
        const deleteSql = `DELETE FROM cart WHERE user_id = ?`;
        const deleteValues = [id];
        return new Promise((resolve, reject) => {
          connection.query(deleteSql, deleteValues, function (err, deleteResults) {
            if (err) {
              reject(err);
            } else {
              resolve({ updateResults, deleteResults });
            }
          });
        });
      })
      .then(({ updateResults, deleteResults }) => {
        // If all operations are successful, send a 200 response
        res.status(200).json({
          message: 'Sold count updated and cart items removed successfully',
          updatedRows: updateResults.reduce((sum, result) => sum + result.affectedRows, 0),
          deletedRows: deleteResults.affectedRows,
        });
      })
      .catch(err => {
        // If there's an error in any of the operations, send a 500 response
        res.status(500).json({
          message: err,
          error: 'Can\'t update sold count or remove cart items',
        });
      });
  });
});

app.post("/cart", function (req, res, next) {
  // Extract user data from request body
  const { product_id, user_id, amount } = req.body;

  // SQL query to check if the product exists in the cart for the user
  const selectQuery =
    "SELECT * FROM `cart` WHERE product_id = ? AND user_id = ?";
  const selectValues = [product_id, user_id];

  // Execute the select query
  connection.query(selectQuery, selectValues, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "Can't check cart",
      });
    } else {
      // If the product exists in the cart, update the quantity
      if (results.length > 0) {
        const updateQuery =
          "UPDATE `cart` SET amount = amount + ? WHERE product_id = ? AND user_id = ?";
        const updateValues = [amount, product_id, user_id];

        // Execute the update query
        connection.query(updateQuery, updateValues, function (err, results) {
          if (err) {
            res.status(500).json({
              message: err,
              error: "Can't update cart",
            });
          } else {
            res
              .status(200)
              .json({ message: "Cart updated successfully.", results });
          }
        });
      } else {
        // If the product does not exist in the cart, insert a new record
        const insertQuery =
          "INSERT INTO `cart` (product_id, user_id, amount) VALUES (?, ?, ?)";
        const insertValues = [product_id, user_id, amount];

        // Execute the insert query
        connection.query(insertQuery, insertValues, function (err, results) {
          if (err) {
            res.status(500).json({
              message: err,
              error: "Can't create cart",
            });
          } else {
            res
              .status(201)
              .json({ message: "Cart created successfully.", results });
          }
        });
      }
    }
  });
});

app.put("/cart/:id", function (req, res, next) {
  // Extract product data from request body
  const { amount } = req.body;
  const { id } = req.params; // Get the product ID from the URL parameters

  // SQL query to update the product
  const query = "UPDATE `cart` SET amount = ? WHERE cart_id = ?";
  const values = [amount, id];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while updating the cart.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res.status(200).json({ message: "Cart updated successfully.", results });
    }
  });
});

app.delete("/cart/:id", function (req, res, next) {
  // Extract product ID from the URL parameters
  const { id } = req.params; // Get the product ID from the URL parameters

  // SQL query to delete the product
  const query = "DELETE FROM `cart` WHERE cart_id = ?";
  const values = [id];

  // Execute the query
  connection.query(query, values, function (err, results) {
    if (err) {
      // If there's an error, send a 500 response
      res.status(500).json({
        message: err,
        error: "An error occurred while deleting the product.",
      });
    } else {
      // If successful, send a 200 response indicating success
      res.status(200).json({ message: "Cart deleted successfully." });
    }
  });
});


app.use(express.static(path.join(__dirname, '../views')));

app.set('views', path.join(__dirname, '../views'));

app.set('view engine', 'ejs');

// CSS, images
// app.use(express.static(path.join(__dirname, '../public')));
app.get('/home', (req, res) => {res.render('customer/HomeForCustomer')});
app.get('/beverage', (req, res) => {res.render('customer/beverage')});
app.get('/fruit', (req, res) => {res.render('customer/fruit')});
app.get('/empty', (req, res) => {res.render('customer/cartEmptyPage')});
app.get('/completed', (req, res) => {res.render('customer/completePage')});
app.get('/contact', (req, res) => {res.render('customer/contactPage')});
app.get('/household', (req, res) => {res.render('customer/household')});
app.get('/meat', (req, res) => {res.render('customer/meat')});
app.get('/information', (req, res) => {res.render('customer/outlineInfo')});
app.get('/payment', (req, res) => {res.render('customer/paymentPage')});
app.get('/productList', (req, res) => {res.render('customer/productListPage')});
app.get('/promotion', (req, res) => {res.render('customer/PromotionPage')});
app.get('/register', (req, res) => {res.sendFile(path.join(__dirname, '../views/register.html'));});
app.get('/edit', (req, res) => {res.render('business/editCategory')});
app.get('/homeBusiness', (req, res) => {res.render('business/homeBusiness')});
app.get('/productCategory', (req, res) => {res.render('business/productInCategory')});
app.get('/productInfo', (req, res) => {res.render('business/productInformation')});
app.get('/best', (req, res) => {res.render('business/bestSeller')});
app.get('/details', (req, res) => {res.render('business/billDetail')});
app.get('/summary', (req, res) => {res.render('business/billSummary')});
app.get('/category', (req, res) => {res.render('business/categoriesBusiness')});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});