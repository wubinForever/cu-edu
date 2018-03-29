/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var openMessage = require("../../common/js/openMessage");
	//变量名跟文件夹名称一致
	var adjustdetail = {
			// 初始化
			init : function(handing) {
				popup.setData("adjustHanding", this);
				 this.loadData();
				 this.handing = handing;
			},
			/**
			 *  加载数据
			 */
			loadData:function(){
				var me = this;
				var id = popup.getData("id");
				ajaxData.request(URL_COURSEPLAN.LESSON_GETITEM, {id:id},function(data) {
					if(data.code == config.RSP_SUCCESS){
						 me.setHtml(data.data);
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			},
			/**
			 * 组装html
			 */
			setHtml:function(data){
				if(data){
					this.data = data;
					$("#semester").html(data.semester);
					if(data.adjustShutType == 0){
						$("#adjustShutType").html("停课");
					}else if(data.adjustShutType == 1){
						$("#adjustShutType").html("调课");
					}else if(data.adjustShutType ==3){
						$("#adjustShutType").html("批量停课");
					}else {
						$("#adjustShutType").html("批量调课");
					}
					
					$("#course").html("[" + data.courseNo + "]" + data.courseName).attr("title", "[" + data.courseNo + "]" + data.courseName);
					$("#adjustBeforeWeek").html(data.adjustBeforeWeek).attr("title", data.adjustBeforeWeek);
					$("#adjustBeforeSection").html(data.adjustBeforeSection).attr("title", data.adjustBeforeSection);
					if(data.singleOrDoubleWeek == 1){
						$("#singleOrDoubleWeek").html("单周").attr("title", "单周");
					}else if(data.singleOrDoubleWeek == 2){
						$("#singleOrDoubleWeek").html("双周").attr("title", "双周");
					}
					$("#adjustBeforeClassroom").html(data.adjustBeforeClassRoom).attr("title", data.adjustBeforeClassRoom);
					if(data.classNameList.length > 4){
						var classNameList = [];
						for(var i = 0 ; i < 4; i ++){
							classNameList.push(data.classNameList[i]);
						}
						data.classes = classNameList.join(",");
						$("#teachclass").html(data.teachingClassNo+"("+data.classes+"...)").attr("data", data.classNameList.join("#@#")).addClass("open-message");
						openMessage.message("#teachclass", "行政班");
					}else{
						data.classes = data.classNameList.join(",");
						$("#teachclass").html(data.teachingClassNo+"("+data.classes+")").attr("title", data.teachingClassNo+"("+data.classes+")");
					}
					if(data.adjustShutType == 0 || data.adjustShutType == 3){
						$("#clashStatus,#adjustDiv").remove();
						$("#shutWeek").html(data.adjustToWeek);
						$("#shutSection").html(data.adjustBeforeSection);
						$("#shutReason").html(data.adjustShutReason);
						$("#shutUser").html("["+ data.userNo+"]"+data.userName);
						$("#shutTime").html(new Date(data.createTime).format("yyyy-MM-dd hh:mm"));
					}else{
						$("#shutDiv").remove();
						if(data.teacherClashStatus == 1){
							$("#teacherClashStatus").parent().addClass("modification-chek");
						}
						if(data.teachroomClashStatus == 1){
							$("#teachroomClashStatus").parent().addClass("modification-chek");
						}
						if(data.classClashStatus == 1){
							$("#classClashStatus").parent().addClass("modification-chek");
						}
						if(data.adjustShutOptionName.charAt(0) == '1'){
							$("#weekOption").html("✔");
						}
						$("#weekBefore").html(data.adjustWeek);
						$("#weekAfter").html(data.adjustToWeek);
						if(data.adjustShutOptionName.charAt(1) == '1'){
							$("#sectionOption").html("✔");
						}
						$("#sectionBefore").html(data.adjustBeforeSection);
						$("#sectionAfter").html(data.adjustToSection);
						if(data.adjustShutOptionName.charAt(2) == '1'){
							$("#roomOption").html("✔");
						}
						$("#roomBefore").html(data.adjustBeforeClassRoom);
						$("#roomAfter").html(data.adjustToClassRoom);
						if(data.adjustShutOptionName.charAt(3) == '1'){
							$("#teacherOption").html("✔");
						}
						$("#teacherBefore").html(data.beforeTeacherName);
						$("#teacherAfter").html(data.afterTeacherName);
						$("#adjustShutReason").html(data.adjustShutReason);
						$("#adjustUser").html("["+ data.userNo+"]"+data.userName);
						$("#adjustTime").html(new Date(data.createTime).format("yyyy-MM-dd hh:mm"));
					}
					if(!this.handing){
						$("#handingDiv").remove();
						$("#handingOption").html(data.handingOption);
						var handingStatus = "";
						if(data.handingStatus == 0){
							handingStatus = "待处理";
						}else if(data.handingStatus == 1){
							handingStatus = "不通过";
						}else if(data.handingStatus == 2){
							handingStatus = "通过";
						}
						$("#handingStatus").html(handingStatus);
						$("#disposeUser").html("["+ data.disposeNo+"]"+data.disposeName);
						$("#disposeTime").html(new Date(data.disposeTime).format("yyyy-MM-dd hh:mm"));
					}else{
						$("#detailDiv").remove();
						new limit($("#handingOption"),$("#handingOptionCount"),100);
					}
				}
			},
			doHanding:function(){
				if(this.data){
					var me = this;
					var handingStatus = $("input[name=handingStatus]:checked").val();
					//调课且未通过时才需要执行冲突判断
					if(handingStatus == 2 && me.data.adjustShutType == 1){
						var adjustShutId = this.data.adjustShutId;
						ajaxData.request(URL_COURSEPLAN.LESSON_HANDING_CONFLICT, {id:adjustShutId},function(data) {
							if(data.code == config.RSP_SUCCESS){
								 if(data.data == true){
									 me.save()
								 }else{
									 popup.askPop("存在时间冲突，确定要处理通过吗？", function(){
										 me.save()
									 });
								 }
							}else{
								popup.warPop(data.msg);
							}
						}, true);
					}else{
						me.save()
					}
				}
				return false;
			},
			save:function(){
				var list = popup.getData("list");
				var param = {};
				param.adjustShutId = this.data.adjustShutId;
				param.handingStatus = $("input[name=handingStatus]:checked").val();
				param.handingOption = $("#handingOption").val();
				var flag = false;
				ajaxData.request(URL_COURSEPLAN.LESSON_HANDING, param,function(data) {
					if(data.code == config.RSP_SUCCESS){
						list.handerangeFrame.close();
					}else{
						popup.warPop(data.msg);
					}
				}, true);
				return flag;
			}
		}
	module.exports = adjustdetail; //根文件夹名称一致
});