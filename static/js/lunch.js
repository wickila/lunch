
/**
 * @fileoverview Provides the core JavaScript functionality for the Geochat
 *   application.
 */
(function($){
	var map = null;
	var geocoder = null;
	var user = null;
	var lastUpdate = 0;
	
	window.people = {}
	
	window.initialize =  function() {
	    var latlng = new google.maps.LatLng(GEOCHAT_VARS['initial_latitude'], GEOCHAT_VARS['initial_longitude']);
	    var myOptions = {
	      zoom: 12,
	      center: latlng,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	    var contextMenu = $(document.createElement('ul'))
			.attr('id', 'contextMenu');

		// Fill our context menu with links
		contextMenu.append(
			'<li><a href="#zoomIn">Zoom in</a></li>' +
			'<li><a href="#zoomOut">Zoom out</a></li>' +
			'<li><a href="#centerHere">Center map here</a></li>' +
			'<li><a href="#newRestuarant">在此处开店</a></li>'
		);

		// Disable the browser context menu on our context menu
		contextMenu.bind('contextmenu', function() { return false; });

		// Append it to the map object
		$(map.getDiv()).append(contextMenu);

		/**
		 * Menu events
		 */

		// Keep track of where you clicked
		var clickedLatLng;

		// Display and position the menu
		google.maps.event.addListener(map, 'rightclick', function(e)
		{
			// start buy hiding the context menu if its open
			contextMenu.hide();

			var mapDiv = $(map.getDiv()),
				x = e.pixel.x,
				y = e.pixel.y;

			// save the clicked location
			clickedLatLng = e.latLng;

			// adjust if clicked to close to the edge of the map
			if ( x > mapDiv.width() - contextMenu.width() )
				x -= contextMenu.width();

			if ( y > mapDiv.height() - contextMenu.height() )
				y -= contextMenu.height();

			// Set the location and fade in the context menu
			contextMenu.css({ top: y, left: x }).fadeIn(100);
		});

		// Set some events on the context menu links
		contextMenu.find('a').click( function()
		{
			// fade out the menu
			contextMenu.fadeOut(75);

			var action = $(this).attr('href').substr(1);

			switch ( action )
			{
				case 'zoomIn':
					map.setZoom(
						map.getZoom() + 1
					);
					map.panTo(clickedLatLng);
					break;

				case 'zoomOut':
					map.setZoom(
						map.getZoom() - 1
					);
					map.panTo(clickedLatLng);
					break;

				case 'centerHere':
					map.panTo(clickedLatLng);
					break;
					
				case 'newRestuarant':
					window.location.href = "/restuarant/new?lat="+clickedLatLng.lat()+"&lon="+clickedLatLng.lng();
					break;
					
				default:
					break;
			}

			return false;
		});

		// Hover events for effect
		contextMenu.find('a').hover( function() {
			$(this).parent().addClass('hover');
		}, function() {
			$(this).parent().removeClass('hover');
		});

		// Hide context menu on some events
		$.each('click dragstart zoom_changed maptypeid_changed'.split(' '), function(i,name){
			google.maps.event.addListener(map, name, function(){ contextMenu.hide() });
		});
  	}
  	
  	/**
   * Represents each person active within Geochat.
   * @param {string} name The name of the person in question.
   * @param {string} email The person's email address.
   * @param {number} latitude The person's starting latitude.
   * @param {number} longitude The person's starting longitude.
   * @constructor
   */
  var Person =  function(name, email, lat, lng) {

    var me = this;
    window.people[email] = this;

    this.name = name;
    this.email = email;
    this.point = new google.maps.LatLng(lat, lng);
    this.marker = new google.maps.Marker({
      position: this.point,
      title:name
  });

    this.marker.setMap(map);
  };
  
  /**
   * Move this Person to the specified latitude and longitude.
   * @param {number} lat The latitude to move to.
   * @param {number} lng The longitude to move to.
   */  
  Person.prototype.move = function(lat, lng) {
    if (this.point.lat() != lat || this.point.lng() != lng) {
      this.point = new google.maps.LatLng(lat, lng);
      this.marker.setPosition(this.point);
//      this.bubble.redraw();
//      this.bubble.fade();
//      this.nametag.redraw();
    }
  };
  
  /**
   * Make this Person say a specified message.
   * @param {string} message The message to set within the user's chat bubble.
   * @param {boolean} raw Whether or not to sanitize the message.
   */
  Person.prototype.say = function(message, raw) {
  	var infowindow = new google.maps.InfoWindow();
  	infowindow.setContent(message);
	  infowindow.setPosition(this.point);
	
	  infowindow.open(map);
  };
  
  window.chatCallback = function(data) {
    var users = data.users;
    for (var i = 0; i < users.length; ++i) {
      var speaker = null;
      p = users[i].position.split(",");
      // Verify whether the speaker exists. If not, create them.
      if (!window.people[users[i].email]) {
      	
        speaker = new Person(
          users[i].nickname,
          users[i].email,
          p[0],
          p[1]);
      } else {
        speaker = window.people[users[i].email];
      }
      
      // Update the speaker's chat bubble.
      speaker.move(p[0], p[1]);
//      speaker.say(events[i].contents);
    }    
  };
  
  window.updateSuccess = function(json) {
//    var data = eval('(' + json + ')');
//    lastUpdate = data.timestamp;
    chatCallback(json);
    window.setTimeout(update, GEOCHAT_VARS['update_interval'])
  }
  
   window.updateError = function(event,err) {
    alert('An update error occured! Trying again in a bit.');
    window.setTimeout(update, GEOCHAT_VARS['error_interval'])
  }
  
  window.update = function() {
    var bounds = map.getBounds();
    var min = bounds.getSouthWest();
    var max = bounds.getNorthEast();
    $.ajax({
      type: 'GET',
      url: '/user/querylocalusers',
      dataType: "json",
      ContentType: "application/json",
      data:{"location":map.getCenter().lat()+","+map.getCenter().lng(),
      		"percision":map.getZoom()-4},
//      data: [
//      	'location=',map.getCenter().lat()+','+map.getCenter().lng(),
//        '&percision=', map.getZoom()-6
//        ].join(""),
      success: updateSuccess,
      error: updateError
    });
  }
  
  window.say = function(chatInput) {
		var chat = chatInput.value;
		if (chat) {
			map.setCenter(user.marker.getPosition());
			user.say(chat);
			chatInput.value = '';
			$.post('/item/senditem', {
				'content': chat,
				'latitude': user.marker.getPosition().lat(),
				'longitude': user.marker.getPosition().lng(),
			});
		}
	};
  
  $(document).ready(function(){
  	geocoder = new google.maps.Geocoder();
  	geocoder.geocode( { 'address': GEOCHAT_VARS['default_location']}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var latitude = GEOCHAT_VARS['initial_latitude'];
          var longitude = GEOCHAT_VARS['initial_longitude'];
          var latlng = results[0].geometry.location
          if (latlng) {
//            latitude = latlng.lat();
//            longitude = latlng.lng();
          }
          map.setCenter(new google.maps.LatLng(latitude, longitude), 13);
          user = new Person(
              GEOCHAT_VARS['user_nickname'],
              GEOCHAT_VARS['user_email'],
              latitude,
              longitude);
          // update();
        } else {
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
	});
})(jQuery);
