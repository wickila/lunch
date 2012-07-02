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
		last_hash = location.hash;
		main.animate({left:'0px'});
		drawView();
	};
	
	var overview;
	var restview;
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
				if(!restview){
					restview = new RestView($('#restview'),window.currentRest.info);
				}else{
					if(restview.getRest != window.currentRest.info){
						restview.setRest(window.currentRest.info);
					}
				}
				creatShoppingCart();
				break;
			case "#menuview":
				creatShoppingCart();
				break;
			case "#orderview":
				break;
			case "#userview":
				break;
		}
		function creatShoppingCart(){
			if(!window.shoppintCart){
				window.shoppingCart = new ShoppingCart($('#shoppingCart'));
			}
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