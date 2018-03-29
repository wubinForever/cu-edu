/**
 * 学生服务
 */
define(function (require, exports, module) {

	/**
	 * ajax请求类型
	 */
	var RequestMethod = {
		PUT:"PUT",
		POST:"POST",
		DELETE:"DELETE",
		GET:"GET"
	}
	/**
	 * 所有请求
	 */
	var config = {
			
	    /**
	     * 获取去重的学籍注册表的学生学年学期
	     */
		ARCHIVESREGISTER_GET_ACADEMICYEARSEMESTER:{

	    	url : "/stu/archivesRegister/getAcademicYearSemester",
		    method : RequestMethod.GET
		},
		/**
	     * 获取去重的学籍注册表的学生学年
	     */
		GET_ACADEMICYEAR:{
	    	url : "/stu/archivesRegister/getAcademicYear",
		    method : RequestMethod.GET
		},
		/**
		 * 获取学生信息 
		*/	
		STUDENT_GETITEM:{
		    	url : "/studentService/stu/getItem",
			    method : RequestMethod.GET
		},
		
		/**
		 * 修改学生信息 
		*/	
		STUDENT_SAVE:{
		    	url : "/studentService/stu/save",
			    method : RequestMethod.POST
		},
	    
	    /**
	     * 获取学籍异动申请登记列表
	     */	    
		ALIENCHANGERECORD_GETLIST:{
	    	url : "/studentService/stu/alienchange/getList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 异动申请
	     */	    
	    ALIENCHANGERECORD_ADD:{
	    	url : "/studentService/stu/alienchange/add",
		    method : RequestMethod.POST
	    },
	    /**
	     * 异动信息修改
	     */	    
	    ALIENCHANGERECORD_UPDATE:{
	    	url : "/studentService/stu/alienchange/update",
		    method : RequestMethod.POST
	    },
	    /**
	     * 异动信息查看
	     */	    
	    ALIENCHANGERECORD_VIEW:{
	    	url : "/studentService/stu/alienchange/view",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动数据项
	     */	    
		ALIENCHANGERECORD_GETITEM:{
	    	url : "/studentService/stu/alienchange/getItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 删除
	     */	    
		ALIENCHANGERECORD_DELETE:{
	    	url : "/studentService/stu/alienchange/delete",
		    method : RequestMethod.POST
	    },

	    /**
	     * 获取教学安排调停课信息
	     */	    
		TEACHINGARRANGE_GETLESSONLIST:{
	    	url : "/studentService/lesson/getList",
		    method : RequestMethod.GET
	    },	    

		/** **********学生服务-选课中心************************************ */
	    // 选课轮次-判断是否有开放轮次
		CHOICECENTER_GETSTUDENTCHOICEISHAVAOPENEDROUND : {
			url : "/studentservice/studentchoicecenter/isHaveOpenedRound",
			method : RequestMethod.GET
		},
	    // 选课轮次-选课统计栏信息
		CHOICECENTER_GETSTUDENTCHOICEMAININFOLIST : {
			url : "/studentservice/studentchoicecenter/getChoiceMainInfoList",
			method : RequestMethod.GET
		},
		// 选课轮次-列表
		CHOICECENTER_GETSTUDENTROUNDLIST : {
			url : "/studentservice/studentchoicecenter/getRoundList",
			method : RequestMethod.GET
		},
		// 验证是否允许进入选课
		CHOICECENTER_VALIDATE : {
			url : "/studentservice/studentchoicecenter/validate",
			method : RequestMethod.POST
		},
		// 验证选课是否超过学分或门数上限
		CHOICECENTER_VALIDATELIMIT : {
			url : "/studentservice/studentchoicecenter/validateLimit",
			method : RequestMethod.POST
		},
		// 选课轮次-获取选课课程列表
		CHOICECENTER_GETSTUDENTROUNDCOURSELIST : {
			url : "/studentservice/studentchoicecenter/getRoundCourseList",
			method : RequestMethod.GET
		},
		// 选课轮次-获取选课学分及门数上限列表
		CHOICECENTER_GETSTUDENTCREDITNUMLIMITLIST : {
			url : "/studentservice/studentchoicecenter/getCreditNumLimitList",
			method : RequestMethod.GET
		},
		// 选课轮次-获取课程对应的教学班列表
		CHOICECENTER_GETSTUDENTTEACHINGCLASSLIST : {
			url : "/studentservice/studentchoicecenter/getTeachingClassList",
			method : RequestMethod.GET
		},
		// 选课结果及退选-列表
		CHOICECENTER_GETCHOICERESULTLIST : {
			url : "/studentservice/studentchoiceresult/getChoiceResultList",
			method : RequestMethod.GET
		},
		// 选课结果及退选-学生课表
		CHOICECENTER_GETSTUDENTSCHEDULELIST : {
			url : "/studentservice/studentchoiceresult/getStudentScheduleList",
			method : RequestMethod.GET
		},
		// 选课中心-学生保存选课
		CHOICECENTER_SAVETEACHING : {
			url : "/studentservice/studentchoicecenter/saveTeachingChoice",
			method : RequestMethod.POST
		},
		//查询培养方案
		GET_LIST_TRAIN_PLAN:{
			url : "/trainplan/majortheory/getStuMajorTheoryList",
			method : RequestMethod.POST
		}
		
	}
    module.exports = config;
});
