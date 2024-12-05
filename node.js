const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

const connection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password: process.env.password,
    database: process.env.database
});

app.get('/test', (req, res) => {
    connection.query(
        `select time.yearquarter, 
            sum(metrics.total_interactions) as total_interactions
     from time
     join metrics using (ccpost_id)
     where time.yearquarter between 2022 and 2024
     group by time.yearquarter
     order by time.yearquarter asc;`,
        (error, results) => {
            if (error) {
                console.error('database query error:', error);
                res.status(500).send('database error');
            } else {
                res.json(results); // send the data as json
            }
        }
    );

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

