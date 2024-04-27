// data-access.js file
const MongoClient = require('mongodb').MongoClient;
const dbName = 'custdb';
const baseUrl = "mongodb://127.0.0.1:27017";
const collectionName = "customers"
const connectString = baseUrl + "/" + dbName;
let collection;

//Connect to MongoDB
async function dbStartup() {
    const client = new MongoClient(connectString);
    await client.connect();
    collection = client.db(dbName).collection(collectionName);
}

//Retrieve all entries from database
async function getCustomers() {
    try {
        const customers = await collection.find().toArray();
        return [customers, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

//Revert data to default

async function resetCustomers() {
    let data = [{ "id": 0, "name": "Mary Jackson", "email": "maryj@abc.com", "password": "maryj" },
    { "id": 1, "name": "Karen Addams", "email": "karena@abc.com", "password": "karena" },
    { "id": 2, "name": "Scott Ramsey", "email": "scottr@abc.com", "password": "scottr" }];

    try {
        await collection.deleteMany({});
        await collection.insertMany(data);
        const customers = await collection.find().toArray();
        const message = "data was refreshed. There are now " + customers.length + " customer records!"
        return [message, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

//Add new customer
async function addCustomer(newCustomer) {
    try {
        const insertResult = await collection.insertOne(newCustomer);
        // return array [status, id, errMessage]
        return ["success", insertResult.insertedId, null];
    } catch (err) {
        console.log(err.message);
        return ["fail", null, err.message];
    }
}

//Search for customer by ID
async function getCustomerById(id) {
    try {
        const customer = await collection.findOne({"id": +id});
        // return array [customer, errMessage]
        if(!customer){
          return [ null, "invalid customer number"];
        }
        return [customer, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

//Update customer information
async function updateCustomer(updatedCustomer) {
    try {
        const filter = { "id": updatedCustomer.id };
        const setData = { $set: updatedCustomer };
        const updateResult = 
        await collection.updateOne(filter, setData);
        // return array [message, errMessage]
        return ["one record updated", null];
    } catch (err) {
        console.log(err.message);
        return [ null, err.message];
    }
}

//Delete customer using ID
async function deleteCustomerById(id) {
    try {
        const deleteResult = await collection.deleteOne({ "id": +id });
        if (deleteResult.deletedCount === 0) {
            // return array [message, errMessage]
            return [null, "no record deleted"];
        } else if (deleteResult.deletedCount === 1) {
            return ["one record deleted", null];
        } else {
            return [null, "error deleting records"]
        }
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

//Search for customers by URL endpoints
async function findCustomers(filterObject) {
    try {
        const customers = await collection.find(filterObject).toArray();
        // return array [customer, errMessage]
        if(!customers|| customers.length == 0 ){
          return [ null, "no customer documents found"];
        }
        return [customers, null];
    } catch (err) {
        console.log(err.message);
        return [null, err.message];
    }
}

//Start database connection
dbStartup();

//Export functions
module.exports = { getCustomers, resetCustomers, addCustomer, getCustomerById, updateCustomer, deleteCustomerById, findCustomers};