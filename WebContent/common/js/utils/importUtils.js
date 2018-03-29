/**
 * 导入帮助类
 */
define(function(require, exports, module) {
	
	var config = require("./config"); //文件上传帮助
	function importUtils(param){
		var opt = {
			extensions : "xls,xlsx", //过滤文件类型
			uploadUrl:"",	//导入文件接口
			data : [], 	//错误信息显示的字段[{name:"名称",field:"name"}.....]
			exportFailUrl :"",	//导出错误信息接口路径
			successCallback : function(){return true},	//导入成功后回调函数
			ok : function(){return true},	//点击弹窗确定按钮回调函数
			title:"导入",	//弹出层显示的内容
			templateUrl : "", //下载模板地址
			dispalyImportWay : true,//控制显示导入方式 true显示 false不显示
		}
		this.option =  $.extend({}, opt, param);
		this.init = function(){
			var me = this;
			//弹出层
			artDialog.data("option", me.option);
			art.dialog.open(config.base + '/common/html/import.html',{
				id : 'importIframe',// 唯一标识
				title : this.option.title,// 这是标题
				width : '900px',// 这是弹窗宽度。其实可以不写
				height : '600px',// 弹窗高度
				okVal : '关闭',
				ok : function() {
					me.option.ok();
					return true;
				} 
			});
		}
	};
	module.exports = importUtils;
});
