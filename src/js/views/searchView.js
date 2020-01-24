import { elements } from "./base";

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = "";
};

export const clearResults = () => {
    elements.searchResultsList.innerHTML = "";
    elements.searchResPages.innerHTML = "";
};

export const highlightSelected = id => {
    const resultsArray = Array.from(document.querySelectorAll('.results__link'));
    resultsArray.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active')
};

export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if (title.length > limit) {
        title.split(' ').reduce((acc, curr) => {
            if (acc + curr.length <= limit) {
                newTitle.push(curr);
            }
            return acc + curr.length;
        }, 0);
        //return the result
        return `${newTitle.join(' ')} ...`
    }
    return title;   
};

const renderRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li> 
    `;
    elements.searchResultsList.insertAdjacentHTML('beforeend', markup);
};

const createButton = (page, type) => ` 
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page-1: page+1}>
    <span>Page ${type === 'prev' ? page-1: page+1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left': 'right'}"></use>
        </svg>
    </button>
`; 

const renderButtons = (page, numResults, resultsPerPage) => {
    const pages = Math.ceil(numResults / resultsPerPage) //rounds up for num of pages
    let button;
    
    if (page === 1) {
        //1 button to go to the next page
        button = createButton(page, 'next');
    }
    else if (page < pages) {
        //Both buttons encoded within a string that has both
        button = `
            ${createButton(page, 'prev')}
            ${createButton(page, 'next')}
        `;
    }
    else if (page === pages) {
        //Only button to go to the previous page
        button = createButton(page, 'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
}

export const renderResults = (recipes, page = 1, resultsPerPage = 10) => {
    //render results of current page
    const start = (page - 1) * resultsPerPage; //page 1 starts at 0, page 2 starts at 10
    const end = (page * resultsPerPage);
    recipes.slice(start, end).forEach(renderRecipe); //See documentation

    //render pagination buttons
    renderButtons(page, recipes.length, resultsPerPage);
};