var RestSideBar = function(jqueryElement,rest){
	var headDiv = "<div>"+
				"<table>" +
				"<tr><td rowspan='3'><img id='rsb-avatar'></img></td><td><span id='rsb-name'></span></td></tr>" +
				"<tr><td><span id='rsb-description'></span></td></tr>" +
				"<tr><td><span id='rsb-thanks'></span></td></tr>" +
				"</table></div><hr/>";
	this.head = $(headDiv);
	var bodyDiv = "<ul class='nav nav-tabs nav-stacked' id='rest-leftbar'>" +
			"<li data-sidebar='menus-wrapper' class='active'><a href='#restview'>菜单资料</a></li>" +
			"<li data-sidebar='rest-wrapper'><a href='#restview'>店铺资料</a></li>" +
			"</ul>"
	this.body = $(bodyDiv);
	this.setRest(rest);
	jqueryElement.append(this.head);
	jqueryElement.append(this.body);
	var lis=this.body.find('li');
	this.body.find('li').bind('click',function(e){
		var link = $(this);
		link.addClass('active').siblings().removeClass('active');
		$('#'+link.data('sidebar')).addClass('active').siblings().removeClass('active');
		switch(link.data('sidebar')){
			case 'menus-wrapper':
				if(window.restView.getRest != window.currentRest.info){
					window.restView.setRest(window.currentRest.info);
				}
				break;
			case 'rest-wrapper':
				break;
		}
		e.preventDefault();
	});
};

RestSideBar.prototype.setRest = function(rest){
	this.rest = rest;
	this.head.find('#rsb-avatar').attr('src',rest.avatarurl);
	this.head.find('#rsb-name').html(rest.name);
	this.head.find('#rsb-description').html(rest.description);
	this.head.find('#rsb-thanks').html(rest.thanks);
};

RestSideBar.prototype.edit = function(){
	
};

RestSideBar.prototype.save = function(){
	
};

var Menu = function(menu){
	this.menu = menu;
};

Menu.prototype.setMenu = function(menu){
	this.menu = menu;
};

Menu.prototype.getDiv = function(){
	var div = "<div draggable='true' class='span3 menu' data-mid='"+ this.menu.id +"'>"+
			"<div class='menu-img-container thumbnail' data-mid='"+ this.menu.id +"'><img class='menu-img' src='"+ this.menu.thumbnail +"' data-mid='"+ this.menu.id +"'></img></div>" +
			"<div><span class='rm-name'>"+ this.menu.name +"</span><span class='rm-price'>"+ this.menu.price +"</span></div>" +
			"</div>";
	return div;
};

var Menus = function(jqueryElement,menus){
	this.jqueryElement = jqueryElement;
	this.menus = menus;
	if(menus){
		this.setMenus(menus);
	}
};

Menus.prototype.setMenus = function(menus){
	this.menus = menus;
	this.jqueryElement.find('#menus').remove();
	var m;
	var mns = [];
	for(var i in menus)
	{
		m = menus[i];
		var menu = new Menu(m);
		mns.push(menu);
	}
	var div = "<div id='menus'>";
	for(i=0;i<mns.length;i++)
	{
		if(i%4 == 0){
			div += "<div class='row-fluid'>";
		}
		div += mns[i].getDiv();
		if(i%4 == 3 || i==mns.length-1){
			div += "</div>";
		}
	}
	div += "</div>";
	var div = $(div);
	this.jqueryElement.append(div);
	div.find('.menu').each(function(){
		var menu = $(this);
		this.ondragstart = function(event){
			window.lunchAlert('dragstart');
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData('mid',$(event.target).data('mid'));
			event.dataTransfer.setDragImage(event.target, 0, 0);
			return true;
		}
		this.ondragend = function(event) {
			event.dataTransfer.clearData("text");
			eleDrag = null;
			return false
		};
		this.onclick = function(){
			var mid = menu.data('mid');
			var m;
			for(var i in window.currentRest.info.menus){
				if(window.currentRest.info.menus[i].id == mid){
					m = window.currentRest.info.menus[i];
					break;
				}
			}
			window.addOrderMenu(m);
			$.updateSideBarMenu(m,'checked');
		}
	});
	div.find('.menu-img').each(function(){
		var item = $(this);
		item.load(function() {  
			var w = item.width();
			var h = item.height();
			var gap = 0;//padding + border
			var pw = item.parent().width();
			item.parent().height(pw);
			if(w>=h){
				item.width(pw);
				item.css('margin-top',(pw-item.height()-gap)/2);
			}else{
				item.height(pw);
				item.css('margin-left',(pw-item.width()-gap)/2)
			}
        }); 
	})
};

var SmallMenu = function(menu){
	this.menu = menu;
}

SmallMenu.prototype.getDiv = function(){
	var div="<div id='small-menu-"+ this.menu.id + "' data-mid='"+this.menu.id+"'>"+
			"<table width='100%'>" +
			"<tr><td rowspan='2' width='42'><div class='msb-avatar-container thumbnail'><img class='msb-avatar' src='"+ this.menu.thumbnail +"'></img></div></td><td><span id='msb-name'>"+ this.menu.name +"</span></td></tr>" +
			"<tr><td><span class='msb-price'>"+ this.menu.price +"￥</span></td><td align='right'><input type='checkbox'"+(this.menu.checked?" checked='checked'":'')+" name='msb-select' data-mid='"+this.menu.id+"'>点选</td></tr>" +
			"</table></div>";
	return div;
};

var RestView = function(jqueryElement,rest){
	this.rest = rest;
	this.siderbar = new RestSideBar(jqueryElement.find('#rsb'),this.rest);
	this.menus = new Menus(jqueryElement.find('#menus-wrapper'),rest.menus);
};

RestView.prototype.setRest = function(rest){
	this.rest = rest;
	this.siderbar.setRest(rest);
	this.menus.setMenus(rest.menus);
};

RestView.prototype.getRest = function(){
	return this.rest;
};

var ShoppingCart = function(jqueryElement){
	this.index = 0;
	this.jqueryElement = jqueryElement;
	$('#shopping-cart-wrapper').css('width',$('#shopping-cart-wrapper').width());
	this.jqueryElement.find('.menu-close-btn').live('click',this.onCloseClick);
	$('#shoppingCart-container').css('bottom',$('.navbar-fixed-bottom').height());
	$('#shoppingCart-container')[0].ondragover = function(ev) {
		ev.preventDefault();
		return true;
	};

	$('#shoppingCart-container')[0].ondragenter = function(ev) {
		window.lunchAlert('dragenter');
		this.style.color = "#ff0000";
		return true;
	};
	$('#shoppingCart-container')[0].ondrop = function(ev) {
		var mid = ev.dataTransfer.getData('mid');
		var m;
		for(var i in window.currentRest.info.menus){
			if(window.currentRest.info.menus[i].id == mid){
				m = window.currentRest.info.menus[i];
				break;
			}
		}
		window.addOrderMenu(m);
		$.updateSideBarMenu(m,'checked');
		this.style.color = "#000000";
		return false;
	};
}

ShoppingCart.prototype.addMenu = function(m){
	div = this.creatDiv(m);
	this.jqueryElement.css('width',(div.width()+10)*window.currentRest.info.orderMenus.length);
	if(window.currentRest.info.orderMenus.length<7){
		$('#shopping-cart-pre').css('cursor','default');
		$('#shopping-cart-next').css('cursor','default');
		$('#shopping-cart-pre').unbind('click',this.preview);
		$('#shopping-cart-next').unbind('click',this.nextview);
	}else{
		if(window.currentRest.info.orderMenus.length==7){
			$('#shopping-cart-pre').css('cursor','pointer');
			$('#shopping-cart-next').css('cursor','pointer');
			$('#shopping-cart-pre').bind('click',this.preview);
			$('#shopping-cart-next').bind('click',this.nextview);
		}
	}
}

ShoppingCart.prototype.removeMenu = function(m){
	var menu = this.jqueryElement.find('#shopping-cart-menu-'+m.id);
	this.jqueryElement.css('width',(menu.width()+10)*window.currentRest.info.orderMenus.length);
	menu.find('.menu-close-btn').unbind('click',this.onCloseClick);
	menu.remove();
	if(window.currentRest.info.orderMenus.length>6){
		if(window.currentRest.info.orderMenus.length==7){
			$('#shopping-cart-pre').css('cursor','pointer');
			$('#shopping-cart-next').css('cursor','pointer');
			$('#shopping-cart-pre').bind('click',this.preview);
			$('#shopping-cart-next').bind('click',this.nextview);
		}
	}else{
		$('#shopping-cart-pre').css('cursor','default');
		$('#shopping-cart-next').css('cursor','default');
		$('#shopping-cart-pre').unbind('click',this.preview);
		$('#shopping-cart-next').unbind('click',this.nextview);
	}
}

ShoppingCart.prototype.creatDiv = function(m){
	var div = "<div class='shopping-cart-menu' id='shopping-cart-menu-"+m.id+"'>" +
			"<div class='menu' data-mid='"+ m.id +"'>"+
			"<div class='menu-img-container thumbnail'><a class='close menu-close-btn'>&times</a><img class='menu-img' src='"+ m.thumbnail +"'></img></div>" +
			"<div><span class='rm-name'>"+ m.name +"</span><span class='rm-price'>"+ m.price +"</span></div>" +
			"</div>" +
			"</div>";
	div = $(div);
	this.jqueryElement.append(div);
	div.find('.menu-img-container').css('width',$('#shopping-cart-wrapper').width()/6-20)
	div.find('.menu-close-btn').css('margin-bottom',0-div.find('.menu-close-btn').height());
	div.find('.menu-close-btn').css('z-index',999);
	var item = div.find('.menu-img');
	item.load(function() {  
		var w = item.width();
		var h = item.height();
		var gap = 0;//padding + border
		var pw = item.parent().width();
		item.parent().height(pw);
		if(w>=h){
			item.width(pw);
			item.css('margin-top',(pw-item.height()-gap)/2);
		}else{
			item.height(pw);
			item.css('margin-left',(pw-item.width()-gap)/2)
		}
    }); 
	return div;
}

ShoppingCart.prototype.onCloseClick = function(){
	var closeBtn = $(this);
	var mid = parseInt(closeBtn.parent().parent().data('mid'));
	var m;
	for(var i in window.currentRest.info.menus){
		if(window.currentRest.info.menus[i].id == mid){
			m = window.currentRest.info.menus[i];
			break;
		}
	}
	window.removeOrderMenu(m);
}

ShoppingCart.prototype.setMenus = function(menus){
	this.jqueryElement.empty();
	for(var i in menus){
		this.addMenu(menus[i]);
	}
}

ShoppingCart.prototype.preview = function(){
	window.shoppingCart.index--;
	var page=Math.ceil(window.currentRest.info.orderMenus.length/6);
	if(window.shoppingCart.index>0){
		window.shoppingCart.index = 0;
	}else if(window.shoppingCart.index<1-page){
		window.shoppingCart.index = 1-page;
	}
	$('#shopping-cart').animate({left:window.shoppingCart.index*$('#shopping-cart-wrapper').width()});
}

ShoppingCart.prototype.nextview = function(){
	window.shoppingCart.index++;
	var page=Math.ceil(window.currentRest.info.orderMenus.length/6);
	if(window.shoppingCart.index>0){
		window.shoppingCart.index = 0;
	}else if(window.shoppingCart.index<1-page){
		window.shoppingCart.index = 1-page;
	}
	$('#shopping-cart').animate({left:window.shoppingCart.index*$('#shopping-cart-wrapper').width()});
}