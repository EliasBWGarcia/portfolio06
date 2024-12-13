const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const _ = require('lodash');
const stopwordsIso = require('stopwords-iso'); // Correct usage of stopwords-iso

// List of supported languages for stopwords
const supportedLanguages = ['en', 'fr', 'da', 'de']; // English, French, Danish, German

// Synonym Mapping
const synonymMapping = {
    'guerre': 'krig', // Both mean "war"
    'krieg': 'krig',
    'russische': 'russer',
    'russie': 'russer',
    'russischen': 'russer',
    'ukrainische': 'ukraine',
    'ukraine': 'ukraine',
    'russe': 'russer',
    'russie': 'russer',
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
    'russland': 'russer',
    'präsident': 'putin',
    'russlands': 'rusland',
    'russia': 'russer',
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
    'russes': 'russer',
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
     'germany', 'france', 'rusland', 'frieden', 'danmark', 'krig', 'lage', 'ukraine' // Example of specific terms you may want to ignore
]);


const app = express();
const port = 3000;

app.use(cors());

const connection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password: process.env.password,
    database: process.env.database
});

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

