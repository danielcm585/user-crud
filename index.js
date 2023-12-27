require('dotenv').config();
const http = require('http');
const User = require('./userModel');
const sequelize = require('./db');

const port = process.env.PORT || 8000;

sequelize.sync({ force: false }) 
  .then(() => {
    console.log('Tables have been successfully created');
  })
  .catch(error => {
    console.error('Error creating tables:', error);
  });

http
  .createServer(async (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    const url = req.url;
    const method = req.method;

    if (url === "/users") {
      if (method === "GET") {
        // READ: Fetch all users
        const users = await User.findAll();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(users));
      } 
      else if (method === "POST") {
        // CREATE: Add a new user
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          try {
            const newUserRequest = JSON.parse(body);
            const user = await User.create({
              name: newUserRequest.name, 
              email: newUserRequest.email,
              birthDate: newUserRequest.birthDate
            });
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(user.dataValues));
          } catch (error) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      }
    } 
    else if (url.match(/\/users\/\w+/) && method === "GET") {
      // READ: Fetch single user
      const id = url.split("/")[2];
      const user = await User.findOne({
        where: { id: id },
      });
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "User not found" }));
      }
      else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
      }
    } 
    else if (url.match(/\/users\/\w+/) && method === "PUT") {
      // UPDATE: Update user
      const id = url.split("/")[2];
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const updateUser = JSON.parse(body);
          const [updateCount] = await User.update(updateUser, {
            where: { id: id }
          });
          if (updateCount > 0) {
            const updatedUser = await User.findOne({ where: { id: id } });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(updatedUser));
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "User not found." }));
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    } 
    else if (url.match(/\/users\/\w+/) && method === "DELETE") {
      // DELETE: Remove user
      const id = url.split("/")[2];
      try {
        const deleteCount = await User.destroy({
          where: { id: id }
        });
        if (deleteCount > 0) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "User deleted" }));
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found." }));
        }
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
    } 
    else {
      res.write("<h1>Welcome to the Node.js Server!</h1>");
      res.end();
    }
  })
  .listen(port, () => {
    console.log(`Server listening on port ${port}...`);
  });
