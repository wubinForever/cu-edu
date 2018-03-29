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
		 * 获取老师信息
		 */
		COMMON_TEACHERINFO_GETLIST:{
			url : "/courseplan/common/teacherinfo/getList",
		    method : RequestMethod.POST
		},
	    /**
		 *  根据条件获取排课进度信息
		 */	
	    PARAMETER_SCHEDULE_GETITEM:{
	    	url : "/courseplan/parameter/schedule/getItem",
		    method : RequestMethod.GET
	    },
	    /**
		 *  添加排课进度信息
		 */	
	    PARAMETER_SCHEDULE_ADD:{
	    	url : "/courseplan/parameter/schedule/add",
		    method : RequestMethod.PUT
	    },
	    /**
		 *  修改排课进度信息
		 */	
	    PARAMETER_SCHEDULE_UPDATE:{
	    	url : "/courseplan/parameter/schedule/update",
		    method : RequestMethod.POST
	    },
	    /**
	     *  根据条件获取排课时间信息
	     */	
	    PARAMETER_TIME_GETITEM:{
	    	url : "/courseplan/parameter/time/getItem",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  获取当前排课学年学期的排课时间设置信息
	     */	
	    PARAMETER_TIME_GETITEMBYCURRENT:{
	    	url : "/courseplan/parameter/time/getItemByCurrent",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  添加排课时间信息
	     */	
	    PARAMETER_TIME_ADD:{
	    	url : "/courseplan/parameter/time/add",
	    	method : RequestMethod.PUT
	    },
	    /**
	     *  修改排课时间信息
	     */	
	    PARAMETER_TIME_UPDATE:{
	    	url : "/courseplan/parameter/time/update",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  获取环节教师设置列表信息
	     */
	    PRACTICE_LINKTEACHER_GETPAGELIST:{
	    	url : "/courseplan/practice/linkteacher/getPageList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 获取环节教师设置集合
	     */
	    PRACTICE_LINKTEACHER_GETLIST:{
	    	url : "/courseplan/practice/linkteacher/getList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 获取环节设置教师信息集合
	     */
	    PRACTICE_LINKTEACHER_GETSELECTLIST:{
	    	url : "/courseplan/practice/linkteacher/getSelectList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  新增环节教师设置
	     */
	    PRACTICE_LINKTEACHER_ADD:{
	    	url : "/courseplan/practice/linkteacher/add",
	    	method : RequestMethod.PUT
	    },
	    /**
	     *  开课信息对应的-理论任务设置列表信息 列表
	     */	
	    TEACHCLASS_THEORETICAL_GETLIST:{
	    	url : "/courseplan/teachclass/theoretical/getList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  开课信息对应的-理论任务设置列表信息 分页
	     */	
	    TEACHCLASS_THEORETICAL_GETPAGEDLIST:{
	    	url : "/courseplan/teachclass/theoretical/getPagedList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  开课信息对应的-理论任务设置列表信息 列表
	     */	
	    TEACHCLASS_THEORETICAL_GETITEM:{
	    	url : "/courseplan/teachclass/theoretical/getItem",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  获取院系，当前课程下的院系
	     */	
	    TEACHCLASS_THEORETICAL_GETGRADE:{
	    	url : "/courseplan/teachclass/theoretical/getGrade",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  获取院系，当前课程下的院系
	     */	
	    TEACHCLASS_THEORETICAL_GETDEPARTMENT:{
	    	url : "/courseplan/teachclass/theoretical/getDepartment",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  获取院系，当前课程下的专业
	     */	
	    TEACHCLASS_THEORETICAL_GETMAJOR:{
	    	url : "/courseplan/teachclass/theoretical/getMajor",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  通过院系、专业、年级、名称、查询班级列表
	     */	
	    TEACHCLASS_THEORETICAL_GETCLASS:{
	    	url : "/courseplan/teachclass/theoretical/getClass",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  批量删除教学班
	     */	
	    TEACHCLASS_THEORETICAL_DELETE:{
	    	url : "/courseplan/teachclass/theoretical/deleteTheory",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  保存理论任务 （将界面编辑后的教学班集合传入进行修改、新增、删除操作）
	     */	
	    TEACHCLASS_THEORETICAL_SAVE:{
	    	url : "/courseplan/teachclass/theoretical/saveTheory",
	    	method : RequestMethod.POST
	    },
	    /**
	     *   获取当前开课计划对应的教学班
	     */	
	    TEACHCLASS_THEORETICAL_GETTHEORYLIST:{
	    	url : "/courseplan/teachclass/theoretical/getTheoryList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *   获取当前开课计划对应的教学班
	     */	
	    TEACHCLASS_THEORETICAL_PAGE_FORDEPT:{
	    	url : "/courseplan/teachclass/theoretical/getPagedForDepartment",
	    	method : RequestMethod.GET
	    },
	    /**
	     *   获取当前开课计划对应的教学班
	     */	
	    TEACHCLASS_THEORETICAL_EXPORT_FORDEPART:{
	    	url : "/courseplan/teachclass/theoretical/exportForDepartment",
	    	method : RequestMethod.GET
	    },
	    /**
	     *   获取当前开课计划对应的教学班
	     */	
	    TEACHCLASS_THEORETICAL_PAGE_FORGM:{
	    	url : "/courseplan/teachclass/theoretical/getPagedForGradeMajor",
	    	method : RequestMethod.GET
	    },
	    /**
	     *   获取当前开课计划对应的教学班
	     */	
	    TEACHCLASS_THEORETICAL_EXPORT_FORGM:{
	    	url : "/courseplan/teachclass/theoretical/exportForGradeMajor",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  理论任务引用情况
	     */	
	    TEACHCLASS_THEORETICAL_QUOTE:{
	    	url : "/courseplan/teachclass/theoretical/getTheoreticalQuote",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  理论任务-后台提交状态
	     */	
	    TEACHCLASS_THEORETICAL_LOCK:{
	    	url : "/courseplan/teachclass/theoretical/getTheoreticalLock",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  理论任务-教学组管理列表
	     */	
	    TEACHCLASS_THEORETICAL_TEACHGROUP:{
	    	url : "/courseplan/teachclass/theoretical/getTeachGroupList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  理论任务-教学组管理列表-保存
	     */	
	    TEACHCLASS_THEORETICAL_SAVETEACHGROUP:{
	    	url : "/courseplan/teachclass/theoretical/saveTeachGroupList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  理论任务-教学组管理列表-获取教学组下拉
	     */	
	    TEACHCLASS_THEORETICAL_GETTEACHGROUPSELECT:{
	    	url : "/courseplan/teachclass/theoretical/getTeachGroupSelectList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 获取理论任务分页列表信息
	     */
	    ARRANGE_MANUALARRANGE_GETPAGEDLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 根据条件获取理论任务信息
	     */
	    ARRANGE_MANUALARRANGE_GETITEM:{
	    	url : "/courseplan/arrange/arrangecourse/getItem",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 根据条件获取排课任务信息
	     */
	    ARRANGE_MANUALARRANGE_GETSCHEDULINGTASKITEM:{
	    	url : "/courseplan/arrange/arrangecourse/getSchedulingTaskList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 获取排课任务可排节次信息
	     */
	    ARRANGE_MANUALARRANGE_GETSECTIONLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getSectionList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 手动排课新增
	     */
	    ARRANGE_MANUALARRANGE_ADD:{
	    	url : "/courseplan/arrange/arrangecourse/add",
	    	method : RequestMethod.PUT
	    },
	    /**
	     * 手动排课修改
	     */
	    ARRANGE_MANUALARRANGE_UPDATE:{
	    	url : "/courseplan/arrange/arrangecourse/update",
	    	method : RequestMethod.PUT
	    },
	    /**
	     * 手动排课删除
	     */
	    ARRANGE_MANUALARRANGE_DELETE:{
	    	url : "/courseplan/arrange/arrangecourse/delete",
	    	method : RequestMethod.POST
	    },
	    /**
	     * 获取教室信息集合
	     */
	    ARRANGE_MANUALARRANGE_GETTEACHROOMPAGEDLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getTeachRoomPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 排课结果管理-分页获取排课结果信息
	     */
	    ARRANGE_SCHEDULE_GETLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getTaskViewPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 排课结果管理-导出排课结果
	     */
	    ARRANGE_SCHEDULE_EXPORT:{
	    	url : "/courseplan/arrange/arrangecourse/exportTaskView",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 排课结果发布-获取所有发布信息
	     */
	    ARRANGE_PUBLISH_GETALLPUBLISHLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getAllPublishList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 排课结果发布-新增或修改
	     */
	    ARRANGE_PUBLISH_INSERTORUPDATEPUBLISH:{
	    	url : "/courseplan/arrange/arrangecourse/insertOrUpdatePublish",
	    	method : RequestMethod.PUT
	    },
	    /**
	     * 课表查询-获取班级课表
	     */
	    ARRANGE_SCHEDULE_GETCLASSSCHEDULELIST:{
	    	url : "/courseplan/schedule/getClassScheduleList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 课表查询-获取教师课表
	     */
	    ARRANGE_SCHEDULE_GETTEACHERSCHEDULELIST:{
	    	url : "/courseplan/schedule/getTeacherScheduleList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 课表查询-获取教室课表
	     */
	    ARRANGE_SCHEDULE_GETTEACHROOMSCHEDULELIST:{
	    	url : "/courseplan/schedule/getTeachRoomScheduleList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 课表查询-获取课程课表
	     */
	    ARRANGE_SCHEDULE_GETCOURSESCHEDULELIST:{
	    	url : "/courseplan/schedule/getCourseScheduleList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 根据查询条件获取已排课的老师
	     */	
	    ARRANGE_MANUALARRANGE_GETTEACHERLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getTeacherList",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 根据查询条件获取排课结果
	     */	
	    ARRANGE_MANUALARRANGE_GETLIST:{
	    	url : "/courseplan/arrange/arrangecourse/getList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  分页获取环节班级环节周次设置列表信息集合
	     */	
	    PRACTICE_CLASSLINKWEEKLYSETTING_GETPAGELIST:{
	    	url : "/courseplan/practice/classlinkweeklysetting/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  分页获取环节班级环节周次设置列表-按年级专业信息集合
	     */	
	    PRACTICE_CLASSLINKWEEKLYSETTING_GETGRADEMAJORPAGELIST:{
	    	url : "/courseplan/practice/classlinkweeklysetting/getGradeMajorPageList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  获取环节班级周次设置班级列表集合
	     */	
	    PRACTICE_CLASSLINKWEEKLYSETTING_GETCLASSWEEKLYSETTINGLISTBYSTARTCLASSPLANIDS:{
	    	url : "/courseplan/practice/classlinkweeklysetting/getClassWeeklySettingListByStartclassPlanIds",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  批量设置班级周次
	     */	
	    PRACTICE_CLASSLINKWEEKLYSETTING_BATCHSETUP:{
	    	url : "/courseplan/practice/classlinkweeklysetting/batchSetup",
	    	method : RequestMethod.POST
	    },
	    
	    /**
	     *  实践安排接口
	     *  获取实践环节列表集合
	     */	
	     ARRANGE_COURSE_GETPRACTICETACHELIST:{
	    	url : "/courseplan/practice/Arrange/getPracticeTacheList",
	    	method : RequestMethod.GET
	    },
	     /**
	     *  实践安排接口
	     *  获取实践环节下的班级
	     */	
	     ARRANGE_COURSE_GETPRACTICETACHECLASSLIST:{
	    	url : "/courseplan/practice/Arrange/getPracticeTacheClassList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  实践安排接口
	     *  获取班级下未设置实践环节的学生
	     */	
	     ARRANGE_COURSE_GETSTUDENTLISTBYCLASSID:{
	    	url : "/courseplan/practice/Arrange/getStudentListByClassId",
	    	method : RequestMethod.POST
	    }, 
	    /**
	     *  实践安排接口
	     *  根据id获取详细信息
	     */	
	     ARRANGE_COURSE_GRTITEM:{
	    	url : "/courseplan/practice/Arrange/getItem",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  实践安排接口
	     *  新增
	     */	
	     ARRANGE_COURSE_ADD:{
	    	url : "/courseplan/practice/Arrange/add",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  实践安排接口
	     *  修改
	     */	
	     ARRANGE_COURSE_UPDATE:{
	    	url : "/courseplan/practice/Arrange/update",
	    	method : RequestMethod.POST
	    },
	    
	    /**
	     * 实践安排接口
	     * 页获取实践安排集合
	     */
	    ARRANGE_COURSE_GETPAGEDLIST:{
	    	url : "/courseplan/practice/Arrange/getPagedList",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     * 实践安排接口
	     * 根据id获取详细信息
	     */
	    ARRANGE_COURSE_GETITEM:{
	    	url : "/courseplan/practice/Arrange/getItem",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     * 实践安排接口
	     * 删除
	     */
	    ARRANGE_COURSE_DELETE:{
	    	url : "/courseplan/practice/Arrange/delete",
	    	method : RequestMethod.POST
	    },
	    
	    /**
	     * 实践安排接口
	     * 获取环节小组号
	     */
	    ARRANGE_COURSE_GETGROUPNO:{
	    	url : "/courseplan/practice/Arrange/getGroupNo",
	    	method : RequestMethod.GET
	    },
	     /**
	     * 实践安排查询
	     * 分页获取实践安排查询集合
	     */
	    ARRANGE_COURSE_GETPRACTICALARRANGESTATISTICPAGEDLIST:{
	    	url : "/courseplan/practice/Arrange/getPracticalArrangeStatisticPagedList",
	    	method : RequestMethod.GET
	    },
	     /**
	     * 实践安排查询
	     * 开课单位实践安排查询导出
	     */
	    ARRANGE_COURSE_EXPORTKPRACTICALARRANGESTATISTIC:{
	    	url : "/courseplan/practice/Arrange/exportKPracticalArrangeStatistic",
	    	method : RequestMethod.POST
	    },
	     /**
	     * 实践安排查询
	     * 年级专业实践安排查询导出
	     */
	    ARRANGE_COURSE_EXPORTGRADEPRACTICALARRANGESTATISTIC:{
	    	url : "/courseplan/practice/Arrange/exportGradePracticalArrangeStatistic",
	    	method : RequestMethod.POST
	    }, 
	    /**
	     * 实践任务查询
	     * 分页获取实践任务查询集合
	     */
	    ARRANGE_COURSE_GETPRACTICALSTATISTICPAGEDLIST:{
	    	url : "/courseplan/practice/classlinkweeklysetting/getPracticalStatisticPagedList",
	    	method : RequestMethod.GET
	    }, 
	    /**
	     * 实践任务查询
	     * 按开课单位实践任务查询导出
	     */
	    ARRANGE_COURSE_EXPORTKPRACTICALSTATISTIC:{
	    	url : "/courseplan/practice/classlinkweeklysetting/exportKPracticalStatistic",
	    	method : RequestMethod.POST
	    }, 
	    /**
	     * 实践任务查询
	     * 按年级院系实践任务查询导出
	     */
	    ARRANGE_COURSE_EXPORTGRADEPRACTICALSTATISTIC:{
	    	url : "/courseplan/practice/classlinkweeklysetting/exportGradePracticalStatistic",
	    	method : RequestMethod.POST
	    },
	    /**
		 * 判断当前用户当前时间是否能进入排课进度设置下的模块 
		 * @return
		 */
		ARRANGE_COURSE_CANENTERINTO:{
	    	url : "/courseplan/parameter/schedule/canEnterInto",
	    	method : RequestMethod.GET
	    },
	    /**
	     * 冲突检测
	     */
	    LESSON_CHECK_CONFLICT:{
	    	url : "/courseplan/lesson/checkConflict",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课保存
	     */
	    LESSON_SAVE:{
	    	url : "/courseplan/lesson/save",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课分页
	     */
	    LESSON_GETPAGEDLIST:{
	    	url : "/courseplan/lesson/getPagedList",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课未处理信息
	     */
	    LESSON_GETUNHANDINGCOUNT:{
	    	url : "/courseplan/lesson/getUnHandingCount",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课详情
	     */
	    LESSON_GETITEM:{
	    	url : "/courseplan/lesson/getItem",
	    	method : RequestMethod.GET
	    }
	    ,
	    /**
	     *调停课详情
	     */
	    LESSON_BATCHADD:{
	    	url : "/courseplan/lesson/batchAdd",
	    	method : RequestMethod.POST
	    }
	    ,
	    /**
	     *批量调停课分页
	     */
	    LESSON_GETPAGEDLISTFORBATCH:{
	    	url : "/courseplan/lesson/getPagedListForBatch",
	    	method : RequestMethod.GET
	    }
	    ,
	    /**
	     *批量调停课导出
	     */
	    LESSON_EXPORT:{
	    	url : "/courseplan/lesson/export",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课删除
	     */
	    LESSON_DELETE:{
	    	url : "/courseplan/lesson/delete",
	    	method : RequestMethod.POST
	    },
	    /**
	     *调停课处理
	     */
	    LESSON_HANDING:{
	    	url : "/courseplan/lesson/handing",
	    	method : RequestMethod.POST
	    },
	    /**
	     * 调停课冲突判断 -- 调停课处理
	     */
	    LESSON_HANDING_CONFLICT:{
	    	url : "/courseplan/lesson/handingConflict",
	    	method : RequestMethod.GET
	    },
	    
	    /**
	     *专业禁排设置分页
	     */
	    ARRANGE_MAJORFORBIDDEN_GETPAGEDLIST:{ 
	    	url : "/courseplan/arrange/majorforbidden/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  专业禁排设置-批量设置
	     */	
	    ARRANGE_MAJORFORBIDDEN_BATCHSETUP:{
	    	url : "/courseplan/arrange/majorforbidden/batchSetup",
	    	method : RequestMethod.POST
	    },
	    
	    /**
	     * 教室禁排设置分页
	     */
	    ARRANGE_CLASSROOMFORBIDDEN_GETPAGEDLIST:{
	    	url : "/courseplan/arrange/classroomforbidden/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  教室禁排设置-批量设置
	     */	
	    ARRANGE_CLASSROOMFORBIDDEN_BATCHSETUP:{
	    	url : "/courseplan/arrange/classroomforbidden/batchSetup",
	    	method : RequestMethod.POST
	    },
	    /**
	     * 课程固排禁排设置分页
	     */
	    ARRANGE_COURSESOLIDFORBIDDEN_GETPAGEDLIST:{
	    	url : "/courseplan/arrange/coursesolidforbidden/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  课程固排禁排设置-批量设置
	     */	
	    ARRANGE_COURSESOLIDFORBIDDEN_BATCHSETUP:{
	    	url : "/courseplan/arrange/coursesolidforbidden/batchSetup",
	    	method : RequestMethod.POST
	    },
	    /**
	     * 教师固排禁排设置分页
	     */
	    ARRANGE_TEACHERSOLIDFORBIDDEN_GETPAGEDLIST:{
	    	url : "/courseplan/arrange/teachersolidforbidden/getPagedList",
	    	method : RequestMethod.GET
	    },
	    /**
	     *  教师固排禁排设置-批量设置
	     */	
	    ARRANGE_TEACHERSOLIDFORBIDDEN_BATCHSETUP:{
	    	url : "/courseplan/arrange/teachersolidforbidden/batchSetup",
	    	method : RequestMethod.POST
	    },
	    /**
	     *  自动排课
	     */	
	    AUTO_ARRANGE_COURSE:{
	    	url : "/courseplan/arrange/arrangecourse/executeAutoArrange",
	    	method : RequestMethod.POST
	    }
	    
	}
    module.exports = config;
});
