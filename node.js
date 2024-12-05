//npm install express --save
const express = require("express");
//npm install mysql2 --save
const mysql = require("mysql2");
//npm install cors --save
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

//Host, user, password database
const connection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password: process.env.password,
    database: process.env.database
});

app.get('.....',(req, res)=>{
    connection.query('....',(error,results)=>{
        res.send(results);
    });
});

//Find single pokemon by name
app.get('....', (req,res)=>{
    const barNameRequest = req.params.name;
    connection.query('.....',
        [barNameRequest],
        (error, results)=>{
            res.send(results);
            console.log("")
        });

});

app.get('...', (req,res)=>{});

app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});

app.get('/all', (req, res) => {
    connection.query('.....', (error, results) => {
        res.send(results);
    })
})

