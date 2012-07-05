$(function(){
	window.page = 1;
	updateView();
	initLayout();
	
	window.onhashchange = function(){
//		main = $('#main');
//		last_section = $(last_hash);
//		current_section = $(location.hash);
//		gap = current_section.position().left-last_section.position().left;
//		main.css('left',gap);
//		$('#shoppingCart-container').animate({left:last_section.position().left-$('#shoppingCart-container').position().left},500,function(){
//			$('#shoppingCart-container').animate({left:($(window).width()-$('#shoppingCart-container').width())*0.5});
//		});
//		last_hash = location.hash;
//		main.animate({left:'0px'},500);
//		drawView();
	};
	
	window.changePage = function(page){
		if(window.page == page)return;
		window.page = page;
		window.hideShoppingCart();
		$('#main').css('transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-webkit-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-moz-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-o-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		$('#main').css('-ms-transform','translate3d('+ (1-page) +'00%, 0px, 0px)');
		updateView();
	}
	
	window.hideShoppingCart();
	
	var overview;
	window.restView = null;;
	var menuview;
	window.orderView = null;;
	var otherview;
	window.shoppintCart = null;
	
	function updateView(){
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
				if(!window.orderView){
					window.orderView = new OrderView($('#order-container'));
				}
				window.orderView.setMenus(window.orderMenus);
				break;
			case 4:
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
});