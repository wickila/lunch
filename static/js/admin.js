$(function(){
	window.opApply = function(event,id,opcode){
		var btn = $(event.currentTarget);
		var reason = "";
		if(opcode == -1){
			reason = prompt("请输入拒绝理由", "")
		}
		if(opcode == -1 && !reason){
			return;
		}
		$.ajax({
	          type: 'POST',
	          url: '/admin/applyoption',
	          ContentType: "application/json",
	          scope: btn,
	          data:{'id':id,
					'opcode':opcode,
					'reason':reason
					},
	          success: function(data){
						if(data.result){
							var td = this.scope.parent();
							td.find('button').remove();
							if(data.apply.state == 1){
								td.append($("<span class='label label-success'>已接受</span>"))
							}else if(data.apply.state == -1){
								td.append($("<span class='label label-warning'>已拒绝</span>"))
							}
						}else{
							lunchAlert(data.message)
						}
	          		},
	          error: function(){alert('操作失败')}
	    });
	}
	
	window.rejectApply = function(id){
		
	}
});