/**
 * 毕业管理
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
		 * 获取毕业年届信息
		 */
		GRAD_GRAUATEDATESET_GET:{
			url : "/grad/grauateDateSet/get",
		    method : RequestMethod.GET
		},
		/**
		 * 修改毕业年届信息
		 */
		GRAD_GRAUATEDATESET_UPDATE:{
			url : "/grad/grauateDateSet/update",
		    method : RequestMethod.POST
		},
		
		/**
		 * 获取毕业学分要求
		 */
		GRAD_CREDITSET_GETLISTBYDEPARTMENT:{
			url : "/grad/creditSet/getListByDepartment",
		    method : RequestMethod.POST
		},
		/**
		 * 获取毕业学分要求
		 */
		GRAD_CREDITSET_GETLISTBYMAJOR:{
			url : "/grad/creditSet/getListByMajor",
		    method : RequestMethod.POST
		},
		/**
		 * 更新毕业学分要求
		 */
		GRAD_CREDITSET_UPDATEBYMAJOR:{
			url : "/grad/creditSet/updateByMajor",
		    method : RequestMethod.POST
		},
		
		/**
		 * 获取毕业课程成绩要求
		 */
		GRAD_COURSESCORESET_GETLISTBYDEPARTMENT:{
			url : "/grad/courseScoreSet/getListByDepartment",
		    method : RequestMethod.POST
		},
		/**
		 * 获取毕业课程成绩要求所有课程
		 */
		GRAD_COURSESCORESET_GETLISTBYMAJORALLCOURSE:{
			url : "/grad/courseScoreSet/getListByMajorAllCourse",
		    method : RequestMethod.POST
		},
		/**
		 * 获取毕业课程列表
		 */
		GRAD_COURSESCORESET_GETLISTBYMAJORSETTEDCOURSE:{
			url : "/grad/courseScoreSet/getListByMajorSettedCourse",
		    method : RequestMethod.POST
		},
		/**
		 * 更新毕业课程成绩要求
		 */
		GRAD_COURSESCORESET_UPDATEBYMAJOR:{
			url : "/grad/courseScoreSet/updateByMajor",
		    method : RequestMethod.POST
		},
		
		/**
		 *读取预计毕业学生 
		 */	
		GRAD_STUDENT_LOADANTICIPATEDGRADUATE:{
	    	url : "/grad/student/loadAnticipatedGraduate",
		    method : RequestMethod.GET
	    },
	    /**
		 *获取毕业院系列表 
		 */	
		GRAD_STUDENT_GETGRADUATEDEPARTMENTLIST:{
	    	url : "/grad/student/getGraduateDepartmentList",
		    method : RequestMethod.GET
	    },
	    /**
		 *获取毕业年级列表
		 */	
		GRAD_STUDENT_GETGRADUATEGRADELIST:{
	    	url : "/grad/student/getGraduateGradeList",
		    method : RequestMethod.GET
	    },
	    /**
		 *分页获取预计学生列表
		 */	
		GRAD_STUDENT_GETANTICIPATEDGRADUATESTUDENTPAGEDLIST:{
	    	url : "/grad/student/getAnticipatedGraduateStudentPagedList",
		    method : RequestMethod.POST
	    },
	    /**
		 *获取提前毕业年级列表
		 */	
		GRAD_STUDENT_GETADVANCEDGRADELIST:{
	    	url : "/grad/student/getAdvancedGradeList",
		    method : RequestMethod.GET
	    },
	    /**
		 *添加提前毕业学生 列表
		 */	
	    GRAD_STUDENT_GETGRADUATEADVANCESTUDENTLIST:{
	    	url : "/grad/student/getGraduateAdvanceStudentList",
		    method : RequestMethod.POST
	    },
	    /**
		 *添加提前毕业学生 
		 */	
	    GRAD_STUDENT_ADDGRADUATEADVANCE:{
	    	url : "/grad/student/addGraduateAdvance",
		    method : RequestMethod.POST
	    },
	    /**
		 *删除提前毕业学生 
		 */	
	    GRAD_STUDENT_DELETEGRADUATEADVANCE:{
	    	url : "/grad/student/deleteGraduateAdvance",
		    method : RequestMethod.GET
	    },
	    /**
		 *设置延迟毕业学生 
		 */	
	    GRAD_STUDENT_SETPOSTPONE:{
	    	url : "/grad/student/setPostpone",
		    method : RequestMethod.POST
	    },
	    /**
		 *取消延迟毕业学生
		 */	
	    GRAD_STUDENT_CANCELPOSTPONE:{
	    	url : "/grad/student/cancelPostpone",
		    method : RequestMethod.GET
	    },
	    /**
		 *导出预计毕业学生 
		 */	
	    GRAD_STUDENT_EXPORTANTICIPATEDGRADUATESTUDENTFILE:{
	    	url : "/grad/student/exportAnticipatedGraduateStudentFile",
		    method : RequestMethod.POST
	    },
	    
	    /**
		 *获取审核毕业学生 
		 */	
	    GRAD_STUDENT_GETAUDITEDGRADUATESTUDENTPAGEDLIST:{
	    	url : "/grad/student/getAuditedGraduateStudentPagedList",
		    method : RequestMethod.POST
	    },
	    
	    /**
		 *审核毕业学生 
		 */	
	    GRAD_STUDENT_AUIDT:{
	    	url : "/grad/student/audit",
		    method : RequestMethod.GET
	    },
	    
	    /**
		 *审核详情学分 
		 */	
	    GRAD_STUDENT_GETAUDITDETAILCREDIT:{
	    	url : "/grad/student/getAuditDetailCredit",
		    method : RequestMethod.POST
	    },
	    
	    /**
		 *审核详情课程成绩 
		 */	
	    GRAD_STUDENT_GETAUDITDETAILCOURSE:{
	    	url : "/grad/student/getAuditDetailCourse",
		    method : RequestMethod.GET
	    },
	    
	    /**
		 *批量审核毕业 
		 */	
	    GRAD_STUDENT_SETGRADUATIONBATCH:{
	    	url : "/grad/student/setGraduationBatch",
		    method : RequestMethod.POST
	    },
	    /**
		 *批量审核结业 
		 */	
	    GRAD_STUDENT_SETCOMPLETIONBATCH:{
	    	url : "/grad/student/setCompletionBatch",
		    method : RequestMethod.POST
	    },
	    /**
		 *审核毕业
		 */	
	    GRAD_STUDENT_SETGRADUATION:{
	    	url : "/grad/student/setGraduation",
		    method : RequestMethod.GET
	    },
	    /**
		 *审核结业
		 */	
	    GRAD_STUDENT_SETCOMPLETION:{
	    	url : "/grad/student/setCompletion",
		    method : RequestMethod.GET
	    },
	    /**
		 *取消结业毕业
		 */	
	    GRAD_STUDENT_CANCELGRADUATIONCOMPLETION:{
	    	url : "/grad/student/cancelGraduationCompletion",
		    method : RequestMethod.GET
	    },
	    /**
		 *分页获取处理毕业学生
		 */	
	    GRAD_STUDENT_GRADUATE_PROCESS_STUDENTPAGEDLIST:{
	    	url : "/grad/student/getGraduateProcessStudentPagedList",
		    method : RequestMethod.Post
	    },
	    /**
		 *获取学校编码 by tp
		 */	
	    GRAD_STUDENT_GRADUATE_GETSCHOOLLIST:{
	    	url : "/grad/student/getSchoolList",
		    method : RequestMethod.GET
	    },
	    /**
		 *获取毕业顺序号最大值 by tp
		 */	
	    GRAD_STUDENT_GRADUATE_GETMAXNUM:{
	    	url : "/grad/student/GetMaxNum",
		    method : RequestMethod.GET
	    },
	    /**
		 *获取毕业顺序号最小值 by tp
		 */	
	    GRAD_STUDENT_GRADUATE_GETMINNUM:{
	    	url : "/grad/student/GetMinNum",
		    method : RequestMethod.GET
	    },
	    /**
		 *获取毕业顺序号最大值 by tp
		 */	
	    GRAD_STUDENT_GRADUATE_GENERATEDIPLOMANO:{
	    	url : "/grad/student/generateDiplomaNo",
		    method : RequestMethod.Post
	    },
	    /**
	     * 获取毕业率统计 by tp
	     */
	    GRAD_STUDENT_GRADUATE_GETREPORTLIST:{
	    	url:"/grad/student/GetReportList",
	    	method:RequestMethod.GET,
	    },
	    /**
	     * 毕业处理导出 by tp
	     */
	    GRAD_STUDENT_GRADUATE_EXPORTGRADUATEPROCESSFILE:{
	    	url:"/grad/student/exportGraduateProcessStudentFile",
	    	method:RequestMethod.POST,
	    }
	    ,
	    /**
	     * 毕业率导出 by tp
	     */
	    GRAD_STUDENT_GRADUATE_EXPORTGRADUATERATEFILE:{
	    	url:"/grad/student/exportGraduateRateFile",
	    	method:RequestMethod.GET,
	    }
	    ,
	    /**
	     * 毕业/结业名册导出 by tp	
	     */
	    GRAD_STUDENT_GRADUATE_EXPORTGRADUATEPROCESSSTUDENTROSTERFILE:{
	    	url:"/grad/student/exportGraduateProcessStudentRosterFile",
	    	method:RequestMethod.POST,
	    }
	    
	}
    module.exports = config;
});
