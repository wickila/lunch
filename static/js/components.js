var RestSideBar = function(jqueryElement,rest){
	var headDiv = "<div>"+
				"<table>" +
				"<tr><td rowspan='3'><img id='rsb-avatar'></img></td><td><span id='rsb-name'></span></td></tr>" +
				"<tr><td><span id='rsb-description'></span></td></tr>" +
				"<tr><td><span id='rsb-thanks'></span></td></tr>" +
				"</table></div>";
	this.head = $(headDiv);
	this.setRest(rest);
	jqueryElement.append(this.head);
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
	var div = "<div class='span3 menu' data-mid='"+ this.menu.id +"'>"+
			"<div class='menu-img-container thumbnail'><img class='menu-img' src='"+ this.menu.thumbnail +"'></img></div>" +
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
	this.jqueryElement.append($(div));
};

var SmallMenu = function(menu){
	this.menu = menu;
}

SmallMenu.prototype.getDiv = function(){
	var div="<div id='small-menu-"+ this.menu.id + "' data-mid='"+this.menu.id+"'>"+
			"<table width='100%'>" +
			"<tr><td rowspan='2' width='42'><div class='msb-avatar-container thumbnail'><img class='msb-avatar' src='"+ this.menu.thumbnail +"'></img></div></td><td><span id='msb-name'>"+ this.menu.name +"</span></td></tr>" +
			"<tr><td><span class='msb-price'>"+ this.menu.price +"￥</span></td><td align='right'><input type='checkbox' name='msb-select'>点选</td></tr>" +
			"</table></div>";
	return div;
};

var RestView = function(jqueryElement,rest){
	this.rest = rest;
	this.siderbar = new RestSideBar(jqueryElement.find('#rsb'),this.rest);
	this.menus = new Menus(jqueryElement.find('#rsm'),rest.menus);
};

RestView.prototype.setRest = function(rest){
	this.rest = rest;
	this.siderbar.setRest(rest);
	this.menus.setMenus(rest.menus);
};

RestView.prototype.getRest = function(){
	return this.rest;
};