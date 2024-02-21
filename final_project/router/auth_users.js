const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Example: Check if the username is at least 5 characters long and contains only alphanumeric characters
  const usernameRegex = /^[a-zA-Z0-9]{5,}$/;
  return usernameRegex.test(username);
}

const authenticatedUser = (username, password) => {
  // Example: Check if the provided username and password match a user in the records
  const user = users.find(user => user.username === username && user.password === password);
  return !!user; // Returns true if the user is found, false otherwise
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!username || !isbn || !review) {
    return res.status(400).json({ message: "Incomplete data for adding a review" });
  }

  // Check if the book with the given ISBN exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add the review to the book
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
