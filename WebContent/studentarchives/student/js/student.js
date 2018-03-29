/**
 * 学生管理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlUdf = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	var validate = require("basePath/utils/validateExtend");
	var helper = require("basePath/utils/tmpl.helper");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var base  =config.base;
	var importUtils = require("basePath/utils/importUtils");
	var importFileMenu = require("basePath/utils/importFileMenu");
	var importFilePhono = require("basePath/utils/importFilePhoto");
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var isOnlyChildEnum = require("basePath/enumeration/studentarchives/IsOnlyChild");// 枚举，是否独生子女
	var ArchievesStatus = require("basePath/enumeration/studentarchives/ArchievesStatus");// 枚举，学籍状态
	var AtSchoolStatus = require("basePath/enumeration/studentarchives/AtSchoolStatus");// 枚举，在校状态
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	
	/**
	 * 学生管理
	 */
	var student = {
		//查询条件
		queryObject:{},	
		// 初始化
		init : function() {
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			
			// 加载学年、院系、专业、班级 
			student.loadAcademicYearAndRelation();
			//培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			//学籍状态
			simpleSelect.loadDictionarySelect("archievesStatusCode",dataDictionary.ARCHIEVES_STATUS_CODE, {firstText:"全部",firstValue:""});
			//在校状态
			simpleSelect.loadDictionarySelect("schoolStatusCode",dataDictionary.SCHOOL_STATUS_CODE, {firstText:"全部",firstValue:""});
			// 新增
			$(document).on("click", "button[name='add']", function() {
				student.add(this);
			});
			
			//分页
			student.getStudentPagedList();
			// 查询
			$('#query').click(function() {
				//保存查询条件
				student.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			
			//单个删除
			$(document).on("click", "[name='del']",function(){	
				  var ids = [];
				  ids.push($(this).attr("userId"));
				  student.del(ids); 
		    });
			//批量删除
			$(document).on("click", "button[name='batchdel']", function() {
				var length = $("input[name='checNormal']:checked").length;
				var ids = [];
				if(length==0){
					popup.warPop("至少选择一条数据");
					return false;
				}
				$("input[name='checNormal']:checked").each(function(){
				ids.push($(this).attr("id"));
				})
				student.del(ids);
			});
			
			//修改
			$(document).on("click", "[name='edit']",function(){	
				  student.edit($(this).attr("userId")); 
		    });
			
			// 批量修改
			$(document).on("click", "button[name='editAll']", function() {
				var length = $("input[name='checNormal']:checked").length;
				var ids = [];
				if(length==0){
					popup.warPop("至少选择一条数据");
					return false;
				}
				$("input[name='checNormal']:checked").each(function(){
				ids.push($(this).attr("id"));
				})
				student.editAll(ids);
			});
		},
		
		//新增页面初始化
		initAdd : function(){
			//性别
            simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {firstText:"--请选择--",firstValue:""});
			//政治面貌
			simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//省市区三级联动
			simpleSelect.loadProvinces("birthProvinceCode","birthCityCode","birthAreaCode");
			//民族
			simpleSelect.loadDictionarySelect("nationCode",dataDictionary.ID_FOR_NATION_CODE, {firstText:"--请选择--",firstValue:""});
			//国籍
			simpleSelect.loadDictionarySelect("nationalityCode",dataDictionary.ID_FOR_NATIONALITY_CODE, {firstText:"--请选择--",firstValue:""});
			//身份证件类型
			simpleSelect.loadDictionarySelect("idCardTypeCode",dataDictionary.ID_FOR_ID_CARD_TYPE_CODE, {firstText:"--请选择--",firstValue:""});
			//港澳台侨胞
			simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {firstText:"--请选择--",firstValue:""});
			//宗教信仰
			simpleSelect.loadDictionarySelect("faithCode",dataDictionary.FAILTH_CODE, {firstText:"--请选择--",firstValue:""});
			//血型
			simpleSelect.loadDictionarySelect("bloodTypeCode",dataDictionary.BLOOD_TYPE_CODE, {firstText:"--请选择--",firstValue:""});
			//婚姻状况
			simpleSelect.loadDictionarySelect("maritalStatusCode",dataDictionary.ID_FOR_MARITAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//健康状况
			simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {firstText:"--请选择--",firstValue:""});
			//招生季节
			simpleSelect.loadDictionarySelect("enrollSeasonCode",dataDictionary.ENROLL_SEASON_CODE, {firstText:"--请选择--",firstValue:""});
			//入学方式
			simpleSelect.loadDictionarySelect("entranceWayCode",dataDictionary.ENTRANCE_WAY_CODE, {firstText:"--请选择--",firstValue:""});
			//学生类别
			simpleSelect.loadDictionarySelect("studentCategoryCode",dataDictionary.STUDENT_CATEGORY_CODE, {firstText:"--请选择--",firstValue:""});
			//学习形式
			simpleSelect.loadDictionarySelect("studyFormCode",dataDictionary.STUDY_FORM_CODE, {firstText:"--请选择--",firstValue:""});
			//是否独生子女
			simpleSelect.loadEnumSelect("isOnlyChild",isOnlyChildEnum,{defaultValue:-1,firstText:CONSTANT.PLEASE_SELECT,firstValue:-1});
			
			//培养方式
			treeSelect.loadTree({idTree : "trainingWayTree",name : "trainingWayName",code : "trainingWayCode",url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE,parentSelected : true,param : {"parentCode":dataDictionary.TRAINING_WAY_CODE},defaultValue : CONSTANT.PLEASE_SELECT});
			
			
			//培养对象
			simpleSelect.loadDictionarySelect("trainingObjectCode",dataDictionary.GTA_TRAINING_OBJECT, {firstText:"--请选择--",firstValue:""});
			//学生当前状态
			simpleSelect.loadDictionarySelect("currentStatusCode",dataDictionary.CURRENT_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//外语语种
			simpleSelect.loadDictionarySelect("foreignLanguageCode",dataDictionary.FOREIGN_LANGUAGE_CODE, {firstText:"--请选择--",firstValue:""});
			//在校状态
			simpleSelect.loadDictionarySelect("schoolStatusCode",dataDictionary.SCHOOL_STATUS_CODE, {defaultValue:AtSchoolStatus.AtSchool.value,firstText:"--请选择--",firstValue:""});
			//学籍状态
			simpleSelect.loadDictionarySelect("archievesStatusCode",dataDictionary.ARCHIEVES_STATUS_CODE, {defaultValue:ArchievesStatus.HAVEARCHIEVES.value,firstText:"--请选择--",firstValue:""});
			//学生来源
			simpleSelect.loadDictionarySelect("studentOriginCode",dataDictionary.STUDENT_ORIGIN_CODE, {firstText:"--请选择--",firstValue:""});
			//生源地省市区三级联动
			simpleSelect.loadProvinces("fromProvinceCode","fromCityCode","fromAreaCode");
			//院系 专业 班级联动
			student.loadAcademicRelation();
			
			//绑定数据验证
			student.validation();
			
			var uploader = new uploaderFile({
		        $id: "importBtn",
		        extensions:"JPG,jpg",
		        callBack: function (data) {
		        	$("#studentImage").prop("src", config.PROJECT_NAME + urlFilesystem.EXPORT_FILE.url+"?fileId="+data.data.fileId);
		        	$("#fileId").val(data.data.fileId);
		        },
				fileSize:1,
				module:businessModule.data
		    }).init();
		},
		
		//修改页面初始化
		initEdit : function(){
			//性别
            simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {firstText:"--请选择--",firstValue:""});
			//政治面貌
			simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//省市区三级联动
			simpleSelect.loadProvinces("birthProvinceCode","birthCityCode","birthAreaCode");
			//民族
			simpleSelect.loadDictionarySelect("nationCode",dataDictionary.ID_FOR_NATION_CODE, {firstText:"--请选择--",firstValue:""});
			//国籍
			simpleSelect.loadDictionarySelect("nationalityCode",dataDictionary.ID_FOR_NATIONALITY_CODE, {firstText:"--请选择--",firstValue:""});
			//身份证件类型
			simpleSelect.loadDictionarySelect("idCardTypeCode",dataDictionary.ID_FOR_ID_CARD_TYPE_CODE, {firstText:"--请选择--",firstValue:""});
			//港澳台侨胞
			simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {firstText:"--请选择--",firstValue:""});
			//宗教信仰
			simpleSelect.loadDictionarySelect("faithCode",dataDictionary.FAILTH_CODE, {firstText:"--请选择--",firstValue:""});
			//血型
			simpleSelect.loadDictionarySelect("bloodTypeCode",dataDictionary.BLOOD_TYPE_CODE, {firstText:"--请选择--",firstValue:""});
			//婚姻状况
			simpleSelect.loadDictionarySelect("maritalStatusCode",dataDictionary.ID_FOR_MARITAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//健康状况
			simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {firstText:"--请选择--",firstValue:""});
			//是否独生子女
			simpleSelect.loadEnumSelect("isOnlyChild",isOnlyChildEnum,{defaultValue:-1,firstText:CONSTANT.PLEASE_SELECT,firstValue:-1});
			//招生季节
			simpleSelect.loadDictionarySelect("enrollSeasonCode",dataDictionary.ENROLL_SEASON_CODE, {firstText:"--请选择--",firstValue:""});
			//入学方式
			simpleSelect.loadDictionarySelect("entranceWayCode",dataDictionary.ENTRANCE_WAY_CODE, {firstText:"--请选择--",firstValue:""});
			//学生类别
			simpleSelect.loadDictionarySelect("studentCategoryCode",dataDictionary.STUDENT_CATEGORY_CODE, {firstText:"--请选择--",firstValue:""});
			//学习形式
			simpleSelect.loadDictionarySelect("studyFormCode",dataDictionary.STUDY_FORM_CODE, {firstText:"--请选择--",firstValue:""});
			
			//培养对象
			simpleSelect.loadDictionarySelect("trainingObjectCode",dataDictionary.GTA_TRAINING_OBJECT, {firstText:"--请选择--",firstValue:""});
			//学生当前状态
			simpleSelect.loadDictionarySelect("currentStatusCode",dataDictionary.CURRENT_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//外语语种
			simpleSelect.loadDictionarySelect("foreignLanguageCode",dataDictionary.FOREIGN_LANGUAGE_CODE, {firstText:"--请选择--",firstValue:""});
			//在校状态
			simpleSelect.loadDictionarySelect("schoolStatusCode",dataDictionary.SCHOOL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//学籍状态
			simpleSelect.loadDictionarySelect("archievesStatusCode",dataDictionary.ARCHIEVES_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//学生来源
			simpleSelect.loadDictionarySelect("studentOriginCode",dataDictionary.STUDENT_ORIGIN_CODE, {firstText:"--请选择--",firstValue:""});
			//生源地省市区三级联动
			simpleSelect.loadProvinces("fromProvinceCode","fromCityCode","fromAreaCode");
			//院系
			simpleSelect.loadCommon("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},"",CONSTANT.SELECT_ALL,"-1",null);
			
			//绑定数据验证
			student.validation();
			
			var uploader = new uploaderFile({
		        $id: "importBtn",
		        extensions:"JPG,jpg",
		        callBack: function (data) {
		        	$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+data.data.fileId);
		        	$("#fileId").val(data.data.fileId);
		        },
				fileSize:1,
				module:businessModule.data
		    }).init();
			
			//根据菜单id获取菜单详情
			var userId =utils.getUrlParam('userId');
			var reqData ={userId:userId};
			ajaxData.request(URL_STUDENTARCHIVES.STUDENT_GETITEM,reqData,function(data){
				$("#userId").val(data.data.userId);
				//学号
				$("#studentNo").val(data.data.studentNo);
				//姓名
				$("#studentName").val(data.data.studentName);
				//姓名拼音
				$("#nameSpell").val(data.data.nameSpell);
				//曾用名
				$("#usedName").val(data.data.usedName);
				//性别
                simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {defaultValue:data.data.sexCode,firstText:"--请选择--",firstValue:""});
                //出生日期
				if(data.data.birthday != null && data.data.birthday != ""){
					$("#birthday").val(new Date(data.data.birthday).format("yyyy-MM-dd"));
				}
	    	    //政治面貌
			    simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {defaultValue:data.data.politicalStatusCode,firstText:"--请选择--",firstValue:""});
				//初始化加载省市区
				simpleSelect.loadProvincesInitialValue("birthProvinceCode|"+data.data.birthProvinceCode, "birthCityCode|"+data.data.birthCityCode, "birthAreaCode|"+data.data.birthAreaCode);
			    //籍贯
			    $("#nativePlace").val(data.data.nativePlace);
			    //民族
			    simpleSelect.loadDictionarySelect("nationCode",dataDictionary.ID_FOR_NATION_CODE, {defaultValue:data.data.nationCode,firstText:"--请选择--",firstValue:""});
			    //国籍
			    simpleSelect.loadDictionarySelect("nationalityCode",dataDictionary.ID_FOR_NATIONALITY_CODE, {defaultValue:data.data.nationalityCode,firstText:"--请选择--",firstValue:""});
			    //身份证件类型
			    simpleSelect.loadDictionarySelect("idCardTypeCode",dataDictionary.ID_FOR_ID_CARD_TYPE_CODE, {defaultValue:data.data.idCardTypeCode,firstText:"--请选择--",firstValue:""});
			    //身份证
			    $("#idCard").val(data.data.idCard);
			    //港澳台侨胞
			    simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {defaultValue:data.data.overseasChineseCode,firstText:"--请选择--",firstValue:""});
			    //宗教信仰
			    simpleSelect.loadDictionarySelect("faithCode",dataDictionary.FAILTH_CODE, {defaultValue:data.data.faithCode,firstText:"--请选择--",firstValue:""});
			    //血型
			    simpleSelect.loadDictionarySelect("bloodTypeCode",dataDictionary.BLOOD_TYPE_CODE, {defaultValue:data.data.bloodTypeCode,firstText:"--请选择--",firstValue:""});
			    //是否独生子女
			    simpleSelect.loadEnumSelect("isOnlyChild",isOnlyChildEnum,{defaultValue:data.data.isOnlyChild,firstText:CONSTANT.PLEASE_SELECT,firstValue:-1});
			    //婚姻状况
			    simpleSelect.loadDictionarySelect("maritalStatusCode",dataDictionary.ID_FOR_MARITAL_STATUS_CODE, {defaultValue:data.data.maritalStatusCode,firstText:"--请选择--",firstValue:""});
			    //健康状况
			    simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {defaultValue:data.data.healthCode,firstText:"--请选择--",firstValue:""});
			    //qq
			    $("#qq").val(data.data.qq);
			    //微信
				$("#wechat").val(data.data.wechat);
				//联系人
				$("#contactPerson").val(data.data.contactPerson);
				//联系人电话
				$("#contactPhone").val(data.data.contactPhone);
				//邮政编码
				$("#postalCode").val(data.data.postalCode);
				//手机号码
				$("#mobilePhone").val(data.data.mobilePhone);
				//电子邮箱
				$("#email").val(data.data.email);
				//地址
				$("#address").val(data.data.address);
				//考生特征
				$("#candidateFeature").val(data.data.candidateFeature);
				//入学日期
				if(data.data.entranceDate != null && data.data.entranceDate != ""){
					$("#entranceDate").val(new Date(data.data.entranceDate).format("yyyy-MM-dd"));
				}
			   //招生季节
			   simpleSelect.loadDictionarySelect("enrollSeasonCode",dataDictionary.ENROLL_SEASON_CODE, {defaultValue:data.data.enrollSeasonCode,firstText:"--请选择--",firstValue:""});
			   //入学方式
			   simpleSelect.loadDictionarySelect("entranceWayCode",dataDictionary.ENTRANCE_WAY_CODE, {defaultValue:data.data.entranceWayCode,firstText:"--请选择--",firstValue:""});
			   //学生类别
			   simpleSelect.loadDictionarySelect("studentCategoryCode",dataDictionary.STUDENT_CATEGORY_CODE, {defaultValue:data.data.studentCategoryCode,firstText:"--请选择--",firstValue:""});
			   //考生号
			   $("#candidateNo").val(data.data.candidateNo);
			   //学习形式
			   simpleSelect.loadDictionarySelect("studyFormCode",dataDictionary.STUDY_FORM_CODE, {defaultValue:data.data.studyFormCode,firstText:"--请选择--",firstValue:""});
			   //培养方式
			   treeSelect.loadTree({idTree : "trainingWayTree",name : "trainingWayName",code : "trainingWayCode",url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE,parentSelected : true,param : {"parentCode":dataDictionary.TRAINING_WAY_CODE},defaultValue : data.data.trainingWayCode});
			   //培养对象
			   simpleSelect.loadDictionarySelect("trainingObjectCode",dataDictionary.GTA_TRAINING_OBJECT, {defaultValue:data.data.trainingObjectCode,firstText:"--请选择--",firstValue:""});
			   //院系
			   simpleSelect.loadCommon("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},"",CONSTANT.SELECT_ALL,"-1",null);
			   $("#departmentId").val(data.data.departmentId);
			   //专业
			   simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,{departmentId:data.data.departmentId},"",CONSTANT.PLEASE_SELECT,"-1",null);
			   $("#majorId").val(data.data.majorId);
			   //班级
			   simpleSelect.loadCommon("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:data.data.majorId},"",CONSTANT.PLEASE_SELECT,"-1",null);
			   $("#classId").val(data.data.classId);
			   //当前年级
			   $("#grade").val(data.data.grade);
			   //培养层次
			   $("#trainingLevelName").val(data.data.trainingLevelName);
			   //学制
			   $("#educationSystem").val(data.data.educationSystem);
			   //学生当前状态
			   simpleSelect.loadDictionarySelect("currentStatusCode",dataDictionary.CURRENT_STATUS_CODE, {defaultValue:data.data.currentStatusCode,firstText:"--请选择--",firstValue:""});
			   //入学成绩 
			   $("#entranceScore").val(data.data.entranceScore);
			   //外语语种
			   simpleSelect.loadDictionarySelect("foreignLanguageCode",dataDictionary.FOREIGN_LANGUAGE_CODE, {defaultValue:data.data.foreignLanguageCode,firstText:"--请选择--",firstValue:""});
			   //在校状态
			   simpleSelect.loadDictionarySelect("schoolStatusCode",dataDictionary.SCHOOL_STATUS_CODE, {defaultValue:data.data.schoolStatusCode,firstText:"--请选择--",firstValue:""});
			   //学籍状态
			   simpleSelect.loadDictionarySelect("archievesStatusCode",dataDictionary.ARCHIEVES_STATUS_CODE, {defaultValue:data.data.archievesStatusCode,firstText:"--请选择--",firstValue:""});
			   //学生来源
			   simpleSelect.loadDictionarySelect("studentOriginCode",dataDictionary.STUDENT_ORIGIN_CODE, {defaultValue:data.data.studentOriginCode,firstText:"--请选择--",firstValue:""});
			   //初始化加载省市区
			   simpleSelect.loadProvincesInitialValue("fromProvinceCode|"+data.data.fromProvinceCode, "fromCityCode|"+data.data.fromCityCode, "fromAreaCode|"+data.data.fromAreaCode);
			   $("#remark").val(data.data.remark);
			   if(data.data.fileId != null && data.data.fileId !=""){
					$("#fileId").val(data.data.fileId);
					$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+data.data.fileId);
			   }
			});
			
			new limit($("#remark"), $("#remarkCount"), 100);
			new limit($("#candidateFeature"),$("#candidateFeatureCount"),100);
		},
		//批量修改
		initEditAll: function(){
			//性别
            simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {firstText:"--请选择--",firstValue:""});
			//政治面貌
			simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//民族
			simpleSelect.loadDictionarySelect("nationCode",dataDictionary.ID_FOR_NATION_CODE, {firstText:"--请选择--",firstValue:""});
			//国籍
			simpleSelect.loadDictionarySelect("nationalityCode",dataDictionary.ID_FOR_NATIONALITY_CODE, {firstText:"--请选择--",firstValue:""});
			//港澳台侨胞
			simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {firstText:"--请选择--",firstValue:""});
			//宗教信仰
			simpleSelect.loadDictionarySelect("faithCode",dataDictionary.FAILTH_CODE, {firstText:"--请选择--",firstValue:""});
			//血型
			simpleSelect.loadDictionarySelect("bloodTypeCode",dataDictionary.BLOOD_TYPE_CODE, {firstText:"--请选择--",firstValue:""});
			//婚姻状况
			simpleSelect.loadDictionarySelect("maritalStatusCode",dataDictionary.ID_FOR_MARITAL_STATUS_CODE, {firstText:"--请选择--",firstValue:""});
			//健康状况
			simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {firstText:"--请选择--",firstValue:""});
			//是否独生子女
			simpleSelect.loadEnumSelect("isOnlyChild",isOnlyChildEnum,{defaultValue:-1,firstText:CONSTANT.PLEASE_SELECT,firstValue:-1});
			//招生季节
			simpleSelect.loadDictionarySelect("enrollSeasonCode",dataDictionary.ENROLL_SEASON_CODE, {firstText:"--请选择--",firstValue:""});
			//入学方式
			simpleSelect.loadDictionarySelect("entranceWayCode",dataDictionary.ENTRANCE_WAY_CODE, {firstText:"--请选择--",firstValue:""});
			//学生类别
			simpleSelect.loadDictionarySelect("studentCategoryCode",dataDictionary.STUDENT_CATEGORY_CODE, {firstText:"--请选择--",firstValue:""});
			//外语语种
			simpleSelect.loadDictionarySelect("foreignLanguageCode",dataDictionary.FOREIGN_LANGUAGE_CODE, {firstText:"--请选择--",firstValue:""});
			//学生来源
			simpleSelect.loadDictionarySelect("studentOriginCode",dataDictionary.STUDENT_ORIGIN_CODE, {firstText:"--请选择--",firstValue:""});
			//生源地省市区三级联动
			simpleSelect.loadProvinces("fromProvinceCode","fromCityCode","fromAreaCode");
			
			//绑定数据验证
			student.validationEditAll();
		},
		
		/**
		 * 新增 弹窗
		 */
		add: function(){
			popup.open('./studentarchives/student/html/add.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '录入学生信息',// 这是标题
					width : 1400,// 这是弹窗宽度。其实可以不写
					height : 630,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					cancel : function() {
						// 取消逻辑
					},
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var v = iframe.$("#addStudentForm").valid();// 验证表单
						
						if (v) {
							var reqData= utils.getQueryParamsByFormObject(iframe.$("#addStudentForm"));
							var rvData = null;// 定义返回对象
							// post请求提交数据
							ajaxData.contructor(false);// 同步
							ajaxData.request(URL_STUDENTARCHIVES.STUDENT_ADD, reqData,
								function(data) {
									rvData = data;
								});
							if (rvData == null)
								return false;
							if (rvData.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("新增成功", function() {});
								student.pagination.loadData();
							} else {
								// 提示失败
								popup.errPop(rvData.msg);
								return false;
							}
						} else {
							// 表单验证不通过
							return false;
						}
					}
				});
		},
		
		/**
		 * 修改 弹窗
		 */
		edit: function(userId){
			popup.open('./studentarchives/student/html/edit.html?userId='+userId, // 这里是页面的路径地址
					{
						id : 'edit',// 唯一标识
						title : '修改学生信息',// 这是标题
						width : 1400,// 这是弹窗宽度。其实可以不写
						height : 630,// 弹窗高度
						okVal : '保存',
						cancelVal : '取消',
						cancel : function() {
							// 取消逻辑
						},
						ok : function() {
							// 确定逻辑
							var iframe = this.iframe.contentWindow;// 弹窗窗体
							var v = iframe.$("#addStudentForm").valid();// 验证表单
							
							if (v) {
								var reqData= utils.getQueryParamsByFormObject(iframe.$("#addStudentForm"));
								var rvData = null;// 定义返回对象
								// post请求提交数据
								ajaxData.contructor(false);// 同步
								ajaxData.request(URL_STUDENTARCHIVES.STUDENT_UPDATE, reqData,
									function(data) {
										rvData = data;
									});
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("修改成功", function() {});
									student.pagination.loadData();
								} else {
									// 提示失败
									popup.errPop(rvData.msg);
									return false;
								}
							} else {
								// 表单验证不通过
								return false;
							}
						}
					});
		},
		
		/**
		 * 批量修改 弹窗
		 */
		editAll: function(ids){
			popup.open('./studentarchives/student/html/editAll.html', // 这里是页面的路径地址
				{
					id : 'batchEditAll',// 唯一标识
					title : '批量修改学生信息',// 这是标题
					width : 1000,// 这是弹窗宽度。其实可以不写
					height : 630,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var v = iframe.$("#addStudentForm").valid();// 验证表单
						
						if (v) {
							var reqData = utils.getQueryParamsByFormObject(iframe.$("#addStudentForm"));
							reqData.ids = ids;
							var rvData = null;// 定义返回对象
							// post请求提交数据
							ajaxData.contructor(false);// 同步
							ajaxData.request(URL_STUDENTARCHIVES.STUDENT_BATCHUPDATE, reqData,
								function(data) {
									rvData = data;
								});
							if (rvData == null)
								return false;
							if (rvData.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("修改成功", function() {});
								student.pagination.loadData();
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
		
		/**
		 * 学生分页列表
		 */
		getStudentPagedList : function() {
			//初始化列表数据
			student.pagination = new pagination({
				id: "pagination", 
				url: URL_STUDENTARCHIVES.STUDENT_GETPAGELIST, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){
				 if(data && data.length>0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass(
						"no-data-html");
					 $("#pagination").show();
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//取消全选
			}).init();
		},
		
		/**
		 * 删除
		 * @param ids
		 */
		del:function(ids){
	    	var reqData={ids:ids};
	    	popup.askPop('确认删除所选学生吗？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(URL_STUDENTARCHIVES.STUDENT_DELETE,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS){
						// 提示成功
			    		popup.okPop("删除成功", function() { });
			    		student.pagination.loadData();
					}
					else{
						popup.errPop(data.msg,function(){});
					}
				},true);
	    	});
	    },
	    
	    /**
		 * 加载树
		*/
		loadTree:function(id,name,code,url,param,defaultValue){
			var idObj=$("#"+id);
			var nameObj=$("#"+name);
			var codeObj=$("#"+code);
			// 点击任何地方隐藏权限码
			$(document).click(function() {
				idObj.hide();
			});
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			nameObj.click(function(event) {
				event.stopPropagation();
			});
		
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			idObj.click(function(event) {
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
							name:"name"
						}
					},
					callback : {
						onDblClick : function(event, treeId, treeNode) {
						},
						onClick : function(event, treeId, treeNode) {
							if(treeNode.count==0){
								idObj.hide();
							
								nameObj.val(treeNode.name);
							    codeObj.val(treeNode.code==null?treeNode.id:treeNode.code);
							    codeObj.next().remove();
							}
						}
					}
				};
				
				$.fn.zTree.init(idObj, setting, data.data);
				var treeObj = $.fn.zTree.getZTreeObj(id);
				
				var node = treeObj.getNodeByParam("code", defaultValue, null);// 根据节点数据的属性(id)获取条件完全匹配的节点数据
				if(node){
				// JSON
				// 对象集合
                treeObj.selectNode(node, false);
				}else{
					var node = treeObj.getNodeByParam("id", defaultValue, null);// 根据节点数据的属性(id)获取条件完全匹配的节点数据
					  treeObj.selectNode(node, false);
				}
			});
			// 权限码输入框点击事件
			nameObj.on("click", function() {
				idObj.show().addClass("toggle-ul");
			});
		},
		
		/*
		 * 加载院系、专业、班级		 
		 */
		loadAcademicRelation : function(){
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",
				urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
				{
					departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : true
				}, {
					firstText : CONSTANT.PLEASE_SELECT,
					firstValue : ""
				});
			// 院系联动专业
			$("#departmentId").change(
				function() {
					var reqData = {};
					reqData.departmentId = $(this).val();
					if (utils.isEmpty($(this).val())) {
						$("#majorId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
						$("#classId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
						$("#trainingLevelName").val("");
						$("#trainingLevelCode").val("");
						$("#educationSystem").val("");
						$("#grade").val("");
						return false;
					}
					simpleSelect.loadSelect("majorId",
						urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.PLEASE_SELECT,
							firstValue : ""
						});
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				var reqData={};
				reqData.majorId = $(this).val();
				
				if(utils.isEmpty($(this).val()) || $(this).val()=='-1'){
		    	   $("#classId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
		    	   return false;
				}
				simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,reqData,{
					firstText : CONSTANT.PLEASE_SELECT,
					firstValue : ""
				});
			});
			
			//班级联动学制 培养层次 当前年级
			$("#classId").change(function(){
				if(utils.isNotEmpty($(this).val()) && $(this).val()!='-1'){
					var reqData={};
					reqData.classId = $(this).val();
					
					ajaxData.request(URL_STUDENTARCHIVES.CLASS_GET_ITEM,reqData,function(data){
						if (data == null)
							return false;
						if (data.code == config.RSP_SUCCESS) {
							$("#trainingLevelName").val(data.data.trainingLevelName);
							$("#trainingLevelCode").val(data.data.trainingLevelCode);
							$("#educationSystem").val(data.data.educationSys);
							$("#grade").val(data.data.grade);
						} else {
							return false;
						}
					});
				}
				else{
					$("#trainingLevelName").val("");
					$("#trainingLevelCode").val("");
					$("#educationSystem").val("");
					$("#grade").val("");
				}
			});
		},
		
		/*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation : function(){
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,
					null, {
						firstText : CONSTANT.SELECT_ALL,
						firstValue : ""
					});
			// 院系（从数据库获取数据）
			simpleSelect
					.loadSelect(
							"departmentId",
							urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : true
							}, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : ""
							});
			
			//专业
			simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : CONSTANT.SELECT_ALL,
									firstValue : "",
									async: false
							});
						student.majorChange("")
					});
			// 院系联动专业
			$("#departmentId").change(
				function() {
					var reqData = {};
					reqData.departmentId = $(this).val();
					reqData.grade = $("#grade").val();
					if (utils.isEmpty($(this).val())
							&& utils.isNotEmpty($("#grade").val())
							&& $("#grade").val() == '-1') {
						$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
						return false;
					}
					simpleSelect.loadSelect("majorId",
						urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "",
							async: false
						});
					student.majorChange("")
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				student.majorChange($(this).val())
			});
		},
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			if(!value){
		    	   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return;
				}
			simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		},
		
		/**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#addStudentForm").validate(
					{
						rules : {
							studentNo : {
								required : true
							},
							studentName : {
								required : true
							},
							sexCode : {
								required : true,
							},
							nationCode : {
								required : true
							},
							departmentId : {
								required : true
							},
							majorId : {
								required : true
							},
							classId : {
								required : true
							},
							currentStatusCode : {
								required : true
							},
							schoolStatusCode : {
								required : true
							},
							archievesStatusCode : {
								required : true
							},
							mobilePhone:{
								isMobilePhone:true
							},
							qq:{
								isQQ:true
							},
							email:{
								isEmail:true
							},
							postalCode:{
								isPostalCode:true
							},
							entranceScore:{
								isEntranceScore:true
							},
							candidateFeature:{
								maxlength : 100
							},
							remark:{
								maxlength : 100
							}
						},
						messages : {
							studentNo : {
								required : '学号不能为空'
							},
							studentName : {
								required : '姓名不能为空'
							},
							sexCode : {
								required : '性别不能为空'
							},
							nationCode : {
								required : '民族不能为空'
							},
							departmentId : {
								required : '院系不能为空'
							},
							majorId : {
								required : '专业不能为空'
							},
							classId : {
								required : '班级不能为空'
							},
							currentStatusCode : {
								required : '学生当前状态不能为空'
							},
							schoolStatusCode : {
								required : '在校状态不能为空'
							},
							archievesStatusCode : {
								required : '学籍状态不能为空'
							},
							mobilePhone:{
								isMobilePhone:"手机号码格式不正确"
							},
							qq:{
								isQQ:"QQ号码格式不正确"
							},
							email:{
								isEmail:"电子邮箱格式不正确"
							},
							postalCode:{
								isPostalCode:"邮政编码格式不正确"
							},
							entranceScore:{
								isEntranceScore:"入学成绩格式不正确"
							},
							candidateFeature:{
								maxlength : "考生特征不超过100个字符"
							},
							remark:{
								maxlength : "备注不超过100个字符"
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
		
		/**
		 * 批量修改绑定验证事件
		 */
		validationEditAll : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#addStudentForm").validate(
					{
						rules : {
							mobilePhone:{
								isMobilePhone:true
							},
							qq:{
								isQQ:true
							},
							email:{
								isEmail:true
							},
							postalCode:{
								isPostalCode:true
							},
							entranceScore:{
								isEntranceScore:true
							},
							candidateFeature:{
								maxlength : 100
							},
							remark:{
								maxlength : 100
							}
						},
						messages : {
							mobilePhone:{
								isMobilePhone:"手机号码格式不正确"
							},
							qq:{
								isQQ:"QQ号码格式不正确"
							},
							email:{
								isEmail:"电子邮箱格式不正确"
							},
							postalCode:{
								isPostalCode:"邮政编码格式不正确"
							},
							entranceScore:{
								isEntranceScore:"入学成绩格式不正确"
							},
							candidateFeature:{
								maxlength : "考生特征不超过100个字符"
							},
							remark:{
								maxlength : "备注不超过100个字符"
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
		
		/**
		 * 导入学生信息
		 */
		importExcel : function(){
			var option = {
				extensions : "xlsx", //过滤文件类型
				uploadUrl: URL_STUDENTARCHIVES.STUDENT_IMPORTFILE,	//导入文件接口
				data : [{name:"姓名",field:"studentName"},{name:"学号",field:"studentNo"},{name:"导入失败原因",field:"message"}], 	//错误信息显示的字段[{name:"名称",field:"name"}.....]
				exportFailUrl : URL_STUDENTARCHIVES.STUDENT_EXPORT_FAILMESSATE,	//导出错误信息接口路径
				successCallback : function(){return true},	//导入成功后回调函数
				ok : function(){return true},	//点击弹窗确定按钮回调函数
				title : "学生信息导入",	//弹出层显示的内容
				templateUrl : URL_STUDENTARCHIVES.STUDENT_EXPORTTEMPLATE, //下载模板地址
			}
			
			importFileMenu.init(option);
		},
		
		/**
		 * 导入学生照片
		 */
		importPhoto : function(){
			var option = {
				extensions : "zip", //过滤文件类型
				uploadUrl: urlFilesystem.DECOMPRESS,	//导入文件接口
				data : [{name:"照片名称",field:"fileName"},{name:"导入失败原因",field:"message"}], 	//错误信息显示的字段[{name:"名称",field:"name"}.....]
				exportFailUrl : URL_STUDENTARCHIVES.STUDENT_EXPORTPHOTOFAIL,	//导出错误信息接口路径
				successCallback : function(){return true},	//导入成功后回调函数
				ok : function(){return true},	//点击弹窗确定按钮回调函数
				title : "学生照片导入",	//弹出层显示的内容
				templateUrl : URL_STUDENTARCHIVES.STUDENT_IMPORTPHOTO, //下载模板地址
				module : businessModule.studentarchives,
				fileSize : 500,
			}
			
			importFilePhono.init(option);
		},
	}
	module.exports = student;
	window.student = student;
});
