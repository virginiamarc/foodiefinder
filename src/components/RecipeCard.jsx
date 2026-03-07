import React from "react";

function RecipeCard({ title, image, onClick }) {
  return (
    <div className="recipe-card"
      onClick={onClick}
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        width: "200px",
        cursor: "pointer",
      }}
    >
      <img src={image} alt={title} style={{ width: "100%" }} />
      <h3>{title}</h3>
    </div>
  );
}

export default RecipeCard;