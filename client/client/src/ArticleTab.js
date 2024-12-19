import React from "react";
import PropTypes from "prop-types";
import "./ArticleCard.css"; // Assume you have a CSS file for styling

const ArticleCard = ({ article }) => {
  /* { article } */
  return (
    <div className="article-card">
      <img
        src={article.urlToImage}
        alt={article.title}
        className="article-image"
      />
      <div className="article-content">
        <h2 className="article-title">{article.title}</h2>
        <p className="article-author">By {article.author}</p>
        <p className="article-description">{article.description}</p>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="article-link"
        >
          Read more
        </a>
        <p className="article-published">
          Published on: {new Date(article.publishedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ArticleCard.propTypes = {
//   article: PropTypes.shape({
//     source: PropTypes.object,
//     author: PropTypes.string,
//     title: PropTypes.string,
//     description: PropTypes.string,
//     url: PropTypes.string,
//     urlToImage: PropTypes.string,
//     publishedAt: PropTypes.string,
//     content: PropTypes.string,
//   }).isRequired,
// };

export default ArticleCard;
