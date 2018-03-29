/**
 * 专业禁排设置
 */
define(function(require, exports, module) {
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var sectionUtil = require("../../../common/js/section");
	var popup = require("basePath/utils/popup");
	var URL_DATA = require("basePath/config/url.data");
	/**
	 * 开课计划对应的理论任务信息
	 */
	var majorlistset = {
		/**
		 * 绑定数据
		 */
		init : function(){
			// 已选专业
			var majorNames = popup.getData("majorNames");
			$("#chooseMajor").text(majorNames);
			$("#chooseMajor").attr("title",majorNames);
		
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
			var sectionNum = timesettings.amSectionNumber + timesettings.pmSectionNumber + timesettings.nightSectionNumber;
			var weekNum = popup.getData("weekNum");
			//获取一周中从哪天开始上课
			majorlistset.section = new sectionUtil("sectionTableId",{
				weekNum: weekNum,
				section:{
					am: timesettings.amSectionNumber,
					pm: timesettings.pmSectionNumber,
					night: timesettings.nightSectionNumber
				},
				data:arr,
				status:["禁排"]
			});
			popup.setData("majorlistset", majorlistset.section);
			// 日排课节次上限
			var item="";
			item += "<option value=''>--请选择--</option>"; 
			for(var i = 1 ;i <= sectionNum; i++){
				item += "<option value=\"" + i + "\" >" + i + "</option>"; 
			}
			$("#sectionLimit").html(item);
		    var dayCourseSectionCount = popup.getData("dayCourseSectionCount");
		    if(dayCourseSectionCount > 0){
				$("#sectionLimit").val(dayCourseSectionCount);
		    }
		    // 备注
		    var remark = popup.getData("remark");
            if(typeof(remark)!=="object"){
    		    $("#remark").text(remark);
            }
		}
	}
	module.exports = majorlistset;  
});