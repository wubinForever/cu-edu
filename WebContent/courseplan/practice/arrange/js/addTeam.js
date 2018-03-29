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
	var validate = require("basePath/utils/validateExtend");
	
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
	var addTeam = {
			/*
			 * 新增初始化
			 */
			init : function() {
				
				//储存弹框内对象
				popup.setData('addTeamArr', addTeam);
				
				//默认加载当前学年学期
				var semester = simpleSelect.loadCourseSmester("semester", true);
				this.semester = semester;
				
				//加载年级
			    simpleSelect.loadCommon("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,"","--请选择--","",null);
				this.loadDepartment();//加载院系
				this.loadMajor();//加载专业
				
				//年级院系联动专业
				$("#departmentId,#grade").change(function(e){
				    addTeam.loadMajor();
				})
				
				//联动下拉
				$("#semester, #grade, #departmentId, #majorId").change(function(){
					
					//清空环节类别
					var courseType = $("#courseType").text();
					if(utils.isNotEmpty(courseType)){
						$("#courseType").removeAttr("practiceID").removeAttr("styleId").text("");
					}
					//重置环节
					addTeam.changePractice();
					//重置小组号
					addTeam.lodeGroup();
					//重置指导教师
					addTeam.lodeTeachers();
					//重置题目
					$("#subject").val(""); 
					//重置题目内容
					$("#subjectContent").val(""); 
					//重置学生列表
					$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
					$("#check-all").parent().removeClass("on-check");
					$("span[name = stuNumber]").text("0");
				});
				
				
				//环节下拉联动
				//专业联动环节
				$("#majorId").change(function(e){
					if(utils.isEmpty($(this).val()) 
						&& utils.isNotEmpty($("#grade").val())  && $("#grade").val()==''
						&& utils.isEmpty($("#departmentId").val())){
				        $("#majorId, #courseNoName").html("<option value=''>--请选择--</option>");
			    	    return false;
					}
					//addTeam.changePractice();
				});
				
				//环节下拉监听,获取环节类型
				$("#courseNoName").change(function(){
					var practiceInfo = $('#courseNoName').val();
					
					if(utils.isNotEmpty(practiceInfo)){
						
						var arr = practiceInfo.split("_");
						var practiceStyle = arr[2];
						
						//环节类型联动
						$("#courseType").attr({"practiceID":arr[0],"styleId":arr[1]}).html(practiceStyle);
						
						//题目及题目内容联动
						//获取环节类型，当环节类型为课程设计与毕业设计时。判断是否显示题目与题目内容
						var courseStyle = $("#courseType").attr("styleId");
						if(courseStyle == 24 || courseStyle == 25){
							$("[name='subjectCon1']").children().css("visibility","visible");
							$("[name='subjectCon2']").children().show();
						}else{
							$("[name='subjectCon1']").children().css("visibility","hidden");
							$("[name='subjectCon2']").children().hide();
						}
					}
					
					
					//小组号加载
					addTeam.lodeGroup();
					
					//指导教师：下拉多选,加载所有教师数据
					addTeam.lodeTeachers();
					//重置题目
					$("#subject").val(""); 
					//重置题目内容
					$("#subjectContent").val(""); 
					//重置学生列表
					$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
					$("#check-all").parent().removeClass("on-check");
					$("span[name = stuNumber]").text("0");
					
				});
				
				//下拉多选自动收缩
				addTeam.multiSelect();

				//小组成员添加
				$("button[name='studentAdd']").on('click',function(){
					var practiceId = $("#courseType").attr("practiceid"),
						groupId =  $("#teamNo").val();
					
					//判断有没有选择环节
					if(utils.isEmpty(practiceId)){
						popup.errPop("请先选择环节！");
					}else if(utils.isEmpty(groupId) || groupId == 0){
						popup.errPop("请先选择小组号！");
					}else{	
						addTeam.studentAdd(practiceId);
					}
				});
				
				//删除成员
				addTeam.deletGroup();
				
				// 页面绑定验证事件
				addTeam.validate();
				
			},
			/**
			 * 加载院系
			 */
			loadDepartment : function(){
				var param = {};
				var me = this;
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.departmentName, value:item.departmentId});
						});
						simpleSelect.installOption($("#departmentId"), list, "", "--请选择--","" );
						
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			/**
			 *  加载专业
			 */
			loadMajor : function(departmentId){
				var param = {};
				param.departmentId = $("#departmentId").val();
				param.grade = $("#grade").val();
				$("#majorId").val("");
				if(utils.isNotEmpty(param.grade) && utils.isNotEmpty(param.departmentId) ){
					ajaxData.setContentType("application/json;charset=utf-8");
					ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param),function(data) {
						if(data.code == config.RSP_SUCCESS){
							var list = [];
							$.each(data.data, function(i, item){
								list.push({name: item.majorName, value:item.majorId});
							});
							simpleSelect.installOption($("#majorId"), list, "--请选择--", "--请选择--","" );
						}else{
							popup.errPop("查询失败："+data.msg);
						}
					});
				}else{
					
				}
				
			}, 
			/**
			 * 获取环节下拉
			 */
			changePractice :function(obj){
				var reqData={};
					reqData.grade = $("#grade").val();
					reqData.departmentId = $("#departmentId").val();
					reqData.majorId = $("#majorId").val();
					reqData.academicYear = addTeam.semester.getAcademicYear();
					reqData.semesterCode = addTeam.semester.getSemesterCode();
	 
				simpleSelect.loadSelect("courseNoName", URL_COURSEPLAN.ARRANGE_COURSE_GETPRACTICETACHELIST,reqData,{defaultValue:"",firstText:"--请选择--", firstValue:""});
				return;
			},
			
			/*
			 * 加载小组
			 */
			lodeGroup : function(){
				var reqData = {};
					reqData.academicYear = addTeam.semester.getAcademicYear(); //学年
					reqData.semesterCode = addTeam.semester.getSemesterCode();//"学期
					reqData.grade = $("#grade").val(); //年级
					reqData.departmentId = $("#departmentId").val(); //院系id
					reqData.majorId = $("#majorId").val(); //专业id
					reqData.courseId = $("#courseType").attr("practiceid"); //环节id
					
				simpleSelect.loadSelect("teamNo", URL_COURSEPLAN.ARRANGE_COURSE_GETGROUPNO,reqData,{defaultValue:"",firstText:"--请选择--", firstValue:""});
					
			},
			/*
			 * 加载指导教师
			 */
			
			lodeTeachers : function(){
				//清空下拉旧数据
				$(document).find("#teacher-list").html("");
				
				var reqData={};
					reqData.courseId = $("#courseType").attr("practiceid"); //环节id
					reqData.academicYear = addTeam.semester.getAcademicYear();//学年
					reqData.semesterCode = addTeam.semester.getSemesterCode();//学期
				
				ajaxData.request(
					URL_COURSEPLAN.PRACTICE_LINKTEACHER_GETSELECTLIST,
					reqData,
				function(data){
					if(utils.isNotEmpty(data)){
						if (data.data.length > 0) {
						
							$.each(data.data, function(i, arr){
								var teacherName = arr.name,
									teacherId = arr.value;
									
								//加载下拉内容
								var select = '<label class="checkbox-con" name="toggle-box"><input type="checkbox" value='+teacherId+' class="checNormal"><span title='+teacherName+'>'+teacherName+'</span></label>';
								$(document).find("#teacher-list").append(select);
								$("#teachers").val("--请选择--");
							});
							
						}else{
							$("#teachers").val("--请选择--");
							$("#teacher-list").html("");
						}
					}
				});	
			},
			
			/*===========================教师多选功能===================================*/
			/*
			 * 下拉多选加载结果
			 * 指导老师多选
			 */
			getCheckon : function(){
				var checkon = $(document).find("label.on-check"),
					teacherInfo = {},
					teacherNames = "",
					teacherIds = "";
				
				for(var n=0; n<= checkon.length-1; n++){
					var id = $(checkon[n]).children("input").val(),
						name = $(checkon[n]).children("span").text();
					
					teacherNames += name+",";
					teacherIds += id+",";
					
				}
				
				teacherNames = teacherNames.substring(0,teacherNames.length - 1);
				teacherIds = teacherIds.substring(0,teacherIds.length - 1);
				
				teacherInfo.teacherNames = teacherNames;
				teacherInfo.teacherIds = teacherIds;
				
				addTeam.teacherGet = teacherInfo;
				
			},
			
			/*
			 * 多选下拉
			 * 指导老师多选
			 * 自动收缩功能
			 */
			multiSelect : function(){
				//下拉多选按键
				$(document).click(function(e) {
					if ($(e.target).siblings("div.multiSelect").children().length > 0) {
						$(e.target).siblings("div.multiSelect").show();
					}else if($(e.target).parent("[name = 'toggle-box']").hasClass("checkbox-con") || $(e.target).hasClass("checkbox-con")){
						$("div.multiSelect").show();
						addTeam.getCheckon();
						data = addTeam.teacherGet;
						if(utils.isNotEmpty(data)){
							//把值加载到input表单内
							$("#teachers").val(data.teacherNames).attr("teacher-id", data.teacherIds);
						}
						
					}else{
						$("div.multiSelect").hide();
					}
				});
			},
			/*===========================教师多选功能end===================================*/
			
			/*
			 * 小组成员列表
			 * 加载列表数据
			 */
			groupListInit : function(dto){
				$("#check-all").prop("checked", false).parent().removeClass("on-check");
				var listLength = dto.length;
				//加载学生列表
				if (listLength > 0) {
					$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(dto)).removeClass("no-data-html"); 
					//添加title
					common.titleInit();
					$("span[name = stuNumber]").text(listLength);
					
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
					$("span[name = stuNumber]").text("0");
				}
			},
			
			/*
			 * 修改
			 * 初始化
			 */
			editInit :function(){
				//获取列表穿参
				this.coursePost = popup.getData("coursePost");
				//储存弹框内对象
				popup.setData('addTeamArr', addTeam);
				
				//小组修改弹框内容加载
				if(utils.isNotEmpty(this.coursePost)){
					var coursePost = this.coursePost;
					//加载已选择的下拉项
					//默认加载当前学年学期
					var defaultValue = coursePost.academicYear + "_" + coursePost.semesterCode;
					var semester = simpleSelect.loadCourseSmester("semester", true , defaultValue);
					this.semester = semester;
					//加载年级列表
				    simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,{defaultValue:coursePost.grade, firstText:"--请选择--", firstValue:"",async:false});
					//加载院系
				    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,null,{defaultValue:coursePost.departmentId, firstText:"--请选择--", firstValue:"",async:false}); //{departmentClassCode:"1"},"","全部","",
				    //加载专业
				    simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{defaultValue:coursePost.majorId, firstText:"--请选择--", firstValue:"",async:false});
					//加载环节
					var reqData={};
						reqData.grade = $("#grade").val();
						reqData.departmentId = $("#departmentId").val();
						reqData.majorId = $("#majorId").val();
						reqData.academicYear = this.semester.getAcademicYear();
						reqData.semesterCode = this.semester.getSemesterCode();
		 
					simpleSelect.loadSelect("courseNoName", URL_COURSEPLAN.ARRANGE_COURSE_GETPRACTICETACHELIST,reqData,{defaultValue:coursePost.courseId, firstText:"--请选择--", firstValue:"",async:false});
					var practiceInfo = $('#courseNoName').val();
					var arr = practiceInfo.split("_");
					var practiceStyle = arr[2];
					$("#courseType").attr({"practiceID":arr[0],"styleId":arr[1]}).html(practiceStyle);//环节类型联动
					
					//题目及题目内容联动
					var courseStyle = $("#courseType").attr("styleId");
					if(courseStyle == 24 || courseStyle == 25){
						$("[name='subjectCon1']").children().css("visibility","visible");
						$("[name='subjectCon2']").children().show();
					}else{
						$("[name='subjectCon1']").children().css("visibility","hidden");
						$("[name='subjectCon2']").children().hide();
					}
					
					//加载小组号
					var reqData = {};
						reqData.academicYear = this.semester.getAcademicYear(); //学年
						reqData.semesterCode = this.semester.getSemesterCode();//"学期
						reqData.grade = $("#grade").val(); //年级
						reqData.departmentId = $("#departmentId").val(); //院系id
						reqData.majorId = $("#majorId").val(); //专业id
						reqData.courseId = $("#courseType").attr("practiceid"); //环节id
						reqData.GroupNo = coursePost.groupNo; //环节id
						
					simpleSelect.loadSelect("teamNo", URL_COURSEPLAN.ARRANGE_COURSE_GETGROUPNO,reqData,{defaultValue:coursePost.groupNo, firstText:"--请选择--", firstValue:"",async:false});
					
					$("#subject").val(coursePost.linkTitle); //题目
					$("#subjectContent").val(coursePost.linkContent); //题目内容
					
					//指导教师：下拉多选,加载所有教师数据
					addTeam.lodeTeachers();
					
					var teachers = coursePost.listPracticalTeacherDto; //获取待修改的老师数据加载到表单中
					if(utils.isNotEmpty(teachers)){
						$.each(teachers, function(i, n){
							 var teacherId = n.teacherId,
								 selObj = $(document).find(".multiSelect .checkbox-con>input");
								 
								 $.each(selObj, function(o, m){
								 	 selObjVal = $(m).val();
								 	//比较待修改的老师与所有加载的老师数据
									 if(selObjVal == teacherId){
									 	$(m).parent("label").addClass("on-check");
									 }
								 });
								 
						});
						addTeam.getCheckon();
						data = addTeam.teacherGet;
						if(utils.isNotEmpty(data)){
							//把值加载到input表单内
							$("#teachers").val(data.teacherNames).attr("teacher-id", data.teacherIds);
						}
					}
					
					//下拉多选自动收缩
					addTeam.multiSelect();
					
					//小组成员列表加载
					var studentsPoseData = coursePost.listPracticalTacheStudentDto;
					if(utils.isNotEmpty(studentsPoseData)){
						
						//加载学生列表
						addTeam.groupListInit(studentsPoseData);
						
						
					}
					
					//修改弹框-小组成员添加
					$("button[name='studentAdd']").on('click',function(){
						var practiceId = $("#courseType").attr("practiceid"),
							groupId =  $("#teamNo").val();
						
						addTeam.studentAdd(practiceId);
					});
					
					//删除成员
					addTeam.deletGroup();
					
					// 页面绑定验证事件
					addTeam.validate();
				
					
				}
			},
			
			/*
			 * 弹窗  学生添加
			*/
			studentAdd : function(practiceId) {
						
						var practiceId = practiceId, 
							grade = $("#grade").val(),
							majorId = $("#majorId").val(),
							departmentId = $("#departmentId").val(),
							academicYear = addTeam.semester.getAcademicYear(),
							semesterCode = addTeam.semester.getSemesterCode();
							
						//获取已添加的学生
						if(!$("#tbodycontent").is('.no-data-html')){
								
							var tr = $(document).find("#tbodycontent>tr"),
								stuIdList = [];
								
							for(var n=0; n<=tr.length-1; n++){
								stuId = $(tr[n]).attr("studentId");
								stuIdList.push(stuId);
							}
						}
						
						//储存相关参数
						var data = {};
						data.courseId = practiceId;//环节id
						data.grade = grade; //年纪
						data.majorId = majorId; //专业
						data.academicYear = academicYear; //学年
						data.semesterCode = semesterCode; //学期
						data.departmentId = departmentId; //院系
						data.studentId = stuIdList;  //已添加学生ID
						data.groupNo = $("#teamNo").val();  //已选择小组
						
						
						
						//向弹框穿参：‘环节id,年纪，专业’
						popup.setData("courseInfo", data);
						
						popup.open('./courseplan/practice/arrange/html/addstudent.html', // 这里是页面的路径地址
						{
							id : 'studentAdd',// 唯一标识
							title : '学生添加',// 这是标题
							width : 800,// 这是弹窗宽度。其实可以不写
							height : 650,// 弹窗高度*/
							ok: function () {
								//获取添加学生弹框对象
								var addStuArr = popup.getData("addStuArr");
								var errormsg="";
								
								if(!addStuArr.getStudents()){
									//判断验证提醒
									errormsg = addStuArr.errormsg;
									popup.warPop(errormsg.content);
									return false;
									
								}else{
									
									//获取现在添加的学生
									var addStudentsData = addStuArr.addStudentsList;
									
									//获取已添加的学生
									if(!$("#tbodycontent").is('.no-data-html')){
										var thisTr = $(document).find("#tbodycontent>tr");
										for(var n=0; n<=thisTr.length-1; n++){
											var tdS = $(thisTr[n]).children("td"),
												tdS = $(tdS);
											
											var studentData ={};
												studentData.studentId = $(thisTr[n]).attr("studentId");  //学生id
												studentData.classId = tdS.eq(2).attr("classId");  //班级id
												studentData.className = tdS.eq(2).text();  //班级名称	
												studentData.practiceWeeks = tdS.eq(3).text();	//实践周次 
												studentData.studentNo = tdS.eq(4).text();	//学号
												studentData.studentName = tdS.eq(5).text();	// 姓名
												studentData.sexName = tdS.eq(6).text();	 //性别名称
											
												addStudentsData.push(studentData);
										}
									}	
									
									//加载学生列表
									addTeam.groupListInit(addStudentsData);
									
								}
								
														        
						    },
						    cancel: true
						});
		},
		
		/*
		 * 删除
		 * 小组成员删除
		 */
		deletGroup : function(){
			$("button[name = deletGroup]").click(function(){
				var ischeck = $("#tbodycontent").find("td>div.on-check");
				if(ischeck.length>0){
					popup.askDeletePop("小组成员", function(){
						ischeck.parents("tr").remove();
						
						//刷新列表
						var studentsDto = [];
						if(!$("#tbodycontent").is('.no-data-html')){
							var thisTr = $(document).find("#tbodycontent>tr");
							for(var n=0; n<=thisTr.length-1; n++){
								var tdS = $(thisTr[n]).children("td"),
									tdS = $(tdS);
								
								var studentData ={};
									studentData.studentId = $(thisTr[n]).attr("studentId");  //学生id
									studentData.classId = tdS.eq(2).attr("classId");  //班级id
									studentData.className = tdS.eq(2).text();  //班级名称	
									studentData.practiceWeeks = tdS.eq(3).text();	//实践周次 
									studentData.studentNo = tdS.eq(4).text();	//学号
									studentData.studentName = tdS.eq(5).text();	// 姓名
									studentData.sexName = tdS.eq(6).text();	 //性别名称
								
									studentsDto.push(studentData);
							}
							//加载学生列表
							addTeam.groupListInit(studentsDto);
							$("#check-all").parent().removeClass("on-check");
						}	
						popup.okPop("删除成功");
					});
				}else{
					popup.errPop("请选择要删除的成员！"); 
				}
			});
		},
		
		
		/*
		 * 保存并新增
		 * 加载窗口数据
		 */
		lodeCourseInfo : function(data){
			
			//小组号加载
			addTeam.lodeGroup();
			
			//指导教师：下拉多选,加载所有教师数据
			$("#teacher-list").html("");
			addTeam.lodeTeachers();
			
			//题目
			$("#subject").val(""); 
			//题目内容
			$("#subjectContent").val(""); 
			//学生列表
			$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html"); 
			$("span[name = stuNumber]").text("0");
		},
		
		/**
		 * 界面数据校验
		 */
		validate:function(){
			$("#groupForm").validate({
				rules:{
					semester : {
						required : true
					},
					grade : {
						required : true
					},
					departmentId : {
						required : true
					},
					majorId : {
						required : true
					},
					courseNoName : {
						required : true
					},
					teamNo : {
						required : true
					}
				},
				messages:{
					semester : {
						required : '学年学期不能为空'
					},
					grade : {
						required : '年级不能为空'
					},
					departmentId : {
						required : '院系不能为空'
					},
					majorId : {
						required : '专业不能为空'
					},
					courseNoName : {
						required : '环节不能为空'
					},
					teamNo : {
						required : '小组号不能为空'
					}
				}
			});
		},
		
		//获取页面内容
		getTeamAdd : function(){
			var valid = $("#groupForm").valid();
			var flag = true;	
			var errormsg = {};
			addTeam.errormsg = errormsg;
			
			if(valid){
				var teamAddinfo = {};
				
				teamAddinfo.academicYear = addTeam.semester.getAcademicYear(); //学年
				teamAddinfo.semesterCode = addTeam.semester.getSemesterCode(); //学期
				teamAddinfo.grade = $("#grade").val();  //年纪
				teamAddinfo.departmentId = $("#departmentId").val();  //院系
				teamAddinfo.majorId = $("#majorId").val(); //专业id
				teamAddinfo.courseId = $("#courseType").attr("practiceid");  //环节id
				teamAddinfo.groupNo = $("#teamNo").val();  //小组号
				teamAddinfo.memberCount = $("span[name = stuNumber]").text();  //人数
				teamAddinfo.linkTitle = $("#subject").val();  //题目
				teamAddinfo.linkContent = $("#subjectContent").val();  //题目
				//获取指导教师集合:实践安排教师集合
				teamAddinfo.listPracticalTeacherDto = [];  
				
					var listId = $("#teachers").attr("teacher-id");
					if(utils.isNotEmpty(listId)){
						$.each(listId.split(","), function(i, item){
							teacherIdlist ={};
							teacherIdlist.practicalTeachersId = "";
							teacherIdlist.practicalArrangeId = "";
							teacherIdlist.teacherId = item;
							
							teamAddinfo.listPracticalTeacherDto.push(teacherIdlist);	
							
						});
					}
				
				//获取学生列表内学生id:实践安排学生集合
				teamAddinfo.listPracticalStudentDto = [];
					if($("#tbodycontent").hasClass("no-data-html")){
						flag = false;
						errormsg.content = "请选择需要添加的学生！";
					}else{
						var studentListTr = $(document).find("#tbodycontent>tr");
						$.each(studentListTr, function(i, item){
							studentIdlist ={};
							studentIdlist.practicalStudentsId = "";
							studentIdlist.practicalArrangeId = "";
							studentIdlist.studentId = $(item).attr("studentId");
							
							teamAddinfo.listPracticalStudentDto.push(studentIdlist);
							
						});
						
						addTeam.teamAddinfo = teamAddinfo;
					}
					
					if(!flag){
						return false;
					}
					
					
				
			}else{
				//表单验证不通过
				flag = false;
				errormsg.content = "必填项不能为空！";
			}
				return flag;
		},
       
}	
	module.exports = addTeam; //根文件夹名称一致
	window.addTeam = addTeam;    //根据文件夹名称一致
});