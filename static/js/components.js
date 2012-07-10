var RestSideBar = function(jqueryElement,rest){
	var headDiv = "<div>"+
				"<table>" +
				"<tr><td rowspan='3'><img id='rsb-avatar' class='thumbnail small-avatar'></img></td><td><span id='rsb-name'></span></td></tr>" +
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

var Menus = function(jqueryElement,menus,eventEnable){
	this.eventEnable = eventEnable;
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
	if(this.eventEnable){
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
	}
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
	this.menus = new Menus(jqueryElement.find('#menus-wrapper'),rest.menus,true);
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
	this.head.find('.shopping-cart-rest-order-menus-num').html(getOrderMenusNum(this.rest.orderMenus));
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
		this.rests.splice(this.rests.indexOf(rest),1);
	}
	if(window.orderMenus.length == 0){
		$('#shopping-cart-settle').hide();
	}
}

var Concacts = function(user,rid){
	this.element = $("<div class='concacts-container'></div>");
	this.user = user;
	var concactsItemContainer = this.concacts = $("<div class='concacts-item-container' data-rid='"+rid+"'></div>");
	this.showFormBtn = $("<a id='add-concact-btn' class='btn'>添加联系方式<a>");
	this.element.append(this.concacts);
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
			var elm = $("<p class='concact-item' style='display:none'><input class='concact-item-input' type='radio' name='concact-"+rid+"' value='"+JSON.stringify(concact)+"'><span>"+concact.adress+"</span><span>"+concact.concactname+"收</span><span>电话:"+concact.phone+"</span></p>");
			elm.append($("<span style='float:right;display:none' class='icon-remove concact-item-remove'></span>" +
						"<span style='float:right;display:none;' class='icon-plus concact-item-plus'></span>" +
						"<span style='float:right;display:none;' class='icon-minus concact-item-minus'></span>" +
						"<span style='float:right;display:none;' class='icon-list concact-item-list'></span>"));
			concactsItemContainer.append(elm);
			if(i==0){
				elm.find('input').attr('checked',true);
				elm.find('.icon-plus').show();
				elm.find('.icon-list').show();
				elm.show();
			}
		}
		if(concacts.length == 0){
			var elm = $("<p class='concact-item' id='blank-concact-item'><a class='concact-item-plus'>您还没有任何联系方式，请点击添加联系方式</a></p>");
			elm.append($("<span style='float:right' class='icon-plus concact-item-plus'></span>"));
			concactsItemContainer.append(elm);
		}
	}
}

function initEvents(){
	$('.concact-item-plus').live('click',function(){
		var element = $(this).parent().parent();
		var form = $("<form id='concact-form' method='post' action='/api/concact/new'>" +
						"<h3>添加联系方式</h3>" +
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
						$('.concacts-item-container').each(function(){
							var element2 = $(this); 
							var elm = $("<p class='concact-item' style='display:none'><input type='radio' class='concact-item-input' name='concact-"+element2.data('rid')+"' value='"+JSON.stringify(concact)+"'><span>"+concact.adress+"</span><span>"+concact.concactname+"收</span><span>电话:"+concact.phone+"</span></p>");
							elm.append($("<span style='float:right;display:none' class='icon-remove concact-item-remove'></span>" +
										"<span style='float:right;display:none;' class='icon-plus concact-item-plus'></span>" +
										"<span style='float:right;display:none;' class='icon-minus concact-item-minus'></span>" +
										"<span style='float:right;display:none;' class='icon-list concact-item-list'></span>"));
							element2.find('#blank-concact-item').remove();
							var elements = [];
							element2.find('.concact-item').each(function(){
								var item = $(this);
								elements.push(item);
								item.find('.icon-plus').hide();
								item.find('.icon-list').hide();
								item.find('.icon-remove').hide();
								item.find('.icon-minus').hide();
								item.hide();
								item.attr('checked',false);
							});
							element2.append(elm);
							for(var i in elements){
								element2.append(elements[i]);
							}
							elm.find('input').attr('checked',true);
							elm.find('.icon-plus').show();
							elm.find('.icon-list').show();
							elm.show();
							element2.find('form').hide(200,function(){
									element2.find('form').remove();
							});
						});
					}
				}
			});
		});
		$(this).hide();
		$(this).parent().find('.icon-minus').hide();
		$(this).parent().find('.icon-list').show();
		$(this).parent().find('.icon-remove').show();
		var ccts = $(this).parent().parent();
		ccts.find('.concact-item').each(function(){
			var item = $(this);
			var checked = item.find('input').attr('checked');
			if(checked){
				item.show();
			}else{
				item.hide();
			}
		});
		element.append(form);
	});
	
	$('.concact-item-list').live('click',function(){
		var ccts = $(this).parent().parent();
		ccts.find('.concact-item').show();
		$(this).parent().parent().find('form').remove();
		$(this).parent().find('.icon-remove').hide();
		$(this).parent().find('.icon-plus').show();
		$(this).hide();
		$(this).parent().find('.icon-minus').show();
	});
	
	$('.concact-item-minus').live('click',function(){
		var ccts = $(this).parent().parent();
		ccts.find('.concact-item').each(function(){
			var item = $(this);
			var checked = item.find('input').attr('checked');
			if(checked){
				item.show();
			}else{
				item.hide();
			}
		})
		$(this).hide();
		$(this).parent().find('.icon-list').show();
	});
	$('.concact-item-remove').live('click',function(){
		$(this).parent().parent().find('form').remove();
		$(this).hide();
		$(this).parent().find('.icon-plus').show();
	});
	$('.concact-item-input').live('click',function(){
		var ccts = $(this).parent().parent();
		var elements = [];
		ccts.find('.concact-item').each(function(){
			var item = $(this);
			var checked = item.find('input').attr('checked');
			if(checked){
				elements.unshift(item);
				item.show();
				item.find('.icon-plus').show();
				item.find('.icon-list').show();
			}else{
				elements.push(item);
				item.hide();
				item.find('.icon-plus').hide();
				item.find('.icon-list').hide();
				item.find('.icon-remove').hide();
				item.find('.icon-minus').hide();
			}
		})
		for(var i in elements){
			ccts.append(elements[i]);
		}
	});
}

Concacts.prototype.getConcact = function(){
	var concact = '';
	this.concacts.find('input').each(function(){
		var input = $(this);
		if(input.attr('checked')){
			concact = input.val();
		}
	})
	return concact;
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

var NewOrderItem = function(rest,index){
	this.rest = rest;
	this.element = $("<div class='order-item'></div>");
	var head = "<h3>订单"+index+"</h3>" +
			"<p class='order-item-head'><span>店家:"+ rest.name +"</span><span>数量:"+ getOrderMenusNum(rest.orderMenus) +"</span><span>总价:"+getOrderMenusPrice(rest.orderMenus)+"￥</span></p><hr/>";
	var body = "<table width='100%'>" +
			"<thead><th width='50%' align='left'>名称</th><th width='30%' align='left'>数量</th><th align='right'>单价</th></thead>" +
			"</table>";
	this.head = $(head);
	this.body = $(body);
	this.concacts = new Concacts(window.user,rest.id);
	this.message = $("<p>附加留言</p><textarea id='order-message' rows='4'></textarea>");
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

NewOrderItem.prototype.postOrder = function(){
	var concact = this.concacts.getConcact();
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
	    					window.orderView.removeRest(data.rid);
	    					if(!window.user.orders)window.user.orders = [];
	    					window.user.orders.push(data.order);
	    					window.lunchAlert('提交订单成功');
	    				}else{
	    					alert(data.message)
	    				}
	    		    },
	      error: function(){alert('提交订单失败');}
	    });
}

NewOrderItem.prototype.ensureOrder = function(){
	window.orderView.postOrder(parseInt($(this).data('rid')));
}

NewOrderItem.prototype.dispose = function(){
	this.btn.unbind('click',this.ensureOrder);
	this.rest = null;
	this.element.remove();
}

var OrderView = function(jqueryElement){
	this.element = jqueryElement;
	this.orderItems = [];
	initEvents();
}

OrderView.prototype.setMenus = function(menus){
	for(var o in this.orderItems){
		this.orderItems[o].dispose();
	}
	this.orderItems = [];
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
			var orderItem = new NewOrderItem(rests[j],parseInt(j)+1);
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

OrderView.prototype.removeRest = function(rid){
	var orderItem = null;
	for(var i in this.orderItems){
		if(this.orderItems[i].rest.id == rid){
			orderItem = this.orderItems[i];
			this.orderItems.splice(i,1);
			break;
		}
	}
	if(orderItem){
		var mns = orderItem.rest.orderMenus.concat();
		for(var j in mns){
			mns[j].num = 1;
			window.removeOrderMenu(mns[j]);
		}
		orderItem.element.animate({'height':30},500,function(){
			orderItem.element.hide(200,function(){
				orderItem.dispose();
			});
		});
	}
}

/**
 * 查看订单条目
 */
var ViewOrderItem = function(type){
	this.type = type;
	this.interval = 5000;
	this.element = $("<div class='view-order-item'>" +
						"<p><span class='view-order-item-restname'></span><span class='view-order-item-id'></span><span class='view-order-item-createdtime'></span></p>" +
						"<table width='100%'>" +
							"<tr><td width='90%' class='view-order-item-username'></td><td colspan='3'><div class='view-order-item-btncontainer'><a class='btn btn-mini btn-primary order-cancel-btn'>取消</a><button class='btn btn-mini order-option-btn'>待确认</button></div></td></tr>" +
							"<tr><td><span class='view-order-item-num'></span><span class='view-order-item-price'></span></td></tr>" +
							"<tr><td><span class='view-order-item-concact-adress'></span><span class='view-order-item-concact-name'></span><span class='view-order-item-concact-phone'></span></td></tr>" +
						"</table>" +
					"</div>");
}

ViewOrderItem.prototype.setOrder = function(order){
	this.order = order;
	this.element.attr('id','view-order-item-'+order.id);
	this.element.attr('data-id',order.id);
	this.element.find('.view-order-item-restname').html(order.restname);
	this.element.find('.view-order-item-id').html(order.id);
	this.element.find('.view-order-item-createdtime').html(order.createdtime);
	this.element.find('.view-order-item-username').html(order.username);
	this.element.find('.view-order-item-num').html(order.menunum+"份");
	this.element.find('.view-order-item-price').html(order.price+"￥");
	this.element.find('.view-order-item-concact-adress').html(order.concact.adress);
	this.element.find('.view-order-item-concact-name').html(order.concact.concactname+"收");
	this.element.find('.view-order-item-concact-phone').html("电话:"+order.concact.phone);
	this.updateView();
	if(this.type == 'user' && this.order.state != -1 && this.order.state != 3){
		this.update(this);
	}
	this.element.find('.order-option-btn').click($.proxy(this.onButtonClick,this));
	this.element.find('.order-cancel-btn').click($.proxy(function(){
		$('#cancelOrderModal').modal('show');
		window.cancelOrder = $.proxy(function(){
			var cancelreason = $('#roder-cancel-form-reason').val();
			if(!cancelreason){
				alert('不能无理由取消订单');
				return;
			}
			$.ajax({
			      type: 'POST',
			      url: '/api/order/edit/'+this.order.id,
			      ContentType: "application/json",
			      data:{
		    				'state':-1,
		    				'cancelreason':cancelreason
		    			},
		    	  scope:this,
				  success: function(data){
			    				if(data.result){
			    					this.scope.order = data.order;
			    					this.scope.updateView();
			    				}else{
			    					window.lunchAlert(data.message)
			    				}
			    				$('#cancelOrderModal').modal('hide');
			    		    },
			      error: function(){alert('修改取消失败');}
			    });
		},this);
	},this));
}

ViewOrderItem.prototype.onButtonClick = function(){
		if(this.element.find('.order-option-btn').hasClass('disabled'))return;
		var option = 1;
		switch(this.element.find('.order-option-btn').html()){
			case '确认':
				option = 1;
				break;
			case '发货':
				option = 2;
				break;
			case '确认收货':
				option = 3;
				break;
		}
		$.ajax({
		      type: 'POST',
		      url: '/api/order/edit/'+this.order.id,
		      ContentType: "application/json",
		      data:{
	    				'state':option
	    			},
	    	  scope:this,
			  success: function(data){
		    				if(data.result){
		    					this.scope.order = data.order;
		    					this.scope.updateView();
		    				}else{
		    					window.lunchAlert(data.message)
		    				}
		    		    },
		      error: function(){alert('修改订单失败');}
		    });
	}

ViewOrderItem.prototype.updateView = function(){
	this.element.find('.order-cancel-btn').hide();
	if(this.type == 'user'){
		if(this.order.state == -1){
			this.element.find('.order-option-btn').html('已取消').addClass('disabled').removeClass('btn-primary');
		}else if(this.order.state == 0){
			this.element.find('.order-option-btn').html('待确认').addClass('disabled').removeClass('btn-primary');
		}else if(this.order.state == 1){
			this.element.find('.order-option-btn').html('已确认').addClass('disabled').removeClass('btn-primary');
		}else if(this.order.state == 2){
			this.element.find('.order-option-btn').html('确认收货').removeClass('disabled').addClass('btn-primary');
		}else{
			this.element.find('.order-option-btn').html('已结算').addClass('disabled').removeClass('btn-primary');
		}
	}else{
		if(this.order.state == -1){
			this.element.find('.order-option-btn').html('已取消');
			this.element.find('.order-option-btn').addClass('disabled').removeClass('btn-primary');
		}else if(this.order.state == 0){
			this.element.find('.order-cancel-btn').show();
			this.element.find('.order-option-btn').html('确认');
			this.element.find('.order-option-btn').addClass('btn-primary').removeClass('disabled');
		}else if(this.order.state == 1){
			this.element.find('.order-option-btn').html('发货');
			this.element.find('.order-option-btn').addClass('btn-primary').removeClass('disabled');
		}else if(this.order.state == 2){
			this.element.find('.order-option-btn').html('已发货');
			this.element.find('.order-option-btn').addClass('disabled').removeClass('btn-primary');
		}else{
			this.element.find('.order-option-btn').html('已结算');
			this.element.find('.order-option-btn').addClass('disabled').removeClass('btn-primary');
		}
	}
}

ViewOrderItem.prototype.update = function(scope){
	$.ajax({
	      type: 'GET',
	      url: '/api/order/get/'+scope.order.id,
	      ContentType: "application/json",
    	  scope:scope,
		  success: function(data){
	    				if(data.result){
	    					this.scope.order = data.order;
	    					this.scope.updateView();
	    					if(!this.scope.disposed && this.scope.order.state != -1 && this.scope.order.state != 3){
	    						setTimeout(this.scope.update,this.scope.interval,this.scope);
	    					}
	    				}else{
	    					window.lunchAlert(data.message)
	    				}
	    		    },
	      error: function(){alert('修改订单失败');}
	    });
}

ViewOrderItem.prototype.dispose = function(){
	this.element.remove();
	this.disposed = true;
}

/**
 * 查看订单视图
 */
var ViewOrderView = function(element,type){
	this.items = [];
	this.element = element;
	this.controller = $("<hr/><table width='100%'>" +
										"<tr><td align='left'><button class='btn pre-page'>上一页</button></td><td><span class='page'>1</span>/<span class='total-page'>1</span></td><td align='right'><button class='btn next-page'>下一页</button></td></tr>" +
								"</table>");
	this.element.parent().append(this.controller);
	this.type = type;
	this.page = 1;
	this.totalPage = 1;
	this.setPage(this.page);
	this.controller.find('.pre-page').click($.proxy(function(){
		if(this.page<=1){
			this.page==1;
			return;
		}
		this.page --;
		this.setPage(this.page);
	},this));
	this.controller.find('.next-page').click($.proxy(function(){
		if(this.page>=this.totalPage){
			this.page = this.totalPage;
			return;
		}
		this.page ++;
		this.setPage(this.page);
	},this));
}

ViewOrderView.prototype.setPage = function(page){
	 $.ajax({
	      type: 'GET',
	      url: '/api/order/view/'+this.type,
	      ContentType: "application/json",
	      data:{
    				'page':page
    			},
    	  scope:this,
		  success: function(data){
	    				if(data.result){
	    					this.scope.element.empty();
	    					for(var j in this.scope.items){
	    						var item = this.scope.items[j];
	    						item.dispose();
	    					}
	    					for(var i in data.orders){
	    						var order = data.orders[i];
	    						order.concact = JSON.parse(order.concact);
	    						order.menus = JSON.parse(order.menus);
	    						order.menunum = 0;
	    						for(var j in order.menus){
	    							order.menunum += order.menus[j].num;
	    						}
	    						var orderItem = new ViewOrderItem(this.scope.type);
	    						this.scope.element.append(orderItem.element);
	    						orderItem.setOrder(order);
	    						this.scope.items.push(orderItem);
	    					}
    						this.scope.totalPage = Math.ceil(data.total/10);
    						this.scope.controller.find('.total-page').html(this.scope.totalPage);
    						this.scope.controller.find('.page').html(this.scope.page);
	    				}else{
	    					window.lunchAlert(data.message)
	    				}
	    		    },
	      error: function(){alert('获取订单失败');}
	    });
}

ViewOrderView.prototype.dispose = function(){
	for(var j in this.items){
		var item = this.items[j];
		item.dispose();
	}
	this.element.empty();
	this.controller.remove();
}