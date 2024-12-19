
const cron = require("node-cron");
const express = require("express");
const app = express();
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();


const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('4bebcbc9b0094879abad31b3dd1a1163');

console.log("Hello World");

app.use(cors()); 
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

  cron.schedule("0 * * * *", () => {
    console.log("Running /append-news cron job...");
    fetch("http://localhost:8080/append-news")
      .then(() => console.log("Cron job successfully triggered /append-news"))
      .catch((err) => console.error("Error in cron job:", err));
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

function isDateWithinLastHour(isoDateString) {
    const givenDate = new Date(isoDateString); // Convert the ISO string to a Date object
    const now = new Date(); // Get the current date and time
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // Calculate the time one hour ago
  
    return givenDate >= oneHourAgo && givenDate <= now;
  }

  app.get("/append-news", async (req, res) => {
    await newsapi.v2.topHeadlines({
        sources: "polygon",
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
            content: article.content,
        }));

        articles.forEach(article => {
            if (isDateWithinLastHour(article.publishedAt)) {
                const upsertQuery = `
                    INSERT INTO news (source, author, title, description, url, urlToImage, publishedAt, content)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(source, author, title) 
                    DO UPDATE SET 
                        description = excluded.description,
                        url = excluded.url,
                        urlToImage = excluded.urlToImage,
                        publishedAt = excluded.publishedAt,
                        content = excluded.content;
                `;

                db.run(
                    upsertQuery,
                    [
                        article.source.name,  // Source name
                        article.author,       // Author
                        article.title,        // Title
                        article.description,  // Description
                        article.url,          // URL
                        article.urlToImage,   // URL to Image
                        article.publishedAt,  // Published At
                        article.content,      // Content
                    ],
                    function (err) {
                        if (err) {
                            console.error("Error inserting/updating article", err.message);
                        } else {
                            console.log(`Article has been inserted/updated with rowid ${this.lastID}`);
                        }
                    }
                );
            }
        });

        res.status(200).send("Articles processed successfully.");
    }).catch(error => {
        console.error("Error fetching news:", error.message);
        res.status(500).send("Error fetching news.");
    });
});


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

