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
	    
		//开课单位
	    /**
		 * 开课单位列表
		 */	
	    COMMENCEMENT_UNIT_QUERY:{
	    	url : "/trainplan/unit/getList",
		    method : RequestMethod.POST
	    }, 	  
	    
	    /**
		 * 设置为开课单位
		 */	
	    COMMENCEMENT_UNIT_SET:{
	    	url : "/trainplan/unit/updateStartClassStatus",
		    method : RequestMethod.POST
	    }, 
	    
	    /**
	     * 课程信息
	     */
	    //课程信息新增		    
	    COURSE_ADD:{
	    	url : "/trainplan/course/add",
		    method : RequestMethod.POST
	    },
	    //课程信息删除
	    COURSE_DELETE:{
	    	url : "/trainplan/course/delete",
		    method : RequestMethod.POST
	    },
	   //课程信息修改		    
	    COURSE_UPDATE:{
	    	url : "/trainplan/course/update",
		    method : RequestMethod.POST
	    },
	    //根据主键获取课程信息
	    COURSE_GET_ITEM:{
	    	url : "/trainplan/course/getItem",
		    method : RequestMethod.GET
	    }, 
	    //课程信息分页列表查询
	    COURSE_GET_PAGED_LIST:{
	    	url : "/trainplan/course/getPagedList",
		    method : RequestMethod.GET
	    }, 	    
	   //查询列表
		COURSE_GET_LIST:{
			url : "/trainplan/course/getList",
			method : RequestMethod.GET
		},
	    //课程信息启用禁用状态更新
	    COURSE_UPDATE_ENABLE_STATUS:{
	    	url : "/trainplan/course/updateEnableStatus",
		    method : RequestMethod.POST
	    },
	    //查询课程号是否已经存在
	    COURSE_IS_COURSENO_EXIST:{
	    	url : "/trainplan/course/isCourseNoExist",
		    method : RequestMethod.GET
	    },
	    //课程信息导出
	    COURSE_EXPORT:{
	    	url : "/trainplan/course/export",
		    method : RequestMethod.POST
	    },
	    //课程信息导入模板
	    COURSE_EXPORT_TEMPLATE:{
			url : "/trainplan/course/exportTemplate",
			method : RequestMethod.GET
		},
	    //课程信息导入
		COURSE_IMPORT_FILE:{
			url : "/trainplan/course/importFile",
			method : RequestMethod.POST
		},		
		//导出失败信息
		COURSE_EXPORT_FAIL_MESSAGE:{
			url : "/trainplan/course/exportFailMessage",
			method : RequestMethod.GET
		},
		
	  /**
	   * 环节信息
	   */
	  //环节信息新增		    
	    TACHE_ADD:{
	    	url : "/trainplan/tache/add",
		    method : RequestMethod.POST
	    },
	    //环节信息删除
	    TACHE_DELETE:{
	    	url : "/trainplan/tache/delete",
		    method : RequestMethod.POST
	    },
	    //根据主键获取环节信息
	    TACHE_GET_ITEM:{
	    	url : "/trainplan/tache/getItem",
		    method : RequestMethod.GET
	    }, 
	   //环节信息修改		    
	    TACHE_UPDATE:{
	    	url : "/trainplan/tache/update",
		    method : RequestMethod.POST
	    },
	    //环节信息分页列表查询
	    TACHE_GET_PAGED_LIST:{
	    	url : "/trainplan/tache/getPagedList",
		    method : RequestMethod.GET
	    }, 	        	
	    //环节信息启用禁用状态更新
	    TACHE_UPDATE_ENABLE_STATUS:{
	    	url : "/trainplan/tache/updateEnableStatus",
		    method : RequestMethod.POST
	    },
	    //查询环节号是否已经存在
	    TACHE_IS_COURSENO_EXIST:{
	    	url : "/trainplan/tache/isCourseNoExist",
		    method : RequestMethod.GET
	    },
	    //环节信息导出
	    TACHE_EXPORT:{
	    	url : "/trainplan/tache/export",
		    method : RequestMethod.POST
	    },
	    
	    //培养方案维护时间
	    //判断当前用户当前时间是否能进入培养方案下的模块
	    SETTIME_CAN_ENTER_INTO:{
	    	url : "/trainplan/setTime/canEnterInto",
		    method : RequestMethod.GET
	    }, 
	    /**
	     * 培养方案维护时间列表
	     */
	    SETTIME_LIST:{
	    	url : "/trainplan/setTime/getList",
		    method : RequestMethod.POST
	    }, 
	    /**
	     * 更新培养方案维护时间
	     */
	    SETTIME_UPDATE:{
	    	url : "/trainplan/setTime/updateTime",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取培养方案维护时间
	     */
	    SETTIME_GETITEM:{
	    	url : "/trainplan/setTime/getItembyId",
		    method : RequestMethod.POST
	    },
	    //开课计划维护时间
	    /**
	     * 开课计划维护时间
	     */
	    OPENTIME_LIST:{
	    	url : "/trainplan/setcourseplantime/getItem",
		    method : RequestMethod.POST
	    }, 
	    /**
	     * 更新开课计划维护时间
	     */
	    OPENTIME_UPDATE:{
	    	url : "/trainplan/setcourseplantime/updateTime",
		    method : RequestMethod.POST
	    },
	   //判断当前用户当前时间是否能进入开课计划下的模块
	    OPENTIME_CAN_ENTER_INTO:{
	    	url : "/trainplan/setcourseplantime/canEnterInto",
		    method : RequestMethod.GET
	    }, 
	    //年级专业设置
	    /**
	     * 年级专业列表分页
	     */
	    GRADEMAJOR_LIST:{
	    	url : "/trainplan/gradeMajor/getPagedList",
		    method : RequestMethod.POST
	    }, 
	    /**
	     * 年级专业取消
	     */
	    GRADEMAJOR_CANCEL:{
	    	url : "/trainplan/gradeMajor/cancel",
		    method : RequestMethod.POST
	    },
	    /**
	     * 年级专业左列表
	     */
	    GRADEMAJOR_LEFTABLE_QUERY:{
	    	url : "/trainplan/gradeMajor/getList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 年级专业添加
	     */
	    GRADEMAJOR_ADD:{
	    	url : "/trainplan/gradeMajor/add",
		    method : RequestMethod.POST
	    },
	    /**
	     * 源年级列表
	     */
	    GRADEMAJOR_GRADELIST:{
	    	url : "/trainplan/gradeMajor/getGradeList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 复制
	     */
	    GRADEMAJOR_COPY:{
	    	url : "/trainplan/gradeMajor/copy",
		    method : RequestMethod.POST
	    },
	    /**
	     * 加载专业列表下拉框数据
	     */
	    GRADEMAJOR_MAJORLIST:{
	    	url : "/trainplan/gradeMajor/getMajorList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取待复制数目
	     */
	    GRADEMAJOR_GERCOPYNUM:{
	    	url : "/trainplan/gradeMajor/getCopyNum",
		    method : RequestMethod.GET
	    },
	    /**
	     * 导出模板
	     */
		GRADEMAJOR_EXPORT:{
			url : "/trainplan/gradeMajor/exportFile",
			method : RequestMethod.POST
		},
		/**
		 * 通识课左列表查询
		 */
		GRADEMAJOR_getLeftTableList:{
			url : "/trainplan/gradeMajor/getLeftTableList",
			method : RequestMethod.GET
		},
		
		 /**
	     * 专业理论课程
	     */
	    //专业理论课程新增		    
	    MAJORTHEORY_ADD:{
	    	url : "/trainplan/majortheory/add",
		    method : RequestMethod.POST
	    },
	    //专业理论课程更新		    
	    MAJORTHEORY_UPDATE:{
	    	url : "/trainplan/majortheory/update",
		    method : RequestMethod.POST
	    },
	    //专业理论课程删除
	    MAJORTHEORY_DELETE:{
	    	url : "/trainplan/majortheory/delete",
		    method : RequestMethod.POST
	    },
	    //根据主键获取专业理论课程
	    MAJORTHEORY_GET_ITEM:{
	    	url : "/trainplan/majortheory/getItem",
		    method : RequestMethod.GET
	    }, 
	    //专业理论课程分页列表查询
	    MAJORTHEORY_GET_PAGED_LIST:{
	    	url : "/trainplan/majortheory/getPagedList",
		    method : RequestMethod.GET
	    }, 	
	   //专业理论课程列表查询
	    MAJORTHEORY_GET_LIST:{
	    	url : "/trainplan/majortheory/getList",
		    method : RequestMethod.GET
	    }, 
	   //专业理论课程列表查询-打印列表
	    MAJORTHEORY_GET_PRINT_LIST:{
	    	url : "/trainplan/majortheory/getPrintList",
		    method : RequestMethod.GET
	    }, 
	    //专业理论课程启用禁用状态更新
	    MAJORTHEORY_UPDATE_ENABLE_STATUS:{
	    	url : "/trainplan/majortheory/updateEnableStatus",
		    method : RequestMethod.POST
	    },
	    //专业理论课程导出
	    MAJORTHEORY_EXPORT:{
	    	url : "/trainplan/majortheory/export",
		    method : RequestMethod.POST
	    },
	    //专业实践环节导出
	    MAJORTHEORY_EXPORT_TACHE:{
	    	url : "/trainplan/majortheory/exportTache",
		    method : RequestMethod.POST
	    },
	    //培养方案导出
	    MAJORTHEORY_EXPORT_COURSE_AND_TACHE:{
	    	url : "/trainplan/majortheory/exportCourseAndTache",
		    method : RequestMethod.POST
	    },
	    //根据单位类别获取单位-获取院系
	    MAJORTHEORY_GET_DEPARTMENT_LIST_BY_CLASS:{
	    	url : "/trainplan/majortheory/getDepartmentListByClass",
	    	method : RequestMethod.GET
	    },	    
	    //获取根据年级或者院系加载专业列表（特殊：根据当前时间开放院系进行了过滤）
	    MAJORTHEORY_GET_MAJOR_LIST:{
	    	url : "/trainplan/majortheory/getMajorList",
	    	method : RequestMethod.GET
	    },
	    
	    
		
	    /**
	     * 通识课开课计划
	     */
	    //分页查询		    
	    CURRICUL_getCurriculumPagedList:{
	    	url : "/trainplan/generate/getCurriculumPagedList",
		    method : RequestMethod.POST
	    },
	    //导出
	    CURRICUL_exportCurriculFile:{
	    	url : "/trainplan/generate/exportCurriculFile",
		    method : RequestMethod.POST
	    },
	    //删除
	    CURRICUL_deleteCurricul:{
	    	url : "/trainplan/generate/deleteCurricul",
		    method : RequestMethod.POST
	    },
	    //查询学期
	    CURRICUL_getSemesterList:{
	    	url : "/trainplan/generate/getSemesterList",
		    method : RequestMethod.POST
	    },
	    //查询当前学年学期
	    CURRICUL_getCurentSemester:{
	    	url : "/trainplan/generate/getCurentSemester",
		    method : RequestMethod.POST
	    },
	    //查询通识课上学期集合
	    CURRICUL_getCuriculList:{
	    	url : "/trainplan/generate/getCuriculList",
		    method : RequestMethod.POST
	    },
	    //查询通识课新增上列表
	    CURRICUL_getCoursList:{
	    	url : "/trainplan/generate/getCoursList",
		    method : RequestMethod.POST
	    },
	   //院系下拉选项
	    CURRICUL_getDepartmentSelectList:{
	    	url : "/trainplan/generate/getDepartmentSelectList",
		    method : RequestMethod.POST
	    },
	    //新增
	    CURRICUL_addCuricul:{
	    	url : "/trainplan/generate/addCurricul",
		    method : RequestMethod.POST
	    },
	    //查询源年级
	    CURRICUL_GETGRADELIST:{
	    	url : "/trainplan/generate/getGrade",
		    method : RequestMethod.POST
	    },
	    /**
	     * 生成开课计划
	     */
	    //生产开课计划分页查询
	    GENERATE_getCoursePlanList:{
	    	url : "/trainplan/coursePlan/getCoursePlanList",
		    method : RequestMethod.POST
	    },
	    //导出
	    GENERATE_exportFile:{
	    	url : "/trainplan/coursePlan/exportFile",
		    method : RequestMethod.POST
	    },
	    //删除
	    GENERATE_del:{
	    	url : "/trainplan/coursePlan/delete",
		    method : RequestMethod.POST
	    },
	    //查询过滤之后的年级
	    GENERATE_grade:{
	    	url : "/trainplan/coursePlan/getGradeList",
		    method : RequestMethod.POST
	    },
	    //查询过滤之后的年级专业
	    GENERATE_getSelectMajorList:{
	    	url : "/trainplan/coursePlan/getSelectMajorList",
		    method : RequestMethod.POST
	    },
	    //添加生成开课计划
	    GENERATE_add:{
	    	url : "/trainplan/coursePlan/add",
		    method : RequestMethod.POST
	    },
	    //查询生成开课计划数目
	    GENERATE_getCoursePlanNumber:{
	    	url : "/trainplan/coursePlan/getCoursePlanNumber",
		    method : RequestMethod.POST
	    },
	    //查询开课计划年级
	    GENERATE_GETGENERATEGRADELIST:{
	    	url : "/trainplan/coursePlan/getGenerateGradeList",
		    method : RequestMethod.POST
	    },
	    
	    /**
	     * 申请开课变更
	     */
	    //导出申请开课变更开课数目
	    APPLY_EXPORTAPPLYFILE:{
	    	url : "/trainplan/coursePlan/exportApplyFile",
		    method : RequestMethod.POST
	    },
	    //查询待选择的信息
	    APPLY_GETWAITCOURSEORTACHE_LIST:{
	    	url : "/trainplan/coursePlan/getWaitCourseOrTacheList",
		    method : RequestMethod.POST
	    },
	    //增开课程，增开环节
	    APPLY_ADDSTARTCLASSPLAN:{
	    	url : "/trainplan/coursePlan/addStartClassPlan",
		    method : RequestMethod.POST
	    },
	    //取消增开
	    APPLY_DELETESTARTCLASSPLAN:{
	    	url : "/trainplan/coursePlan/deleteStartClassPlan",
		    method : RequestMethod.POST
	    },
	    //停开
	    APPLY_STOP:{
	    	url : "/trainplan/coursePlan/Stop",
		    method : RequestMethod.POST
	    },
	    //审核
	    APPLY_AUDITSTARUS:{
	    	url : "/trainplan/coursePlan/auditStatus",
		    method : RequestMethod.POST
	    },
	    //修改详情
	    APPLY_GETITEM:{
	    	url : "/trainplan/coursePlan/getItem",
		    method : RequestMethod.POST
	    },
	    //保存修改的值
	    APPLY_SAVE:{
	    	url : "/trainplan/coursePlan/save",
		    method : RequestMethod.POST
	    },
	    //取消修改
	    APPLY_CANCELUPDATE:{
	    	url : "/trainplan/coursePlan/cancelUpdate",
		    method : RequestMethod.POST
	    },
	    //取消停开
	    APPLY_CANCELSTOP:{
	    	url : "/trainplan/coursePlan/cancelStop",
		    method : RequestMethod.POST
	    },
	    /**
	     * 审核开课变更
	     */
	    //导出
	    AUDIT_EXPORTAUDITFILE:{
	    	url : "/trainplan/coursePlan/exportAuditFile",
		    method : RequestMethod.POST
	    },
	    /**
	     * 行政班级
	     */
	    //行政班级
	    TRAINPLANVIEW_GETPAGEDLIST:{
	    	url : "/trainplan/coursePlan/getClassPagedList",
		    method : RequestMethod.POST
	    },
	    //导出
	    TRAINPLANVIEW_EXPORT:{
	    	url : "/trainplan/coursePlan/exportClassFile",
		    method : RequestMethod.POST
	    },
	    //不到行政班级
	    TRAINPLANVIEW_GETNOCLASSLIST:{
	    	url : "/trainplan/coursePlan/getNoClassPagedList",
		    method : RequestMethod.POST
	    },
	    //导出
	    TRAINPLANVIEW_EXPORTNOCLASS:{
	    	url : "/trainplan/coursePlan/exportNoClassFile",
		    method : RequestMethod.POST
	    },
	    
	    
	}
    module.exports = config;
});
