import logo from "./logo.svg";
import "./App.css";
import ArticleTab from "./ArticleTab";
import {useEffect, useState} from "react";

function App() {


  const [articles, setArticles] = useState([]); 

  const retrieveArticles = () => { 
    fetch('http://localhost:8080/get-articles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }, 
    }).then(response => response.json())
    .then(data => {
      respone
    })

  }


  return (
    <div>
      <ArticleTab  />
    </div>
  );
}

export default App;
