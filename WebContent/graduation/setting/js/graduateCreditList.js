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
	var graduateCreditList = {
		init : function() {
			// 加载属性
        	ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
        		//if(data.code == config.RSP_SUCCESS)
        		{
        			$("#graduateYear").val(data.graduateYear);
	   				graduateCreditList.graduateYear = data.graduateYear;
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
					graduateCreditList.pagination = new pagination({
						url : URL_GRADUATION.GRAD_CREDITSET_GETLISTBYDEPARTMENT
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
					graduateCreditList.pagination.setParam(param);
					// 查询
					$("#query").on("click", function() {
						ajaxData.setContentType("application/x-www-form-urlencoded");
						ajaxData.contructor(true);
						//保存查询条件
						var param=utils.getQueryParamsByFormId("queryForm");
						graduateCreditList.pagination.setParam(param);
					});
					// 设置
					$(document).on("click", "button[name='set']", function() {
						graduateCreditList.set($(this));
					});
        		}
   			},false);
   			//graduateCreditList.validation();
		},
		graduateYear:null,
        // 设置毕业学分要求
	    set:function(obj){
	      	popup.setData('graduateYear',graduateCreditList.graduateYear);
	      	popup.setData('grade',$(obj).attr("grade"));
	      	popup.setData('majorId',$(obj).attr("majorId"));
	      	popup.setData('majorName',$(obj).attr("majorName"));
	      	popup.setData('departmentId',$(obj).attr("departmentId"));
			var popSetRequire = popup.open('./graduation/setting/html/setCreditsRequire.html', // 这里是页面的路径地址
				{
					id : 'setCreditsRequire',// 唯一标识
					title : '毕业学分要求',// 这是标题
					width : 800,// 这是弹窗宽度。其实可以不写
					height : 620,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						iframe.$.validator.addMethod("scoreFormat1",function(value, element) {
							var fax=/^\d{1,2}(\.\d{1})?$/;
							return this.optional(element)|| (fax.test(value));
						}, "学分由正数组成，可有1位小数");// 可以自定义默认提示信息
						var message = {
											required:"请输入要求学分",
											min:$.validator.format( "请输入大于等于{0}的值" )
									};
						var require = {
											required:true,
											min:0,
											scoreFormat1:true
									};
						var rules={};
						var messages = {};
						for(var i = 0; i < iframe.$(".credit-require").length; i++){
							rules[iframe.$(".credit-require")[i].name] = require;
							messages[iframe.$(".credit-require")[i].name]=message;
						}
						iframe.$("#setCredit").validate(
								{
									rules : rules,
									messages : messages 
								});
						var v = iframe.$("#setCredit").valid();// 验证表单
						if(v){
							var opened = Number(iframe.$("#CreditOpenTotal").html());
							var required = Number(iframe.$("#requireCreditTotal").val());
							var ret = true;
							if(opened < required){
								ret = popup.askPop("毕业学分要求总学分大于开设总学分，是否继续保存？",function(){
									var creditSetDtoList = [];
									iframe.$(".credit-require").each(function(){
										creditSetDtoList.push({requireCredit:$(this).val(),creditSetId:$(this).attr("data-id")});
									});
									ajaxData.contructor(false);
									ajaxData.setContentType("application/json;charset=utf-8");
									var param = JSON.stringify(creditSetDtoList);
									ajaxData.request(URL_GRADUATION.GRAD_CREDITSET_UPDATEBYMAJOR, param, function(data) {
										if(data.code==config.RSP_SUCCESS){
											ajaxData.setContentType("application/x-www-form-urlencoded");
											ajaxData.contructor(true);
											graduateCreditList.pagination.loadData();
											popSetRequire.close();
											popup.okPop("保存成功！<br/>如需应用最新设置，需要重新审核。", function() {});
										}
									},false);
								})
							}else{
								var creditSetDtoList = [];
								iframe.$(".credit-require").each(function(){
									creditSetDtoList.push({requireCredit:$(this).val(),creditSetId:$(this).attr("data-id")});
								});
								ajaxData.contructor(false);
								ajaxData.setContentType("application/json;charset=utf-8");
								var param = JSON.stringify(creditSetDtoList);
								ajaxData.request(URL_GRADUATION.GRAD_CREDITSET_UPDATEBYMAJOR, param, function(data) {
									if(data.code==config.RSP_SUCCESS){
										ajaxData.setContentType("application/x-www-form-urlencoded");
										ajaxData.contructor(true);
										graduateCreditList.pagination.loadData();
										popup.okPop("保存成功！<br/>如需应用最新设置，需要重新审核。", function() {});
									}
								},false);
								return true;
							}
							return false;
						}else{
							// 表单验证不通过
							return false;
						}

					},
					cancel : function() {
						// 取消逻辑
					}
			});
	   },
	   /**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			
			/*$("#setCredit").validate(
					{
						rules : {
							ct:{
								creditFormat:true,
								required:true
							}
						},
						messages : {
							ct:{
								creditFormat:"请输入有效学分",
								required:"请输入学分"
							}
						},
						// 定义公用的错误提示内容，暂时保留
						errorPlacement : function(error, element) {
							var parent = $(element).parent("div.tips-text")
									.html(error);
						},
						onchange : function(ele) {
							$(ele).valid();
						},
						onfocusout : function(ele) {
							$(ele).valid();
						}
					})*/
		},
	}
	
	module.exports = graduateCreditList; // 根据文件名称一致
	window.graduateCreditList = graduateCreditList; // 根据文件名称一致
	
});