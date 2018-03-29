/**
 * 成绩补录
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var urlStudent = require("configPath/url.studentarchives");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
	var scoreType = require("basePath/enumeration/score/ScoreType");// 枚举，取得方式
	var isYesOrNo = require("basePath/enumeration/common/IsYesOrNo");// 枚举，是否等级制
	var ApprovalStatus = require("basePath/enumeration/score/ApprovalStatus");// 枚举，是否等级制
	var EntryType = require("basePath/enumeration/score/EntryType");// 枚举，取得方式
	var CourseOrTache = require("basePath/enumeration/trainplan/CourseOrTache");// 枚举，课程类型
	var simpleSelect = require("basePath/module/select.simple");
    // 下拉框
    var select = require("basePath/module/select");

    /**
     * 分制设置
     */
    var scoreReentry = {
        // 初始化
        init : function() {
        	$("#tbodycontent").empty().addClass("no-data-html");
        	var studentNo="";
        	$("#save").attr("disabled",true);
        	$("#auditing").attr("disabled",true);
            //查询
            $("#query").on("click", function() {
            	studentNo=$("#studentNoOrName").val();
            	if(studentNo){
                	var studentNoOrName=$("#studentNoOrName").val();
                	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
        			ajaxData.request(urlStudent.GET_SELECT_LISTBYNOORNAME, {studentNoOrName:studentNoOrName}, function(data) {
        				if (data.code == config.RSP_SUCCESS) {
        					if(data.data.length>1){
        						popup.warPop("请输入学号！");
        						scoreReentry.clear();
        						$("#tbodycontent").empty().addClass("no-data-html");
        						return false;
        					}else if(data.data.length==0){
        						popup.warPop("请输入正确的学号或者姓名！");
        						scoreReentry.clear();
        						$("#tbodycontent").empty().addClass("no-data-html");
        						return false;
        					}
        					studentNo=data.data[0].value;
        					scoreReentry.getCurrentStudentRoll(studentNo);
                        	scoreReentry.getCourseScore(studentNo);
        				}
        			});
            		
            	}else{
        				popup.warPop("请输入学号！");
        				scoreReentry.clear();
						$("#tbodycontent").empty().addClass("no-data-html");
        				return false;
            	}
            });
          
            //取得方式change事件
			$(document).on("change","select[name='scoreType']",function() {
						if ($(this).val() == scoreType.FirstTest.value) {
							$(this).parent().parent().find("select[name=scoreSemester]").attr("disabled", true);
						} else {
							$(this).parent().parent().find("select[name=scoreSemester]").removeAttr("disabled");
						}
					});
			$("#save").on("click",function(){
				var list=scoreReentry.saveData();
				ajaxData.contructor(false);
	            ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(urlScore.SAVE, JSON.stringify(list), function(data) {	
					if (data.code == config.RSP_SUCCESS) {					
						// 提示成功
						popup.okPop("保存成功", function() {});
						// 刷新列表
						ajaxData.setContentType("application/x-www-form-urlencoded");
						//var studentNo=$("#studentNoOrName").val();
						scoreReentry.getCourseScore(studentNo);
															
					} else {
						// 提示失败
						popup.errPop(data.msg);
						return false;
					}				
				});	
			});
			$("#auditing").on("click",function(){
				var list=scoreReentry.saveData();
				var resultList=scoreReentry.validate(list);
				if(resultList.length<=0){
					popup.warPop("请录入成绩！", function() {});
					return;
				}
				popup.askPop("送审将不能再修改，确定送审吗？", function() {
					ajaxData.contructor(false);
		            ajaxData.setContentType("application/json;charset=UTF-8");
					ajaxData.request(urlScore.AUDIT, JSON.stringify(resultList), function(data) {	
						if (data.code == config.RSP_SUCCESS) {					
							// 提示成功
							popup.okPop("送审成功", function() {});
							// 刷新列表
							ajaxData.setContentType("application/x-www-form-urlencoded");
							//var studentNo=$("#studentNoOrName").val();
							scoreReentry.getCourseScore(studentNo);
//															
						} else {
							// 提示失败
							popup.errPop(data.msg);
							return false;
						}				
					});	
				});
				
			});
			//总评成绩只能输入数字
			$(document).on("keydown", "input[name='totalScore']", function(e) {
				if(e.keyCode>=48 && e.keyCode<=57 || e.keyCode>=96 && e.keyCode<=105 || e.keyCode ==8 || e.keyCode==110|| e.keyCode==9){ 
					
				}else{
					return false;
				}
				
	        });
			//总成绩验证
			$(document).on("blur", "input[name='totalScore']", function() {
				if($(this).val()!=null && $(this).val()!="" ){
					var tempScore=Number($(this).val());
					var fax=/^(\d|[1-9]\d|100)((\.[0-9]))?$/;
					if(tempScore>100||!(fax.test(tempScore))){
						popup.warPop("请输入0-100之间的数字，可以保留一位小数");
						$(this).val('');
						return false;							
					}					
				}
			});
			//分制change事件
			$(document).on("change","select[name='scoreRegimenId']",function() {
				var scoreRegimenId =$(this).val();//分制id
				var scoreRegimen=$(this).find("option:selected").attr("isHierarchical");//是否等级制
				var specialCaseId=$(this).parent().parent().find("[name='specialCaseId']").val();//获取特殊情况值
				var score=$(this).parent().parent().find("[name=specialCaseId]").find("option:selected").attr("score");//获取特殊情况对应的分数
				scoreReentry.comboxChange($(this),specialCaseId,scoreRegimen,scoreRegimenId,score);//当前控件对象，特殊情况id，是否等级，分制id，总成绩

					});
		
			
			// 给特殊情况下拉框绑定change事件
			$(document).on("change", "[name='specialCaseId']", function() {
				var specialCaseId=$(this).val(); 
				var score=$(this).find("option:selected").attr("score");
				var scoreRegimenId=$(this).parent().parent().find("select[name=scoreRegimenId]").val();//取分制
				var scoreRegimen=$(this).parent().parent().find("select[name=scoreRegimenId]").find("option:selected").attr("isHierarchical")//取分制是否是等级制
				scoreReentry.comboxChange($(this),specialCaseId,scoreRegimen,scoreRegimenId,score);//当前控件对象，特殊情况id，是否等级，分制id，总成绩

			});
			
        },
        comboxChange:function(obj,specialCaseId,scoreRegimen,scoreRegimenId,score){
        	var parent=obj.parent().parent();
        	if(specialCaseId==""){
				//为“”说明了不是特殊情况
				if (scoreRegimen == isYesOrNo.Yes.value) {// 是等级制，显示下拉框
					// 加载相对应的等级
				    scoreReentry.getGrade(parent.find("select[name='hierarchical']"),scoreRegimenId,score);
					parent.find("input[name='totalScore']").hide();
					parent.find("select[name='hierarchical']").show();
					parent.find("input[name='totalScore']").val("");
					parent.find("select[name=hierarchical]").removeAttr("disabled");
				} else {
					parent.find("input[name='totalScore']").show();
					parent.find("select[name='hierarchical']").hide();
					parent.find("input[name=totalScore]").removeAttr("disabled");
				}
			}else{
				if(scoreRegimen== isYesOrNo.Yes.value){//是等级制
					// 加载相对应的等级
					scoreReentry.getGrade(parent.find("select[name='hierarchical']"),scoreRegimenId,score);
					//simpleSelect.loadCommon(parent.find("select[name='hierarchical']").attr("id"),urlScore.GET_SCORE_REGIMEN_DETAIL_LIST,{scoreRegimenId : scoreRegimenId}, "", "", "");
					parent.find("input[name='totalScore']").hide();
					parent.find("select[name='hierarchical']").show();
					parent.find("input[name='totalScore']").val("");
					//scoreReentry.getGradeByScore(obj,scoreRegimenId,score);
					parent.find("select[name=hierarchical]").attr("disabled",true);//禁用
				}else{//不是等级制，取分数
					parent.find("input[name='totalScore']").show();
					parent.find("select[name='hierarchical']").hide();
					parent.find("input[name=totalScore]").val(score);
					parent.find("input[name=totalScore]").attr("disabled",true);//禁用
				}
			}	
        },
        /**
         * 根据分制id加载等级
         */
        getGrade:function(obj,scoreRegimenId,score){
        	var grade=[];
        	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(urlScore.GET_SCORE_REGIMEN_DETAIL_LIST, {scoreRegimenId : scoreRegimenId}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var option={scoreRegimenDetailId:"",cnName:""};
					grade=data.data;
					grade.unshift(option);
					obj.empty().append($("#hierarchicalSelectImpl").tmpl(grade));
					
					scoreReentry.getGradeByScore(obj,scoreRegimenId,score);
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
         * 绑定下拉框
         */
        bindSelect:function(){
        	//获取特殊情况
        	var specialData=[];
        	ajaxData.contructor(false);
        	ajaxData.request(urlScore.SPECIAL_CASE_GET_LIST,null,function(data){
        		specialData=data.data;
        	});
        },
        /**
         * 根据学号或学生姓名查找学生
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
         * 根据学号获取学生信息
         */
        getCurrentStudentRoll:function(studentNo){
        	ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(urlStudent.GET_STUDENT, {studentNo:studentNo}, function(data) {
				if (data.code == config.RSP_SUCCESS ) {
					// 列表模板加载
					var studentInfo = data.data;
					$("#grade").html(studentInfo.grade);
					$("#departmentName").html(studentInfo.departmentName);
					$("#majorName").html(studentInfo.majorName);
					$("#className").html(studentInfo.className);
					$("#studentName").html("[" + studentInfo.studentNo + "]" + studentInfo.studentName);
					$("#studentId").val(studentInfo.userId);
				} else {
					$("#grade").html("");
					$("#departmentName").html("");
					$("#majorName").html("");
					$("#className").html("");
					$("#studentName").html("");
					$("#studentId").val("");
				}
			});
        },
        /**
         * 根据学号查询学生所有学年学期课程环节
         */
        getCourseScore:function(studentNo){
        	//获取所有学年学期
        	var semsterData=[];
        	ajaxData.contructor(false);
        	ajaxData.request(urlData.GET_ASC_SEMESTERLIST,null,function(data){
        		semsterData=data.data;
        	});
        	//获取特殊情况
        	var specialData=[];
        	ajaxData.contructor(false);
        	ajaxData.request(urlScore.SPECIAL_CASE_GET_LIST,null,function(data){
        		specialData=data.data;
        		 var defaultOption={name:"",specialCaseId:"",totalScore:""};
        		 specialData.unshift(defaultOption);
        	});
          	//获取分制
        	var scoreRegimenData=[];
        	ajaxData.contructor(false);
        	ajaxData.request(urlScore.GET_ALLLIST,null,function(data){
        		scoreRegimenData=data.data;
        	});
        	
        	ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(urlScore.GET_START_CLASS_PLAN, {studentNo:studentNo}, function(data) {
				if (data.code == config.RSP_SUCCESS & data.data.length > 0) {
				   	$("#save").removeAttr("disabled");
		        	$("#auditing").removeAttr("disabled");
					// 列表模板加载
					$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data.data)).removeClass("no-data-html");
					
					//取得方式
					 $("select[name='scoreType']").each(function(index,item){
						 var defaultValue= $(this).attr("value");
						 simpleSelect.loadEnumSelect($(this).attr("id"),scoreType,{defaultValue:defaultValue,firstText:"",firstValue:-1});
						 $(this).val(defaultValue);
						var classType= $(this).parent().parent().attr("classType");//课程类型
						if(classType==CourseOrTache.Tache.value){//环节禁用取得方式下拉框，只显示首考
							$(this).attr("disabled", true);
						}
						var totalScore= $(this).parent().parent().find("input[name=totalScore]").val();
						var hierarchical= $(this).parent().parent().find("input[name=hierarchical]").val();
						var auditStatus=$(this).parent().parent().attr("auditStatus");//审核状态
						if(totalScore==null||totalScore==""||auditStatus!=ApprovalStatus.Actived.value){//没有首考成绩或者未审核通过
							$(this).attr("disabled", true);
						}
					 });
					//取得学年学期
					 $("select[name='scoreSemester']").each(function(index,item){
						var defaultValue= $(this).attr("value");
						var academicYear= $(this).parent().parent().attr("academicYear");
						var semesterCode= $(this).parent().parent().attr("semesterCode");
						var newSemsterData=[];
						$(semsterData).each(function(index,item){
							var scoreAcademicYear=item.value.split("_")[0];
							var scoreSemesterCode=item.value.split("_")[1];
							if(scoreAcademicYear>academicYear){
								newSemsterData.push(item);
							}else if(scoreAcademicYear==academicYear&scoreSemesterCode>=semesterCode){
								newSemsterData.push(item);
							}
						});
						
						 $(this).empty().append($("#selectImpl").tmpl(newSemsterData));
						 $(this).val(defaultValue);//选中值
						var getScoreType= $(this).parent().parent().find("select[name=scoreType]").val();//取得方式
						if (getScoreType == scoreType.FirstTest.value) {
							$(this).parent().parent().find("select[name=scoreSemester]").attr("disabled", true);
						} else {
							$(this).parent().parent().find("select[name=scoreSemester]").removeAttr("disabled");
						}
					 });
					//分制
					 $("select[name='scoreRegimenId']").each(function(index,item){
						 var defaultValue= $(this).attr("value");
						 $(this).empty().append($("#scoreRegimenSelectImpl").tmpl(scoreRegimenData));
						 $(this).val(defaultValue);//选中值
						
							
					 });
					//特殊情况
					 $("select[name='specialCaseId']").each(function(index,item){
						 var defaultValue= $(this).attr("value");
						 $(this).empty().append($("#specialSelectImpl").tmpl(specialData));
						 $(this).val(defaultValue);//选中值
								var score=$(this).find("option:selected").attr("score");
								var scoreRegimenId=$(this).parent().parent().find("select[name=scoreRegimenId]").val();//取分制
								var scoreRegimen=$(this).parent().parent().find("select[name=scoreRegimenId]").find("option:selected").attr("isHierarchical")//取分制是否是等级制
								if(score==""){
									var totalScore=$(this).parent().parent().find("input[name=totalScore]").val();
									scoreReentry.comboxChange($(this),defaultValue,scoreRegimen,scoreRegimenId,score);//当前控件对象，特殊情况id，是否等级，分制id，总成绩
									$(this).parent().parent().find("select[name=hierarchical]").val(totalScore);
								}else{
								scoreReentry.comboxChange($(this),defaultValue,scoreRegimen,scoreRegimenId,score);//当前控件对象，特殊情况id，是否等级，分制id，总成绩
								}
					 });
					 var flag=true;
					 var statusCount=0;
						//已送审和审核的禁用页面控件
						$("#tbodycontent tr ").each(function(index,item){
							var auditStatus=$(item).attr("auditStatus");
							if(auditStatus!=""){
								if(auditStatus!=ApprovalStatus.TemporaryMemory.value){//非暂存禁用行
									$(item).find("input,select").attr("disabled",true);
									statusCount++;
								}
								if(auditStatus==ApprovalStatus.Actived.value){//审核通过启用取得方式
									$(item).find("select[name=scoreType]").removeAttr("disabled");
								}
							}
						});
					if(data.data.length==statusCount){
						//列表的数据全部是禁用状态，禁用保存，审核按钮
							$("#save").attr("disabled",true);
							$("#auditing").attr("disabled",true);
							
						}else{
							$("#save").removeAttr("disabled");
							$("#auditing").removeAttr("disabled");
						}
				} else {
					$("#tbodycontent").empty().addClass("no-data-html");
				}
			});
        },
        saveData:function(){
        	var list=[];
        	$("#tbodycontent tr ").each(function () {
        		var option={};
        		option.originalScoreId=$(this).attr("originalScoreId");//原始成绩id
        		option.academicYear=$(this).attr("academicYear");//修读学年
        		option.semesterCode=$(this).attr("semesterCode");//修读学期
        		option.courseId=$(this).attr("courseId");//课程id
        		option.scoreType=$(this).find("select[name=scoreType]").val(); //成绩类型\取得方式
        		option.scoreSemester=$(this).find("select[name=scoreSemester]").val(); //取得学年学期
        		option.scoreAcademicYear=option.scoreSemester.split("_")[0];// 学年
        		option.scoreSemesterCode=option.scoreSemester.split("_")[1];//学期
        		option.scoreRegimenId=$(this).find("select[name=scoreRegimenId]").val(); //分制
        		var scoreRegimen= $(this).find("select[name=scoreRegimenId]").find("option:selected").attr("ishierarchical");
        		if(scoreRegimen == isYesOrNo.Yes.value){//等级制
        			option.totalScore=$(this).find("select[name=hierarchical]").val(); //等级
        			option.percentageScore=$(this).find("select[name=hierarchical]").find("option:selected").attr("percentileScore");
        		}else{
        			option.totalScore=$(this).find("input[name=totalScore]").val(); //总成绩
        			option.percentageScore=option.totalScore;
        		}
        		option.specialCaseId=$(this).find("select[name=specialCaseId]").val(); //特殊情况
        		option.remark=$(this).find("input[name=remark]").val(); //备注
        		option.studentId=$("#studentId").val();
        		option.entryMenuName="成绩补录";
        		option.entryType=EntryType.AdditionalRecording.value;
        		option.auditStatus=$(this).attr("auditStatus");
        		list.push(option);
        	});
        	return list;	
        },
        /**
         * 验证
         */
        validate:function(list){
        	var newList=[];
        	$.each(list,function(index,item){
        		if(item.totalScore!=""&item.auditStatus==ApprovalStatus.TemporaryMemory.value){
        			newList.push(item);
        		}
        	})
        	return newList;
        },
        /**
         * 清空数据
         */
        clear:function(){
        	$("#grade").html("");
			$("#departmentName").html("");
			$("#majorName").html("");
			$("#className").html("");
			$("#studentName").html("");
			$("#studentId").val("");
        }
      
    }
    module.exports = scoreReentry;
    window.scoreReentry = scoreReentry;
});