import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';



/** Global state of the app
 * -Search object
 * -Current recipe object
 * -Shopping list object
 * -Liked recipes
 */
const state = {};


const controlSearch = async () => {
    //1: get query from view
    const query = searchView.getInput();
    
    if (query) {
        //2: Create a new search object and add to state
        state.search = new Search(query);    
        
        //3: prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        try {
            //4: Search for recipes
            await state.search.getResults(); //available from f.contstructor method
            console.log(state.search.result);

            //5: Render results on UI (Only after we recieve results from API, so put async await into the function)
            clearLoader();
            searchView.renderResults(state.search.result);
        } 
        catch (error) {
            alert('Something went wrong with the search');
            clearLoader();
        }
        
    }
     
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); //prevents the form from submitting by default
    controlSearch(); 
});

//TEsting
/*
window.addEventListener('load', e => {
    e.preventDefault(); //prevents the form from submitting by default
    controlSearch(); 
});
*/

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        
        searchView.renderResults(state.search.result, goToPage);
    }
});


/**
 * Recipe controller
 */
const controlRecipe = async () => {
    //Get ID from URL
     const id = window.location.hash.replace('#', '');
     //console.log(id);
     
     //Steps we do if we have an ID
     if(id) {
         //Prepare the UI for changes
         recipeView.clearRecipe();
         renderLoader(elements.recipe);

         //if there is a search result
         if(state.search){
             //find the index of the recipe in the result list
            const index = state.search.result.findIndex(el => el.recipe_id === id);
           
            //if found
            if (index !== -1) {
                //Clear the current results page
                searchView.clearResults();
                //go to the page where the recipe is located
                searchView.renderResults(state.search.result, Math.ceil((index + 1) / 10));
        
                //Highlight selected search item
         
                searchView.highlightSelected(id);
        
            }
         }    


         //Create new recipe object
         state.recipe = new Recipe(id);

         try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id) //will test if it is liked, returns true or false
                );

         } catch (error) {
             alert('Error processing recipe');
         }
         
     }
 }

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//List controller

const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid; //will get the ID

    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);

         //Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10); 
        state.list.updateCount(id, val);
    }
});



//Testing
//state.likes = new Likes();
//likesView.toggleLikesMenu(state.likes.getNumLikes());


//Likes controller
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    
const currentID = state.recipe.id;

    //user has NOT yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title, 
            state.recipe.author, 
            state.recipe.img
            );
        //Toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to the UI list
       likesView.renderLike(newLike);

    //User HAS liked current recipe    
    } else {
        //remove like from the state
        state.likes.deleteLike(currentID);
        console.log(state.likes);
        //toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like from UI list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikesMenu(state.likes.getNumLikes());
};


//Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore likes
    state.likes.readStorage();

    //Toggle like menu button
    likesView.toggleLikesMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});



//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) { //second selector is all children of button decrease 
        //Decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Call like controller
        controlLike();
    }
});

//window.l = new List(); 