/**
 * 环节教师设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");
	var timeNotice = require("../../../common/js/timeNotice");

	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var URL = require("basePath/config/url.udf");
	var URLDATA = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var dataDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	// 选择教师弹窗
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	var base = config.base;
	// 变量名跟文件夹名称一致
	var linkTeacher = {
		/*
		 * 初始化
		 */
		init : function() {
			//判断当前时间是否能进入
			regData ={};
			regData.enterPage = ScheduleSettingsEnterPage.PracticeTask.value;
			timeNotice.init(regData);
			
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			linkTeacher.semester = semester;

			// 绑定开课单位下拉框
			simpleSelect.loadAuthStartClass("departmentId", {isAuthority : true}, null,constant.SELECT_ALL, "");

			// 绑定环节大类下拉框
			simpleSelect.loadDictionarySelect("tacheTypeCode", dataDictionary.TACHE_TYPE_CODE, {
				firstText : constant.SELECT_ALL,
				firstValue : ""
			});
			
			//加载列表
			linkTeacher.initPagination();
			openMessage.message(".open-message", "指导教师");
			
			// 查询
			$("button[name='query']").on('click', function() {
				// 保存查询条件
				linkTeacher.pagination.setParam(linkTeacher.getQueryParams());
			});
			
			//环节教师设置-教师选择
			$(document).on("click", "[name='update']", function() {
				linkTeacher.chooseTeacher(this);	
			});

		},
		/*
		 * 初始化列表
		 */
		initPagination : function(){
			this.pagination = new pagination({
				id : "pagination",
				url : URL_COURSEPLAN.PRACTICE_LINKTEACHER_GETPAGELIST,
				param : this.getQueryParams()
			}, function(data) {
				if (data.length > 0) {
					$.each(data, function(i, item){
						if(item.teachers){
							item.teachers = item.teachers.split(",");
						}
					});
					$("#tbodycontent").empty().append($("#treetableTmpl").tmpl(data)).removeClass("no-data-html");
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
		 * @returns 查询条件
		 */
		getQueryParams:function(){
			var param = {};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.departmentId = $("#departmentId").val();
			param.courseNoOrName = $("#courseNoOrName").val();
			param.tacheTypeCode = $("#tacheTypeCode").val();
			param.setState = $("#setState").val();
			return param;
		},
		/**
		 * 加载老师数据
		 */
		loadTeacher : function(param, callback){
			ajaxData.request(URL_COURSEPLAN.PRACTICE_LINKTEACHER_GETLIST,param,function(data){
				if(data.code == config.RSP_SUCCESS){
					callback(data.data);
				}else{
					popup.errPop("加载数据失败：" + data.msg);
				}
			});
		},
		/**
		 * 格式化老师数据
		 * ids 老师编号数组
		 */
		formatTeacher : function(ids, callback){
			var param = {};
			param.teacherIds = ids;
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.COMMON_TEACHERINFO_GETLIST,JSON.stringify(param),function(data){
				if(data.code == config.RSP_SUCCESS){
					callback(data.data);
				}else{
					popup.errPop("加载数据失败：" + data.msg);
				}
			});
		},
		/**
		 * 选择老师
		 */
		chooseTeacher : function(obj){
			var _ = $(obj), me = this;
			var param = {};
			param.academicYear = _.attr("data-tt-academicyear");
			param.semesterCode = _.attr("data-tt-semestercode");
			param.courseId = _.attr("data-tt-courseid");
			this.param = param;
			this.loadTeacher(param, function(data){
				var popData = [];
				if(data && data.length > 0){
					var ids = [];
					$.each(data, function(i, item){
						ids.push(item.teacherId);
					});
					me.formatTeacher(ids, function(teacherData){
						$.each(teacherData, function(n, bean){
							$.each(data, function(m, _item){
								if(bean.id == _item.teacherId && _item.teacherType == "1"){
									bean.selectedCanRemove = false;
								}
							});
							popData.push(bean);
						});
						me.popTeacher(popData);
					});
				}else{
					me.popTeacher(popData);
				}
			 
			});
		},
		/**
		 * 加载老师弹窗
		 */
		popTeacher : function(data){
			var me = this;
			teacher.chooseTeacher(data, function(teachers, teacherPopup){
				me.teacherPopup = teacherPopup;
				return me.saveTeacher(teachers);
			});
		},
		/**
		 * 保存老师
		 */
		saveTeacher : function(teachers){
			var me  = this;
			
				var ids = [];
				var flag = true;
				if(teachers && teachers.length > 0){
					$.each(teachers, function(i, item){
						if(i>=100){
							popup.warPop("最多为环节添加100个老师！");
							flag = false;
							return false;
						}else{
							ids.push(item.id);
						}
					});
				}
				if(flag){
					var param = $.extend({}, this.param);
					param.teachers = ids.join(",");
					ajaxData.setContentType("application/x-www-form-urlencoded");
					ajaxData.request(URL_COURSEPLAN.PRACTICE_LINKTEACHER_ADD, param, function(data){
						if(data.code == config.RSP_SUCCESS){
							me.teacherPopup.close();
							popup.okPop("设置成功");
							linkTeacher.pagination.loadData();
						}else{
							popup.errPop("加载数据失败：" + data.msg);
						}
					});
				}
			return false;
		}
	}

	module.exports = linkTeacher; // 根文件夹名称一致
	window.linkTeacher = linkTeacher; // 根据文件夹名称一致
});