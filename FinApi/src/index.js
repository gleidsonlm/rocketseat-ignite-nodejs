/* FinApi Financeira -> FinApi.md */

/* Node.js built API served with Express on port 8080 */
const { response, request } = require('express');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.listen(port);
/* Middleware to Express and JSON */
app.use(express.json());
console.log(`HTTP server listening on ${port}`);

/* Function isCustomer */
function findCustomer(req, res, next) {
    const {cpf} = req.headers;
    // find array for object properties where cpf matches.
    const customer = customers.find((e) => e.cpf === cpf);
    // if not matches,
    if (!customer) {
        // return 400
        return res.status(400).json({error:'Customer not found'})
    } else {
    // add object to request for reuse
    req.customer = customer;
    // keep going...
    next();
    }
}

/* Function getBalance reduce the customer statement calculating deposits and withdraws. */
function getBalance(statement) {
    const balance = statement.reduce((acc, opp) => {
        // if a deposit
        if(opp.type === 'credit') {
            // credit the balance
            return acc + statement.amount;
        // if a withdraw
        } else {
            // debit the balance
            return acc - statement.amount;
        }
    },0);

    return balance;
}

/* UUID to generate RDC4122 uuids, using v4 for random  */
const { v4:uuidv4 } = require('uuid');

/* Account properties
    - id: primary unique uuid
    - cpf: unique
    - name: string
    - statement: array
*/
const customers = [
  {
    id: '86ebdd27-8d2f-4a38-8a5d-6541c56d5227',
    cpf: '01234567890' ,
    name: 'John Doe',
    statement: [
        {
            "description": "Other",
            "amount": 1200,
            "type": "credit",
            "created": "2022-10-28T12:41:07.070Z"
        },
        {
            "description": "bank teller",
            "amount": 900,
            "type": "debit",
            "created": "2022-10-28T12:41:09.821Z"
        },
        {
            "description": "bank teller",
            "amount": 200,
            "type": "debit",
            "created": "2022-10-28T12:41:09.821Z"
        }

    ]
  }
];

/* GET account retrieves customer by their uuid (route param) */
app.get('/account/',findCustomer, (req, res) => {
    return res.status(200).json(req.customer)
});

/* POST account creates an object in the "customers" array */
app.post('/account/', (req, res) => {
    const { cpf, name } = req.body;
    // Check if already a customer
    if (customers.some((e) => e.cpf === cpf)) {
        return res.status(400).json({message:'CPF already registered.'});
    } else {
        // push new customer to array
        customers.push({
            id: uuidv4(),
            cpf,
            name,
            statement: []
        });
        // return to API request
        return res.status(201).json({message:`CPF ${cpf} was registered.`});
    }   
});

/* PATCH account edits customers object property "name" */
app.patch('/account/',findCustomer, (req, res) => {
    const { customer } = req ;
    const { name } = req.headers;
    
    customer.name = name;

    return res.status(200).json(customer);
});

/* DELETE account removes customers object completely. */
app.delete('/account/',findCustomer, (req, res) => {
    const { customer } = req ;
    
    // Object array already set in "customer", just need to splice its index.
    customers.splice(customers.indexOf(customer), 1);
    
    // return to API request
    return res.status(200).json({message:'Customer with CPF '+ customer.cpf +' was removed.'});
});

/* GET statement with CPF in header returns [customers[statement]] array. */
app.get('/statement/',findCustomer, (req, res) => {
    const { customer } = req;
    return res.status(200).json(customer.statement)
});

/* POST statement pass start and end dates on headers to filter the period of the return. */
app.post('/statement/',findCustomer, function(req, res) {
    const { customer } = req;
    const { date } = req.headers;  
    
    // todo: check if statement period requested is greater than 30 days
    //     return res.status(400).json({message: 'Statement period exceeded 30 days.'});

    // Filter [customers[statement]] array and returns the matching objects with the date in headers.
    const statement = customer.statement.filter(
        (statement) => 
            // must be a Date to be called from toDateString.
            new Date(statement.created).toDateString() === 
            new Date(date + " 00:00").toDateString()
    );

    return res.status(200).json(statement);
})

/* POST deposit adds number to [customer[statement]] array. */
app.post('/deposit/',findCustomer, (req, res) => {
    const { customer } = req;
    const { description , amount } = req.body;

    const statementOperation = {
        description,
        amount,
        type: "credit",
        created: new Date()
    }
    // push to cpf unique 'customer' statement array
    customer.statement.push(statementOperation);

    return res.status(200).json(customer.statement)
});

/* POST withdraw adds number to [customer[statement]] array. */
app.post('/withdraw/',findCustomer, (req, res) => {
    const { customer } = req;
    const { description, amount } = req.body;

    //Calculate balance
    const balance = getBalance(customer.statement);  

    // Prevent withdraw with insufficient funds.
    if (balance < amount) {
        return res.status(403).json({message: 'Insufficient funds.'});
    } else {
        // build statement object
        const statementOperation = {
        description,
        amount,
        type: "debit",
        created: new Date()
        }
        // push to cpf unique 'customer' statement array
        customer.statement.push(statementOperation);
        return res.status(200).json(customer.statement)
    }
})

// Balance statement with previous functions.
app.get('/balance/',findCustomer, function (req, res) {
    const { customer } = req;
    const balance = getBalance(customer.statement);
    return res.status(200).json(balance);
})