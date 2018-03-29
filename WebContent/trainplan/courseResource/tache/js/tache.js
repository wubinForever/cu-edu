/**
 * 环节信息
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
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var isEnabled=require("basePath/enumeration/common/IsEnabled");
	var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
	var base  =config.base;
	
	/**
	 * 环节信息
	 */
	var tache = {
		/** ******************* list初始化 开始 ******************* */
		init : function() {			
			// 绑定开课单位下拉框（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, null,{firstText:"全部",firstValue:""});
			// 绑定环节类别下拉框（从数据字典获取数据）
			simpleSelect.loadDictionarySelect("tacheTypeCode",dataDictionary.TACHE_TYPE_CODE,{firstText:"全部",firstValue:""});
			// 绑定是否启用下拉框（从枚举获取数据）
			simpleSelect.loadEnumSelect("enableStatus",isEnabled,{defaultValue:-1, firstText:"全部",firstValue:-1});

			//初始化列表数据
			tache.pagination = new pagination({
				id: "pagination", 
				url: url.TACHE_GET_PAGED_LIST, 
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
				tache.addCourse();
			});
			// 删除
			$(document).on("click", "[name='deleteCourse']", function() {
				tache.singleDeleteCourse(this);
			});
			// 批量删除
			$('#batchDeleteCourse').click(function() {
				tache.batchDeleteCourse();
			});			
			// 修改
			$(document).on("click", "[name='editCourse']", function() {
				tache.editCourse(this);
			});
			// 查询
			$('#query').click(function() {
				tache.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});	
			// 启用
			$(document).on("click", "button[name='enable']", function() {
				tache.singleEnable(this);
			});
			// 禁用
			$('#forbid').click(function() {
				tache.batchForbid();
			});				
			// 导入
			$('#importCourse').click(function() {
				tache.forbid(this);
			});				
			// 导出
			$('#exportCourse').click(function() {
				ajaxData.exportFile(url.TACHE_EXPORT, tache.pagination.option.param);
			});	
		},
		/** ******************* list初始化 结束 ******************* */

		/** ******************* add初始化 开始 ******************* */
		addInit : function() {			
			// 获取url参数
			var courseId = utils.getUrlParam('courseId');
			//加载环节信息
			tache.loadItem(courseId);
			
			new limit($("#courseSummary"),$("#courseSummaryCount"),1000);
			//初始化表单校验
			tache.initFormDataValidate($("#addForm"));
			
			$("#credit").on("blur",function(){
				tache.setEffectiveDigit($(this));
			 })
			 
			 $("#weekNum").on("blur",function(){
				tache.setEffectiveDigit($(this));
			 })
			 
			//只允许输入数字
			 $("input[name='weekNum']").on('keydown',function(e){
              if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8 ){
	            }else{
                  return false;
              }
	         });	
			
		},
		/** ******************* add初始化 结束 ******************* */
		
		/** ******************* import初始化 开始 ******************* */
		importInit : function() {
			
		},
		/** ******************* import初始化 结束 ******************* */		

		
		/**
		 * 新增
		 */
		addCourse: function(){		
			////修改弹窗用相对路径，不用绝对路径 20171228 Amos([art.dialog.open(base+'] ->[popup.open('.])
			var myDialog= popup.open('./trainplan/courseResource/tache/html/add.html', // 这里是页面的路径地址
				{
					id : 'addCourse',// 唯一标识
					title : '环节信息新增',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 500,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#addForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数	
							saveParams["courseOrTache"]=vCourseOrTache.Tache.value; // 环节信息
							ajaxData.request(url.TACHE_ADD, saveParams, function(data) {				
								if (data.code == config.RSP_SUCCESS) {
									myDialog.close();//关闭弹窗										
									// 刷新列表
									tache.pagination.loadData();
									// 提示成功
									popup.okPop("保存成功", function() {});
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
//					okVal : '保存',
//					cancelVal : '取消',
//					ok : function(iframeObj) { //保存
//						var v = iframeObj.$("#addForm").valid(); // 验证表单						
//						if (v) { // 表单验证通过
//							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数	
//							saveParams["courseOrTache"]=vCourseOrTache.Tache.value; // 环节信息
//							ajaxData.request(url.TACHE_ADD, saveParams, function(data) {				
//								if (data.code == config.RSP_SUCCESS) {
//									myDialog.close();//关闭弹窗										
//									// 刷新列表
//									tache.pagination.loadData();
//									// 提示成功
//									popup.okPop("保存成功", function() {});
//								} else {
//									// 提示失败
//									popup.errPop(data.msg);
//								}				
//							});	
//						} 
//						return false;					
//					},
//					cancel : function() { //取消
//						
//					}
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
					weekNum:{
						"required" : true,
						"periodFormat":true,
						min:0,
						max:99
					},
					departmentId:{
						"required" : true,
					},
					tacheTypeCode:{
						"required" : true,
					},
					checkWayCode:{
						"required" : true,
					},
					enableStatus:{
						"required" : true,
					}
				},
				messages : {
					courseNo : {
						"required" : '环节号不能为空',
						maxlength : '环节号不能超过20个字符'
					},
					name : {
						"required" : '环节名称不能为空',
						maxlength : '环节名称不能超过50个字符'
					},
					engLishName : {
						maxlength : '英文名称不能超过100个字符'
					},
					credit : {
						"required" : '学分不能为空'
					},
					weekNum:{
						"required" : '周数不能为空',
						"periodFormat":"周数由1-2位非负整数组成",
						min:"周数由1-2位非负整数组成",
						max:"周数由1-2位非负整数组成"
					},
					departmentId:{
						"required" : '开课单位不能为空',
					},
					tacheTypeCode:{
						"required" : '环节类别不能为空',
					},
					checkWayCode:{
						"required" : '考核方式不能为空',
					},
					enableStatus:{
						"required" : '状态不能为空',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
			
			// 环节号重复性校验，如果不是需要访问后台代码的公共性校验放到validateExtend.js文件里去
			jQuery.validator.addMethod("courseNoRepeatVerify", function(value,element) {
				return false;	
			}, "环节号已经存在");
			
			// 环节号重复验证
			$(document).on("change","#courseNo",function() {
				var courseNo = $.trim($(this).val());
				var courseId = $("#courseId").val();
				if (utils.isNotEmpty(courseNo)) {
					var param = {
						courseNo : courseNo,
						courseId : courseId
					};
					ajaxData.contructor(false);
					ajaxData.request(url.TACHE_IS_COURSENO_EXIST,param,function(data) {
						if (data.code == config.RSP_SUCCESS) {					
							if(data.data){
								$("#courseNo").rules("add",	{"courseNoRepeatVerify" : true,	messages : {"courseNoRepeatVerify" : "环节号不能重复"}});
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
		
//		//计算总学时
//		calculationTotalPeriod:function(){
//			var totalPeriod=0;
//			$("input[myattr='period']").each(function(index,item){
//				var val=$(this).val();
//				if(val){
//					totalPeriod+=(parseInt(val));
//				}			 
//			});
//			$("#totalPeriod").val(totalPeriod);
//		},
		
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
		 * 保存
		 */
		save:function(iframeObj){			
			var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数	
			saveParams["courseOrTache"]=vCourseOrTache.Tache.value; // 环节信息
			ajaxData.request(url.TACHE_ADD, saveParams, function(data) {				
				if (data.code == config.RSP_SUCCESS) {					
					// 提示成功
					popup.okPop("保存成功", function() {});	
					// 刷新列表
					tache.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}				
			});		
		},
		
		/**
		 * 单个删除环节信息
		 */
		singleDeleteCourse : function(obj) {
			var courseId = $(obj).attr("data-tt-id");// 获取this对象的属性
			var ids=[];
			ids.push(courseId);
			tache.deleteCourse(ids);
		},
		
		/**
		 * 批量删除环节信息
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
				popup.warPop("请勾选要删除的环节信息");
				return false;
			}
			tache.deleteCourse(ids);
		},
		
		/**
		 * 删除环节信息
		 */
		deleteCourse : function(ids) {
			// 参数
			var param = {"ids" : ids};
			popup.askDeletePop("环节信息", function() {
				ajaxData.request(url.TACHE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {					
						// 提示成功
						popup.okPop("删除成功", function() {});	
						// 刷新列表
						tache.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}					
				});
				
			});
		},
		
		/**
		 * 根据主键加载环节信息
		 */
		loadItem:function(courseId){
			// 加载属性
			ajaxData.request(url.TACHE_GET_ITEM, {id:courseId}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					rvData = data.data;	
					utils.setForm($("#addForm"),rvData); // 表单自动绑定
					if(rvData.relatedNum>0){ //存在关联数据，学分不可修改
						$("#credit").attr("readonly","readonly");
					}	
					simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT,null,{defaultValue:rvData.departmentId}); // 绑定开课单位下拉框
					simpleSelect.loadEnumSelect("enableStatus",isEnabled, {defaultValue:rvData.enableStatus}); // 绑定是否启用下拉框					
					simpleSelect.loadDictionarySelect("checkWayCode",dataDictionary.CHECK_WAY_CODE,{defaultValue:rvData.checkWayCode}); // 绑定考核方式下拉框	
					simpleSelect.loadDictionarySelect("tacheTypeCode",dataDictionary.TACHE_TYPE_CODE,{defaultValue:rvData.tacheTypeCode});	// 绑定环节类别下拉框 
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
			var myDialog= popup.open('./trainplan/courseResource/tache/html/add.html?courseId=' + courseId,
				{
					id : 'editTache',// 唯一标识
					title : '环节信息修改',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 500,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						var v = iframeObj.$("#addForm").valid(); // 验证表单						
						if (v) { // 表单验证通过
							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数	
							saveParams["courseOrTache"]=vCourseOrTache.Tache.value; // 环节信息
							ajaxData.request(url.TACHE_UPDATE, saveParams, function(data) {				
								if (data.code == config.RSP_SUCCESS) {	
									myDialog.close(); //关闭弹窗									
									// 刷新列表
									tache.pagination.loadData();
									// 提示成功
									popup.okPop("保存成功", function() {});	
								} else {
									// 提示失败
									popup.errPop(data.msg);
								}				
							});	
						} 
						return false;
					},focus:true},
					{name:'取 消',callback:function(){
						popup.askPop("确认取消吗？",function(){
							myDialog.close();
						});
						return false;
					}}]
//					okVal : '保存',
//					cancelVal : '取消',
//					ok : function(iframeObj) { //保存
//						var v = iframeObj.$("#addForm").valid(); // 验证表单						
//						if (v) { // 表单验证通过
//							var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));//获取要保存的参数	
//							saveParams["courseOrTache"]=vCourseOrTache.Tache.value; // 环节信息
//							ajaxData.request(url.TACHE_UPDATE, saveParams, function(data) {				
//								if (data.code == config.RSP_SUCCESS) {	
//									myDialog.close(); //关闭弹窗									
//									// 刷新列表
//									tache.pagination.loadData();
//									// 提示成功
//									popup.okPop("保存成功", function() {});	
//								} else {
//									// 提示失败
//									popup.errPop(data.msg);
//								}				
//							});	
//						} 
//						return false;						
//					},
//					cancel : function() { //取消
//						
//					}
				});
		},		
			
		/**
		 * 批量禁用环节信息
		 */
		batchForbid : function() {
			var ids=[];
			$("tbody input[type='checkbox']:checked").each(function(){
				var obj=$(this).parent().find("input[name='checNormal']");
				ids.push(obj.val());				
			});
			if (ids.length==0){
				popup.warPop("请勾选要禁用的环节信息");
				return false;
			}
			tache.updateEnableStatus(ids,isEnabled.Disable.value); 
		},
		
		/**
		 * 单个启用环节信息
		 */
		singleEnable : function(obj) {
			var courseId = $(obj).attr("data-tt-id");// 获取this对象的属性
			var ids=[];
			ids.push(courseId);
			tache.updateEnableStatus(ids,isEnabled.Enable.value); 
		},		
		
		/**
		 * 更新启用/禁用状态
		 */
		updateEnableStatus : function(ids,statusFlag) {
			// 参数
			var param = {"ids" : ids,"statusFlag":statusFlag};
			var msg=(statusFlag==isEnabled.Enable.value)?"启用":"禁用";
			popup.askPop("确认"+msg+"所选环节信息吗？", function() {
				ajaxData.request(url.TACHE_UPDATE_ENABLE_STATUS, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {					
						// 提示成功
						popup.okPop((statusFlag==isEnabled.Enable.value)?"启用成功":"禁用成功", function() {});	
						// 刷新列表
						tache.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}					
				});
				
			});
		}	

	}
	module.exports = tache;
	window.tache = tache;
});
