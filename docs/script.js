const theme = document.getElementById('theme')
const input = document.getElementById('input')
const suggestion = document.getElementById('suggestion')
const recepie = document.getElementById('recepie')

// loading user preference for them from local storage , default 'white'
let intialTheme = localStorage.getItem('theme') ?? 'white'

// fucntion to apply thme
const handleTheme = (themeColor) => { 
    localStorage.setItem('theme',themeColor) // storing premerence permenantly
    theme.textContent = themeColor == 'white' ? 'Dark' : 'Light'
    document.body.style.backgroundColor = themeColor
    document.body.style.color = themeColor == 'white' ? 'black' : 'white'
    suggestion.style.backgroundColor = themeColor
    input.style.color = themeColor =='white' ? 'black' :'white'
}

//Displaying "Not Found" if There is no suggestions are available
const notFound = (parentElem) => { 
    parentElem.innerHTML = ''
    const p = document.createElement('p')
    p.textContent = 'Not Found'
    p.style.color = 'red'
    parentElem.appendChild(p)
     parentElem.style.display = "Block"
}

//function to display selcted meal
const showIndividualRecepie = (meal) => { 
   suggestion.style.display = 'none'
   recepie.innerHTML = ''
  
   //filtering ingredients and its value from meal object 
   const ingredients = Object.keys(meal).filter(key => key.startsWith('strIngredient') && meal[key]).map(key => meal[key])
   const ingredientsValue = Object.keys(meal).filter(key => key.startsWith('strMeasure') && meal[key]).map(key => meal[key])
   
   //creating elements for displaying meal details
   let title = document.createElement('h1')
   let mealImage = document.createElement('img')
   let ingredientConatinerDiv = document.createElement('div')
   ingredientConatinerDiv.classList.add('ingredient-container')
   let descp = document.createElement('p')
   descp.textContent = "Description"
   let incgredientDescDiv = document.createElement('div')
   let ingredientDesc = document.createElement('p')
   let videoIFrame = document.createElement('iframe')
   videoIFrame.classList.add('video')
   
   //populate ingredients
   ingredients.forEach((item,i) => {
    let ingredientDiv = document.createElement('div')
    ingredientDiv.classList.add('ingredient')
    let ingredientName = document.createElement('p')
    let ingredientMeasure = document.createElement('p')
    ingredientName.textContent = item
    ingredientMeasure.textContent = ingredientsValue[i]
    ingredientDiv.appendChild(ingredientName)
    ingredientDiv.appendChild(ingredientMeasure)
    ingredientConatinerDiv.appendChild(ingredientDiv)
   })
   
   //set meal details
   title.textContent = meal.strMeal
   mealImage.src = meal.strMealThumb
   ingredientDesc.textContent = meal.strInstructions
   videoIFrame.src = 'https://www.youtube.com/embed/' +  meal.strYoutube.split('=')[1]
   incgredientDescDiv.appendChild(descp)
   incgredientDescDiv.appendChild(ingredientDesc)

   //Append elements to DOM
   recepie.appendChild(title) 
   recepie.appendChild(mealImage) 
   recepie.appendChild(ingredientConatinerDiv)
   recepie.appendChild(incgredientDescDiv)
   recepie.appendChild(videoIFrame)
   
   //Show recepie details
   recepie.style.display = 'flex'
}

//Functions to update search suggestion
const updateSuggestionDom = (list) => { 
    
    suggestion.innerHTML = '' //Clear previous suggestion
    
    //Generate new suggestion
    list.forEach(item => {
        let itemDiv = document.createElement('div')
        let itemImg  = document.createElement('img')
        let innerDiv = document.createElement('div')
        let itemTitle = document.createElement('p')
        let itemSubTitle = document.createElement('p')
        itemImg.src = item.strMealThumb
        itemTitle.textContent = item.strMeal
        itemSubTitle.textContent = item.strArea
        innerDiv.appendChild(itemTitle)
        innerDiv.appendChild(itemSubTitle)
        itemDiv.appendChild(itemImg)
        itemDiv.appendChild(innerDiv)
        itemDiv.classList.add('suggestion-items')
        itemDiv.onclick = () => showIndividualRecepie(item)
        suggestion.appendChild(itemDiv)

    })

    //Show suggestion
    suggestion.style.display = 'block'

}

//Function to delay fetching data (debounce)
function debounce(func, delay) { 
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

//Function to fetch recepies from theMealDB
const fetchRecepie = async(text) => {
    const result = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${text}`).then(res => res.json())
    
    if(result?.meals){
        //Show only the first 10 results
        updateSuggestionDom(result?.meals?.length  < 10 ? result?.meals : result?.meals?.slice(0,10) )
    }else{
        notFound(suggestion)
    }
   
} 

//Handle userInput with debounce
const handleInput = debounce((text) => fetchRecepie(text), 500)

//Initialize the app after DOM loads
document.addEventListener('DOMContentLoaded', () => { 
    handleTheme(intialTheme)

    //Toggle theme when clicking the button
    theme.addEventListener('click', () => { 
       intialTheme = intialTheme == 'white' ? 'black' : 'white'
       handleTheme(intialTheme) // updating the theme
    })
    
    //Fetch recepies when user types in the input field
    input.addEventListener('input', (e) => handleInput(e.target.value))

})