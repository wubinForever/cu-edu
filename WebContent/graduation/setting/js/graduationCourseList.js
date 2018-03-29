define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//url
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var CONSTANT = require("basePath/config/data.constant");


// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var graduateTypeEnum = require("basePath/enumeration/graduation/GraduateType");
	var auditResultEnum = require("basePath/enumeration/graduation/AuditResult");
	var auditRejectReasonEnum = require("basePath/enumeration/graduation/AuditRejectReason");
	var graduateStatusEnum = require("basePath/enumeration/graduation/GraduateStatus");
	var isEnabled = require("basePath/enumeration/common/IsEnabled");//状态枚举
	var archievesStatus = require("basePath/enumeration/studentarchives/ArchievesStatus");//学籍状态枚举
	var dataDictionary = require("basePath/config/data.dictionary");
	
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选

	// 下拉框
	var select = require("basePath/module/select");//模糊搜索
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var base = config.base;
  
	// 变量名跟文件名称一致
	var graduationCourseList = {
		init : function() {
			// 加载属性
        	ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
        		//if(data.code == config.RSP_SUCCESS)
        		{
        			// 毕业年届
	   				$("#graduateYear").val(data.graduateYear);
	   				graduationCourseList.graduateYear = data.graduateYear;
					var param = {
						graduateYear : data.graduateYear,
						isAuthority : false
					};
	   			    // 院系
					simpleSelect.loadSelect("departmentId", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEDEPARTMENTLIST,
						param, {
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "-1",
							async: false
						});
					graduationCourseList.pagination = new pagination({
						url : URL_GRADUATION.GRAD_COURSESCORESET_GETLISTBYDEPARTMENT
					}, function(data) {
						if (data.length>0) {
							for (var i = 0; i < data.length; i++){
								data[i].index = i+1;
							}
							$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
							$("#pagination").show();
						} else {
							$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
							$("#pagination").hide();
						}
						//取消全选
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					});
					var param=utils.getQueryParamsByFormId("queryForm");
					graduationCourseList.pagination.setParam(param);
					// 查询
					$("#query").on("click", function() {
						ajaxData.setContentType("application/x-www-form-urlencoded");
						ajaxData.contructor(true);
						//保存查询条件
						var param=utils.getQueryParamsByFormId("queryForm");
						graduationCourseList.pagination.setParam(param);
					});
					// 设置
					$(document).on("click", "button[name='set']", function() {
						graduationCourseList.set($(this));
					});
        		}
   			},false);
		},
		graduateYear:null,
        // 设置毕业学分要求
	    set:function(obj){
	      	popup.setData('graduateYear',graduationCourseList.graduateYear);
	      	popup.setData('grade',$(obj).attr("grade"));
	      	popup.setData('majorId',$(obj).attr("majorId"));
	      	popup.setData('majorName',$(obj).attr("majorName"));
	      	popup.setData('departmentId',$(obj).attr("departmentId"));
	      	popup.setData('departmentName',$(obj).attr("departmentName"));
			popup.open('./graduation/setting/html/setCourseRequire.html', // 这里是页面的路径地址
				{
					id : 'setCourseRequire',// 唯一标识
					title : '毕业课程成绩要求',// 这是标题
					width : 1240,// 这是弹窗宽度。其实可以不写
					height : 470,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var courseScoreSetDtoList = [];
						var data = iframe.setCourseRequire.shuff.getData();
						if(data.length == 0){
							courseScoreSetDtoList.push({courseId:null,
								scoreRequire:null,
								grade : iframe.$("#grade").val(),
								graduateYear:iframe.$("#graduateYear").val(),
								departmentId : iframe.$("#departmentId").val(),
								majorId:iframe.$("#majorId").val()
								});
						}
						for (var k = 0, length = data.length; k < length; k++) {
							courseScoreSetDtoList.push({courseId:data[k].courseId,
								scoreRequire:data[k].scoreRequire,
								grade : iframe.$("#grade").val(),
								graduateYear:iframe.$("#graduateYear").val(),
								departmentId : iframe.$("#departmentId").val(),
								majorId:iframe.$("#majorId").val()
								});
						}
						ajaxData.contructor(false);
						ajaxData.setContentType("application/json;charset=utf-8");
						var param = JSON.stringify(courseScoreSetDtoList);
						ajaxData.request(URL_GRADUATION.GRAD_COURSESCORESET_UPDATEBYMAJOR, param, function(data) {
							if(data.code==config.RSP_SUCCESS){
								ajaxData.setContentType("application/x-www-form-urlencoded");
								ajaxData.contructor(true);
								graduationCourseList.pagination.loadData();
								popup.okPop("保存成功！<br/>如需应用最新设置，需要重新审核。", function() {});
							}
						},false);
						return true;

					},
					cancel : function() {
						// 取消逻辑
					}
			});
	    }
	}
	
	module.exports = graduationCourseList; // 根据文件名称一致
	window.graduationCourseList = graduationCourseList; // 根据文件名称一致
	
});