const mtoDiv = () => document.querySelector('#mto')
const specialsDiv = () => document.querySelector('#specials')
const loginDiv = () => document.querySelector('#login')
const containerDiv = () => document.querySelector('.container')
const pageBodyDiv = () => document.querySelector("#pageBody")
const homeLinkDiv = () => document.querySelector("#home-link")
const loginForm = () => document.querySelector('#customer-login-form-modal')
let currentUser;

const baseURL = "http://localhost:3000"
const specialsURL = `${baseURL}/pizzas`

document.addEventListener('DOMContentLoaded', () => {
    mtoDiv().addEventListener('click', renderMTO)
    specialsDiv().addEventListener('click', renderSpecials)
    loginForm().addEventListener('submit', handleLogin)
    homeLinkDiv().addEventListener('click', renderHome)

})

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
            alert(data.error)
        }
        else {
            currentUser = data
            loginDiv().innerText = 'Logout'
            loginDiv().removeAttribute('data-target')
            loginDiv().removeAttribute('data-toggle')
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
            specialsAry.forEach(renderSpecialCard)} )
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

const renderSpecialCard = (spc) =>  {
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
