const express = require("express");
const app = express.app()

// Creating our RESTful API endpoint
app.get('/api/customers', (req, res) => {

    // Implementing pagination
    // We have 120 records in our db, now we can't really send all og them at once
    // So we will use pagination (limit and skip)
    // If somebody is requesting ://localhost:3001/api/customers = page 0
    // ://localhost:3001/api/customers = ://localhost:3001/api/customer?p=0

    const page = parseInt(req.query.p) || 0; // Ensure `page` is an integer
    const customersPerPage = 120;
    let customers = [];
    
    db.collection('customers')
        .find()
        .sort({ id: 1 }) // Correct method is `sort`, not `short`
        .skip(page * customersPerPage)
        .limit(customersPerPage)
        .forEach(customer => customers.push(customer))
        .then(() => {
            res.status(200).json(customers);
        })
        .catch((err) => {
            console.error(err); // Log the error for debugging
            res.status(500).json({ msg: 'Error retrieving customers' });
        });
});

app.get('/api/customers/:id', (req, res) => {
    const customerID = parseInt(req.params.id);

    if (!isNaN(customerID)) {
        // Show customers info
        db.collection('customers')
            .findOne({ id: customerID })
            .then((customer) => {
                if (customer) {
                    res.status(200).json(customer);
                } else {
                    res.status(404).json({ msg: 'Customer not found' });
                }
            })
            .catch((err) => {
                res.status(500).json({ msg: 'Error retrieving customer' });
            });
    } else {
        // Show error
        res.status(400).json({ Error: 'Invalid customer ID' });
    }
});

// Creat a customer
app.post('/api/customers', (req,res) => {
    const customer = req.body;
    db.collection('customers')
    .insertOne(customer)
    .then((result) => {
        res.status(201).json({result});
    })
    .catch(() => {
        res.status(500).json({msg: 'Error creating customer'});
    })
});

// Update a customer

app.patch('/api/customers/:id', (req, res) => {
    let updates = req.body; // Extract updates from request body
    const customerID = parseInt(req.params.id); // Ensure consistent naming
    if (!isNaN(customerID)) { // Correct variable name here
        // Update the customer
        db.collection('customers')
            .updateOne(
                { id: customerID }, // Filter by the customer ID
                { $set: updates }   // Apply updates
            )
            .then((result) => {
                if (result.matchedCount > 0) {
                    res.status(200).json({ msg: 'Customer updated successfully' });
                } else {
                    res.status(404).json({ msg: 'Customer not found' });
                }
            })
            .catch((err) => {
                console.error('Error updating customer:', err);
                res.status(500).json({ msg: 'Error updating customer' });
            });
    } else {
        // Show an error
        res.status(400).json({ Error: 'Customer ID must be a number' });
    }
});


// Delet a customer


app.delete('/api/customers/:id', (req, res) => {
    const customerID = parseInt(req.params.id); // Consistent use of 'customerID'
    if (!isNaN(customerID)) {
        // Delete the customer
        db.collection('customers')
            .deleteOne({ id: customerID }) // Use 'customerID' here
            .then((result) => {
                if (result.deletedCount > 0) {
                    res.status(200).json({ msg: 'Customer deleted successfully' });
                } else {
                    res.status(404).json({ msg: 'Customer not found' });
                }
            })
            .catch((err) => {
                console.error('Error deleting customer:', err);
                res.status(500).json({ msg: 'Error deleting customer' });
            });
    } else {
        // Show an error
        res.status(400).json({ Error: 'Customer ID must be a number' });
    }
});
