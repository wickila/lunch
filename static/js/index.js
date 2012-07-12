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
					window.restView = new RestView($('#restview'),window.currentRest);
				}else{
					window.restView.setRest(window.currentRest);
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
						$("#rest-setting-name").val(window.user.restuarant.name);
//						$("#rest-setting-type").val(window.user.restuarant.rtype);
						$("#rest-setting-addres").val(window.user.restuarant.adress);
						$("#rest-setting-minprice").val(window.user.restuarant.minprice);
						$("#rest-setting-phone").val(window.user.restuarant.telephone);
						$("#rest-setting-des").val(window.user.restuarant.description);
						$('#rest-avatar-img').attr('src',window.user.restuarant.avatarurl);
					}
				}
				if(!window.bossOrderView){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
				}
				if(!window.menutypeSetting){
					window.menutypeSetting = new MenuTypeSetting();
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
		$('#main-info-container').css('height',$('.content').height()-$('#map-canvas').height()-40)
		$('.menu').css('height','200px')
		$('#shoppingCart-container').css('left',($(window).width()-$('#shoppingCart-container').width())*0.5);
	}
	window.page = 1;
	initLayout();
	window.hideShoppingCart();
	window.updateView();
});