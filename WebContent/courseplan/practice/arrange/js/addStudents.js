/**
 * 实践安排
 * 小组新增
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
    var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var addStudents = {
			/*
			 * 初始化
			 */
			init : function() {
				
				//获取所选环节
				var courseInfo = popup.getData("courseInfo");
				this.courseInfo = courseInfo;             
				//储存弹框内对象
				popup.setData('addStuArr', addStudents);
				var param = this.getQueryParams();
				
				//根据环节获取班级下拉框
				simpleSelect.loadCommon("class", URL_COURSEPLAN.ARRANGE_COURSE_GETPRACTICETACHECLASSLIST,param,"","全部","");
				
				// 查询
				$("button[name='searchInp']").on('click', function() {
					// 保存查询条件
					addStudents.studentList(addStudents.getQueryParams());
					
				});
				
				//初始加载班级下学生列表数据，
				addStudents.studentList(param);
			
			},	
			
			/**
			 * 初始加载班级下学生列表数据，
			 */
			studentList : function(param){
				ajaxData.request(
					URL_COURSEPLAN.ARRANGE_COURSE_GETSTUDENTLISTBYCLASSID,
					param, 
				function(data){
					if(utils.isNotEmpty(data)){
						if (data.data.length > 0) {
							//当有已添加的学生，判断并在获取值中删除
							var studentId = param.studentId;
							if(utils.isNotEmpty(studentId)){
								var dataList = data.data;
								$.each(studentId, function(i, arr){
									var postId = arr,
										arrListNum = dataList.length-1;
									
									//遍历获取的班级数据，已添加的学生id与获取的id 比对；
									for(var n=arrListNum; n>=0; n--){
										var getId = dataList[n].studentId;
										if(getId==postId){
											dataList.splice(n,1);
											return dataList;
										}
									}
								});
								
								$.each(dataList, function(o, obj){
									obj.id = o+1;
								});
								
								data.data = dataList;
								//判断已添加学生数目后加载列表数据
								if (data.data.length > 0) {
									$("#addtbodycontent").empty().append($("#bodyContentImpl").tmpl(data.data)).removeClass("no-data-html"); 
									//添加title
									common.titleInit();
								}else{
									$("#addtbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
								}
								
							}else{
								$("#addtbodycontent").empty().append($("#bodyContentImpl").tmpl(data.data)).removeClass("no-data-html");
							}
						    
						    // 取消全选
							$('#check-all').removeAttr("checked").parent().removeClass("on-check");
						
						}else {
							$("#addtbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
						}
						
						// 取消全选
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					}
					
				});
			},
       
			/*
			 * 查询条件
			 */
			getQueryParams : function(){
				var param = {};
				param.classId = $("#class").val(); //班级id
				param.studentNoOrName = $("#studentNoName").val(); //学号姓名
				param.courseId = this.courseInfo.courseId;
				param.majorId = this.courseInfo.majorId;
				param.academicYear = this.courseInfo.academicYear; 
				param.semesterCode = this.courseInfo.semesterCode; 
				param.grade = this.courseInfo.grade; 
				param.departmentId = this.courseInfo.departmentId;
				param.studentId = this.courseInfo.studentId;
				param.groupNo = this.courseInfo.groupNo;  //已选择小组
				return param;
			},
			
			/**
			 * 获取已选择的学生信息 
			 */
			getStudents : function(){
				var flag = true;	
				var errormsg = {};
				addStudents.errormsg = errormsg;
				var checkOn = $(document).find("td>div.on-check");
					
				
				if(checkOn.length == 0){
					errormsg.content = "请选择需要添加的学生！";
					flag = false;
					
				}else if(checkOn.length>=1){
					
					var addStudentsList =[];
					for(var n=0; n<=checkOn.length-1; n++){
						var thisTr = $(checkOn[n]).parents("tr");
							thisTr = $(thisTr);
							tdS = thisTr.children("td");
							tdS = $(tdS);
						
						var addStudentData ={};
						addStudentData.studentId = thisTr.attr("studentId");  //学生id
						addStudentData.classId = tdS.eq(2).attr("classId");  //班级id
						addStudentData.className = tdS.eq(2).text();  //班级名称	
						addStudentData.practiceWeeks = tdS.eq(3).text();	//实践周次 
						addStudentData.studentNo = tdS.eq(4).text();	//学号
						addStudentData.studentName = tdS.eq(5).text();	// 姓名
						addStudentData.sexName = tdS.eq(6).text();	 //性别名称
						
					//储存学生信息
					addStudentsList.push(addStudentData);
					addStudents.addStudentsList = addStudentsList;
					flag = true;
					}
					
				}
				
				if(!flag){
					return false;
				}
				
				return flag;
				
			}
			
	}
	module.exports = addStudents; //根文件夹名称一致
});