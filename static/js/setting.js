$(function(){
	var menus;
	
	$('#user-leftbar li').live('click',function(e){
		var link = $(this);
		link.addClass('active').siblings().removeClass('active');
		$('#'+link.data('sidebar')).addClass('active').siblings().removeClass('active');
		switch(link.data('sidebar')){
			case 'menus-edit-view':
				if(!window.user.restuarant.menus){
					$.ajax({
						type: 'GET',
			            url: '/api/resturant/menus/'+window.user.restuarant.id,
			            ContentType: "application/json",
						success:function(data){
							window.user.restuarant.menus = data.menus;
							if(!menus){
								createMenus();
							}else{
								menus.setMenus(data.menus);
							}
						},
						error:function(){
							alert('加载菜单失败');
						}
					});
				}else{
					if(!menus){
						createMenus();
					}else{
						menus.setMenus(window.user.restuarant.menus);
					}
				}
			case 'boss-order-view':
				if(!window.bossOrderView){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
				}
		}
		e.preventDefault();
	});
	
	function initEvents(){
		$('#setting-menus-container').find('.menu').live('click',function(){
			var menu = $(this);
			mid = menu.data('mid');
			var m_info;
			for(var i in window.user.restuarant.menus)
			{
				if(window.user.restuarant.menus[i].id==mid){
					m_info = window.user.restuarant.menus[i];
					break;
				}
			}
			$('#setting-menu-img').attr('src',m_info.thumbnail);
			$('#setting-menu-name').val(m_info.name);
			$('#setting-menu-description').val(m_info.description);
			$('#setting-menu-price').val(m_info.price);
			$('#setting-menu-discount').val(m_info.discount);
			$('#setting-menu-mtype').val(m_info.mtype);
			$('#setting-menu-imgurl').val(m_info.thumbnail);
			$('#setting-menu-form').attr('action','/api/menu/edit/'+m_info.id);
			$('#setting-menus-form-container').show();
		});
	}
	
	function createMenus(){
		menus = new Menus($('#setting-menus-container'),window.user.restuarant.menus);
		initEvents();
	}
	
	function updateMenus(mns){
		menus.setMenus(mns);
		initEvents();
	}
	
	window.newMenu = function(){
		$('#setting-menu-form').attr('action','/api/menu/new');
		$('#setting-menu-form')[0].reset();
		$('#setting-menu-img-form')[0].reset();
		$('#setting-menu-img').attr('src','');
		$('#setting-menus-form-container').show();
	}
	
	window.close_menu_form = function(){
		$('#setting-menus-form-container').hide();
	}
	
	window.menu_img_change = function(){
		var s = $('#setting-menu-imgurl').val();
		var l = s.length;
		$('#setting-menu-imgfile')[0].disabled = l > 0;
	}
	
	window.uploadMenu = function(){
		$('#setting-menu-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				menu = data.menu
				$('#setting-menu-img-form').attr('action','/api/menu/thumbnail/'+menu.id);
				if($('#setting-menu-imgfile').val()){
					$('#setting-menu-img-form').ajaxForm({
						'dataType': 'json',
						'success':function(data){
							lunchAlert('操作成功');
							var m = data.menu;
							$('#setting-menu-form')[0].reset();
							var isOld = false;
							for(var i in window.user.restuarant.menus)
							{
								if(window.user.restuarant.menus[i].id==mid){
									window.user.restuarant.menus[i] = m;
									isOld = true;
									break;
								}
							}
							if(!isOld)window.user.restuarant.menus.push(m);
							updateMenus(window.user.restuarant.menus);
						}
					}).submit();
				}else{
					lunchAlert('操作成功');
					var m = data.menu;
					$('#setting-menu-img').attr('src',m.thumbnail);
					$('#setting-menu-form')[0].reset();
					var isOld = false;
					for(var i in window.user.restuarant.menus)
					{
						if(window.user.restuarant.menus[i].id==m.id){
							window.user.restuarant.menus[i] = m;
							isOld = true;
							break;
						}
					}
					if(!isOld)window.user.restuarant.menus.push(m);
					updateMenus(window.user.restuarant.menus);
				}
			}
		});
	}
	
	window.onMenuImgChoose = function(){
		var viewFiles = document.getElementById("setting-menu-imgfile");
	    var viewImg = document.getElementById("setting-menu-img");
		var file = viewFiles.files[0];
	    //通过file.size可以取得图片大小
        var reader = new FileReader();
        reader.onload = function( evt ){
            viewImg.src = evt.target.result;
        }
        reader.readAsDataURL(file);
	}
	
	window.upload_menu_img = function(){
		
	}
	
	window.uploadAvatar = function(){
		$('#avatar_form').ajaxForm({
				'dataType': 'json',
				'success':function(data){
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
//					$('#rest-setting-form')[0].reset();
					window.lunchAlert("店铺资料保存成功");
				}
			}
		});
	};
	
	window.onRestAvatarChange = function(){
		var viewFiles = document.getElementById("rest-avatar-form-imgfile");
	    var viewImg = document.getElementById("rest-avatar-img");
		var file = viewFiles.files[0];
	    //通过file.size可以取得图片大小
        var reader = new FileReader();
        reader.onload = function( evt ){
            viewImg.src = evt.target.result;
        }
        reader.readAsDataURL(file);
	}
	
	window.upload_rest_avatar = function(){
		$('#rest-avatar-form').ajaxForm({
				'dataType': 'json',
				'success':function(data){
					$("#rest-avatar-img").attr('src',data.imgurl);
					window.lunchAlert("店铺资料保存成功");
				}
		});
	};
});