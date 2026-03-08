import { useState } from "react";
import SearchBar from "./components/SearchBar";
import RecipeList from "./components/RecipeList";
import "./App.css";
import logo from "./assets/logo.png";
import { categoryIcons } from "./utils/categoryIcons";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recipes from TheMealDB
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      setRecipes([]);
      return;
    }

    setLoading(true); // start loading
    setError(null); // clear previous errors

    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      );
      const data = await res.json();

      if (!data.meals) {
        setRecipes([]);
        setError("No recipes found. Try a different search term.");
      } else {
        setRecipes(data.meals);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("An error occurred while fetching recipes. Please try again.");
    } finally {
      setLoading(false); // end loading
    }
  };

  const handleCardClick = (recipe) => setSelectedRecipe(recipe);
  const closeModal = () => setSelectedRecipe(null);

  // Extract ingredients and measurements
  const getIngredients = (recipe) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`]?.trim();
      const measure = recipe[`strMeasure${i}`]?.trim();
      if (ingredient) {
        ingredients.push(measure ? `${ingredient} - ${measure}` : ingredient);
      }
    }
    return ingredients;
  };

  // Extract YouTube embed URL
  const getYoutubeEmbed = (url) => {
    if (!url) return null;
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const isYouTubeEmbeddable = (url) => {
    if (!url) return false;
    const videoId = url.split("v=")[1]?.split("&")[0];
    return !!videoId; // simple check for valid video ID
  }

  const formatInstructions = (text) => {
    if (!text) return [];

    // Split into sentences
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const steps = []; 
    let buffer = "";

    sentences.forEach(line => {
      //Remove leading numbers like "1. "
      line = line.replace(/^\d+\.\s*/, "");
      const isStepHeader = /^step\s*\d+[:\-]*/i.test(line);

      if (isStepHeader) {
        // If we already have content, push it
        if (buffer) {
          steps.push(buffer.trim());
          buffer = "";
        }
        // Skip the literal "Step X" text entirely
        return;
      }

      // If the line is long, treat it as a full step
      if (line.length > 120) {
        if (buffer) {
          steps.push(buffer.trim());
          buffer = "";
        }
        steps.push(line);
        return;
      }

      // Otherwise, merge short lines into a single step
      buffer += (buffer ? " " : "") + line;
    });

    if (buffer) steps.push(buffer.trim());

    return steps;
  };

  const getIcon = (recipe) => {
    const name = recipe.strMeal.toLowerCase();
    
    // Keyword-based overrides
    if (name.includes("cookie")) return "🍪";
    if (name.includes("ice cream")) return "🍨";
    if (name.includes("pancake")) return "🥞";
    if (name.includes("brownie")) return "🍫";
    if (name.includes("donut") || name.includes("doughnut")) return "🍩";

    // Default to category icon
    return categoryIcons[recipe.strCategory] || "🍽️";
  };


  // Compute ingredients once for the modal
  const ingredients = selectedRecipe ? getIngredients(selectedRecipe) : [];


  return (
    <div className="app-container">

      <main>
        <div className="main-content">

          <header className="hero">
            <img src={logo} alt="FoodieFinder Logo" className="logo" />
            <h1>FoodieFinder</h1>
            <p>Discover, Cook, Enjoy!</p>
          </header>

          <SearchBar onSearch={handleSearch} />
          {loading && <p className="loading">Loading recipes...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && recipes.length > 0 && (
            <>
              <p className="recipe-count">
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} found
              </p>
              <RecipeList recipes={recipes} onCardClick={handleCardClick} />
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedRecipe && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRecipe.strMeal}</h2>

            <img
              src={selectedRecipe.strMealThumb}
              alt={selectedRecipe.strMeal}
            />

            <h3>Ingredients</h3>
            <ul className="ingredient-list">
              {ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h3>Instructions</h3>
            <ul className="instruction-list">
              {formatInstructions(selectedRecipe.strInstructions).map((step, index) => (
                <li key={index}>
                  <span className="step-icon">
                    {getIcon(selectedRecipe)}
                  </span>
                  {step}
                </li>
              ))}
            </ul>

            {selectedRecipe.strYoutube && (
              <div className="youtube-video">
                <h3>Video Tutorial</h3>
                
                {/* Try to embed the video */}
                <iframe
                  id="yt-frame"
                  width="100%"
                  height="315"
                  src={getYoutubeEmbed(selectedRecipe.strYoutube)}
                  title={selectedRecipe.strMeal}
                  frameBorder="0"
                  allowFullScreen
                  onError={(e) => {
                    // Give YouTube a moment to render its overlay
                    setTimeout(() => {
                      const iframe = document.getElementById("yt-frame");

                      // If You// If YouTube blocks the video, the iframe height collapses or overlays appear
                      if (
                        iframe &&
                        (iframe.contentWindow === null || iframe.clientHeight < 200)
                      ) {
                        iframe.style.display = "none";
                        const fallback = document.getElementById("yt-fallback");
                        if (fallback) fallback.style.display = "block";
                      }
                    }, 500);
                  }}
                ></iframe>

                {/* Fallback button */}
                <a
                  id="yt-fallback"
                  href={selectedRecipe.strYoutube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-button"
                  style={{ display: "none" }}
                >
                  Watch on YouTube
                </a>
              </div>
            )}

            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
      <footer className="footer">
        © {new Date().getFullYear()} Virginia Marc
      </footer>
    </div>
  );
}

export default App;