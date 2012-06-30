$(function(){
	$('#user-leftbar li').live('click',function(e){
		var link = $(this);
		link.addClass('active').siblings().removeClass('active');
		$('#'+link.data('sidebar')).addClass('active').siblings().removeClass('active');
		e.preventDefault();
	});
	
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

	window.post_email = function(){
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