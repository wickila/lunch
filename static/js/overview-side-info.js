$(function(){
	$.setSideBarRest = function(rest){
		$('#o-side-bar-rest-avatar').attr('src',rest.info.avatarurl)
		$('#o-side-bar-rest-name').html(rest.info.name);
		$('#o-side-bar-rest-description').html(rest.info.description);
		$('#o-side-bar-rest-thanks').html(rest.info.thanks);
	}
});