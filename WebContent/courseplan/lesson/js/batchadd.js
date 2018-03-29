/**
 * 批量调停课新增
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var common = require("basePath/utils/common");
	var config = require("basePath/utils/config");
	//下拉框
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_UDF = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var simpleSelect = require("basePath/module/select.simple");
	var select = require("basePath/module/select");
	//工具
	var popup = require("basePath/utils/popup");
	var mapUtil = require("basePath/utils/mapUtil");
	var teacher = require("../../common/js/teacher");
	var weekNameArr = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
	/**
	 * 调停课新增
	 */
	 var batchadd = {
		 init:function(){
			 $('.rangebutton').on('click',function(){
				$('.rangebox').show();
				$('.stopbox').hide();
			});
			$('.stopbutton').on('click',function(){
				$('.rangebox').hide();
				$('.stopbox').show();
			});  
			new limit($("#stopRemark"),$("#stopRemarkCount"),100);
			new limit($("#rangeRemark"),$("#rangeRemarkCount"),100);
			var me = this;
			simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
			$("#semester").change(function(){
				me.loadTeachWeek();
			}).change();
			me.resetWeekOfDay();
			me.multiSelect();
			
			popup.setData("batchadd", batchadd);
		 },
		 /**
		  * 获取校历教学周
		  */
		 loadTeachWeek:function(){
			 var me = this;
			 var param = this.getSemester();
			 if(!param){
				this.teachWeek = 0;
				return ;
			 }else{
				 ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETTEACHWEEK, param, function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						 me.teachWeek = data.data;
					 }else{
						 popup.errPop("加载数据失败：" + data.msg);
					 }
				 }); 
			 }
		 },
		 /**
		  * 获取当前页面的学年学期下拉框中的内容
		  */
		 getSemester : function(){
			 var param = {},
			 	semester = $("#semester").val();
			 if(semester && semester.split("_").length == 2){
				 param.academicYear = semester.split("_")[0];
				 param.semesterCode = semester.split("_")[1];
				 return param;
			 }else{
				 return null;
			 }
		 },
		 resetWeekOfDay:function(){
			 var me = this;
			 $.each(weekNameArr, function(i, arr){
				//加载下拉内容
				var select = '<label class="checkbox-con" name="toggle-box"><input type="checkbox" value='+(i + 1)+' class="checNormal"><span>'+arr+'</span></label>';
				$("#afterWeekOfDay-list, #beforeWeekOfDay-list, #stopWeekOfDay-list").append(select);
				$("#afterWeekOfDay, #beforeWeekOfDay, #stopWeekOfDay").val("--请选择--");
			});
		 },
		 /*
		 * 多选下拉
		 * 指导老师多选
		 * 自动收缩功能
		 */
		multiSelect : function(){
			//下拉多选按键
			$(document).click(function(e) {
				if ($(e.target).siblings("div.multiSelect").children().length > 0) {
					$("div.multiSelect").hide();
					$(e.target).siblings("div.multiSelect").show();
				}else if($(e.target).parent("[name = 'toggle-box']").hasClass("checkbox-con") || $(e.target).hasClass("checkbox-con")){
					var multiSelect = $(e.target).parents("div.multiSelect");
					multiSelect.show();
					var ids = [];
					var names = [];
					multiSelect.find("input:checkbox:checked").each(function(i, item){
						var id = $(item).val();
						var name = $(item).next().html();
						ids.push(id);
						names.push(name);
					});
					if(ids.length == 0 ){
						multiSelect.prev().val("--请选择--").attr("code", "");
					}else{
						multiSelect.prev().val(names.join(",")).attr("code", ids.join(","));
					}
					
				}else{
					$("div.multiSelect").hide();
				}
			});
		},
		/**
		 * 验证并保存
		 */
		save:function(){
			var param = this.getSemester();
			param.adjustShutType = $("input[name=weekStartDay]:checked").val();
			if(param.adjustShutType == '3'){
				param.adjustWeek = $("#stopWeek").val();
				param.adjustWeekDays = $("#stopWeekOfDay").attr("code");
				param.adjustShutReason = $("#stopRemark").val();
				if(utils.isEmpty(param.adjustWeek)){
					 popup.warPop("停课周次不能为空");
					 return false;
				 } 
				 if(!utils.isWeek(param.adjustWeek)){
					 popup.warPop("停课周次格式有误");
					 return false;
				 } 
				 var adjustWeekList = utils.getWeekList(param.adjustWeek);
				 if(!this.checkWeek(adjustWeekList)){
					 return false;
				 }
				 if(utils.isEmpty(param.adjustWeekDays)){
					 popup.warPop("停课星期不能为空");
					 return false;
				 }
				 if(utils.isEmpty(param.adjustShutReason)){
					 popup.warPop("停课原因不能为空");
					 return false;
				 }
				
			}else if(param.adjustShutType == '4'){
				param.adjustWeek = $("#beforeWeek").val();
				param.adjustWeekDays = $("#beforeWeekOfDay").attr("code");
				param.adjustToWeek = $("#afterWeek").val();
				param.adjustToWeekDays = $("#afterWeekOfDay").attr("code");
				param.adjustShutReason = $("#rangeRemark").val();
				if(utils.isEmpty(param.adjustWeek)){
					 popup.warPop("调前周次不能为空");
					 return false;
				 } 
				 if(!utils.isWeek(param.adjustWeek)){
					 popup.warPop("调前周次格式有误");
					 return false;
				 } 
				 var adjustWeekList = utils.getWeekList(param.adjustWeek);
				 if(!this.checkWeek(adjustWeekList)){
					 return false;
				 }
				 
				 if(utils.isEmpty(param.adjustWeekDays)){
					 popup.warPop("调前星期不能为空");
					 return false;
				 }
				 
				 if(utils.isEmpty(param.adjustToWeek)){
					 popup.warPop("调后周次不能为空");
					 return false;
				 }
				 if(!utils.isWeek(param.adjustToWeek)){
					 popup.warPop("调后周次格式有误");
					 return false;
				 } 
				 var adjustToWeekList = utils.getWeekList(param.adjustToWeek);
				 if(!this.checkWeek(adjustToWeekList)){
					 return false;
				 }
				 if(utils.isEmpty(param.adjustToWeekDays)){
					 popup.warPop("调后星期不能为空");
					 return false;
				 }
				 if(utils.isEmpty(param.adjustShutReason)){
					 popup.warPop("调课原因不能为空");
					 return false;
				 }
				 //验证逻辑
				 if(adjustWeekList.length != adjustToWeekList.length){
					 popup.warPop("调后周次数与调前周次数不一致");
					 return false;
				 }
				 if(param.adjustWeekDays.split(",").length != param.adjustToWeekDays.split(",").length){
					 popup.warPop("调后星期数与调前星期数不一致");
					 return false;
				 }
			}else{
				popup.warPop("请选择调停课类型");
				return false;
			}
			 //提交数据库，
			 var flag = false;
			 ajaxData.contructor(false);
			 ajaxData.setContentType("application/json;charset=utf-8");
			 ajaxData.request(URL_COURSEPLAN.LESSON_BATCHADD, JSON.stringify(param), function(data){
				 if(data && data.code == config.RSP_SUCCESS){
					 flag = true;
				 }else{
					 popup.warPop(data.msg);
				 }
			 });
			 return flag;
		},
		/**
		 * 检测周次是否小于当前学年学期的上课周数
		 */
		checkWeek : function(week){
			var teachWeek = this.teachWeek;
			if(teachWeek){
				for(var i = 0 ; i < week.length ; i ++){
					var w = parseInt(week[i]);
					if(teachWeek < w){
						popup.warPop("请选择1-"+teachWeek+"周内的周次");
						return false;
					}
				}
			}
			return true;
		}
		
	 }
	module.exports = batchadd;  
});