/**
 * 成绩修改
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var urlStudent = require("configPath/url.studentarchives");
    var constant = require("configPath/data.constant");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
	var isYesOrNo = require("basePath/enumeration/common/IsYesOrNo");// 枚举，是否等级制
    // 下拉框
    var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var validate = require("basePath/utils/validateExtend");
	var courseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");//
	var scoreType = require("basePath/enumeration/score/ScoreType");// 成绩类型
	
    /**
     * 成绩审核
     */
    var scoreModify = {
        // 初始化
        init : function() {
        	 ajaxData.contructor(false);
        	simpleSelect.loadCommonSmester("semester",urlData.COMMON_GETSEMESTERLIST,constant.EMPTY,constant.SELECT_ALL,constant.MINUS_ONE);
        
            // 成绩修改
            $(document).on("click", "[name='modify']", function() {
                scoreModify.modify(this);
            });
            // 成绩修改查看
            $(document).on("click", "[name='view']", function() {
                scoreModify.view(this);
            });
           
            //查询
            $("#query").on("click", function() {
            	var studentNo=$("#studentNoOrName").val();
            	var courseNoOrName=$("#courseNoOrName").val();
            	var studentNo=$("#studentNoOrName").val();
				  if (studentNo) {
					  var studentNoOrName=$("#studentNoOrName").val();
	                	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
	        			ajaxData.request(urlStudent.GET_SELECT_LISTBYNOORNAME, {studentNoOrName:studentNoOrName}, function(data) {
	        				if (data.code == config.RSP_SUCCESS) {
	        					if(data.data.length>1){
	        						popup.warPop("请输入学号！");
	        						scoreModify.clear();
	        						$("#tbodycontent").empty().addClass("no-data-html");
	        						return false;
	        					}else if(data.data.length==0){
	        						popup.warPop("请输入正确的学号或者姓名！");
	        						scoreModify.clear();
	        						$("#tbodycontent").empty().addClass("no-data-html");
	        						return false;
	        					}
	        					studentNo=data.data[0].value;
	        					var param = utils.getQueryParamsByFormId("queryForm");
	        					if (param.semester) {
	        						param.academicYear = param.semester.split("_")[0];
	        						param.semesterCode = param.semester.split("_")[1];
	        					}
	        					var queryParam = {
	        						studentNo : studentNo,
	        						courseNoOrName : courseNoOrName,
	        						academicYear : param.academicYear,
	        						semesterCode : param.semesterCode
	        					};
	        					scoreModify.getStudentList(queryParam);
	        					scoreModify.getCourseScore(queryParam);
	        				}
	        			});
					
				} else {
					popup.warPop("请输入学号或者姓名！");
					scoreModify.clear();
					$("#tbodycontent").empty().addClass("no-data-html");
					return false;
				}
            });
            $("#tbodycontent").empty().addClass("no-data-html");
        },
        /**
         * 根据学号或学生姓名查找学生（下拉框模糊搜索）
         * @param defaultValue
         */
        getStudent:function(defaultValue){
        	var studentDom = [];
        	var studentNoOrName=$("#studentNoOrName").val();
        	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(urlStudent.GET_SELECT_LISTBYNOORNAME, {studentNoOrName:studentNoOrName}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.value,
							name : "["+item.value+"]"+item.name
						};
						studentDom.push(option);
					})
				}
			});
			this.studentSelect = new select({
				dom : $("#studentSelect"),
				defaultValue : defaultValue,
				loadData : function() {
					return studentDom
				},
				onclick :function(code){
					if (code == "") {
						$("#studentNoOrName").val("");
						return false;
					}
					$("#studentNoOrName").val(code); 
				}
			}).init();
        },
        /**
         *查询学生明细
         */
        getStudentList:function(queryParam){
    	   ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(urlStudent.GET_STUDENT,queryParam, function(data) {
				if (data.code == config.RSP_SUCCESS ) {
					// 列表模板加载
					var studentInfo=data.data;
					$("#grade").html(studentInfo.grade);
					$("#departmentName").html(studentInfo.departmentName);
					$("#majorName").html(studentInfo.majorName);
					$("#className").html(studentInfo.className);
					$("#studentName").html("["+studentInfo.studentNo+"]"+studentInfo.studentName);
				} else{
					$("#grade").html("");
					$("#departmentName").html("");
					$("#majorName").html("");
					$("#className").html("");
					$("#studentName").html("");
				}
			});
       },
       /**
        * 查询有效成绩对应的原始成绩
        */
       getCourseScore:function(queryParam){
	       	ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(urlScore.GET_ORIGINAL_SCORELIST, queryParam, function(data) {
				if (data.code == config.RSP_SUCCESS & data.data.length > 0) {
					// 列表模板加载
					$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data.data)).removeClass("no-data-html");
				
				} else {
					$("#tbodycontent").empty().addClass("no-data-html");
				}
			});
       },
       /**
        * 初始化修改
        */
       initUpdate:function(){
    		// 获取url参数
			var studentNo=popup.data("studentNo");
			var semesterYearCode=popup.data("semesterYearCode");
			var courseId=popup.data("courseId");
			popup.setData("scoreModify", this);
			var queryParam={studentNo:studentNo,courseId:courseId,academicYear:semesterYearCode.split("_")[0],semesterCode:semesterYearCode.split("_")[1]};
			
		    //获取有效成绩
			ajaxData.request(urlScore.GET_ORIGINAL_SCORELIST,queryParam, function(data) {
				if (data.code == config.RSP_SUCCESS & data.data.length > 0) {
					var scoreData=data.data[0];
					$("#student").html("["+scoreData.studentNo+"]"+scoreData.studentName);
					$("#courseName").html(scoreData.courseName);
					$("#credit").html(scoreData.credit);
					$("#checkWakyName").html(scoreData.checkWakyName);
					$("#oldUsualScore").html(scoreData.oldUsualScore);
					$("#oldMidtermScore").html(scoreData.oldMidtermScore);
					$("#oldEndtermScore").html(scoreData.oldEndtermScore);
					$("#oldSkillScore").html(scoreData.oldSkillScore);
					$("#oldTotalScore").html(scoreData.oldTotalScore);
					$("#oldSpecialCaseId").html(scoreData.oldSpecialCaseName);
					if(scoreData.oldScoreType==scoreType.FirstTest.value){
						$("#oldScoreTypeName").html(scoreType.FirstTest.name);
					}
					else{
						$("#oldScoreTypeName").html(scoreType.MakeUp.name);
					}
					
					$("#oldEntryUserName").html("["+scoreData.oldEntryUserNo+"]"+scoreData.oldEntryUserName);
					$("#oldEntryTime").html(scoreData.oldEntryTime.substr(0,16));
					$("#originalScoreId").val(scoreData.originalScoreId);
				    $("#isHierarchical").val(scoreData.isHierarchical);//是否等级制
				    $("#scoreRegimenId").val(scoreData.scoreRegimenId);//分制id
				    
					  $("#usualRatio").val(scoreData.usualRatio);//平时成绩占比
					  $("#midtermRatio").val(scoreData.midtermRatio);//平时成绩占比
					  $("#endtermRatio").val(scoreData.endtermRatio);//平时成绩占比
					  $("#skillRatio").val(scoreData.skillRatio);//平时成绩占比
					  $("#onlyEntryTotalScore").val(scoreData.onlyEntryTotalScore);//平时成绩占比
					  
					$("div[ungrade]").css("display","none");
					$("#totalScore").css("display","block");
					$("#hierarchical").css("display","block");
					// 控件显示
					if(scoreData.isHierarchical==isYesOrNo.Yes.value){//是等级制
						$("div[ungrade]").css("display","none");
						$("#totalScore").css("display","none");
						var params={};
				       	params.scoreRegimenDetailId = scoreData.oldTotalScore;
				       	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
							ajaxData.request(urlScore.GETITEMNEW, params, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if(data.data.length>0){
									$("#oldTotalScore").html(data.data[0].cnName);
								}}
							});
						scoreModify.getGrade(scoreData.scoreRegimenId);
					}else{//是百分制
						if(scoreData.courseScoreSetId){//非补录根据成绩构成设置的占比显示成绩输入框
							if(scoreData.usualRatio){
								$("div[ungrade='usualScore']").css("display","block");
							}
							if(scoreData.midtermRatio){
								$("div[ungrade='midtermScore']").css("display","block");
							}
							if(scoreData.endtermRatio){
								$("div[ungrade='endtermScore']").css("display","block");
							}
							if(scoreData.skillRatio){
								$("div[ungrade='skillScore']").css("display","block");
							}
							$("#hierarchical").css("display","none");
							
						}else{//补录成绩只有总评成绩
							$("div[ungrade='true']").css("display","none");
							$("#hierarchical").css("display","none");
							//scoreModify.getGrade(scoreData.scoreRegimenId);
							
						}
						
					}
					
					// 给特殊情况下拉框绑定change事件
					$(document).on("change", "[name='specialCaseId']", function() {
						var specialCaseId=$(this).val(); 
						var score=$(this).find("option:selected").attr("score");
						var scoreRegimenId=scoreData.scoreRegimenId;//取分制
						var scoreRegimen=scoreData.isHierarchical;//取分制是否是等级制
						scoreModify.comboxChange(specialCaseId,scoreRegimen,scoreRegimenId,score);//当前控件对象，特殊情况id，是否等级，分制id，总成绩
						if(specialCaseId){
						  $("#usualScore").rules("remove", "required" );
						  $("#midtermScore").rules("remove", "required" );
						  $("#endtermScore").rules("remove", "required" );
						  $("#skillScore").rules("remove", "required" );
						  
						}else{
							$("#usualScore").rules("add", {required : true});
							$("#midtermScore").rules("add", {required : true});
							$("#endtermScore").rules("add", {required : true});
							$("#skillScore").rules("add", {required : true});
						}
					});
					  //根据 平时成绩 期中成绩 期末成绩 技能成绩    计算总评成绩
					$(document).on("blur", "input[myattr='score']", function() {
						scoreModify.calculationTotalScore();
					});
					
					scoreModify.validation();
					
				}
			});
			//获取特殊情况
        	var specialData=[];
        	ajaxData.request(urlScore.SPECIAL_CASE_GET_LIST,null,function(data){
        		specialData=data.data;
        		 var defaultOption={name:"",specialCaseId:"",totalScore:""};
        		 specialData.unshift(defaultOption);
        		 $("#specialCaseId").empty().append($("#specialSelectImpl").tmpl(specialData));
        	});
        	
        	
        	//成绩只能输入数字
			$(document).on("keydown", "div[ungrade],#totalScore", function(e) {
				if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8 || e.keyCode==110){ 
					
				}else{
					return false;
				}
				
	        });
			
			
        	
       },
       //计算总评成绩
	   calculationTotalScore:function(){			
          var specialCaseId=$("#specialCaseId").val(); // 特殊情况	
         var isHierarchical= $("#isHierarchical").val();//是否等级制
		  var scoreRegimenId=  $("#scoreRegimenId").val();//分制id
		  var usualRatio= $("#usualRatio").val();//平时成绩占比
		  var midtermRatio= $("#midtermRatio").val();//平时成绩占比
		  var endtermRatio= $("#endtermRatio").val();//平时成绩占比
		  var skillRatio= $("#skillRatio").val();//平时成绩占比
			if(specialCaseId==""){
				//为“”说明了不是特殊情况
				//不考虑特殊情况没值的情况				
				if(isHierarchical==isYesOrNo.No.value){ // 百分制
					//按 平时成绩 期中成绩 期末成绩 技能成绩    计算总评成绩
					var usualScore=($("#usualScore")==undefined)?null:$("#usualScore").val(); // 平时成绩
					var midtermScore=($("#midtermScore")==undefined)?null:$("#midtermScore").val(); // 期中成绩
					var endtermScore=($("#endtermScore")==undefined)?null:$("#endtermScore").val(); // 期末成绩
					var skillScore=($("#skillScore")==undefined)?null:$("#skillScore").val(); // 技能成绩	
					var flag=false; //标识平时成绩、期中成绩、期末成绩、技能成绩 是否至少有一个有录入
					var totalScore=0; // 总评成绩
					if(usualScore!=null && usualScore!="" && usualRatio!=""){
						var tempScore=Number(usualScore);
						if(tempScore>100){
							$("#usualScore").val('');
							return false;							
						}else{
							totalScore += Number(usualScore)*Number(usualRatio);
							flag=true;
							$("#usualScore").val(Number(usualScore));							
						}						
					}
					if(midtermScore!=null && midtermScore!="" && midtermRatio){
						var tempScore=Number(midtermScore);
						if(tempScore>100){
							$("#midtermScore").val('');
							return false;	
						}else{
							totalScore += Number(midtermScore)*Number(midtermRatio);
							flag=true;
							$("#midtermScore").val(Number(midtermScore));
						}
						
					}
					if(endtermScore!=null && endtermScore!="" && endtermRatio){
						var tempScore=Number(endtermScore);
						if(tempScore>100){
							$("#endtermScore").val('');
							return false;	
						}else{
							totalScore += Number(endtermScore)*Number(endtermRatio);
							flag=true;
							$("#endtermScore").val(Number(endtermScore));
						}
						
					}
					if(skillScore!=null && skillScore!="" && skillRatio){
						var tempScore=Number(skillScore);
						if(tempScore>100){
							$("#skillScore").val('');
							return false;
						}else{
							totalScore += Number(skillScore)*Number(skillRatio);
							flag=true;
							$("#skillScore").val(Number(skillScore));
						}						
					}
					if($("#specialCaseId").val()==""){ // 如果没有特殊情况，则总评成绩按 平时成绩 期中成绩 期末成绩 技能成绩 计算
						if(flag){
							$("#totalScore").val(Math.round((totalScore/100)*10)/10);
						}else{
							$("#totalScore").val("");
						}	
					}			
				}		
			}

		},
       comboxChange:function(specialCaseId,scoreRegimen,scoreRegimenId,score){
       		if(specialCaseId==""){
				//为“”说明了不是特殊情况
				if (scoreRegimen == isYesOrNo.Yes.value) {// 是等级制，显示下拉框
					// 加载相对应的等级
					
					scoreModify.getGrade(scoreRegimenId,score);
					$("select[name=hierarchical]").removeAttr("disabled");
					
				} else {
					$("input[name=totalScore]").removeAttr("disabled");
				}
				scoreModify.calculationTotalScore();
			}else{
				if(scoreRegimen== isYesOrNo.Yes.value){//是等级制
					// 加载相对应的等级
					scoreModify.getGrade(scoreRegimenId,score);
					$("select[name=hierarchical]").attr("disabled",true);//禁用
				}else{//不是等级制，取分数
					$("#totalScore").val(score);
					$("input[name=totalScore]").attr("disabled",true);//禁用
				}
			}	
       },
       getGrade:function(scoreRegimenId,score){
    		var grade=[];
        	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(urlScore.GET_SCORE_REGIMEN_DETAIL_LIST, {scoreRegimenId : scoreRegimenId}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var option={scoreRegimenId:"",cnName:""};
					grade=data.data;
					grade.unshift(option);
					$("#hierarchical").empty().append($("#hierarchicalSelectImpl").tmpl(grade));
					scoreModify.getGradeByScore($("#hierarchical"),scoreRegimenId,score);//赋值
				}
			});
       },
       /**
        * 根据分数，分制获取等级
        * @param scoreRegimenId
        * @param score
        */
       getGradeByScore:function(obj,scoreRegimenId,score){
       	var params = {};
       	params.scoreRegimenId = scoreRegimenId;
       	params.score = score;
       	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(urlScore.GET_ITEM, params, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data.length>0){
					obj.val(data.data[0].scoreRegimenDetailId);
					
				}}
			});
       },
       /**
        * 送审
        * @returns {Boolean}
        */
       save:function(){
    	   var list = [];
			var option={};
			option.originalScoreId = $("#originalScoreId").val();//原始id
			option.originalScoreId =$("#originalScoreId").val();//原始id
    		option.usualScore=$("#usualScore").val();//平时成绩
    		option.midtermScore=$("#midtermScore").val();//期中成绩
    		option.endtermScore=$("#endtermScore").val();//期末成绩
    		option.skillScore=$("#skillScore").val();//技能成绩
    		if($("#isHierarchical").val()==isYesOrNo.Yes.value){
        		option.totalScore=$("#hierarchical").val();//总评成绩
        		option.percentageScore=$("#hierarchical").find("option:selected").attr("percentileScore");
    		}else{
    			option.totalScore=$("#totalScore").val();//总评成绩
    			option.percentageScore=option.totalScore;
    		}
    		option.specialCaseId=$("#specialCaseId").val();//特殊情况
    		option.modifyReason=$("#modifyReason").val();//修改原因
    		option.entryMenuName="成绩修改";
    		list.push(option);
    		var rvData = null;// 定义返回对象
				// post请求提交数据
				ajaxData.contructor(false);// 同步
				ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(urlScore.APPROVAL, JSON.stringify(list), function(data) {
					rvData=data;
					
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("送审成功", function() {});
					ajaxData.setContentType("application/x-www-form-urlencoded");
					 return true;
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
					return false;
				}
       },
        /**
         * 成绩修改 弹窗
         */
        modify: function(obj){
        	var studentNo = $(obj).parent().parent().attr("studentNo");
        	var semesterYearCode = $(obj).parent().parent().attr("semesterYearCode");
        	var courseId = $(obj).parent().parent().attr("courseId");
        	popup.data("studentNo",studentNo);
        	popup.data("semesterYearCode",semesterYearCode);
        	popup.data("courseId",courseId);
        	popup.open('./score/score/html/scoreModify.html', // 这里是页面的路径地址
                     {
                         id : 'modify',// 唯一标识
                         title : '成绩修改',// 这是标题
                         width : 1100,// 这是弹窗宽度。其实可以不写
                         height : 500,// 弹窗高度
                         okVal : '送审',
                         cancelVal : '关闭',
                         ok : function() {
                        	var scoreModify = popup.data("scoreModify");
                        	var flag = scoreModify.addWorkForm.valid();
                        	if(flag && scoreModify.save()){
                        		//保存数据
                        		$("#query").click();
                        		return flag;

                        	}
                        	return flag;
                         },
                         cancel : function() {
                             // 取消逻辑
                         }
                     });
        },
       /**
        * 初始化查询
        */
        initView:function(){
        	// 获取url参数
			var studentNo=popup.data("studentNo");
			var semesterYearCode=popup.data("semesterYearCode");
			var courseId=popup.data("courseId");
			var queryParam={studentNo:studentNo,courseId:courseId,academicYear:semesterYearCode.split("_")[0],semesterCode:semesterYearCode.split("_")[1]};
		    //获取有效成绩
			ajaxData.request(urlScore.GET_ORIGINAL_SCORELIST,queryParam, function(data) {
				if (data.code == config.RSP_SUCCESS & data.data.length > 0) {
					var scoreData=data.data[0];
					$("#student").html("["+scoreData.studentNo+"]"+scoreData.studentName);
					$("#courseName").html(scoreData.courseName);
					$("#credit").html(scoreData.credit);
					$("#checkWakyName").html(scoreData.checkWakyName);
					$("#oldUsualScore").html(scoreData.oldUsualScore);
					$("#oldMidtermScore").html(scoreData.oldMidtermScore);
					$("#oldEndtermScore").html(scoreData.oldEndtermScore);
					$("#oldSkillScore").html(scoreData.oldSkillScore);
					$("#oldTotalScore").html(scoreData.oldTotalScoreall);
					$("#oldSpecialCaseId").html(scoreData.oldSpecialCaseName);
					$("#oldEntryUserName").html("["+scoreData.oldEntryUserNo+"]"+scoreData.oldEntryUserName);
					$("#oldEntryTime").html(scoreData.oldEntryTime.substr(0,16));
					$("#originalScoreId").html(scoreData.originalScoreId);
					if(scoreData.oldScoreType==scoreType.FirstTest.value){
						$("#oldScoreTypeName").html(scoreType.FirstTest.name);
					}
					else{
						$("#oldScoreTypeName").html(scoreType.MakeUp.name);
					}
					$("#usualScore").html(scoreData.usualScore);
					$("#midtermScore").html(scoreData.midtermScore);
					$("#endtermScore").html(scoreData.endtermScore);
					$("#skillScore").html(scoreData.skillScore);
					$("#totalScore").html(scoreData.totalScoreall);
					$("#specialCaseName").html(scoreData.specialCaseName);
					$("#modifyReason").html(scoreData.modifyReason);
					if(scoreData.classTypeName==courseOrTache.Course.value){
						$("#coure").html("课程");
					}else{
						$("#coure").html("环节");
					}
					$("div[ungrade]").css("display","none");
					// 控件显示
					if(scoreData.isHierarchical==isYesOrNo.Yes.value){//是等级制
						$("div[ungrade]").css("display","none");
					}else{//是百分制
						if(scoreData.courseScoreSetId){//非补录根据成绩构成设置的占比显示成绩输入框
							if(scoreData.usualRatio){
								$("div[ungrade='usualScore']").css("display","block");
							}
							if(scoreData.midtermRatio){
								$("div[ungrade='midtermScore']").css("display","block");
							}
							if(scoreData.endtermRatio){
								$("div[ungrade='endtermScore']").css("display","block");
							}
							if(scoreData.skillRatio){
								$("div[ungrade='skillScore']").css("display","block");
							}
							
						}else{//补录成绩只有总评成绩
							$("div[ungrade='true']").css("display","none");
						}
						
					}
				}
			});
        },
        /**
         * 成绩修改查看 弹窗
         */
        view: function(obj){
        	var studentNo = $(obj).parent().parent().attr("studentNo");
        	var semesterYearCode = $(obj).parent().parent().attr("semesterYearCode");
        	var courseId = $(obj).parent().parent().attr("courseId");
        	popup.data("studentNo",studentNo);
        	popup.data("semesterYearCode",semesterYearCode);
        	popup.data("courseId",courseId);
        	popup.open('./score/score/html/scoreModifyView.html', // 这里是页面的路径地址
                {
                    id : 'view',// 唯一标识
                    title : '成绩修改查看',// 这是标题
                    width : 1200,// 这是弹窗宽度。其实可以不写
                    height : 500,// 弹窗高度
                    cancelVal : '关闭',
                    
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        },

		validation : function() {
			  var usualRatio= $("#usualRatio").val()==""?false:true;//平时成绩占比
			  var midtermRatio= $("#midtermRatio").val()==""?false:true;//平时成绩占比
			  var endtermRatio= $("#endtermRatio").val()==""?false:true;//平时成绩占比
			  var skillRatio= $("#skillRatio").val()==""?false:true;//平时成绩占比
			  var totalScore=$("#onlyEntryTotalScore").val()==""?false:true;//平时成绩占比
			 var isHierarchical= $("#isHierarchical").val();//是否等级制
			  if(usualRatio||midtermRatio||endtermRatio||skillRatio||totalScore){
				  totalScore=true;
			  }
			   if(isHierarchical==isYesOrNo.Yes.value){
				   totalScore=false;
			   }else{
				   totalScore=true;
			   }
			// 校验
			validate.validateEx();
			$("#addWorkForm").validate({
				rules : {
					modifyReason : {
						required : true,
						maxlength : 50,
						
					},
					usualScore:{
						required : usualRatio,
						"usualRatioFormat":true
					},
					midtermScore:{
						required : midtermRatio,
						"usualRatioFormat":true
					},
					endtermScore:{
						required : endtermRatio,
						"usualRatioFormat":true
					},
					skillScore:{
						required : skillRatio,
						"usualRatioFormat":true
					},
					totalScore:{
						required : totalScore,
						"usualRatioFormat":true
					},
					hierarchical:{
						required : !totalScore,
					},
					
				},
				messages : {
					modifyReason : {
						required : '修改原因不能为空',
						maxlength : '修改原因不超过50个字符'
					},
					usualScore:{
						required : '平时成绩不能为空',
						"usualScore":"输入成绩格式不正确"
					},
					midtermScore:{
						required : '期中成绩不能为空',
						"midtermScore":"输入成绩格式不正确"
					},
					endtermScore:{
						required : '期末成绩不能为空',
						"endtermScore":"输入成绩格式不正确"
					},
					skillScore:{
						required : '技能成绩不能为空',
						"skillScore":"输入成绩格式不正确"
					},
					totalScore:{
						required : '总成绩不能为空',
						"totalScore":"输入成绩格式不正确"
					},
					hierarchical:{
						required : '总成绩不能为空'
					},
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text").append(error);

				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
			this.addWorkForm = $("#addWorkForm");
		},
		/**
		 * 清除
		 */
		clear:function(){
			$("#grade").html("");
			$("#departmentName").html("");
			$("#majorName").html("");
			$("#className").html("");
			$("#studentName").html("");
		},

    }
    module.exports = scoreModify;
    window.scoreModify = scoreModify;
});