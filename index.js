import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, onValue, push, remove, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Initialize variables globally, so their accessible everywhere
let secondsRemaining
let countdownInterval
let hours
let minutes
let seconds
let formattedTime
let pomodoroCounter = 0
let toDoListCount = 0

let toDoList = []

// Initialize Firebase DB
const appSettings = {
   databaseURL: "https://playground-bc43e-default-rtdb.europe-west1.firebasedatabase.app/"
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const toDoListDB = ref(database, "toDoListDB")


// Fetch background image through Unsplash
fetch("https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature")
    .then(response => response.json())
    .then(data => {
        document.body.style.backgroundImage = `url('${data.urls.regular}')`
    })
    .catch(error => {
         // Use a default background image/author in case of error 
         document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080
         )`
                 document.getElementById("author").textContent = `By: Dodi Achmad`
    })

// Add event listener to main section
document.getElementById('main').addEventListener('click', function(e){
    // Start pomodoro, instead of working with add and remove hidden class, tried other technique, chancing HTML
    if (e.target.id === 'start-btn')
    {
        renderPomodoroTimer()
    }
    // Cancel pomodoro
    if (e.target.id === 'cancel-btn')
    {
        cancelPomodoroTimer()
    }
    // Restarts pomodoro timer
    if (e.target.id === 'restart-btn')
    {
        restartPomodoroTimer()
    }
    if (e.target.id === 'show-stats')
    {
        document.getElementById("stats-div").classList.remove('hidden')
        document.getElementById("show-stats").classList.add('hidden')
    }
    // Show to do list
    if (e.target.id === "show-to-do")
    {
        document.getElementById("to-do-list-el").classList.remove('hidden')
        document.getElementById("show-to-do").classList.add('hidden')
    }
    // Close to do list
    if (e.target.id === "close-to-do")
    {
        document.getElementById("to-do-list-el").classList.add('hidden')
        document.getElementById("show-to-do").classList.remove('hidden')
    }
    // Add item to to do list
    if (e.target.id === 'list-add-btn')
    {
        if (document.getElementById('list-item').value)
        {
            addItemList(document.getElementById('list-item').value)
        }
    }
    if (e.target.id === 'top-links')
    {
        document.getElementById("top-links").classList.add('hidden')
        document.getElementById("trello-div-el").classList.remove('hidden')
    }
})


// Instead of adding double click to whole screen, trying different technique
// adding events listeners to specific elements
document.getElementById('to-do-list').addEventListener('dblclick', function(e){
    let targetedItem = e.target.id    
    removeItemList(targetedItem)
})

document.getElementById('stats-div').addEventListener('dblclick', function()
{
    document.getElementById("show-stats").classList.remove('hidden')
    document.getElementById("stats-div").classList.add('hidden')
})

document.getElementById('trello-div-el').addEventListener('dblclick', function(){
    console.log('db click')
    document.getElementById("trello-div-el").classList.add('hidden')
    document.getElementById('top-links').classList.remove('hidden')
})
function renderPomodoroTimer() {
    document.getElementById('top-timer').innerHTML = ` <div id="top-timer" class="top-timer">
                                                            <img src="rocket.gif">
                                                            <p id="countdown">00:30:00</p>
                                                            <div class="button-wrapper-timer">
                                                                <button id="cancel-btn" class="cancel-btn btn">Cancel</button> 
                                                                <button id="restart-btn" class="restart-btn btn">Restart</button> 
                                                            </div> 
                                                         </div>`
    
    secondsRemaining = 1800; // 0.5 hour = 1800 seconds

    // Update the countdown every second
    countdownInterval = setInterval(function() {
        // Check if the countdown is over
        if (secondsRemaining <= 0) {
        clearInterval(countdownInterval);

        // Get variable from local storage
        let currentValue = parseInt(localStorage.getItem('pomodoroCounter'), 10) || 0
        currentValue += 1
        localStorage.setItem(`pomodoroCounter, ${currentValue}`)
        renderPomodoroCounter()

        document.getElementById("countdown").textContent = "00:00:00";
        document.getElementById('top-timer').innerHTML = ` <p>Pomodoro Timer</p>
                                                                <div class="button-wrapper-timer">
                                                                    <button id="start-btn" class="start-btn btn">Start</button> 
                                                                </div> `
        return;
        }

        // Calculate hours, minutes, and seconds
        hours = Math.floor(secondsRemaining / 3600);
        minutes = Math.floor((secondsRemaining % 3600) / 60);
        seconds = secondsRemaining % 60;

        // Format the time with leading zeros
        formattedTime =
        ("0" + hours).slice(-2) +
        ":" +
        ("0" + minutes).slice(-2) +
        ":" +
        ("0" + seconds).slice(-2);

        // Update the countdown display
        document.getElementById("countdown").textContent = formattedTime;

        // Decrease the remaining time by one second
        secondsRemaining--;
    }, 1000);

}


function cancelPomodoroTimer() {
    // Stop the current countdown
    clearInterval(countdownInterval);

    // Set the desired countdown time (1 hour in this example)
    secondsRemaining = 3600;

    document.getElementById('top-timer').innerHTML = ` <div id="top-timer" class="top-timer">
                                                            <p>Pomodoro Timer</p>
                                                            <div class="button-wrapper-timer">
                                                                <button id="start-btn" class="start-btn btn">Start</button> 
                                                            </div> 
                                                        </div>`
                                 
}

// Restarts the pomodoro timer
function restartPomodoroTimer() {
    clearInterval(countdownInterval);

    // Set the desired countdown time (1 hour in this example)
    secondsRemaining = 3600;

    renderPomodoroTimer()
}

// Get html for To do list and render this to the page
function renderList() {
    let templateString = ``
    toDoList.map(function(item)
    {
        templateString += ` <li id="${item}"><div id="${item}" class='margin-right'><input type="checkbox" id=myCheckbox ${item}"></div>
                            <label id=${item} for="myCheckbox">${item.replace(`/\s/g`, '-')}</label></li>`
    })
    document.getElementById('to-do-list').innerHTML = templateString
}

// Remove item from list
function removeItemList(targetedItem)
{
    // Using get to retrieve data once and get a snapshot
    get(toDoListDB)
    .then((snapshot) => {
        // Get snapshot from db, transform object to array with array
        let objectsArray = Object.entries(snapshot.val())

        // loop over array, check if value is same as targeted item
        objectsArray.forEach(function(items){
            if (items[1] === targetedItem)
            {
                // If they are the same, get matching databases' id and remove full path
                let exactLocationOfStoryInDB = ref(database, `toDoListDB/${items[0]}`)
                remove(exactLocationOfStoryInDB)

                // Update counter
                // Get variable from local storage
                let currentValue = parseInt(localStorage.getItem('toDoListCount'), 10) || 0
                currentValue += 1
                localStorage.setItem('toDoListCount', `${currentValue}`)
                renderToDoListCount()
            }
        })
    })
}


// Add item to list
function addItemList(item)
{
            // replace whitespace with -, so you can put string with spaces in db
            item.replace(`/\s/g`, '-')
            if (!toDoList.includes(item))
            {
                // Push to db
                push(toDoListDB, item)
                document.getElementById('list-item').value = ''
            }
}

// Whenever change in db, change local array and render this to the page
onValue(toDoListDB, function(snapshot) {
    if(snapshot.exists()){
        let itemsArray = Object.values(snapshot.val())
    
        toDoList = itemsArray
        renderList()
    }
    else {
        document.getElementById('to-do-list').innerHTML = '<li>no items yet...</li>'
    }
 })

// Render current time and repeat every second
function renderCurrentTime() {
    var today = new Date();
    var hours = today.getHours().toString().padStart(2, '0');
    var minutes = today.getMinutes().toString().padStart(2, '0');
    var time = hours + ":" + minutes;
    
    document.getElementById('middle-current-time').innerText = time
}

function renderPomodoroCounter() {
    pomodoroCounter = localStorage.getItem('pomodoroCounter')
    if (pomodoroCounter)
    {
        document.getElementById("pomodoro-stats").innerText = `🕣  ${pomodoroCounter}`
    }
}

function renderToDoListCount() {
    toDoListCount = localStorage.getItem('toDoListCount')
    if (toDoListCount)
    {
        document.getElementById("to-do-stats").innerText = ` ${toDoListCount}`
    }
}


function getTrelloTodo() {
    // This code sample uses the 'node-fetch' library:
    // https://www.npmjs.com/package/node-fetch
    // const fetch = require('node-fetch');

    // Getting the current date and time
    const currentDate = new Date();

    // Getting the current day as a number (0 for Sunday, 1 for Monday, etc.)
    const currentDayNumber = currentDate.getDay();

    // Data set with day and corresponding list number
    const dayListId = {
        0: "5bd88956254fd15ee12fcb56",
        1: "5bd889492105102a2432414f",
        2: "5bd8894caaedaa3ab6cd261f",
        3: "61b5e042797c8c43fb5cee46",
        4: "61b5e04c07b81855b23c309b",
        5: "61b5e0624dbf5555e4981efd",
        6: "5bd8895308e3587d539a664f"
    }

    // Get the data list linked to current day
    let idListOfToday = dayListId[currentDayNumber]

    // Get name of day to put in title trello list
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDayString = daysOfWeek[currentDayNumber];

    fetch(`https://api.trello.com/1/lists/${idListOfToday}/cards?key=f63a733824f22d3d41e989fab4678640&token=ATTA2ba9716ad39ed1a28248243cd1a73b5ed48379d844a8656011e32f0780e7c6b4242BB500`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json'
    }
    })
    .then(response => {
        console.log(
        `Response: ${response.status} ${response.statusText}`
        );
        return response.json();
    })
    .then(data => {
        let trelloToDo = data.map(function(item)
        {
            return `<div class="trello-item">
                        <p>${item.name}</p>
                    </div>`
        }).join("")
        document.getElementById('inner-trello').innerHTML = trelloToDo
        document.getElementById('current-date-trello').textContent = `Trello ${currentDayString} 📅`
        
    })
    .catch(err => console.error(err));
}

getTrelloTodo()

renderPomodoroCounter()
renderToDoListCount()
setInterval(renderCurrentTime, 1000)


