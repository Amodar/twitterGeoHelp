var socket = io.connect();

socket.on('connect', function () {
  console.log("im connected");
});

var map,
    markers = [],
    prev_infowindow = false,
    autoRemoveTweets = true,
    x,
    currentMark;

function initialize() {
    var users = [];

    var coords = [
        new google.maps.LatLng(32.36344, 12.36346),
        new google.maps.LatLng(53.56562, 3.33002)
    ];

    var mapOptions = {
        zoom: 3,
        //maxZoom: 2,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        center: new google.maps.LatLng(45, 0),
        disableDefaultUI: true
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);


    socket.on('tweet', function (data) {
        users.push(
            {
                username : data.user.screen_name,
                tweet : data.text,
                coords : [data.coordinates.coordinates[0], data.coordinates.coordinates[1]],
                timePosted : data.created_at
            }
        );
        //last index of users
        var lastUser = users.length - 1;
        
        console.log(users[lastUser].coords[0] + " " + users[lastUser].coords[1] );
        
        
        var infowindowContent = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<a href="https://twitter.com/'+ users[lastUser].username +'" target="_blank"><h2 id="firstHeading" class="firstHeading">@' + users[lastUser].username + '</h2></a>' +
            '<div id="bodyContent">' +
            '<p>' + users[lastUser].tweet + '</p>' +
            '<p class="time"><i>' + users[lastUser].timePosted + '</i></p>' +
            '</div>' + 
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: infowindowContent
        });
        
        addMarker2(users[lastUser].coords[0], users[lastUser].coords[1]);
        //markers[i].setMap(map);
        
        google.maps.event.addListener(markers[lastUser], 'mouseover', function () {
            if (prev_infowindow) {
                prev_infowindow.close();
            }
            currentMark = this;
            prev_infowindow = infowindow;
            infowindow.open(map, this);
        });
        
        google.maps.event.addListener(infowindow, 'closeclick', function() {  
            deleteMarker();
        }); 
        
        while(autoRemoveTweets) {
            if(lastUser >= 30) {
                markers[lastUser - 30].setMap(null);
                console.log("tweets removed");
            }
            break;
        }
        
    });
    //map ui
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);
}



// Add a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: 'https://geohelp-amodar-1.c9.io/img/help.png',
      animation: google.maps.Animation.DROP
  });
  markers.push(marker);
}

function addMarker2(lat, lang) {
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng( lang, lat ),
      map: map,
      icon: 'http://broowse.com/help.png',
      animation: google.maps.Animation.DROP
  });
  markers.push(marker);
}

function deleteMarker() {
    currentMark.setMap(null);
}

function removeMarkers() {
    console.log('removeMarker Function');
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}


//map ui
function CenterControl(controlDiv, map) {
    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.alignContent = 'center';
    controlUI.style.backgroundColor = 'rgba(255,255,255,.7)';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to clear all tweets';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontSize = '13px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Clear Tweets';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to
    google.maps.event.addDomListener(controlUI, 'click', function () {
        removeMarkers();
    });
}

google.maps.event.addDomListener(window, 'load', initialize);