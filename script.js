"use strict";

class Workout {
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
    this.date = new Date();
    this.id = (Date.now() + "").slice(-10);
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.type = "Running";
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.caclSpeed();
    this.type = "Cycling";
    this._setDescription();
  }

  caclSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const form = document.querySelector(".workout-form");
const inputDistance = document.getElementById("workout-distance");
const inputDuration = document.getElementById("workout-duration");
const inputCadence = document.getElementById("workout-cadence");
const inputElevation = document.getElementById("workout-elevation");
const selectorOption = document.getElementById("workout-option");
const workoutContainer = document.querySelector(".workout-container");

// Aplication Architecture
class App {
  constructor() {
    this.workout = [];
    this._getPosition();
    this._map;
    this._mapEvent;
    this.mapZoomLevel = 14;
    this._getLocalStorage();

    form.addEventListener("submit", this._newWorkout.bind(this));
    selectorOption.addEventListener("change", this._toggleInputForm);
    workoutContainer.addEventListener("click", this._moveToWorkout.bind(this));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert("Could not get your position");
      }
    );
  }

  _loadMap(position) {
    if (navigator.geolocation) {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      this._map = L.map("map").setView(coords, this.mapZoomLevel);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);

      //   Handling clickes on map
      this._map.on("click", this._showForm.bind(this));

      this.workout.forEach((ele) => {
        this._renderWorkoutMarker(ele);
      });
    }
  }

  _showForm(mapE) {
    this._mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _toggleInputForm() {
    if (selectorOption.value !== "Running") {
      inputElevation.closest(".form-row").classList.remove("hidden");
      inputCadence.closest(".form-row").classList.add("hidden");
    } else {
      inputElevation.closest(".form-row").classList.add("hidden");
      inputCadence.closest(".form-row").classList.remove("hidden");
    }
  }

  _newWorkout(e) {
    e.preventDefault();
    const validInputs = (...inputs) =>
      inputs.every((ele) => Number.isFinite(ele));

    const greaterThanZero = (...inputs) => inputs.every((ele) => ele > 0);

    // Get data
    const type = selectorOption.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat: latitude, lng: longitude } = this._mapEvent.latlng;
    let workout;

    // Check if data is valid

    // If workout running, create running object
    if (type === "Running") {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !greaterThanZero(distance, duration, cadence)
      ) {
        return alert("Input needs to be a positive number!");
      }

      workout = new Running([latitude, longitude], distance, duration, cadence);
    }

    // If workout Cycling, create ciclying object
    if (type === "Cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !greaterThanZero(distance, duration)
      ) {
        return alert("Input needs to be a positive number!");
      }

      workout = new Cycling(
        [latitude, longitude],
        distance,
        duration,
        elevation
      );
    }

    // Add new object to workout array
    this.workout.push(workout);

    // Render workout marker
    this._renderWorkoutMarker(workout);

    // Render workout list
    this._renderWorkout(workout);

    // Render workout on map as marker

    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";

    // Hide workout
    form.classList.add("hidden");

    // Set local storage
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `workout-popup-${workout.type}`,
        })
      )
      .setPopupContent(
        `${workout.type === "Running" ? `🏃🏻` : `🚴🏻`} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    const html = `
    <li class="workout-form-logged workout-${workout.type}" data-id="${
      workout.id
    }">
           
                <p class="workout-name">${workout.description} ${
      workout.type === "Running" ? `🏃🏻` : `🚴🏻`
    }</p>
                <div class="workout-information">
                    <span>Distance ${workout.distance} km 🗺️</span>
                    <span>Duration ${workout.duration} mins ⌚</span>
                    <span>
                     ${
                       workout.type === "Running"
                         ? `Cadence ${workout.cadence} rpm 👟`
                         : `Elevation ${workout.elevation} m 🗻`
                     }</span>
                     <span>
                     ${
                       workout.type === "Running"
                         ? `Pace ${workout.pace.toFixed(1)} min/km 🌀`
                         : `Speed ${workout.speed.toFixed(1)} km/hr 🌀`
                     }</span>
                </div>
            </div>
          </li>
    `;

    form.insertAdjacentHTML("afterend", html);
  }

  _moveToWorkout(e) {
    const workoutEle = e.target.closest(".workout-form-logged");

    if (!workoutEle) {
      return;
    }
    const workout = this.workout.find(
      (work) => work.id === workoutEle.dataset.id
    );

    this._map.setView(workout.coords, this.mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.workout));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;
    this.workout = data;
    this.workout.forEach((ele) => {
      this._renderWorkout(ele);
    });
  }

  reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }
}

const app = new App();
