/**
 * 用户权限判断
 */
define(function (require, exports, module) {
	/**
	 * 引入依赖
	 */
	var utils = require("./utils");
	var authorityAjaxData = require("./authorityAjaxData");
	var URL = require("../config/url.udf");
	var config = require("./config");
	/*用户权限*/
	var authority = {
		init:function(){
			//判断页面的权限
			var pageCodeList=[];
			$("[page-auth-code]").each(function(i, item){
				var authCode=$.trim($(item).attr("page-auth-code"));				
				if(authCode!="" ){
					if(authCode.indexOf(",")==-1){
						pageCodeList.push(authCode);
					}else{
						var authCodeArr=authCode.split(',');
						for(var i=0;i<authCodeArr.length;i++){
							pageCodeList.push(authCodeArr[i]);
						}
					}					
				}				
			});
			if(pageCodeList.length>0){
				authority.pageLoadAuthority(pageCodeList);
			}	
			
			//判断页面按钮的权限
			var codeList = [];
			$("[auth-code]").each(function(i, item){
				codeList.set($(item).attr("auth-code"));
			});
			if(codeList.length>0){
				authority.loadAuthority(codeList);
			}			
		},
		/**
		 * 根据权限码，获取权限（页面权限）
		 */
		pageLoadAuthority:function(pageCodeList){			
			var param={authCodeArr:pageCodeList};
			authorityAjaxData.contructor(false);//同步加载
			authorityAjaxData.request(URL.USER_JUDGE_AUTHORITY, param, function(data){
				var flag=false; // 默认没有权限
			    $.each(data.data, function(i, item){
			    	if(item.authority == true){
			    		flag=true; // 只要有一个权限码有权限，则授权						  
				    }					  
			    });
			    if(!flag){
			    	location.href= utils.getRootPathName() + "/common/html/401.html";
			    }			    
			});
		},
		/**
		 * 根据权限码，获取权限（按钮权限）
		 */
		loadAuthority:function(codeList){			
			var param={authCodeArr:codeList};
			authorityAjaxData.contructor(false);//同步加载
			authorityAjaxData.request(URL.USER_JUDGE_AUTHORITY, param, function(data){
				  $.each(data.data, function(i, item){
					  if(item.authority == false){
						  $("[auth-code="+item.code+"]").remove();
					  }
				  })
			});
		}
	}
	authority.init();
	 module.exports = authority;
});
