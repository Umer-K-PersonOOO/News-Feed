

const express = require("express");
const app = express();
const sqlite3 = require('sqlite3').verbose();


const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('4bebcbc9b0094879abad31b3dd1a1163');

console.log("Hello World");

app.use(express.json());

const db = new sqlite3.Database('./example.db', (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log('Connected to SQLite database.');
      db.run(`CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT,
        author TEXT,
        title TEXT,
        description TEXT,
        url TEXT,
        urlToImage TEXT,
        publishedAt DATE,
        content TEXT
      )`, (err) => {
        if (err) {
          console.error('Error creating table', err.message);
        } else {
          console.log('News table created or already exists.');
        }
      });
    }
  });

  

app.listen(8080, () => {
  console.log("server listening on port 8080");
});



app.get("/news-api", async (res, req) => {
    await newsapi.v2.topHeadlines({
        sources: 'polygon',
      }).then(response => {
        console.log(response);

        const articles = response.articles.map(article => ({
            source: article.source,
            author: article.author, 
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            content: article.content
        }));

        articles.forEach(article => {

            const insertQuery = `INSERT INTO news (source, author, title, description, url, urlToImage, publishedAt, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(insertQuery, [
                article.source.name,  // Source name
                article.author,       // Author
                article.title,        // Title
                article.description,  // Description
                article.url,          // URL
                article.urlToImage,   // URL to Image
                article.publishedAt,  // Published At
                article.content        // Content
            ], function (err) {
                if (err) {
                    console.error('Error inserting article', err.message);
                } else {
                    console.log(`A new row has been inserted with rowid ${this.lastID}`);
                }
            });
            
        });

          
        // console.log(response.articles[0].source.name); How to get source name
      });
})

app.get("/", (req, res) => {
  res.send("Hello from our server!");
  console.log("Hello from our server!");
});


app.get("/print-database", (req, res) => {
    db.all(`SELECT * FROM news`, (err, rows) => {
        if (err) {
          console.error('Error getting articles', err.message);
        } else {
          console.log('Articles:', rows);
        }
      });
});

app.get("/get-articles", (req, res) => {
    db.all(`SELECT * FROM news`, (err, rows) => {
        if (err) {
          console.error('Error getting articles', err.message);
        } else {
          res.json(rows);
        }
      });
});

