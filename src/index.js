const mtoDiv = () => document.querySelector('#mto')
const specialsDiv = () => document.querySelector('#specials')
const loginDiv = () => document.querySelector('#login')
const containerDiv = () => document.querySelector('.container')
const pageBodyDiv = () => document.querySelector("#pageBody")
const homeLinkDiv = () => document.querySelector("#home-link")

const baseURL = "http://localhost:3000/"
const specialsURL = `${baseURL}/pizzas`

document.addEventListener('DOMContentLoaded', () => {
    mtoDiv().addEventListener('click', renderMTO)
    specialsDiv().addEventListener('click', renderSpecials)
    loginDiv().addEventListener('click', renderLogin)
    homeLinkDiv().addEventListener('click', renderHome)
})

const renderHome =() => {

}

const renderMTO = () => {

}

const renderSpecials = (e) => {
    if e.target.className
    fetch(specialsURL)
    .then(r => r.json())
    .then(specialsAry => {
        let rowDiv = document.createElement('div')
        rowDiv.className = 'row mt-5'
        pageBodyDiv().appendChild(rowDiv)
        specialsAry.forEach(renderSpecialCard)} )
    .then(() => {})

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



const renderLogin = () => {

}
