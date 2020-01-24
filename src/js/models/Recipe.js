import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe ()  {
        try {
            const result = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
        
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ingredients = result.data.recipe.ingredients;
        } catch (error) {
            console.log(error);
        }
    }
    
    calcTime() {
        //assuming we need 15 min for each 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    }
    
    calcServings() {
        this.servings = 4
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp','tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g']

        const newIngredients = this.ingredients.map(element => {

            //create universal units
            let ingredient = element.toLowerCase();
            unitsLong.forEach((unit, i) => { //access to element, index, and array as params
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            //remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ' ); //RegEx, replaces the parenthesis and inside with nothing

            //parse ingredients into count, unit, and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            //includes is a new method, returns true if element we pass in is in the array, false if not. So for each current element, we'll test to see if the element is inside of the unitsShort array, and b/c of findIndex, will return the position of where the test turns out to be true
            //for ex, ounces. Loops over the array, only will return true when there is an ounces element in the array, and will return the index where that happens. That's the only way to find the position of the the unit, where we don't know which unit we are looking for. 
           
            let objIngredient;

            if (unitIndex > -1) {
                //There is a unit
                const arrCount = arrIng.slice(0, unitIndex); 
                // ex 4 1/2 cups, arrCount is [4, 1/2] --> 
                // eval evaluates JS, so this become eval("4+1/2") = 4.5
                // 4 cups, arrCount is [4]
                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIngredient = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient:arrIng.slice(unitIndex + 1).join(' '),
                }
            }
            else if (parseInt(arrIng[0], 10)) {
                //There is no unit, but first element is a number. We convert the first element to see if it's a number. If it is, this will work, if not it wont. It will return NAN, coercing it to false.  
                objIngredient = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' '),
                }
            }
            else if (unitIndex === -1) {
                //There is no unit & no number in first position
                objIngredient = {
                    count: 1,
                    unit: '',
                    ingredient  //In es6, we can have this auto defined with a value attached to it,since we used 
                }
            }
           
            return objIngredient;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) { //type is going to be increase/decrease based on the button click
        //Servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;

        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        //Ingredients
        this.servings = newServings;
    }

}