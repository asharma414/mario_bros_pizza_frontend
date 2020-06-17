// GLOBAL VARIABLE ASSIGNMENT AND DECLARATION

const mtoDiv = () => document.querySelector('#mto')
const specialsDiv = () => document.querySelector('#specials')
const loginDiv = () => document.querySelector('#login')
const logoutDiv = () => document.querySelector('#logout')
const kartDiv = () => document.querySelector('#kart')
const containerDiv = () => document.querySelector('.container')
const pageBodyDiv = () => document.querySelector("#pageBody")
const homeLinkDiv = () => document.querySelector("#home-link")
const loginForm = () => document.querySelector('#customer-login-form-modal')
const registerForm = () => document.querySelector("#customer-register-form-modal")
const registerDiv = () => document.querySelector('#register')
const orderForm = () => document.querySelector('#pizza-order-form')
const orderQty = () => document.querySelector("#pizza-quantity-input")

const baseURL = "http://localhost:3000"
const specialsURL = `${baseURL}/pizzas`
const ingredients = `${baseURL}/ingredients`
const orderURL = `${baseURL}/orders`

const headerObj = { 'Content-Type': 'application/json', Accept: 'application/json' }

let currentUser;
let todaysPrices;
let selectedSpecialPrice;

//DOM CONTENT LOADED

document.addEventListener('DOMContentLoaded', () => {
    mtoDiv().addEventListener('click', renderMTO)
    specialsDiv().addEventListener('click', renderSpecials)
    loginForm().addEventListener('submit', handleLogin)
    registerForm().addEventListener('submit', handleRegister)
    logoutDiv().addEventListener('click', logout)
    homeLinkDiv().addEventListener('click', renderHome)
    kartDiv().addEventListener('click', fetchKartItems)

    addCheckBoxes()
    orderForm().addEventListener('submit', handleOrder)
    orderForm().addEventListener('change', updatePrice)

    $('#pizzaOrderModal').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget) // Button that triggered the modal
        let btnData = button[0].getAttribute('data-button')

        if (btnData == 'custom') {
            orderForm().reset()
            document.getElementById('price').innerText = "7.00"
            // document.getElementById('order-button').innerText = 'Place Custom Order'
            orderForm().querySelectorAll('.form-check-input').forEach(group => group.disabled = false)
            orderForm().querySelectorAll('.form-control').forEach(group => group.disabled = false)
        } else {
            orderQty().value = 1;
            // document.getElementById('order-button').innerText = 'Place Special Order'
            orderForm().querySelectorAll('.form-check-input').forEach(group => group.disabled = true)
            orderForm().querySelectorAll('.form-control').forEach(group => group.disabled = true)
            orderForm().querySelector('#pizza-quantity-input').disabled = false;
            orderForm().querySelector('textarea').disabled = false;
        }
    })

    document.querySelector('.navbar-brand').appendChild(superMarioSpanGenerator('Mario Bros Pizza', 'tinyMario'))

    retrieveIngredientPrices()
    renderHome()
})

//HOME PAGE

const renderHome = () => {
    pageBodyDiv().innerHTML = ''
    let welcome = document.createElement('img')
    welcome.src = 'assets/welcomeMarioPizza.png'
    welcome.style.float = 'right'
    pageBodyDiv().appendChild(welcome)
}

//NAVBAR 

const inactivateNavItems = () => {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.className = 'nav-item'
    })
}

// Login and Registration

const handleLogin = (e) => {
    e.preventDefault()
    inactivateNavItems()
    if (!currentUser) {
        fetch(`${baseURL}/login`, {
            method: 'POST',
            headers: headerObj,
            body: JSON.stringify({
                username: e.target.username.value
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error)
                }
                else {
                    loginForm().reset()
                    currentUser = data
                    loginDiv().classList.add('d-none')
                    registerDiv().classList.add('d-none')
                    logoutDiv().classList.remove('d-none')
                    kartDiv().classList.remove('d-none')
                    let userSpan = document.createElement('span')
                    userSpan.className = 'navbar-text'
                    userSpan.innerText = `${currentUser.name}`
                    document.querySelector('.navbar').appendChild(userSpan)
                }
            })
    } else {
        logout()
    }
}

function logout(e) {
    currentUser = null;
    registerDiv().classList.remove('d-none')
    loginDiv().classList.remove('d-none')
    logoutDiv().classList.add('d-none')
    kartDiv().classList.add('d-none')
    document.querySelector('.navbar-text').remove()
    renderHome()
}

const handleRegister = (e) => {
    e.preventDefault();
    let address = e.target.address.value + ", " + e.target.city.value + ", " + e.target.state.value + " " + e.target.zip.value
    let body = {
        name: e.target.name.value,
        username: e.target.registerUsername.value,
        address: address
    }
    fetch(`${baseURL}/customers`, {
        method: 'POST',
        headers: headerObj,
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            if (data.errors) {
                let key = Object.keys(data.errors)[0]
                alert(data.errors[key])
            } else {
                registerForm().reset()
                $('#registerModal').modal('hide')
                alert(`Thank you for registering ${data.name}. Be sure to login with username "${data.username}" before you place an order!`)
            }

        }

        )
}

//ORDER FORM

const renderMTO = (e) => {
    inactivateNavItems()
    pageBodyDiv().innerHTML = ''
    e.target.parentNode.classList.add('active')
}

const updatePrice = (e) => {
    // debugger 
    if (orderForm().querySelector('.form-control').disabled == true ){
        //apply special price instead   
        let priceEl = document.getElementById('price')
        let price = selectedSpecialPrice
        let quantity = parseInt(document.getElementById('pizza-quantity-input').value)
        price *= quantity
        priceEl.innerText = price.toFixed(2)
    } else if (e.target.nodeName != 'TEXTAREA') {
        let priceEl = document.getElementById('price')
        let price = todaysPrices[1][e.currentTarget.size.value]
        let nodeList = document.querySelectorAll('input[type="checkbox"]:checked')
        let nodeArr = [...nodeList].map(ingredient => ingredient.dataset.category)
        nodeArr.forEach(ing => {
            price += todaysPrices[0][ing]
        })
        let quantity = document.getElementById('pizza-quantity-input').value
        price *= quantity
        priceEl.innerText = price.toFixed(2)
    } 
}

function retrieveIngredientPrices() {
    fetch(`${ingredients}/prices`)
        .then(r => r.json())
        .then(data => todaysPrices = data)
}

function handleOrder(e) {
    e.preventDefault()
    if (!currentUser) {
        alert("Please Log In!")
        $('#loginModal').modal('toggle')
    } else {
        // document.getElementById('order-button').innerText = 'Place custom order'
        let nodeList = document.querySelectorAll('input[type="checkbox"]:checked')
        let nodeArr = [...nodeList].map(ingredient => parseInt(ingredient.value))
        // debugger
        let body = {

            quantity: parseInt(e.target.quantity.value),
            customer_id: currentUser.id,
            size: e.target.size.value,
            bake: e.target.bake.value,
            cut: e.target.cut.value,
            ingredients: nodeArr,
            delivery_instructions: e.target.deliveryInstructions.value
        }

        fetch(orderURL, {
            method: 'POST',
            headers: headerObj,
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                orderForm().reset()
                alert(`Added ${data.quantity} pizzas to your kart.`)
            })
    }
}

function addCheckBoxes() {
    let ingredientCategories = ['veggie', 'cheese', 'sauce', 'meat']
    fetch(ingredients)
        .then(res => res.json())
        .then(ingredientAry => {
            ingredientCategories.forEach((ingredCat) => {
                let categoryForm = document.querySelector(`#${ingredCat}-category`)
                let filteredIngredientAry = ingredientAry.filter(i => i.category == ingredCat)
                let legend = document.createElement('legend')
                legend.innerText = ingredCat.replace(ingredCat.charAt(0), ingredCat.charAt(0).toUpperCase()) + 's'
                categoryForm.appendChild(legend)
                filteredIngredientAry.forEach((ing) => {
                    let divElement = document.createElement("div")
                    let inputElement = document.createElement("input")
                    let labelElement = document.createElement("label")
                    divElement.className = "form-check form-check-inline"
                    inputElement.className = "form-check-input"
                    labelElement.className = 'form-check-label'
                    labelElement.setAttribute('data-toggle', 'popover')
                    labelElement.setAttribute('data-content', `<img class='hover-pic' src="${ing.picture}" /><p class='hover-desc'>${ing.description}</p>`)
                    labelElement.setAttribute('data-trigger', 'hover')
                    $(function () {
                        $('[data-toggle="popover"]').popover({
                            html: true
                        })
                    })
                    inputElement.type = "checkbox"
                    inputElement.id = `ingredientId-${ing.id}`
                    inputElement.setAttribute('data-category', ingredCat)
                    labelElement.htmlFor = `ingredientId-${ing.id}`
                    labelElement.innerText = ing.name
                    inputElement.value = ing.id

                    divElement.append(inputElement, labelElement)
                    categoryForm.append(divElement)
                })
            })
        })
}



//SPECIAL CAROUSEL
const renderSpecials = (e) => {
    if (!document.querySelector('.specials')) {
        inactivateNavItems()
        pageBodyDiv().innerHTML = ''
        fetch(specialsURL)
            .then(r => r.json())
            .then(specialsAry => {
                pageBodyDiv().innerHTML = `<div id="specialsCarousel" class="carousel slide mt-4" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li data-target="#specialsCarousel" data-slide-to="0" class="active"></li>
                        <li data-target="#specialsCarousel" data-slide-to="1"></li>
                        <li data-target="#specialsCarousel" data-slide-to="2"></li>
                    </ol>
                    <div class="carousel-inner">
                    </div>
                    <a class="carousel-control-prev" href="#specialsCarousel" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#specialsCarousel" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                    </div>`
                specialsAry.forEach(renderCarouselImage)
            })
            .then(() => {
                e.target.parentNode.classList.add('active')
            })
    }
}



const renderCarouselImage = (spc) => {
    let carousel = document.getElementById('specialsCarousel')
    let inner = document.querySelector('.carousel-inner')

    let item = document.createElement('div')
    item.className = 'carousel-item'

    let img = document.createElement('img')
    img.src = spc.pic

    let caption = document.createElement('div')
    caption.className = "carousel-caption d-none d-md-block"

    let para = document.createElement('p')
    let buyBtn = document.createElement('button')
    buyBtn.className = 'btn-dark'
    buyBtn.setAttribute("data-target", "#pizzaOrderModal")
    buyBtn.setAttribute("data-toggle", "modal")
    buyBtn.setAttribute('data-button', 'special')
    // data-target='#pizzaOrderModal' data-toggle='modal'

    specialPrice = parseFloat(spc.price).toFixed(2)
    buyBtn.innerText = `Buy the ${spc.name} for $${specialPrice}`
    buyBtn.addEventListener("click", (e) => { handleSpecialBuyButton(e, spc) })
    para.appendChild(buyBtn)
    caption.appendChild(para)
    item.append(img, caption)
    inner.appendChild(item)

    inner.querySelector('.carousel-item').classList.add('active')
    carousel.setAttribute("data-interval", 3000)

}

const handleSpecialBuyButton = (e, spc) => {
    let specialPrice = parseFloat(spc.price).toFixed(2)
    let ingredientIdArray = spc.ingredients.map(spc => spc.id)
    ingredientIdArray.forEach(id => { orderForm().querySelector(`#ingredientId-${id}`).checked = true })
    selectedSpecialPrice = specialPrice
    document.getElementById('price').innerText = specialPrice
    document.getElementById('pizzaCutFormSelect').value = spc.cut
    document.getElementById('pizzaBakeFormSelect').value = spc.bake
    document.getElementById('pizzaSizeFormSelect').value = spc.size

}

//KART

function fetchKartItems(e) {
    user_id = currentUser.id
    fetch(`${orderURL}/${user_id}`)
        .then(res => res.json())
        .then(handleKartView)
}

function handleKartView(orderAry) {
    if (orderAry.length > 0) {
        let sum = orderAry.reduce(function (a, b) {
            return a + parseFloat(b.total_price);
        }, 0).toFixed(2);
        pageBodyDiv().innerHTML = `<div class="jumbotron mt-4 bg-dark text-light">
     <h3 class="display-4">${currentUser.name}'s Kart!</h3>
     <p class="lead">Your pizzas total to $<span id='total'>${sum}</span>.</p>
     <hr class="my-4 bg-white">
     <ul id="kartListOfPizza"></ul>
     <button id='checkout' class='btn btn-primary'>Checkout</button>
   </div>`
        let ordList = pageBodyDiv().querySelector("#kartListOfPizza")

        orderAry.forEach(ord => {
            let listEl = document.createElement('li')
            let removeButton = document.createElement('button')
            removeButton.className = 'btn-xs btn-danger'
            removeButton.setAttribute('data-order-id', ord.id)
            removeButton.innerText = 'remove'
            removeButton.addEventListener('click', removeFromKart)
            let ingList = ord.pizza.ingredients.map(ing => ing.name).join(', ')
            if (ord.pizza.name) {
                listEl.innerText = `${ord.quantity} x ${ord.pizza.name} which total(s) to $${parseFloat(ord.total_price).toFixed(2)} `
                listEl.appendChild(removeButton)
            } else {
                listEl.innerText = `${ord.quantity} x custom pizza with ${ingList} which total(s) to $${parseFloat(ord.total_price).toFixed(2)} `
                listEl.appendChild(removeButton)
            }
            ordList.appendChild(listEl)
        })

        pageBodyDiv().querySelector('#checkout').addEventListener('click', (e) => handleCheckout(e, orderAry, sum))
    } else {
       
        pageBodyDiv().replaceChild(superMarioSpanGenerator("You have no items in your Kart!"), pageBodyDiv().firstChild)
    }
}

const removeFromKart = (e) => {
    fetch(`${orderURL}/${e.target.getAttribute('data-order-id')}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        let price = parseFloat(document.querySelector('#total').innerText)
        price -= parseFloat(data.total_price)
        document.querySelector('#total').innerText = price
        //e.target.parentNode.remove()
        fetchKartItems() //not a great solution, but it's honest.
    })
}

const handleCheckout = (e, orderAry, sum) => {
    fetch(`${orderURL}/${currentUser.id}`, {
        method: 'POST',
        headers: headerObj,
        body: JSON.stringify({ order: orderAry.map(ord => ord.id) })
    })
        .then(res => res.json())
        .then(data => renderCheckoutDetails(data, sum))
}

const renderCheckoutDetails = (data, sum) => {
    let delivery_time = Math.ceil(parseFloat(data[0]))
    let delivery_instructions = data[1].pop().delivery_instructions
    pageBodyDiv().innerHTML = `<div class="jumbotron mt-4 bg-dark text-light">
    <h3 class="display-4">Thank you, ${currentUser.name}!</h3>
    <p class="lead">Your order total was $${sum}. Pizzas take about 25 minutes to prepare</p>
    <hr class="my-4 bg-white">
    <p>The pizza will be delivered to "${currentUser.address}" as per your address and instructions to "${delivery_instructions == "" ? "N/A" : delivery_instructions}". It will take ${delivery_time} minutes to deliver by bike.</p>
    </div>`
}

// :)

function superMarioSpanGenerator(string, size='headerMario') {
    let returnDiv = document.createElement('div')
    let strAry = string.split('')
    let colors = ['blueMario ', 'greenMario ', 'yellowMario ', 'redMario ']
    let last
    strAry.forEach((let) => {
        spn = document.createElement('span')
        let index = Math.floor(Math.random() * colors.length);
        if (index === last) {
            spn.className = colors[(index + 1) % 4] + size
            last = (index + 1) % 4
        } else {
            spn.className = colors[index] + size
            last = index
        }
        spn.innerText = let
        returnDiv.appendChild(spn)
    })
    return returnDiv
}
