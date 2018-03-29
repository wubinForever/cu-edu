define(function(require, exports, module) {

	/**
	 * ajax请求类型
	 */
	var RequestMethod = {
		PUT : "PUT",
		POST : "POST",
		DELETE : "DELETE",
		GET : "GET"
	}
	/**
	 * 所有请求
	 */
	var config = {

		/* **********设置学分及门数上限************************************ */
		// 设置学分及门数上限-列表
		CREDITANDNUMLIMIT_GETLIST : {
			url : "/choicecourse/creditandnumlimit/getList",
			method : RequestMethod.GET
		},

		// 获取课程类型及课程属性组合
		CREDITANDNUMLIMIT_GETCOURSETYPELIST : {
			url : "/choicecourse/creditandnumlimit/getCourseTypeAndAttributeList",
			method : RequestMethod.POST
		},
		
		// 批量设置编辑学分上限、门数上限
		CREDITANDNUMLIMIT_ADD : {
			url : "/choicecourse/creditandnumlimit/add",
			method : RequestMethod.POST
		},

		// 单个编辑学分上限、门数上限
		CREDITANDNUMLIMIT_UPDATE : {
			url : "/choicecourse/creditandnumlimit/update",
			method : RequestMethod.POST
		},
		// 设置学分及门数上限-列表
		CREDITANDNUMLIMIT_GETCREDITANDNUMLIST : {
			url : "/choicecourse/creditandnumlimit/getCreditAndNumLimitList",
			method : RequestMethod.GET
		},
		
		/* **********设置选课人数上限************************************ */
		// 设置选课人数上限-列表
		CHOICENUMLIMIT_GETLIST : {
			url : "/choicecourse/choicenumlimit/getList",
			method : RequestMethod.GET
		},

		// 批量设置或单个编辑可选人数上限
		CHOICENUMLIMIT_UPDATE : {
			url : "/choicecourse/choicenumlimit/batchSetup",
			method : RequestMethod.POST
		},
		
		/* **********设置选课轮次************************************ */
		// 设置选课轮次-列表
		ROUND_GETLIST : {
			url : "/choicecourse/round/getList",
			method : RequestMethod.GET
		},
		// 设置选课轮次-新增
		ROUND_ADD : {
			url : "/choicecourse/round/add",
			method : RequestMethod.POST
		},		
		// 设置选课轮次-修改
		ROUND_UPDATE : {
			url : "/choicecourse/round/update",
			method : RequestMethod.POST
		},
		// 设置选课轮次-删除
		ROUND_DELETE : {
			url : "/choicecourse/round/delete",
			method : RequestMethod.POST
		},
		// 设置选课轮次-详情
		ROUND_GETITEM : {
			url : "/choicecourse/round/getItem",
			method : RequestMethod.GET
		},
		// 设置选课轮次-验证轮次名称重复
		ROUND_VALIDATION : {
			url : "/choicecourse/round/validationRoundName",
			method : RequestMethod.GET
		},
		// 设置选课轮次-轮次下拉框
		ROUND_SELECT : {
			url : "/choicecourse/round/getRoundSelectList",
			method : RequestMethod.GET
		},
		
		/* **********设置选课课程************************************ */
		//选择课程列表 
	    CHOICECOURSE_GETLIST:{
	    	url : "/choicecourse/choicecourse/getList",
		    method : RequestMethod.GET
	    },
	    //开放课程列表 
	    CHOICECOURSE_GETOPENLIST:{
	    	url : "/choicecourse/choicecourse/getOpenList",
		    method : RequestMethod.GET
	    },
	    // 设置开放课程-新增
	    CHOICECOURSE_ADD : {
			url : "/choicecourse/choicecourse/add",
			method : RequestMethod.POST
		},
		// 移除课程
	    CHOICECOURSE_DELETE : {
			url : "/choicecourse/choicecourse/delete",
			method : RequestMethod.POST
		},
		
		/* **********设置选课学生************************************ */
		//选择学生专业列表 
	    CHOICESTUDENT_GETLIST:{
	    	url : "/choicecourse/choicestudent/getList",
		    method : RequestMethod.GET
	    },
	    //开放专业列表 
	    CHOICESTUDENT_GETOPENLIST:{
	    	url : "/choicecourse/choicestudent/getOpenList",
		    method : RequestMethod.GET
	    },
	    // 设置开放专业-新增
	    CHOICESTUDENT_ADD : {
			url : "/choicecourse/choicestudent/add",
			method : RequestMethod.POST
		},
		// 移除专业
	    CHOICESTUDENT_DELETE : {
			url : "/choicecourse/choicestudent/delete",
			method : RequestMethod.POST
		},
	    // 设置禁选学生-新增
	    CHOICESTUDENT_ADDSTUDENT : {
			url : "/choicecourse/choicestudent/addStudent",
			method : RequestMethod.POST
		},
		// 设置禁选学生-禁选单个学生列表/已经存在禁选学生列表/所有禁选学生列表（已保存+未保存）
	    CHOICESTUDENT_GETSTUDENTLISST : {
			url : "/choicecourse/choicestudent/getStudentList",
			method : RequestMethod.POST
		},
		
		/* **********按学生调整选课************************************ */
		// 按学生调整选课 列表
	    ADJUSTSTUDENTCHOICE_GETLIST : {
	    	url : "/choicecourse/adjuststudentchoice/getList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 选择学生列表
	    ADJUSTSTUDENTCHOICE_GETSTUDENTPAGEDLIST : {
	    	url : "/choicecourse/adjuststudentchoice/getStudentPagedList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 退选
	    ADJUSTSTUDENTCHOICE_DELETE : {
	    	url : "/choicecourse/adjuststudentchoice/delete",
			method : RequestMethod.POST
		},
		// 按学生调整选课 选择课程-加载课程类型
	    ADJUSTSTUDENTCHOICE_LOADCOURSETYPE : {
	    	url : "/choicecourse/adjuststudentchoice/getCourseTypeList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 选择课程-加载课程属性
	    ADJUSTSTUDENTCHOICE_LOADCOURSEATTRIBUTE : {
	    	url : "/choicecourse/adjuststudentchoice/getCourseAttributeList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 补选课程列表
	    ADJUSTSTUDENTCHOICE_GETCOURSEPAGEDLIST : {
	    	url : "/choicecourse/adjuststudentchoice/getCoursePagedList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 选择教学班列表
	    ADJUSTSTUDENTCHOICE_GETTEACHINGCLASSLIST : {
	    	url : "/choicecourse/adjuststudentchoice/getTeachingClassList",
			method : RequestMethod.GET
		},
		// 按学生调整选课 补选课程保存
		ADJUSTSTUDENTCHOICE_ADJUSTADD : {
	    	url : "/choicecourse/adjuststudentchoice/add",
			method : RequestMethod.POST
		},
		
		/* **********批量选课************************************ */
		// 批量选择课程 列表
	    BATCHCHOICE_GET_BATCH_CHOICE_LIST : {
	    	url : "/choicecourse/choicemanage/getBatchChoiceList",
			method : RequestMethod.GET
		},
		// 批量选择课程-增加批量选课
	    BATCHCHOICE_ADD_BATCH_CHOICE : {
	    	url : "/choicecourse/choicemanage/addBatchChoice",
			method : RequestMethod.POST
		},
		// 批量选课-调整选课-可选学生集合
	    BATCHCHOICE_GET_TEACHING_WANT_STUDENT_LIST : {
	    	url : "/choicecourse/choicemanage/getTeachingWantStudentList",
			method : RequestMethod.GET
		},
		// 批量选课-调整选课-已选课学生集合
	    BATCHCHOICE_GET_TEACHING_CHOICE_STUDENT_LIST : {
	    	url : "/choicecourse/choicemanage/getTeachingChoiceStudentList",
			method : RequestMethod.GET
		},
		/* **********处理选课结果************************************ */
		// 处理选课结果 列表
		CHOICERESULTMANAGE_GETPAGEDLIST : {
			url : "/choicecourse/adjuststudentchoice/getPagedList",
			method : RequestMethod.GET
		},
		// 验证教学班已选人数是否大于0
		CHOICERESULTMANAGE_VALIDATE : {
			url : "/choicecourse/adjuststudentchoice/validate",
			method : RequestMethod.POST
		},
		// 处理选课结果 获取教学班选课学生名单
		CHOICERESULTMANAGE_GETTEACHINGCHOICESTUDENTLIST : {
			url : "/choicecourse/adjuststudentchoice/getTeachingChoiceStudentList",
			method : RequestMethod.GET
		},
		// 处理选课结果 调剂保存
		CHOICERESULTMANAGE_ADJUSTSAVE : {
	    	url : "/choicecourse/adjuststudentchoice/adjustSave",
			method : RequestMethod.POST
		},
		// 处理异动学生选课结果列表
		CHOICEALIENCHANGE_GETPAGEDLIST : {
			url : "/choicecourse/adjuststudentchoice/getAlienChangePagedList",
			method : RequestMethod.GET
		},
		/* **********选课结果查询************************************ */
		// 选课结果查询 分页列表
	    RESULTSEARCH_GETPAGEDLIST : {
	    	url : "/choicecourse/choiceresult/getResultSearchPagedList",
			method : RequestMethod.GET
		},		
		// 选课结果查询 导出
		RESULTSEARCH_EXPORT : {
	    	url : "/choicecourse/choiceresult/exportResultSearch",
			method : RequestMethod.POST
		},
		// 教学班空余名额查询列表
		EMPTYSEARCH_GETPAGEDLIST : {
			url : "/choicecourse/teachingclassquota/getPagedList",
			method : RequestMethod.GET
		},
		// 教学班空余名额 导出
		EMPTYSEARCH_EXPORT : {
	    	url : "/choicecourse/teachingclassquota/export",
			method : RequestMethod.POST
		},
		// 选课日志查询列表
		CHOICELOG_GETPAGEDLIST : {
			url : "/choicecourse/choiceresultlog/getPagedList",
			method : RequestMethod.GET
		},
		// 选课额日志导出
		CHOICELOG_EXPORT : {
	    	url : "/choicecourse/choiceresultlog/export",
			method : RequestMethod.POST
		},
		/* **********教学班花名册************************************ */
		// 教学班花名册 分页列表
		TEACHINGCLASS_GETPAGEDLIST : {
	    	url : "/choicecourse/choiceresult/getTeachingClassPagedList",
			method : RequestMethod.GET
		},		
		// 教学班花名册 导出
		TEACHINGCLASS_EXPORT : {
	    	url : "/choicecourse/choiceresult/exportTeachingClass",
			method : RequestMethod.POST
		},
		// 选择教学班下拉框
		TEACHINGCLASS_GET_TEACHINGCLASS_SELECT : {
	    	url : "/choicecourse/adjuststudentchoice/getTeachingClassSelect",
			method : RequestMethod.GET
		}
	}
	module.exports = config;
});
