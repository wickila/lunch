/**
 * 此文件主要包含一些不重要的事件响应函数
 * */
$(function(){
	window.search = function(type){
		if(!$('.search-query').val()){
			lunchAlert('请输入搜索关键字');
			return;
		}
		if(type == 'adress'){
			var address = $('.search-query').val();
		    window.geocoder.geocode( { 'address': address}, function(results, status) {
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
	
	/**
	 * 申请开通店铺权限
	 * */
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
	window.postIndexMessage = function(){
		$('#index-message-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					$('#index-message-form').hide();
					lunchAlert('恭喜您，留言发送成功！');
				}
			},
			'error':function(){
					alert('由于服务器繁忙，提交申请失败，请稍后再试');
				}
		});
	}
	/**
	 * 定位到我的当前位置
	 * */
	window.relocal = function(){
		changePage(1);
		window.map.panTo(window.initialLocation);
	}
	/**
	 * 注册时检查密码输入是否一致
	 * */
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
});