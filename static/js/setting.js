$(function(){
	var menus;
	
	$('#user-leftbar a').live('click',function(e){
		var a = $(this);
		switch(a.attr('href')){
			case '#menus-edit-view':
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
			case '#boss-order-view':
				if(!window.bossOrderView){
					window.bossOrderView =new ViewOrderView($('#boss-order-item-container'),'boss');
				}
		}
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
			$('#setting-menu-imgurl').val(m_info.thumbnail);
			$('#setting-menu-form').attr('action','/api/menu/edit/'+m_info.id);
			$("#setting-menu-mtype").empty();
			$('#setting-menu-mtype').append("<option value='0'>全部");
			for(var j in window.user.restuarant.menutypes){
				var menutype = window.user.restuarant.menutypes[j];
				if(m_info.mtype == menutype.id){
					$('#setting-menu-mtype').append("<option value='"+menutype.id+"' selected='selected'>"+menutype.name);
				}else{
					$('#setting-menu-mtype').append("<option value='"+menutype.id+"'>"+menutype.name);
				}
			}
			$('#rest-settting-state').find('option').each(function(){
				var option = $(this);
				if(parseInt(option.val())==m_info.soldout){
					option.attr('selected',true);
				}
			});
			$('#rest-settting-taste').find('option').each(function(){
				var option = $(this);
				if(parseInt(option.val())==m_info.taste){
					option.attr('selected',true);
				}
			});
			$('#menus-edit-view').find('.btn-small').html('完成');
			$('#menus-edit-view').find('.btn-small').addClass('btn-primary');
			$('#setting-menus-form-container').slideDown();
			$('#settting-menus-view').slideUp();
		});
	}
	
	function createMenus(){
		menus = new Menus($('#setting-menus-container'),window.user.restuarant.menus);
		if(!window.setttingMenusFilter){
			window.setttingMenusFilter = new MenuFilter($('#setting-menus-filter'),window.user.restuarant,menus);
		}
		initEvents();
	}
	
	function updateMenus(mns){
		menus.setMenus(mns);
		initEvents();
	}
	
	window.toggleMenu = function(event){
		if($(event.currentTarget).html()=='新建菜单'){
			$('#setting-menu-form').attr('action','/api/menu/new');
			$('#setting-menu-form')[0].reset();
			$('#setting-menu-img-form')[0].reset();
			$('#setting-menu-img').attr('src','http://placehold.it/160x160');
			$('#setting-menu-mtype').empty();
			$('#setting-menu-mtype').append("<option value='0'>全部");
			for(var j in window.user.restuarant.menutypes){
				var menutype = window.user.restuarant.menutypes[j];
				$('#setting-menu-mtype').append("<option value='"+menutype.id+"'>"+menutype.name);
			}
			$('#setting-menus-form-container').slideDown();
			$('#settting-menus-view').slideUp();
			$(event.currentTarget).html('完成');
			$(event.currentTarget).addClass('btn-primary');
		}else{
			$('#setting-menus-form-container').slideUp();
			$('#settting-menus-view').slideDown();
			$(event.currentTarget).html('新建菜单');
			$(event.currentTarget).removeClass('btn-primary');
		}
	}
	
	window.menu_img_change = function(event){
		$('#setting-menu-img-modal-internet').attr('src',$("#setting-menu-img-modal-input-internet").val());
	}
	
	window.uploadMenu = function(){
		$('#setting-menu-form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				menu = data.menu
				$('#setting-menu-img-form').attr('action','/api/menu/thumbnail/'+menu.id);
				if($('#setting-menu-img-file-modal').val()){
					$('#setting-menu-img-form').ajaxForm({
						'dataType': 'json',
						'success':function(data){
							lunchAlert('操作成功');
							close_menu_form();
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
							$('#menus-edit-view').find('.btn-small').html('完成');
							$('#menus-edit-view').find('.btn-small').addClass('btn-primary');
							$('#setting-menus-form-container').slideDown();
							$('#settting-menus-view').slideUp();
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
					$('#menus-edit-view').find('.btn-small').html('完成');
					$('#menus-edit-view').find('.btn-small').addClass('btn-primary');
					$('#setting-menus-form-container').slideDown();
					$('#settting-menus-view').slideUp();
				}
			}
		});
	}
	
	window.onMenuImgChoose = function(){
		var viewFiles = document.getElementById("setting-menu-img-file-modal");
	    var viewImg = document.getElementById("setting-menu-img-modal");
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
					window.user.restuarant.avatarurl = data.imgurl;
					window.lunchAlert("店铺资料保存成功");
				}
		});
	};
});