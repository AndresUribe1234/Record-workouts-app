"use strict";

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);
      console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
      const coords = [latitude, longitude];

      const map = L.map("map").setView(coords, 14);
      console.log("map", map);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords).addTo(map).bindPopup("Current location").openPopup();

      map.on("click", function (e) {
        console.log(e);
        const { lat: latitude, lng: longitude } = e.latlng;
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
        console.log("clicked map");
      });
    },
    function () {
      alert("Could not get your position");
    }
  );
}
