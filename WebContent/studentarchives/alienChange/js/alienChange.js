/**
 * 学籍异动
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlData = require("configPath/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var url = require("configPath/url.studentarchives");// 学籍url
	var urlTrainplan = require("basePath/config/url.trainplan");// 培养方案url
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");// 枚举，异动申请类型
	var alienChangeCategoryEnum = require("basePath/enumeration/studentarchives/AlienChangeCategory");// 枚举，异动类别
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var alienChangeStatusEnum = require("basePath/enumeration/studentarchives/AlienChangeStatus");// 枚举，异动状态
	var canBeConfirmedClassEnum = require("basePath/enumeration/studentarchives/CanBeConfirmedClass");// 枚举，是否确定班级 
	var confirmedClassEnum = require("basePath/enumeration/studentarchives/ConfirmedClass");// 枚举，确定班级
	var isEnabledEnum = require("basePath/enumeration/common/IsEnabled");// 枚举，是否启用
	var isCancelEnum = require("basePath/enumeration/studentarchives/IsCancel");// 枚举，是否取消
	var trainingLevelEnum = require("basePath/enumeration/udf/TrainingLevel");// 枚举，培养层次
	var dataDictionary = require("configPath/data.dictionary");// 数据字典
	var dataConstant = require("configPath/data.constant");// 公用常量 
	var helper = require("basePath/utils/tmpl.helper");// 帮助，如时间格式化等
	var treeSelect = require("basePath/module/select.tree");// 公用下拉树
	var pagination = require("basePath/utils/pagination");// 分页
	var validateExtend = require("basePath/utils/validateExtend");// 自定义校验
	var base = config.base;	
	
	/**
	 * 学籍异动
	 */
	var alienChange = {
			
		/**
		 * 异动登记查询条件
		 */
		queryObject : {},
		
		/**
		 * 异动处理查询条件
		 */
		queryDealObject : {},
		
		/**
		 * 已经确定的选择学生对象
		 */
		confirmStudentObject : {
			students : []
		},
		
		/**
		 * 选择学生对象
		 */
		selectStudentObject : {
			students : []
		},
		
		/**
		 * 初始化登记页面
		 */
		init : function() {
			// 获取生效学年学期
			var reqData = {
				applyType : applyTypeEnum.AlienChange.value
			};
			// 请求数据
			ajaxData.request(url.ALIENCHANGE_GETAPPLYSETTINGITEM, reqData,
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData != null && rvData.academicYearSemester != null) {
								var academicYearSemester = rvData.academicYearSemester;
								// 学年学期 默认生效学年学期
								var select = simpleSelect.loadCommonSmester("academicYearSemester",
										urlData.COMMON_GETSEMESTERLIST, academicYearSemester);
								alienChange.queryObject.academicYearSemester = academicYearSemester; // 默认生效学年学期
								// 加载年级、院系、专业、班级 
								alienChange.loadAcademicYearAndRelation();
								
								// 数据来源（从数据字典获取数据）
								simpleSelect.loadDictionarySelect("dataSourceCode",
										dataDictionary.DATA_SOURCE_CODE, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});
								// 异动类别（从枚举获取数据）
								simpleSelect.loadEnumSelect("alienChangeCategoryCode",
										alienChangeCategoryEnum, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});
								// 处理状态（从枚举获取数据）
								simpleSelect.loadEnumSelect("dealStatus", alienChangeStatusEnum, {
									defaultValue : -1,
									firstText : dataConstant.SELECT_ALL,
									firstValue : -1
								});								
								// 加载登记数据
								alienChange.loadRegisterList();
							}else{
								// 是否设置了异动申请控制
								$(".layout-index").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">请联系管理员设置生效学年学期！</p>');
								return false;
							}
						}
					},true);
			//查询按钮
			$("#query").on("click", function(){
						alienChange.queryObject = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
						alienChange.loadRegisterList();
			});
			// 异动登记
			$("#checkIn").on("click", function() {
				alienChange.checkIn(this);
			});
			// 导出
			$("#export").on("click", function() {
				alienChange.exportRegister();
			});
			// 删除登记
			$("#delRegister").on("click", function() {
				alienChange.delRegister();
			});
			// 修改
			$("tbody").on("click", "button[name='edit']", function() {
				alienChange.edit(this);
			});
		},
		
		/**
		 * 初始化异动登记
		 */
		initRegister : function() {
			alienChange.confirmStudentObject.students.length = 0;// 清空
			// 日历控件
		    $("#applyDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd'});
            });		
		    $("#applyDate").val(new Date().format("yyyy-MM-dd"));// 初始化默认时间	
			// 获取生效学年学期
			var reqData = {
				applyType : applyTypeEnum.AlienChange.value
			};
			// 请求数据
			ajaxData.request(url.ALIENCHANGE_GETAPPLYSETTINGITEM, reqData,
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData != null && rvData.academicYearSemester != null) {
								var academicYearSemester = rvData.academicYearSemester;

								// 学年学期 默认生效学年学期
								simpleSelect.loadCommonSmester("academicYearSemester",
										urlData.COMMON_GETSEMESTERLIST, academicYearSemester);
											
								// 异动类别（从枚举获取数据）
								var param ={
									isEnabled :	isEnabledEnum.Enable.value
								};
								simpleSelect.loadSelect("alienChangeCategoryCode",
										url.ALIENCHANGESETTING_GETSELECTLIST, param, {
											firstText : dataConstant.PLEASE_SELECT,
											firstValue : ""
										});
								
								// 异动原因下拉（从数据字典获取数据）
								var opt = {
									idTree : "alienChangeReasonCodeTree", // 树Id
									id : "", // 下拉数据隐藏Id
									name : "alienChangeReasonCodeName", // 下拉数据显示name值
									code : "alienChangeReasonCode", // 下拉数据隐藏code值（数据字典）
									url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
									param : {
										"parentCode" : dataDictionary.ALIENCHANGE_REASON // 数据字典 parentCode				
									},
									parentSelected : true,// 可以选择父节点的值
									defaultValue : "" // 默认值（修改时显示值）
								};
								treeSelect.loadTree(opt);
								
								// 校验
								alienChange.initFormDataValidate($("#addForm"));
								
								// 加载已选学生的登记列表
								alienChange.loadSelectedStudentList(alienChange.selectStudentObject.students);	
							}else{
								// 是否设置了异动申请控制
								$(".layout-index").html("<div style='color:red;text-align:center;margin:auto'>不在控制时间内，请联系管理员</div>");
								return false;
							}
						}
					});				
            // 选择异动学生
			$("#add").on("click", function() {
				alienChange.selectStudent();
			});		

			// 删除学生名单
			$("tbody").on("click", "button[name='delStudent']", function() {
				alienChange.delStudent(this);
			});    
		},
		
		/**
		 * 初始化更新登记
		 */
		initUpdateRegister : function() {
			// 日历控件
		    $("#applyDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd'});
            });
			
			// 获取url参数
			var recordId = utils.getUrlParam('recordId');
		    // 获取更新数据
		    alienChange.loadRegisterItem(recordId);
			// 校验
			alienChange.initFormDataValidate($("#addForm"));					    
		},
		
		/**
		 * 初始化登记-选择异动学生
		 */
		initRegisterSelectStudent : function() {
			var reqData = popup.data("param");// 获取主页面穿日的参数
			if (utils.isEmpty(reqData.alienChangeCategoryCode)){
				popup.errPop("非法操作");
				return false;
			}
			// 学年学期
			$("#alienChangeCategoryCode").val(reqData.alienChangeCategoryCode);
			$("#academicYear").val(reqData.academicYear);
			$("#semesterCode").val(reqData.semesterCode);
			
			// 加载学年、院系、专业、班级 
			alienChange.loadYearByAcademicYear(reqData);
			
			//查询按钮
			$("#query").on("click",function(){
				alienChange.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});

			// 初始化列表数据
			alienChange.pagination = new pagination({
				id : "pagination",
				url : url.STUDENT_GETPAGEDLISTBYPARAMS,
				param : utils.getQueryParamsByFormId("queryForm"),
				pageSizeList : [15, 20, 50, 100, 200]
			}, function(data) {
				$("#pagination").show();
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");// 取消全选
				if (data && data.length > 0) {
					$("#tbodycontent").removeClass("no-data-html").empty()
							.append($("#bodyContentImpl").tmpl(data));
				} else {
					$("#tbodycontent").empty().append(
							"<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
			
		},
		
		/**
		 * 初始化异动处理
		 */
		initDeal : function() {
			// 获取生效学年学期
			var reqData = {
				applyType : applyTypeEnum.AlienChange.value
			};
			// 请求数据
			ajaxData.request(url.ALIENCHANGE_GETAPPLYSETTINGITEM, reqData,
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData != null && rvData.academicYearSemester != null) {
								var academicYearSemester = rvData.academicYearSemester;

								// 学年学期 默认生效学年学期
								var select = simpleSelect.loadCommonSmester("academicYearSemester",
										urlData.COMMON_GETSEMESTERLIST, academicYearSemester);
								alienChange.queryDealObject.academicYearSemester = academicYearSemester; // 默认生效学年学期
								// 加载年级、院系、专业、班级 
								alienChange.loadAcademicYearAndRelation();
								
								// 数据来源（从数据字典获取数据）
								simpleSelect.loadDictionarySelect("dataSourceCode",
										dataDictionary.DATA_SOURCE_CODE, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});

								// 异动类别（从枚举获取数据）
								simpleSelect.loadEnumSelect("alienChangeCategoryCode",
										alienChangeCategoryEnum, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});
								// 处理状态（从枚举获取数据）
								simpleSelect.loadEnumSelect("dealStatus", alienChangeStatusEnum, {
									defaultValue : -1,
									firstText : dataConstant.SELECT_ALL,
									firstValue : -1
								});

								// 加载处理数据
								alienChange.loadDealList();								
							}else{
								// 是否设置了异动申请控制
								$(".layout-index").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在控制时间内，请联系管理员！</p>');
								return false;
							}
						}
					},true);

			//查询按钮
			$("#query").on("click",function(){
						alienChange.queryDealObject = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
						alienChange.loadDealList();
			});
			// 导出
			$("#export").on("click", function() {
				alienChange.exportDeal();
			});
			// 异动取消
			$("tbody").on("click", "button[name='edit']", function() {
				alienChange.edit(this);
			});
			// 异动处理
			$("tbody").on("click", "button[name='deal']", function() {
				alienChange.deal(this);
			});
			// 异动处理取消
			$("tbody").on("click", "button[name='cancelDeal']", function() {
				alienChange.cancelDeal(this);
			});			
		},
		
		/**
		 * 初始化异动处理申请
		 */
		initDealRegister : function() {			
			// 获取url参数
			var recordId = utils.getUrlParam('recordId');			
		    // 获取处理数据
		    alienChange.loadDealRegisterItem(recordId);
			
			// 发文日期
		    $("#issueDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd'});
            });
			// 异动日期
		    $("#alienChangeDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd'});
            });
			
			// 校验
		    validateExtend.validateEx(); // 自定义校验
			alienChange.initDealFormDataValidate($("#addForm"));

			// 处理状态change
			$("input[name='dealStatus']").on("click", function() {
				alienChange.radioCheck(this);
			});
		},
				
		/**
		 * 加载申请登记数据
		 */
		loadRegisterList:function(){
			// 查询参数
			var reqData = alienChange.queryObject;
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETREGISTERLIST, reqData,
					function(data) {
						// 取消全选
						$('#check-all').removeAttr("checked").parent()
								.removeClass("on-check");
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData && rvData.length > 0) {
								$("#tbodycontent").removeClass("no-data-html")
										.empty().append(
												$("#bodyContentImpl").tmpl(
														rvData, helper));
							} else {
								$("#tbodycontent").empty().append(
										"<tr><td colspan='14'></td></tr>")
										.addClass("no-data-html");
							}
						}
			},true);
		},
				
		/**
		 * 加载异动处理数据
		 */
		loadDealList:function(){
			// 查询参数
			var reqData = alienChange.queryDealObject;
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETDEALLIST, reqData,
					function(data) {
						// 取消全选
						$('#check-all').removeAttr("checked").parent()
								.removeClass("on-check");
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData && rvData.length > 0) {
								$("#tbodycontent").removeClass("no-data-html")
										.empty().append(
												$("#bodyContentImpl").tmpl(
														rvData, helper));
							} else {
								$("#tbodycontent").empty().append(
										"<tr><td colspan='14'></td></tr>")
										.addClass("no-data-html");
							}
						}
			},true);
		},
		
		/**
		 * 异动登记 弹窗
		 */
		checkIn : function() {
			var checkInDialog = popup.open('./studentarchives/alienChange/html/checkIn.html', // 这里是页面的路径地址
			{
				id : 'checkIn',// 唯一标识
				title : '异动登记',// 这是标题
				width : 1200,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					var v = iframeObj.$("#addForm").valid(); // 验证表单						
					if (v) { // 表单验证通过
						// 验证是否有学生
						if (iframeObj.alienChange.confirmStudentObject.students.length == 0) {
							popup.warPop("请添加异动学生");
							return false;
						}
						// 保存
						var userArry = [];// 用户id数组
						$(iframeObj.alienChange.confirmStudentObject.students).each(function() {
							userArry.push(this.userId);
						});
						var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数			
						var param = {"ids" : userArry};
						$.extend(param, saveParams); // 合并参数
						
						// ajax提示错误前会自动关闭弹框
						iframeObj.$("body").append("<div class='loading'></div>");// 缓冲提示
						iframeObj.$("body").append("<div class='loading-back'></div>");						
						ajaxData.request(url.ALIENCHANGERECORD_REGISTER, param, function(data) {							
	                        // 提示
							if (data.code == config.RSP_SUCCESS) {
								iframeObj.$(".loading,.loading-back").remove();
								// 关闭窗体
							    checkInDialog.close();								
								// 刷新列表
							    alienChange.loadRegisterList();	
							    // 提示成功
								popup.okPop("保存成功", function() {								
								});
							} else {
								// 提示失败
								popup.errPop(data.msg);		
								iframeObj.$(".loading,.loading-back").remove();
							}
						});
					}
					return false;// 阻止窗体关闭
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 选择异动学生 弹窗
		 */
		selectStudent : function() {
			// 异动学生不能超过200位
			if (alienChange.confirmStudentObject.students.length >= 200){
				popup.warPop("异动学生不能超过200位");
				return false;	
			}
			var alienChangeCategoryCode = $("#alienChangeCategoryCode").val(); // 异动类别代码
			if (utils.isEmpty(alienChangeCategoryCode)){
				popup.warPop("请先选择异动类别");
				return false;				
			}
			var academicYearSemester = $("#academicYearSemester").val();
			if (utils.isEmpty(academicYearSemester)){
				popup.warPop("请先选择生效学年学期");
				return false;				
			}
			// 主页面参数
			popup.data("param", {
				alienChangeCategoryCode : alienChangeCategoryCode,
				academicYear : academicYearSemester.split('_')[0],
				semesterCode : academicYearSemester.split('_')[1]
			});
			popup.open(base
					+ '/studentarchives/alienChange/html/selectStudent.html', // 这里是页面的路径地址
			{
				id : 'add',// 唯一标识
				title : '选择异动学生',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 660,// 弹窗高度
				okVal : '确认',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					alienChange.selectStudentObject.students.length = 0;// 清空
					var num = 0;// 序号
					iframeObj.$("tbody input[type='checkbox']:checked").each(
							function() {
								var elem = $(this).parent().parent().parent().find('td');// 定位元素
								var student = {};
								student.num = ++num;
								student.userId = $(this).parent().find("input[name='checNormal']").val();// 学生Id
								student.classGrade = elem.eq(2).text();// 获取学年
								student.departmentName = elem.eq(3).text();// 院系
								student.majorName = elem.eq(4).text();// 专业
								student.className = elem.eq(5).text();// 班级
								student.studentNo = elem.eq(6).text();// 学号
								student.studentName = elem.eq(7).text();// 姓名
								student.sexName = elem.eq(8).text();// 性别
								student.schoolStatusName = elem.eq(9).text();// 在校
								alienChange.selectStudentObject.students.push(student);
							});
					if (alienChange.selectStudentObject.students.length == 0) {
						popup.warPop("请选择异动学生");
						return false;
					}

					// 异动学生不能超过200位
					if (alienChange.confirmStudentObject.students.length + alienChange.selectStudentObject.students.length > 200){
						popup.warPop("异动学生不能超过200位");
						return false;	
					}
					// 加载已选学生的登记列表
					alienChange.loadSelectedStudentList(alienChange.selectStudentObject.students);					
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 加载已选择的学生名单
		 * 
		 * @param object 集合
		 */
		loadSelectedStudentList : function(object){	
			// 暂无数据
			if (object.length == 0){
				$("#tbodycontent").empty().append("<tr><td colspan='10'></td></tr>").addClass("no-data-html");
			}
			for(var i = object.length-1;i>=0;i--){
				var elem = object[i];// 定位元素
				var student = {};
				student.num = elem.num; // 序号
				student.userId = elem.userId;// 学生Id
				student.classGrade = elem.classGrade;// 获取学年
				student.departmentName = elem.departmentName;// 院系
				student.majorName = elem.majorName;// 专业
				student.className = elem.className;// 班级
				student.studentNo = elem.studentNo;// 学号
				student.studentName = elem.studentName;// 姓名
				student.sexName = elem.sexName;// 性别
				student.schoolStatusName = elem.schoolStatusName;// 在校
				// 加入已选用户
				alienChange.addRowContent(student);
			}
			// 生成一遍列表
			alienChange.showList(alienChange.confirmStudentObject.students); 
		},
		
		/**
		 * 加载已选择的学生名单-加入行内容
		 * 
		 * @param elem 元素
		 */
		addRowContent : function(elem) {
			// 数组中是否包含当前用户id
			var userArry = [];
			$(alienChange.confirmStudentObject.students).each(function() {
				userArry.push(this.userId);
			});
			var result = $.inArray(elem.userId, userArry); // 数组中是否包含当前用户id
			if (result != -1) {
				return;
			}
			var student = {};
			student.num = elem.num;// 序号
			student.userId = elem.userId;// 学生Id
			student.classGrade = elem.classGrade;// 获取学年
			student.departmentName = elem.departmentName;// 院系
			student.majorName = elem.majorName;// 专业
			student.className = elem.className;// 班级
			student.studentNo = elem.studentNo;// 学号
			student.studentName = elem.studentName;// 姓名
			student.sexName = elem.sexName;// 性别
			student.schoolStatusName = elem.schoolStatusName;// 在校
			alienChange.confirmStudentObject.students.unshift(student);			
	    },
	    
	    /**
	     * 加载已选择的学生名单-加载列表
	     * 
		 * @param object 集合
	     */
	    showList : function (object){
	    	var list = [];
	    	for(var i = 0 ; i < object.length; i++){
				var elem = object[i];// 定位元素
				var student = {};
				student.num = i+1; // 序号
				student.userId = elem.userId;// 学生Id
				student.classGrade = elem.classGrade;// 获取学年
				student.departmentName = elem.departmentName;// 院系
				student.majorName = elem.majorName;// 专业
				student.className = elem.className;// 班级
				student.studentNo = elem.studentNo;// 学号
				student.studentName = elem.studentName;// 姓名
				student.sexName = elem.sexName;// 性别
				student.schoolStatusName = elem.schoolStatusName;// 在校
				// 加入用户
				list.push(student);
			}
			if (list == null || list.length == 0) {
				$("#tbodycontent").empty().append("<tr><td colspan='10'></td></tr>").addClass("no-data-html");
			} else {
				$("#tbodycontent").removeClass("no-data-html").empty().append(
						$("#bodyContentImpl").tmpl(list));
			}
	    },	
	    
	    /**
	     * 删除已选学生列表中的学生
	     * 
		 * @param obj this对象
	     */
	    delStudent : function(obj){
	    	popup.askPop("确认删除吗？", function() {
	    		alienChange.delRowContent(obj);
	    		// 重新生成一遍列表
	    		alienChange.showList(alienChange.confirmStudentObject.students); 
			});
	    },
	    
	    /**
	     *  删除行内容
	     *  
	     * @param obj this对象
	     */
	    delRowContent:function(obj) {
			$(alienChange.confirmStudentObject.students).each(function(index, element) {				
				if ($(obj).attr("userId") == element.userId) {
					alienChange.confirmStudentObject.students.splice(index, 1);
				}
			});
	    },
	    
	    /**
		 * 加载异动登记数据项
		 * 
		 * @param id 登记记录Id
		 */
		loadRegisterItem : function(id) {
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETREGISTERITEM, {recordId : id},
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData.recordId != null) {
								utils.setForm($("#addForm"),rvData); // 表单自动绑定
								// 备注长度控制
								new limit($("#remark"), $("#remarkCount"), 200);
								
								// 绑定表单无法绑定的值								
								$("#applyDate").val(helper.format(rvData.applyDate,"yyyy-MM-dd"));// 申请日期	
								// 学年学期 
								simpleSelect.loadCommonSmester("academicYearSemester",
											urlData.COMMON_GETSEMESTERLIST, rvData.academicYearSemester);
								// 异动类别（从枚举获取数据）
								var param ={
									isEnabled :	isEnabledEnum.Enable.value
								};
								simpleSelect.loadSelect("alienChangeCategoryCode",
										url.ALIENCHANGESETTING_GETSELECTLIST, param, {
									        defaultValue : rvData.alienChangeCategoryCode,
											firstText : dataConstant.PLEASE_SELECT,
											firstValue : ""
										});	
									
								// 异动原因下拉（从数据字典获取数据）
								var opt = {
									idTree : "alienChangeReasonCodeTree", // 树Id
									id : "", // 下拉数据隐藏Id
									name : "alienChangeReasonCodeName", // 下拉数据显示name值
									code : "alienChangeReasonCode", // 下拉数据隐藏code值（数据字典）
									url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
									param : {
										"parentCode" : dataDictionary.ALIENCHANGE_REASON // 数据字典 parentCode				
									},
									parentSelected : true,// 可以选择父节点的值
									defaultValue : rvData.alienChangeReasonCode, // 默认值（修改时显示值）
								};
								treeSelect.loadTree(opt);
							}
						}
					});			
		},	
		
		/**
		 * 加载异动处理申请数据项
		 * 
		 * @param id 登记记录Id
		 */
		loadDealRegisterItem : function(id) {
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETDEALREGISTERITEM, {recordId : id},
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData.recordId != null) {
								utils.setForm($("#addForm"),rvData); // 表单自动绑定
								// 绑定表单无法绑定的值							
								$("div[name='remark']").prop("title",rvData.remark);
								$("div[name='studentName']").prop("title",rvData.studentName);
								$("#applyDate").text(helper.format(rvData.applyDate,"yyyy-MM-dd"));// 申请日期	
							    $("#alienChangeDate").val(new Date().format("yyyy-MM-dd"));// 初始化默认异动日期	
							    // 异动类别（从表获取数据）
								simpleSelect.loadSelect("alienChangeCategoryCode",
										url.ALIENCHANGESETTING_GETSELECTLIST, null, {
									        defaultValue : rvData.alienChangeCategoryCode,
											firstText : dataConstant.PLEASE_SELECT,
											firstValue : ""
										});
									
								// 异动原因下拉（从数据字典获取数据）
								var opt = {
									idTree : "alienChangeReasonCodeTree", // 树Id
									id : "", // 下拉数据隐藏Id
									name : "alienChangeReasonCodeName", // 下拉数据显示name值
									code : "alienChangeReasonCode", // 下拉数据隐藏code值（数据字典）
									url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
									param : {
										"parentCode" : dataDictionary.ALIENCHANGE_REASON // 数据字典 parentCode				
									},
									parentSelected : true,// 可以选择父节点的值
									defaultValue : rvData.alienChangeReasonCode, // 默认值（修改时显示值）
								};
								treeSelect.loadTree(opt);
								
								// 异动类别设置参数
								var category = {
									academicYear : rvData.academicYear,
									semesterCode : rvData.semesterCode,
									alienChangeCategoryCode : rvData.alienChangeCategoryCode,// 类别
									beforeGrade : rvData.beforeGrade,// 前年级
									beforeDepartmentId : rvData.beforeDepartmentId,// 前院系
									beforeMajorId : rvData.beforeMajorId,// 前专业
									beforeClassId : rvData.beforeClassId,// 前班级
									beforeDepartmentName : rvData.beforeDepartmentName,// 前院系名称
									beforeMajorName : rvData.beforeMajorName,// 前专业名称
									beforeClassName : rvData.beforeClassName,// 前班级名称
									beforeSchoolStatusCodeName : rvData.beforeSchoolStatusCodeName,// 前在校状态
									beforeArchievesStatusCode : rvData.beforeArchievesStatusCode,// 前学籍状态
									beforeEducationSys : rvData.beforeEducationSys,// 前学制
									beforeTrainingLevelName : rvData.beforeTrainingLevelName, // 培养层次名称
									confirmClassCode : rvData.confirmClassCode,// 确定班级code
									canBeConfirmedClass : rvData.canBeConfirmedClass, // 是否确定班级
									isEnabled : rvData.isEnabled// 类别设置是否启用
								}
								// 根据异动类别设置，加载年级、院系、专业、班级		    
							    alienChange.loadDealDropDownByCategory(category);
							}
						}
					});			
		},	
		
		/**
		 * 修改 弹窗
		 */
		edit: function(obj){
			var recordId = $(obj).attr("recordId");
			var userId = $(obj).attr("userId");
			var editDialog = popup.open('./studentarchives/alienChange/html/edit.html?recordId=' + recordId + '&userId=' + userId, // 这里是页面的路径地址
			{
				id : 'edit',// 唯一标识
				title : '异动信息修改',// 这是标题
				width : 860,// 这是弹窗宽度。其实可以不写
				height : 400,// 弹窗高度
				okVal : '保存',
				cancelVal : '取消',
				ok : function(iframeObj) {
					var v = iframeObj.$("#addForm").valid(); // 验证表单						
					if (v) { // 表单验证通过
						var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数	
						// ajax提示错误前会自动关闭弹框
						ajaxData.request(url.ALIENCHANGERECORD_UPDATE, saveParams, function(
								data) {							
	                        // 提示
							if (data.code == config.RSP_SUCCESS) {
								// 关闭窗体
								editDialog.close();
								// 刷新列表
							    alienChange.loadRegisterList();
								// 提示成功
								popup.okPop("保存成功", function() {								
								});						    
							} else {
								// 提示失败
								popup.errPop(data.msg);				
							}
						});
					}
					return false; // 阻止弹窗
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
	     * 删除申请登记
	     */
	    delRegister : function(){
	    	// 批量
			var recordIds = []; // 记录id数组
			var existPass = false; // 是否存在通过记录
			$("tbody input[type='checkbox']:checked").each(function(){
				var id = $(this).parent().find("input[name='checNormal']").val();
				recordIds.push(id);
				if ($(this).parent().find("input[name='checNormal']").attr("dealStatus") == alienChangeStatusEnum.PASS.value){
					existPass =true;
				}
			});
			if (recordIds.length==0){
				popup.warPop("请勾选要删除的登记记录");
				return false;
			}
			if (existPass){
				popup.warPop("只能删除处理状态为未处理、不通过的登记记录");
				return false;
			}
			// 参数
			var param = {
				"ids" : recordIds
			};
			popup.askDeletePop("登记记录", function() {
				var rvData=null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(url.ALIENCHANGERECORD_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("删除成功", function() {
					});
					// 刷新列表
				    alienChange.loadRegisterList();		
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
	    },
	    
		/**
		 * 导出异动登记 
		 */
		exportRegister : function(){
			ajaxData.exportFile(url.ALIENCHANGERECORD_EXPORTREGISTER, alienChange.queryObject);
		},
	    
		/**
		 * 导出异动申请处理
		 */
		exportDeal : function(){
			ajaxData.exportFile(url.ALIENCHANGERECORD_EXPORTDEAL, alienChange.queryDealObject);
		},
		
		/**
		 * 异动处理 弹窗
		 */
		deal : function(obj) {
			var recordId = $(obj).attr("recordId");
			var userId = $(obj).attr("userId");
			var academicYear = $(obj).attr("academicYear");
			var semesterCode = $(obj).attr("semesterCode");			
			var dealDialog = popup.open('./studentarchives/alienChange/html/deal.html?recordId=' + recordId + '&userId=' + userId 
					+ '&academicYear=' + academicYear + '&semesterCode=' + semesterCode, // 这里是页面的路径地址
			{
				id : 'deal',// 唯一标识
				title : '异动处理',// 这是标题
				width : 1200,// 这是弹窗宽度。其实可以不写
				height : 810,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 不通过状态去掉校验
					var dealStatus = iframeObj.$('input:radio[name="dealStatus"]:checked').val();
					if (!utils.isEmpty(dealStatus) && dealStatus == alienChangeStatusEnum.NOTPASS.value){
						iframeObj.$("#afterGrade").rules("remove");	
						iframeObj.$("#afterDepartmentId").rules("remove");	
						iframeObj.$("#afterMajorId").rules("remove");
						iframeObj.$("#afterClassId").rules("remove");	
						iframeObj.$("#documentSymbol").rules("remove");	
						iframeObj.$("#alienChangeDate").rules("remove");				
					}
					var v = iframeObj.$("#addForm").valid(); // 验证表单						
					if (v) { // 表单验证通过
						var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数							
						// disabled属性控件通过id取值
						saveParams.alienChangeCategoryCode = iframeObj.$("#alienChangeCategoryCode").val();// 异动类别
						saveParams.afterGrade = iframeObj.$("#afterGrade").val();// 新年级
						saveParams.afterDepartmentId = iframeObj.$("#afterDepartmentId").val();// 新院系
						saveParams.afterMajorId = iframeObj.$("#afterMajorId").val();// 新专业
						saveParams.afterClassId = iframeObj.$("#afterClassId").val();// 新班级	
						saveParams.afterEducationSys = iframeObj.$("#afterEducationSys").html();// 新学制
						// ajax提示错误前会自动关闭弹框
						ajaxData.request(url.ALIENCHANGERECORD_DEAL, saveParams, function(
								data) {							
	                        // 提示
							if (data.code == config.RSP_SUCCESS) {
								// 关闭窗体
								dealDialog.close();
								// 刷新列表
							    alienChange.loadDealList();
								// 提示成功
								popup.okPop("保存成功", function() {								
								});						    
							} else {
								// 提示失败
								popup.errPop(data.msg);				
							}
						});
					}
					return false; // 阻止弹窗
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 异动处理取消
		 * 
		 * @param obj this对象
		 */
		cancelDeal : function(obj) {
			var recordId = $(obj).attr("recordId");
			var userId = $(obj).attr("userId");	
			var isCancel = $(obj).attr("isCancel");	// 是否取消
			// 是否可以取消
			if (isCancel == isCancelEnum.NO.value){
				popup.warPop("不能取消异动当前学生");
				return false;
			}
			// 参数
			var param = {
				recordId : recordId,
				userId : userId
			};
			popup.askPop("确定取消异动吗？", function() {
				var rvData=null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(url.ALIENCHANGERECORD_CANCEL, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 刷新列表
				    alienChange.loadDealList();	
					// 提示成功
					popup.okPop("取消异动成功", function() {
					});	
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},
		
		/**
		 * 异动状态改变状态
		 * 
		 * @param obj this对象
		 */
		radioCheck : function(obj){		
			// 不通过取消验证
			if (obj.value == alienChangeStatusEnum.NOTPASS.value){
				$("#afterGrade").rules("remove");	
				$("#afterDepartmentId").rules("remove");	
				$("#afterMajorId").rules("remove");
				$("#afterClassId").rules("remove");	
				$("#documentSymbol").rules("remove");
				$("#alienChangeDate").rules("remove");	
				$("i.text-danger").hide();
			}else{
				$("#afterGrade").rules("add", {
					required : true
				});
				$("#afterGrade").rules("add", {
					customGradeLength : true
				});
				$("#afterDepartmentId").rules("add", {
					required : true
				});  
				$("#afterMajorId").rules("add", {
					required : true
				});
				$("#afterClassId").rules("add", {
					required : true
				});  
				$("#documentSymbol").rules("add", {
					required : true
				});
				$("#alienChangeDate").rules("add", {
					required : true
				});  
				$("i.text-danger").show();
			}
		},
		
		/**
		 * 加载年级、院系、专业、班级		 
		 * int类型默认为-1，如年级，String类型默认为空，如院系等
		 * 
		 * @param auth 是否权限过滤
		 */
		loadAcademicYearAndRelation : function(auth){
			var authority = true; // 默认
			if (!utils.isEmpty(auth)){
					authority = auth
			}
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null, 
						{
							firstText : dataConstant.SELECT_ALL,
							firstValue : "-1"
						});	
			
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
								isAuthority : authority
							}, {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
					        {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			// 院系联动专业
			$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						reqData.grade = $("#grade").val();
						
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isEmpty($(this).val())
								&& utils.isNotEmpty($("#grade").val())
								&& $("#grade").val() == '-1') {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			//专业联动班级
			$("#majorId").change(
					function() {
						var reqData = {};
						reqData.majorId = $(this).val();
						reqData.grade = $("#grade").val();
						if (utils.isEmpty($(this).val())){
							$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
							return false;
						}
						simpleSelect.loadSelect("classId",url.CLASS_GET_CLASSSELECTBYQUERY, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
						        });
					});
		},
		
		/**
		 * 根据学年学期加载年级、院系、专业、班级	
		 * 	 
		 * int类型默认为-1，如年级，String类型默认为空，如院系等
		 */
		loadYearByAcademicYear : function(obj){
			var authority = true; // 默认有数据权限过滤
			if (obj != null){
				if (!utils.isEmpty(obj.isAuthority)){
					authority = obj.isAuthority
				}
			}
			
			// 年级（从数据库获取数据）同步，默认第一个
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null,{ async: false });			
			
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
								isAuthority : authority
							}, {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			
			// 如果异动类别为专升本则过滤专业为专科专业；本转专则过滤为本科专业
			var majorParam = {};
			if (obj != null && !utils.isEmpty(obj.alienChangeCategoryCode)){
				majorParam.grade = $("#grade").val();
				if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
					majorParam.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
				}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
					majorParam.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
				}	
			}
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,majorParam, 
					        {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						// 如果异动类别为专升本则过滤专业为专科专业；本转专则过滤为本科专业
						if (obj != null && !utils.isEmpty(obj.alienChangeCategoryCode)){
							if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
								reqData.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
							}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
								reqData.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
							}	
						}
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			// 院系联动专业
			$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						reqData.grade = $("#grade").val();

						// 如果异动类别为专升本则过滤专业为专科专业；本转专则过滤为本科专业
						if (obj != null && !utils.isEmpty(obj.alienChangeCategoryCode)){
							if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
								reqData.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
							}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
								reqData.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
							}	
						}
						
						$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
						if (utils.isEmpty($(this).val())
								&& utils.isNotEmpty($("#grade").val())
								&& $("#grade").val() == '-1') {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}						
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			//专业联动班级
			$("#majorId").change(
					function() {
						var reqData = {};
						reqData.majorId = $(this).val();
						reqData.grade = $("#grade").val();
						if (utils.isEmpty($(this).val())){
							$("#classId").html("<option value=''>" + dataConstant.SELECT_ALL + "</option>");
							return false;
						}
						simpleSelect.loadSelect("classId",url.CLASS_GET_CLASSSELECTBYQUERY, reqData, 
								{
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
						        });
					});
		},
		
		/**
		 * 根据异动类别设置，加载年级、院系、专业、班级		
		 * int类型默认为-1，如年级，String类型默认为空，如院系等
		 * 
		 * @param obj 参数实体
		 */
		loadDealDropDownByCategory : function(obj){
			// 是否确定班级
			if (obj.canBeConfirmedClass == canBeConfirmedClassEnum.NO.value){
				$("#afterGrade").prop("disabled","disabled");
				$("#afterDepartmentId").prop("disabled","disabled");
				$("#afterMajorId").prop("disabled","disabled");
				$("#afterClassId").prop("disabled","disabled");			
				// 年级（从数据库获取数据）
				var reqData = {};
				reqData.academicYear = obj.academicYear;
				reqData.semesterCode = obj.semesterCode;
				simpleSelect.loadSelect("afterGrade", url.ARCHIVESREGISTER_GETGRADESINSCHOOL,
						reqData, {
					        defaultValue : defaultGrade,
							firstText : dataConstant.PLEASE_SELECT,
							firstValue : "-1",
							async:false
				});
				
				simpleSelect.installOption($("#afterGrade"),[{"value":obj.beforeGrade,"name":obj.beforeGrade}]);
				simpleSelect.installOption($("#afterDepartmentId"),[{"value":obj.beforeDepartmentId,"name":obj.beforeDepartmentName}]);
				simpleSelect.installOption($("#afterMajorId"),[{"value":obj.beforeMajorId,"name":obj.beforeMajorName}]);
				simpleSelect.installOption($("#afterClassId"),[{"value":obj.beforeClassId,"name":obj.beforeClassName}]);				
			}else{
				$("#afterGrade").removeAttr("disabled");
			
				var defaultGrade = -1; // 默认年级
				if (obj.confirmClassCode != confirmedClassEnum.UNLIMITED.value){
					defaultGrade = obj.beforeGrade + parseInt(obj.confirmClassCode);					
				    $("#afterGrade").prop("disabled","disabled");
				}
				
				// 年级（从数据库获取数据）
				var reqData = {};
				reqData.academicYear = obj.academicYear;
				reqData.semesterCode = obj.semesterCode;
				simpleSelect.loadSelect("afterGrade", url.ARCHIVESREGISTER_GETGRADESINSCHOOL,
						reqData, {
					        defaultValue : defaultGrade,
							firstText : dataConstant.PLEASE_SELECT,
							firstValue : "-1",
							async:false
				});
				// 根据年级级联专业
				if (defaultGrade != -1){
					var reqData = {};
					// 如果异动类别为专升本则过滤专业为本科专业；本转专则过滤为专科专业
					if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
						reqData.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
					}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
						reqData.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
					}
					reqData.grade = $("#afterGrade").val();
					// 在校学年下班级对应的专业（从数据库获取数据）
					reqData.academicYear =  obj.academicYear;
					reqData.semesterCode =  obj.semesterCode;
					simpleSelect.loadSelect("afterMajorId",url.ARCHIVESREGISTER_GETMAJORSINSCHOOL,reqData, 
							        {
										firstText : dataConstant.PLEASE_SELECT,
										firstValue : ""
									});
				}

				// 在校年级下院系（从数据库获取数据)不控制权限
				var departmentParam = {
						departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
						isAuthority : false,
						academicYear : obj.academicYear,
						semesterCode : obj.semesterCode
						};
				simpleSelect.loadSelect("afterDepartmentId",url.ARCHIVESREGISTER_GETDEPARTMENTINSCHOOL,departmentParam, {
									firstText : dataConstant.PLEASE_SELECT,
									firstValue : ""
								});
				
				// 年级联动专业
				$("#afterGrade").change(
						function() {
							// 清空
							$("#afterMajorId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
							$("#afterClassId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
							$("#afterTrainingLevelName").text("");
							$("#afterEducationSys").text("");
							$("#afterTrainingLevelCode").val("");
							
							var reqData = {isAuthority : false};// 不控制权限
							reqData.grade = $(this).val();
							reqData.departmentId = $("#afterDepartmentId").val();
							// 如果异动类别为专升本则过滤专业为本科专业；本转专则过滤为专科专业
							if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
								reqData.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
							}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
								reqData.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
							}
							
							if (utils.isNotEmpty($(this).val())
									&& $(this).val() == '-1'
									&& utils.isEmpty($("#afterDepartmentId").val())) {
								$("#afterMajorId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
								return false;
							}
							// 在校学年下班级对应的专业（从数据库获取数据）
							reqData.academicYear =  obj.academicYear;
							reqData.semesterCode =  obj.semesterCode;
							simpleSelect.loadSelect("afterMajorId",url.ARCHIVESREGISTER_GETMAJORSINSCHOOL,reqData, 
									        {
												firstText : dataConstant.PLEASE_SELECT,
												firstValue : ""
											});
						});
				// 院系联动专业
				$("#afterDepartmentId").change(
						function() {
							// 清空
							$("#afterMajorId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
							$("#afterClassId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
							$("#afterTrainingLevelName").html("");
							$("#afterEducationSys").html("");
							$("#afterTrainingLevelCode").val("");
							
							var reqData = {isAuthority : false};// 不控制权限
							reqData.departmentId = $(this).val();
							reqData.grade = $("#afterGrade").val();
							// 如果异动类别为专升本则过滤专业为本科专业；本转专则过滤为专科专业
							if (obj.alienChangeCategoryCode == alienChangeCategoryEnum.ZSB.value){
								reqData.trainingLevelCode = trainingLevelEnum.BACHELOR.value;// 本科
							}else if(obj.alienChangeCategoryCode == alienChangeCategoryEnum.BZZ.value){
								reqData.trainingLevelCode = trainingLevelEnum.JUNIOR.value;// 专科
							}
							
							if (utils.isEmpty($(this).val())
									&& utils.isNotEmpty($("#afterGrade").val())
									&& $("#afterGrade").val() == '-1') {
								$("#afterMajorId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
								return false;
							}
							// 在校学年下班级对应的专业（从数据库获取数据）
							reqData.academicYear =  obj.academicYear;
							reqData.semesterCode =  obj.semesterCode;
							simpleSelect.loadSelect("afterMajorId",url.ARCHIVESREGISTER_GETMAJORSINSCHOOL,reqData, 
									        {
												firstText : dataConstant.PLEASE_SELECT,
												firstValue : ""
											});
						});
				//专业联动班级
				$("#afterMajorId").change(
						function() {
							var reqData = {};
							reqData.majorId = $(this).val();
							reqData.grade = $("#afterGrade").val();
							// 清空
							$("#afterClassId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
							$("#afterTrainingLevelName").html("");
							$("#afterEducationSys").html("");
							$("#afterTrainingLevelCode").val("");
							
							if (utils.isEmpty($(this).val())){
								$("#afterClassId").html("<option value=''>"+ dataConstant.PLEASE_SELECT +"</option>");
								return false;
							}
							simpleSelect.loadCommon("afterClassId",
									url.CLASS_GET_CLASSSELECTBYQUERY, reqData, "",
									dataConstant.PLEASE_SELECT, "", null);							
				});		
				
				//班级联动学制 培养层次 当前年级
				$("#afterClassId").change(function(){
					$("#afterTrainingLevelName").html("");
					$("#afterEducationSys").html("");
					$("#afterTrainingLevelCode").val("");
					// 空处理
					if (utils.isEmpty($(this).val())){
						return false;
					}
					var reqData={};
					reqData.classId = $(this).val();						
					ajaxData.request(url.CLASS_GET_ITEM,reqData,function(data){
						if (data == null)
							return false;
						if (data.code == config.RSP_SUCCESS) {
							$("#afterTrainingLevelName").text(data.data.trainingLevelName);
							$("#afterEducationSys").text(data.data.educationSys);
							$("#afterTrainingLevelCode").val(data.data.trainingLevelCode);
						} else {
							return false;
						}
					});
				});
			}
		},
		
		/**
		 * 初始化新增、编辑表单校验
		 * 
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			formJQueryObj.validate({
				rules : {
					academicYearSemester : {
						required : true
					},
					applyDate : {
						required : true
					},
					alienChangeCategoryCode: {
						required : true
					},
					alienChangeReasonCode: {
						required : true
					}						
				},
				messages : {
					academicYearSemester : {
						required : '生效学年学期',
					},
					applyDate : {
						required : '申请日期不能为空'
					},
					alienChangeCategoryCode : {
						required : '异动类别不能为空'
					},
					alienChangeReasonCode : {
						required : '异动原因不能为空'
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			})
		},
		
		/**
		 * 初始化异动处理表单校验
		 * 
		 * formJQueryObj 表单jquery对象
		 */
		initDealFormDataValidate:function(formJQueryObj){
			formJQueryObj.validate({
				rules : {
					afterGrade : {
						required : true,
						customGradeLength : true
					},
					afterDepartmentId : {
						required : true
					},
					afterMajorId : {
						required : true
					},
					afterClassId : {
						required : true
					},
					documentSymbol : {
						required : true
					},
					alienChangeDate : {
						required : true
					}			
				},
				messages : {
					afterGrade : {
						required : '异动后年级不能为空',
						customGradeLength : "异动后年级不能为空"
					},
					afterDepartmentId : {
						required : '异动后院系不能为空'
					},
					afterMajorId : {
						required : '异动后专业不能为空'
					},
					afterClassId : {
						required : '异动后班级不能为空'
					},
					documentSymbol : {
						required : '异动文号不能为空'
					},
					alienChangeDate : {
						required : '异动日期不能为空'
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			})
		}

	}
	module.exports = alienChange;
	window.alienChange = alienChange;
});
