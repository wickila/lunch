
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
	window.orderMenus = [];//购物车里面的条目
	if(CURRENT_REST_ID){
		$.ajax({
            type: 'GET',
            url: '/api/resturant/view/'+CURRENT_REST_ID,
            ContentType: "application/json",
    		'success': function(data){
    			if(data.result){
    				var rest = data.restuarant;
    				window.setCurrentRest(rest);
    				window.changePage(2);
    			}else{
    				alert(data.message);
    			}
    		},
    		'error': function(){alert('获取本地餐厅失败')}
        });
	}
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
						var latlng = new google.maps.LatLng(clickedLatLng.lat(), clickedLatLng.lng());
						geocoder.geocode({'latLng': latlng}, function(results, status) {
						      if (status == google.maps.GeocoderStatus.OK) {
						        if (results[0]) {
						        	var adress = results[0].formatted_address;
									$('#new-rest-form-adress').val(adress);
//						          map.setZoom(11);
//						          marker = new google.maps.Marker({
//						              position: latlng,
//						              map: map
//						          });
//						          infowindow.setContent(results[1].formatted_address);
//						          infowindow.open(map, marker);
						        }
						      } else {
						        alert("Geocoder failed due to: " + status);
						      }
						    });
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
    var image = new google.maps.MarkerImage('/static/img/marker'+(info.rtype+1)+'.png',
    	      // This marker is 20 pixels wide by 32 pixels tall.
    	      new google.maps.Size(40, 40),
    	      // The origin for this image is 0,0.
    	      new google.maps.Point(0,0),
    	      // The anchor for this image is the base of the flagpole at 0,32.
    	      new google.maps.Point(20, 20));
//    var shadow = new google.maps.MarkerImage('images/beachflag_shadow.png',
//  // The shadow image is larger in the horizontal dimension
//  // while the position and offset are the same as for the main image.
//    		new google.maps.Size(37, 32),
//    		new google.maps.Point(0,0),
//    		new google.maps.Point(0, 32));
    this.marker = new google.maps.Marker({
      id: this.id,
      position: this.point,
      title:this.info.name,
      icon:image
    });
    this.menus = [];
    
    this.marker.setMap(map);
    window.restuarants[this.id] = this;
    google.maps.event.addListener(this.marker, 'click', function() {
    	var rest = restuarants[this.id];
    	setCurrentRest(rest.info);
        map.panTo(this.getPosition());
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
						window.lunchAlert("您已经成功新开一家店铺啦，点击<a onclick='changePage(4)'>此处</a>可以修改店铺的基本资料哦");
					}
				}
		});
	}

  	function getRestuarants(){
	  	geocoder = new google.maps.Geocoder();
//	  	geocoder.geocode( { 'address': GEOCHAT_VARS['default_location']}, function(results, status) {
//	        if (status == google.maps.GeocoderStatus.OK) {
	          var latitude = GEOCHAT_VARS['initial_latitude'];
	          var longitude = GEOCHAT_VARS['initial_longitude'];
//	          var latlng = results[0].geometry.location
//	          if (latlng) {
//	            latitude = latlng.lat();
//	            longitude = latlng.lng();
//	          }
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
	              				if(CURRENT_REST_ID){
	              					if(rest.id == CURRENT_REST_ID){
	              						window.setCurrentRest(rest);
	              					}
	              				}else if(window.user && window.user.username == rest.username){
	              					window.user.restuarant = rest;
	              					window.setCurrentRest(rest);
	              				}
	              			}
	              			if(!window.currentRest){
	              				window.setCurrentRest(rest);
	              			}
	              		},
	              		'error': function(){alert('获取本地餐厅失败')}
	          });
//	        } else {
//	          alert("Geocode was not successful for the following reason: " + status);
//	        }
//	      });
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
//    				$('#bottom-nav-user').html(user.username);
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
		if(window.user && window.user.permission>0 && window.user.restuarant!=undefined){
			for(id in window.restuarants){
				var rest = window.restuarants[id].info;
				if(rest.username == window.user.username){
					window.user.restuarant = rest;
					window.setCurrentRest(rest);
					return;
				}
			}
			$.ajax({
	            type: 'GET',
	            url: '/api/getmyrest',
	            ContentType: "application/json",
	    		success: function(data){
	    			if(data.result){
	    				if(window.user.restuarant == undefined){
	    					window.user.restuarant = data.restuarant;
	    					window.setCurrentRest(data.restuarant);
	    				}
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
	  	if(!window.currentRest.menus){
	  		$.ajax({
		          type: 'GET',
		          url: '/api/resturant/menus/'+rest.id,
		          ContentType: "application/json",
		          success: function(data){
		  					rest.menus = data.menus;
		  					for(var i in rest.menus){
		  						rest.menus[i].num = 0;
		  					}
		  					$.setSideBarMenus(data.menus);
		  					if(window.page == 2){
		  						window.restView.setRest(window.currentRest)
		  					}
		          		},
		          error: function(){alert('获取菜单失败')}
		    });
	  	}else{
	  		$.setSideBarMenus(rest.menus);
	  		if(window.page == 2){
				window.restView.setRest(window.currentRest)
			}
	  	}
	  	if(!window.currentRest.menutypes){
	  		$.ajax({
		          type: 'GET',
		          url: '/api/menutypes/get/'+rest.id,
		          ContentType: "application/json",
		          success: function(data){
		  					rest.menutypes = data.menutypes;
		  					if(window.page == 2){
		  						window.restView.setRest(window.currentRest)
		  					}
		          		},
		          error: function(){alert('获取菜单失败')}
		    });
	  	}
	  }
	
	window.login = function(){
		$('#login-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					window.user = data.user;
					$('#login').modal('hide');
					$('#nav-right').html("<li><a id='nav-username' onclick='changePage(4);'>"+user.username+"</a></li><li><a id='nav-logout' onlick='logout()'>登出</a></li>");
					$('#nav-logout').click(logout);
					$('.user').addClass('user-login');
    				$('.user').removeClass('user');
					if(user.permission > 0){
						$('.boss').addClass('boss-login');
    					$('.boss').removeClass('boss');
					}
//					$('#bottom-nav-user').html(user.username);
					window.updateView();
					getRestuarant();
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
					$('#nav-right').html("<li><a id='nav-username' onclick='changePage(4)'>"+user.username+"</a></li><li><a id='nav-logout' onlick='logout()'>登出</a></li>");
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
//					$('#bottom-nav-user').html(user.username);
					window.updateView();
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
					$('#nav-right').html("<li><a data-toggle='modal' data-target='#login'>登录</a></li><li><a id='nav-signup' data-toggle='modal' data-target='#signup'>注册</a>");
					$('.user-login').addClass('user');
    				$('.user-login').removeClass('user-login');
    				$('.boss-login').addClass('boss');
					$('.boss-login').removeClass('boss-login');
					$('#bottom-nav-user').html('游客');
					window.updateView();
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
	
	window.showAddOrderAnimation = function(element,menuname,callback){
//		var mirror = element.clone();
		var mirror = $('<div id="cart_shadow" style="display: none;background-color:rgb(251,255,35); border:1px solid #000;z-index: 9999;">'+menuname+'</div>');
		mirror.appendTo($('body'));
		mirror.css({
					'width' : element.css('width'),
					'height': element.css('height') ,
					'position' : 'absolute',
					'top' : element.offset().top,
					'left' : element.offset().left,
					'opacity' : 0.6				 
				 }).show();
		$cart = $('#nav-shopping-cart-btn');
		mirror.animate({ 
			  width: $cart.innerWidth(), 
			  height: $cart.innerHeight()*0.2, 
			  top: $cart.offset().top, 
			  left: $cart.offset().left,
			  opacity: 0
		 },  {duration: 300 , complete: function(){
				 mirror.remove();
				 callback();
		     } 
		 })
	}
	
	window.updateShoppingCartNum = function(){
		$('.order-num').css('color','white');
		$('.order-num').slideUp(200,function(){
			$('.order-num').html(window.getShoppingCartNum());
			$('.order-num').slideDown(200,function(){
				setTimeout(function(){
					$('.order-num').css('color','');
				},20)
			});
		})
	}
	
	window.addOrderMenu = function(m){
		m.num++;
		if(window.orderMenus.indexOf(m)<0){
			var rest = window.restuarants[m.rid];
			rest.info.orderMenus.push(m);
			window.orderMenus.push(m);
		}
		window.shoppingCart.addMenu(m);
		window.updateShoppingCartNum();
		if(window.shoppingCartShow){
			updateLayout();
		}
	}
	
	window.removeOrderMenu = function(m){
		m.num --;
		m.num = m.num<0?0:m.num;
		if(m.num == 0){
			var rest = window.restuarants[m.rid];
			rest.info.orderMenus.splice(rest.info.orderMenus.indexOf(m),1);
			window.orderMenus.splice(window.orderMenus.indexOf(m),1);
		}
		window.shoppingCart.removeMenu(m);
		window.updateShoppingCartNum();
		if(window.orderMenus.length == 0){
			hideShoppingCart();
		}if(window.shoppingCartShow){
			updateLayout();
		}
	}
	
	window.getShoppingCartNum = function(){
		var result = 0;
		for(var i in window.orderMenus){
			result += window.orderMenus[i].num;
		}
		return result;
	}
	
	window.shoppingCartShow = true;
	
	window.showShoppingCart = function (){
		window.shoppingCartShow = true;
		setCss($('#shoppingCart-container'),'0px');
		var modal = $("<div class='modal-backdrop fade in'></div>");
		modal.css('opacity',0);
		modal.css('transform','translate3d('+ (page-1) +'00%, 0px, 0px)');
		modal.css('-webkit-transform','translate3d('+ (page-1) +'00%, 0px, 0px)');
		modal.css('-moz-transform','translate3d('+ (page-1) +'00%, 0px, 0px)');
		modal.css('-o-transform','translate3d('+ (page-1) +'00%, 0px, 0px)');
		modal.css('-ms-transform','translate3d('+ (page-1) +'00%, 0px, 0px)');
		$('#main').append(modal);
		modal.animate({opacity:0.8},{duration:200})
//		setCss($('.content'),$('#shoppingCart-container').height()+'px');
	}
	
	window.hideShoppingCart = function (){
		window.shoppingCartShow = false;
		setCss($('#shoppingCart-container'),'-100%');
		$('#main').find('.modal-backdrop').animate({opacity:0},{duration:200,complete:function(){$('#main').find('.modal-backdrop').remove()}});
//		setCss($('.content'),'0px');
	}
	
	window.toggleShoppingCart = function(){
		if(!window.shoppingCartShow){
			window.showShoppingCart();
		}else{
			window.hideShoppingCart();
		}
	}
	
	function setCss(element,num){
		element.css('transform','translate3d(0px,'+ num +', 0px)');
		element.css('-webkit-transform','translate3d(0px,'+ num +', 0px)');
		element.css('-moz-transform','translate3d(0px,'+ num +', 0px)');
		element.css('-o-transform','translate3d(0px,'+ num +', 0px)');
		element.css('-ms-transform','translate3d(0px,'+ num +', 0px)');
	}
	
	function updateLayout(){
//		setCss($('.content'),$('#shoppingCart-container').height()+'px');
	}
});
