import React from "react";


function RecipeCard({ title, image, ingredients = [], onClick }) {
  return (
    <div className="recipe-card" onClick={onClick}>
      <img src={image} alt={title} />
      <h3>{title}</h3>
    </div>
  );
}

export default RecipeCard;