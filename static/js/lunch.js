
/**
 * @fileoverview Provides the core JavaScript functionality for the Geochat
 *   application.
 */
$(function(){
	window.map = null;
	window.geocoder = null;
	var lastUpdate = 0;
	window.initialLocation;
	var browserSupportFlag =  new Boolean();
	var mark;
	var circle;
	var total = 4;
	var complete = 0;
	window.shoppingCartShow = true;
	window.restuarants = {}
	window.currentRest = null;
	window.restView = null;;
	window.settingMenus = null;
	window.orderView = null;;
	window.shoppintCart = null;
	window.page = 0;
	PERSISSION = 15;
	window.orderMenus = [];//购物车里面的条目
	
	window.calcProgress = function(){
		var progress = (complete/total)*100;
		$('#loading .bar').css('width',progress+'%');
		if(complete == 0){
			$('#loading-tip').html('正在加载本地餐厅...');
		}else if(complete == 1){
			$('#loading-tip').html('正在加载本地餐厅...');
		}else if(complete == 2){
			
		}else if(complete == 3){
			
		}else{
			$('#loading-tip').html('正在初始化应用程序...');
		}
	}
	
	window.startApp = function(){
		$('#loading .bar').css('width','100%');
		setTimeout(function(){
			$('#loading').css('left','500%');
		},200);
		setTimeout(function(){
			$('#content,.navbar-fixed-top').css('opacity',1);
			$('#loading').remove();
		},400);
		setTimeout(function(){
			if(CURRENT_REST_ID){
				changePage(2);
			}else{
				changePage(1);
			}
		},1000);
		marker = new BMap.Marker(initialLocation);
		marker.setTitle(window.user?window.user.username+'的位置':'您的位置');
		map.addOverlay(marker);
	    window.shoppingCart = new ShoppingCart($('#shoppingCart-container .accordion'));
	    $('.tooltip-enable').tooltip({
		      selector: "a[rel=tooltip]"
		});
		$('.tooltip-enable-bottom').tooltip({
		      selector: "a[rel=tooltip]",
		      placement: "bottom"
		});
		updateUserInfoView();
		initAppEvents();
	}
	
	window.initAppEvents = function(){
		map.addEventListener('dragend',function(e){
			getLocalRestuarants();
		});
		map.addEventListener('zoomend',function(e){
			getLocalRestuarants();
		});
		$('#main').bind('mousedown',function(evt){
			var canmove = false;
			if($(evt.target).parent().attr('id')=='main' ||
					$(evt.target).hasClass('container') ||
					$(evt.target).hasClass('content') ||
					$(evt.target).hasClass('radius-border') ||
					$(evt.target).hasClass('span3') ||
					$(evt.target).hasClass('span9')){
				canmove = true;
			}
			if(evt.which == 1&&canmove){
				window.isDragging = true;
				window.orignClientX = evt.clientX;
				window.speed = 0;
				window.maxSpeed = 0;
				window.dragStartTime = (new Date()).getTime();
				evt.preventDefault();
			}
		});
		$('#main').bind('mousemove',function(evt){
			if(window.isDragging){
				window.speed = Math.abs(evt.clientX - window.orignClientX)/((new Date()).getTime()-window.dragStartTime);
				window.maxSpeed = window.maxSpeed<window.speed?window.speed:window.maxSpeed;
				var x = ((1-page)+(evt.clientX - window.orignClientX)/$(window).width())*100;
				$('section').each(function(){
					var section = $(this);
					var op = Math.abs(Math.abs((evt.clientX - window.orignClientX)/$(window).width())-section.css('opacity'));
					section.css('opacity',op);
				});
				$('#main').css('left',x +'%');
				x = (evt.clientX - window.orignClientX)/$(window).width()*100;
				if(Math.abs(x)>80||window.maxSpeed>2){
					window.changePage(window.page-(x/Math.abs(x)));
					window.isDragging = false;
				}
				evt.preventDefault();
			}
		});
		$('#main').bind('mouseup',function(evt){
			window.isDragging = false;
			$('#main').css('left',(1-page) +'00%');
			switch(page){
				case 1:
					$('#overview').css('opacity',1);
					$('#restview').css('opacity',0);
					break;
				case 2:
					$('#restview').css('opacity',1);
					$('#overview').css('opacity',0);
					$('#orderview').css('opacity',0);
					$('#userview').css('opacity',0);
					break;
				case 3:
					$('#restview').css('opacity',0);
					$('#overview').css('opacity',0);
					$('#orderview').css('opacity',1);
					$('#userview').css('opacity',0);
					break;
				case 4:
					$('#restview').css('opacity',0);
					$('#overview').css('opacity',0);
					$('#orderview').css('opacity',0);
					$('#userview').css('opacity',1);
					break;
			}
		});
		$('.modal').on('shown',function(){
			$(this).find('input:first').focus();
		});
		$('#select-thumbnail-modal').on('shown',function(){
			if(!window.thumbnails){
				$.ajax({
			          type: 'GET',
			          url: '/api/thumbnaillib',
			          ContentType: "application/json",
			          success: function(data){
			  					if(data.result){
			  						window.thumbnails = data.thumbnails;
			  						for(var i in window.thumbnails){
			  							$('#thumb-lib').find('.thumbnails').append($("<li>"+
			  																		"<a href='#' class='thumbnail'><img style='width:160px;height:160px' src='"+window.thumbnails[i].src+"' alt='"+window.thumbnails[i].name+"'></a>"+
			  																		"<h5>"+window.thumbnails[i].name+"</h5>"+
			  																		"</li>"));
			  						}
			  						$('#select-thumbnail-modal').css('width',190*3+30+10)
			  						$('#thumb-lib .thumbnail').bind('click',function(){
			  							$('#thumb-lib .thumbnail').removeClass('select')
			  							$(this).addClass('select');
			  							$('#thumb-lib').data('selected-src',$(this).find('img').attr('src'))
			  						});
			  					}
			          		},
			          error: function(){alert('获取菜单失败')}
			    });
			}
		});
		$('#select-thumbnail-btn').bind('click',function(){
			if($('#thumb-lib').hasClass('active')){
				$('#setting-menu-imgurl').val($('#thumb-lib').data('selected-src'));
				$('#setting-menu-img-form').get(0).reset();
				$('#setting-menu-img').attr('src',$('#thumb-lib').data('selected-src'));
			}else if($('#thumb-upload').hasClass('active')){
				$('#setting-menu-img').attr('src',$('#setting-menu-img-modal').attr('src'));
				$('#setting-menu-imgurl').val('');
			}else{
				$('#setting-menu-imgurl').val($('#setting-menu-img-modal-internet').attr('src'));
				$('#setting-menu-img').attr('src',$('#setting-menu-img-modal-internet').attr('src'));
				$('#setting-menu-img-form').get(0).reset();
			}
			$('#select-thumbnail-modal').modal('hide');
		})

		var theChoosenOne
		setInterval(function(){
			if(theChoosenOne){
				theChoosenOne.shutup();
			}
			var rolls = [];
			var bounds = map.getBounds();
			for(var i in window.restuarants){
				if(bounds.containsPoint(window.restuarants[i].marker.getPosition())&&window.currentRest != window.restuarants[i].info){
					window.restuarants[i].roll = Math.random();
					rolls.push(window.restuarants[i])
				}
			}
			theChoosenOne = rolls[0];
			for(var j in rolls){
				if(!theChoosenOne || rolls[j].roll > theChoosenOne.roll){
					theChoosenOne = rolls[j];
				}
			}
			if(theChoosenOne){
				theChoosenOne.say(theChoosenOne.info.description);
			}
		},15000);
	}
	
	window.initialize =  function() {
		geocoder = new BMap.Geocoder();
	    var latlng = new BMap.Point(GEOCHAT_VARS['initial_longitude'],GEOCHAT_VARS['initial_latitude']);
	    map = new BMap.Map("map-canvas");
	    map.enableScrollWheelZoom();

	    if(navigator.geolocation) {
	      $('#loading-tip').html('正在获取您的地理位置，请点击浏览器上方的允许按钮...');
	      navigator.geolocation.getCurrentPosition(function(position) {
	        initialLocation = new BMap.Point(position.coords.longitude,position.coords.latitude);
	        initLocation();
	      }, function() {
	        lunchAlert('您拒绝了浏览器定位您的位置，我们获取到您的位置可能不太准确。您可以在浏览器设置里面重新设置此选项');
	        handleNoGeoLocation();
	      });
	      setTimeout(function(){
	    	  if(!window.initialLocation){
	    		  handleNoGeoLocation();
	    	  }
	      },5000);
	    }else{
	    	handleNoGeoLocation();
	    }
	    function initLocation(){
	    	complete+=1;
	    	calcProgress();
	    	map.centerAndZoom(initialLocation,PERSISSION);
	    	startLoad();
	    	geocoder.getLocation(initialLocation, function(results) {
		      if(results) {
		        	var adress = results.address;
					$('#nav-my-location').attr('data-original-title',adress);
		      } else {
		        lunchAlert("Geocoder failed");
		      }
		    });
	    }
	    function handleNoGeoLocation(){
	    	initialLocation = latlng;
	    	initLocation();
	    }
	    var menu = new BMap.ContextMenu();
	    var txtMenuItem = [
	      {
	       text:'放大',
	       callback:function(){map.zoomIn()}
	      },
	      {
	       text:'缩小',
	       callback:function(){map.zoomOut()}
	      },
	      {
	       text:'在此处开店',
		   callback:function(){
	    	  if(!window.user){
					alert('您尚未登录');
				}else if(window.user.permission < 1){
					alert('您的权限不够')
				}else if(window.user.restuarant){
					alert('您已经有一家店啦');
				}else{
					$('#lat').val(clickedLatLng.lat);
					$('#lng').val(clickedLatLng.lng);
					geocoder.geocode(clickedLatLng, function(results) {
					      if(results) {
					        	var adress = results.address;
								$('#new-rest-form-adress').val(adress);
								$('#myModal').modal('show');
					      } else {
					        alert("Geocoder failed due to: " + status);
					      }
				    });
				}
	      	}
	      }
	     ];

	     for(var i=0; i < txtMenuItem.length; i++){
	      menu.addItem(new BMap.MenuItem(txtMenuItem[i].text,txtMenuItem[i].callback,100));
	     }
	     var clickedLatLng;
	     map.addContextMenu(menu);
	     menu.addEventListener('open',function(event){
	    	 clickedLatLng = event.point;
	     })
  	}
	
	var Restuarant =  function(info) {
		this.id = info.id;
	    this.info = info;
	    this.info.orderMenus = [];
	    this.point = new BMap.Point(info.lng,info.lat);
	    var myIcon = new BMap.Icon('/static/img/marker'+(info.rtype+1)+'.png',
			    	      new BMap.Size(40, 40),{
					offset:new BMap.Point(20, 20)});
	    this.marker = new BMap.Marker(this.point,{icon:myIcon});
	    this.marker.setTitle(this.info.name);
	    map.addOverlay(this.marker);    
	    this.circle = new BMap.Circle(this.point,this.info.maxdistance,{
	    	  strokeColor: '#999999',
	    	  strokeWeight: '1',
	    	  fillColor: '#aaaaaa',
	    	  enableClicking:false
	    	});
	    map.addOverlay(this.circle);
	    this.menus = [];
	    
	    window.restuarants[this.id] = this;
	    
	    var headDiv = "<div class='iw'>"+
		"<table width='100%'>" +
		"<tr><td rowspan='3'><img class='small-avatar' style='padding: 0 2px 0 0;' src='"+this.info.avatarurl+"'></img></td><td><h4>"+this.info.name+"</h4></td><td align='right' style='font-size: 10pt;'><span class='icon-heart'></span>谢谢:<span style='font-size: 11pt'>"+this.info.thanks+"</span></td></tr>" +
		"<tr><td colspan='2'><span style='font-size: 10pt;color: gray;'>"+this.info.description+"</span></td></tr>" +
		"<tr><td colspan='2'><a onclick='changePage(2)'>了解更多>></a></td></tr>" +
		"</table></div>";

		this.infowindow = new BMap.InfoWindow({
		    content: headDiv
		});
	    this.marker.addEventListener('click', $.proxy(function() {
		        map.panTo(this.marker.getPosition());
		        if(window.currentRest && window.currentRest != this.info){
	        		window.restuarants[window.currentRest.id].marker.closeInfoWindow();
	        		map.removeOverlay(window.restuarants[window.currentRest.id].circle);
		        }
		        this.infowindow.setContent(headDiv);
		        this.marker.openInfoWindow(this.infowindow);
		        map.addOverlay(this.circle);
		        setCurrentRest(this.info);
		},this));
	};
	  
	Restuarant.prototype.say = function(content){
		if(window.currentRest == this.info)return;
		this.infowindow.setContent("<div class='infowindow-div' data-rid='"+this.info.id+"' onclick='synsSetCurrentRest("+this.info.id+")'>"+content+"</div>");
		this.marker.openInfoWindow(this.infowindow);
		setTimeout($.proxy(this.shutup,this),3000);
	}
	
	Restuarant.prototype.shutup = function(){
		this.marker.closeInfoWindow();
	}
	
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
						window.lunchTip("您已经成功新开一家店铺啦，点击<a onclick='changePage(4)'>此处</a>可以修改店铺的基本资料哦");
					}
				}
		});
	}
	
	window.getLocalRestuarants = function(percision,callback){
		if(percision==undefined){
			percision = map.getZoom()-6;
		}
	    $.ajax({
	    	type: 'GET',
	        url: '/api/localrestuarants',
	        ContentType: "application/json",
	        callback:callback,
	        data:{"lat":map.getCenter().lat,
	        		"lng":map.getCenter().lng,
	          		"percision":percision},
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
	    				if(data.restuarant){
		    				if(window.user.restuarant == undefined){
		    					if(!window.restuarants[data.restuarant.id]){
		    						new Restuarant(data.restuarant);
		    					}
		    					window.user.restuarant = data.restuarant;
		    				}
	    				}
						if(callback){
							callback();
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
				$('#rest-setting-rtype').empty();
				for(var i in REST_TYPES){
					var rtype = REST_TYPES[i];
					if(window.user.restuarant.rtype == parseInt(i)){
						$('#rest-setting-rtype').append("<option value='"+i+"' selected='selected'>"+rtype);
					}else{
						$('#rest-setting-rtype').append("<option value='"+i+"'>"+rtype);
					}
				}
				$('#rest-setting-addres').val(window.user.restuarant.adress);
				$('#rest-setting-phone').val(window.user.restuarant.telephone);
				$('#rest-setting-minprice').val(window.user.restuarant.minprice);
				$('#rest-avatar-img').attr('src',window.user.restuarant.avatarurl);
				$('#setting-avatar-img').attr('src',window.user.avatarurl);
				if(!window.bossOrderView){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
				}
			}
			$('#nav-right').html("<li><a onclick='changePage(4)'><i class='icon-user icon-white' style='margin-right: 5px'></i>"+window.user.username+"</a></li><li><a onclick='logout()'>登出</a></li>");
			$('.user').addClass('user-login');
			$('.user').removeClass('user');
			if(user.permission > 0){
				$('.boss').addClass('boss-login');
				$('.boss').removeClass('boss');
			}
			$('.show-login-tip').hide();
		}else{
			$('#nav-right').html("<li><a data-toggle='modal' data-target='#login'>登录</a></li><li><a id='nav-signup' data-toggle='modal' data-target='#signup'>注册</a>");
			$('.user-login').addClass('user');
			$('.user-login').removeClass('user-login');
			$('.boss-login').addClass('boss');
			$('.boss-login').removeClass('boss-login');
			$('.show-login-tip').show();
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
		window.currentRest = rest;
		map.panTo(new BMap.Point(rest.lng,rest.lat));
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
					window.updateUserInfoView();
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
					window.updateUserInfoView();
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
					window.updateView();
					window.updateUserInfoView();
				}else{
					alert(data.message);
				}
			},
			error: function(){alert('服务器繁忙，请稍后再试')}
	    });
	};
	
	window.synsSetCurrentRest = function(id,callback){
		for(var i in window.restuarants){
			var info = window.restuarants[i].info;
			if(info.id == id){
				setCurrentRest(info);
				if(callback){
					callback();
				}
				return;
			}
		}
		$.ajax({
	        type: 'GET',
	        url: '/api/resturant/view/'+id,
	        ContentType: "application/json",
	        callback: callback,
			success: function(data){
				if(data.result){
					if(!window.restuarants[data.restuarant.id]){
						new Restuarant(data.restuarant);
					}
					setCurrentRest(data.restuarant);
					if(callback){
						callback();
					}
				}else{
					alert(data.message);
				}
			},
			error: function(){alert('服务器繁忙，请稍后再试')}
	    });
	}
		
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
		if(!window.shoppingCartShow){
			$('#shoppingCart-container').css('top','-'+$('#shoppingCart-container').css('height'));
		}
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
		if(!window.shoppingCartShow){
			$('#shoppingCart-container').css('top','-'+$('#shoppingCart-container').css('height'));
		}
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
			lunchTip('此界面不允许操作购物车');
			return;
		}
		window.shoppingCartShow = true;
		$('#shoppingCart-container').animate({'top':'50px',
												'opacity':1},{duration:200});
	}
	
	window.hideShoppingCart = function (){
		window.shoppingCartShow = false;
		$('#shoppingCart-container').animate({'top':'-'+$('#shoppingCart-container').css('height'),
			'opacity':0},{duration:200});
	}
	
	window.toggleShoppingCart = function(){
		if(!window.shoppingCartShow){
			window.showShoppingCart();
		}else{
			window.hideShoppingCart();
		}
	}
	
	window.getTimeStr = function(time){
		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;
		var halfamonth = day * 15;
		var month = day * 30;
		var now = new Date();
		var diffValue = now.getTime() - time.getTime();
		var dayC =diffValue/day;
		var hourC =(diffValue%day)/hour;
		var minC =(diffValue%hour)/minute;
		var timestr = '';
		if(dayC>=1){
			timestr += Math.floor(dayC) + '天';
		}
		if(hourC>=1){
			timestr += Math.floor(hourC) + '小时';
		}
		if(minC>=1){
			timestr += Math.floor(minC) + '分钟'
		}
		if(!timestr){
			timestr='刚刚';
		}else{
			timestr += '前';
		}
		return timestr;
	}
	
	window.loadtimes = 0;
	window.startLoad = function(){
		if(loadtimes==3){
			lunchTip('您的附近好像还没有餐厅哦，您可以亲自开设一家餐厅或者邀请您最喜爱的餐厅来有米开设一家餐厅')
		}
		if(map.getZoom() == 6){
			startApp();
			return;
		}
		getLocalRestuarants(PERSISSION-loadtimes-6,function(){
			var hasRest = false;
			for(var i in window.restuarants) {
			    if(window.restuarants.hasOwnProperty(i)) {
					window.setCurrentRest(window.restuarants[i].info);
			    	hasRest = true;
			    	complete+=1;
			    	calcProgress();
			    	break;
			    }
			}
			if(hasRest){
				complete+=1;
				calcProgress();
				if(window.user && window.user.permission>0){
					getMyRestuarant(function(){
						complete+=1;
						calcProgress();
						if(CURRENT_REST_ID){
							synsSetCurrentRest(CURRENT_REST_ID,function(){
								startApp();
							});
						}else{
							if(window.user.restuarant){
								setCurrentRest(window.user.restuarant);
							}else{
								var theChoosenOne = {'thanks':0}
								for(var i in window.restuarants){
									var info = window.restuarants[i].info;
									if(info.thanks>=theChoosenOne.thanks){
										theChoosenOne = info;
									}
								}
							}
							startApp();
						}
					});
				}else{
					if(CURRENT_REST_ID){
						synsSetCurrentRest(CURRENT_REST_ID,function(){
							startApp();
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
				}
			}else{
				loadtimes++;
				startLoad();
			}
		});
	}
	
	window.changePage = function(page){
		window.isDragging = false;
		if(window.page == page)return;
		if(page<1)page=1;
		if(page>4)page=4;
		$('.bottom-nav-a').each(function(){
			$(this).removeClass($(this).attr('id')+'-active');
		});
		$('.navbar-fixed-top').find('.nav:first').find('li').removeClass('active')
		switch(page){
			case 1:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#navbar-fixed-top-index').addClass('active');
				$('#overview').css('opacity',1);
				$('#restview').css('opacity',0);
				$('title').html('Yaammy-首页');
				break;
			case 2:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#navbar-fixed-top-rest').addClass('active');
				$('#restview').css('opacity',1);
				$('#overview').css('opacity',0);
				$('#orderview').css('opacity',0);
				$('#userview').css('opacity',0);
				$('title').html('Yaammy-'+window.currentRest.name);
				break;
			case 3:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#bottom-nav-orderview').addClass('bottom-nav-orderview-active');
				$('#navbar-fixed-top-order').addClass('active');
				$('#restview').css('opacity',0);
				$('#overview').css('opacity',0);
				$('#orderview').css('opacity',1);
				$('#userview').css('opacity',0);
				$('title').html('Yaammy-订单页面');
				break;
			case 4:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#bottom-nav-orderview').addClass('bottom-nav-orderview-active');
				$('#bottom-nav-user').addClass('bottom-nav-user-active');
				$('#restview').css('opacity',0);
				$('#overview').css('opacity',0);
				$('#orderview').css('opacity',0);
				$('#userview').css('opacity',1);
				$('title').html('Yaammy-管理页面');
				break;
		}
		window.page = page;
		window.hideShoppingCart();
		$('#main').css('left',(1-page) +'00%');
		window.updateView();
	}
	
	window.gotoCharge = function(rideOrder){
		window.rideOrder=rideOrder;
		$('#orderview-left-ensure-order').click();
		changePage(3);
	}
	
	window.updateView = function(){
		if(window.viewOrderView)window.viewOrderView.dispose();
		window.viewOrderView = null;
		switch(window.page){
			case 1:
				break;
			case 2:
				if(!window.restView){
					window.restView = new RestView($('#restview'),window.currentRest);
				}else{
					window.restView.setRest(window.currentRest);
				}
				break;
			case 3:
				if(!window.user){
					$('#order-container').empty();
					$('#order-container').append($("<p class='show-login-tip'>您还没有登录，请先<a data-toggle='modal' data-target='#signup'>注册</a>或<a data-toggle='modal' data-target='#login'>登录</a></p>"));
				}else{
					if(!window.orderView){
						window.orderView = new OrderView($('#order-container'));
					}
					if(!window.viewOrderView){
						window.viewOrderView = new ViewOrderView($('#view-order-item-container'),'user');
					}
					window.orderView.setMenus(window.orderMenus);
				}
				break;
			case 4:
				if(window.user){
					if(!window.menutypeSetting){
						window.menutypeSetting = new MenuTypeSetting();
					}
					if(!window.messages){
						window.messages = new Messages();
						$('#setting-message-item-container').append(window.messages.element);
					}
				}
				break;
		}
	}
	
	window.updateLayout = function(){
		$('.content').css('height',$(window).height()-$('.navbar-fixed-top').height()-$('.navbar-fixed-bottom').height()-40);
		$('.content').css('margin-top',$('.navbar-fixed-top').height());
		$('.menu').css('height','200px')
		$('#shoppingCart-container').css('left',($(window).width()-$('#shoppingCart-container').width())*0.5);
		$('#view-order-item-container,#boss-order-item-container,#setting-menus-container,#menus-wrapper').css('height',$('.content').height()-$('.navbar-fixed-top').height()-80);
	}
	
	$.setSideBarRest = function(rest){
		$('#o-side-bar-rest-avatar').attr('src',rest.avatarurl)
		$('#o-side-bar-rest-name').html(rest.name);
		$('#o-side-bar-rest-description').html(rest.description);
		$('#o-side-bar-rest-thanks').html(rest.thanks);
		$('#overview-side-info-menus').css('max-height',$('#overview-side-info-head').parent().height()-$('#overview-side-info-head').find('table').height());
	}
	
	$.setSideBarMenus = function(menus){
		$('#overview-side-info-menus').slideUp(20,function(){
			$('#overview-side-info-menus').empty();
			for(var i in menus)
			{
				var menu = new SmallMenu(menus[i]);
				$('#overview-side-info-menus').append($(menu.getDiv()));
			}
			$('#overview-side-info-menus').find('button').bind('click',onCheckClick);
			function onCheckClick(){
				var mid = parseInt($(this).data('mid'));
				var m;
				for(var i in menus){
					if(menus[i].id == mid){
						m = menus[i];
						break;
					}
				}
				window.showAddOrderAnimation($('#small-menu-'+mid),m.name,function(){window.addOrderMenu(m);})
			}
			$('#overview-side-info-menus').css('max-height',$('#overview-side-info-head').parent().height()-$('#overview-side-info-head').find('table').height());
			$('#overview-side-info-menus').slideDown(400);
		});
	}
	
	updateLayout();
});
