
/**
 * @fileoverview Provides the core JavaScript functionality for the Geochat
 *   application.
 */
$(function(){
	var map = null;
	var geocoder = null;
	var lastUpdate = 0;
	
	window.restuarants = {}
	window.currentRest = null;
	getUser();
	window.initialize =  function() {
	    var latlng = new google.maps.LatLng(GEOCHAT_VARS['initial_latitude'], GEOCHAT_VARS['initial_longitude']);
	    var myOptions = {
	      zoom: 12,
	      center: latlng,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
	    var contextMenu = $(document.createElement('ul'))
			.attr('id', 'contextMenu');
		contextMenu.append(
			'<li><a href="#zoomIn">Zoom in</a></li>' +
			'<li><a href="#zoomOut">Zoom out</a></li>' +
			'<li><a href="#centerHere">Center map here</a></li>' +
			'<li><a href="#newRestuarant">在此处开店</a></li>'
		);
		contextMenu.bind('contextmenu', function() { return false; });
		// Append it to the map object
		$(map.getDiv()).append(contextMenu);

		/**
		 * Menu events
		 */
		var clickedLatLng;
		// Display and position the menu
		google.maps.event.addListener(map, 'rightclick', function(e)
		{
			contextMenu.hide();
			var mapDiv = $(map.getDiv()),
			x = e.pixel.x,
			y = e.pixel.y;
			clickedLatLng = e.latLng;
			if ( x > mapDiv.width() - contextMenu.width() )
				x -= contextMenu.width();
			if ( y > mapDiv.height() - contextMenu.height() )
				y -= contextMenu.height();
			contextMenu.css({ top: y, left: x }).fadeIn(100);
		});

		// Set some events on the context menu links
		contextMenu.find('a').click( function()
		{
			contextMenu.fadeOut(75);
			var action = $(this).attr('href').substr(1);
			switch(action)
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
					if(!window.user){
						alert('您尚未登录');
					}else if(window.user.permission < 1){
						alert('您的权限不够')
					}else if(window.user.restuarant){
						alert('您已经有一家店啦');
					}else{
						$('#lat').val(clickedLatLng.lat());
						$('#lng').val(clickedLatLng.lng());
						$('#myModal').modal('show');
					}
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
		
		getRestuarants();
  	}
	
  var Restuarant =  function(info) {
	this.id = info.id;
    this.info = info;
    this.info.orderMenus = [];
    this.point = new google.maps.LatLng(info.lat, info.lng);
    this.marker = new google.maps.Marker({
      id: this.id,
      position: this.point,
      title:this.info.name
    });
    this.menus = [];
    
    this.marker.setMap(map);
    restuarants[this.id] = this;
    google.maps.event.addListener(this.marker, 'click', function() {
    	var rest = restuarants[this.id];
    	setCurrentRest(rest);
        map.setCenter(this.getPosition());
    });
  };
  /**
   * Move this Restuarant to the specified latitude and longitude.
   * @param {number} lat The latitude to move to.
   * @param {number} lng The longitude to move to.
   */  
  Restuarant.prototype.move = function(lat, lng) {
    if (this.point.lat() != lat || this.point.lng() != lng) {
      this.point = new google.maps.LatLng(lat, lng);
      this.marker.setPosition(this.point);
//      this.bubble.redraw();
//      this.bubble.fade();
//      this.nametag.redraw();
    }
  };
  
  /**
   * Make this Restuarant say a specified message.
   * @param {string} message The message to set within the user's chat bubble.
   * @param {boolean} raw Whether or not to sanitize the message.
   */
  Restuarant.prototype.say = function(message, raw) {
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
      	
        speaker = new Restuarant(
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
      url: '/user/restuarant/local',
      ContentType: "application/json",
      data:{"lat":map.getCenter().lat(),
    		"lng":map.getCenter().lng(),
      		"percision":map.getZoom()-4},
      		'success': updateSuccess,
      		'error': updateError
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
  
  window.new_restuarant = function(){
		$('#new_restuarant_form').ajaxForm({
				'dataType': 'json',
				'success':function(data){
					data = eval(data);
					if(data.result){
						r = new Restuarant(data.rest);
						map.setCenter(new google.maps.LatLng(data.rest.lat,data.rest.lng), 13);
						$('#myModal').modal('hide');
					}
				}
		});
	}

  	function getRestuarants(){
	  	geocoder = new google.maps.Geocoder();
	  	geocoder.geocode( { 'address': GEOCHAT_VARS['default_location']}, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
	          var latitude = GEOCHAT_VARS['initial_latitude'];
	          var longitude = GEOCHAT_VARS['initial_longitude'];
	          var latlng = results[0].geometry.location
	          if (latlng) {
	            latitude = latlng.lat();
	            longitude = latlng.lng();
	          }
	          map.setCenter(new google.maps.LatLng(latitude, longitude), 13);
	          $.ajax({
	              type: 'GET',
	              url: '/api/localrestuarants',
	              ContentType: "application/json",
	              data:{"lat":map.getCenter().lat(),
	            		"lng":map.getCenter().lng(),
	              		"percision":map.getZoom()-4},
	              		'success': function(data){
	              			var rest;
	              			var r;
	              			for(var i in data.restuarants)
	              			{
	              				rest = data.restuarants[i]
	              				r = new Restuarant(rest);
	              				if(window.user && window.user.id == r.uid){
	              					window.user.restuarant = r;
	              				}
	              			}
	              			if(!window.currentRest){
	              				setCurrentRest(r);
	              			}
	              		},
	              		'error': function(){alert('获取本地餐厅失败')}
	          });
	        } else {
	          alert("Geocode was not successful for the following reason: " + status);
	        }
	      });
	};
	
	function getUser(){
		$.ajax({
            type: 'GET',
            url: '/api/checklogin',
            ContentType: "application/json",
    		success: function(data){
    			window.user = data.user;
    			if(user){
    				$('.user').addClass('user-login');
    				$('.user').removeClass('user');
    				$('#bottom-nav-user').html(user.username);
    				if(user.permission > 0){
    					$('.boss').addClass('boss-login');
    					$('.boss').removeClass('boss');
    				}
    				getRestuarant();
    			}
    		},
    		error: function(){alert('登录失败')}
        });
	}
	
	window.getRestuarant = function(){
		if(window.user && window.user.permission>0 && !window.user.restuarant){
			$.ajax({
	            type: 'GET',
	            url: '/api/getmyrest',
	            ContentType: "application/json",
	    		success: function(data){
	    			if(data.result){
	    				window.user.restuarant = data.restuarant;
	    				$('#rest-setting-name').val(window.user.restuarant.name);
	    				$('#rest-settting-type').val(window.user.restuarant.rtype);
	    				$('#rest-setting-des').val(window.user.restuarant.description);
	    				$('#rest-setting-addres').val(window.user.restuarant.adress);
	    				$('#rest-setting-phone').val(window.user.restuarant.telephone);
	    				$('#rest-setting-minprice').val(window.user.restuarant.minprice);
	    				$('#rest-avatar-img').attr('src',window.user.restuarant.avatarurl);
	    				$('#setting-avatar-img').attr('src',window.user.avatarurl);
	    			}
	    		},
	    		error: function(){alert('获取餐厅信息失败')}
	        });
		}
	}
	
	  window.setCurrentRest = function(rest){
		if(window.currentRest == rest)return;
		window.currentRest = rest;
	  	$.setSideBarRest(rest);
	  	window.shoppingCart.setMenus(rest.info.orderMenus)
	  	if(!window.currentRest.info.menus){
	  		$.ajax({
		          type: 'GET',
		          url: '/api/resturant/menus/'+rest.id,
		          ContentType: "application/json",
		          success: function(data){
		  					rest.info.menus = data.menus;
		  					$.setSideBarMenus(data.menus);
		          		},
		          error: function(){alert('获取菜单失败')}
		    });
	  	}else{
	  		$.setSideBarMenus(rest.info.menus);
	  	}
	  }
	
	window.login = function(){
		$('#login-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					window.user = data.user
					$('#login').modal('hide');
					$('#nav-right').html("<li><a id='nav-username' href='#userview'>"+user.username+"</a></li><li><a id='nav-logout' onlick='logout()'>登出</a></li><li><a>首页</a></li>");
					$('#nav-logout').click(logout);
					$('.user').addClass('user-login');
    				$('.user').removeClass('user');
					if(user.permission > 0){
						$('.boss').addClass('boss-login');
    					$('.boss').removeClass('boss');
					}
					$('#bottom-nav-user').html(user.username);
				}else{
					$('#login-message').html(data.message);
				}
			}
		});
	}
	
	window.signup = function(){
		$('#signup-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					window.user = data.user
					$('#signup').modal('hide');
					user = data.user;
					$('#nav-right').html("<li><a id='nav-username' href='#userview'>"+user.username+"</a></li><li><a id='nav-logout' onlick='logout()'>登出</a></li><li><a>首页</a></li>");
					$('#nav-logout').click(logout);
					$('#main').append($("<section id='"+ user.username +"' style='left:400%;background-color: #0f0;'>" +
										"<div>fivth div</div>" +
										"</section>"));
					$('.user').addClass('user-login');
    				$('.user').removeClass('user');
					if(user.permission > 0){
						$('.boss').addClass('boss-login');
    					$('.boss').removeClass('boss');
					}
					$('#bottom-nav-user').html(user.username);
				}else{
					$('#usernameErrorMessage').html(data.usernameErrorMessage);
					$('#passwordErrorMessage').html(data.passwordErrorMessage);
					$('#emailErrorMessage').html(data.emailErrorMessage);
				}
			}
		});
	}
	
	window.logout = function(){
		$.ajax({
            type: 'POST',
            url: '/signout',
            ContentType: "application/json",
    		success: function(data){
				if(data.result){
					window.user = null;
					$('#nav-right').html("<li><a data-toggle='modal' data-target='#login'>登录</a></li><li><a id='nav-signup' data-toggle='modal' data-target='#signup'>注册</a></li><li><a>首页</a></li>");
					$('.user-login').addClass('user');
    				$('.user-login').removeClass('user-login');
    				$('.boss-login').addClass('boss');
					$('.boss-login').removeClass('boss-login');
					$('#bottom-nav-user').html('游客');
				}else{
					alert(data.message);
				}
    		},
    		error: function(){alert('服务器繁忙，请稍后再试')}
        });
	};
	
	window.check = function() {
		var password = $("#password").val();
		var repassword = $("#repassword").val();
		var rpwd = $("#repassword")[0];
		if(repassword.length > 0)
		{
			if(password != repassword)
			{
				rpwd.setCustomValidity("密码不一致!"); 
			}else
			{
				rpwd.setCustomValidity("");
			}
		}else
		{
			rpwd.setCustomValidity("请输入此字段!");
		}
	};
	
	window.addOrderMenu = function(m){
		window.currentRest.info.orderMenus.push(m);
		window.shoppingCart.addMenu(m);
	}
	
	window.removeOrderMenu = function(m){
		window.currentRest.info.orderMenus.splice(window.currentRest.info.orderMenus.indexOf(m),1);
		window.shoppingCart.removeMenu(m);
	}
});
