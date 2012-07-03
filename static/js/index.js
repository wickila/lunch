$(function(){
	last_hash = location.hash==""?"#overview":location.hash;
	
	drawView();
	initLayout();
	
	window.onhashchange = function(){
		main = $('#main');
		last_section = $(last_hash);
		current_section = $(location.hash);
		gap = current_section.position().left-last_section.position().left;
		main.css('left',gap);
		$('#shoppingCart-container').animate({left:last_section.position().left-$('#shoppingCart-container').position().left},500,function(){
			$('#shoppingCart-container').animate({left:($(window).width()-$('#shoppingCart-container').width())*0.5});
		});
		last_hash = location.hash;
		main.animate({left:'0px'},500);
		drawView();
	};
	
	var overview;
	window.restView = null;;
	var menuview;
	var orderview;
	var otherview;
	window.shoppintCart = null;
	
	function drawView(){
		switch(last_hash){
			case "#overview":
				creatShoppingCart();
				break;
			case "#restview":
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
			case "#orderview":
				$('#shoppingCart-container').hide();
				break;
			case "#userview":
				$('#shoppingCart-container').hide();
				break;
		}
		function creatShoppingCart(){
			if(!window.shoppingCart){
				window.shoppingCart = new ShoppingCart($('#shopping-cart'));
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