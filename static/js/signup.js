function valid()
{
	alert("daf");
	return true;
}

$(function(){  
    var validator = $("#signup").validate({  
        debug: true,       //调试模式取消submit的默认提交功能  
        errorClass: "haha",//默认为错误的样式类为：error  
        focusInvalid: false,  
        onkeyup: false,  
        submitHandler: function(form){   //表单提交句柄,为一回调函数，带一个参数：form  
            alert("提交表单");  
            //form.submit();   提交表单  
        },  
        rules: {           //定义验证规则,其中属性名为表单的name属性  
            username: {  
                required: true,  
                minlength: 2,  
                remote: "uservalid.jsp"  //传说当中的ajax验证  
            },  
            password: {  
                required: true,  
                //minlength: 6  
                rangelength: [6,8]  
            },  
            repassword: {  
                required: true,  
                equalTo: "#password"  
            },   
            email: {  
                required: true,  
                email: true  
            }
        },  
        messages: {       //自定义验证消息  
            username: {  
                required: "用户名是必需的！",  
                minlength: $.format("用户名至少要{0}个字符！"),  
                remote: $.format("{0}已经被占用")  
            },  
            password: {  
                required: "密码是必需的！",  
                rangelength: $.format("密码要在{0}-{1}个字符之间！")  
            },  
            repassword: {  
                required: "密码验证是必需的！",    
                equalTo: "密码验证需要与密码一致"  
            }, 
            email: {  
                required: "邮箱是必需的！",  
                email: "请输入正确的邮箱地址（例如 myemail@163.com）"  
            } 
        },  
        errorPlacement: function(error, element) {  //验证消息放置的地方  
            error.appendTo( element.parent("td").next("td") );  
        },  
        highlight: function(element, errorClass) {  //针对验证的表单设置高亮  
            $(element).addClass(errorClass);  
        },  
        success: function(label) {    
                    label.addClass("valid").text("Ok!")    
            }    
          
        /*, 
        errorContainer: "#error_con",               //验证消息集中放置的容器 
        errorLabelContainer: "#error_con ul",       //存放消息无序列表的容器 
        wrapper: "li",                              //将验证消息用无序列表包围 
        validClass: "valid",                        //通过验证的样式类 
        errorElement: "em",                         //验证标签的名称，默认为：label 
        success: "valid"                            //验证通过的样式类 
        */  
    });  
    $("submit").click(function(){  
        validator.resetForm();  
    });      
}); 