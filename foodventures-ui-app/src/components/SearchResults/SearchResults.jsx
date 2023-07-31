import React, { useEffect, useState } from "react";
import "./SearchResults.css";
import {API_ID, API_KEY} from "../../../constant.js";
import { Link, useParams } from 'react-router-dom';
import SearchParams from "../SearchParams/SearchParams";
import { url } from "../../../constant.js";

export default function SearchResults({cuisineList, cuisine, search, updateSearch, updateCuisine}) {
  const [currRecipes, updateRecipes] = useState([]);
  const [loadStatus, setLoadStatus] = useState(true);

  const apiCall = async () =>{
    const responseInternalAPI = await fetch(`http://localhost:3001/get_recipes?cuisine=${cuisine}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let results = []
    const recipes = await responseInternalAPI.json();
    console.log(recipes);
    results = results.concat(recipes);
    const responseExternalApi = await fetch(url({cuisine, q: search}));
    const urlRecipes = await responseExternalApi.json();
    console.log(urlRecipes);
    results= results.concat(urlRecipes.hits)
    console.log(results);
    updateRecipes(results);
  };

  useEffect(() =>{
    apiCall();
    setLoadStatus(false);
  }, [cuisine, search]);

  return (
    <div>
        <h1 className="title">Search</h1>
        <div>
        <SearchParams cuisineList = {cuisineList} updateSearch = {updateSearch} updateCuisine = {updateCuisine}/>
        </div>
        {cuisine !== "" &&
          <h1 className="title">{cuisine}</h1>
        }
        <div className="container mt-3 mr-1">
          <div className="row">
            {loadStatus ? (
              <div class="d-flex justify-content-center spinner-view">
                <div class="spinner-border" role="status">
                </div>
              </div>
            ) : currRecipes.length == 0 ? (
              <h5 className="title">No Recipes Found</h5>
            ):(
              currRecipes.map((recipe) => {
                // using substring method to extract recipeId
                let recipeId = "";
                {recipe._links? (
                  recipeId = recipe._links.self.href.substring(38, 71)
                  ):(
                  recipeId = recipe.recipeId
                )}
                return (
                  <div className="col-md-3">
                    <div className="border p-4 text-center">
                      <img src={recipe.recipe.image} alt={recipe.recipe.label} className="img-fluid" />
                      <Link to={`/searched/${recipeId}`}>
                        <h2>{recipe.recipe.label}</h2>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
    </div>
  )
}