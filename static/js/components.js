var RestSideBar = function(jqueryElement){
	var headDiv = "<div class='radius-border' style='padding: 10px;margin:0 0 10px 0;'>"+
				"<table width='100%'>" +
				"<tr><td rowspan='3'><img id='rsb-avatar' class='small-avatar' style='padding: 0 10px 0 0;'></img></td><td><h4 id='rsb-name'></h4></td><td align='right' style='font-size: 10pt;'><span class='icon-heart'></span>谢谢:<span style='font-size: 11pt' id='rsb-thanks'></span></td></tr>" +
				"<tr><td colspan='2'><span id='rsb-description' style='font-size: 10pt;color: gray;'></span></td></tr>" +
				"</table></div>";
	this.head = $(headDiv);
	var bodyDiv ="<ul class='nav nav-tabs nav-stacked'>" +
			"<li class='active'><a id='rest-left-menus-view' href='#rest-menus-view' data-toggle='tab'>菜单资料</a></li>" +
			"<li><a href='#rest-wrapper' data-toggle='tab'>店铺资料</a></li>" +
			"</ul>";
	this.body = $(bodyDiv);
	jqueryElement.append(this.head);
	jqueryElement.append(this.body);
	var lis=this.body.find('li');
	this.body.find('li').bind('click',function(e){
		var link = $(this);
		switch(link.find('a').attr('href')){
			case '#rest-menus-view':
				if(window.restView.getRest != window.currentRest){
					window.restView.setRest(window.currentRest);
				}
				break;
			case '#rest-wrapper':
				break;
		}
	});
};

RestSideBar.prototype.setRest = function(rest){
	this.rest = rest;
	this.head.find('#rsb-avatar').attr('src',rest.avatarurl);
	this.head.find('#rsb-name').html(rest.name);
	this.head.find('#rsb-description').html(rest.description);
	this.head.find('#rsb-thanks').html(rest.thanks);
};

var Menu = function(menu,index){
	this.index = index;
	this.menu = menu;
};

Menu.prototype.setMenu = function(menu,index){
	this.menu = menu;
};

Menu.prototype.getDiv = function(){
	if(!this.div){
		this.div = $("<li class='span3' data-mid='"+ this.menu.id +"'>" +
							"<div class='thumbnail menu' data-mid='"+ this.menu.id +"'>" +
							"<img class='menu-img lazy' src='/static/img/ajax-loader.gif' data-original='"+this.menu.thumbnail+"' alt='"+this.menu.name+"' data-mid='"+ this.menu.id +"'>" +
							"</div>" +
							"<table width='96%' data-mid='"+ this.menu.id +"'><tr><td width='100%' style='padding-top: 6px;'><h5>"+this.menu.name+"</h5></td><td align='right' style='padding-top: 6px;'>"+this.menu.price+"￥</td><td align='right'><span class='label label-info'>"+this.menu.discount+"折</span></td></tr><table>" +
					"</li>");
	}
	if(this.index%4==0){
		this.div.css('margin-left',0);
	}
	if(this.menu.discount >= 10){
		this.div.find('.label').parent().remove();
	}
	this.div.find(".lazy").lazyload({
		effect : "fadeIn"
	});
	return this.div;
};

var Menus = function(jqueryElement,menus,eventEnable){
	this.eventEnable = eventEnable;
	this.jqueryElement = jqueryElement;
	this.jqueryElement.append($("<ul class='thumbnails menus'></ul>"));
	this.menus = menus;
	if(menus){
		this.setMenus(menus);
	}
};

Menus.prototype.setMenus = function(menus){
	this.menus = menus;
	this.jqueryElement.find('.menus').empty();
	var m;
	this.mns = [];
	for(var i in menus)
	{
		m = menus[i];
		var menu = new Menu(m,i);
		this.mns.push(menu);
		this.jqueryElement.find('.menus').append(menu.getDiv());
	}
	if(this.eventEnable){
		this.jqueryElement.find('.menus').find('.menu').each(function(){
			var menu = $(this);
			this.ondragstart = function(event){
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
				for(var i in window.currentRest.menus){
					if(window.currentRest.menus[i].id == mid){
						m = window.currentRest.menus[i];
						break;
					}
				}
				window.showAddOrderAnimation($(this),m.name,function(){window.addOrderMenu(m);})
			}
		});
	}
};

Menus.prototype.filter = function(filters){
	for(var i in this.mns){
		var menu = this.mns[i];
		var canshow = true;
		for(var f in filters){
			var filter = filters[f];
			if(menu.menu[f] != filter){
				canshow = false;
				menu.getDiv().fadeOut();
				break;
			}
		}
		if(canshow){
			menu.getDiv().fadeIn('slow');
		}else{
			menu.getDiv().fadeOut('slow');
		}
	}
}

var MenuFilter = function(element,rest,menus){
	this.rest = rest;
	this.element = element;
	this.menus = menus;
	this.tastefilter = $("<tr class='menus-filter-item' id='menus-filter-taste'><td width='7%'>口味:</td><td><a class='select'>全部</a><a data-filter-key='taste' data-filter-value='1'>辣</a><a data-filter-key='taste' data-filter-value='0'>不辣</a></td></tr>");
	this.typefilter = $("<tr class='menus-filter-item' id='menus-filter-type'><td width='7%'>类别:</td><td class='menus-filter-select-container'><a class='select'>全部</a></td></tr>");
	this.element.append(this.tastefilter);
	this.element.append(this.typefilter);
	var types = "";
	for(var i in rest.menutypes){
		menutype = rest.menutypes[i];
		types += "<a data-filter-key='mtype' data-filter-value='"+menutype.id+"'>"+menutype.name+"</a>";
	}
	this.typefilter.find('.menus-filter-select-container').append($(types));
	this.element.find('a').click($.proxy(function(event){
			var filter = {};
			$(event.currentTarget).parent().find('a').removeClass('select');
			$(event.currentTarget).addClass('select');
			this.menus.filter(this.getFilter());
	},this));
}

MenuFilter.prototype.getFilter = function(){
	var filter = {};
	this.element.find('a').each(function(){
		var a = $(this);
		if(a.hasClass('select')&&a.html()!='全部'){
			filter[a.data('filter-key')] = a.data('filter-value');
		}
	});
	return filter;
}

MenuFilter.prototype.dispose = function(){
	this.element.empty();
}

var SmallMenu = function(menu){
	this.menu = menu;
}

SmallMenu.prototype.getDiv = function(){
	var div="<div id='small-menu-"+ this.menu.id + "' data-mid='"+this.menu.id+"'>"+
			"<table class='msb-item' width='100%'>" +
			"<tr><td valign='middle' rowspan='2' width='42'><img class='msb-avatar lazy' src='/static/img/ajax-loader.gif' data-original='"+ this.menu.thumbnail +"'></img></td><td><span id='msb-name'>"+ this.menu.name +"</span></td></tr>" +
			"<tr><td><span class='msb-price'>"+ this.menu.price +"￥</span></td><td align='right'><button style='margin-right:4px' class='btn btn-mini btn-success' data-mid='"+this.menu.id+"'>点选</td></tr>" +
			"</table></div>";
	return div;
};

var RestView = function(jqueryElement,rest){
	this.jqueryElement = jqueryElement;
	this.siderbar = new RestSideBar(jqueryElement.find('#rsb'));
	this.menus = new Menus(jqueryElement.find('#menus-wrapper'),null,true);
	this.setRest(rest);
};

RestView.prototype.setRest = function(rest){
	if(this.rest == rest)return;
	this.rest = rest;
	this.siderbar.setRest(rest);
	this.menus.setMenus(rest.menus);
	if(this.menusfilter)this.menusfilter.dispose();
	this.menusfilter = new MenuFilter(this.jqueryElement.find('#menus-filter'),rest,this.menus);
	$('#rest-menus-head').html(rest.name+'家的所有美味');
	$('.rest-comment-title').html(rest.name+'家的所有评论')
	$("#rest-detail").find("#rest-name").html(rest.name);
	$("#rest-detail").find("#rest-username").html(rest.username);
	$("#rest-detail").find("#rest-createdtime").html(rest.created_time.split(' ')[0]);
	$("#rest-detail").find("#rest-telephone").html(rest.telephone);
	$("#rest-detail").find("#rest-minprice").html(rest.minprice);
	$("#rest-detail").find("#rest-maxdistance").html(rest.maxdistance);
	$("#rest-detail").find("#rest-starttime").html(rest.starttime);
	$("#rest-detail").find("#rest-endtime").html(rest.endtime);
	$("#rest-detail").find("#rest-ensurespeed").html(Math.ceil(rest.totalensuretime/rest.totalensure/60));
	$("#rest-detail").find("#rest-deliveryspeed").html(Math.ceil(rest.totaldeliverytime/rest.totaldelivery/60));
	$("#rest-minprice").parent().attr('data-original-title','起送金额:'+rest.minprice+'￥');
	$("#rest-maxdistance").parent().attr('data-original-title','配送范围:'+rest.maxdistance+'米');
	$("#rest-starttime").parent().attr('data-original-title','送餐时间:'+rest.starttime+'至'+rest.endtime);
	$("#rest-detail").find("#rest-deliveryspeed").parent().attr('data-original-title','发货速度:'+$("#rest-detail").find("#rest-deliveryspeed").html()+'分钟');
	$("#rest-detail").find("#rest-ensurespeed").parent().attr('data-original-title','订单确认速度:'+$("#rest-detail").find("#rest-ensurespeed").html()+'分钟');
	$("#rest-detail").find("#rest-username").parent().attr('data-original-title','店主:'+rest.username);
	$("#rest-detail").find("#rest-createdtime").parent().attr('data-original-title','创建时间:'+rest.created_time.split(' ')[0]);
	$("#rest-detail").find("#rest-telephone").parent().attr('data-original-title','电话:'+rest.telephone);
	$("#rest-detail").find("#rest-description").html(rest.description);
	$('#rest-detail').find('.rest-thumbnail').attr('src',rest.avatarurl);
	this.getComments(1);
};

RestView.prototype.getComments = function(page){
	if(page==1)$('#comments_container').empty();
	$.ajax({
	      type: 'GET',
	      url: '/api/restuarant/comments/'+this.rest.id,
	      scope:this,
	      ContentType: "application/json",
	      data:{
				page:1
			},
		  success: function(data){
						if(data.result){
							for(var i in data.comments){
								comment = $(this.scope.createComment(data.comments[i]));
								$('#comments_container').append(comment);
								comment.show(500);
							}
						}
					},
	      error: function(){alert('获取评论失败');}
	    });
}

RestView.prototype.createComment = function(data){
	return "<div class='comment'><table style='width:100%'><tr><td rowspan='2' valign='top' style='width:35px'><img class='avatar' src='"+data.avatarurl+"'></img></td><td align='left'><p class='comment_content'>"+data.content+"</p></td></tr><tr><td align='right'><div style='float:right;margin:-10px 0px 0 0'>by <strong>"+data.username+"</strong><span class='comment-time'>@"+data.createdtime+"</span></div></td></tr></table></div>";
}

RestView.prototype.getRest = function(){
	return this.rest;
};

var ShoppingCartRest = function(rest){
	this.rest = rest;
	this.element = $('<div class="accordion-group">'+
					    '<div class="accordion-heading">'+
					      '<div class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" data-target="#collapse'+this.rest.id+'"></div>'+
					    '</div>'+
					    '<div id="collapse'+this.rest.id+'" class="accordion-body collapse" style="height: 0px; ">'+
					      '<div class="accordion-inner">'+
					      '</div>'+
					    '</div>'+
				    '</div>')
	var head = "<div data-rid='"+this.rest.id+"'>"+rest.name + "(<span class='shopping-cart-rest-order-menus-num'>" + getOrderMenusNum(rest.orderMenus) + "</span>份)<i class='shopping-cart-close icon-remove-sign' style='float: right;'></i><button class='btn btn-primary btn-mini'>取消</button><button class='btn btn-danger btn-mini'>删除"+rest.name+"家的所有订餐</button></div>";
	var body = "<table width='99%' class='shopping-cart-menus' id='shopping-cart-menus-"+ rest.id +"'></table>";
	this.head = $(head);
	this.body = $(body);
	this.head.find('.btn').css('height',20);
	this.element.find('.accordion-toggle').append(this.head);
	this.element.find('.accordion-inner').append(this.body);
	this.head.find('.shopping-cart-close').click($.proxy(function(event){
		this.head.find('.shopping-cart-close').hide(100);
		this.head.find('.btn').css('width','');
		setTimeout($.proxy(function(){
			this.head.find('.btn').show();
		},this),100)
		event.stopImmediatePropagation();
	},this));
	this.head.find('.btn-danger').bind('click',this.onClose);
	this.head.find('.btn-primary').bind('click',$.proxy(function(event){
		this.head.find('.shopping-cart-close').show(100);
		event.stopImmediatePropagation();
		this.head.find('.btn').css('width',0);
		setTimeout($.proxy(function(){
			this.head.find('.btn').hide();
		},this),30)
	},this));
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
	if(m.soldout<=0){
		this.head.css('color','red');
	}
	this.head.find('.shopping-cart-rest-order-menus-num').html(getOrderMenusNum(this.rest.orderMenus));
}

ShoppingCartRest.prototype.creatMenuElement = function(m){
	var orderMenu = "<tr class='shopping-cart-menu' id='shopping-cart-menu-"+m.id+"' data-mid='"+ m.id +"'>" +
						"<td width='50%' class='shopping-cart-menu-name'>"+ m.name + (m.soldout<1?'(已卖完)':'') +"</td>" +
						"<td width='30%' class='shopping-cart-menu-price'>"+ m.price +"￥</td>" +
						"<td width='10%'><span class='shopping-cart-menu-num'>"+ m.num +"</span>份</td>" +
						"<td class='shopping-cart-menu-option'><strong class='close shopping-cart-menu-close'>&times</strong><strong class='close shopping-cart-menu-plus'>+</strong><strong class='close shopping-cart-menu-reduce'>-</strong></td>" +
					"</tr>";
	orderMenu = $(orderMenu);
	if(m.soldout<=0){
		orderMenu.css('color','red');
	}
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
	this.head.css('color','');
	for(var i in this.rest.orderMenus){
		if(this.rest.orderMenus[i].soldout<=0){
			this.head.css('color','red');
		}
	}
	this.head.find('.shopping-cart-rest-order-menus-num').html(getOrderMenusNum(this.rest.orderMenus));
}

ShoppingCartRest.prototype.onClose = function(event){
	event.stopImmediatePropagation();
	var rest = window.restuarants[$(this).parent().data('rid')].info;
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
//	$('#shoppingCart-container li').live('click',function(e){
//		var link = $(this);
//		link.addClass('active').siblings().removeClass('active');
//		$('.shopping-cart-menus').hide();
//		$('#shopping-cart-menus-'+link.data('rid')).show();
//	});
	
	$('#shoppingCart-container')[0].ondragover = function(ev) {
		ev.preventDefault();
		return true;
	};

	$('#shoppingCart-container')[0].ondragenter = function(ev) {
		this.style.color = "#ff0000";
		return true;
	};
	$('#shoppingCart-container')[0].ondrop = function(ev) {
		var mid = ev.dataTransfer.getData('mid');
		var m;
		for(var i in window.currentRest.menus){
			if(window.currentRest.menus[i].id == mid){
				m = window.currentRest.menus[i];
				break;
			}
		}
		window.addOrderMenu(m);
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
		this.jqueryElement.append(rest.element);
		this.rests.push(rest);
	}
	$('#shopping-cart-settle').show();
	$('#shopping-cart-ride').show();
	$('#shoppingCart-container-empty-tip').hide();
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
		rest.element.remove();
		this.rests.splice(this.rests.indexOf(rest),1);
	}
	if(window.orderMenus.length == 0){
		$('#shopping-cart-settle').hide();
		$('#shopping-cart-ride').hide();
		$('#shoppingCart-container-empty-tip').show();
	}
}

var Concacts = function(user,rid){
	this.element = $("<div class='concacts-container'></div>");
	this.user = user;
	var concactsItemContainer = this.concacts = $("<div class='concacts-item-container' data-rid='"+rid+"'></div>");
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
			elm.append($("<div class='btn-group' style='float:right;margin-top: -5px;'>" +
						"<a style='display:none;' class='btn concact-item-list concact-left-btn'><i class='icon-list'></i></a>" +
						"<a style='display:none;' class='btn concact-item-minus concact-left-btn'><i class='icon-minus'></i></a>" +
						"<a style='display:none;' class='btn concact-item-remove concact-right-btn'><i class='icon-remove'></i></a>" +
						"<a style='display:none;' class='btn concact-item-plus concact-right-btn'><i class='icon-plus'></i></a></div>"));
			concactsItemContainer.append(elm);
			if(i==0){
				elm.find('input').attr('checked',true);
				elm.find('.concact-item-plus').show();
				elm.find('.concact-item-list').show();
				elm.show();
			}
		}
		if(concacts.length == 0){
			var elm = $("<p class='concact-item' id='blank-concact-item'><span><a class='concact-item-plus'>您还没有任何联系方式，请点击添加联系方式</a></span></p>");
			elm.append($("<div class='btn-group' style='float:right;margin-top: -5px;'><a class='btn concact-item-plus'><i class='icon-plus'></i></a><div>"));
			concactsItemContainer.append(elm);
		}
	}
}

function initEvents(){
	$('.concact-item-plus').live('click',function(){
		var element = $(this).parent().parent().parent();
		var form = element.find('form');
		if(!form.get(0)){
			form = $("<form id='concact-form' method='post' action='/api/concact/new'>" +
							"<h4>添加联系方式</h4>" +
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
					'scope':element1,
					'dataType': 'json',
					'success':function(data){
						if(data.result){
							if(!window.user.concacts)window.user.concacts = [];
							var concact = data.concact;
							window.user.concacts.push(concact);
							var element2 = this.scope; 
							var elm = $("<p class='concact-item' style='display:none'><input type='radio' class='concact-item-input' name='concact-"+element2.data('rid')+"' value='"+JSON.stringify(concact)+"'><span>"+concact.adress+"</span><span>"+concact.concactname+"收</span><span>电话:"+concact.phone+"</span></p>");
							elm.append($("<div class='btn-group' style='float:right;margin-top: -5px;'>" +
									"<a style='display:none;' class='btn concact-item-list concact-left-btn'><i class='icon-list'></i></a>" +
									"<a style='display:none;' class='btn concact-item-minus concact-left-btn'><i class='icon-minus'></i></a>" +
									"<a style='display:none;' class='btn concact-item-remove concact-right-btn'><i class='icon-remove'></i></a>" +
									"<a style='display:none;' class='btn concact-item-plus concact-right-btn'><i class='icon-plus'></i></a></div>"));
							element2.find('#blank-concact-item').remove();
							var elements = [];
							element2.find('.concact-item').each(function(){
								var item = $(this);
								elements.push(item);
								item.find('.concact-item-plus').hide();
								item.find('.concact-item-list').hide();
								item.find('.concact-item-remove').hide();
								item.find('.concact-item-minus').hide();
								item.hide();
								item.attr('checked',false);
							});
							element2.append(elm);
							for(var i in elements){
								element2.append(elements[i]);
							}
							elm.find('input').attr('checked',true);
							elm.find('.concact-item-plus').show();
							elm.find('.concact-item-list').show();
							elm.show();
							element2.find('form').hide(200,function(){
									element2.find('form').remove();
							});
						}
					}
				});
			});
			form.hide();
			element.append(form);
		}
		$(this).hide();
		$(this).parent().find('.concact-item-minus').hide();
		$(this).parent().find('.concact-item-list').show();
		$(this).parent().find('.concact-item-remove').show();
		var ccts = $(this).parent().parent().parent();
		ccts.find('.concact-item').each(function(){
			var item = $(this);
			var checked = item.find('input').attr('checked');
			if(checked){
				item.show();
			}else{
				item.slideUp();
			}
		});
		form.slideDown();
	});
	
	$('.concact-item-list').live('click',function(){
		var ccts = $(this).parent().parent().parent();
		ccts.find('.concact-item').slideDown();
		ccts.parent().find('form').slideUp();
		$(this).parent().find('.concact-item-remove').hide();
		$(this).parent().find('.concact-item-plus').show();
		$(this).hide();
		$(this).parent().find('.concact-item-minus').show();
	});
	
	$('.concact-item-minus').live('click',function(){
		var ccts = $(this).parent().parent().parent();
		ccts.find('.concact-item').each(function(){
			var item = $(this);
			var checked = item.find('input').attr('checked');
			if(checked){
				item.slideDown();
			}else{
				item.slideUp();
			}
		})
		$(this).hide();
		$(this).parent().find('.concact-item-list').show();
	});
	$('.concact-item-remove').live('click',function(){
		$(this).parent().parent().parent().find('form').slideUp();
		$(this).hide();
		$(this).parent().find('.concact-item-plus').show();
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
				item.find('.concact-item-plus').show();
				item.find('.concact-item-list').show();
			}else{
				elements.push(item);
				item.slideUp();
				item.find('.concact-item-plus').hide();
				item.find('.concact-item-list').hide();
				item.find('.concact-item-remove').hide();
				item.find('.concact-item-minus').hide();
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
	return Math.round(result*100)/100;
}

var NewOrderItem = function(rest,index){
	this.rest = rest;
	this.element = $("<div class='order-item radius-border'></div>");
	var head = "<h3>订单"+index+"</h3>" +
			"<p class='order-item-head'><span>店家:"+ rest.name +"</span><span>数量:"+ getOrderMenusNum(rest.orderMenus) +"</span><span "+(getOrderMenusPrice(rest.orderMenus)>=rest.minprice?"":"style='color:red'")+">总价:"+getOrderMenusPrice(rest.orderMenus)+"￥"+(getOrderMenusPrice(rest.orderMenus)>=rest.minprice?"":"(未达到起送价格)")+"</span></p>";
	var body = "<table width='100%'>" +
			"<thead><th width='50%' align='left'>名称</th><th width='30%' align='left'>数量</th><th align='right'>单价</th><th align='right'>折扣</th></thead>" +
			"</table>";
	this.head = $(head);
	this.body = $(body);
	this.concacts = new Concacts(window.user,rest.id);
	this.message = $("<p style='padding-top: 6px;'>附加留言</p><textarea id='order-message' rows='4'></textarea>");
	this.btn = $("<a class='btn' data-rid='"+this.rest.id+"' style='float:right'>确认订单</a>");
	this.cancelBtn = $("<a class='btn' style='float:right;margin-right: 10px;'>再挑挑看</a>");
	this.rideBtn = $("<p style='float:right;margin-top: 8px;'><a class='btn' data-rid='"+this.rest.id+"' style='margin: -8px 30px 0 0;'>搭顺风车</a><span class='add-on'>@</span><input type='text' name='name'></input><p>");
	this.element.append(this.head);
	this.element.append(this.body);
	this.element.append(this.concacts.element);
	this.element.append(this.message);
	if(window.rideOrder){
		this.element.append(this.rideBtn);
	}else{
		this.element.append(this.btn);
	}
	this.element.append(this.cancelBtn);
	this.btn.bind('click',this.ensureOrder);
	this.cancelBtn.bind('click',function(){
		changePage(2);
		$('#rest-left-menus-view').click();
	});
	for(var i in rest.orderMenus){
		var menu = "<tr "+ (rest.orderMenus[i].soldout<1?"style='color:red'":"") +"><td width='50%'>"+rest.orderMenus[i].name+((rest.orderMenus[i].soldout<1?"(已卖完)":""))+"</td><td width='30%'>"+rest.orderMenus[i].num+"</td><td align='right'>"+rest.orderMenus[i].price+"￥</td><td align='right'>"+(rest.orderMenus[i].discount<10?(""+rest.orderMenus[i].discount+"折"):"")+"</td></tr>";
		this.body.append($(menu));
	}
}

NewOrderItem.prototype.postOrder = function(){
	var concact = this.concacts.getConcact();
	if(!concact){
		alert('请填写联系方式!');
		return;
	}
	var msg = ''
	for(var i in this.rest.orderMenus){
		if(this.rest.orderMenus[i].soldout<1){
			msg+=(this.rest.orderMenus[i].name+',');
		}
	}
	if(msg){
		alert(msg.slice(0,msg.length-1)+'卖完啦，换换别的口味？');
		return;
	}
	if(getOrderMenusPrice(this.rest.orderMenus)<this.rest.minprice){
		alert('未达到起送价格哦，再多一点美味吧');
		return;
	}
	var rid = this.rest.id;
	var m = this.element.find('#order-message');
    var message = this.element.find('#order-message').val();
    var items = [];
    for(var i in this.rest.orderMenus){
    	items.push({
    		'id':this.rest.orderMenus[i].id,
    		'name':this.rest.orderMenus[i].name,
    		'price':this.rest.orderMenus[i].price,
    		'discount':this.rest.orderMenus[i].discount,
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
//	    					if(!window.user.orders)window.user.orders = [];
//	    					window.user.orders.push(data.order);
	    					window.viewOrderView.setPage(window.viewOrderView);
	    					window.lunchTip('提交订单成功');
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
	for(var o=0;o<this.orderItems.length;o++){
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
				$('#orderview-left-buyer').click();
			});
		});
	}
}

/**
 * 查看订单条目
 */
var ViewOrderItem = function(type,expanded){
	this.type = type;
	this.expanded  = expanded;
	this.interval = 5000;
	this.element = $("<div class='view-order-item'>" +
						"<p><span class='view-order-item-restname'></span>订单编号:<span class='view-order-item-id'></span>下单时间:<span class='view-order-item-createdtime'></span></p>" +
						"<table width='100%'>" +
							"<tr><td class='view-order-item-username'></td></tr>" +
							"<tr><td>详细信息:<span class='view-order-item-num'></span><span class='view-order-item-price'></span></td><td align='right'><span id='show-order-detail-btn' class='icon-list'></span></td></tr>" +
							"<tr id='order-detail-info' style='display:none'><td colspan='3'><table width='100%' class='order-detail-info-table'></table></td></tr>" +
							"<tr><td>联系方式:<span class='view-order-item-concact-adress'></span><span class='view-order-item-concact-name'></span><span class='view-order-item-concact-phone'></span></td></tr>" +
							"<tr><td></td><td aligin='right' class='tooltip-enable'><a rel='tooltip' class='btn btn-mini btn-primary order-cancel-btn'>取消</a><a rel='tooltip' class='btn btn-mini order-option-btn'>待确认</a></td></tr>" +
						"</table>" +
					"</div>");
	this.element.find('#show-order-detail-btn').click($.proxy(function(){
		if(this.element.find('#show-order-detail-btn').hasClass('icon-list')){
			this.showDetail();
		}else{
			this.hideDetail();
		}
	},this));
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
			    					data.order.concact = JSON.parse(data.order.concact);
			    					data.order.menus = JSON.parse(data.order.menus);
			    					this.scope.updateView();
			    				}else{
			    					window.lunchTip(data.message)
			    				}
			    				$('#cancelOrderModal').modal('hide');
			    		    },
			      error: function(){alert('修改取消失败');}
			    });
		},this);
	},this));
}

ViewOrderItem.prototype.showDetail = function(){
	this.expanded = true;
	this.element.find('#show-order-detail-btn').removeClass('icon-list').addClass('icon-minus');
	this.element.find('#order-detail-info').find('table').empty();
	this.element.find('#order-detail-info').find('table').append("<tr><td>名称</td><td>数量</td><td>单价</td><td>折扣</td><td>实价</td></tr>")
	for(var i in this.order.menus){
		var menu = this.order.menus[i];
		var e = "<tr><td>"+menu.name+"</td><td>"+menu.num+"</td><td>"+menu.price+"￥</td><td>"+menu.discount+"</td><td>"+menu.num*menu.price*menu.discount*0.1+"￥</td></tr>";
		this.element.find('#order-detail-info').find('table').append($(e));
	}
	this.element.find('#order-detail-info').show();
}

ViewOrderItem.prototype.hideDetail = function(){
	this.expanded = false;
	this.element.find('#order-detail-info').hide();
	this.element.find('#show-order-detail-btn').removeClass('icon-minus').addClass('icon-list');
}

ViewOrderItem.prototype.setOrder = function(order){
	this.order = order;
	this.element.attr('id','view-order-item-'+order.id);
	this.element.attr('data-id',order.id);
	if(this.type == 'user'){
		this.element.find('.view-order-item-restname').show();
		this.element.find('.view-order-item-restname').html(order.restname);
	}else{
		this.element.find('.view-order-item-restname').hide();
	}
	this.element.find('.view-order-item-id').html(order.id);
	this.element.find('.view-order-item-createdtime').html(order.createdtime);
	this.element.find('.view-order-item-username').html(order.username);
	this.element.find('.view-order-item-num').html(order.menunum+"份");
	this.element.find('.view-order-item-price').html(order.price+"￥");
	this.element.find('.view-order-item-concact-adress').html(order.concact.adress);
	this.element.find('.view-order-item-concact-name').html(order.concact.concactname+"收");
	this.element.find('.view-order-item-concact-phone').html("电话:"+order.concact.phone);
	this.updateView();
	if(this.type == 'user' && this.order.state != -1 && this.order.state != 3 && this.order.state != 4){
		this.update(this);
	}
	if(this.expanded){
		this.showDetail();
	}else{
		this.hideDetail();
	}
	this.updateTip();
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
			case '评论':
				option = 4;
				$('#commentOrderModal').modal('show');
				$('#order-comment-btn').removeClass('disabled');
				$('#order-commment-orderid').val(this.order.id);
				$('#order-comment-thanks').attr('max',Math.ceil(this.order.price/10));
				$('#order-comment-thanks').val(Math.ceil(this.order.price/10));
				window.currentComentOrder = this;
				return;
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
		    					data.order.concact = JSON.parse(data.order.concact);
		    					data.order.menus = JSON.parse(data.order.menus);
		    					this.scope.updateView();
		    				}else{
		    					window.lunchTip(data.message)
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
		}else if(this.order.state == 3){
			this.element.find('.order-option-btn').html('评论').addClass('btn-primary').removeClass('disabled');
		}else{
			this.element.find('.order-option-btn').html('已评论').addClass('disabled').removeClass('btn-primary');
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
		}else if(this.order.state == 3){
			this.element.find('.order-option-btn').html('已结算');
			this.element.find('.order-option-btn').addClass('disabled').removeClass('btn-primary');
		}else{
			this.element.find('.order-option-btn').html('已评论');
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
	    					data.order.concact = JSON.parse(data.order.concact);
	    					data.order.menus = JSON.parse(data.order.menus);
	    					this.scope.updateView();
	    					this.scope.updateTip();
	    					if(!this.scope.disposed && this.scope.order.state != -1 && this.scope.order.state != 3){
	    						setTimeout(this.scope.update,this.scope.interval,this.scope);
	    					}
	    				}else{
	    					window.lunchTip(data.message)
	    				}
	    		    },
	      error: function(){alert('刷新订单失败');}
	    });
}

ViewOrderItem.prototype.updateTip = function(){
	var tip='';
	switch(this.element.find('.order-option-btn').html()){
		case '待确认':
			tip = '等待餐厅确认订单中，请稍后';
			break;
		case '已确认':
			tip = '餐厅已于'+window.getTimeStr(new Date(this.order.modifiedtime))+'确认订单,美味正在制作中';
			break;
		case '发货':
			tip = '';
			break;
		case '确认收货':
			tip = '餐厅已于'+window.getTimeStr(new Date(this.order.modifiedtime))+'送出美食,请保持手机畅通';
			break;
		case '已结算':
			tip = '顾客已于'+window.getTimeStr(new Date(this.order.modifiedtime))+'确认收到美食';
			break;
	}
	if(tip){
		this.element.tooltip({
		      selector: "a[rel=tooltip]"
		    });
	}
	this.element.find('.order-option-btn').attr('data-original-title',tip);
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
	this.disposed = false;
	this.element = element;
	this.controller = $("<hr/><table width='100%'>" +
										"<tr><td width='35%' align='left'><button class='btn pre-page'>上一页</button></td><td width='30%' align='center'><span class='page'>1</span>/<span class='total-page'>1</span></td><td width='35%' align='right'><button class='btn next-page'>下一页</button></td></tr>" +
								"</table>");
	this.element.parent().append(this.controller);
	this.type = type;
	this.page = 1;
	this.totalPage = 1;
	this.currentOffset = 0;
	this.setPage(this);
	this.controller.find('.pre-page').click($.proxy(function(){
		if(this.page<=1){
			this.page==1;
			return;
		}
		this.page --;
		this.setPage(this);
	},this));
	this.controller.find('.next-page').click($.proxy(function(){
		if(this.page>=this.totalPage){
			this.page = this.totalPage;
			return;
		}
		this.page ++;
		this.setPage(this);
	},this));
}

ViewOrderView.prototype.setPage = function(scope){
	 $.ajax({
	      type: 'GET',
	      url: '/api/order/view/'+scope.type,
	      ContentType: "application/json",
	      data:{
    				'page':scope.page
    			},
    	  scope:scope,
		  success: function(data){
	    				if(data.result){
	    					this.scope.currentOffset = this.scope.element[0].offsetTop;
	    					for(var i in data.orders){
	    						var order = data.orders[i];
	    						order.concact = JSON.parse(order.concact);
	    						order.menus = JSON.parse(order.menus);
	    						order.menunum = 0;
	    						for(var j in order.menus){
	    							order.menunum += order.menus[j].num;
	    						}
	    						var orderItem = null;
	    						if(this.scope.items){
	    							orderItem = this.scope.items[i];
//	    							for(var l in this.scope.items){
//			    						var item = this.scope.items[l];
//			    						if(order.id == item.order.id){
//			    							orderItem = item;
//				    						break;
//			    						}
//			    					}
	    						}
	    						if(!orderItem){
	    							orderItem = new ViewOrderItem(this.scope.type,order.expanded);
	    							this.scope.element.append(orderItem.element);
	    							this.scope.items.push(orderItem);
	    						}
	    						orderItem.setOrder(order);
	    						orderItem.element.show();
	    					}
    						this.scope.totalPage = Math.ceil(data.total/5);
    						this.scope.controller.find('.total-page').html(this.scope.totalPage);
    						this.scope.controller.find('.page').html(this.scope.page);
    						if(!this.scope.disposed && this.scope.type == 'boss'){
    							if(data.hasNew){
    	    						playSound();
    	    						lunchTip('<a>恭喜你收到新订单！<a>',function(){
    	    							changePage(4);
    	    							$('#settting-left-bar-bossorder').find('a').click();
    	    						});
    	    					}
    							setTimeout(this.scope.setPage,5000,this.scope);
    						}
	    				}else{
	    					window.lunchTip(data.message)
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
	this.disposed = true;
}
/**
 * 菜单过滤器
 */
var MenuTypeSetting = function(){
	this.element = $('#rest-menutype-setting');
	this.element.append($("<tr><td></td><td></td><td><span id='show-new-menutype-btn' data-original-title='新建类别' class='icon-plus' style='float:right'></span></td></tr>"));
	this.newMenuType = $("<tr class='rest-menutype-setting-item'><td>名称:</td><td><input type='text' id='new-menu-name'></input></td><td><span id='new-menutype-btn' data-original-title='保存类别' class='icon-ok' style='float:right'></span></td></tr>");
	this.newMenuType.hide();
	this.element.append(this.newMenuType);
	this.element.find('#show-new-menutype-btn').click($.proxy(function(){
		if(this.element.find('#show-new-menutype-btn').hasClass('icon-plus')){
			this.newMenuType.show();
			this.element.find('#show-new-menutype-btn').addClass('icon-minus').removeClass('icon-plus');
			this.element.find('#show-new-menutype-btn').attr('data-original-title','取消新建');
		}else{
			this.newMenuType.hide();
			this.element.find('#show-new-menutype-btn').addClass('icon-plus').removeClass('icon-minus');
			this.element.find('#show-new-menutype-btn').attr('data-original-title','新建类别');
		}
	},this));
	this.newMenuType.find('input').keydown($.proxy(function(event){
		if(event.keyCode == 13){
			this.element.find('#new-menutype-btn').click();
		}
	},this));
	this.element.tooltip({
	      selector: "span"
    });
	this.element.find('#new-menutype-btn').click($.proxy(function(){
		$.ajax({
		      type: 'POST',
		      url: '/api/menutype/new',
		      ContentType: "application/json",
		      data:{
	    				'name':this.element.find('#new-menu-name').val()
	    			},
	    	  scope:this,
			  success: function(data){
		    				if(data.result){
		    					window.user.restuarant.menutypes.push(data.menutype);
		    					this.scope.element.find('#new-menu-name').val('');
		    					this.scope.newMenuType.hide(200,$.proxy(function(){
		    						this.addType(data.menutype);
		    						this.element.find('#show-new-menutype-btn').addClass('icon-plus').removeClass('icon-minus');
		    					},this.scope));
		    				}else{
		    					window.lunchTip(data.message)
		    				}
		    		    },
		      error: function(){alert('失败');}
		    });
	},this));
	for(var i in window.user.restuarant.menutypes){
		var menutype = window.user.restuarant.menutypes[i];
		this.addType(menutype);
	}
}

MenuTypeSetting.prototype.addType = function(menutype){
	var div = $("<tr valign='middle' class='rest-menutype-setting-item' id='rest-menutype-setting-item-"+menutype.id+"' data-id='"+menutype.id+"'><td>名称:</td><td><input type='text' value='"+menutype.name+"' disabled='true'></input></td><td valign='middle'></span><span class='icon-remove' data-original-title='删除类别'></span><span class='icon-ok' data-original-title='保存类别'></span><span class='icon-edit' data-original-title='编辑类别'></td><tr>");
	this.element.append(div);
	div.find('.icon-ok').hide();
	div.find('span').css('float','right');
	div.find('.icon-edit').click($.proxy(function(){
			this.find('input').attr('disabled',false);
			this.find('.icon-edit').hide();
			this.find('.icon-ok').show();
	},div));
	div.data('menutype-name',menutype.name);
	div.find('.icon-ok').click($.proxy(function(){
		if(this.data('menutype-name') == this.find('input').val()){
			this.find('input').attr('disabled',true);
			this.find('.icon-edit').show();
			this.find('.icon-ok').hide();
			return;
		}
		$.ajax({
		      type: 'POST',
		      url: '/api/menutype/edit/'+this.data('id'),
		      ContentType: "application/json",
		      data:{
	    				'name':this.find('input').val()
	    			},
	    	  scope:this,
			  success: function(data){
		    				if(data.result){
		    					this.scope.find('input').attr('disabled',true);
		    					this.scope.find('.icon-edit').show();
		    					this.scope.find('.icon-ok').hide();
		    					this.scope.data('menutype-name',this.scope.find('input').val());
		    					window.lunchTip('保存成功');
		    				}else{
		    					window.lunchTip(data.message);
		    				}
		    		    },
		      error: function(){alert('失败');}
		    });
	},div));
	div.find('input').keydown($.proxy(function(event){
		if(event.keyCode == 13){
			div.find('.icon-ok').click();
		}
	},this));
	div.find('.icon-remove').click($.proxy(function(){
		$.ajax({
		      type: 'POST',
		      url: '/api/menutype/delete/'+this.data('id'),
		      ContentType: "application/json",
	    	  scope:this,
			  success: function(data){
		    				if(data.result){
		    					this.scope.hide(200,$.proxy(function(){
		    						this.remove();
		    					},this.scope));
		    					for(var i in window.user.restuarant.menutypes){
		    						if(window.user.restuarant.menutypes[i].id == this.scope.data('id')){
		    							window.user.restuarant.menutypes.splice(i,1);
		    							window.lunchTip('删除成功');
		    							return;
		    						}
		    					}
		    				}else{
		    					window.lunchTip(data.message);
		    				}
		    		    },
		      error: function(){alert('失败');}
		    });
	},div));
}

var Message = function(){
	this.element = $("<tr class='message-item'><td class='message-item-id'></td><td class='message-item-sender'></td><td class='message-item-content'></td><td class='message-item-time'></td></tr>")
}

Message.prototype = {
	    constructor: Message
	  , setMessage: function(message){
			this.element.find('.message-item-id').html(message.id);
			this.element.find('.message-item-sender').html(message.sender?message.sender:'系统');
			this.element.find('.message-item-content').html(message.content);
			this.element.find('.message-item-time').html(message.createdtime);
		}
}

var Messages = function(){
	this.page = 1;
	this.total = 1;
	this.pagecount = 10;
	this.element = $("<table width='100%'><tr>" +
			"<th>ID</th>" +
			"<th>发送者</th>" +
			"<th>内容</th>" +
			"<th>时间</th>" +
			"</tr></table>");
	this.update();
}

Messages.prototype = {
		constructor: Message
	,	update: function(){
			$.ajax({
			      type: 'GET',
			      url: '/api/messages/'+this.page,
			      ContentType: "application/json",
			      scope:this,
				  success: function(data){
								this.scope.element.find('message-item').remove();
								if(data.total>0){
									this.scope.element.parent().find('.blank-place').hide();
									this.scope.element.show();
								}else{
									this.scope.element.parent().find('.blank-place').show();
									this.scope.element.hide();
								}
								total = Math.ceil(data.total / this.scope.pagecount);
								total = total == 0?1:total;
								for(var i in data.messages){
									message = new Message();
									message.setMessage(data.messages[i]);
									this.scope.element.append(message.element);
								}
			    		    },
			      error: function(){alert('失败');}
			    });
	},	nextPage: function(){
			this.page++;
			if(this.page>this.total){
				this.page = this.total;
			}
			this.update();
	},	prePage: function(){
			this.page --;
			if(this.page<1){
				this.page = 1;
			}
			this.update();
	}
}