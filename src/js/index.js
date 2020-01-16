import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';

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
    console.log(query);

    if (query) {
        //2: Create a new search object and add to state
        state.search = new Search(query);    
        
        //3: prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        //4: Search for recipes
        await state.search.getResults(); //available from f.contstructor method
        console.log(state.search.result);

        //5: Render results on UI (Only after we recieve results from API, so put async await into the function)
        clearLoader();
        searchView.renderResults(state.search.result);
    }
     
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault(); //prevents the form from submitting by default
    controlSearch(); 
});

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
const r = new Recipe(46956);
r.getRecipe();
console.log(r);

