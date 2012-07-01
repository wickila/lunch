$(function(){
	var menus;
	
	$('#user-leftbar li').live('click',function(e){
		var link = $(this);
		link.addClass('active').siblings().removeClass('active');
		$('#'+link.data('sidebar')).addClass('active').siblings().removeClass('active');
		switch(link.data('sidebar')){
		case 'menus':
			if(!window.user.resturant.menus){
				$ajax({
					type: 'GET',
		            url: '/api/resturant/menus/'+window.user.restuarant.id,
		            ContentType: "application/json",
					success:function(data){
						window.user.resturant.menus = data.menus;
						if(!menus){
							menus = new Menus($('#setting-menus-container'),window.user.resturant.menus);
						}
					},
					error:function(){
						alert('加载菜单失败');
					}
				});
			}else{
				if(!menus){
					menus = new Menus($('#setting-menus-container'),window.user.resturant.menus);
				}
			}
		}
		e.preventDefault();
	});
	
	window.new_menu = function(){
		$('#setting-menus-form-container').show();
	}
	
	window.close_menu_form = function(){
		$('#setting-menus-form-container').hide();
	}
	
	window.menu_img_change = function(){
		$('#setting-menu-imgfile').disabled = $('setting-menu-imgurl').val().length > 0;
	}
	
	window.upload_menu_img = function(){
		$('#setting-menu-img-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				$("#setting-menu-img").attr('src',data.imgurl);
		}
	});
	}
	
	window.upload_avatar = function(){
		$('#avatar_form').ajaxForm({
				'success':function(data){
					data = eval(data);
					$("#avatar_img").attr('src',data.imgurl);
				}
			});
	};
	
	window.post_email = function(){
		$('#email_form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				$('#email_pwd_err').html(data.message);
				$('#email_pwd_err').show();
				if(data.result){
					$('#email_form')[0].reset();
					setTimeout(function(){$('#email_pwd_err').hide();},2000);
				}
			}
		});
	};
	
	window.post_password = function(){
		var password = $("#newpwd").val();
		var repassword = $("#repwd").val();
		var rpwd = $("#repwd")[0];
		if(repassword.length > 0)
		{
			if(password != repassword)
			{
				rpwd.setCustomValidity("密码不一致!"); 
				return;
			}else
			{
				rpwd.setCustomValidity("");
			}
		}else
		{
			rpwd.setCustomValidity("请输入此字段!");
			return;
		}
		$('#pwd_form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				data = eval(data);
				$('#pwd_form')[0].reset();
				$('#pwd_err').html(data.message);
				$('#pwd_err').show();
				if(data.result){
					setTimeout(function(){$('#pwd_err').hide();},2000);
				}
			}
		});
	};

	window.edit_rest = function(){
		$('#rest-setting-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					$('#rest-setting-form')[0].reset();
				}
			}
		});
	};
	
	window.upload_rest_avatar = function(){
		$('#rest-avatar-form').ajaxForm({
				'dataType': 'json',
				'success':function(data){
					$("#rest-avatar-img").attr('src',data.imgurl);
				}
		});
	};
});