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
	
	function drawView(){
		switch(last_hash){
		case "#overview":
			break;
		case "#restview":
			if(!restview){
				restview = new RestView($('#restview'),window.currentRest.info);
			}else{
				if(restview.getRest != window.currentRest.info){
					restview.setRest(window.currentRest.info);
				}
			}
			break;
		case "#menuview":
			break;
		case "#orderview":
			break;
		case "#userview":
			getRestuarant();
			break;
		}
	}
	
	function initLayout(){
		overviewHeight = $(window).height()-380;
		$('#map-canvas').css('height',overviewHeight);
		$('#left-bar').css('height',overviewHeight);
		$('#small-menu-container').css('max-height',overviewHeight*0.8);
	}
	
	function getRestuarant(){
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
});