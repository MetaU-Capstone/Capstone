import React, { useRef, useContext, useState } from "react";
import { UserContext } from "../../UserContext.js";
import "./UploadRecipe.css";
import { useNavigate } from 'react-router-dom';

export default function UploadRecipe({cuisineList}) {
  const navigate = useNavigate();
  const { currUser } = useContext(UserContext);
  const ingRef = useRef(null);
  const ingQuant = useRef(null);
  const ingWeight = useRef(null);
  const directionsRef = useRef(null);
  const [newCuisine, setNewCuisine] = useState(false);
  //ingredientLines holds the entire text of each ingredient: ex) 1 apple
  // ingredients is more individual stored in arr of objects :
  //                  qty: 1
  //                  food: apple
  const [recipe, setRecipe] = useState({
    label: "",
    recipeSource: `Username: ${currUser.username}`,
    ingredientLines: [],
    ingredients: [],
    directions: [],
    url: "",
    calories: 0,
    servings: 0,
    cuisine: "",
    image: "https://static.thenounproject.com/png/526867-200.png"
  });

  async function uploadRecipe(event) {
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:3001/add_recipe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
        credentials: "include",
      });
      alert("Recipe Added");
      navigate('/');
    } catch (error) {
      alert({ error });
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log(name);
    console.log(value);
    setRecipe({
      ...recipe,
      [name]: value,
    });
    setNewCuisine(value === "Other");
  };

  const addIng = (event, name) =>{
    event.preventDefault();
    //updates array with entire line
    const updatedIngredientList = [...recipe[name]];
    updatedIngredientList.push(ingQuant.current.value + " " + ingRef.current.value);
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: updatedIngredientList,
    }));
    //updates array with specific info seperated
    const updatedIngredients = [...recipe["ingredients"]];
    updatedIngredients.push({ 
      text: ingQuant.current.value + " " + ingRef.current.value,
      quantity : ingQuant.current.value,
      food : ingRef.current.value, 
      weight: ingWeight.current.value
    });
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      ["ingredients"]: updatedIngredients,
    }));
    
    ingQuant.current.value = "";
    ingRef.current.value = "";
    ingWeight.current.value = 0;
  }

  const removeIng = (event, ingredient) => {
    event.preventDefault();
    //updates array with entire line
    const updatedIngredients = [...recipe["ingredients"]];
    const index = updatedIngredients.indexOf(ingredient);
    console.log(index);
    updatedIngredients.splice(index, 1);
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      ["ingredients"]: updatedIngredients,
    }));
    //updates array with specific info seperated
    const updatedIngredientList = [...recipe["ingredientLines"]];
    updatedIngredientList.splice(index, 1);
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      ["ingredientLines"]: updatedIngredientList,
    }));
  }

  const addDirections = (event, name) =>{
    event.preventDefault();
    const updateDirections = [...recipe["directions"]];
    updateDirections.push(directionsRef.current.value);
    setRecipe({
      ...recipe,
      ["directions"]: updateDirections
    });
    directionsRef.current.value = "";
  }

  console.log(recipe);
  return (
    <div>
      <h1>Upload A Recipe!</h1>
      <form onSubmit={uploadRecipe}>
        <div>
          <input
            type="text"
            id="label"
            name="label"
            onChange={handleChange}
            placeholder="Add Recipe Name..."
            required
          />
        </div>
        <div>
          <input
            type="text"
            id="ingredientQuantity"
            name="ingredientQuantity"
            placeholder="Add Quantity..."
            ref={ingQuant}
          />
          <input
            type="text"
            id="ingredientLines"
            name="ingredientLines"
            placeholder="Add Ingredient..."
            ref={ingRef}
          />
          <input
            type="number"
            step={1}
            id="ingredientWeight"
            name="ingredientWeight"
            placeholder="Add Ingredient Weight..."
            ref={ingWeight}
          />
          <button onClick={(event) => addIng(event, "ingredientLines")}>Add</button>
        </div>
        
        <div>
          <input
            type="number"
            step={1}
            id="servings"
            name="servings"
            onChange={handleChange}
            placeholder="Add Servings..."
            required
          />
        </div>
        <div>
          <input
            type="number"
            step={1}
            id="calories"
            name="calories"
            onChange={handleChange}
            placeholder="Add Calories..."
            required
          />
        </div>
        <div>
          <select
            id="cuisine"
            name="cuisine"
            value={recipe.cuisine}
            onChange={handleChange}
          >
            {cuisineList.map((cuisine) => (
            <option value={cuisine.cusineCode}>
                {cuisine.cuisineName}
            </option>
            ))}
            <option value="Other">Other</option> 
          </select>

          {newCuisine && (
            <input
              type="text"
              placeholder="Enter cuisine"
              onChange={(event) =>
                setRecipe({ ...recipe, cuisine: event.target.value })
              }
              required
            />
          )}
        </div>
        <div>
          <input 
          name="directions" 
          id="directions" 
          cols="30" 
          rows="10"
          placeholder="Recipe Directions..."
          ref={directionsRef}
          />
          <button onClick={(event) => addDirections(event, "directions")}>Add</button>
        </div>
        <button type="submit">Upload Recipe</button>
      </form>
    <div>
      <h1>Your recipe</h1>
      <h2>{recipe.label}</h2>
      <h3>{recipe.recipeSource}</h3>
      <h4>Ingredients</h4>
      {
        recipe.ingredients.map((ingredient) => (
          <div>
            <p>{ingredient.text}</p> <button onClick={(event) => removeIng(event, ingredient)}>x</button>
          </div>
        ))
      }
      <h4>Servings: </h4> <p>{recipe.servings}</p>
      <h4>Calories: </h4> <p>{recipe.calories}</p>
      <h4>Cuisine: </h4> <p>{recipe.cuisine}</p>
      <h5>Directions</h5> <p>{recipe.directions}</p>
      {
        recipe.directions.map((step) => (
            <div>{console.log(step)}<p>{step}</p></div>
        ))
      }
    </div>
  </div>
);
}