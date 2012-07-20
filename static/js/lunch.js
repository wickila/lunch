
/**
 * @fileoverview Provides the core JavaScript functionality for the Geochat
 *   application.
 */
$(function(){
	var map = null;
	var geocoder = null;
	var lastUpdate = 0;
	var initialLocation;
	var browserSupportFlag =  new Boolean();
	var mark;
	var circle;
	var total = 4;
	var complete = 0;
	window.loaded = false;
	window.complete = false;
	window.shoppingCartShow = true;
	window.restuarants = {}
	window.currentRest = null;
	var PERSISSION = 15;
	window.orderMenus = [];//购物车里面的条目
	
	window.calcProgress = function(){
		var progress = (complete/total)*100;
		$('#loading .bar').css('width',progress+'%');
	}
	
	window.startApp = function(){
		$('#loading .bar').css('width','100%');
		setTimeout(function(){
			$('#loading').css('transform','translate(500%,0px)');
			$('#loading').css('-webkit-transform','translate(500%,0px)');
			$('#loading').css('-moz-transform','translate(500%,0px)');
			$('#loading').css('-o-transform','translate(500%,0px)');
			$('#loading').css('-ms-transform','translate(500%,0px)');
		},200);
		setTimeout(function(){
			$('#content').css('opacity',1);
		},400);
		setTimeout(function(){
			changePage(1);
		},1000);
		marker = new google.maps.Marker({
	      position: initialLocation,
	      title:window.user?window.user.username:'您的位置'
	    });
	    circle = new google.maps.Circle({
	    	  map: map,
	    	  strokeColor: '#999999',
	    	  strokeWeight: '1',
	    	  radius: 1000,
	    	  fillColor: '#aaaaaa'
	    	});
	    circle.bindTo('center', this.marker, 'position');
	    circle.setVisible(false);
	    marker.setMap(map);
		initAppEvents();
	}
	
	window.initAppEvents = function(){
		google.maps.event.addListener(map,'dragend',function(e){
			getLocalRestuarants();
		});
		google.maps.event.addListener(map,'zoom_changed',function(e){
			getLocalRestuarants();
		});
	}
	
	window.search = function(type){
		if(!$('.search-query').val()){
			lunchAlert('请输入搜索关键字');
			return;
		}
		if(type == 'adress'){
			var address = $('.search-query').val();
		    geocoder.geocode( { 'address': address}, function(results, status) {
		      if (status == google.maps.GeocoderStatus.OK) {
		        map.panTo(results[0].geometry.location,PERSISSION);
		      } else {
		        alert("Geocode was not successful for the following reason: " + status);
		      }
		    });
		}else{
			var restname = $('.search-query').val();
			for(var i in window.restuarants){
				if(window.restuarants[i].info.name == restname){
					window.setCurrentRest(window.restuarants[i].info);
					return;
				}
			}
			var theChooseOne = {'thanks':0}
			for(var j in window.restuarants){
				if(window.restuarants[j].info.name.indexOf(restname)>-1){
					var info = window.restuarants[j].info;
					if(theChooseOne.thanks<=info.thanks){
						theChooseOne = info;
					}
				}
			}
			if(theChooseOne.name){
				window.setCurrentRest(theChooseOne);
				return;
			}
			$.ajax({
	            type: 'GET',
	            url: '/api/search/rest',
	            ContentType: "application/json",
	            data: {'restname':restname},
	    		'success': function(data){
	    			if(data.result){
	    				var rests = data.restuarants;
	    				var theMostPopRest = rests[0];
	    				for(var k in rests){
	    					var rest = rests[k];
	    					if(theMostPopRest.thanks<rest.thanks){
    							theMostPopRest = rest;
    						}
	    				}
	    				window.setCurrentRest(theMostPopRest);
	    				if(!window.restuarants[theMostPopRest.id]){
    						r = new Restuarant(theMostPopRest);
    					}
	    			}else{
	    				alert(data.message);
	    			}
	    		},
	    		'error': function(){alert('获取本地餐厅失败')}
	        });
		}
	}
	
	window.applyOpenShop = function(){
		$('#apply-open-shop-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					$('#apply-open-shop-form').hide();
					$('#apply-open-shop-success').show();
				}
			},
			'error':function(){
					alert('由于服务器繁忙，提交申请失败，请稍后再试');
				}
		});
	}
	
	window.initialize =  function() {
		geocoder = new google.maps.Geocoder();
	    var latlng = new google.maps.LatLng(GEOCHAT_VARS['initial_latitude'], GEOCHAT_VARS['initial_longitude']);
	    var myOptions = {
	      zoom: PERSISSION,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);

	    // Try W3C Geolocation (Preferred)
	    if(navigator.geolocation) {
	      browserSupportFlag = true;
	      navigator.geolocation.getCurrentPosition(function(position) {
	        initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	        initLocation();
	      }, function() {
	        handleNoGeolocation(browserSupportFlag);
	      });
	    // Try Google Gears Geolocation
	    } else if (google.gears) {
	      browserSupportFlag = true;
	      var geo = google.gears.factory.create('beta.geolocation');
	      geo.getCurrentPosition(function(position) {
	        initialLocation = new google.maps.LatLng(position.latitude,position.longitude);
	        initLocation();
	      }, function() {
	        handleNoGeoLocation(browserSupportFlag);
	      });
	    // Browser doesn't support Geolocation
	    }else{
	      browserSupportFlag = false;
	      handleNoGeolocation(browserSupportFlag);
	    }
	    function initLocation(){
	    	complete+=1;
	    	map.setCenter(initialLocation);
	    	startLoad();
	    }
	    function handleNoGeolocation(errorFlag) {
	      if (errorFlag == true) {
	        alert("Geolocation service failed.");
	        initialLocation = latlng;
	      } else {
	        alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
	        initialLocation = latlng;
	      }
	      initLocation();
	    }
	    
	    var contextMenu = $(document.createElement('ul'))
			.attr('id', 'contextMenu');
		contextMenu.append(
			'<li><a href="#zoomIn">Zoom in</a></li>' +
			'<li><a href="#zoomOut">Zoom out</a></li>' +
			'<li><a href="#centerHere">Center map here</a></li>' +
			'<li><a href="#newRestuarant">在此处开店</a></li>'
		);
		contextMenu.bind('contextmenu', function() { return false; });
		$(map.getDiv()).append(contextMenu);

		/**
		 * Menu events
		 */
		var clickedLatLng;
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
						        if(results[0]) {
						        	var adress = results[0].formatted_address;
									$('#new-rest-form-adress').val(adress);
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
  	}
	
	var Restuarant =  function(info) {
		this.id = info.id;
	    this.info = info;
	    this.info.orderMenus = [];
	    this.point = new google.maps.LatLng(info.lat, info.lng);
	    var image = new google.maps.MarkerImage('/static/img/marker'+(info.rtype+1)+'.png',
	    	      new google.maps.Size(40, 40),
	    	      new google.maps.Point(0,0),
	    	      new google.maps.Point(20, 20));
	    this.marker = new google.maps.Marker({
	      id: this.id,
	      position: this.point,
	      title:this.info.name,
	      icon:image
	    });
	    this.circle = new google.maps.Circle({
	    	  map: map,
	    	  strokeColor: '#999999',
	    	  strokeWeight: '1',
	    	  radius: this.info.maxdistance,
	    	  fillColor: '#aaaaaa'
	    	});
	    this.circle.bindTo('center', this.marker, 'position');
	    this.circle.setVisible(false);
	    this.menus = [];
	    
	    this.marker.setMap(map);
	    window.restuarants[this.id] = this;
	    google.maps.event.addListener(this.marker, 'click', function() {
		    	var rest = restuarants[this.id];
		        map.panTo(this.getPosition());
		        setCurrentRest(rest.info);
		});
	};
	  
	window.new_restuarant = function(){
		$('#new_restuarant_form').ajaxForm({
				'dataType': 'json',
				'success':function(data){
					data = eval(data);
					if(data.result){
						r = new Restuarant(data.rest);
						data.rest.menutypes = [];
						if(!window.user.restuarant){
							window.user.restuarant = data.rest;
						}
						map.setCenter(new google.maps.LatLng(data.rest.lat,data.rest.lng), PERSISSION);
						$('#myModal').modal('hide');
						window.lunchAlert("您已经成功新开一家店铺啦，点击<a onclick='changePage(4)'>此处</a>可以修改店铺的基本资料哦");
					}
				}
		});
	}
	
	window.getLocalRestuarants = function(callback){
	    $.ajax({
	    	type: 'GET',
	        url: '/api/localrestuarants',
	        ContentType: "application/json",
	        callback:callback,
	        data:{"lat":map.getCenter().lat(),
	        		"lng":map.getCenter().lng(),
	          		"percision":map.getZoom()-6},
	          		'success': function(data){
	          			var rest;
	          			var r;
	          			for(var i in data.restuarants)
	          			{
	          				rest = data.restuarants[i]
	          				if(!window.restuarants[rest.id]){
	          					r = new Restuarant(rest);
	          				}
	          			}
	          			if(this.callback){
	          				this.callback();
	          			}
	          		},
	          		'error': function(){alert('获取本地餐厅失败')}
	      });
	};
		
	window.getUser = function(callback){
		$.ajax({
	        type: 'GET',
	        url: '/api/checklogin',
	        ContentType: "application/json",
	        callback:callback,
			success: function(data){
				if(data.result){
					window.user = data.user;
					if(user){
						$('.user').addClass('user-login');
						$('.user').removeClass('user');
						if(user.permission > 0){
							$('.boss').addClass('boss-login');
							$('.boss').removeClass('boss');
						}
						$('.show-login-tip').hide();
					}
					if(callback){
						callback();
					}
				}else{
					alert(data.message);
				}
			},
			error: function(){alert('登录失败')}
	    });
	}
		
	window.getMyRestuarant = function(callback){
		if(window.user && window.user.permission>0 && window.user.restuarant==undefined){
			for(id in window.restuarants){
				var rest = window.restuarants[id].info;
				if(rest.username == window.user.username){
					window.user.restuarant = rest;
					if(callback){
						callback();
					}
					return;
				}
			}
			$.ajax({
	            type: 'GET',
	            url: '/api/getmyrest',
	            ContentType: "application/json",
	            callback:callback,
	    		success: function(data){
	    			if(data.result){
	    				if(window.user.restuarant == undefined){
	    					if(!window.restuarants[data.restuarant.id]){
	    						new Restuarant(data.restuarant);
	    					}
	    					window.user.restuarant = data.restuarant;
	    					if(callback){
	    						callback();
	    					}
	    				}
	    			}else{
	    				alert(data.message);
	    			}
	    		},
	    		error: function(){alert('获取餐厅信息失败')}
	        });
		}
	}
		
	window.updateUserInfoView = function(){
		if(window.user){
			if(window.user.restuarant){
				$('#rest-setting-name').val(window.user.restuarant.name);
				$('#rest-settting-type').val(window.user.restuarant.rtype);
				$('#rest-setting-des').val(window.user.restuarant.description);
				$('#rest-setting-addres').val(window.user.restuarant.adress);
				$('#rest-setting-phone').val(window.user.restuarant.telephone);
				$('#rest-setting-minprice').val(window.user.restuarant.minprice);
				$('#rest-avatar-img').attr('src',window.user.restuarant.avatarurl);
				$('#setting-avatar-img').attr('src',window.user.avatarurl);
			}
			if(!window.bossOrderView){
				if(window.user && window.user.restuarant){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
				}
			}
		}else{
			$('#rest-setting-name').val("");
			$('#rest-settting-type').val('');
			$('#rest-setting-des').val('');
			$('#rest-setting-addres').val('');
			$('#rest-setting-phone').val('');
			$('#rest-setting-minprice').val('');
			$('#rest-avatar-img').attr('src','');
			$('#setting-avatar-img').attr('src','');
			if(window.bossOrderView){
				window.bossOrderView.dispose();
				window.bossOrderView = null;
			}
		}
	}
		
	window.setCurrentRest = function(rest){
		if(window.currentRest == rest)return;
		for(var i in window.restuarants){
	        	window.restuarants[i].circle.setVisible(false);
	    }
		window.restuarants[rest.id].circle.setVisible(true);
		window.currentRest = rest;
		map.panTo(new google.maps.LatLng(rest.lat,rest.lng), PERSISSION);
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
		          error: function(){alert('获取菜单分类失败')}
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
					$('.show-login-tip').hide();
					window.updateView();
					getMyRestuarant();
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
					$('.show-login-tip').hide();
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
					$('.show-login-tip').show();
					window.updateView();
					window.updateUserInfoView();
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
		}
	}
	
	window.getShoppingCartNum = function(){
		var result = 0;
		for(var i in window.orderMenus){
			result += window.orderMenus[i].num;
		}
		return result;
	}
	
	window.showShoppingCart = function (){
		if(window.page==3){
			lunchAlert('此界面不允许操作购物车');
			return;
		}
		window.shoppingCartShow = true;
		setTransform($('#shoppingCart-container'),'0px');
	}
	
	window.hideShoppingCart = function (){
		window.shoppingCartShow = false;
		setTransform($('#shoppingCart-container'),'-110%');
	}
	
	window.toggleShoppingCart = function(){
		if(!window.shoppingCartShow){
			window.showShoppingCart();
		}else{
			window.hideShoppingCart();
		}
	}
	
	window.setTransform = function(element,num){
		element.css('transform','translate(0px,'+ num +')');
		element.css('-webkit-transform','translate(0px,'+ num +')');
		element.css('-moz-transform','translate(0px,'+ num +')');
		element.css('-o-transform','translate(0px,'+ num +')');
		element.css('-ms-transform','translate(0px,'+ num +')');
	}
	
	window.startLoad = function(){
		getLocalRestuarants(function(){
			var hasRest = false;
			for(var i in window.restuarants) {
			    if(window.restuarants.hasOwnProperty(i)) {
			    	hasRest = true;
			    	complete+=1;
			    	calcProgress();
			    	break;
			    }
			}
			if(hasRest){
				getUser(function(){
					complete+=1;
					calcProgress();
					if(window.user && window.user.permission>0){
						getMyRestuarant(function(){
							complete+=1;
							calcProgress();
							if(window.user.restuarant){
								setCurrentRest(window.user.restuarant);
								startApp();
							}
						});
					}else{
						var theChoosenOne = {'thanks':0}
						for(var i in window.restuarants){
							var info = window.restuarants[i].info;
							if(info.thanks>=theChoosenOne.thanks){
								theChoosenOne = info;
							}
						}
						setCurrentRest(theChoosenOne);
						startApp();
					}
				});
			}else{
				map.setZoom(map.getZoom()-1)
				startLoad();
			}
		});
	}
//	interval = setInterval('calcProgress();',20);
});
