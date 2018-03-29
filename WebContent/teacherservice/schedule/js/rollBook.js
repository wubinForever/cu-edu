/**
 * 上课点名册
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	// 下拉框
	var simpleSelect = require("basePath/module/select.simple");
	// URL
	var urlTeacher = require("basePath/config/url.teacherservice");// 教师服务url
	var urlData = require("basePath/config/url.data");

	var rollBook = {
		/**
		 * 初始化
		 */
		init : function() {
			// 加载学校信息
			rollBook.loadSchollInfo();
			
			// 学年学期 默认当前学年学期(方法中是同步)
			simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemesterSelect"));
		    var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
		    
		    // 课程（同步）
		    rollBook.loadCourse();
		    
		    // 上课点名册列表
		    rollBook.loadList();
		    
		    // 基本信息 
		    rollBook.loadBaseInfo();
		    
		    //学年学期联动课程
		    $("#academicYearSemesterSelect").change(function(){
		    	rollBook.loadCourse();
			});

			//课程联动教学班
		    $("#courseSelect").change(function(){
		    	 academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    	 semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
	             var courseSelect = $(this).val()
	             if (utils.isNotEmpty(courseSelect)){
	                  simpleSelect.loadSelect("teachingClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{
	                	  academicYear : academicYear,
	                	  semesterCode : semesterCode,
	                	  courseSelect : courseSelect
	                  });  
	             }else{
	            	 $("#teachingClassSelect").html("<option value=''></option>");
	             }          
	              
			});

			//查询按钮
			$("#query").on("click", function(){
				rollBook.getQueryParams(false);// 保存查询参数				
				rollBook.loadList();
				// 基本信息 
			    rollBook.loadBaseInfo();
			});
			
			//绑定导出
			$(document).on("click", "#export", function() {
				ajaxData.exportFile(urlTeacher.TEACHER_CHOICEMANAGE_EXPORT_ROLLBOOK, rollBook.getQueryParams(true));
			});
		},
		
		/**
		 * 查询参数
		 * 
		 * @param getCachedParams 是否获取参数
		 * @returns 参数
		 */
		getQueryParams: function(getCachedParams){
			var params = $('#queryForm').data("data-query-params");
			if(!params || !getCachedParams){
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				//学年学期名称
				requestParam.academicYearSemesterName = $("#academicYearSemesterSelect").find("option:selected").attr('title');	
				// 课程名
				if (utils.isEmpty($("#courseSelect").find("option:selected").attr("title"))){
					requestParam.courseName ="";
					requestParam.courseNo ="";
				}else{
					requestParam.courseName = $("#courseSelect").find("option:selected").attr("title").split("]")[1];				
					// 课程编号
					requestParam.courseNo = $("#courseSelect").find("option:selected").attr("title").split("[")[1].split("]")[0];					
				}
				// 学校名称
				requestParam.schoolName = $("#schoolName").text();
				// 教学班号
				requestParam.teachingClassNo = $("#teachingClassSelect").find("option:selected").text();
				//缓存查询参数
				$('#queryForm').data("data-query-params", requestParam);
				return requestParam;
			}
			return params;
		},
		
		/**
		 * 加载学校信息
		 */
		loadSchollInfo : function(){
			// 学校信息
			ajaxData.request(urlData.SCHOOL_GET,"",
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							$("#schoolName").text(data.data.schoolName);
						}						
			});
		},
		
		/**
		 * 加载基本信息
		 */
		loadBaseInfo : function(){	
			// 其它
			$("#academicYearSemesterName").text($("#academicYearSemesterSelect").find("option:selected").attr('title'));
			$("#courseName").text($("#courseSelect").find("option:selected").attr("title")||"");
			var user = window.top.USER;				
			$("#teacherName").text("[" + user.accountName + "]" + user.userName);
			$("#teachingClassName").text($("#teachingClassSelect").find("option:selected").text()||"");

		    rollBook.getQueryParams(false);// 设置参数
		},
		
		/**
		 * 加载课程(同步)
		 */
        loadCourse : function(){
        	// 学年学期
        	var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
        	var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
			var param = {
				academicYear:academicYear,
				semesterCode:semesterCode
			}
			// 空值处理
			if (utils.isEmpty($("#academicYearSemesterSelect").val())) {
				$("#courseSelect").html("<option value=''></option>");
				$("#teachingClassSelect").html("<option value=''></option>");
				return false;
			}
			// 课程
			simpleSelect.loadSelect("courseSelect", urlTeacher.TEACHER_ARRANGE_GET_COURSE_SELECT,
					param, 
					{async:false
			});

			// 空值处理
			if (utils.isEmpty($("#courseSelect").val())) {
				$("#teachingClassSelect").html("<option value=''></option>");
				return false;
			}
			// 教学班
			param.courseSelect = $("#courseSelect").val();
            simpleSelect.loadSelect("teachingClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,
					param, 
					{async:false
			});
        },
        
		/**
		 * 加载上课点名册列表
		 */
		loadList : function(){
			ajaxData.request(urlTeacher.TEACHER_GET_STUDENTBYTEACHINGCLASS, rollBook.getQueryParams(true), function(resData) {
					// 返回成功
					if (resData.code == config.RSP_SUCCESS) {
						var rvData = resData.data;
						if (rvData && rvData.length > 0) {
							$("#tbodycontent").removeClass("no-data-html")
									.empty().append(
											$("#bodyContentImpl").tmpl(
													rvData));							
						} else {
							$("#tbodycontent").empty().append(
									"<tr><td colspan='41'></td></tr>")
									.addClass("no-data-html");
						}
					} else {
						$("#tbodycontent").empty().append(
						"<tr><td colspan='41'></td></tr>")
						.addClass("no-data-html");
					}
					// 学生人数
					$("#studentSum").text($("#tbodycontent tr[class='element']").length);				
			});
		}
	}

	module.exports = rollBook; 
	window.rollBook = rollBook;
});