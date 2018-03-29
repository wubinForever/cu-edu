/**
 * 在线注册
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var config = require("basePath/utils/config");
	var URL = require("basePath/config/url.udf");	
	var ajaxData = require("basePath/utils/ajaxData");
	
	/**
	 * 注册管理
	 */
	var register = {
			initGrant : function(){			
				var applyId = decodeURIComponent(utils.getUrlParam('applyId'));
				$('#applyId').val(applyId);
				if(applyId){
					$('#message').text("暂未授权或授权失效，请联系管理员。");
				}
				$("#shouquan").click(function() {
					  var registerCode=$("#registerCode").val(); 
					  var licenseCode=$("#licenseCode").val(); 
					     if (registerCode == "" || licenseCode == "") {
				            	$("#message").text("注册码或者授权码为空!")
				        }else{
							  $.ajax({
								  	type:"POST",
								  	url:utils.getRootPath() + config.PROJECT_NAME + URL.ONLINE_REGISTER_GRANT.url,
								  	dataType:"json",
								  	data:{"grantCode":licenseCode,"registerCode":registerCode},
								    beforeSend:function(){
								    	$("#message").text("正在注册授权...");  
								    	$("#shouquan").attr("disabled","disabled"); 
								    },  
								  	success:function(resultMap){
								  		if(resultMap.success==true){
								  			$('input').attr("readonly","readonly");
									    	$("#shouquan").val("授权成功！");
									    	register.countDown();
								   		}
								  		if(resultMap.success==false){
								  			$("#message").text("授权失败！请输入正确注册码、授权码！"); 
								  			$("#shouquan").removeAttr("disabled");
								  		}
								  	},error:function(error){   
							  			$("#message").text("未知异常，请联系管理员！...");
							  			$("#shouquan").removeAttr("disabled");
								  	}
								  }) ; 
				        }
				});
			},
			countDown : function (){ 
				var time =3; 
				setInterval(function(){
					if(time>0){
						$("#message").text("授权成功！将在"+time+"秒后跳转");	
						time=time-1;
					}
					else{
						//根据需要跳转至相应页面
						 location.replace(utils.getRootPathName() + "/login.html"); 
					}
				}, 1000); 
			},
			initAbout : function(){
				ajaxData.request(URL.ONLINE_REGISTER_ABOUT, null,
						function(data) { 
							if (data.code == config.RSP_SUCCESS) {
								if (data.data) {
									$('#productCode').text(data.data.productCode);
									$('#registerCode').text(data.data.registerCode);
									$('#grantCode').text(data.data.grantCode);
									$('#start').text(data.data.start);
									$('#end').text(data.data.end);
								}
							}
						}, true);
			}
	}
	module.exports = register;
	window.register = register;
});
