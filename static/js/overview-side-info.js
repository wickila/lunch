$(function(){
	$.setSideBarRest = function(rest){
		$('#o-side-bar-rest-avatar').attr('src',rest.avatarurl)
		$('#o-side-bar-rest-name').html(rest.name);
		$('#o-side-bar-rest-description').html(rest.description);
		$('#o-side-bar-rest-thanks').html(rest.thanks);
	}
	
	$.setSideBarMenus = function(menus){
		$('#overview-side-info-menus').find('input').unbind('click',onCheckClick);
		$('#overview-side-info-menus').empty();
		
		for(var i in menus)
		{
			var menu = new SmallMenu(menus[i]);
			$('#overview-side-info-menus').append($(menu.getDiv()));
		}
		$('#overview-side-info-menus').find('button').bind('click',onCheckClick);
		function onCheckClick(){
			var mid = parseInt($(this).data('mid'));
			var m;
			for(var i in menus){
				if(menus[i].id == mid){
					m = menus[i];
					break;
				}
			}
			window.addOrderMenu(m);
		}
		$('#overview-side-info-menus').css('max-height',$('#overview-side-info-head').parent().height()-$('#overview-side-info-head').find('table').height());
	}
});