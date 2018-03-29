/**
 * 班级环节周次设置
 * 列表
 * 按开课单位
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");
	var timeNotice = require("../../../common/js/timeNotice");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
    var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var URLDATA = require("basePath/config/url.data");
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var courseUnitsList = {
		/*
		 * 初始化
		 */
		init : function() {
			//判断当前时间是否能进入
			regData ={};
			regData.enterPage = ScheduleSettingsEnterPage.PracticeTask.value;
			timeNotice.init(regData);
			
			//默认加载当前学年学期
			var semester = simpleSelect.loadCourseSmester("semester", true);
			courseUnitsList.semester = semester;
			
			// 绑定开课单位下拉框
			simpleSelect.loadSelect("kkDepartmentId",URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:true},{firstText:"全部",firstValue:""});
			// 绑定环节大类下拉框
			simpleSelect.loadDictionarySelect("tacheTypeCode", dataDictionary.TACHE_TYPE_CODE, {
				firstText : "全部",
				firstValue : ""
			});
			
			courseUnitsList.initPagination();
			
			// 查询
			$("button[name='searchInp']").on('click', function() {
				// 保存查询条件
				courseUnitsList.pagination.setParam(courseUnitsList.getQueryParams());
			});
			
			//周次设置弹窗
			$(document).on('click', "button[name='weekset']", function(){
				if (semester.getAcademicYear() && semester.getSemesterCode()) {
					courseUnitsList.weekSet(semester.getAcademicYear(), semester.getSemesterCode(),this);
				}
			});
			openMessage.message(".open-message", "指导教师");
		},
			
			/**
			 * 加载开课单位
			 */
			loadDepartment : function(){
				var param = {};
				var me = this;
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.departmentName, value:item.departmentId});
						});
						simpleSelect.installOption($("#kkDepartmentId"), list, "", "全部","" );
						
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			
			initPagination:function(){
				this.pagination = new pagination({
					id : "pagination",
					url : URL_COURSEPLAN.PRACTICE_CLASSLINKWEEKLYSETTING_GETPAGELIST,
					param : this.getQueryParams()
				}, function(data) {
					if (data.length > 0) {
						$.each(data, function(i, item){
							if(item.teachers){
								item.teachers = item.teachers.split(",");
							}
						});
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
						$("#pagination").show();
						
						//添加title
						common.titleInit();
					} else {
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
				}).init();
			},	
			
			/**
			 * 获取查询条件
			 * @academicYear 学年
			 * @semesterCode 学期
			 * @departmentId 开课单位
			 * @courseNoOrName 环节号/名称
			 * @tacheTypeCode 环节类别
			 * @setState 状态
			 */
			getQueryParams:function(){
				var param = {};
				param.academicYear = courseUnitsList.semester.getAcademicYear();
				param.semesterCode = courseUnitsList.semester.getSemesterCode();
				param.departmentId = $("#kkDepartmentId").val();
				param.courseNoOrName = $("#courseNo").val();
				param.tacheTypeCode = $("#tacheTypeCode").val();
				param.setState = $("#setState").val();
				return param;
			},
			
			/**
			 * 弹窗 周次设置
			 *
			 * 
			 */
			weekSet : function(academicYear, semesterCode, obj) {
				
				//通过学年学期获取排课时间信息
				var reqData = {};
				var schoolWeek = "";
				reqData.academicYear = academicYear;
				reqData.semesterCode = semesterCode;

				//获取上课周数
				ajaxData.request(URL_COURSEPLAN.PARAMETER_TIME_GETITEM,reqData,function(data){
					if(data.code == config.RSP_SUCCESS&&data.data){
							//向弹框传参
							schoolWeek = data.data.schoolWeek;
							
						
						//从列表获取对象
						var startclassPlanIds = $(obj).attr("startclassPlanIds"); // 获取this对象的开课计划Id集合
							courseId = $(obj).attr("courseId"); // 获取this对象的开课计划Id
						    practiceNumber = $(obj).parent().parent().find('td').eq(2).text(),// 获取环节号
							practiceName = $(obj).parent().parent().find('td').eq(3).text(),// 获取环节名称
							practiceStyle = $(obj).parent().parent().find('td').eq(4).text(),// 获取环节类别
							score = $(obj).parent().parent().find('td').eq(5).text(),// 获取学分
							weeks = $(obj).parent().parent().find('td').eq(6).text();// 获取周数
							var data = {};
							//储存 周数设置数据
							data.startclassPlanIds = startclassPlanIds; // 开课计划Id集合
							data.courseId = courseId; // 环节id
							data.reqData = reqData; // 学年学期
							data.schoolWeek = schoolWeek; //上课开始周次
							data.practiceNumber = practiceNumber; //环节号
							data.practiceName = practiceName; //环节名称
							data.practiceStyle = practiceStyle; //环节类别
							data.score = score; //学分
							data.weeks = weeks; //上课周数
							data.reqData = reqData;
							data.isDepartmentfilter = false;
							
							popup.setData("data", data);
							popup.open('./courseplan/practice/task/html/weekset.html' ,// 这里是页面的路径地址
							{
								id : 'weekset',
								title : '周次设置',
								width :900,// 这是弹窗宽度。其实可以不写
								height :550,// 弹窗高度*/
								okVal : '保存',
								cancelVal : '关闭',
								ok : function(){
									var setInitTask = popup.getData("setInitTask"),
										errormsg = "";
									var iframe = this.iframe.contentWindow;// 弹窗窗体	
										iframe.$("input").removeClass("erroInp");
										
									if(!setInitTask.validate()){
										
										//判断验证提醒
										errormsg = setInitTask.errormsg;
										
										if(utils.isNotEmpty(errormsg.content)){
											
											 iframe.$("input[is-empty='true']").addClass("erroInp");
											 popup.warPop(errormsg.content);
											 
											 
										}else if(utils.isNotEmpty(errormsg.content1)){
											
											 iframe.$("input[wrong-week='true']").addClass("erroInp");
											 popup.warPop(errormsg.content1);
											 
										}else{
											
											if(utils.isEmpty(errormsg.content2)){
												errormsg.content2="";
											}
											if(utils.isEmpty(errormsg.content3)){
												errormsg.content3="";
											}
											if(utils.isEmpty(errormsg.content4)){
												errormsg.content4="";
											}
											
											errNote = errormsg.content2+errormsg.content3+errormsg.content4;
											errNote = errNote.substring(0, errNote.length-1);
										 	iframe.$("input[error='true']").addClass("erroInp");
										 	popup.warPop(errNote);
										 	
										}
										
										return false;
										
									}else{
										
										var	data = setInitTask.classDataList;
										$.each(data, function(i, item){
											item.practiceWeeks = item.practiceStr;
										});
											
										//保存
										ajaxData.setContentType("application/json;charset=utf-8");
										ajaxData.request(URL_COURSEPLAN.PRACTICE_CLASSLINKWEEKLYSETTING_BATCHSETUP, JSON.stringify(data), function(dt){
											if(dt.code == config.RSP_SUCCESS){
												popup.okPop("设置成功"); 
												courseUnitsList.pagination.loadData();
											}else{
												popup.errPop("加载数据失败：" + data.msg);
											}
										});
											

									} 
									

								},
								cancel : function(){
								}
							});
					}else{
						popup.errPop("请先设置上课周数！");
						return false;
						
					}
					
				});

			} 
	}			 

	module.exports = courseUnitsList; //根文件夹名称一致
	window.courseUnitsList = courseUnitsList;    //根据文件夹名称一致
});