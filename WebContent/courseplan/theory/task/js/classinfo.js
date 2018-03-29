/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var config = require("basePath/utils/config");
	require("basePath/utils/common");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	
	//下拉框
	var simpleSelect = require("basePath/module/select.simple");
	//工具
	var popup = require("basePath/utils/popup");
	var ajaxData = require("basePath/utils/ajaxData");
	var shuffling = require("basePath/utils/shuffling");
	
	/**
	 * 开课计划对应的理论任务信息
	 */
	var classinfo = {
		/**
		 * 绑定数据
		 */
		init : function(){
			this.academicYear = popup.getData("academicYear");
			this.semesterCode = popup.getData("semesterCode");
			this.theoretical = popup.getData("theoretical");
			this.loadGrade();
			 $("#department,#grade").change(function(){
				 classinfo.loadMajor();
			 });
			 this.loadDepartment();
			 this.loadMajor();
			 this.initShuffing();
			$("#searchBtn").click(function(){
				classinfo.shuff.loadData(classinfo.getParam());
			});
		},

		/**
		 * 加载年级
		 */
		loadGrade : function(){
			var data = popup.getData("classData");
			var theoreticalIdList =  popup.getData("theoreticalIdList");
			var param = {};
			var me = this;
			param.courseId = this.theoretical.courseId;
			param.academicYear = this.academicYear;
			param.semesterCode = this.semesterCode;
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETGRADE, JSON.stringify(param),function(data) {
				if(data.code == config.RSP_SUCCESS){
					var list = [];
					$.each(data.data, function(i, item){
						list.push({name: item.grade+"", value:item.grade});
					});
					simpleSelect.installOption($("#grade"), list, "-1", "全部","-1" );
					
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		/**
		 * 加载院系
		 */
		loadDepartment : function(){
			var data = popup.getData("classData");
			var theoreticalIdList =  popup.getData("theoreticalIdList");
	 
			var param = {};
			var me = this;
			param.academicYear = this.academicYear;
			param.semesterCode = this.semesterCode;
			param.courseId = this.theoretical.courseId;
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),function(data) {
				if(data.code == config.RSP_SUCCESS){
					var list = [];
					$.each(data.data, function(i, item){
						list.push({name: item.departmentName, value:item.departmentId});
					});
					simpleSelect.installOption($("#department"), list, "-1", "全部","-1" );
					
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		/**
		 *  加载专业
		 */
		loadMajor : function(departmentId){
			var data = popup.getData("classData");
			var param = {};
			param.departmentId = $("#department").val();
			param.academicYear = this.academicYear;
			param.semesterCode = this.semesterCode;
			param.courseId = this.theoretical.courseId;
			param.grade = $("#grade").val();
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param),function(data) {
				if(data.code == config.RSP_SUCCESS){
					var list = [];
					$.each(data.data, function(i, item){
						list.push({name: item.majorName, value:item.majorId});
					});
					simpleSelect.installOption($("#major"), list, "-1", "全部","-1" );
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		/**
		 * 初始化左右切换
		 */
		initShuffing : function(){
			var idList =  popup.getData("classIdList");
			var data = popup.getData("classData");
			this.idList = idList;
			var theoreticalIdList =  popup.getData("theoreticalIdList");
			if(data && data.data && data.data.id){
				theoreticalIdList.push(data.data.id);
			}
			this.theoreticalIdList = theoreticalIdList;
			var theoretical = popup.getData("theoretical");
			var shuff = new shuffling({
				left:[{name:"年级", field:"grade",
					   widthStyle:"width48" },
				      {name:"院系", field:"departmentName",rigthLeftStyle:"text-l"},
				      {name:"专业", field:"majorName",rigthLeftStyle:"text-l"},
				      {name:"班级", field:"className",rigthLeftStyle:"text-l"},
				      {name:"班级人数", field:"studentCount",
						   widthStyle:"width48"},
				      { field:"classId",unique:true,show:false}],
				url:URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETCLASS,
				selectedData:data.list,
				selectedCanRemove:true,
				param:{
					courseId:theoretical.courseId,
					majorIdList:theoretical.majorId.split(","),
					startclassPlanIdList:theoretical.startclassPanId.split(","),
					unClassIdList : idList,
					theoreticalIdList : theoreticalIdList,
					academicYear:this.academicYear,
					semesterCode:this.semesterCode
					 
					 
				},
				json:true
			}).init();
			popup.setData("shuff", shuff);
			classinfo.shuff = shuff;
		},
		/**
		 * 获取参数
		 */
		getParam : function(){
			var param = {};
			param.grade = $("#grade").val();
			param.departmentId = $("#department").val();
			param.className = $("#className").val();
			param.classArea = $("#classArea").val();
			param.majorId = $("#major").val();
			if($("#major option").length > 1){
				param.majorId = $("#major").val();
			}else{
				param.majorId = "-2";
			}
			var theoretical = popup.getData("theoretical");
			param.courseId = theoretical.courseId;
			param.majorIdList = theoretical.majorId.split(",");
			param.startclassPlanIdList = theoretical.startclassPanId.split(",");
			param.academicYear = this.academicYear;
			param.semesterCode = this.semesterCode;
			param.unClassIdList = this.idList;
			param.theoreticalIdList = this.theoreticalIdList;
			!param.grade && delete param.grade;
			!param.department && delete param.department;
			!param.className && delete param.className;
			!param.classArea && delete param.classArea;
			!param.majorId && delete param.majorId;
			return param;
		}
	}
	module.exports = classinfo;  
});