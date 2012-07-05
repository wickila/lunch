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
	$("#rest-detail").find("#rest-name").html(rest.name);
	$("#rest-detail").find("#rest-username").html(rest.username);
	$("#rest-detail").find("#rest-minprice").html(rest.minprice);
	$("#rest-detail").find("#rest-description").html(rest.description);
	$('#rest-detail').find('.rest-thumbnail').attr('src',rest.avatarurl);
};

RestView.prototype.setRest = function(rest){
	this.rest = rest;
	this.siderbar.setRest(rest);
	this.menus.setMenus(rest.menus);
};

RestView.prototype.getRest = function(){
	return this.rest;
};

var ShoppingCartRest = function(rest){
	this.rest = rest;
	var head = "<li data-rid='"+ rest.id +"'><a style='cursor: pointer;'>"+ rest.name + "(<span class='shopping-cart-rest-order-menus-num'>" + getOrderMenusNum(rest.orderMenus) + "</span>)<strong class='shopping-cart-close' style='float: right;'>&times</strong></a></li>";
	var body = "<table width='100%' class='shopping-cart-menus' id='shopping-cart-menus-"+ rest.id +"'></table>";
	this.head = $(head);
	this.body = $(body);
	this.body.hide();
	this.head.find('.shopping-cart-close').bind('click',this.onClose);
	for(var i in rest.orderMenus){
		var m = rest.orderMenus[i];
		this.creatMenuElement(m);
	}
}

ShoppingCartRest.prototype.addOrderMenu = function(m){
	if(m.num>1){
		var id='#shopping-cart-menu-'+m.id;
		$(id).find('.shopping-cart-menu-num').html(m.num);
	}else{
		this.creatMenuElement(m);
	}
	this.head.find('.shopping-cart-rest-order-menus-num').html(getOrderMenusNum(this.rest.orderMenus));
}

ShoppingCartRest.prototype.creatMenuElement = function(m){
	var orderMenu = "<tr class='shopping-cart-menu' id='shopping-cart-menu-"+m.id+"' data-mid='"+ m.id +"'>" +
						"<td width='50%' class='shopping-cart-menu-name'>"+ m.name +"</td>" +
						"<td width='30%' class='shopping-cart-menu-price'>"+ m.price +"￥</td>" +
						"<td width='10%' class='shopping-cart-menu-num'>"+ m.num +"</td>" +
						"<td class='shopping-cart-menu-option'><strong class='shopping-cart-menu-reduce'>-</strong><strong class='shopping-cart-menu-plus'>+</strong><strong class='shopping-cart-menu-close'>&times</strong></td>" +
					"</tr>";
	orderMenu = $(orderMenu);
	orderMenu.find('.shopping-cart-menu-close').bind('click',this.onMenuClose);
	orderMenu.find('.shopping-cart-menu-plus').bind('click',this.onMenuPlus);
	orderMenu.find('.shopping-cart-menu-reduce').bind('click',this.onMenuReduce);
	this.body.append(orderMenu);
}

ShoppingCartRest.prototype.removeOrderMenu = function(m){
	var id='#shopping-cart-menu-'+m.id;
	if(m.num == 0){
		$(id).remove();
		$(id).find('.shopping-cart-menu-close').unbind('click',this.onMenuClose);
		$(id).find('.shopping-cart-menu-plus').unbind('click',this.onMenuPlus);
		$(id).find('.shopping-cart-menu-reduce').unbind('click',this.onMenuReduce);
	}else{
		$(id).find('.shopping-cart-menu-num').html(m.num);
	}
	this.head.find('.shopping-cart-rest-order-menus-num').html(this.getOrderMenuNum());
}

ShoppingCartRest.prototype.onClose = function(){
	var rest = window.restuarants[$(this).parent().parent().data('rid')].info;
	var menus = []
	for(var i in rest.orderMenus){
		rest.orderMenus[i].num = 1;
		menus.push(rest.orderMenus[i]);
	}
	for(var j in menus){
		window.removeOrderMenu(menus[j]);
	}
}

ShoppingCartRest.prototype.onMenuClose = function(){
	var a = $(this);
	var div = a.parent().parent();
	var mid = parseInt(div.data('mid'));
	for(var i in window.orderMenus){
		if(mid == window.orderMenus[i].id){
			window.orderMenus[i].num = 1;
			window.removeOrderMenu(window.orderMenus[i]);
			break;
		}
	}
}

ShoppingCartRest.prototype.onMenuPlus = function(){
	var a = $(this);
	var div = a.parent().parent();
	var mid = parseInt(div.data('mid'));
	for(var i in window.orderMenus){
		if(mid == window.orderMenus[i].id){
			window.addOrderMenu(window.orderMenus[i]);
			break;
		}
	}
}

ShoppingCartRest.prototype.onMenuReduce = function(){
	var a = $(this);
	var div = a.parent().parent();
	var mid = parseInt(div.data('mid'));
	for(var i in window.orderMenus){
		if(mid == window.orderMenus[i].id){
			window.removeOrderMenu(window.orderMenus[i]);
			break;
		}
	}
}

var ShoppingCart = function(jqueryElement){
	this.jqueryElement = jqueryElement;
	this.rests = [];
	$('#shoppingCart-container').css('top',$('.navbar-fixed-top').height());
	$('#shoppingCart-container').css('left',($(window).width()-$('#shoppingCart-container').width())*0.5);
	
	$('#shoppingCart-container li').live('click',function(e){
		var link = $(this);
		link.addClass('active').siblings().removeClass('active');
		$('.shopping-cart-menus').hide();
		$('#shopping-cart-menus-'+link.data('rid')).show();
	});
	
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
	var rest = null;
	for(var i in this.rests){
		if(this.rests[i].rest.id == m.rid){
			rest = this.rests[i];
			break;
		}
	}
	if(rest){
		rest.addOrderMenu(m);
	}else{
		rest = new ShoppingCartRest(window.restuarants[m.rid].info);
		if(this.rests.length == 0){
			rest.head.addClass('active');
			rest.body.show();
		}
		this.jqueryElement.append(rest.head);
		this.jqueryElement.append(rest.body);
		this.rests.push(rest);
	}
	$('#shopping-cart-settle').show();
}

ShoppingCart.prototype.removeMenu = function(m){
	var rest = null;
	for(var i in this.rests){
		if(this.rests[i].rest.id == m.rid){
			rest = this.rests[i];
			break;
		}
	}
	if(rest){
		rest.removeOrderMenu(m);
	}
	if(rest.rest.orderMenus.length == 0){
		rest.head.remove();
		rest.body.remove();
		this.rests.splice(this.rests.indexOf(rest));
	}
	if(window.orderMenus.length == 0){
		$('#shopping-cart-settle').hide();
	}
}

var Concacts = function(user){
	this.element = $("<div class='concacts-container'></div>");
	this.user = user;
	this.concacts = $("<div class='concacts-item-container'></div>");
	this.showFormBtn = $("<a id='add-concact-btn' class='btn'>添加联系方式<a>");
	this.element.append(this.concacts);
	this.element.append(this.showFormBtn);
	this.element.find('#add-concact-btn').bind('click',this.showForm);
	if(user.concacts){
		setConcacts(user.concacts);
	}else{
		$.ajax({
		      type: 'GET',
		      url: '/api/getmyconcacts',
		      ContentType: "application/json",
      		  success: function(data){
							if(data.result){
								window.user.concacts = data.concacts;
								setConcacts(data.concacts);
							}
						},
		      error: function(){alert('获取联系地址失败');}
		    });
	}
	
	function setConcacts(concacts){
		for(var i in concacts){
			var concact = concacts[i];
			var elm = $("<p><input type='radio' name='concact' value='"+concact.id+"'><span>"+concact.adress+"</span><span>"+concact.concactname+"</span><span>"+concact.phone+"</span></p>");
			if(i==0){
				elm.find('input').attr('checked',true);
			}
			$('.concacts-item-container').append(elm);
		}
	}
}

Concacts.prototype.showForm = function(){
	var element = $(this).parent();
	var form = $("<form id='concact-form' method='post' action='/api/concact/new'>" +
					"<h3>联系方式</h3>" +
					"<table>" +
					"<tr><td>联系人:</td><td><input type='text' id='concact-form-concactname' name='concactname' required></input></td></tr>" +
					"<tr><td>电话:</td><td><input type='text' id='concact-form-phone' name='phone' required></input></td></tr>" +
					"<tr><td>地址:</td><td><input type='text' id='concact-form-adress' name='adress' required></input></td></tr>" +
					"</table>" +
					"<input id='concact-form-btn' type='submit' class='btn' value='保存'></input>" +
				"</form>");
	form.find('#concact-form-btn').bind('click',function(event){
		var element1 = $(this).parent().parent();
		element1.find('form').ajaxForm({
			'dataType': 'json',
			'success':function(data){
				if(data.result){
					if(!window.user.concacts)window.user.concacts = [];
					var concact = data.concact;
					window.user.concacts.push(concact);
					var elm = $("<p><input type='radio' name='concact' value='"+concact.id+"'><span>"+concact.adress+"</span><span>"+concact.concactname+"</span><span>"+concact.phone+"</span></p>");
					element1.find('.concacts-item-container').append(elm);
					element1.find('form').hide(200,function(){
							element1.find('form').remove();
							element1.find('#add-concact-btn').show();
						});
				}
			}
		});
//		event.preventDefault();
	});
	$(this).hide();
	element.append(form);
}

Concacts.prototype.hideForm = function(){
	
}

Concacts.prototype.getConcactID = function(){
	var concactID = 0;
	this.concacts.find('input').each(function(){
		var input = $(this);
		if(input.attr('checked')){
			concactID = input.val();
		}
	})
	return concactID;
}

Concacts.prototype.dispose = function(){
	this.element.find('#add-concact-btn').unbind('click',this.showForm);
	this.element.find('form a').die('click',this.newConcact);
}

function getOrderMenusNum(menus){
	var result = 0;
	for(var i in menus){
		result += menus[i].num;
	}
	return result;
}

function getOrderMenusPrice(menus){
	var result = 0;
	for(var i in menus){
		result += menus[i].num * menus[i].price * (menus[i].discount*0.1);
	}
	return result;
}

var OrderViewItem = function(rest,index){
	this.rest = rest;
	this.element = $("<div class='order-item'></div>");
	var head = "<p>订单"+index+"</p>" +
			"<p><span>店家:"+ rest.name +"</span><span>数量:"+ getOrderMenusNum(rest.orderMenus) +"</span><span>总价:"+getOrderMenusPrice(rest.orderMenus)+"￥</span></p>";
	var body = "<table width='100%'>" +
			"<thead><th width='50%' align='left'>名称</th><th width='30%' align='left'>数量</th><th align='right'>单价</th></thead>" +
			"</table>";
	this.head = $(head);
	this.body = $(body);
	this.concacts = new Concacts(window.user);
	this.message = $("<hr></hr><textarea id='order-message' rows='4'></textarea>");
	this.btn = $("<a class='btn' data-rid='"+this.rest.id+"' style='float:right'>确认订单</a>");
	this.element.append(this.head);
	this.element.append(this.body);
	this.element.append(this.concacts.element);
	this.element.append(this.message);
	this.element.append(this.btn);
	this.btn.bind('click',this.ensureOrder);
	for(var i in rest.orderMenus){
		var menu = "<tr><td width='50%'>"+rest.orderMenus[i].name+"</td><td width='30%'>"+rest.orderMenus[i].num+"</td><td align='right'>"+rest.orderMenus[i].price+"￥</td></tr>";
		this.body.append($(menu));
	}
}

OrderViewItem.prototype.postOrder = function(){
	var concact = this.concacts.getConcactID();
	var rid = this.rest.id;
	var m = this.element.find('#order-message');
    var message = this.element.find('#order-message').val();
    var items = [];
    for(var i in this.rest.orderMenus){
    	items.push({
    		'id':this.rest.orderMenus[i].id,
    		'num':this.rest.orderMenus[i].num
    	});
    }
    var price = getOrderMenusPrice(this.rest.orderMenus);
    $.ajax({
	      type: 'POST',
	      url: '/api/order/new',
	      ContentType: "application/json",
	      data:{
    				'concact':concact,
    				'rid':rid,
    				'message':message,
    				'menus':JSON.stringify(items),
    				'price':price
    			},
		  success: function(data){
						if(data.result){
							window.lunchAlert('提交订单成功')
						}else{
							alert(data.message)
						}
					},
	      error: function(){alert('提交订单失败');}
	    });
}

OrderViewItem.prototype.ensureOrder = function(){
	window.orderView.postOrder(parseInt($(this).data('rid')));
}

OrderViewItem.prototype.dispose = function(){
	this.btn.unbind('click',this.ensureOrder);
	this.rest = null;
	this.element.remove();
}

var OrderView = function(jqueryElement){
	this.element = jqueryElement;
	this.orderItems = [];
}

OrderView.prototype.setMenus = function(menus){
	for(var o in this.orderItems){
		this.orderItems[o].dispose();
	}
	this.element.empty();
	if(menus.length>0){
		var rests = [];
		for(var i in menus){
			var rest = window.restuarants[menus[i].rid].info;
			if(rest && rests.indexOf(rest)==-1){
				rests.push(rest);
			}
		}
		for(var j in rests){
			var orderItem = new OrderViewItem(rest,parseInt(j)+1);
			this.orderItems.push(orderItem);
			this.element.append(orderItem.element);
		}
	}else{
		this.element.html("您还没有点选任何食物哦");
	}
}

OrderView.prototype.postOrder = function(rid){
	for(var i in this.orderItems){
		if(this.orderItems[i].rest.id == rid){
			this.orderItems[i].postOrder();
			return;
		}
	}
}