
/**
 * 下拉框公共调用处理类
 * 在界面加入编号，标识是一个需要请求后台的数据即可
 * 操作的节点必须是div
 */
define(function(require, exports, module) {
	var select = require("./select");
	 var semester = function(option){
		 select.call(this, option);
	 }
	 semester.prototype = new select();
 
	 semester.prototype.loadData = function(){
		 this.data = [{value:"2017-1",name:"2017年第一学期"},{value:"2017-2",name:"2017年第二学期"},{value:"2018-1",name:"2018年第一学期"}]
	}
	module.exports = semester;
	 
});
