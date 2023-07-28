import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../UserContext.js";
import { Link } from 'react-router-dom';
import "./Profile.css";
import {API_ID, API_KEY} from "../../../../constant.js";
import { url } from "../../../../constant.js";

export default function Profile() {
  const { currUser } = useContext(UserContext);
  const [favorites, setFavorites] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [mainIngredients, setMainIngredients] = useState([]);
  const [secondaryIngredients, setSecondaryIngredients] = useState([]);
  const [reccomendations, setReccomendations] = useState([]);
  const [cuisinesFetched, setCuisinesFetched] = useState(false);
  const [mainIngredientsFetched, setMainIngredientsFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  
  const fetchFavorites = async () => {
    const response = await fetch("http://localhost:3001/get_favorites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    setFavorites(data);
  };

  const topCuisines = async () => {
   const fetchedCuisine = await fetchCuisine();
   if(fetchedCuisine.length == 0){
     setIsLoading(false);
   }
   else{
     setCuisines(fetchedCuisine);
     setCuisinesFetched(true);
   }
  };

  const fetchCuisine = async () =>{
    const response = await fetch("http://localhost:3001/user_cuisines", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    console.log(data.topCuisines);
    return data.topCuisines;
  }
  
  const topIngredients = async () => {
    const mainIngs = await fetchMainIngredients();
    const secondaryIngs = await fetchSecondaryIngredients();
    if(mainIngs.length == 0){
      setIsLoading(false);
    }
    else{
      setMainIngredients(mainIngs);
      setSecondaryIngredients(secondaryIngs);
      setMainIngredientsFetched(true);
    }
    };
  
  const fetchMainIngredients = async () =>{
    const response = await fetch("http://localhost:3001/get_main_ings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return data.topThreeMain;
  }
  const fetchSecondaryIngredients = async () =>{
    const response = await fetch("http://localhost:3001/get_second_ings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return data.topThreeSecondary;
  }

  const generateReccomendations = async () =>{
    const response = await fetch("http://localhost:3001/generate_reccomendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body : JSON.stringify({mainIngredients, secondaryIngredients, cuisines}),
      credentials: "include",
    });
    const data = await response.json();
    console.log(data);
    setReccomendations(data);
    setIsLoading(false);
  }
  
  function allInfoMatches(fetched, cached) {
    const allFetchedInCache = [...fetched].every(fetch => cached.has(fetch));
    const allCachedInFetch = [...cached].every(cache => fetched.has(cache));
    return allFetchedInCache && allCachedInFetch;
  }

  const noChangeForReccs = async (cachedCuisine, cachedMainIngs, cachedSecondaryIngs) =>{
    const cachedCuisineSet = new Set(cachedCuisine);
    const cachedMainIngsSet = new Set(cachedMainIngs);
    const cachedSecondaryIngsSet = new Set(cachedSecondaryIngs);
    const fetchedCuisine = new Set(await fetchCuisine());
    const fetchedMainIngredients = new Set(await fetchMainIngredients());
    const fetchedSecondaryIngredients = new Set(await fetchSecondaryIngredients());
    console.log(fetchedMainIngredients);
    console.log(fetchedSecondaryIngredients)
    const cuisinesMatch = allInfoMatches(fetchedCuisine, cachedCuisineSet);
    const mainIngredientMatch = allInfoMatches(fetchedMainIngredients, cachedMainIngsSet);
    const secondaryIngredientMatch = allInfoMatches(fetchedSecondaryIngredients, cachedSecondaryIngsSet);
    return (cuisinesMatch && mainIngredientMatch && secondaryIngredientMatch);
  }

  useEffect(() => {
    const inCache = localStorage.getItem(`profile/${currUser.username}`);
    const determineCacheAction = async () => {
      if (inCache) {
        console.log(reccomendations);
        const profileInfo = JSON.parse(inCache);
        const noChange = await noChangeForReccs(profileInfo.cuisines, profileInfo.mainIngredients, profileInfo.secondaryIngredients);
        if (noChange) {
          console.log("no, this is running");
          setReccomendations(profileInfo.reccomendations);
          fetchFavorites();
          setMainIngredients(profileInfo.mainIngredients);
          setSecondaryIngredients(profileInfo.secondaryIngredients);
          setCuisines(profileInfo.cuisines);
          setIsLoading(false);
        } else {
          console.log("this is running");
          fetchFavorites();
          topCuisines();
          topIngredients();
        }
      }
      else {
        fetchFavorites();
        topCuisines();
        topIngredients(); 
      }
    };
  
    determineCacheAction();
  }, []);

  // since i have an awaiting expression to fetch the users favorite cuisines and the generateReccomendations function is an async function, 
  // I have to wait for the cuisines to update in the state in order to make the external api calls.
  useEffect(() => {
    console.log(isLoading);
    if (cuisines.length !== 0 && mainIngredients.length !== 0) {
      generateReccomendations();
    }
  }, [cuisinesFetched, mainIngredientsFetched])

  useEffect(() =>{
    console.log(reccomendations);
    if (reccomendations.length > 0){
      const cachedInfo = {
        mainIngredients,
        secondaryIngredients,
        cuisines,
        reccomendations
      };
      localStorage.setItem(`profile/${currUser.username}`, JSON.stringify(cachedInfo));
      const reccomendationsCacheTimeout = setTimeout(() => {localStorage.removeItem(`profile/${currUser.username}`);}, 600000);
    }
  }, [reccomendations]);

  return (
    <div>
      <p>Profile</p>
      <div>
        <div>
          <p>USERNAME {currUser.username}</p>
          <p>EMAIL {currUser.email}</p>
          <p>
            NAME {currUser.firstName} {currUser.lastName}
          </p>
          <p>
            HEIGHT {currUser.heightFt}'{currUser.heightIn}
          </p>
          <p>WEIGHT {currUser.weight} lbs</p>
        </div>
        <div>
            <h1>Favorites</h1>
          {favorites.length === 0 && (
            <div>
              <p>No Favorites</p>
            </div>
          )}
          {favorites && (
            <div>
              {favorites.map((fav) => {
                const recipeId = fav.recipeId;
                return (
                  <div>
                    <Link to= {`/searched/${recipeId}`}><h2>{fav.recipeName}</h2></Link>
                  </div>
                );
              })}
            </div>
          )}
          <div>
          
            <div>
            <h1>Recipes You Might Like</h1>
              {isLoading ? (
                <p>Loading recommendations...</p>
              ) : reccomendations.length == 0 ? (
                <p>No reccomendations to load</p>
              ) :
              (
                <div>
                  
                  
                  {reccomendations.map((rec) => {
                    const recipeId = rec.recipeId;
                    return (
                      <div>
                        <Link to= {`/searched/${recipeId}`}><h2>{rec.label}</h2></Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
        
          </div>
        </div>
      </div>
    </div>
  );
}
