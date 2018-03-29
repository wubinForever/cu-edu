/**
 * 环节成绩录入
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
    var tacheScoreJs = require("localPath/tacheScoreSet");
    var tacheScoreSet; // 课程/补考成绩录入相关设置表（包括分制、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var tacheScoreEnter = {
    		//主页面列表
    		indexInit:function(){
    			// 加载当前学年学期
    			simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
    			
    			tacheScoreEnter.bindIndexList();
    			
    			//学年学期变动，加载列表
    			$("#semester").change(function(){
    				tacheScoreEnter.bindIndexList();
    			});
    			
    			// 录入
    			$(document).on("click", "[name='entry']", function() {
    				tacheScoreEnter.popEntry(this);
    			});
    			
    			// 查看
    			$(document).on("click", "[name='view']", function() {
    				tacheScoreEnter.popView(this);
    			});
    		},
    		
    		//绑定主页面列表
    		bindIndexList:function(){
    			var semester =$("#semester").val();				
    			//获取列表数据
    			ajaxData.request(url.GET_TACHE_SCORE_FOR_TEACH_LIST, {semester:semester}, function(data) {
    				if (data.code == config.RSP_SUCCESS) {
    					if(data.data && data.data.length>0 ){
    						$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
    															
    					}else{
    						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
    					}
    				}
    			});
    		},
    		
        // 初始化
        init : function() { 
        	
        	var obj = popup.data("obj");
        	$("#academicYear").val($(obj).attr("academicYear"));
			$("#semesterCode").val($(obj).attr("semesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#classId").val($(obj).attr("classId"));	
			
			$("#courseInfo").val($(obj).attr("courseInfo"));	
			$("#className").val($(obj).attr("className"));	
			
        	tacheScoreEnter.getInitData();
			
            // 设置成绩分制
            $(document).on("click", "[name='set']", function() {
            	tacheScoreJs.set(2); // 1点查询时进去，2 点设置成绩分制链接进去
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
				tacheScoreEnter.calculationTotalScore($(this).attr("index"));
			});
			
			// 给特殊情况下拉框绑定change事件
			$(document).on("change", "[name='specialCaseId']", function() {
				tacheScoreEnter.calculationTotalScore($(this).attr("index"));			
			});
			
			// 给总评成绩下拉框绑定change事件
			$(document).on("change", "[name='selectTotalScore']", function() {
				tacheScoreEnter.calculationTotalScore($(this).attr("index"));	
			});	
        }, 
        
     // 初始化
        initView : function() {        	
        	var obj = popup.data("obj");
        	$("#academicYear").val($(obj).attr("academicYear"));
			$("#semesterCode").val($(obj).attr("semesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#classId").val($(obj).attr("classId"));	
			
			$("#courseInfo").val($(obj).attr("courseInfo"));	
			$("#className").val($(obj).attr("className"));	
			
        	tacheScoreEnter.getInitData();
        }, 
        
      //显示当前选中信息
        showCurrentSelectedInfo:function(){        	
        	var courseInfo=$("#courseInfo").val();
        	var className=$("#className").val();
		    $("#spanCourse").text("环节："+courseInfo);
		    $("#spanClass").text("行政班："+className);
		    $("#spanScoreSet").text("总评成绩分制：");    
		    $("#spanCourse").attr("title","环节："+courseInfo);
		    $("#spanClass").attr("title","行政班："+className);
		    $("#spanScoreSet").attr("title","总评成绩分制：");
        },
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){	
			tacheScoreEnter.showCurrentSelectedInfo();
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.courseId==dataConstant.EMPTY){
				popup.warPop("请先选择环节");
				tacheScoreEnter.bindNoData();	
				return false;
			}
			else{				
				// 查询成绩分制
				ajaxData.contructor(false);
				ajaxData.request(url.GET_TACHE_SCORE_CONSTITUTE_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.scoreRegimenName!=""){
							tacheScoreSet=data.data;
							$("#courseScoreSetId").val(tacheScoreSet.tacheScoreConstituteId); // 课程/补考成绩录入相关设置id
							$("#scoreRegimenId").val(tacheScoreSet.scoreRegimenId); // 分制id
							$("#scoreRegimenName").val(tacheScoreSet.scoreRegimenName); //分制名称
							
							var str=[];	
							str.push("总评成绩分制："+tacheScoreSet.scoreRegimenName);							
							$("#spanScoreSet").text(str.join('')); // 设置总评成绩分制
							$("#spanScoreSet").attr("title",str.join(''));
							
							//获取列表数据
							queryParams.isAuthority=false; // 进行数据权限过滤
							ajaxData.request(url.GET_TACHE_SCORE_LIST, queryParams, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if(data.data && data.data.length>0 ){
										tacheScoreSet["list"]=data.data;
										$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(tacheScoreSet));
										//绑定特殊情况下拉框
										tacheScoreEnter.bindSpecialCaseSelect();
																			
									}else{
										tacheScoreEnter.bindNoData();										
									}
									tacheScoreEnter.calculationWaitEnterCount(); // 计算 班级环节中，共有X条未完成录入	
									//判断当前环节成绩是否已经送审
//									$("#btnSave").removeAttr("disabled"); // 设置保存按钮先起效
//									$("#btnReview").removeAttr("disabled"); // 设置送审按钮先起效
//									$("#set").show(); // 让分制链接先显示
									if(data.data && data.data.length>0){
										if(tacheScoreEnter.haveWaitAudit(data.data)){ // 只要有一个已送审或者已审核，则整个页面不可编辑
											$("#btnSave").attr("disabled","disabled"); // 设置保存按钮失效
											$("#btnReview").attr("disabled","disabled"); // 设置送审按钮失效
											$("#set").hide(); // 让分制链接隐藏
											$("#tbodycontent input").each(function () {	
												$(this).attr("disabled","disabled"); // 所有的文本框不可编辑
											});
											$("#tbodycontent select").each(function () {	
												$(this).attr("disabled","disabled"); // 所有的下拉框不可编辑
											});
										}										
									}
									if(tacheScoreSet.allowModify===0){
										$("#set").hide(); // 让分制链接隐藏
									}
								} else {
									// 提示失败
									popup.errPop(data.msg);
									tacheScoreEnter.bindNoData();	
									return false;
								}				
							},true);							
						}
						else{
							$("#spanScoreSet").text("总评成绩：");
							if(data.data && data.data.allowModify === 0){
								popup.warPop("成绩分制未设置，请联系管理员！");
								return false;
							}else{
								popup.askPop("请先设置成绩分制",function(){
									//打开成绩分制页面
									tacheScoreJs.set(1); // 1点查询时进去，2 点设置成绩分制链接进去
								},function(){
									tacheScoreEnter.bindNoData();
								});
							}							
						}
					} else {
						// 提示失败
						popup.errPop(data.msg);
						tacheScoreEnter.bindNoData();	
						return false;
					}				
				});	
			}	
		},
		
		// 判断当前加载的数据中是否有已送审，或者已审核的数据，有待审核的数据时返回ture
		haveWaitAudit:function(data){
			if(data && data.length>0){
				for(var i=0;i<data.length;i++){
					if(data[i].auditStatus===approvalStatus.Submitted.value || data[i].auditStatus===approvalStatus.Actived.value){
						return true;
					}
				}				
			}
			return false;
		},
		
		//没有数据时绑定暂无数据
		bindNoData:function(){
			$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
			tacheScoreEnter.calculationWaitEnterCount(); // 计算 教学班共有 0条 未完成录入	
			$("#btnSave").attr("disabled","disabled"); // 设置保存按钮失效
			$("#btnReview").attr("disabled","disabled"); // 设置送审按钮失效
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
						if(tacheScoreSet.scoreRegimenName!==dataConstant.HANDROD_CREDIT_NAME){ // 等级制
							//绑定等级制情况下的总评成绩下拉框
							tacheScoreEnter.bindScoreRegimenDetailSelect();
						}else{
							// 百分制，如果特殊情况选中，则让对应的文本框disabled
							$("select[name='specialCaseId']").each(function(index,item){
								var index=$(this).attr("index");
								var specialCaseId=$(this).val();
								if(specialCaseId!==""){ //如果特殊情况选中，则让百分制总评成绩只读
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
			ajaxData.request(url.GET_SCORE_REGIMEN_DETAIL_LIST, {scoreRegimenId:tacheScoreSet.scoreRegimenId}, function(data) {
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
        
//        // 获取要保存的数据
//        getSaveData:function(){        	
//        	var saveParams=utils.getQueryParamsByFormId("queryForm"); // 获取要保存的参数
//			saveParams["courseScoreSetId"]=tacheScoreSet.tacheScoreConstituteId; // 课程/补考成绩录入相关设置id 环节成绩分制id
//			saveParams["scoreRegimenId"]=tacheScoreSet.scoreRegimenId; // 分制id
//        	var list=[]; // 要保存的数据
//        	//遍历设置了总评成绩的
//			$("#tbodycontent input[name='totalScore']").each(function () {	
//					var index=$(this).attr("index");
//					var originalScore={};					
//					originalScore.originalScoreId=$(this).attr("originalScoreId"); // 原始成绩ID
//					originalScore.studentId=$(this).attr("studentId"); // 学生ID					
//					originalScore.totalScore=($("#totalScore"+index)==undefined)?null:$("#totalScore"+index).val(); // 总评成绩
//					originalScore.specialCaseId=($("#specialCaseId"+index)==undefined)?null:$("#specialCaseId"+index).val(); // 特殊情况
//					originalScore.remark=($("#remark"+index)==undefined)?null:$("#remark"+index).val(); // 备注
//					originalScore.tacheSubject=($("#tacheSubject"+index)==undefined)?null:$("#tacheSubject"+index).val(); // 环节题目
//					//percentageScore 对应的百分制成绩
//					if(tacheScoreSet && tacheScoreSet.scoreRegimenName && tacheScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){
//						originalScore.percentageScore=originalScore.totalScore;
//					}
//					else{
//						originalScore.percentageScore=$("#totalScore"+index).attr("percentageScore");
//					}
//					list.push(originalScore);				
//            });
//			saveParams["studentScoreDtoList"]=list;	
//			return saveParams;
//        },
		
		// 获取要保存的数据
        getSaveData:function(iframeObj){  
        	var saveParams=utils.getQueryParamsByFormObject(iframeObj.$("#queryForm")); // 获取要保存的参数
        	var list=[]; // 要保存的数据
        	//遍历设置了总评成绩的
        	iframeObj.$("#tbodycontent input[name='totalScore']").each(function () {	
					var index=$(this).attr("index");
					var originalScore={};					
					originalScore.originalScoreId=$(this).attr("originalScoreId"); // 原始成绩ID
					originalScore.studentId=$(this).attr("studentId"); // 学生ID					
					originalScore.totalScore=(iframeObj.$("#totalScore"+index)==undefined)?null:iframeObj.$("#totalScore"+index).val(); // 总评成绩
					originalScore.specialCaseId=(iframeObj.$("#specialCaseId"+index)==undefined)?null:iframeObj.$("#specialCaseId"+index).val(); // 特殊情况
					originalScore.remark=(iframeObj.$("#remark"+index)==undefined)?null:iframeObj.$("#remark"+index).val(); // 备注
					originalScore.tacheSubject=(iframeObj.$("#tacheSubject"+index)==undefined)?null:iframeObj.$("#tacheSubject"+index).val(); // 环节题目
					//percentageScore 对应的百分制成绩
					if(saveParams.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){
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
			var saveParams=tacheScoreEnter.getSaveData(iframeObj); // 获取要保存的数据	
			saveParams["auditStatus"]=auditStatus; // 审核状态
			ajaxData.contructor(false);
            ajaxData.setContentType("application/json;charset=UTF-8");
			ajaxData.request(url.SAVE_TACHE_SCORE, JSON.stringify(saveParams), function(data) {
				ajaxData.setContentType("application/x-www-form-urlencoded");				
				if (data.code == config.RSP_SUCCESS) {	
					myDialog.close(); //关闭弹窗									
												
					popup.okPop("保存成功", function() {
						tacheScoreEnter.bindIndexList();
						//course.pagination.loadData();// 刷新列表		
					});// 提示成功									
				} else {
					// 提示失败
					popup.errPop(data.msg);
				}	
					
			});		
		},
		
		
		// 送审
		review:function(myDialog,iframeObj,auditStatus){
			var count=tacheScoreEnter.calculationWaitEnterCount(iframeObj); // 教学班未完成录入数
			if(count>0){
				popup.warPop("请先完成所有学生的成绩录入");
				return false;
			}
			else{
				popup.askPop("送审后将不能再修改，确定送审吗？",function(){
					tacheScoreEnter.save(myDialog,iframeObj,approvalStatus.Submitted.value); // 审核状态(1-暂存，2-已送审，3-已审核)
				});				
			}	
		},
		
		
		//计算总评成绩
		calculationTotalScore:function(index){
			var objSpecialCase=$("#specialCaseId"+index); // 特殊情况jquery对象
			var specialCaseId=objSpecialCase.val(); // 特殊情况值：""为不是特殊情况，不为""说明是特殊情况
			var isBFZ=(tacheScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME); // 是否为百分制： true为百分制，否则为等级制
			
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
					
					var scoreRegimenDetailId=tacheScoreEnter.getScoreRegimenDetailId(score);
					$("#selectTotalScore"+index).val(scoreRegimenDetailId); // 设定选中		

					$("#totalScore"+index).val(scoreRegimenDetailId); // 保存分制明细id到隐藏域
					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore")); // 保存对应的百分制成绩到隐藏域
					
					
				}
			}
			tacheScoreEnter.calculationWaitEnterCount(); // 计算 教学班共有 X条 未完成录入
		},
        
//        //计算总评成绩
//		calculationTotalScore:function(index){	
//            var objSpecialCase=$("#specialCaseId"+index); // 特殊情况jquery对象
//			var specialCaseId=objSpecialCase.val(); 			
//			if(specialCaseId===""){
//				//为“”说明了不是特殊情况
//				//不考虑特殊情况没值的情况				
//				if(tacheScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制
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
//					
//					//让总评成绩的下拉框可选		
//					$("#selectTotalScore"+index).removeAttr("disabled");
//					$("#selectTotalScore"+index).removeClass("disabled");
//					
//					$("#totalScore"+index).val($("#selectTotalScore"+index).val());
//					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore"));	
//				}			
//			}else{
//				//根据特殊情况计算总评成绩
//				var score=objSpecialCase.find("option:selected").attr("score"); // 特殊情况分数
//				if(tacheScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制					
//					$("#totalScore"+index).val(score);
//					$("#totalScore"+index).attr("disabled","disabled");
//					$("#totalScore"+index).addClass("disabled");
//				}else{
//					var scoreRegimenDetailId=tacheScoreEnter.getScoreRegimenDetailId(score);
//					$("#selectTotalScore"+index).val(scoreRegimenDetailId); // 设定选中		
//
//					$("#totalScore"+index).val(scoreRegimenDetailId); // 保存分制明细id到隐藏域
//					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore")); // 保存对应的百分制成绩到隐藏域
//					
//					$("#selectTotalScore"+index).attr("disabled","disabled");
//					$("#selectTotalScore"+index).addClass("disabled");
//				}				
//			}
//			tacheScoreEnter.calculationWaitEnterCount(); // 计算 教学班共有 X条 未完成录入		
//		},
		
		// 计算 教学班共有 X条 未完成录入
		calculationWaitEnterCount:function(iframeObj){
			var count=0;
			if(iframeObj){
				iframeObj.$("#tbodycontent input[name='totalScore']").each(function () {	
					var totalScore=$.trim($(this).val());
					if(totalScore===undefined || totalScore==="" || totalScore==="null" || totalScore===null){
						count++;
					}
				});			
			}else{
				$("#tbodycontent input[name='totalScore']").each(function () {	
					var totalScore=$.trim($(this).val());
					if(totalScore===undefined || totalScore==="" || totalScore==="null" || totalScore===null){
						count++;
					}
				});			
			}
			
			$("#spanWaitEntry").text(count);
			return count;
		},
		
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
		
		//根据条件删除原始成绩	
		deleteOriginalScore:function(){	
			if(tacheScoreSet){ //有原始成绩，去删除
				// 获取该页面所有原始成绩id
				var originalScoreIds=[];
				if(tacheScoreSet && tacheScoreSet.list){
					for(var i=0;i<tacheScoreSet.list.length;i++){
						originalScoreIds.push(tacheScoreSet.list[i].originalScoreId);
					}
				}
				ajaxData.contructor(false);
	            ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(url.DELETE_ORIGINAL_SCORE, JSON.stringify(originalScoreIds), function(data) {
					ajaxData.setContentType("application/x-www-form-urlencoded");
					if (data.code == config.RSP_SUCCESS) {					
						// 刷新列表						
						tacheScoreEnter.getInitData();														
					} else {
						// 提示失败
						popup.errPop(data.msg);
						return false;
					}
				})
			}else{
				// 没有原始成绩，直接刷新列表
				ajaxData.setContentType("application/x-www-form-urlencoded");
				tacheScoreEnter.getInitData();
			}						
		},
		
		//录入弹窗
		popEntry: function(obj){				
			popup.data("obj",obj);//传值过去
			var myDialog= popup.open('./teacherservice/score/html/tacheScoreEnterList.html',
				{
					id : 'tacheEntry',// 唯一标识
					title : '录入环节成绩',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[{name:'保 存',callback:function(){
						var iframeObj = this.iframe.contentWindow;
						//var v = iframeObj.$("#addForm").valid(); // 验证表单
						tacheScoreEnter.save(myDialog,iframeObj,approvalStatus.TemporaryMemory.value); // 审核状态(1-暂存，2-已送审，3-已审核)			
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
						tacheScoreEnter.review(myDialog,iframeObj,approvalStatus.Submitted.value); // 审核状态(1-暂存，2-已送审，3-已审核)
						return false;
					}}]
				});
		},	
		
		//查看弹窗
		popView: function(obj){				
			popup.data("obj",obj);//传值过去
			var myDialog= popup.open('./teacherservice/score/html/tacheScoreEnterView.html',
				{
					id : 'tacheEntryView',// 唯一标识
					title : '环节成绩查看',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
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
    module.exports = tacheScoreEnter;
    window.tacheScoreEnter = tacheScoreEnter;
});