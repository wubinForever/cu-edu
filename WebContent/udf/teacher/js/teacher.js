/**
 * 教师信息
 */
define(function(require, exports, module) {
	// 引入js
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var URL_DATA = require("basePath/config/url.data");
	var URL = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var URL_FILESYSTEM = require("basePath/config/url.filesystem");
	var helper = require("basePath/utils/tmpl.helper");
	var validate = require("basePath/utils/validateExtend");
	var importUtils = require("basePath/utils/importUtils");
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
    var TeacherCurrentState = require("basePath/enumeration/udf/TeacherCurrentState");
    var TeacherType = require("basePath/enumeration/udf/TeacherType");
	var base  =config.base;
	var data = [];// 数据
	/**
	 * 教师信息
	 */
	var teacher = {
			queryParam:{},
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			//性别
			simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {firstText:"全部",firstValue:""});
			//教师类型
			simpleSelect.loadDictionarySelect("teacherTypeCode",dataDictionary.ID_FOR_TEACHER_TYPE_CODE, {firstText:"全部",firstValue:""});
			//当前状态
			simpleSelect.loadDictionarySelect("currentState",dataDictionary.ID_FOR_CURRENT_STATE, {firstText:"全部",firstValue:""});
			// 单位组织下拉树
			 teacher.ztree();
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			
			// 新增
			$("button[name='addTeacher']").bind("click", function() {
				teacher.popAddTeacherHtml();
			});
			// 修改
			$(document).on("click", "button[name='editTeacher']", function() {
				teacher.popUpdateTeachergHtml(this);
			});
			// 删除
			$(document).on("click", "button[name='deleteTeacher']",
				function() {
					teacher.deleteTeacher(this);
				});
			// 批量删除
			$("button[name='batchTeacherDelete']").bind("click", function() {
				teacher.batchDeleteTeacher();
			});
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			
			// 分页
			teacher.pagination = new pagination({
				url : URL_DATA.TEACHER_GET_PAGEDLIST,
				param : teacher.queryParam
			}, function(data) {
				if (data.length>0) {
					$("#tbodycontent").empty().append(
							$("#teacherTableTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>")
							.addClass("no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			// 查询
			$("#query").on("click", function() {
				teacher.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			// 导入
			$(document).on("click", "button[name='importTeacher']", function() {
				new importUtils({
					title : "教师信息导入",
					uploadUrl : URL_DATA.TEACHER_IMPORTFILE,
					exportFailUrl : URL_DATA.TEACHER_EXPORT_FAILMESSATE,
					templateUrl : URL_DATA.TEACHER_EXPORTTEMPLATE,
					data:[{name:"工号",field:"teacherNo"},{name:"姓名",field:"teacherName"},{name:"身份证件号",field:"idCard"},{name:"导入失败原因",field:"message"}],
					successCallback:function(){
						// 刷新列表
						teacher.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
				}).init();
			});
			//导出
			$(document).on("click", "button[name='exportTeacher']", function() {
				ajaxData.exportFile(URL_DATA.TEACHER_EXPORT, teacher.pagination.option.param);
			});
		},
		initAdd:function(){
			var departmentId = utils.getUrlParam('departmentId');
			var departmentName = decodeURIComponent(utils.getUrlParam('departmentName'));
			var parentName = decodeURIComponent(utils.getUrlParam('parentName'));
			var teacherModel = {};	// 定义前端实体对象
			if(departmentName != parentName){
				teacherModel = {teachingUnitId : departmentId};
			}
			
			teacherModel.currentState = TeacherCurrentState.INCUMBENCY.value;
			teacherModel.teacherTypeCode = TeacherType.CAMPUS.value;
			teacher.loadData(teacherModel);
			teacher.validation();
			teacher.getNationCode();
			teacher.getNationalityCode();
			
			var uploader = new uploaderFile({
		        $id: "importBtn",
		        extensions:"JPG,jpg",
		        callBack: function (data) {
		        	if(data.data.fileId){
		        	$("#teacherImage").prop("src", config.PROJECT_NAME +  URL_FILESYSTEM.EXPORT_FILE.url+"?fileId="+data.data.fileId);
		        	$("#fileId").val(data.data.fileId);
		        	}
		        },
				fileSize:1,
				module:businessModule.data
		    }).init();
		},
		/**
		 * 修改页面初始化，绑定事件
		 */
		initUpdate : function() {
			
			
			// 获取url参数
			var userId = teacher.getUrlParam('userId');
			var rvData = null;// 定义返回对象
			var teacherModel = null;// 定义前端实体对象
			// post请求提交数据
			var param = {
				"userId" : userId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.TEACHER_GET_ITEM, param, function(data) {
				rvData = data;
				teacherModel = data.data;
			});
			if(teacherModel!=null){
			
						$("#editTmpl").tmpl(teacherModel,helper).appendTo($("#editContent"));
						 //$("#editContent").empty().append($("#editTmpl").tmpl(teacherModel, helper));
//						teacher.getNationCode();
//						teacher.getNationalityCode();
						teacher.loadData(teacherModel);
						teacher.validation();// 页面绑定验证事件
						var uploader = new uploaderFile({
					        $id: "importBtn",
					        extensions:"JPG,jpg",
					        callBack: function (data) {
					        	$("#teacherImage").prop("src", config.PROJECT_NAME +  URL_FILESYSTEM.EXPORT_FILE.url+"?fileId="+data.data.fileId);
					        	$("#fileId").val(data.data.fileId);
					        },
							fileSize:1,
							module:businessModule.data
					    }).init();
						if(teacherModel.fileId){
						$("#teacherImage").prop("src", config.PROJECT_NAME +  URL_FILESYSTEM.EXPORT_FILE.url+"?fileId="+teacherModel.fileId);
						}
						teacher.getNationCode(teacherModel.nationCode);
						teacher.getNationalityCode(teacherModel.nationalityCode);
			}
		},
		/**
		 * 获取单条学校信息
		 * 
		 */
		getItem : function() {
			ajaxData.request(URL_DATA.TEACHER_GET_ITEM, null, function(data) {
				var item = data.data;
				$("#schoolId").val(item.schoolId);
				$("#name").val(item.name);
			})
		},
		
		/**
		 * 加载数据
		 */
		loadData:function(operation){
			var options={
					"campusId":'',
					"sexCode":'',
					"idCardTypeCode":'',
					"nationCode":'',
					"nationalityCode":'',
					"maritalStatusCode":'',
					"overseasChineseCode":'',
					"politicalStatusCode":'',
					"healthCode":'',
					"teacherTypeCode":'',
					"compilationCategoryCode":'',
					"currentState":'',
					
					"teachingUnitId":'',
					"administrativeUnitId":'',
					"highestEducationCode":'',
					"highestDegreeCode":'',
					"highestTitleCode":'',
					"staffCategoryCode":'',
					"classroomSituationCode":'',
			};
			options=$.extend({}, options, operation);
			//教学单位
			treeSelect.loadTree({idTree : "teachingUnitTree",name : "teachingUnitName",id : "teachingUnitId",url : URL_DATA.DEPARTMENT_ZTREE,defaultValue : options.teachingUnitId});
			//行政单位
			treeSelect.loadTree({idTree : "administrativeUnitTree",name : "administrativeUnitName",id : "administrativeUnitId",url : URL_DATA.DEPARTMENT_ZTREE,defaultValue : options.administrativeUnitId});
			//学历
			treeSelect.loadTree({idTree : "highestEducationTree",name : "highestEducationName",code : "highestEducationCode",url : URL.DICTIONARY_GETTREELISTBYPARENTCODE,param : {"parentCode":dataDictionary.ID_FOR_HIGHEST_EDUCATION_CODE},defaultValue : options.highestEducationCode});
			//学位
			treeSelect.loadTree({idTree : "highestDegreeTree",name : "highestDegreeName",code : "highestDegreeCode",url : URL.DICTIONARY_GETTREELISTBYPARENTCODE,param : {"parentCode":dataDictionary.ID_FOR_HIGHEST_DEGREE_CODE},defaultValue : options.highestDegreeCode});
			//最高职称
			treeSelect.loadTree({idTree : "highestTitleTree",name : "highestTitleName",code : "highestTitleCode",url : URL.DICTIONARY_GETTREELISTBYPARENTCODE,param : {"parentCode":dataDictionary.ID_FOR_HIGHEST_TITLE_CODE},defaultValue : options.highestTitleCode});
			//教职工类别
			treeSelect.loadTree({idTree : "staffCategoryTree",name : "staffCategoryName",code : "staffCategoryCode",url : URL.DICTIONARY_GETTREELISTBYPARENTCODE,param : {"parentCode":dataDictionary.ID_FOR_STAFF_CATEGORY_CODE},defaultValue : options.staffCategoryCode});
			//任课状况
			treeSelect.loadTree({idTree : "classroomSituationTree",name : "classroomSituationName",code : "classroomSituationCode",url : URL.DICTIONARY_GETTREELISTBYPARENTCODE,param : {"parentCode":dataDictionary.ID_FOR_CLASSROOM_SITUATION_CODE},defaultValue : options.classroomSituationCode});
			
			//所在校区
			simpleSelect.loadCommon('campusId',URL_DATA.CAMPUS_GETALL,null,options.campusId,'--请选择--','');
			//性别
			simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {defaultValue:options.sexCode,firstText:"--请选择--",firstValue:""});
			//身份证类别
			simpleSelect.loadDictionarySelect("idCardTypeCode",dataDictionary.ID_FOR_ID_CARD_TYPE_CODE, {defaultValue:options.idCardTypeCode,firstText:"--请选择--",firstValue:""});
			//婚姻状况
			simpleSelect.loadDictionarySelect("maritalStatusCode",dataDictionary.ID_FOR_MARITAL_STATUS_CODE, {defaultValue:options.maritalStatusCode,firstText:"--请选择--",firstValue:""});
			//港澳台侨外
			simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {defaultValue:options.overseasChineseCode,firstText:"--请选择--",firstValue:""});
			//政治面貌
			simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {defaultValue:options.politicalStatusCode,firstText:"--请选择--",firstValue:""});
			//健康状况
			simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {defaultValue:options.healthCode,firstText:"--请选择--",firstValue:""});
			//教师类型
			simpleSelect.loadDictionarySelect("teacherTypeCode",dataDictionary.ID_FOR_TEACHER_TYPE_CODE, {defaultValue:options.teacherTypeCode});
			//编制类别
			simpleSelect.loadDictionarySelect("compilationCategoryCode",dataDictionary.ID_FOR_COMPILATION_CATEGORY_CODE, {defaultValue:options.compilationCategoryCode,firstText:"--请选择--",firstValue:""});
			//当前状态
			simpleSelect.loadDictionarySelect("currentState",dataDictionary.ID_FOR_CURRENT_STATE, {defaultValue:options.currentState});
		},
		/**
		 * 民族下拉框数据初始化
		 */
		getNationCode : function(defaultValue) {
			var nationDom = [];
			var param={"parentCode":dataDictionary.ID_FOR_NATION_CODE};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.value,
							name : item.name
						};
						nationDom.push(option);
					})
				}
			});
			this.nationSelect = new select({
				dom : $("#nationSelect"),
				defaultValue : defaultValue,
				loadData : function() {
					return nationDom
				},
				onclick :function(code){
					if (code === "") {
						$("#nationCode").val("");
						return false;
					}
					$("#nationCode").val(code); 
				}
			}).init();
		},
		/**
		 * 国籍下拉框数据初始化
		 */
		getNationalityCode : function(defaultValue) {
			var nationalityDom = [];
			var param={"parentCode":dataDictionary.ID_FOR_NATIONALITY_CODE};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.value,
							name : item.name
						};
						nationalityDom.push(option);
					})
				}
			});
			this.nationalitySelect = new select({
				dom : $("#nationalitySelect"),
				defaultValue : defaultValue,
				loadData : function() {
					return nationalityDom
				},
				onclick :function(code){
					if (code === "") {
						$("#nationalityCode").val("");
						return false;
					}
					$("#nationalityCode").val(code); 
				}
			}).init();
		},
		clearPage : function(iframe){
			// 清空数据
			iframe.$('#addWorkForm')[0].reset();
			iframe.$("#teacherImage").attr('src',"../../../common/images/avatar.png");
			iframe.$('.curSelectedNode', "#teachingUnitTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#administrativeUnitTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#highestEducationTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#highestDegreeTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#highestTitleTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#staffCategoryTree").removeClass("curSelectedNode");
			iframe.$('.curSelectedNode', "#classroomSituationTree").removeClass("curSelectedNode");
			//设置当前状态的默认值
			iframe.$("#currentState").find("option[value="+TeacherCurrentState.INCUMBENCY.value+"]").prop("selected",true); 
			//设置教师类型的默认值
			iframe.$("#teacherTypeCode").find("option[value="+TeacherType.CAMPUS.value+"]").prop("selected",true); 
		},
		/**
		 * 弹窗新增
		 */
		popAddTeacherHtml : function() {
			var departmentId = $("#departmentId").val();
			var departmentName = $("#departmentName").val();
			var parentName = $("#parentName").val();
			popup.open('./udf/teacher/html/add.html?departmentId='+departmentId+"&departmentName="+encodeURIComponent(departmentName)+"&parentName="+encodeURIComponent(parentName), // 这里是页面的路径地址
				{
					id : 'addTeacher',// 唯一标识
					title : '教师信息新增',// 这是标题
					width : 1100,// 这是弹窗宽度。其实可以不写
					height : 600,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var v = iframe.$("#addWorkForm").valid();// 验证表单
						if (v) {
						var reqData=teacher.addParam(iframe);
							var rvData = null;// 定义返回对象
							// post请求提交数据
							ajaxData.contructor(false);// 同步
							ajaxData.request(URL_DATA.TEACHER_ADD, reqData,
								function(data) {
									rvData = data;
								});
							if (rvData == null)
								return false;
							if (rvData.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("新增成功", function() {});
								teacher.pagination.loadData();
							} else {
								// 提示失败
								popup.errPop(rvData.msg);
								return false;
							}
						} else {
							// 表单验证不通过
							return false;
						}
					},
					cancel : function() {
						// 取消逻辑
					},
					button: [
						{
							name: '保存',
							focus:true,//按钮高亮
							callback: function () {
								return false;
							},
							focus: true
						},
						{
							name: '保存并新增',
							focus:true,//按钮高亮
							callback: function () {
								var iframe = this.iframe.contentWindow;// 弹窗窗体
								var v = iframe.$("#addWorkForm").valid();// 验证表单
								if (v) {
									// 表单验证通过
									var reqData = teacher.addParam(iframe); // 新增一条数据
									var rvData = null; // 定义返回对象

									// post请求提交数据
									ajaxData.contructor(false); // 同步
									ajaxData.request(URL_DATA.TEACHER_ADD, reqData,
										function(data) {
											rvData = data;
										});
									if (rvData == null)
										return false;
									if (rvData.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("新增成功", function() {});
										// 清空页面内容
										teacher.clearPage(iframe);
										
										//如果存在教学部门，则需要初始化最开始的教学单位
										if(departmentName != parentName){
											teacher.loadTree(iframe, {idTree : "teachingUnitTree",name : "teachingUnitName",id : "teachingUnitId",url : URL_DATA.DEPARTMENT_ZTREE,defaultValue : departmentId});
										}
									    teacher.pagination.loadData();
									} else {
										// 提示失败
										popup.errPop(rvData.msg);
									}
								} else {
									// 表单验证不通过
									return false;
								}
								return false;
							}
						}
					]
				});
		},
		popUpdateTeachergHtml:function(obj){
			var userId = $(obj).attr("data-tt-id");
			popup.open('./udf/teacher/html/edit.html?userId='
					+ userId, // 这里是页面的路径地址
			{
				id : 'editTeacher',// 唯一标识
				title : '教师信息修改',// 这是标题
				width : 1100,// 这是弹窗宽度。其实可以不写
				height :600,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						var param = teacher.addParam(iframe);
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_DATA.TEACHER_UPDATE, param,
								function(data) {
									rvData = data;
								});
						if (rvData == null) {
							return false;
						}
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							teacher.pagination.loadData();
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
							return false;
						}
					} else {
						// 表单验证不通过
						return false;
					}

				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		deleteTeacher:function(obj){
			// 获取url参数
			var teacherId = $(obj).attr("data-tt-id");
			var arrayTeacherId = [];
			arrayTeacherId.push(teacherId);
			teacher.doDelete(arrayTeacherId);
		},
		/**
		 * 批量删除
		 */
		batchDeleteTeacher : function() {
			// 批量
			var teacherIds = "";// 场地Id
			var arrayTeacherId = [];
			$("input[name='checNormal']:checked").each(function() {
				arrayTeacherId.push($(this).attr("userId"));
			});
			if (arrayTeacherId.length == 0) {
				popup.warPop("请勾选要删除的教师");
				return false;
			}
			teacher.doDelete(arrayTeacherId);
		},

		/**
		 * 执行删除操作
		 */
		doDelete : function(arrayTeacherId) {
			// 参数
			var param = {
				ids : arrayTeacherId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.TEACHER_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
					});
					// 刷新列表
					teacher.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},
		addParam:function(iframe){
			var test=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
			return test;
			
			// 表单验证通过
			var userId=$.trim(iframe.$("#userId").val());
			var teacherNo = $.trim(iframe.$("#teacherNo").val());
			var teacherName = $.trim(iframe.$("#teacherName").val());
			var usedName = $.trim(iframe.$("#usedName").val());
			var sexCode = $.trim(iframe.$("#sexCode").val());
			var teachingUnitId = $.trim(iframe.$("#teachingUnitId").val());
			var administrativeUnitId = $.trim(iframe.$("#administrativeUnitId").val());
			var idCard = $.trim(iframe.$("#idCard").val());
			var teacherTypeCode = $.trim(iframe.$("#teacherTypeCode").val());
			var currentState = $.trim(iframe.$("#currentState").val());
			var mobilePhone = $.trim(iframe.$("#mobilePhone").val());
			var idCardTypeCode= $.trim(iframe.$("#idCardTypeCode").val());
			var fileId= $.trim(iframe.$("#fileId").val());
			var param = {
					"userId":userId,
				"teacherNo" : teacherNo,
				"teacherName" : teacherName,
				"usedName" : usedName,
				"sexCode" : sexCode,
				"teachingUnitId" : teachingUnitId,
				"administrativeUnitId" : administrativeUnitId,
				"idCard" : idCard,
				"idCardTypeCode":idCardTypeCode,
				"teacherTypeCode":teacherTypeCode,
				"currentState":currentState,
				"mobilePhone":mobilePhone,
				"fileId":fileId
			};// 新增一条数据
			return param;
		},
		/**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#addWorkForm").validate(
					{
						rules : {
							teacherNo : {
								required : true,
								maxlength : 10
							},
							teacherName : {
								required : true,
								maxlength : 50
							},
							sexCode : {
								required : true,
							},
							teachingUnitId : {
								required : true
							},
							administrativeUnitId : {
								required : true
							},
							idCardTypeCode : {
								required : true,
								maxlength : 1
							},
							idCard : {
								required : true
							},
							mobilePhone:{
								"isMobilePhone":true
							},
							email:{
								"isEmail":true
							},
							postalCode:{
								"isPostalCode":true
							},
							qq:{
								"isQQ":true
							}
						},
						messages : {
							teacherNo : {
								required : '工号不能为空',
								maxlength : '不超过10个字符'
							},
							teacherName : {
								required : '姓名不能为空',
								maxlength : '不超过50个字符'
							},
							sexCode : {
								required : '性别不能为空'
							},
							teachingUnitId : {
								required : '教学单位不能为空'
							},
							administrativeUnitId : {
								required : '行政单位不能为空'
							},
							idCardTypeCode : {
								required : '身份证件类型不能为空'
							},
							idCard : {
								required : '身份证件号不能为空',
								maxlength : '不超过20个字符'
							},
							mobilePhone:{
								"isMobilePhone":"手机号码格式不正确"
							},
							email:{
								"isEmail":"电子邮箱格式不正确"
							},
							postalCode:{
								"isPostalCode":"邮政编码格式不正确"
							},
							qq:{
								"isQQ":"QQ号格式不正确"
							}
						},
						// 定义公用的错误提示内容，暂时保留
						errorPlacement : function(error, element) {
							var parent = $(element).parent("div.tips-text")
									.append(error);

						},
						onchange : function(ele) {
							$(ele).valid();
						},
						onfocusout : function(ele) {
							$(ele).valid();
						}
					})
		},
		// 获取url参数
		getUrlParam : function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return unescape(r[2]);
			return null;
		},
		// 下拉树插件加载
		ztree:function(){
			var setting = {
				view : {
					showLine : false,
					nameIsHTML : false
				},
				data : {
					simpleData : {
						enable : true,
						idKey : "id",
						pIdKey : "pId",
						rootPId : "0"
					},
				},
				callback : {
					onClick : function(event, treeId, treeNode) {
						$("#departmentId").val(treeNode.id);
						$("#departmentName").val(treeNode.name);
						teacher.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
				}
			};
			   
		    ajaxData.request(URL_DATA.DEPARTMENT_ZTREE,null,function(data){
		    	var treeList = data.data;
				ajaxData.request(URL_DATA.SCHOOL_GET, null, function(data) {
					var school = {
						"checked" : "true",
						"departmentLevel" : 0,
						"isSchool" : "true",
						"chkDisabled" : "false",
						"count" : "",
						"id" : data.data.schoolId,
						"isParent" : "true",
						"name" : data.data.schoolName,
						"nocheck" : "false",
						"open" : "true",
						"pId" : "0",
						"times" : ""
					};
					treeList.push(school);
					$.fn.zTree.init($("#ztree"), setting, treeList);
					// 初始选中学校
					var departZTree = $.fn.zTree.getZTreeObj("ztree");
					var nodeId = $("#departmentId").val();
					var departNode;
					if (utils.isNotEmpty(nodeId)) {
						departNode = departZTree.getNodeByParam("id", nodeId);
					} else { 
						departNode = departZTree.getNodeByParam("isSchool", "true");
					}
					departZTree.selectNode(departNode);
					teacher.queryObject = {
						departmentId : departNode.id
					};
					$("#departmentId").val(departNode.id);
				    $("#departmentName").val(departNode.name);
					 $("#parentName").val(departNode.name);
					});
				
			});
		},
		loadTree : function(iframe, option) {			
			var _options = {
				idTree : "", // 树Id
				id : "", // 下拉数据隐藏Id
				name : "", // 下拉数据显示name值
				code : "", // 下拉数据隐藏code值（数据字典）
				url : "", // 下拉数据获取路径
				param : {}, // 数据字典 parentCode
				defaultValue : "", // 默认值（修改时显示值）
				onclick : function() {
				} // 选择之后的事件
			}
			
			_options = $.extend({}, _options, option);
			if(utils.isEmpty(_options.idTree) || utils.isEmpty(_options.name) || utils.isEmpty(_options.url)){
				return false;
			}

			var idTreeObj = iframe.$("#" + _options.idTree);
			var idObj = iframe.$("#" + _options.id);
			var nameObj = iframe.$("#" + _options.name);
			var codeObj = iframe.$("#" + _options.code);
			var url = _options.url;
			var param = _options.param;
			var defaultValue = _options.defaultValue;
			
			var container = idTreeObj.parent();
			if(container.hasClass('need-clear') && $('.clear', container).length === 0){
				container.append('<i class="fa fa-times clean-up clear"></i>');
				container.on('click', '.clear', function(){ 
					idObj.val('');
					nameObj.val('');
					codeObj.val('');
					$('.curSelectedNode', idTreeObj).removeClass("curSelectedNode");
				})
			}

			// 点击任何地方隐藏权限码
			$(document).click(function() {
				idTreeObj.hide();
			});
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			nameObj.click(function(event) {
				event.stopPropagation();
			});

			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			idTreeObj.click(function(event) {
				event.stopPropagation();
			});
			// 加载权限码树结构
			ajaxData.request(url, param, function(data) {
				// 树控件初始化------------------------------------
				var setting = {
					view : {
						showLine : false,
						nameIsHTML : true
					},
					data : {
						simpleData : {
							enable : true,
							idKey : "id",
							pIdKey : "pId",
							rootPId : "0"
						},
						key : {
							title : "name",
							name : "name"

						}
					},
					callback : {
						onDblClick : function(event, treeId, treeNode) {
						},
						onClick : function(event, treeId, treeNode) {
							if (treeNode.count == 0) {
								idTreeObj.hide();
								nameObj.val(treeNode.name);
								idObj.val(treeNode.id);
								codeObj.val(treeNode.code);
								idObj.next().remove();
							}
						}
					}
				};
				$.fn.zTree.init(idTreeObj, setting, data.data);

				// 修改的时候显示数据
				if (utils.isNotEmpty(defaultValue)) {
					var treeObj = $.fn.zTree.getZTreeObj(_options.idTree);
					if (utils.isEmpty(_options.id)) {

						var node = treeObj.getNodeByParam("code", defaultValue, null);// 根据节点数据的属性(code)获取条件完全匹配的节点数据
						if (node != null) {
							treeObj.selectNode(node, false);
							codeObj.val(node.code);
							nameObj.val(node.name);
						}
					} else {
						var node = treeObj.getNodeByParam("id", defaultValue, null);// 根据节点数据的属性(id)获取条件完全匹配的节点数据
						if (node != null) {
							treeObj.selectNode(node, false);
							idObj.val(node.id);
							nameObj.val(node.name);
						}
					}
				}

			});
			// 权限码输入框点击事件
			nameObj.on("click", function() {
				idTreeObj.show().addClass("toggle-ul");
			});
		},
	}
	module.exports = teacher;
	window.teacher = teacher;
});