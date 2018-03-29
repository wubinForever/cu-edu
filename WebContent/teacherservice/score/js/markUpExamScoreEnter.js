/**
 * 补考成绩录入
 */
define(function(require, exports, module) {	
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var dataConstant = require("configPath/data.constant");
    var url = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var pagination = require("basePath/utils/pagination");
    var urlTrainplan = require("basePath/config/url.trainplan");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
    var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
    var approvalStatus=require("basePath/enumeration/score/ApprovalStatus"); 
    var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
    var urlstudent = require("configPath/url.studentarchives");// 学籍url
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var markupScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var markUpExamScoreEnter = {
    		// 主页面初始化
    		indexInit : function() {
    			// 加载当前学年学期
    			simpleSelect.loadCommonSmester("studySemester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
    			
    			// 绑定开课单位下拉框
    			simpleSelect.loadSelect("openDepartmentId",
    					url.GET_START_CLASS_DEPARTMENT_SELECT_LIST, {
    						studySemester:$("#studySemester").val(),
    						isAuthority : false  // 不用进行数据权限过滤
    					}, {
    						firstText : dataConstant.SELECT_ALL, // 全部
    						firstValue : dataConstant.EMPTY,
    						async : false,
    						length:12
    					});
    			
    			//开课单位：取成绩管理中设置的课程录入人为当前登录人的课程，对应的开课单位
    			$("#studySemester").change(function(){
    				// 绑定开课单位下拉框
        			simpleSelect.loadSelect("openDepartmentId",
        					url.GET_START_CLASS_DEPARTMENT_SELECT_LIST, {
        						studySemester:$("#studySemester").val(),
        						isAuthority : false  // 不用进行数据权限过滤
        					}, {
        						firstText : dataConstant.SELECT_ALL, // 全部
        						firstValue : dataConstant.EMPTY,
        						async : false,
        						length:12
        					});
    			});    			
    			
    			markUpExamScoreEnter.bindIndexList();
    			// 查询
    			$('#btnSearch').click(function() {
    				markUpExamScoreEnter.bindIndexList();
    			});	
    			
    			// 录入
    			$(document).on("click", "[name='entry']", function() {
    				markUpExamScoreEnter.popEntry(this);
    			});
    			
    			// 查看
    			$(document).on("click", "[name='view']", function() {
    				markUpExamScoreEnter.popView(this);
    			});
            }, 
            
          //绑定主页面列表
    		bindIndexList:function(){
    			//var studySemester =$("#studySemester").val();
    			var queryParams=utils.getQueryParamsByFormId("queryForm");
    			//获取列表数据
    			ajaxData.request(url.GET_MARKUP_SCORE_FOR_TEACH_LIST, queryParams, function(data) {
    				if (data.code == config.RSP_SUCCESS) {
    					if(data.data && data.data.length>0 ){
    						$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
    															
    					}else{
    						$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
    					}
    				}
    			});
    		},
            
            
        // 初始化
        init : function() {
        	
        	var obj = popup.data("obj");
        	$("#studyAcademicYear").val($(obj).attr("studyAcademicYear"));
			$("#studySemesterCode").val($(obj).attr("studySemesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#openDepartmentId").val($(obj).attr("openDepartmentId"));
			$("#courseInfo").val($(obj).attr("courseInfo"));
			var optionHTML=popup.data("optionHTML");			
			$("#optionHTML").val(optionHTML);
        	
        	
        	// 加载查询条件
        	markUpExamScoreEnter.initQuery();
			
			//年级或者院系变动，加载专业
			$("#grade,#departmentId").change(function(){
				var grade =$("#grade").val();
			    var departmentId=$("#departmentId").val();
			    debugger;
			    if( grade != dataConstant.MINUS_ONE && departmentId != dataConstant.EMPTY){ //加载专业
			    	simpleSelect.loadSelect("majorId",
			    			urlTrainplan.GRADEMAJOR_MAJORLIST, {
								grade:grade,
								departmentId:departmentId,
								isAuthority:false // 院系不进行数据权限过滤，级联专业时专业也不进行数据权限过滤
							}, {
								firstText : dataConstant.SELECT_ALL, // --全部--
								firstValue : dataConstant.EMPTY,
								async : false,
								length:15
							});			    	
			    }else{
			    	$("#majorId").empty().append('<option value="">全部</option>');  // 专业
			    }
			    $("#classId").empty().append('<option value="">全部</option>');  // 班级
			});
			
			//专业变动，加载班级
			$("#majorId").change(function(){
				var grade=$("#grade").val();
				var majorId =$("#majorId").val();
			    if(majorId != dataConstant.EMPTY){ 
			    	simpleSelect.loadSelect("classId",
			    			urlstudent.CLASS_GET_CLASSSELECTBYQUERY, {
			    				grade:grade,
								majorId:majorId						
							}, {
								firstText : dataConstant.SELECT_ALL, // --全部--
								firstValue : dataConstant.EMPTY,
								async : true,
								length:15
							});	
			    }else{
			    	$("#classId").empty().append('<option value="">全部</option>');  // 班级
			    }
			});
			
			
			
			markUpExamScoreEnter.getInitData();
			
			
			  
			// 查询
			$('#btnSearch').click(function() {
				markUpExamScoreEnter.getInitData();
			});	
			
            // 设置成绩构成
            $(document).on("click", "[name='set']", function() {
                markUpExamScoreEnter.set();
            });            
			
			//平时成绩 期中成绩 期末成绩 技能成绩    只允许输入数字
			$(document).on("keydown", "input[name='totalScore']", function(e) {
				if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8 || e.keyCode==110|| e.keyCode==9){               	
				}else{
					return false;
				}
	        });
			
			// 计算总评成绩
			$(document).on("blur", "input[name='totalScore']", function() {
				markUpExamScoreEnter.calculationTotalScore($(this).attr("index"));
			});
			
			// 给特殊情况下拉框绑定change事件
			$(document).on("change", "[name='specialCaseId']", function() {
				markUpExamScoreEnter.calculationTotalScore($(this).attr("index"));			
			});
			
			// 给总评成绩下拉框绑定change事件
			$(document).on("change", "[name='selectTotalScore']", function() {
				markUpExamScoreEnter.calculationTotalScore($(this).attr("index"));	
			});
			
			//分制变动
			$("#scoreRegimenId").change(function(){
				if(markupScoreSet && markupScoreSet.scoreRegimenId){
					popup.askPop("修改成绩构成将会删除当前页面已录入学生成绩，是否要继续？",function(){
						markUpExamScoreEnter.deleteOriginalScore();
					},function(){
						
							$("#scoreRegimenId").val(markupScoreSet.scoreRegimenId);
											
					});
				}
			});
        }, 
        
        
     // 初始化
        initView : function() {        	
        	var obj = popup.data("obj");
        	$("#studyAcademicYear").val($(obj).attr("studyAcademicYear"));
			$("#studySemesterCode").val($(obj).attr("studySemesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#openDepartmentId").val($(obj).attr("openDepartmentId"));
			$("#courseInfo").val($(obj).attr("courseInfo"));
			
        	
        	
        	// 加载查询条件
        	markUpExamScoreEnter.initQuery();
			
			//年级或者院系变动，加载专业
			$("#grade,#departmentId").change(function(){
				var grade =$("#grade").val();
			    var departmentId=$("#departmentId").val();
			    if( grade != dataConstant.MINUS_ONE && departmentId != dataConstant.EMPTY){ //加载专业
			    	simpleSelect.loadSelect("majorId",
			    			urlTrainplan.GRADEMAJOR_MAJORLIST, {
								grade:grade,
								departmentId:departmentId,
								isAuthority:false // 院系不进行数据权限过滤，级联专业时专业也不进行数据权限过滤
							}, {
								firstText : dataConstant.SELECT_ALL, // --全部--
								firstValue : dataConstant.EMPTY,
								async : true,
								length:15
							});			    	
			    }else{
			    	$("#majorId").empty().append('<option value="">全部</option>');  // 专业
			    }
			    $("#classId").empty().append('<option value="">全部</option>');  // 班级
			});
			
			//专业变动，加载班级
			$("#majorId").change(function(){
				var grade=$("#grade").val();
				var majorId =$("#majorId").val();
			    if(majorId != dataConstant.EMPTY){ 
			    	simpleSelect.loadSelect("classId",
			    			urlstudent.CLASS_GET_CLASSSELECTBYQUERY, {
			    				grade:grade,
								majorId:majorId						
							}, {
								firstText : dataConstant.SELECT_ALL, // --全部--
								firstValue : dataConstant.EMPTY,
								async : true,
								length:15
							});	
			    }else{
			    	$("#classId").empty().append('<option value="">全部</option>');  // 班级
			    }
			});
			
			
			
			markUpExamScoreEnter.getInitData();
			
			
			  
			// 查询
			$('#btnSearch').click(function() {
				markUpExamScoreEnter.getInitData();
			});	
			
           
			
        }, 
        
        
        
      //显示当前选中信息
        showCurrentSelectedInfo:function(){        	
        	var courseInfo=$("#courseInfo").val();
		    $("#spanCourse").text("课程："+courseInfo);
		    $("#spanCourse").attr("title","课程："+courseInfo);			
        },
        
        /**
		 * 查询条件初始化
		 * 
		 */
		initQuery : function() {
			// 绑定年级下拉框
			simpleSelect.loadSelect("grade", 
					urlTrainplan.GRADEMAJOR_GRADELIST,
					null, 
					{
						firstText : dataConstant.SELECT_ALL, // --全部--
						firstValue : dataConstant.MINUS_ONE, // -1
						async : false,
						length:12
					});
			
			// 绑定院系下拉框
			simpleSelect.loadSelect(
					"departmentId",
					urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
					{
						departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
						isAuthority : false // 院系不进行数据权限过滤
					}, {
						firstText : dataConstant.SELECT_ALL, // --全部--
						firstValue : dataConstant.EMPTY, // ""
						async : false,
						length:12
					});
			// 初始化分制
			simpleSelect.loadSelect("scoreRegimenId",url.GET_SCORE_REGIMEN_LIST,{},{});
		},
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){	
			markUpExamScoreEnter.showCurrentSelectedInfo();	
			markUpExamScoreEnter.initShow(); 
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.courseId==dataConstant.EMPTY){
				popup.warPop("请先选择课程");
				markUpExamScoreEnter.bindNoData();	
				return false;
			}
			else{				
//				// 获取分制
//				markupScoreSet={};
//				markupScoreSet.scoreRegimenId=$("#scoreRegimenId").val(); // 分制id
//				markupScoreSet.scoreRegimenName=$("#scoreRegimenId").find("option:selected").text(); // 分制名称				
				//获取列表数据
				queryParams.isAuthority=false; // 教师服务端不进行数据权限过滤
				queryParams.isLessThen60 =true; // 只查找分数小于60的学生成绩
				ajaxData.request(url.GET_MARKUP_SCORE_ENTRY_LIST, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.length>0){
							// 获取分制
							markupScoreSet={};
							markupScoreSet["list"]=data.data;
							if(data.data[0].scoreRegimenId){
								$("#scoreRegimenId").val(data.data[0].scoreRegimenId); // 分制下拉框重新选定
							}
							
							markupScoreSet.scoreRegimenId=$("#scoreRegimenId").val(); // 分制id
							markupScoreSet.scoreRegimenName=$("#scoreRegimenId").find("option:selected").text(); // 分制名称
							
							
							
							$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(markupScoreSet));
							//绑定学年学期下拉框
							markUpExamScoreEnter.bindSemesterSelect();
							//绑定特殊情况下拉框
							markUpExamScoreEnter.bindSpecialCaseSelect();
																
						}else{
							markUpExamScoreEnter.bindNoData();
						}
						//markUpExamScoreEnter.calculationWaitEnterCount(); // 计算 班级环节中，共有X条未完成录入	
						//判断当前环节成绩是否已经送审
//						$("#btnSave").removeAttr("disabled"); // 设置保存按钮先起效
//						$("#btnReview").removeAttr("disabled"); // 设置送审按钮先起效
//						$("#scoreRegimenId").removeAttr("disabled"); // 先让构成下拉框可选	
						if(data.data && data.data.length>0){							
							if(markUpExamScoreEnter.haveWaitAudit(data.data)){ // 只要有一个待审核，则整个页面不可编辑
								$("#btnSave").attr("disabled","disabled"); // 设置保存按钮失效
								$("#btnReview").attr("disabled","disabled"); // 设置送审按钮失效
								$("#scoreRegimenId").attr("disabled","disabled"); // 让构成下拉框不可选
								$("#tbodycontent input").each(function () {	
									$(this).attr("disabled","disabled"); // 所有的文本框不可编辑
								});
								$("#tbodycontent select").each(function () {	
									$(this).attr("disabled","disabled"); // 所有的下拉框不可编辑
								});
							}
						}
					} else {
						// 提示失败
						popup.errPop(data.msg);
						markUpExamScoreEnter.bindNoData();
						return false;
					}				
				},true);
			}	
		},	
		
		// 判断当前加载的数据中是否有待审核的数据，有待审核的数据时返回ture
		haveWaitAudit:function(data){
			if(data && data.length>0){
				for(var i=0;i<data.length;i++){
					if(data[i].auditStatus===approvalStatus.Submitted.value){
						return true;
					}
				}				
			}
			return false;
		},
		
		//查询前，初始化列表头部显示
		initShow:function(){
			$("#scoreRegimenId").removeAttr("disabled"); // 先让构成下拉框可选
		},
		
		//没有数据时绑定暂无数据
		bindNoData:function(){
			$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
			$("#btnSave").attr("disabled","disabled"); // 设置保存按钮失效
			$("#btnReview").attr("disabled","disabled"); // 设置送审按钮失效
			$("#scoreRegimenId").attr("disabled","disabled"); // 让构成下拉框不可选
		},
		
		// 绑定取得学年学期下拉框
		//默认为查询条件中的学年学期，下拉中只显示大于等于查询条件中的学年学期；
		bindSemesterSelect:function(){
			var optionHTML=$("#optionHTML").val();// markUpExamScoreEnter.getSemester();
			var studySemester=$("#studyAcademicYear").val()+"_"+$("#studySemesterCode").val();
			$("select[name='semester']").each(function(index,item){				
				$("#"+$(this).attr("id")).empty().append(optionHTML);
				var defaultVal=$(this).attr("value");	
				if(defaultVal==="_"){
					$("#"+$(this).attr("id")).val(studySemester); // 设定选中
				}else{
					$("#"+$(this).attr("id")).val(defaultVal); // 设定选中
				}				
			});
		},
		
		//绑定特殊情况下拉选择
		bindSpecialCaseSelect:function(){
			ajaxData.request(url.SPECIAL_CASE_GET_LIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data && data.data.length>0){
						var options=[];
						options.push('<option value="" score=""></option>');
						for(var i=0;i<data.data.length;i++){
							options.push('<option value="'+data.data[i].specialCaseId+'" score="'+data.data[i].totalScore+'">'+data.data[i].name+'</option>');
						}
						var optionHTML=options.join('');
						$("select[name='specialCaseId']").each(function(index,item){
							var defaultVal=$(this).attr("value");							
							$("#"+$(this).attr("id")).empty().append(optionHTML);
							$("#"+$(this).attr("id")).val(defaultVal); // 设定选中
						});
						
						if(markupScoreSet.scoreRegimenName!==dataConstant.HANDROD_CREDIT_NAME){ // 不是百分制
							//绑定等级制情况下的总评成绩下拉框
							markUpExamScoreEnter.bindScoreRegimenDetailSelect();
						}else{
							// 百分制，如果特殊情况选中，则让对应的文本框disabled
							$("select[name='specialCaseId']").each(function(index,item){
								var index=$(this).attr("index");
								var specialCaseId=$(this).val();
								if(specialCaseId!==""){//如果特殊情况选中，则让百分制总评成绩只读
									$("#totalScore"+index).attr("readonly","readonly");
								}
							});
							
						}	
					}
				}
			})
		},
		
		//绑定分制明细下拉选择
		bindScoreRegimenDetailSelect:function(){
			ajaxData.request(url.GET_SCORE_REGIMEN_DETAIL_LIST, {scoreRegimenId:markupScoreSet.scoreRegimenId}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data && data.data.length>0){
						scoreRegimenDetail=data.data; // 全局保存分制明细
						var options=[];
						options.push('<option value="'+dataConstant.EMPTY+'" percentileScore="">'+dataConstant.PLEASE_SELECT+'</option>');
						for(var i=0;i<data.data.length;i++){
							options.push('<option value="'+data.data[i].scoreRegimenDetailId+'" scoreBegin="'+data.data[i].scoreBegin+'" scoreEnd="'+data.data[i].scoreEnd+'" percentileScore="'+data.data[i].percentileScore+'" >'+data.data[i].cnName+'</option>');
						}
						var optionHTML=options.join('');
						$("select[name='selectTotalScore']").each(function(index,item){
							var defaultVal=$(this).attr("value");							
							$("#"+$(this).attr("id")).empty().append(optionHTML);
							$("#"+$(this).attr("id")).val(defaultVal); // 设定选中
							
							var specialCaseId=$("#specialCaseId"+$(this).attr("index")).val();
							if(specialCaseId!==""){ //如果特殊情况选中，则让总评下拉框disabled
								$("#"+$(this).attr("id")).attr("disabled","disabled");
							}
						});
					}
				}
			})
		}, 
		
//		// 获取要保存的数据
//        getSaveData:function(iframeObj){  
//        	var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#queryForm")); // 获取要保存的参数
//        	var list=[]; // 要保存的数据
//        	//遍历设置了总评成绩的
//        	iframeObj.$("#tbodycontent input[name='totalScore']").each(function () {	
//					var index=$(this).attr("index");
//					var originalScore={};					
//					originalScore.originalScoreId=$(this).attr("originalScoreId"); // 原始成绩ID
//					originalScore.studentId=$(this).attr("studentId"); // 学生ID					
//					originalScore.usualScore=(iframeObj.$("#usualScore"+index)==undefined)?null:iframeObj.$("#usualScore"+index).val(); // 平时成绩
//					originalScore.midtermScore=(iframeObj.$("#midtermScore"+index)==undefined)?null:iframeObj.$("#midtermScore"+index).val(); // 期中成绩
//					originalScore.endtermScore=(iframeObj.$("#endtermScore"+index)==undefined)?null:iframeObj.$("#endtermScore"+index).val(); // 期末成绩
//					originalScore.skillScore=(iframeObj.$("#skillScore"+index)==undefined)?null:iframeObj.$("#skillScore"+index).val(); // 技能成绩
//					originalScore.totalScore=(iframeObj.$("#totalScore"+index)==undefined)?null:iframeObj.$("#totalScore"+index).val(); // 总评成绩
//					originalScore.specialCaseId=(iframeObj.$("#specialCaseId"+index)==undefined)?null:iframeObj.$("#specialCaseId"+index).val(); // 特殊情况
//					originalScore.remark=(iframeObj.$("#remark"+index)==undefined)?null:iframeObj.$("#remark"+index).val(); // 备注
//					//percentageScore 对应的百分制成绩
//					if(saveParams.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){
//						originalScore.percentageScore=originalScore.totalScore;
//					}
//					else{
//						originalScore.percentageScore=iframeObj.$("#totalScore"+index).attr("percentageScore");
//					}
//					list.push(originalScore);				
//            });
//			saveParams["studentScoreDtoList"]=list;	
//			return saveParams;
//        },        
		// 获取要保存的数据
		
        getSaveData:function(iframeObj){ 
        	var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#queryForm")); // 获取要保存的参数
			saveParams["courseScoreSetId"]=null; // 补考成绩构成id为null
			saveParams["scoreRegimenId"]=iframeObj.$("#scoreRegimenId").val(); // 分制id
			saveParams["studyAcademicYear"]=iframeObj.$("#studyAcademicYear").val(); // 修读学年学期
			saveParams["studySemesterCode"]=iframeObj.$("#studySemesterCode").val(); // 修读学年学期
        	var list=[]; // 要保存的数据
        	//遍历设置了总评成绩的
        	iframeObj.$("#tbodycontent input[name='totalScore']").each(function () {	
				var index=$(this).attr("index");
				var originalScore={};					
				originalScore.validityScoreId=$(this).attr("validityScoreId"); // 有效成绩ID	
				originalScore.originalScoreId=$(this).attr("originalScoreId"); // 原始成绩ID				
				originalScore.studentId=$(this).attr("studentId"); // 学生ID					
				originalScore.totalScore=(iframeObj.$("#totalScore"+index)==undefined)?null:iframeObj.$("#totalScore"+index).val(); // 总评成绩
				originalScore.specialCaseId=(iframeObj.$("#specialCaseId"+index)==undefined)?null:iframeObj.$("#specialCaseId"+index).val(); // 特殊情况
				originalScore.remark=(iframeObj.$("#remark"+index)==undefined)?null:iframeObj.$("#remark"+index).val(); // 备注
				originalScore.semester=(iframeObj.$("#semester"+index)==undefined)?null:iframeObj.$("#semester"+index).val(); // 取得学年学期
				//percentageScore 对应的百分制成绩
				if(iframeObj.$("#scoreRegimenId").find("option:selected").text()===dataConstant.HANDROD_CREDIT_NAME){
					originalScore.percentageScore=originalScore.totalScore;
				}
				else{
					originalScore.percentageScore=iframeObj.$("#totalScore"+index).attr("percentageScore");
				}
				list.push(originalScore);			
            });
			saveParams["studentScoreDtoList"]=list;	
			return saveParams;
        },
		
		// 保存
		save:function(myDialog,iframeObj,auditStatus){
			var saveParams=markUpExamScoreEnter.getSaveData(iframeObj); // 获取要保存的数据	
			saveParams["auditStatus"]=auditStatus; // 审核状态
			ajaxData.contructor(false);
            ajaxData.setContentType("application/json;charset=UTF-8");
			ajaxData.request(url.SAVE_MARKUP_SCORE, JSON.stringify(saveParams), function(data) {
				ajaxData.setContentType("application/x-www-form-urlencoded");				
				if (data.code == config.RSP_SUCCESS) {	
					myDialog.close(); //关闭弹窗									
												
					popup.okPop("保存成功", function() {
						markUpExamScoreEnter.bindIndexList();
						//course.pagination.loadData();// 刷新列表		
					});// 提示成功									
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}	
					
			});		
		},
		
		
		// 送审
		review:function(myDialog,iframeObj,auditStatus){
			popup.askPop("送审后成绩将不能再修改，确定送审吗？",function(){
				markUpExamScoreEnter.save(myDialog,iframeObj,approvalStatus.Submitted.value); // 审核状态(1-暂存，2-已送审，3-已审核)
			});	
		},
		
		
		
		//计算总评成绩
		calculationTotalScore:function(index){
			var objSpecialCase=$("#specialCaseId"+index); // 特殊情况jquery对象
			var specialCaseId=objSpecialCase.val(); // 特殊情况值：""为不是特殊情况，不为""说明是特殊情况
			var isBFZ=(markupScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME); // 是否为百分制： true为百分制，否则为等级制
			
			var fax=/^\d{1,3}(\.\d{1})?$/; // 成绩有1-3位大于等于0的数字，可有1位小数
			if(specialCaseId===""){ //第一个分支，判断总评成绩是否由特殊情况决定
				//do:总评成绩不由特殊情况决定	
				if(isBFZ){// 第二个分支，判断总评成绩的分制 （百分制or等级制）
					//do:总评成绩不由特殊情况决定->百分制
					//1.让总评成绩文本框可录入成绩；
					//2.根据总评成绩文本框进行验证计算；
					$("#totalScore"+index).removeAttr("readonly");
					
					var totalScore=($("#totalScore"+index)==undefined)?null:$("#totalScore"+index).val(); // 总评成绩	
					if(totalScore!=null && totalScore!=""){
						var tempScore=Number(totalScore);
						if(tempScore>100){
							popup.warPop("请输入0-100之间的数字，可以保留一位小数");
							$("#totalScore"+index).val('');
							return false;							
						}else{								
							if(fax.test(Number(totalScore))){	
								$("#totalScore"+index).val(Number(totalScore));			
							}else{
								popup.warPop("请输入0-100之间的数字，可以保留一位小数");
								$("#totalScore"+index).val('');
								return false;	
							}					
						}						
					}		
					
				}else{
					//do:总评成绩不由特殊情况决定->等级制
					//1.让总评成绩下拉框框可选；
					//2.根据总评成绩下拉框对隐藏域进行赋值；
					
					$("#selectTotalScore"+index).removeAttr("disabled");
					
					$("#totalScore"+index).val($("#selectTotalScore"+index).val());
					var aa=$("#selectTotalScore"+index).find("option:selected").attr("percentileScore");
					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore"));	
				}
			}else{
				var score=objSpecialCase.find("option:selected").attr("score"); // 特殊情况分数
				//do:总评成绩由特殊情况决定	
				if(isBFZ){// 第二个分支，判断总评成绩的分制 （百分制or等级制）
					//do:总评成绩由特殊情况决定->百分制
					//1.总评成绩文本框框置灰；
					//2.将特殊情况分数赋值给总评成绩文本框；
					$("#totalScore"+index).attr("readonly","readonly");
					$("#totalScore"+index).val(score);					
				}else{
					//do:总评成绩由特殊情况决定->等级制
					//1.总评成绩下拉框置灰；
					//2.将特殊情况分数转换成分制等级，并使下拉框选定对应的值；
					//3.给隐藏域赋值；
					
					$("#selectTotalScore"+index).attr("disabled","disabled");
					
					var scoreRegimenDetailId=markUpExamScoreEnter.getScoreRegimenDetailId(score);
					$("#selectTotalScore"+index).val(scoreRegimenDetailId); // 设定选中		

					$("#totalScore"+index).val(scoreRegimenDetailId); // 保存分制明细id到隐藏域
					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore")); // 保存对应的百分制成绩到隐藏域
					
					
				}
			}
		},
        
//		//计算总评成绩
//		calculationTotalScore:function(index){	
//            var objSpecialCase=$("#specialCaseId"+index); // 特殊情况jquery对象
//			var specialCaseId=objSpecialCase.val(); 			
//			if(specialCaseId===""){
//				//为“”说明了不是特殊情况
//				//不考虑特殊情况没值的情况				
//				if(markupScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制
//					//按 平时成绩 期中成绩 期末成绩 技能成绩    计算总评成绩
//					var totalScore=($("#totalScore"+index)==undefined)?null:$("#totalScore"+index).val(); // 总评成绩	
//					if(totalScore!=null && totalScore!=""){
//						var tempScore=Number(totalScore);
//						if(tempScore>100){
//							popup.warPop("请输入0-100之间的数字，可以保留一位小数");
//							$("#totalScore"+index).val('');
//							return false;							
//						}else{
//							var fax=/^\d{1,3}(\.\d{1})?$/; // 成绩有1-3位大于等于0的数字，可有1位小数
//							if(fax.test(Number(totalScore))){	
//								$("#totalScore"+index).val(Number(totalScore));			
//							}else{
//								popup.warPop("请输入0-100之间的数字，可以保留一位小数");
//								$("#totalScore"+index).val('');
//								return false;	
//							}					
//						}						
//					}
//					$("#totalScore"+index).removeAttr("disabled");
//				}else{ // 等级状态
//					//让总评成绩的下拉框可选		
//					$("#selectTotalScore"+index).removeAttr("disabled");
//					$("#selectTotalScore"+index).removeClass("disabled");
//					$("#totalScore"+index).val($("#selectTotalScore"+index).val());
//					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore"));	
//				}			
//			}else{
//				//根据特殊情况计算总评成绩
//				var score=objSpecialCase.find("option:selected").attr("score"); // 特殊情况分数
//				if(markupScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制					
//					$("#totalScore"+index).val(score);
//					$("#totalScore"+index).attr("disabled","disabled");
//					$("#totalScore"+index).addClass("disabled");
//				}else{
//					var scoreRegimenDetailId=markUpExamScoreEnter.getScoreRegimenDetailId(score);
//					$("#selectTotalScore"+index).val(scoreRegimenDetailId); // 设定选中		
//
//					$("#totalScore"+index).val(scoreRegimenDetailId); // 保存分制明细id到隐藏域
//					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore")); // 保存对应的百分制成绩到隐藏域
//					
//					$("#selectTotalScore"+index).attr("disabled","disabled");
//					$("#selectTotalScore"+index).addClass("disabled");
//				}				
//			}
//			//markUpExamScoreEnter.calculationWaitEnterCount(); // 计算 教学班共有 X条 未完成录入		
//		},
		
//		// 计算 教学班共有 X条 未完成录入
//		calculationWaitEnterCount:function(){
//			var count=0;	
//			$("#tbodycontent input[name='totalScore']").each(function () {	
//				var totalScore=$.trim($(this).val());
//				if(totalScore===undefined || totalScore==="" || totalScore==="null" || totalScore===null){
//					count++;
//				}
//			});			
//			$("#spanWaitEntry").text(count+"条");
//			return count;
//		},
		
		// 根据特殊情况分数转换获取分制明细id
		getScoreRegimenDetailId:function(score){
			if(scoreRegimenDetail && scoreRegimenDetail.length>0){
				for(var i=0;i<scoreRegimenDetail.length;i++){
					if(Number(scoreRegimenDetail[i].scoreBegin)>Number(score) && Number(score)>=Number(scoreRegimenDetail[i].scoreEnd)){
						return scoreRegimenDetail[i].scoreRegimenDetailId;
					}
					if(parseInt(score)===100 && parseInt(scoreRegimenDetail[i].scoreBegin)===100){ // 对于100的特殊情况
						return scoreRegimenDetail[i].scoreRegimenDetailId;
					}
				}				
			}
			return "";
		},		
        
        //获取大于等于查询条件中的学年学期的option
        getSemester:function(){
        	var selVal=$("#studySemester").val(); // 选中值
		    var options=[];
		    for(var i=0;i<$("#studySemester option").length;i++){
		    	var val=$("#studySemester").get(0).options[i].value;
		    	var txt=$("#studySemester").get(0).options[i].text;
		    	options.push('<option title="'+txt+'" value="'+val+'">'+txt+'</option>');
		    	if(val===selVal){
		    		break;
		    	}
		    }
		    return options.join('');
        },
        
      //根据条件删除原始成绩	
		deleteOriginalScore:function(){	
			// 获取该页面所有原始成绩id
			var originalScoreIds=[];
			if(markupScoreSet && markupScoreSet.list){
				for(var i=0;i<markupScoreSet.list.length;i++){
					originalScoreIds.push(markupScoreSet.list[i].originalScoreId);
				}
			}	
			ajaxData.contructor(false);
            ajaxData.setContentType("application/json;charset=UTF-8");
			ajaxData.request(url.DELETE_ORIGINAL_SCORE, JSON.stringify(originalScoreIds), function(data) {
				ajaxData.setContentType("application/x-www-form-urlencoded");
				if (data.code == config.RSP_SUCCESS) {					
					// 刷新列表					
					markUpExamScoreEnter.getInitData();	
//					markupScoreSet.scoreRegimenId=$("#scoreRegimenId").val(); // 分制id
//					markupScoreSet.scoreRegimenName=$("#scoreRegimenId").find("option:selected").text(); // 分制名称						
//					
//					$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(markupScoreSet));
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}
			})					
		},
		
		//录入弹窗
		popEntry: function(obj){				
			popup.data("obj",obj);//传值过去
			var optionHTML=markUpExamScoreEnter.getSemester();
			popup.data("optionHTML",optionHTML);			
			var myDialog= popup.open('./teacherservice/score/html/markUpExamScoreEnterList.html',
				{
					id : 'markUpExamScoreEntry',// 唯一标识
					title : '补考成绩录入',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						//var v = iframeObj.$("#addForm").valid(); // 验证表单
						markUpExamScoreEnter.save(myDialog,iframeObj,approvalStatus.TemporaryMemory.value); // 审核状态(1-暂存，2-已送审，3-已审核)			
						return false;	
					},focus:true},
					{name:'关 闭',callback:function(){
						popup.askPop("确认关闭吗？",function(){
							myDialog.close();
						});
						return false;
					}},
					{name:'送 审',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						markUpExamScoreEnter.review(myDialog,iframeObj,approvalStatus.Submitted.value); // 审核状态(1-暂存，2-已送审，3-已审核)
						return false;
					}}]
				});
		},	
		
		//查看弹窗
		popView: function(obj){				
			popup.data("obj",obj);//传值过去
			var myDialog= popup.open('./teacherservice/score/html/markUpExamScoreEnterView.html',
				{
					id : 'markUpExamScoreEntryView',// 唯一标识
					title : '补考成绩查看',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 700,// 弹窗高度
					button:[
					{name:'关 闭',callback:function(){
						popup.askPop("确认关闭吗？",function(){
							myDialog.close();
						});
						return false;
					}}]
				});
		}
    }
    module.exports = markUpExamScoreEnter;
    window.markUpExamScoreEnter = markUpExamScoreEnter;
});