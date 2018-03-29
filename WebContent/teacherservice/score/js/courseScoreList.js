/**
 * 课程成绩录入
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
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
    var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
    var approvalStatus=require("basePath/enumeration/score/ApprovalStatus"); 
    var scoreType=require("basePath/enumeration/score/ScoreType");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var courseSetJs=require("localPath/courseScoreSet");
    var courseScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组
    
    
    

    var courseScoreList = {
    	
    	
    		
        // 初始化
        init : function() {        	
        	var obj = popup.data("obj");
        	$("#academicYear").val($(obj).attr("academicYear"));
			$("#semesterCode").val($(obj).attr("semesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#theoreticalTaskId").val($(obj).attr("theoreticalTaskId"));
			
			$("#courseInfo").val($(obj).attr("courseInfo"));
			$("#teachingClassNo").val($(obj).attr("teachingClassNo"));
			
			popup.setData("courseScoreList",courseScoreList);
			
        	courseScoreList.getInitData();
			
            // 设置成绩构成
            $(document).on("click", "[name='set']", function() {
            	//调用后台，判断是否可以进行修改
            	courseSetJs.set(2);   // 1点查询时进去，2 点设置成绩构成链接进去         	
            });            
			
			//平时成绩 期中成绩 期末成绩 技能成绩    只允许输入数字
			$(document).on("keydown", "input[myattr='score']", function(e) {
				if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8 || e.keyCode==110|| e.keyCode==9){               	
				}else{
					return false;
				}
	        });
			
			//根据 平时成绩 期中成绩 期末成绩 技能成绩    计算总评成绩
			$(document).on("blur", "input[myattr='score']", function() {
				courseScoreList.calculationTotalScore($(this).attr("index"));
			});
			
			// 计算总评成绩
			$(document).on("blur", "input[name='totalScore']", function() {
				courseScoreList.calculationTotalScore($(this).attr("index"));
			});
		
			
			// 给特殊情况下拉框绑定change事件
			$(document).on("change", "[name='specialCaseId']", function() {
				courseScoreList.calculationTotalScore($(this).attr("index"));			
			});
			
			// 给总评成绩下拉框绑定change事件
			$(document).on("change", "[name='selectTotalScore']", function() {
				courseScoreList.calculationTotalScore($(this).attr("index"));	
			});	
        }, 
        
       
        
        //显示当前选中信息
        showCurrentSelectedInfo:function(){   
        	var courseInfo=$("#courseInfo").val();
        	var teachingClassNo=$("#teachingClassNo").val();
		    $("#spanCourse").text("课程："+courseInfo);			    		   
			$("#spanTeachingClassNo").text("教学班号："+teachingClassNo);					
			
			$("#spanCourse").attr("title","课程："+courseInfo);
			$("#spanTeachingClassNo").attr("title","教学班号："+teachingClassNo);
			
			$("#set").show(); // 让构成链接先显示
			var courseScoreIndex = popup.getData("courseScoreIndex");
			courseScoreIndex.courseScoreEntryWindow.button({
              name: '保 存',
              disabled: false
          }).button({
              name: '送 审',
              disabled: false
          });
        },
        
        
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){
			courseScoreList.showCurrentSelectedInfo();		
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.theoreticalTaskId==dataConstant.EMPTY){
				popup.warPop("请先选择教学班号");
				courseScoreList.bindNoData();
				return false;
			}
			else{				
				// 查询成绩构成
				queryParams.classId=queryParams.theoreticalTaskId;				
				queryParams.scoreType=scoreType.FirstTest.value; //首考
				ajaxData.contructor(false);
				ajaxData.request(url.GET_COURSE_SCORE_SET_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.scoreRegimenName!="" ){
							courseScoreSet=data.data;
							$("#courseScoreSetId").val(courseScoreSet.courseScoreSetId); // 课程/补考成绩录入相关设置id
							$("#scoreRegimenId").val(courseScoreSet.scoreRegimenId); // 分制id
							$("#scoreRegimenName").val(courseScoreSet.scoreRegimenName); //分制名称
							var desc="";
							if(courseScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制
								var str=[];
								var flag=false; // 标识 平时成绩、期中成绩、期末成绩、技能成绩 至少有一项，默认没有一项
								if(courseScoreSet.usualRatio!=null){	
									flag=true;
									str.push("平时成绩"+parseFloat(courseScoreSet.usualRatio)+"%");
								}
								if(courseScoreSet.midtermRatio!=null){
									flag=true;
									str.push("期中成绩"+parseFloat(courseScoreSet.midtermRatio)+"%");
								}
								if(courseScoreSet.endtermRatio!=null){	
									flag=true;
									str.push("期末成绩"+parseFloat(courseScoreSet.endtermRatio)+"%");
								}
								if(courseScoreSet.skillRatio!=null){
									flag=true;
									str.push("技能成绩"+parseFloat(courseScoreSet.skillRatio)+"%");
								}
								if(flag){
									desc="总评成绩（百分制）："+str.join('+');
								}else{
									desc="总评成绩（百分制）：只录入总评成绩";
								}
							}else{ // 等级制
								desc="总评成绩："+courseScoreSet.scoreRegimenName;
							}							
							$("#spanScoreSet").text(desc);
							$("#spanScoreSet").attr("title",desc);
							$("#tbodytitle").empty().append($("#bodyTitleImpl").tmpl(data.data)); // 设置动态表头
							
							//获取列表数据
							queryParams.isAuthority=false; // 不进行数据权限过滤
							ajaxData.request(url.GET_COURSE_SCORE_ENTRY_LIST, queryParams, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if(data.data && data.data.length>0 ){
										courseScoreSet["list"]=data.data;
										$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(courseScoreSet));
										//绑定特殊情况下拉框
										courseScoreList.bindSpecialCaseSelect();
																			
									}else{
										courseScoreList.bindNoData();
									}
									courseScoreList.calculationWaitEnterCount(); // 计算 教学班共有 X条 未完成录入	
									//判断当前教学班成绩是否已经送审
									if(data.data && data.data.length>0){
										if(courseScoreList.haveWaitAudit(data.data)){ // 只要有一个已送审或者已审核，则整个页面不可编辑
											
											var courseScoreIndex = popup.getData("courseScoreIndex");
											courseScoreIndex.courseScoreEntryWindow.button({
								              name: '保 存',
								              disabled: true
								          }).button({
								              name: '送 审',
								              disabled: true
								          });
											
											
											
											$("#set").hide(); // 让构成链接隐藏
											
											
											
											$("#tbodycontent input").each(function () {	
												$(this).attr("disabled","disabled"); // 所有的文本框不可编辑
											});
											$("#tbodycontent select").each(function () {	
												$(this).attr("disabled","disabled"); // 所有的下拉框不可编辑
											});
										}
									}
									if(courseScoreSet.allowModify===0){
										$("#set").hide(); // 让构成链接隐藏
									}
								} else {
									// 提示失败
									popup.errPop(data.msg);
									courseScoreList.bindNoData();
									return false;
								}				
							},true);							
						}
						else{
							$("#spanScoreSet").text("总评成绩：");
							if(data.data && data.data.allowModify === 0){
								popup.warPop("成绩构成未设置，请联系管理员！");
								courseScoreList.bindNoData();
								$("#set").hide(); // 让构成链接隐藏
								return false;
							}else{
								popup.askPop("请先设置成绩分制",function(){
									//打开成绩构成页面
									//调用后台，判断是否可以进行修改
									courseSetJs.set(1);  // 1点查询时进去，2 点设置成绩构成链接进去
									//courseScoreList.set();
								},function(){
									courseScoreList.bindNoData();
								});
							}							
						}
					} else {
						// 提示失败
						popup.errPop(data.msg);
						courseScoreList.bindNoData();
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
			$("#tbodycontent").empty().append("<tr><td colspan='10'></td></tr>").addClass("no-data-html");
			courseScoreList.calculationWaitEnterCount(); // 计算 教学班共有 0条 未完成录入
			
			var courseScoreIndex = popup.getData("courseScoreIndex");
			courseScoreIndex.courseScoreEntryWindow.button({
              name: '保 存',
              disabled: true
          }).button({
              name: '送 审',
              disabled: true
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
						
						if(courseScoreSet.scoreRegimenName!==dataConstant.HANDROD_CREDIT_NAME){ // 等级制
							//绑定等级制情况下的总评成绩下拉框
							courseScoreList.bindScoreRegimenDetailSelect();
						}else{ // 百分制
							$("#tbodycontent input[name='totalScore']").each(function(index,item){								
								var specialCaseId=$("#specialCaseId"+$(this).attr("index")).val();
								if(specialCaseId!==""){ //如果特殊情况选中，则让百分制总评成绩只读
									$(this).attr("readonly","readonly");
								}
							});
						}	
					}
				}
			})
		},
		
		//绑定分制明细下拉选择
		bindScoreRegimenDetailSelect:function(){
			ajaxData.request(url.GET_SCORE_REGIMEN_DETAIL_LIST, {scoreRegimenId:courseScoreSet.scoreRegimenId}, function(data) {
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
        
        // 获取要保存的数据
        getSaveData:function(){ 
        	var saveParams=utils.getQueryParamsByFormId("queryForm"); // 获取要保存的参数
        	var list=[]; // 要保存的数据
        	//遍历设置了总评成绩的
        	$("#tbodycontent input[name='totalScore']").each(function () {	
					var index=$(this).attr("index");
					var originalScore={};					
					originalScore.originalScoreId=$(this).attr("originalScoreId"); // 原始成绩ID
					originalScore.studentId=$(this).attr("studentId"); // 学生ID					
					originalScore.usualScore=($("#usualScore"+index)==undefined)?null:$("#usualScore"+index).val(); // 平时成绩
					originalScore.midtermScore=($("#midtermScore"+index)==undefined)?null:$("#midtermScore"+index).val(); // 期中成绩
					originalScore.endtermScore=($("#endtermScore"+index)==undefined)?null:$("#endtermScore"+index).val(); // 期末成绩
					originalScore.skillScore=($("#skillScore"+index)==undefined)?null:$("#skillScore"+index).val(); // 技能成绩
					originalScore.totalScore=($("#totalScore"+index)==undefined)?null:$("#totalScore"+index).val(); // 总评成绩
					originalScore.specialCaseId=($("#specialCaseId"+index)==undefined)?null:$("#specialCaseId"+index).val(); // 特殊情况
					originalScore.remark=($("#remark"+index)==undefined)?null:$("#remark"+index).val(); // 备注
					//percentageScore 对应的百分制成绩
					if(saveParams.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){
						originalScore.percentageScore=originalScore.totalScore;
					}
					else{
						originalScore.percentageScore=$("#totalScore"+index).attr("percentageScore");
					}
					list.push(originalScore);				
            });
			saveParams["studentScoreDtoList"]=list;	
			return saveParams;
        },
        
        // 保存
		save:function(auditStatus){
			var saveParams=courseScoreList.getSaveData(); // 获取要保存的数据	
			saveParams["auditStatus"]=auditStatus; // 审核状态
			//ajaxData.contructor(false);
            ajaxData.setContentType("application/json;charset=UTF-8");
			ajaxData.request(url.SAVE_COURSE_SCORE, JSON.stringify(saveParams), function(data) {
				ajaxData.setContentType("application/x-www-form-urlencoded");				
				if (data.code == config.RSP_SUCCESS) {	
					
					
					var courseScoreIndex = popup.getData("courseScoreIndex");
					courseScoreIndex.courseScoreEntryWindow.close();
					//popup.okPop("保存成功", function(){});// 提示成功	
					courseScoreIndex.bindIndexList();
					
				} else {
					// 提示失败
					popup.errPop(data.msg);
				}					
			});		
		},
		
		// 送审
		review:function(auditStatus){
			var count=courseScoreList.calculationWaitEnterCount(); // 教学班未完成录入数
			if(count>0){
				popup.warPop("请先完成所有学生的成绩录入");
				return false;
			}
			else{
				popup.askPop("送审后将不能再修改，确定送审吗？",function(){
					courseScoreList.save(approvalStatus.Submitted.value); // 审核状态(1-暂存，2-已送审，3-已审核)
				});				
			}	
		},
		
		//计算总评成绩
		calculationTotalScore:function(index){

			courseScoreList.validateScore("usualRatio","usualScore",index);
			courseScoreList.validateScore("midtermRatio","midtermScore",index);
			courseScoreList.validateScore("endtermRatio","endtermScore",index);
			courseScoreList.validateScore("skillRatio","skillScore",index);
			
			
			var objSpecialCase=$("#specialCaseId"+index); // 特殊情况jquery对象
			var specialCaseId=objSpecialCase.val(); // 特殊情况值：""为不是特殊情况，不为""说明是特殊情况
			var isBFZ=(courseScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME); // 是否为百分制： true为百分制，否则为等级制
			var onlyTotal=!(courseScoreSet.usualRatio!=null || courseScoreSet.midtermRatio!=null || courseScoreSet.endtermRatio!=null || courseScoreSet.skillRatio!=null); // 只录入总评成绩：true只录入总评成绩，false总评成绩有各项成绩组成
			var fax=/^\d{1,3}(\.\d{1})?$/; // 成绩有1-3位大于等于0的数字，可有1位小数
			if(specialCaseId===""){ //第一个分支，判断总评成绩是否由特殊情况决定
				//do:总评成绩不由特殊情况决定	
				if(isBFZ){// 第二个分支，判断总评成绩的分制 （百分制or等级制）
					//do:总评成绩不由特殊情况决定->百分制
					if(onlyTotal){ // 第三个分支，判断是否只录入总评成绩
						//do:总评成绩不由特殊情况决定->百分制->只录入总评成绩
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
						//do:总评成绩不由特殊情况决定->百分制->总评成绩由各项成绩组成
						//1.总评成绩文本框框置灰；
						//2.根据各成绩组成本框进行验证计算总评成绩并赋值给总评成绩；
						
						$("#totalScore"+index).attr("readonly","readonly"); // 只读状态
						
						var totalScore=0; // 总评成绩
						var allIn=true; //标识平时成绩、期中成绩、期末成绩、技能成绩 已全部录入成绩
						
						//按 平时成绩 期中成绩 期末成绩 技能成绩    计算总评成绩
						if(courseScoreSet.usualRatio!=null){// 有平时成绩 
							var usualScore=$.trim($("#usualScore"+index).val()); // 平时成绩
							if(usualScore!=null && usualScore!="" ){
								var tempScore=Number(usualScore);
								if(tempScore>100){
									popup.warPop("请输入0-100之间的数字，可以保留一位小数");
									$("#usualScore"+index).val('');
									return false;							
								}else{
									if(fax.test(Number(usualScore))){
										totalScore += Number(usualScore)*Number(courseScoreSet.usualRatio);
										$("#usualScore"+index).val(Number(usualScore));	
									}else{
										popup.warPop("请输入0-100之间的数字，可以保留一位小数");
										$("#usualScore"+index).val('');
										return false;	
									}														
								}						
							}
							else{
								if(parseInt(courseScoreSet.usualRatio)!=0){
									allIn=false; //没有录入平时成绩 
								}								
							}
						} 
						
						if(courseScoreSet.midtermRatio!=null){// 有期中成绩
							var midtermScore=$.trim($("#midtermScore"+index).val()); // 期中成绩
							if(midtermScore!=null && midtermScore!="" ){
								var tempScore=Number(midtermScore);
								if(tempScore>100){
									popup.warPop("请输入0-100之间的数字，可以保留一位小数");
									$("#midtermScore"+index).val('');
									return false;							
								}else{
									if(fax.test(Number(midtermScore))){
										totalScore += Number(midtermScore)*Number(courseScoreSet.midtermRatio);
										$("#midtermScore"+index).val(Number(midtermScore));	
									}else{
										popup.warPop("请输入0-100之间的数字，可以保留一位小数");
										$("#midtermScore"+index).val('');
										return false;	
									}	
															
								}						
							}
							else{
								if(parseInt(courseScoreSet.midtermRatio)!=0){
									allIn=false; //没有录入平时成绩 
								}								
							}
						} 
						
						if(courseScoreSet.endtermRatio!=null){// 有期末成绩 
							var endtermScore=$.trim($("#endtermScore"+index).val()); // 期末成绩
							if(endtermScore!=null && endtermScore!="" ){
								var tempScore=Number(endtermScore);
								if(tempScore>100){
									popup.warPop("请输入0-100之间的数字，可以保留一位小数");
									$("#endtermScore"+index).val('');
									return false;							
								}else{
									if(fax.test(Number(endtermScore))){
										totalScore += Number(endtermScore)*Number(courseScoreSet.endtermRatio);
										$("#endtermScore"+index).val(Number(endtermScore));	
									}else{
										popup.warPop("请输入0-100之间的数字，可以保留一位小数");
										$("#endtermScore"+index).val('');
										return false;	
									}	
															
								}						
							}
							else{
								if(parseInt(courseScoreSet.endtermRatio)!=0){
									allIn=false; //没有录入平时成绩 
								}								
							}
						} 
						
						if(courseScoreSet.skillRatio!=null){// 有技能成绩
							var skillScore=$.trim($("#skillScore"+index).val()); // 平时成绩
							if(skillScore!=null && skillScore!="" ){
								var tempScore=Number(skillScore);
								if(tempScore>100){
									popup.warPop("请输入0-100之间的数字，可以保留一位小数");
									$("#skillScore"+index).val('');
									return false;							
								}else{
									if(fax.test(Number(skillScore))){
										totalScore += Number(skillScore)*Number(courseScoreSet.skillRatio);
										$("#skillScore"+index).val(Number(skillScore));		
									}else{
										popup.warPop("请输入0-100之间的数字，可以保留一位小数");
										$("#skillScore"+index).val('');
										return false;	
									}	
															
								}						
							}
							else{
								if(parseInt(courseScoreSet.skillRatio)!=0){
									allIn=false; //没有录入平时成绩 
								}								
							}
						} 					
						// 只有在只读状态下，总评成绩才由其他项决定
						if(allIn){//Math.round(x*10)/10 
							// 只有全部各项成绩录入了，才计算总评成绩
							var finalScore=Math.round((totalScore/100)*10)/10;
							$("#totalScore"+index).val(finalScore);
						}else{
							$("#totalScore"+index).val("");
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
					
					var scoreRegimenDetailId=courseScoreList.getScoreRegimenDetailId(score);
					$("#selectTotalScore"+index).val(scoreRegimenDetailId); // 设定选中		

					$("#totalScore"+index).val(scoreRegimenDetailId); // 保存分制明细id到隐藏域
					$("#totalScore"+index).attr("percentageScore",$("#selectTotalScore"+index).find("option:selected").attr("percentileScore")); // 保存对应的百分制成绩到隐藏域
					
					
				}
			}
			courseScoreList.calculationWaitEnterCount(); // 计算 教学班共有 X条 未完成录入
		},
		
		//成绩校验
		validateScore:function(ratioName,scoreName,index){
			if(courseScoreSet[ratioName]!=null){
				var score=$.trim($("#"+scoreName+index).val()); 
				if(score!=null && score!="" ){
					var tempScore=Number(score);
					if(tempScore>100){
						popup.warPop("请输入0-100之间的数字，可以保留一位小数");
						$("#"+scoreName+index).val('');
						return false;							
					}else{
						var fax=/^\d{1,3}(\.\d{1})?$/; // 成绩有1-3位大于等于0的数字，可有1位小数
						if(fax.test(Number(score))){
							$("#"+scoreName+index).val(Number(score));		
						}else{
							popup.warPop("请输入0-100之间的数字，可以保留一位小数");
							$("#"+scoreName+index).val('');
							return false;	
						}												
					}						
				}
			} 
		},
		
		// 计算 教学班共有 X条 未完成录入
		calculationWaitEnterCount:function(){
			var count=0;
			$("#tbodycontent input[name='totalScore']").each(function () {	
				var totalScore=$.trim($(this).val());
				if(totalScore===undefined || totalScore==="" || totalScore==="null" || totalScore===null){
					count++;
				}
			});		
			
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
			if(courseScoreSet){ //有原始成绩，去删除
				// 获取该页面所有原始成绩id
				var originalScoreIds=[];
				if(courseScoreSet && courseScoreSet.list){
					for(var i=0;i<courseScoreSet.list.length;i++){
						originalScoreIds.push(courseScoreSet.list[i].originalScoreId);
					}
				}	
				ajaxData.contructor(false);
	            ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(url.DELETE_ORIGINAL_SCORE, JSON.stringify(originalScoreIds), function(data) {
					ajaxData.setContentType("application/x-www-form-urlencoded");
					if (data.code == config.RSP_SUCCESS) {					
						// 刷新列表						
						courseScoreList.getInitData();														
					} else {
						// 提示失败
						popup.errPop(data.msg);
						return false;
					}
				})
			}else{
				// 没有原始成绩，直接刷新列表
				ajaxData.setContentType("application/x-www-form-urlencoded");
				courseScoreList.getInitData();
			}						
		}
		
		
		
    }
    module.exports = courseScoreList;
    window.courseScoreList = courseScoreList;
});