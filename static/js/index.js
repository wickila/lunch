$(function(){
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
				$('title').html('Lunch-首页');
				break;
			case 2:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#navbar-fixed-top-rest').addClass('active');
				$('title').html('Lunch-'+window.currentRest.name);
				break;
			case 3:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#bottom-nav-orderview').addClass('bottom-nav-orderview-active');
				$('#navbar-fixed-top-order').addClass('active');
				$('title').html('Lunch-订单页面');
				break;
			case 4:
				$('#bottom-nav-overview').addClass('bottom-nav-overview-active');
				$('#bottom-nav-restview').addClass('bottom-nav-restview-active');
				$('#bottom-nav-orderview').addClass('bottom-nav-orderview-active');
				$('#bottom-nav-user').addClass('bottom-nav-user-active');
				$('#navbar-fixed-top-user').addClass('active');
				$('title').html('Lunch-管理页面');
				break;
		}
		window.page = page;
		window.hideShoppingCart();
		$('#main').css('transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-webkit-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-moz-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-o-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-ms-transform','translate('+ (1-page) +'00%, 0px)');
		window.updateView();
	}
	
	window.gotoCharge = function(rideOrder){
		window.rideOrder=rideOrder;
		$('#orderview-left-ensure-order').click();
		changePage(3);
	}
	window.date = new Date();
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
			$('#main').css('transform','translate('+ x +'%, 0px)');
			$('#main').css('-webkit-transform','translate('+ x +'%, 0px)');
			$('#main').css('-moz-transform','translate('+ x +'%, 0px)');
			$('#main').css('-o-transform','translate('+ x +'%, 0px)');
			$('#main').css('-ms-transform','translate('+ x +'%, 0px)');
			x = (evt.clientX - window.orignClientX)/$(window).width()*100;
			if(Math.abs(x)>60||window.maxSpeed>1){
				window.changePage(window.page-(x/Math.abs(x)));
				window.isDragging = false;
			}
			evt.preventDefault();
		}
	});
	$('#main').bind('mouseup',function(evt){
		window.isDragging = false;
		$('#main').css('transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-webkit-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-moz-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-o-transform','translate('+ (1-page) +'00%, 0px)');
		$('#main').css('-ms-transform','translate('+ (1-page) +'00%, 0px)');
//		evt.preventDefault();
	})
	
	
	var overview;
	window.restView = null;;
	var menuview;
	window.orderView = null;;
	var otherview;
	window.shoppintCart = null;
	
	window.updateView = function(){
		if(window.viewOrderView)window.viewOrderView.dispose();
		window.viewOrderView = null;
		if(!window.bossOrderView){
			if(window.user && window.user.restuarant){
				window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
			}
		}
		switch(window.page){
			case 1:
				creatShoppingCart();
				break;
			case 2:
				if(!window.restView){
					window.restView = new RestView($('#restview'),window.currentRest);
				}else{
					window.restView.setRest(window.currentRest);
				}
				creatShoppingCart();
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
					if(window.user.restuarant){
						$("#rest-setting-name").val(window.user.restuarant.name);
						$('#rest-setting-rtype').empty();
						for(var i in window.REST_TYPES){
							var rtype = window.REST_TYPES[i];
							if(window.user.restuarant.rtype == parseInt(i)){
								$('#rest-setting-rtype').append("<option value='"+i+"' selected='selected'>"+rtype);
							}else{
								$('#rest-setting-rtype').append("<option value='"+i+"'>"+rtype);
							}
						}
						$("#rest-setting-addres").val(window.user.restuarant.adress);
						$("#rest-setting-minprice").val(window.user.restuarant.minprice);
						$("#rest-setting-phone").val(window.user.restuarant.telephone);
						$("#rest-setting-des").val(window.user.restuarant.description);
						$('#rest-avatar-img').attr('src',window.user.restuarant.avatarurl);
						$('#rest-maxdistance').val(window.user.restuarant.maxdistance);
						$('#rest-starttime').val(window.user.restuarant.starttime);
						$('#rest-endtime').val(window.user.restuarant.endtime);
					}
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
		function creatShoppingCart(){
			if(!window.shoppingCart){
				window.shoppingCart = new ShoppingCart($('#shoppingCart-container ul'));
			}
			$('#shoppingCart-container').show();
		}
	}
	
	function initLayout(){
		$('.content').css('height',$(window).height()-$('.navbar-fixed-top').height()-$('.navbar-fixed-bottom').height()-40);
		$('.content').css('margin-top',$('.navbar-fixed-top').height());
		overviewHeight = $('.content').height()*0.7;
		$('#map-canvas').parent().parent().parent().css('height',overviewHeight);
//		$('#left-bar').css('height',overviewHeight);
		$('#main-info-container').css('height',$('.content').height()-$('#map-canvas').height())
		$('.menu').css('height','200px')
		$('#shoppingCart-container').css('left',($(window).width()-$('#shoppingCart-container').width())*0.5);
		$('#site-nav-container').css('bottom',$('.navbar-fixed-bottom').height()-$('#site-nav-container').height());
		$('#site-nav-container').css('left',($(window).width()-$('#site-nav-container').width())*0.5);
		$('#view-order-item-container,#boss-order-item-container').css('height',$('.content').height()-$('.navbar-fixed-top').height()-80);
	}
//	window.changePage(1);
	initLayout();
	$('.tooltip-enable').tooltip({
	      selector: "a[rel=tooltip]"
	    });
	$('.tooltip-enable-bottom').tooltip({
	      selector: "a[rel=tooltip]",
	      placement: "bottom"
	    });
	window.hideShoppingCart();
	
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
		  																		"<a href='#' class='thumbnail'><img src='"+window.thumbnails[i].src+"' alt='"+window.thumbnails[i].name+"'></a>"+
		  																		"<h5>"+window.thumbnails[i].name+"</h5>"+
		  																		"</li>"));
		  						}
		  						$('#select-thumbnail-modal').css('width',190*3+30+10)
		  						$('#thumb-lib .thumbnail').bind('click',function(){
		  							$('#thumb-lib .thumbnail').removeClass('select')
		  							$(this).addClass('select');
//		  							$('#setting-menu-imgurl').val($(this).attr('src'));
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
});