(function ($){
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
})(jQuery)
