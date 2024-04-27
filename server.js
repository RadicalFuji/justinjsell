// Import necessary modules
const express = require('express');
const path = require('path');

const app = express(); // Creating Express app
const port = 4000; // Setting the port to 4000
const da = require("./data-access"); //imports data-access.js
const bodyParser = require('body-parser'); //imports body parser

// Implementing a static file server
// Serving static files from the "public" directory
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//The route for retrieving all customers
app.get("/customers", async (req, res) => {
    const [cust, err] = await da.getCustomers();
    if(cust){
        res.send(cust);
    }else{
        res.status(500);
        res.send(err);
    }   
});

//Route for searching customers
app.get("/customers/find/", async (req, res) => {
    let id = +req.query.id;
    let email = req.query.email;
    let password = req.query.password;
    let query = null;
    if (id > -1) {
        query = { "id": id };
    } else if (email) {
        query = { "email": email };
    } else if (password) {
        query = { "password": password }
    }
    if (query) {
        const [customers, err] = await da.findCustomers(query);
        if (customers) {
            res.send(customers);
        } else {
            res.status(404);
            res.send(err);
        }
    } else {
        res.status(400);
        res.send("query string is required");
    }
});

//Route to reset customer data
app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if(result){
        res.send(result);
    }else{
        res.status(500);
        res.send(err);
    }   
});

//Route for adding new data entries
app.post('/customers', async (req, res) => {
    const newCustomer = req.body;
    if (Object.keys(newCustomer).length === 0) {
        res.status(400);
        res.send("missing request body");
    } else {
        // return array format [status, id, errMessage]
        const [status, id, errMessage] = await da.addCustomer(newCustomer);
        if (status === "success") {
            res.status(201);
            let response = { ...newCustomer };
            response["_id"] = id;
            res.send(response);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

app.use(bodyParser.json());


//Get data by customer ID
app.get("/customers/:id", async (req, res) => {
    const id = req.params.id;
    // return array [customer, errMessage]
    const [cust, err] = await da.getCustomerById(id);
    if(cust){
        res.send(cust);
    }else{
        res.status(404);
        res.send(err);
    }   
});

//Update customer ID
app.put('/customers/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (Object.keys(updatedCustomer).length === 0) {
        res.status(400);
        res.send("missing request body");
    } else {
        delete updatedCustomer._id;
        // return array format [message, errMessage]
        const [message, errMessage] = await da.updateCustomer(updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});

//Delete an entry
app.delete("/customers/:id", async (req, res) => {
    const id = req.params.id;
    // return array [message, errMessage]
    const [message, errMessage] = await da.deleteCustomerById(id);
    if (message) {
        res.send(message);
    } else {
        res.status(404);
        res.send(errMessage);
    }
});