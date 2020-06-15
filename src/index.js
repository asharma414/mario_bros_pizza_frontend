const mtoDiv = () => document.querySelector('#mto')
const specialsDiv = () => document.querySelector('#specials')
const loginDiv = () => document.querySelector('#login')
const containerDiv = () => document.querySelector('.container')
const pageBodyDiv = () => document.querySelector("#pageBody")
const homeLinkDiv = () => document.querySelector("#home-link")
const loginForm = () => document.querySelector('#customer-login-form-modal')
const orderForm = () => document.querySelector('#pizza-order-form')
let currentUser;

const baseURL = "http://localhost:3000"
const specialsURL = `${baseURL}/pizzas`
const ingredients = `${baseURL}/ingredients`
const orderURL = `${baseURL}/orders`
let todaysPrices;

document.addEventListener('DOMContentLoaded', () => {
    mtoDiv().addEventListener('click', renderMTO)
    specialsDiv().addEventListener('click', renderSpecials)
    loginForm().addEventListener('submit', handleLogin)
    homeLinkDiv().addEventListener('click', renderHome)

    addCheeseChecks()
    addSauceChecks()
    addMeatChecks()
    addVeggieChecks()
    orderForm().addEventListener('submit', handleOrder)
    //['Veggie', 'Cheese', 'Sauce', 'Meet'].forEach(addChecks)
    //addChecks("Veggie")

    retrieveIngredientPrices()
})

function retrieveIngredientPrices() {
    fetch(`${ingredients}/prices`)
    .then(r => r.json())
    .then(data => todaysPrices = data)
}

function handleOrder(e) {
    let nodeList = document.querySelectorAll('input[type="checkbox"]:checked')
    let nodeArr = [...nodeList].map(ingredient => parseInt(ingredient.value))
    e.preventDefault()
    let body = {
        customer_id: currentUser.id,
        size: e.target.size.value,
        bake: e.target.bake.value,
        cut: e.target.cut.value,
        ingredients: nodeArr,
        delivery_instructions: e.target.deliveryInstructions.value
    }

    fetch(orderURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(console.log)
}


function addCheeseChecks() {
    let cheeseForm = document.querySelector("#cheese-category")

    fetch(ingredients)
        .then(r => r.json())
        .then(ingredientAry => ingredientAry.filter(i => i.category == 'cheese'))
        .then(cheeseAry => {
            cheeseAry.forEach((cheese) => {
                let divElement = document.createElement("div")
                let inputElement = document.createElement("input")
                let labelElement = document.createElement("label")
                divElement.className = "form-check form-check-inline"
                inputElement.className = "form-check-input"
                labelElement.className = 'form-check-label'
                inputElement.type = "checkbox"
                inputElement.id = `chzId-${cheese.name}`
                labelElement.htmlFor = `chzId-${cheese.name}`
                labelElement.innerText = cheese.name
                inputElement.value = `${cheese.id}`
                divElement.append(inputElement, labelElement)
                cheeseForm.append(divElement)
            })
        })
}

function addSauceChecks() {
    let sauceForm = document.querySelector("#sauce-category")

    fetch(ingredients)
        .then(r => r.json())
        .then(ingredientAry => ingredientAry.filter(i => i.category == 'sauce'))
        .then(sauceAry => {
            sauceAry.forEach((sauce) => {
                let divElement = document.createElement("div")
                let inputElement = document.createElement("input")
                let labelElement = document.createElement("label")
                divElement.className = "form-check form-check-inline"
                inputElement.className = "form-check-input"
                labelElement.className = 'form-check-label'
                inputElement.type = "checkbox"
                inputElement.id = `sauceId-${sauce.name}`
                labelElement.htmlFor = `sauceId-${sauce.name}`
                labelElement.innerText = sauce.name
                inputElement.value = `${sauce.id}`
                divElement.append(inputElement, labelElement)
                sauceForm.append(divElement)
            })
        })
}

function addMeatChecks() {
    let meatForm = document.querySelector("#meat-category")

    fetch(ingredients)
        .then(r => r.json())
        .then(ingredientAry => ingredientAry.filter(i => i.category == 'meat'))
        .then(meatAry => {
            meatAry.forEach((meat) => {
                let divElement = document.createElement("div")
                let inputElement = document.createElement("input")
                let labelElement = document.createElement("label")
                divElement.className = "form-check form-check-inline"
                inputElement.className = "form-check-input"
                labelElement.className = 'form-check-label'
                inputElement.type = "checkbox"
                inputElement.id = `meatId-${meat.name}`
                labelElement.htmlFor = `meatId-${meat.name}`
                labelElement.innerText = meat.name
                inputElement.value = `${meat.id}`
                divElement.append(inputElement, labelElement)
                meatForm.append(divElement)
            })
        })
}

function addVeggieChecks() {
    let veggieForm = document.querySelector("#veggie-category")

    fetch(ingredients)
        .then(r => r.json())
        .then(ingredientAry => ingredientAry.filter(i => i.category == 'veggie'))
        .then(veggieAry => {
            veggieAry.forEach((veggie) => {
                let divElement = document.createElement("div")
                let inputElement = document.createElement("input")
                let labelElement = document.createElement("label")
                divElement.className = "form-check form-check-inline"
                inputElement.className = "form-check-input"
                labelElement.className = 'form-check-label'
                inputElement.type = "checkbox"
                inputElement.id = `veggieId-${veggie.name}`
                labelElement.htmlFor = `veggieId-${veggie.name}`
                labelElement.innerText = veggie.name
                inputElement.value = `${veggie.id}`
                divElement.append(inputElement, labelElement)
                veggieForm.append(divElement)
            })
        })
}





const renderHome = () => {

}

const handleLogin = (e) => {
    e.preventDefault()
    inactivateNavItems()
    if (!currentUser) {
        fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                username: e.target.username.value
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    loginForm().reset()
                    alert(data.error)
                }
                else {
                    currentUser = data
                    loginDiv().innerText = 'Logout'
                    loginDiv().removeAttribute('data-target')
                    loginDiv().removeAttribute('data-toggle')
                    alert(`Welcome back, ${currentUser.name}`)
                }
            })
    } else {
        currentUser = null;
        loginDiv().innerText = 'Login'
        loginDiv().setAttribute('data-target', '#loginModal')
        loginDiv().setAttribute('data-toggle', 'modal')
    }
    //fetch(customers)
    //pageBodyDiv().innerHTML = ''
    //e.target.parentNode.classList.add('active')
}

// <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
// Launch demo modal
// </button>


const renderMTO = (e) => {
    inactivateNavItems()
    pageBodyDiv().innerHTML = ''
    e.target.parentNode.classList.add('active')

}

const renderSpecials = (e) => {
    if (!document.querySelector('.specials')) {
        inactivateNavItems()
        pageBodyDiv().innerHTML = ''
        fetch(specialsURL)
            .then(r => r.json())
            .then(specialsAry => {
                let rowDiv = document.createElement('div')
                rowDiv.className = 'row specials mt-5'
                pageBodyDiv().appendChild(rowDiv)
                specialsAry.forEach(renderSpecialCard)
            })
            .then(() => {
                e.target.parentNode.classList.add('active')
            })
    }
}


const inactivateNavItems = () => {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.className = 'nav-item'
    })
}

const renderSpecialCard = (spc) => {
    //console.log(spc)
    //we need a div class=row
    //then we append to the row 3 divs, 1 for each card
    let colDiv = document.createElement('div')
    colDiv.className = 'col-sm-4'

    let cardBodyDiv = document.createElement("div")
    let cardDiv = document.createElement("div")
    cardDiv.className = 'card'

    let image = document.createElement("img")
    image.className = 'card-img-top'
    image.src = spc.pic
    image.alt = spc.name

    let smallHeader = document.createElement("h5")
    smallHeader.className = 'card-title'
    smallHeader.innerText = spc.name

    let buyButton = document.createElement("button")
    buyButton.className = 'btn btn-primary'
    buyButton.innerText = "Order"
    buyButton.addEventListener('click', (e) => handleSpecialBuyButton(e, spc))

    cardBodyDiv.append(smallHeader, buyButton)
    cardDiv.append(image, cardBodyDiv)
    colDiv.appendChild(cardDiv)
    pageBodyDiv().querySelector(".row").appendChild(colDiv)

}

const handleSpecialBuyButton = (e, pz) => {
    alert(`Thanks for your purchase of ${pz.name}! It will cost $${pz.price}`)
    //TODO make this legit
}
