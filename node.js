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

app.get('/hay', (req, res) => {
    res.send("hello there")
    console.log(req)
})

// Query to fetch all comments from the MySQL database
app.get('/word-count', (req, res) => {
    connection.query("SELECT all_post_text FROM classification", (err, rows) => {
        if (err) {
            console.error(err.message);
            connection.end();
            return res.status(500).json({ error: 'Database query failed' });
        }

        const comments = rows.map(row => row.all_post_text).join(' ');
        const words = comments.toLowerCase().match(/\p{L}+/gu); // Unicode-aware regex for words
        const filteredWords = words.filter(word => !allStopWords.has(word));
        const normalizedWords = filteredWords.map(normalizeWord);
        const finalWords = normalizedWords.filter(word => !ignoreList.has(word));

        const wordCounts = _.countBy(finalWords);
        const sortedWordCounts = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15);

        // Send the top 15 word counts to the frontend
        res.json(sortedWordCounts);
        connection.end();
    });
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

app.get('/getData/category/map', (req, res) => {
    connection.query(
        `SELECT 
            sp.country,
            COUNT(*) AS total_posts_for_ukraine,
            SUM(m.total_interactions) AS total_interactions
        FROM 
            classification c
        JOIN 
            metrics m ON c.ccpost_id = m.ccpost_id
        JOIN 
            sourcepop sp ON m.ccpageid = sp.ccpageid
        WHERE 
            c.all_post_text LIKE '%Ukrain%'
            AND sp.category = 'Political'
            AND c.gpt_ukraine_for_imod LIKE 'for'
        GROUP BY 
            sp.country
        ORDER BY 
            total_posts_for_ukraine DESC;`,
        (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.status(500).send('Database error');
            } else {
                console.log('API Results:', results);
                res.json(results);
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

app.get('/getData/notAgainst/byAvgTotalInteractions/select=:select;having=:having?', (req, res) => {
    console.log(req.params)
    let havingStr = ''
    if (req.params.having) {
        havingStr = `having ${req.params.having}`
    }
    const query =
        `select avg(metrics.total_interactions), ${req.params.select}
        from metrics
        inner join \`time\`
        on metrics.ccpost_id = \`time\`.ccpost_id
        inner join classification
        on metrics.ccpost_id = classification.ccpost_id
        where classification.gpt_ukraine_for_imod != "imod" 
        group by ${req.params.select}
        ${havingStr}
        order by avg(metrics.total_interactions) desc;`
    console.log(query)
    connection.query(query,
        (error, results) => {
            if (error) {
                console.log(error)
                res.send('it does not  work')}
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

