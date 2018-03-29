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
	var creditType = require("basePath/enumeration/graduation/CreditType");
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
	//var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var shuffling = require("basePath/utils/shuffling");

	// 下拉框
	var select = require("basePath/module/select");//模糊搜索
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var base = config.base;
  
	// 变量名跟文件名称一致
	var setCourseRequire = {
		CREDIT_TYPE:{},
		init : function() {
			$("#graduateYear").val(popup.getData("graduateYear"));
			$("#departmentId").val(popup.getData("departmentId"));
			$("#grade").val(popup.getData("grade"));
			$("#majorId").val(popup.getData("majorId"));
			$("#majorName").val(popup.getData("majorName"));
			$("#departmentName").val(popup.getData("departmentName"));

			// 课程类别
			simpleSelect.loadDataDictionary("courseTypeCode",dataDictionary.COURSE_TYPE_CODE,"",CONSTANT.SELECT_ALL,"");
			// 课程属性
			simpleSelect.loadDataDictionary("courseAttributeCode",dataDictionary.COURSE_ATTRIBUTE_CODE,"",CONSTANT.SELECT_ALL,"");
			
			var param = utils.getQueryParamsByFormId("queryForm");
			param.courseTypeCode = "-1";
			param.courseAttributeCode = "-1";
			param.courseNoOrName = "";
			//加载已有
        	ajaxData.request(URL_GRADUATION.GRAD_COURSESCORESET_GETLISTBYMAJORSETTEDCOURSE, param, function(data) {
        		if(data.code == config.RSP_SUCCESS){
	   				setCourseRequire.initShuffing(data.data);
					$("#query").click(function(){
						setCourseRequire.shuff.loadData(utils.getQueryParamsByFormId("queryForm"));
					});
        		}
   			},false);
		},
 	    // 获取url参数
		getUrlParam : function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return r[2];
			return null;
		},
		/**
		 * 初始化左右切换
		 */
		initShuffing : function(data){
			var param=utils.getQueryParamsByFormId("queryForm");
			var shuff = new shuffling({
				id:"shufflingId",
				left:[{name:"课程号", field:"courseNo" },
				      {name:"课程", field:"courseName"},
				      {name:"课程类别", field:"courseTypeName"},
				      {name:"课程属性", field:"courseAttributeName"},
				      {name:"学分", field:"credit"},
				      { field:"courseId",unique:true,show:false}],
				right:[{name:"课程号", field:"courseNo" },
				      {name:"课程", field:"courseName"},
				      {name:"课程类别", field:"courseTypeName"},
				      {name:"课程属性", field:"courseAttributeName"},
				      {name:"学分", field:"credit"},
				      {name:"要求成绩", field:"scoreRequireStr"},
				      { field:"courseId",unique:true,show:false}],
				url:URL_GRADUATION.GRAD_COURSESCORESET_GETLISTBYMAJORALLCOURSE,
				selectedCanRemove:true,
				param:param,
				selectedData:data,
				json:false,
				moveToRightCustomFunc:setCourseRequire.moveToRightCustomFunc
			}).init();
			
			setCourseRequire.shuff = shuff;
			setCourseRequire.shuff.addButton.unbind("click",null);
			setCourseRequire.shuff.addButton.click(function(){
				setCourseRequire.moveToRightCustomFunc();
			});
		},
		moveToRightCustomFunc : function (obj){
			if(setCourseRequire.shuff.pullLeftTbody.find("input:not([disabled]):checkbox:checked").length>0)
			{
				popup.open('./graduation/setting/html/setScore.html', // 这里是页面的路径地址
				{
					width:650,
					height:150,
					id : 'setScoreWin',// 唯一标识
					title : '要求成绩',// 这是标题
					okVal : '保存',
					cancelVal : '取消',
					ok : function() {
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						iframe.$.validator.addMethod("creditFormat1",function(value, element) {
							var fax=/^\d{1,3}(\.\d{1})?$/;
							return this.optional(element)|| (fax.test(value));
						}, "成绩由1-3位正数组成，可有1位小数");// 可以自定义默认提示信息
						iframe.$("#setScoreForm").validate(
								{
									rules : {
										setScore:{
											required:true,
											min:0,
											creditFormat1:true
										}
									},
									messages : {
										setScore:{
											required:"请输入要求成绩",
											min:$.validator.format( "请输入大于等于{0}的值" ),
											max:$.validator.format( "请输入小于等于{0}的值" )
										}
									}
								});
						var v = iframe.$("#setScoreForm").valid();// 验证表单
						if(v){
							var reqData = utils.getQueryParamsByFormObject(iframe.$("#setScoreForm"));
							setCourseRequire.shuff.pullLeftTbody.find("input:not([disabled]):checkbox:checked").each(function(i, item){
								var key = $(item).val();
								var value = setCourseRequire.shuff.selectMap.get(key);
								value.scoreRequire = reqData.setScore;
								value.scoreRequireStr = parseFloat(reqData.setScore).toFixed(1);
								setCourseRequire.shuff.selectMap.put(key, value);
							});
							setCourseRequire.shuff.moveToRight();
						} else {
							// 表单验证不通过
							return false;
						}			
					},
					cancel : function() {
						// 取消逻辑
					}
				});
			}
		}
	}
	
	module.exports = setCourseRequire; // 根据文件名称一致
	window.setCourseRequire = setCourseRequire; // 根据文件名称一致
	
});