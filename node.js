const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const {query} = require("express");
const _ = require('lodash');
const stopwordsIso = require('stopwords-iso');

const app = express();
const port = 3000;

app.use(cors());
// List of supported languages for stopwords
const supportedLanguages = ['en', 'fr', 'da', 'de']; // English, French, Danish, German

const connection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password: process.env.password,
    database: process.env.database
});

// Synonym Mapping
const synonymMapping = {
    'guerre': 'krig', // Both mean "war"
    'krieg': 'krig',
    'russische': 'rusland',
    'russie': 'rusland',
    'russischen': 'russer',
    'ukrainische': 'ukraine',
    'ukraine': 'ukraine',
    'russe': 'rusland',
    'politiek': 'politik',
    'politik': 'politik',
    'germany': 'germany',
    'deutschland': 'germany',
    'deutschen': 'germany',
    'putin': 'putin',
    'putins': 'putin',
    'europe': 'europa',
    'europa': 'europa',
    'ukrainischen': 'ukraine',
    'russland': 'rusland',
    'präsident': 'putin',
    'russlands': 'rusland',
    'russia': 'rusland',
    'ukrainske': 'ukraine',
    'angriffskrieg': 'invasion',
    'président': 'putin',
    'union': 'nato',
    'nato': 'nato',
    'berlin': 'germany',
    'ukrainiens': 'ukraine',
    'ukrainien': 'ukraine',
    'euro': 'penge',
    'pays': 'penge',
    'unterstützung': 'støtte',
    'bundestag': 'politik',
    'bundesregierung': 'politik',
    'welt': 'verdenen',
    'krigen': 'krig',
    'waffen': 'våben',
    'hilfe': 'støtte',
    'international': 'verdenen',
    'deutsche': 'germany',
    'unterstützen': 'støtte',
    'russes': 'rusland',
    'krieges': 'krig',
    'gemeinsam': 'nato',
    'ukrainer': 'ukraine',
    'europäischen': 'europa',
    'poutine': 'putin'
};

// Combine stopwords from multiple languages dynamically
const allStopWords = new Set();

supportedLanguages.forEach(language => {
    const stopwords = stopwordsIso[language]; // Access stopwords directly by language code
    if (stopwords) {
        stopwords.forEach(word => allStopWords.add(word.toLowerCase()));
    } else {
        console.warn(`No stopwords found for language: ${language}`);
    }
});

const normalizeWord = (word) => {
    return synonymMapping[word] || word;
};

// Additional words to ignore after normalization (e.g., irrelevant terms, common names, etc.)
const ignoreList = new Set([
    'https', 'www', 'com', 'de', 'fr', 'uk', 'eu', 'org', 'land', 'situation', // Examples of common, irrelevant terms
    'germany', 'france', 'frieden', 'danmark', 'lage' // Example of specific terms you may want to ignore
]);

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
            .slice(0, 10);

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

app.get('/getData/notAgainst/lengthInCategories', (req, res) => {
    //this is mostly for testen and onetime-queries
    const query = `select
        case
             when length(all_post_text) < 200 then "tiny"
             when length(all_post_text) >= 200 and length(all_post_text) < 400 then "small"
             when length(all_post_text) >= 400 and length(all_post_text) < 600 then "average"
             when length(all_post_text) >= 600 and length(all_post_text) < 800 then "big"
             when length(all_post_text) >= 800 then "huge"
             else "this is not working correctly"
             end as size,
             count(*)
         from classification
         where gpt_ukraine_for_imod != "imod"
         group by size;`
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

app.get('/getData/textLength/reactions', (req, res) => {
    const query =
        `SELECT 
    text_length_range,
    avg_reactions_range
FROM (
\tSELECT 
    CASE
        WHEN LENGTH(c.all_post_text) BETWEEN 0 AND 500 THEN "0 to 500"
        WHEN LENGTH(c.all_post_text) BETWEEN 501 AND 1000 THEN "501 to 1000"
        WHEN LENGTH(c.all_post_text) BETWEEN 1001 AND 1500 THEN "1001 to 1500"
        WHEN LENGTH(c.all_post_text) BETWEEN 1501 AND 2000 THEN "1501 to 2000"
        WHEN LENGTH(c.all_post_text) BETWEEN 2001 AND 3000 THEN "2001 to 3000"
        WHEN LENGTH(c.all_post_text) BETWEEN 3001 AND 5000 THEN "2501 to 5000"
        else "> 5000"
    END AS text_length_range,
    COUNT(*) AS total_posts,
    SUM(m.reactions) AS total_reactions,
    AVG(m.reactions) AS avg_reactions_range
FROM 
    classification c
JOIN 
    metrics m ON c.ccpost_id = m.ccpost_id
GROUP BY 
    text_length_range
    ) subquery;
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

app.get('/getData/notAgainst/useingHashtag=:boolian', (req, res) => {
    console.log(req.params.boolian)
    let whereStr = ''
    if (req.params.boolian === 'true') {
        whereStr = "and REGEXP_LIKE(all_post_text, '#')"
    }
    const query =
        `select avg(total_interactions)
        from classification
        inner join metrics
        on metrics.ccpost_id = classification.ccpost_id
        where gpt_ukraine_for_imod != "imod" ${whereStr};
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

