/**
 * 教师服务
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
		 * 获取查询名单列表 
		*/	
		TEACHER_GETTEACHERSERVICEROLLLISTBYPARAMS:{
		    	url : "/teacherService/student/getTeacherServiceRollListByParams",
			    method : RequestMethod.GET
		},
		
		/**
		 * 根据辅导员条件获取年级下拉框信息 
		*/	
		TEACHER_GETTEACHERGRADESBYCLASSQUERY:{
		    	url : "/stu/classmanage/getTeacherGradesByClassQuery",
			    method : RequestMethod.GET
		},
		
		/**
		 * 根据辅导员、年级条件获取班级下拉框信息 
		*/	
		TEACHER_GETTEACHERCLASSSELECTBYQUERY:{
		    	url : "/stu/classmanage/getTeacherClassSelectByQuery",
			    method : RequestMethod.GET
		},
		
		/**
		 * 导出查询学生名单 
		*/	
		TEACHER_EXPORTTEACHERSERVICEROLL:{
		    	url : "/teacherService/student/exportTeacherServiceRoll",
			    method : RequestMethod.GET
		},
		
		/**
		 * 教师端-根据学年学期、辅导员条件获取有学生的班级下拉框信息 
		*/	
		TEACHER_GETCLASSINFOINSCHOOL:{
		    	url : "/teacherService/student/getClassInfobyAcademicYearSemester",
			    method : RequestMethod.GET
		},
		
		/**
		 * 教师端-根据学年学期、辅导员条件获取所有学生的班级下拉框信息 
		*/	
		TEACHER_GET_CLASSINFO_ALL:{
		    	url : "/teacherService/student/getClassInfoAll",
			    method : RequestMethod.GET
		},
		
		/**
		 * 获取报到学生，不分页
		*/	
		TEACHER_GETLIST:{
		    	url : "/teacherService/report/getList",
			    method : RequestMethod.GET
		},
		
		/**
		 * 办理报到
		*/	
		TEACHER_TRANSACT:{
		    	url : "/teacherService/report/transact",
			    method : RequestMethod.POST
		},
		
		/**
		 * 撤销报到
		*/	
		TEACHER_REVOKE:{
		    	url : "/teacherService/report/revoke",
			    method : RequestMethod.POST
		},
		
		/**
		 * 导出报到学生
		*/	
		TEACHER_EXPORTREPORTROLL:{
		    	url : "/teacherService/report/exportReportRoll",
			    method : RequestMethod.GET
		},
		
		/**
		 * 获取教师个人信息
		*/	
		TEACHER_GETITEM:{
		    	url : "/teacherService/teacher/getItem",
			    method : RequestMethod.GET
		},
		
		/**
		 * 更新教师个人信息
		*/	
		TEACHER_UPDATE:{
		    	url : "/teacherService/teacher/update",
			    method : RequestMethod.POST
		},
				
		/**
	     * 课程下拉数据（无环节）     
	    */
		TEACHER_ARRANGE_GET_COURSE_SELECT:{
	    	url : "/teacherService/coursePlan/getCourseSelect",
	    	method : RequestMethod.GET
	    },
	    
		/**
	     * 1、课程-教学班，2、环节-行政班下拉数据   
	    */
	    TEACHER_ARRANGE_GET_CLASS_SELECT:{
	    	url : "/teacherService/coursePlan/getClassSelect",
	    	method : RequestMethod.GET
	    },
				
	    /**
	     * 成绩成绩册：课程/环节下拉框数据（课程在上，环节在下，按编号升序）	     
	    */
	    TEACHER_ARRANGE_GET_COURSEPRACTICE_SELECT:{
	    	url : "/teacherService/coursePlan/getCoursePracticeSelect",
	    	method : RequestMethod.GET
	    },
	    
		/**
	     * 课表查询-获取班级课表	     
	    */
	    TEACHER_SCHEDULE_GETCLASSSCHEDULELIST:{
	    	url : "/teacherService/coursePlan/getClassScheduleList",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     * 教学安排-获取教师个人课表	     
	    */
	    TEACHER_SCHEDULE_GET_TEACHERSERVICE_TEACHERSCHEDULELIST:{
	    	url : "/teacherService/coursePlan/getTeacherScheduleList",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     * 1、教学安排：上课点名册，2、成绩管理-成绩登记册（根据课程和教学班获取）    
	    */
	    TEACHER_GET_STUDENTBYTEACHINGCLASS :{
	    	url : "/teacherService/choiceManage/getStudentByTeachingClass",
	    	method : RequestMethod.GET
	    }, 
	    
	    /**
	     * 教学安排：上课点名册导出   
	    */
	    TEACHER_CHOICEMANAGE_EXPORT_ROLLBOOK:{
	    	url : "/teacherService/choiceManage/exportRollBook",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     * 成绩管理-成绩登记册-环节-行政班	     
	    */
	    TEACHER_SCORE_GET_STUDENTBYCLASS:{
	    	url : "/teacherService/Score/getStudentByClass",
	    	method : RequestMethod.GET
	    },	 
	    
	    /**
	     * 成绩管理-成绩登记册-根据环节、行政班获取学生列表数据（列表信息描述）	     
	    */
	    TEACHER_SCORE_GET_TACHESCOREREGISTERLIST:{
	    	url : "/teacherService/Score/getTacheScoreRegisterList",
	    	method : RequestMethod.GET
	    },	 
	    
	    /**
	     * 教学任务-理论课程教学任务列表	     
	    */
	    TEACHER_SCORE_GET_COURSETEACHINGTASKLIST:{
	    	url : "/teacherService/choiceManage/getCourseTeachingTaskList",
	    	method : RequestMethod.GET
	    },	
	    
	    /**
	     * 教学任务-理论课程教学任务列表-查看教学班	     
	    */
	    TEACHER_SCORE_GET_COURSETEACHINGTASKTEACHINGCLASS:{
	    	url : "/teacherService/choiceManage/getCourseTeachingTaskTeachingClass",
	    	method : RequestMethod.GET
	    },	
	    
	    /**
	     * 教学任务-实践环节教学任务列表	     
	    */
	    TEACHER_SCORE_GET_PRACTICETEACHINGTASKLIST:{
	    	url : "/teacherService/coursePlan/getPracticeTeachingTaskList",
	    	method : RequestMethod.GET
	    },	
	    
	    /**
	     * 教学任务-实践环节教学任务列表-查看环节（成绩登记册-根据环节、行政班获取学生列表数据）	     
	    */
	    TEACHER_SCORE_GET_PRACTICETEACHINGTASKCLASS:{
	    	url : "/teacherService/coursePlan/getPracticeTeachingTaskClass",
	    	method : RequestMethod.GET
	    }
	}
    module.exports = config;
});
