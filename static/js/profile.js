(function ($){
	window.initialize = function(){};
	
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
	
	$(document).ready(function(){
		$("#profile-li").addClass("selected");
		$("#profile-li").click(function() {
			$("#profile-detail-div").show();
			$("#acc-security-div").hide();
			$("#navigation li").removeClass("selected");
			$("#profile-li").addClass("selected");
//			$("#navigation li").css("background-color","#fff");
//			$("#navigation li").hover(function(){
//				$(this).css("background-color","#ccf")
//			});
//			$("#profile-li").css("background-color","#eef");
		});
		$("#acc-security-li").click(function() {
			$("#profile-detail-div").hide();
			$("#acc-security-div").show();
			$("#navigation li").removeClass("selected");
			$("#acc-security-li").addClass("selected");
//			$("#navigation li").css("background-color","#fff");
//			$("#navigation li").hover(function(){
//				$(this).css("background-color","#ccf")
//			});
//			$("#acc-security-li").css("background-color","#eef");
		});
	});
})(jQuery)