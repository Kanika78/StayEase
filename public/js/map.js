    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 10,
      center: listing.geometry.coordinates
    });
    const marker1 = new mapboxgl.Marker({color : "red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({offset:25}) .setHTML(
        `<h4>${listing.title}</h4><p>Exact location provided after booking</p>`
      )
    )
    .addTo(map);
  
  // Call the initMap function with the coordinates variable