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

app.get('/getData/byQuarter/select=:select;having=:having?',(req, res) => {
    // This endpoint gives you back data grouped by quarter, it is usefull for showing trends over time.
    // this endpoint has two params, on for the selected collumn you want to see, and on for an optional 'having' statement
    let havingStr = ''
    if (req.params.having) {
        havingStr = `having ${req.params.having}`
    }
    const query =
        `select ${req.params.select}, yearquarter
        from metrics
        inner join \`time\`
        on metrics.ccpost_id = \`time\`.ccpost_id
        inner join classification
        on metrics.ccpost_id = classification.ccpost_id
        group by yearquarter
        ${havingStr}
        order by yearquarter`
    connection.query(query,
        (error, results) => {
        if (error) {
            console.log(error)
            res.send('it does not work')}
        else {
            res.json(results)
        }
    })
})

app.get('/getData/notAgainst/byTotalInteractions/select=:select', (req, res) => {
    const query =
        `select avg(metrics.total_interactions), metrics.post_type
        from metrics
        inner join \`time\`
        on metrics.ccpost_id = \`time\`.ccpost_id
        inner join classification
        on metrics.ccpost_id = classification.ccpost_id
        where classification.gpt_ukraine_for_imod != "imod" 
        group by metrics.post_type
        having avg(metrics.total_interactions) > 100
        order by avg(metrics.total_interactions)`
    connection.query(query,
        (error, results) => {
            if (error) {
                console.log(error)
                res.send('it does not work')}
            else {
                res.json(results)
            }
        })
})

app.get('/getData/category/reactions', (req, res) => {
    const query =
        `SELECT 
    sp.category,               
    AVG(m.reactions) AS avg_reactions
FROM 
    metrics m
JOIN 
    sourcepop sp ON m.ccpageid = sp.ccpageid  
GROUP BY
    sp.category
ORDER BY
    avg_reactions DESC;
    `
    connection.query(query,
        (error, results) => {
            if (error) {
                console.log(error)
                res.send('it does not work')}
            else {
                res.json(results)
            }
        })
})



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

