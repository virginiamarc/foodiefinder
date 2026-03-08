import RecipeCard from "./RecipeCard";

function RecipeList({ recipes, onCardClick }) {
  if (!recipes.length) return <p>No recipes found.</p>;

  return (
    <div className="recipe-list">
        {recipes.map((recipe) => (
            <RecipeCard
                key={recipe.idMeal}
                title={recipe.strMeal}
                image={recipe.strMealThumb}
                onClick={() => onCardClick(recipe)} // pass the recipe data on click/>
            />
        ))}
    </div>
  );
}

export default RecipeList;