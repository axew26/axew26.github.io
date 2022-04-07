/* Api pokemon */
const apiEnd = "https://pokeapi.co/api/v2/pokemon/"

const pokeStructure = {
    placeHolder: document.querySelector("#search_something"),
    container: document.querySelector("#searched_pokemon"),
    name: document.querySelector("#pokemon_name"),
    image: document.querySelector("#pokemon_image"),
    type: document.querySelector("#types_container"),
    stats: document.querySelector("tbody")
}

const alert = document.querySelector(".alert")

rxjs.fromEvent(document.querySelector("#searchButton"), 'click')
    .pipe(
        rxjs.operators.throttleTime(5000),
    )
    .subscribe(
        __=>{
            document.querySelector("#searchName").value?
                getPokemon(document.querySelector("#searchName").value):
                alertAction("Writte something ... ","alert-warning")
        }
    );

const getPokemon = (param)=>{
    let isValid = RegExp(/([0-9]|[a-zA-Z])+/).test(param)

    if(!isValid){
        alertAction("Use only letters or numbers!","alert-danger")
        return
    }

    /* create an observable (out of a promise) */
    const data$ = rxjs.fetch.fromFetch(`${apiEnd}${param.toLowerCase()}`, {
        selector: response => response.json()
    })
    
    /* subscribe to listen an async response*/
    const subscription = data$.subscribe({
        next: res => renderPokemon(res),
        error: err => {alertAction("An error!","alert-danger"),console.log(err)},
        complete: __=> {console.log('Completed...'); subscription.unsubscribe()}
    })
}

const renderPokemon = (pokemon)=>{
    pokeStructure.placeHolder.style.display = "none"
    pokeStructure.container.style.display = "contents"
    pokeStructure.name.innerText = pokemon.name
    pokeStructure.image.src = pokemon.sprites.other["official-artwork"].front_default
    pokeStructure.type.innerHTML = (pokemon.types.map(type => 
        `<div class="type">
            <h2>${type.type.name}</h2>
        </div>`
    )).toString().replace(",","")  
    pokeStructure.stats.innerHTML = ""
    pokemon.stats.forEach(element => {
        pokeStructure.stats.innerHTML += `                        
        <tr>
            <td scope="col">${element.stat.name}</td>
            <td scope="col">${element.base_stat}</td>
            <td scope="col">${element.effort}</td>
        </tr>`
    })


}

const alertAction = (message,typeAlert)=>{
    alert.innerText = message;
    alert.classList.add(typeAlert)
    alert.style.display = "initial"
    const alertSubscription = rxjs.interval(5000).subscribe({
        next : __=>{
            alert.style.display = "none";
            alert.classList.remove(typeAlert)
            alert.innerText = ""
        },
        complete: __=> {alertSubscription.unsubscribe()}
    })
}

const clickObserver = __ =>{
        /* cuenta los clicks con intervalos de un segundo */
    let clickObs$= rxjs.fromEvent(document.querySelector("#buttonCounter"), 'click')
    .pipe(
        rxjs.operators.throttleTime(1000),
        rxjs.operators.scan(count => count + 1, 0),
    )
    let clickSubs =  clickObs$.subscribe(count => document.querySelector("#countValue").innerText=count)

    return clickSubs
}

let subs = clickObserver()

rxjs.fromEvent(document.querySelector("#buttonReset"), 'click')
    .pipe(
        rxjs.operators.throttleTime(5000),
    )
    .subscribe(
        __=> {
            if(subs){
                subs.unsubscribe()
                subs = clickObserver()
            }
            document.querySelector("#countValue").innerText=0;
        }
    )