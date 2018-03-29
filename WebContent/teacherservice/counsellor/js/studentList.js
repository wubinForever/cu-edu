/**
 * 基本信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var url = require("configPath/url.teacherservice");// 教师服务url
	/**
	 * 学生名单
	 */
	var studentList = {			
		/**
		 * 初始化学生名单
		 */
		init : function() {
			 // 年级
			 simpleSelect.loadSelect("gradeSelect",url.TEACHER_GETTEACHERGRADESBYCLASSQUERY,{isAuthority : false},{async:false});
			 var grade = $("#gradeSelect").val();
			 var exportGrade = $("#gradeSelect").val();
			 // 班级
			 simpleSelect.loadSelect("classSelect", url.TEACHER_GETTEACHERCLASSSELECTBYQUERY, {grade : grade}, {firstText : "全部",firstValue : "",async:false});
	         var exportClass = $("#classSelect").val();
	         //加载学生名单
	         studentList.loadStuentList();
	         // 年级联动班级
			 $("#gradeSelect").change(function(){
	             grade = $("#gradeSelect").val();
	             simpleSelect.loadSelect("classSelect", url.TEACHER_GETTEACHERCLASSSELECTBYQUERY, {grade : grade}, {firstText : "全部",firstValue : "",async:false});
			  });
	        //导出
			$("#export").click(function() {
				var param = {
				grade:exportGrade,
				classId:exportClass,
			   }
				ajaxData.exportFile(url.TEACHER_EXPORTTEACHERSERVICEROLL,param);
			});

			// 查询
			$("#query").click(function() {
				exportGrade = $("#gradeSelect").val();
				exportClass = $("#classSelect").val();
				studentList.loadStuentList();
			});
			
		},
		/**
		 * 加载学生名单
		 */
		loadStuentList : function(){
			var param = {
				grade:$("#gradeSelect").val(),
				classId:$("#classSelect").val(),
			}
		    //初始化列表数据
			ajaxData.request(url.TEACHER_GETTEACHERSERVICEROLLLISTBYPARAMS,param, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var resData = data.data;
					if(resData && resData.length>0) {
					    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData)).removeClass("no-data-html");
					 }else {
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					 }
				}
		 },true)
	   }
    }
	module.exports = studentList;
	window.studentList = studentList;
});
