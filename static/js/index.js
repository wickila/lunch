$(function(){
	window.changePage = function(page){
		if(window.page == page)return;
		window.page = page;
		window.hideShoppingCart();
		$('#main').css('transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-webkit-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-moz-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-o-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-ms-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		window.updateView();
	}
	
	var overview;
	window.restView = null;;
	var menuview;
	window.orderView = null;;
	var otherview;
	window.shoppintCart = null;
	
	window.updateView = function(){
		if(window.viewOrderView)window.viewOrderView.dispose();
		window.viewOrderView = null;
		if(window.bossOrderView)window.bossOrderView.dispose();
		window.bossOrderView = null;
		switch(window.page){
			case 1:
				creatShoppingCart();
				break;
			case 2:
				if(!window.restView){
					window.restView = new RestView($('#restview'),window.currentRest.info);
				}else{
					if($('#menus-wrapper').hasClass('active')){
						window.restView.setRest(window.currentRest.info);
					}
				}
				creatShoppingCart();
				break;
			case "#menuview":
				creatShoppingCart();
				break;
			case 3:
				if(!window.user){
					$('#order-container').empty();
					$('#order-container').append($("<p>您还没有登录，请先<a data-toggle='modal' data-target='#signup'>注册</a>或<a data-toggle='modal' data-target='#login'>登录</a></p>"));
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
				if(!window.user){
					
				}else{
					if(window.user.restuarant){
						$("rest-setting-name").val(window.user.restuarant.name);
						$("rest-setting-type").val(window.user.restuarant.rtype);
						$("rest-setting-adress").val(window.user.restuarant.adress);
						$("rest-setting-minprice").val(window.user.restuarant.minprice);
						$("rest-setting-phone").val(window.user.restuarant.phone);
						$("rest-setting-description").val(window.user.restuarant.description);
					}
				}
				if(!window.bossOrderView){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
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
		overviewHeight = $(window).height()-400;
		$('#map-canvas').css('height',overviewHeight);
		$('#left-bar').css('height',overviewHeight);
		$('#small-menu-container').css('max-height',overviewHeight*0.8);
		$('#shoppingCart-container').css('left',($(window).width()-$('#shoppingCart-container').width())*0.5);
	}
	window.page = 1;
	initLayout();
	window.hideShoppingCart();
	window.updateView();
});