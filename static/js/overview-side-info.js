$(function(){
	$.setSideBarRest = function(rest){
		$('#o-side-bar-rest-avatar').attr('src',rest.info.avatarurl)
		$('#o-side-bar-rest-name').html(rest.info.name);
		$('#o-side-bar-rest-description').html(rest.info.description);
		$('#o-side-bar-rest-thanks').html(rest.info.thanks);
	}
	
	$.setSideBarMenus = function(menus){
		$('#small-menu-container').find('input').unbind('click',onCheckClick);
		$('#small-menu-container').empty();
		
		for(var i in menus)
		{
			var menu = new SmallMenu(menus[i]);
			$('#small-menu-container').append($(menu.getDiv()));
		}
		$('#small-menu-container').find('input').bind('click',onCheckClick);
		function onCheckClick(){
			var input = $(this);
			var mid = parseInt(input.data('mid'));
			var m;
			for(var i in menus){
				if(menus[i].id == mid){
					m = menus[i];
					break;
				}
			}
			m.checked = input.attr('checked');
			if(input.attr('checked')){
				window.addOrderMenu(m);
			}else{
				window.removeOrderMenu(m);
			}
		}
	}
});