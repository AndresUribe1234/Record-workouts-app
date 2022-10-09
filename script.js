"use strict";

const form = document.querySelector(".workout-form");
const inputDistance = document.getElementById("workout-distance");
const inputDuration = document.getElementById("workout-duration");
const inputCadence = document.getElementById("workout-cadence");
const inputElevation = document.getElementById("workout-elevation");
const selectorOption = document.getElementById("workout-option");
let map, mapEvent;

class App {
  constructor() {
    this._getPosition();
    this._map;
    this._mapEvent;

    form.addEventListener("submit", this._newWorkout.bind(this));

    selectorOption.addEventListener("change", function () {
      if (selectorOption.value !== "Running") {
        inputElevation.closest(".form-row").classList.remove("hidden");
        inputCadence.closest(".form-row").classList.add("hidden");
      } else {
        inputElevation.closest(".form-row").classList.add("hidden");
        inputCadence.closest(".form-row").classList.remove("hidden");
      }
      console.log(selectorOption.value);
    });
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

      this._map = L.map("map").setView(coords, 14);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);

      //   Handling clickes on map
      this._map.on("click", this._showForm.bind(this));
    }
  }
  _showForm(mapE) {
    this._mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _toggleInputForm() {}
  _newWorkout(e) {
    e.preventDefault();
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
    const { lat: latitude, lng: longitude } = this._mapEvent.latlng;
    const coords = [latitude, longitude];
    L.marker(coords)
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "workout-popup",
        })
      )
      .setPopupContent("workout")
      .openPopup();
  }
}

const app = new App();
