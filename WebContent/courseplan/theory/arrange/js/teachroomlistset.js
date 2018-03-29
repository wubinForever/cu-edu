/**
 * 教室禁排设置
 */
define(function(require, exports, module) {
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var sectionUtil = require("../../../common/js/section");
	var popup = require("basePath/utils/popup");
	var URL_DATA = require("basePath/config/url.data");
	/**
	 * 开课计划对应的理论任务信息
	 */
	var teachroomlistset = {
		/**
		 * 绑定数据
		 */
		init : function(){
			// 已选专业
			var venueNames = popup.getData("venueNames");
			$("#chooseClassRoom").text(venueNames);
			$("#chooseClassRoom").attr("title",venueNames);
		
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
			teachroomlistset.section = new sectionUtil("sectionTableId",{
				weekNum: weekNum,
				section:{
					am: timesettings.amSectionNumber,
					pm: timesettings.pmSectionNumber,
					night: timesettings.nightSectionNumber
				},
				data:arr,
				status:["禁排"]
			});
			popup.setData("teachroomlistset", teachroomlistset.section);
			
			// 绑定留用周次
			var retentionWeek = popup.getData("retentionWeek");
            if(typeof(retentionWeek)!=="object"){
    		    $("#retentionWeek").val(retentionWeek);
            }
            
		    // 绑定备注
		    var remark = popup.getData("remark");
            if(typeof(remark)!=="object"){
    		    $("#remark").text(remark);
            }
            
            $(document).on("click", "input[ name = retentionWeek ]",function(e){
            	teachroomlistset.weekSetListIn(e);
			});
		},
		
		/**
		 *	输入周次：
		 * a.监听文本框触发事件：focus ;
		 * b.当文本框失去焦点时：blur, 效验文本框值的格式；格式错误的，文本内容标红，重新focus次文本框；
		*/ 
		weekSetListIn :function(obj){
			var _this = $(obj.currentTarget);
			//当失去焦点呢
		 	_this.blur(function(){
		 		var resultArr = [],
				str = _this.val();
				if(utils.isEmpty(str)){
				}else{
					if(!utils.isWeek(str)){
						popup.warPop("留用周次格式有误");
						$("#retentionWeek").val("");
					}
				}
			});
		 }
	}
	module.exports = teachroomlistset;  
});