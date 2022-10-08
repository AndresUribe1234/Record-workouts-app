"use strict";

const form = document.querySelector(".workout-form");
const inputDistance = document.getElementById("workout-distance");
const inputDuration = document.getElementById("workout-duration");
const inputCadence = document.getElementById("workout-cadence");
const inputElevation = document.getElementById("workout-elevation");
const selectorOption = document.getElementById("workout-option");
let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      map = L.map("map").setView(coords, 14);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //   Handling clickes on map
      map.on("click", function (mapE) {
        mapEvent = mapE;
        form.classList.remove("hidden");
        inputDistance.focus();
      });
    },
    function () {
      alert("Could not get your position");
    }
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        "";
    const { lat: latitude, lng: longitude } = mapEvent.latlng;
    const coords = [latitude, longitude];
    L.marker(coords)
      .addTo(map)
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
  });

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
