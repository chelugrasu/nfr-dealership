var isInMenu = false;
var maxSpeedRatingValue = 0
var brakingForceRatingValue = 0
var handlingRatingValue = 0
var accelerationRatingValue = 0
var storageRatinGValue = 0
var weightRatingValue = 0
var offroadRatingValue = 0
var stockRatingValue = 0
var selectedCar = [
    vehicleSpawnId = null,
    vehicleName = null,
    vehiclePrice = null,
    vehicleColor = null
]
var timerInterval;
var timeLeft = 45;
var previousFirstDigit = null;
var previousSecondDigit = null;
var firstDigit = null
var secondDigit = null
var currentCarType = null
function Display(bool) {
    if (bool) {
        $("#menu").fadeIn(250);
        isInMenu = true
    } else {
        $("#menu").fadeOut(750);
        $('.testCarBody').fadeOut(250);
        isInMenu = false
    }
}
document.onkeyup = function(data) {
    if (data.which == 27) {
        $.post("http://nfr_dealership/exit", JSON.stringify({}));
        var carsContainer = document.getElementById('cars');
        carsContainer.scrollLeft == 0;
        return
    }
};

window.addEventListener('message', (event) => {
    var data = event.data
    if (data.type === 'ui') {
        initializePage();
        Display(data.status)
    }else if(data.type === 'vehiclesData'){
        const container = document.getElementById('cars');

        container.innerHTML = '';
        const minSpeed = Math.min(...data.result.map(car => car.max_speed));
        const maxSpeed = Math.max(minSpeed, Math.max(...data.result.map(car => car.max_speed)));
        const minBrakeForce = Math.min(...data.result.map(car => car.braking_force));
        const minTorque = Math.min(...data.result.map(car => car.torque));
        const minStorage = Math.min(...data.result.map(car => car.storage));
        const maxStorage = Math.max(minStorage, Math.max(...data.result.map(car => car.storage)));
        const minWeight = 1000
        const minStock = 0
        const maxStock = Math.max(minStock, Math.max(...data.result.map(car => car.stock)));
        data.result.forEach(car => {
            // bigger = better rating
            car.SpeedRating = Math.round((car.max_speed - minSpeed) / (maxSpeed - minSpeed) * 10); // Rating from 0 to 10
            car.StorageRating = Math.round((car.storage - minStorage) / (maxStorage- minStorage) * 10); // Rating from 0 to 10
            car.stockRating = Math.round((car.stock - minStock) / (maxStock- minStock) * 10); // Rating from 0 to 10

            // smaller = better rating:
            car.BrakeRating = Math.round((minBrakeForce / car.braking_force) * 10); // Rating from 0 to 10
            car.TorqueRating = Math.round((minTorque / car.torque) * 10); // Rating from 0 to 10
            car.WeightRating = Math.round((minWeight / car.weight) * 10); // Rating from 0 to 10
        });

        data.result.forEach(car => {
            const vehicleName = car.veh_name;
            const vehiclePrice = Intl.NumberFormat('de-DE').format(car.price);
            const vehiclespawnName = car.veh_spawnname;
            const vehicleHandling = car.handling;
            const vehicleOffRoad = car.off_road;
            const vehicleImage = `vehicles/${car.veh_spawnname}.png`;

            const maxSpeedRating = car.SpeedRating;
            const BrakeRating = car.BrakeRating;
            const TorqueRating = car.TorqueRating;
            const StorageRating = car.StorageRating;
            const WeightRating = car.WeightRating;
            const stockRating = car.stockRating;
            
            const carBoxHTML = `
                <div class="carBox">
                    <div class="carName undraggable" data-content="${car.veh_description}">${vehicleName}<br></div>
                    <div class="triangleCorner undraggable"></div>
                    <div class="carPicture undraggable" style="background-image: url('${vehicleImage}')"></div>
                    <div class="buyCar undraggable" onclick="updateRatings(
                        '${maxSpeedRating}', '${BrakeRating}', '${vehicleHandling}', '${TorqueRating}', '${StorageRating}', '${WeightRating}', '${vehicleOffRoad}', '${stockRating}',
                        '${car.max_speed}', '${car.braking_force}', '${car.handling}', '${car.torque}', '${car.storage}', '${car.weight}', '${car.off_road}', '${car.stock}',
                        '${car.veh_spawnname}','${vehiclePrice}', '${vehicleName}', '${car.veh_type}'
                        )">Buy Car</div>
                    <div class="carPrice undraggable">$${vehiclePrice}</div>
                    <div class="hiddenData" style="display: none;">
                    <div class="vehMaxSpeed">${car.max_speed}<div class="maxSpeedRating">${maxSpeedRating}</div></div>   
                    <div class="vehBrakingForce">${car.braking_force}<div class="brakeRating">${BrakeRating}</div></div>
                    <div class="vehHandling">${car.handling}</div>
                    <div class="vehTorque">${car.torque}<div class="torqueRating">${TorqueRating}</div></div>
                    <div class="vehStorage">${car.storage}<div class="storageRating">${StorageRating}</div></div>
                    <div class="vehWeight">${car.weight}<div class="weightRating">${WeightRating}</div></div>
                    <div class="vehOffRoad">${car.off_road}</div>
                    <div class="vehStock">${car.stock}<div class="stockRating">${stockRating}</div></div>
                    <div class="vehSpawnName">${vehiclespawnName}</div>
                    <div class="vehType">${car.veh_type}</div>
                    </div>
                </div>
            `;

            container.innerHTML += carBoxHTML;
        })
    }else if(data.type === 'testDriveEnded'){
        clearInterval(timerInterval);
        timeLeft = 45
        selectedCar.vehicleSpawnId = null
        $('.testCarBody').fadeOut(50);
        $('.wholeBody').fadeIn(250);
    }
});


let carSpecs = [
    { id: 'maxSpeedSpec', rating: 0},
    { id: 'brakingForceSpec', rating: 0},
    { id: 'handlingSpec', rating: 0},
    { id: 'accelerationSpec', rating: 0},
    { id: 'storageCapacitySpec', rating: 0},
    { id: 'weightSpec', rating: 0},
    { id: 'offroadSpec', rating: 0},
    { id: 'stockSpec', rating: 0},
];

function displayBoxes() {
    carSpecs.forEach(carSpec => {
        const container = document.getElementById(carSpec.id);
        if (!container) {
            console.error(`Element with ID ${carSpec.id} not found.`);
            return;
        }

        const previousRatingBoxes = container.querySelectorAll('.ratingBox');
        previousRatingBoxes.forEach(box => box.remove());

        for (let i = 1; i <= 10; i++) {
            const ratingBox = document.createElement('div');
            ratingBox.classList.add('ratingBox');
            if (i <= carSpec.rating) {
                ratingBox.classList.add('green');
            } else {
                ratingBox.classList.add('gray');
            }
            container.appendChild(ratingBox);
        }
    });
}

function updateRatings(
    newMaxSpeedRating, newBrakingForceRating, newHandlingRating, newAccelerationRating, newStorageRating, newWeightRating, newOffroadRating, newStockRating,
    newMaxSpeed, newBrakingForce, newHandling, newAcceleration, newStorage, newWeight, newOffroad, newStock,
    vehSpawnName, vehiclePrice, vehicleName, vehicleType
    ) {
    carSpecs.find(carSpec => carSpec.id === 'maxSpeedSpec').rating = newMaxSpeedRating;
    carSpecs.find(carSpec => carSpec.id === 'brakingForceSpec').rating = newBrakingForceRating;
    carSpecs.find(carSpec => carSpec.id === 'handlingSpec').rating = newHandlingRating;
    carSpecs.find(carSpec => carSpec.id === 'accelerationSpec').rating = newAccelerationRating;
    carSpecs.find(carSpec => carSpec.id === 'storageCapacitySpec').rating = newStorageRating;
    carSpecs.find(carSpec => carSpec.id === 'weightSpec').rating = newWeightRating;
    carSpecs.find(carSpec => carSpec.id === 'offroadSpec').rating = newOffroadRating;
    carSpecs.find(carSpec => carSpec.id === 'stockSpec').rating = newStockRating;
    $('#maxSpeedText').attr('attrMaxSpeed', newMaxSpeed);
    $('#brakingForceText').attr('attrBrakingForce', newBrakingForce);
    $('#handlingText').attr('attrHandling', newHandling);
    $('#accelerationText').attr('attrAcceleration', newAcceleration);
    $('#storageCapacityText').attr('attrStorage', newStorage);
    $('#weightText').attr('attrWeight', newWeight);
    $('#offroadText').attr('attrOffroad', newOffroad);
    $('#stockText').attr('attrStock', newStock);

    $('.totalPrice').text('$'+ vehiclePrice)
    $.post("https://nfr_dealership/showCar", JSON.stringify({ name: vehSpawnName, vehicleType : vehicleType}), function(x){});
    displayBoxes();
    selectedCar.vehicleSpawnId = vehSpawnName
    selectedCar.vehicleName = vehicleName
    selectedCar.vehiclePrice = vehiclePrice
}




function scrollCars(amount) {
    var carsContainer = document.getElementById('cars');
    carsContainer.scrollLeft += amount;
}

function sortCarBoxes(sortDirection, sortBy) {
    const container = document.getElementById('cars');

    const carBoxesArray = Array.from(container.children);

    carBoxesArray.forEach(carBox => {
        carBox.classList.add('fadeOut');
    });
    setTimeout(() => {
        carBoxesArray.sort((a, b) => {
            let valueA, valueB;
            if (sortBy === 'price') {
                valueA = parseFloat(a.querySelector('.carPrice').textContent.replace(/\$/g, '').replace(/\./g, ''));
                valueB = parseFloat(b.querySelector('.carPrice').textContent.replace(/\$/g, '').replace(/\./g, ''));
            } else if (sortBy === 'speed') {
                valueA = parseFloat(a.querySelector('.vehMaxSpeed').textContent);
                valueB = parseFloat(b.querySelector('.vehMaxSpeed').textContent);
            }
            return sortDirection === 'highToLow' ? valueB - valueA : valueA - valueB;
        });
        container.innerHTML = '';
        carBoxesArray.forEach(carBox => {
            carBox.classList.remove('fadeOut');
            carBox.classList.add('fadeIn');
            container.appendChild(carBox);
            var carsContainer = document.getElementById('cars');
            carsContainer.scrollLeft == 0;
        });
        setTimeout(() => {
            carBoxesArray.forEach(carBox => {
                carBox.classList.remove('fadeOut', 'fadeIn');
            });
        }, 300);

    }, 300);
}



document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.querySelector('.searchBar');
    const carsContainer = document.querySelector('.cars');

    searchBar.addEventListener('input', function() {
        const searchTerm = searchBar.value.toLowerCase().trim();

        // Select all .carName elements inside .cars
        const carNames = carsContainer.querySelectorAll('.carName');
        if (searchBar && searchBar.value) {
            carNames.forEach(function(carName) {
                const carNameText = carName.textContent.toLowerCase();
                const carBox = carName.closest('.carBox'); // Find the closest parent with class .carBox
                if (carNameText.includes(searchTerm)) {
                    carBox.style.display = 'block';
                } else {
                    carBox.style.display = 'none';
                }
            });
        }else{
            showCarsByType(currentCarType);
        }
    });
});

function showCarsByType(vehicleType) {
    // Get all car boxes
    const carBoxes = document.querySelectorAll('.carBox');
    currentCarType = vehicleType
    // Loop through each car box
    carBoxes.forEach(carBox => {
        // Get the vehicle type of the current car box
        const hiddenData = carBox.querySelector('.hiddenData');
        const currentVehicleType = hiddenData.querySelector('.vehType').textContent.trim();

        // Check if the current vehicle type matches the desired vehicle type
        if (currentVehicleType === vehicleType || vehicleType === 'all') {
            // Show the car box
            carBox.style.display = 'block';
        } else {
            // Hide the car box
            carBox.style.display = 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const handleClick = (elements, activeClass) => elements.forEach(element =>
        element.addEventListener('click', () => {
            elements.forEach(el => el.classList.remove(activeClass));
            element.classList.add(activeClass);
        })
    );

    window.reset = () => {
        const normalCarsType = document.querySelector('#normalCars');
        if (normalCarsType) {
            resetActiveClasses(document.querySelectorAll('.type'));
            resetActiveClasses(document.querySelectorAll('.active-vehicle'));
            normalCarsType.classList.add('active-vehicle');
        }
    };

    window.resetActiveClasses = elements => elements.forEach(element =>
        element.classList.remove('active-vehicle', 'active-type')
    );

    const vehicleBoxes = document.querySelectorAll('.vehicleBox');
    const types = document.querySelectorAll('.type');

    handleClick(vehicleBoxes, 'active-vehicle');
    handleClick(types, 'active-type');
});

// Function to initialize the page
function initializePage() {
    // Hide all car boxes when the page loads
    const carBoxes = document.querySelectorAll('.carBox');
    carBoxes.forEach(carBox => {
        carBox.style.display = 'none';
    });

    // Show only normal cars when the page loads
    showCarsByType('normal');
    console.log('reset')
    reset();
}

window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

window.addEventListener("keydown", function(e) {
    if(["ArrowLeft"].indexOf(e.code) > -1) {
        e.preventDefault();
        $.post("https://nfr_dealership/rotateCar", JSON.stringify({ direction: "left"}), function(x){});
    }else if(["ArrowRight"].indexOf(e.code) > -1){
        e.preventDefault();
        $.post("https://nfr_dealership/rotateCar", JSON.stringify({ direction: "right"}), function(x){});
    }else if(["Space","ArrowUp","ArrowDown"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

function changeCarColor(r, g, b){
    selectedCar.vehicleColor = [r, g ,b]
    console.log(selectedCar.vehicleSpawnId, selectedCar.vehicleColor)
    $.post("https://nfr_dealership/changeCarColor", JSON.stringify({ red: r, green: g, blue : b}), function(x){});
}

function startTimer() {
    clearInterval(timerInterval); // Clear any existing timers
    timerInterval = setInterval(updateTimer, 1000);
    $('.carTestedName').text(selectedCar.vehicleName)
    $('.testingPrice').text("$"+selectedCar.vehiclePrice)
    $('.testCarBody').fadeIn(4000)
    $.post("https://nfr_dealership/startTestDrive", JSON.stringify({}), function(x){});
}

function updateTimer() {
    var timerDisplay = document.querySelector('.timerBox');
    
    var firstDigit = Math.floor(timeLeft / 10); // Extract first digit
    var secondDigit = timeLeft % 10; // Extract second digit
    
    // Determine which digits are changing
    var changingClass = '';
    if (previousSecondDigit !== null && previousSecondDigit !== secondDigit) {
        changingClass = 'changing-second';
    }
    if (previousFirstDigit !== null && previousFirstDigit !== firstDigit) {
        changingClass = 'changing-both';
    }
    
    // Remove any previous changing classes
    timerDisplay.classList.remove('changing-second', 'changing-both');
    
    // Apply changing class
    if (changingClass !== '') {
        timerDisplay.classList.add(changingClass);
        setTimeout(function() {
            timerDisplay.classList.remove(changingClass);
        }, 300); // Adjust timing here
    }
    
    // Update previous digits
    previousFirstDigit = firstDigit;
    previousSecondDigit = secondDigit;
    
    timerDisplay.setAttribute('data-first-digit', firstDigit);
    timerDisplay.setAttribute('data-second-digit', secondDigit);
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        $.post("https://nfr_dealership/endTestDrive", JSON.stringify({}), function(x){});
    } else {
        timeLeft--;
    }
}
function testCar(){
    if (selectedCar.vehicleSpawnId){
        $('.wholeBody').fadeOut(240)
        startTimer()
    }
}
