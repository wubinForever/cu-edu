/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
 
	var popup = require("../../../common/js/utils/popup");
	//变量名跟文件夹名称一致
	var openMessage = {
		open : function(){
			var message = popup.getData("message");
			var thead = popup.getData("thead");
			$("#messageTitle").html(thead);
			$("#tbodycontent").append($("#tableTmpl").tmpl(message)).setNoDataHtml();
		},
		message : function(selector, title){
			var me = this;
			$(document).on("click", selector, function(){
				var message = $(this).attr("title");
				if(!message){
					message = $(this).attr("data");
				}
			 
				message = message.split("#@#");
				var arr = [];
				$.each(message, function(i, item){
					if($.trim(item).length > 0){
						arr.push({value:item});
					}
				})
				if (arr.length > 0) {
					me.dialog(arr, title);
				}
			});
			
		},
		dialog:function(message, thead){
			popup.setData("message", message);
			popup.setData("thead", thead);
			var teacherPopup = popup.open('./courseplan/common/html/openMessage.html', {
				id : 'openMessage',// 唯一标识
				title : thead+"查看",// 这是标题
				width : 400,// 这是弹窗宽度。其实可以不写
				height : 300,// 弹窗高度 
				cancelVal : '关闭',
				fixed: true,
				cancel:function(){return true;}
			});
		}
	}
	module.exports = openMessage; //根文件夹名称一致
});