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
let currentUser;

const baseURL = "http://localhost:3000"
const specialsURL = `${baseURL}/pizzas`
const ingredients = `${baseURL}/ingredients`
const orderURL = `${baseURL}/orders`
let todaysPrices;
 let selectedSpecialPrice;

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
            // document.getElementById('order-button').innerText = 'Place Special Order'
            orderForm().querySelectorAll('.form-check-input').forEach(group => group.disabled = true)
            orderForm().querySelectorAll('.form-control').forEach(group => group.disabled = true)
            orderForm().querySelector('#pizza-quantity-input').disabled = false;
            orderForm().querySelector('textarea').disabled = false;
        }
    })

    retrieveIngredientPrices()
    renderHome()
})

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
        pageBodyDiv().innerHTML = 'You have no items in your kart'
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
        e.target.parentNode.remove()
    })
}

const handleCheckout = (e, orderAry, sum) => {
    fetch(`${orderURL}/${currentUser.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ order: orderAry.map(ord => ord.id) })
    })
        .then(res => res.json())
        .then(data => renderCheckoutDetails(data, sum))
}

const renderCheckoutDetails = (data, sum) => {
    pageBodyDiv().innerHTML = `<div class="jumbotron mt-4 bg-dark text-light">
    <h3 class="display-4">Thank you, ${currentUser.name}!</h3>
    <p class="lead">Your order total was $${sum}. Pizzas take about 25 minutes to prepare</p>
    <hr class="my-4 bg-white">
    <p>The pizza will be delivered to ${currentUser.address} as per your address and instructions to "${data.pop().delivery_instructions}"</p>
    </div>`
}

const handleRegister = (e) => {
    e.preventDefault();
    let body = {
        name: e.target.name.value,
        username: e.target.registerUsername.value,
        address: e.target.address.value
    }
    fetch(`${baseURL}/customers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            alert(`Thank you for registering ${data.name}. Be sure to login with username "${data.username}" before you place an order!`)
        })
}

const updatePrice = (e) => {
    // debugger 
    if (orderForm().querySelector('.form-control').disabled == true ){
        //apply special price instead
        debugger    
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
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(data => {
                orderForm().reset()
                renderOrderDetails(data)
            })
    }
}

const renderOrderDetails = (data) => {
    alert(`Added ${data.quantity} pizzas to your kart.`)

}

function addCheckBoxes() {
    let ingredientCategories = ['veggie', 'cheese', 'sauce', 'meat']
    fetch(ingredients)
        .then(res => res.json())
        .then(ingredientAry => {
            ingredientCategories.forEach((ingredCat) => {
                let categoryForm = document.querySelector(`#${ingredCat}-category`)
                let filteredIngredientAry = ingredientAry.filter(i => i.category == ingredCat)
                filteredIngredientAry.forEach((ing) => {
                    let divElement = document.createElement("div")
                    let inputElement = document.createElement("input")
                    let labelElement = document.createElement("label")
                    divElement.className = "form-check form-check-inline"
                    inputElement.className = "form-check-input"
                    labelElement.className = 'form-check-label'
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

const renderHome = () => {
    pageBodyDiv().innerHTML = ''
    let welcome = document.createElement('img')
    welcome.src = 'assets/welcomeMarioPizza.png'
    welcome.style.float = 'right'
    pageBodyDiv().appendChild(welcome)
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
                    loginDiv().classList.add('d-none')
                    registerDiv().classList.add('d-none')
                    logoutDiv().classList.remove('d-none')
                    kartDiv().classList.remove('d-none')
                    alert(`Welcome back, ${currentUser.name}`)
                }
            })
    } else {
        logout()
    }
}

function logout(e) {
    alert(`Thank you for your business, ${currentUser.name}!`)
    currentUser = null;
    registerDiv().classList.remove('d-none')
    loginDiv().classList.remove('d-none')
    logoutDiv().classList.add('d-none')
    kartDiv().classList.add('d-none')
    renderHome()
}



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


const inactivateNavItems = () => {
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.className = 'nav-item'
    })
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


