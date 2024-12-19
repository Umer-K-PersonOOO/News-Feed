import logo from "./logo.svg";
import "./App.css";
import ArticleCard from "./ArticleTab";
import { useEffect, useState } from "react";

function App() {
  const [articles, setArticles] = useState([]);

  const retrieveArticles = () => {
    console.log("retrieveArticles called");
    fetch("http://localhost:8080/get-articles")
      .then((response) => response.json())
      .then((data) => {
        setArticles(data); // Replace the articles array instead of appending
      });
  };

  useEffect(() => {
    console.log("useEffect called");
    retrieveArticles();
  }, []);

  return (
    <div>
      {/* <button onClick={retrieveArticles}>Visible Button</button> */}

      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default App;
