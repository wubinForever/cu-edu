/**
 * 班级环节周次设置
 * 列表
 * 按年纪/专业
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
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); 
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var constant = require("basePath/config/data.constant");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var gradeProfessionList = {
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
				gradeProfessionList.semester = semester;
				
				//加载年级列表
			    simpleSelect.loadCommon("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,"","全部","",null);
			   
				$("#departmentId,#grade").change(function(){
					gradeProfessionList.loadMajor();
				});
				// gradeProfessionList.loadDepartment();
				//加载院系
				simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
					departmentClassCode : "1",
					isAuthority : true
				}, {
					firstText : constant.SELECT_ALL,
					firstValue : "",
					async : false
				});
				
				gradeProfessionList.loadMajor();
				gradeProfessionList.initPagination();
				
				// 查询
				$("button[name='searchInp']").on('click', function() {
					// 保存查询条件
					gradeProfessionList.pagination.setParam(gradeProfessionList.getQueryParams());
				}); 
				//周次设置弹窗
				$(document).on("click","button[name='weekset']", function(){
					if (semester.getAcademicYear() && semester.getSemesterCode()) {
						gradeProfessionList.weekSet(semester.getAcademicYear(), semester.getSemesterCode(),this);
					}
				}); 

				openMessage.message(".open-message", "指导教师");
			}, 
			/**
			 * 加载院系
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
						simpleSelect.installOption($("#departmentId"), list, "", "全部","" );
						
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			initPagination:function(){
				this.pagination = new pagination({
					url : URL_COURSEPLAN.PRACTICE_CLASSLINKWEEKLYSETTING_GETGRADEMAJORPAGELIST,
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
						$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
				}).init();
			},
			/**
			 *  加载专业
			 */
			loadMajor : function(){
				var param = {};
				param.departmentId = $("#departmentId").val();
				param.grade = $("#grade").val();
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.majorName, value:item.majorId});
						});
						simpleSelect.installOption($("#majorId"), list, "", "全部","" );
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			/**
			 * 获取查询条件
			 * @academicYear 学年
			 * @semesterCode 学期
			 * @grade 年级
			 * @departmentArr 院系
			 * @major 专业
			 * @courseNoOrName 环节号/名称
			 * @setState 状态
			 */
			getQueryParams:function(){
				var param = {};
				param.academicYear = this.semester.getAcademicYear();
				param.semesterCode = this.semester.getSemesterCode();
				param.grade = $("#grade").val();
				param.departmentId = $("#departmentId").val();
				param.majorId = $("#majorId").val();
				param.courseNoOrName = $("#courseNo").val();
				param.setState = $("#setState").val();
				return param;
			},
			
			/**
			 * 弹窗 周次设置
			 * 
			 */
			weekSet : function(academicYear, semesterCode, obj) {
				 
				//通过学年学期/所在院系获取排课时间信息
				var reqData = {};
				var department = $("#departmentId").val();
				var schoolWeek = "";
				reqData.academicYear = academicYear;
				reqData.semesterCode = semesterCode;
				reqData.departmentId = department;
				
				ajaxData.request(URL_COURSEPLAN.PARAMETER_TIME_GETITEM,reqData,function(data){
					if(data.code == config.RSP_SUCCESS&&data.data){
						//向弹框传参
						schoolWeek = data.data.schoolWeek;
						
						//从列表获取对象
						var startclassPlanIds = $(obj).attr("startclassPlanIds"); // 获取this对象的开课计划Id集合
							courseId = $(obj).attr("courseId"); // 获取this对象的开课计划Id
						     practiceNumber = $(obj).parent().parent().find('td').eq(4).text(),// 获取环节号
							practiceName = $(obj).parent().parent().find('td').eq(5).text(),// 获取环节名称
							practiceStyle = $(obj).parent().parent().find('td').eq(6).text(),// 获取环节类别
							score = $(obj).parent().parent().find('td').eq(8).text()// 获取学分
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
							data.isDepartmentfilter = true;
							
							popup.setData("data", data);
							popup.open(base+'/courseplan/practice/task/html/weekset.html' ,// 这里是页面的路径地址
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
									
									if(!setInitTask.validate()){
										//判断验证提醒
										errormsg = setInitTask.errormsg;
										
										if(utils.isNotEmpty(errormsg.content)){
											 popup.errPop(errormsg.content);
										}else{
											
											if(utils.isEmpty(errormsg.content1)){
												errormsg.content1="";
											}
											if(utils.isEmpty(errormsg.content2)){
												errormsg.content2="";
											}
											if(utils.isEmpty(errormsg.content3)){
												errormsg.content3="";
											}
											if(utils.isEmpty(errormsg.content4)){
												errormsg.content4="";
											}
											 errNote =  errormsg.content1+errormsg.content2+errormsg.content3+errormsg.content4;
											 errNote = errNote.substring(0, errNote.length-1);
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
												gradeProfessionList.pagination.loadData();
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
       
	
	module.exports = gradeProfessionList; //根文件夹名称一致
	window.gradeProfessionList = gradeProfessionList;    //根据文件夹名称一致
});