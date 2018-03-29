/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	var sectionUtil = require("../../../common/js/section");
	var popup = require("basePath/utils/popup");
	var URL_DATA = require("basePath/config/url.data");
	/**
	 * 开课计划对应的理论任务信息
	 */
	var section = {
		/**
		 * 绑定数据
		 */
		init : function(){
			//节次数据
			var data = popup.getData("sectionData");
			var arr = [];
			if(data.forbiddenSection){
				arr.push(data.forbiddenSection);
			}else{
				arr.push([]);
			}
			if(data.solidLineSection){
				arr.push(data.solidLineSection);
			}else{
				arr.push([]);
			}
			//时间设置 -- 一天多少节次
			var timesettings = popup.getData("timesettings");
			var weekNum = popup.getData("weekNum");
			//获取一周中从哪天开始上课
			section.section = new sectionUtil("sectionTableId",{
				weekNum: weekNum,
				section:{
					am: timesettings.amSectionNumber,
					pm: timesettings.pmSectionNumber,
					night: timesettings.nightSectionNumber
				},
				data:arr,
				status:["禁排","固排"]
			});
			popup.setData("section", section.section);
		}
	}
	module.exports = section;  
});