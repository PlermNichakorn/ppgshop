function initMap() {   
    const markers = [
        {
            locationName: 'PPG Grocery Store',
            lat:18.801469338649543,
            lng: 98.95036028465701,
            address: 'Soi Sukhothai 5,<br> Suthep Subdistrict, <br> Muang Chiang Mai District, <br>Chiang Mai 50200'
        }
        
    ];

    const centerMap={ lat: 18.7982068, lng: 98.9606071}

    const mapOptions = {
        center: centerMap,
        zoom: 10,
        disableDefaultUI: true

    }
     const map = new google.maps.Map(document.getElementById('google-map'), mapOptions)
     
     const infoWindow = new google.maps.InfoWindow({
        minWidth: 200,
        maxWidth: 200
     })


     const marker = new google.maps.Marker({
        position: { lat: markers[0]['lat'], lng: markers[0]['lng']},
        map: map
     })

     function createInfoWindow() {
        const infoWindowContent = `
            <div class="feh-content">
                <p><b>${markers[0]['locationName']}</b><p> 
                <address><p>${markers[0]['address']}</p></address>
            </div>`;
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent(infoWindowContent)
            infoWindow.open(map, marker)
        })
    }
    
     createInfoWindow()
}


