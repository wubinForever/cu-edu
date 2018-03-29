/**
 * 课程信息
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.trainplan");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");
	var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
	var isEnabled=require("basePath/enumeration/common/IsEnabled");
	var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var base  =config.base;
	
	/**
	 * 课程信息
	 */
	var course = {
		/** ******************* list初始化 开始 ******************* */
		init : function() {			
			// 绑定开课单位下拉框（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, null,{firstText:"全部",firstValue:""});
			// 绑定课程大类下拉框（从数据字典获取数据）
			simpleSelect.loadDictionarySelect("bigCourseCode",dataDictionary.COURSE_BIG_CATEGORY,{firstText:"全部",firstValue:""});
			// 绑定是否启用下拉框（从枚举获取数据）
			simpleSelect.loadEnumSelect("enableStatus",isEnabled,{defaultValue:-1, firstText:"全部",firstValue:-1});

			//初始化列表数据
			course.pagination = new pagination({
				id: "pagination", 
				url: url.COURSE_GET_PAGED_LIST, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){				
				$("#pagination").show();				 
				 if(data && data.length>0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//取消全选
			}).init();
			
			// 新增
			$('#addCourse').click(function() {
				course.addCourse();
			});
			
			// 删除
			$(document).on("click", "[name='deleteCourse']", function() {
				course.singleDeleteCourse(this);
			});
			
			// 批量删除
			$('#batchDeleteCourse').click(function() {
				course.batchDeleteCourse();
			});	
			
			// 修改
			$(document).on("click", "[name='editCourse']", function() {
				course.editCourse(this);
			});
			
			// 查询
			$('#query').click(function() {
				course.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});	
			
			// 启用
			$(document).on("click", "button[name='enable']", function() {
				course.singleEnable(this);
			});
			
			// 禁用
			$('#forbid').click(function() {
				course.batchForbid();
			});	
			
			// 导入
			$('#importCourse').click(function() {
				new importUtils({
					title : "课程信息导入",
					uploadUrl : url.COURSE_IMPORT_FILE,
					exportFailUrl : url.COURSE_EXPORT_FAIL_MESSAGE,
					templateUrl : url.COURSE_EXPORT_TEMPLATE,
					data:[{name:"课程号",field:"courseNo"},{name:"课程名称",field:"name"},{name:"导入失败原因",field:"message"}],
					ok:function(){
						course.pagination.loadData();
					}
				}).init();
			});
			
			// 导出
			$('#exportCourse').click(function() {
				ajaxData.exportFile(url.COURSE_EXPORT, course.pagination.option.param);
			});	
		},
		/** ******************* list初始化 结束 ******************* */

		/** ******************* add初始化 开始 ******************* */
		addInit : function() {			
			// 获取url参数
			var courseId = utils.getUrlParam('courseId');
			//加载课程信息
			course.loadItem(courseId);						
			//只允许输入数字
			 $("input[myattr='period']").on('keydown',function(e){
               if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8){               	
	            }else{
                   return false;
               }
	         });
			 //学分屏蔽前面的0
			 $("#credit").on("blur",function(){
				 course.setEffectiveDigit($(this));
			 });			
			//给Text绑定onBlur事件 
			$(document).on("blur", "input[myattr='period']", function() {
				course.setEffectiveDigit($(this));
				course.calculationTotalPeriod();
			});
			//给数字控件绑定click事件 
			$(".mybutton").click(function(){
				course.calculationTotalPeriod();
			});
			
			new limit($("#courseSummary"),$("#courseSummaryCount"),1000);
			//初始化表单校验
			course.initFormDataValidate($("#addForm"));			
		},
		/** ******************* add初始化 结束 ******************* */
		
		/**
		 * 新增
		 */
		addCourse: function(){		
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/courseResource/course/html/add.html', // 这里是页面的路径地址
				{
					id : 'addCourse',// 唯一标识
					title : '课程信息新增',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#addForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数
							saveParams["courseOrTache"]=vCourseOrTache.Course.value; // 课程信息
							ajaxData.request(url.COURSE_ADD, saveParams, function(data) {				
								if (data.code == config.RSP_SUCCESS) {
									myDialog.close();//关闭弹窗									
									popup.okPop("保存成功", function() {
										course.pagination.loadData(); // 刷新列表
									}); // 提示成功	
								} else {
									// 提示失败
									popup.errPop(data.msg);
								}								
							});						
						} 
						return false; // 阻止弹窗关闭
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							myDialog.close();
						});
						return false;
					}}]
				});
		},

		/**
		 * 初始化新增、编辑表单校验
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			ve.validateEx();
			formJQueryObj.validate({
				rules : {
					courseNo : {
						"required" : true,
						maxlength : 20
					},
					name : {
						"required" : true,
						maxlength : 50
					},
					engLishName : {
						maxlength : 100
					},
					credit: {
						"required" : true,
						"creditFormat":true
					},
					theoryPeriod:{
						"periodFormat":true,
						min:0,
						max:99
					},
					experiPeriod:{
						"periodFormat":true,
						min:0,
						max:99
					},
					practicePeriod:{
						"periodFormat":true,
						min:0,
						max:99
					},
					otherPeriod:{
						"periodFormat":true,
						min:0,
						max:99
					},
					totalPeriod:{ //理论学时、实验学时、实践学时、其他学时必选填写一个
						"required" : true,
						digits:true,
						min:1
					},
					departmentId:{
						"required" : true,
					},
					bigCourseCode:{
						"required" : true,
					},
					checkWayCode:{
						"required" : true,
					},
					enableStatus:{
						"required" : true,
					},
					courseTypeCode:{
						"required" : true,
					},
					courseAttributeCode:{
						"required" : true,
					}					
				},
				messages : {
					courseNo : {
						"required" : '课程号不能为空',
						maxlength : '课程号不能超过20个字符'
					},
					name : {
						"required" : '课程名称不能为空',
						maxlength : '课程名称不能超过50个字符'
					},
					engLishName : {
						maxlength : '英文名称不能超过100个字符'
					},
					credit : {
						"required" : '学分不能为空'
					},
					theoryPeriod:{
						"periodFormat":"理论学时由1-2位非负整数组成",
						min:'理论学时由1-2位非负整数组成',
						max:'理论学时由1-2位非负整数组成'
					},
					experiPeriod:{
						"periodFormat":"实验学时由1-2位非负整数组成",
						min:'实验学时由1-2位非负整数组成',
						max:'实验学时由1-2位非负整数组成'
					},
					practicePeriod:{
						"periodFormat":"实践学时由1-2位非负整数组成",
						min:'实践学时由1-2位非负整数组成',
						max:'实践学时由1-2位非负整数组成'
					},
					otherPeriod:{
						"periodFormat":"其他学时由1-2位非负整数组成",
						min:'其他学时由1-2位非负整数组成',
						max:'其他学时由1-2位非负整数组成'
					},
					totalPeriod:{ //理论学时、实验学时、实践学时、其他学时必选填写一个
						"required" : '总学时不能为空',
						digits:'总学时只能为正整数',
						min:'总学时只能为正整数'
					},
					departmentId:{
						"required" : '开课单位不能为空',
					},
					bigCourseCode:{
						"required" : '课程大类不能为空',
					},
					checkWayCode:{
						"required" : '考核方式不能为空',
					},
					enableStatus:{
						"required" : '状态不能为空',
					},
					courseTypeCode:{
						"required" : '课程类别不能为空',
					},
					courseAttributeCode:{
						"required" : '课程属性不能为空',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
			
			// 课程号重复性校验，如果不是需要访问后台代码的公共性校验放到validateExtend.js文件里去
			jQuery.validator.addMethod("courseNoRepeatVerify", function(value,element) {
				return false;	
			}, "课程号已经存在");
			
			// 课程号重复验证
			$(document).on("change","#courseNo",function() {
				var courseNo = $.trim($(this).val());
				var courseId = $("#courseId").val();
				if (utils.isNotEmpty(courseNo)) {
					var param = {
						courseNo : courseNo,
						courseId : courseId
					};
					ajaxData.contructor(false);
					ajaxData.request(url.COURSE_IS_COURSENO_EXIST,param,function(data) {
						if (data.code == config.RSP_SUCCESS) {					
							if(data.data){
								$("#courseNo").rules("add",	{"courseNoRepeatVerify" : true,	messages : {"courseNoRepeatVerify" : "课程号不能重复"}});
							}else{
								$("#courseNo").rules("remove","courseNoRepeatVerify");
							}
						} else {
							// 提示失败
							popup.errPop(data.msg);
							return false;
						}							
					});
				}
			});			
		},	
		
		//计算总学时
		calculationTotalPeriod:function(){
			var totalPeriod=0;
			$("input[myattr='period']").each(function(index,item){
				var val=$(this).val();
				if(val){
					totalPeriod+=(parseInt(val));
				}			 
			});
			$("#totalPeriod").val(totalPeriod);
		},
		
		/**
		 * 设置成有效的数据，去掉数字前面多余的0
		 * @param id
		 */
		setEffectiveDigit:function(obj){ 
			var val=obj.val(); 
			var reg=/^\d{1,2}(\.\d{1,2})?$/;
			if(reg.test(val)){
				reg = /^(0[0-9])/;
				if(reg.test(val)){
					obj.val(val.replace("0",""));
				}	
			}			 				
		},
		
		/**
		 * 单个删除课程信息
		 */
		singleDeleteCourse : function(obj) {
			var courseId = $(obj).attr("data-tt-id");// 获取this对象的属性
			var ids=[];
			ids.push(courseId);
			course.deleteCourse(ids);
		},
		
		/**
		 * 批量删除课程信息
		 */
		batchDeleteCourse : function() {
			var hasRelated=false; //是否有关联记录标识
			var ids=[];
			$("tbody input[type='checkbox']:checked").each(function(){
				var obj=$(this).parent().find("input[name='checNormal']");
				ids.push(obj.val());
				var relatedNum=obj.attr("relatedNum"); //关联记录数
				if(parseInt(relatedNum)>0){
					hasRelated=true;
				}				
			});
			if(hasRelated){
				popup.warPop("勾选的记录中有关联数据，不能删除，请重新勾选");
				return false;
			}
			if (ids.length==0){
				popup.warPop("请勾选要删除的课程信息");
				return false;
			}
			course.deleteCourse(ids);
		},
		
		/**
		 * 删除课程信息
		 */
		deleteCourse : function(ids) {
			// 参数
			var param = {"ids" : ids};
			popup.askDeletePop("课程信息", function() {
				ajaxData.request(url.COURSE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {					
						// 提示成功
						popup.okPop("删除成功", function() {
							// 刷新列表
							course.pagination.loadData();
						});	
						
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}					
				});
				
			});
		},
		
		/**
		 * 根据主键加载课程信息
		 */
		loadItem:function(courseId){
			// 加载属性
			ajaxData.request(url.COURSE_GET_ITEM, {id:courseId}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					var rvData = data.data;						
					utils.setForm($("#addForm"),rvData); // 表单自动绑定
					if(rvData.relatedNum>0){ //存在关联数据，学分不可修改
						$("#credit").attr("readonly","readonly");
					}
					simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT,null,{defaultValue:rvData.departmentId}); // 绑定开课单位下拉框
					simpleSelect.loadDictionarySelect("bigCourseCode",dataDictionary.COURSE_BIG_CATEGORY,{defaultValue:rvData.bigCourseCode});	// 绑定课程大类下拉框 								
					simpleSelect.loadEnumSelect("enableStatus",isEnabled, {defaultValue:rvData.enableStatus}); // 绑定是否启用下拉框					
					simpleSelect.loadDictionarySelect("checkWayCode",dataDictionary.CHECK_WAY_CODE,{defaultValue:rvData.checkWayCode}); // 绑定考核方式下拉框					
					simpleSelect.loadDictionarySelect("courseTypeCode",dataDictionary.COURSE_TYPE_CODE,{defaultValue:rvData.courseTypeCode}); // 绑定课程类别下拉框					
					simpleSelect.loadDictionarySelect("courseAttributeCode",dataDictionary.COURSE_ATTRIBUTE_CODE,{defaultValue:rvData.courseAttributeCode}); // 绑定课程属性下拉框					
					new limit($("#courseSummary"), $("#courseSummaryCount"), 1000);
				}
			});
		},
		
		/**
		 * 修改
		 */
		editCourse: function(obj){	
			var courseId = $(obj).attr("data-tt-id");// 获取this对象的属性
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/courseResource/course/html/add.html?courseId=' + courseId,
				{
					id : 'editCourse',// 唯一标识
					title : '课程信息修改',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#addForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数
							saveParams["courseOrTache"]=vCourseOrTache.Course.value; // 课程信息
							ajaxData.request(url.COURSE_UPDATE, saveParams, function(data) {				
								if (data.code == config.RSP_SUCCESS) {	
									myDialog.close(); //关闭弹窗									
																
									popup.okPop("保存成功", function() {
										course.pagination.loadData();// 刷新列表		
									});// 提示成功									
								} else {
									// 提示失败
									popup.errPop(data.msg);
								}				
							});	
						} 			
						return false;	
					},focus:true},{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							myDialog.close();
						});
						return false;
					}}]
				});
		},		
			
		/**
		 * 批量禁用课程信息
		 */
		batchForbid : function() {
			var ids=[];
			$("tbody input[type='checkbox']:checked").each(function(){
				var obj=$(this).parent().find("input[name='checNormal']");
				ids.push(obj.val());				
			});
			if (ids.length==0){
				popup.warPop("请勾选要禁用的课程信息");
				return false;
			}
			course.updateEnableStatus(ids,isEnabled.Disable.value); 
		},
		
		/**
		 * 单个启用课程信息
		 */
		singleEnable : function(obj) {
			var courseId = $(obj).attr("data-tt-id");// 获取this对象的属性
			var ids=[];
			ids.push(courseId);
			course.updateEnableStatus(ids,isEnabled.Enable.value); 
		},		
		
		/**
		 * 更新启用/禁用状态
		 */
		updateEnableStatus : function(ids,statusFlag) {
			// 参数
			var param = {"ids" : ids,"statusFlag":statusFlag};
			var msg=(statusFlag==isEnabled.Enable.value)?"启用":"禁用";
			popup.askPop("确认"+msg+"所选课程信息吗？", function() {
				ajaxData.request(url.COURSE_UPDATE_ENABLE_STATUS, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {							
						// 提示成功
						popup.okPop((statusFlag==isEnabled.Enable.value)?"启用成功":"禁用成功", function() {							
							// 刷新列表
							course.pagination.loadData();							
						});	
						
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}					
				});
				
			});
		}
	}
	module.exports = course;
	window.course = course;
});
