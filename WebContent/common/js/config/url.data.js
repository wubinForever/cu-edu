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
		//校区信息
		CAMPUS_GETPAGEDLIST:{
	    	url : "/udf/campus/getPagedList",
		    method : RequestMethod.POST
	    },

		//新增校区
		CAMPUS_ADD:{
	    	url : "/udf/campus/add",
		    method : RequestMethod.POST
	    },

		//修改校区
		CAMPUS_UPDATE:{
	    	url : "/udf/campus/update",
		    method : RequestMethod.POST
	    },
	    
	    //删除校区
		CAMPUS_DELETE:{
	    	url : "/udf/campus/delete",
		    method : RequestMethod.POST		   
	    },   
	    
	    //获取校区
		CAMPUS_GETITEM:{
	    	url : "/udf/campus/getItem",
		    method : RequestMethod.GET
	    },
	    //获取校区集合
		CAMPUS_GETALL:{
	    	url : "/udf/campus/getAll",
		    method : RequestMethod.GET
	    },
	    //验证校区
		CAMPUS_VALIDATION:{
	    	url : "/udf/campus/validationCampus",
		    method : RequestMethod.GET
	    },
	    //获取校区集合
	    CAMPUS_GET_ALL_AND_CHECKED:{
	    	url : "/udf/campus/getAllAndChecked",
		    method : RequestMethod.GET
	    },
		// 获取专业信息列表
		MAJOR_GETLIST : {
			url : "/udf/major/list",
			method : RequestMethod.GET
		}, 
		
		// 获取专业信息
		MAJOR_GETITEM : {
			url : "/udf/major/item",
			method : RequestMethod.GET
		},
		
	    // 专业信息新增
	    MAJOR_ADD : {
	    	url : "/udf/major/add",
	    	method : RequestMethod.POST
	    },
	    
	    // 专业信息修改
	    MAJOR_UPDATE : {
	    	url : "/udf/major/update",
	    	method : RequestMethod.POST
	    },
	    
	    // 专业信息删除
	    MAJOR_DELETE : {
	    	url : "/udf/major/delete",
	    	method : RequestMethod.POST
	    },
	    
	    // 获取国标专业信息
	    SUBJECT_GETITEM:{
	    	url : "/udf/major/getsubjectItem",
	    	method : RequestMethod.POST
	    },
	    
	    // 获取国标专业信息集合
	    SUBJECT_GETLIST:{
	    	url : "/udf/major/getsubjectList",
	    	method : RequestMethod.POST
	    },
	    //导入专业信息
	    MAJOR_IMPORTFILE:{
			url : "/udf/major/importFile",
			method : RequestMethod.POST
		},
		//导出专业模板
		MAJOR_EXPORTTEMPLATE:{
			url : "/udf/major/exportTemplate",
			method : RequestMethod.GET
		},
		//导出专业失败信息
		MAJOR_EXPORT_FAILMESSATE:{
			url : "/udf/major/exportFailMessage",
			method : RequestMethod.GET
		},
		//导出专业信息
		MAJOR_EXPORT:{
			url : "/udf/major/export",
			method : RequestMethod.POST
		},
	  //单位信息
		DEPARTMENT_GET_LIST_AND_CHECKED:{
	    	url : "/udf/department/getListAndChecked",
		    method : RequestMethod.GET
	    },
	  //单位信息
		DEPARTMENT_GETLIST:{
	    	url : "/udf/department/getList",
		    method : RequestMethod.GET
	    },

		//新增单位
	    DEPARTMENT_ADD:{
	    	url : "/udf/department/add",
		    method : RequestMethod.POST
	    },

		//修改单位
	    DEPARTMENT_UPDATE:{
	    	url : "/udf/department/update",
		    method : RequestMethod.POST
	    },
	    
	    //删除单位
	    DEPARTMENT_DELETE:{
	    	url : "/udf/department/delete",
		    method : RequestMethod.POST
	    },
	    
	    //获取单个单位
	    DEPARTMENT_GETITEM:{
	    	url : "/udf/department/getItem",
		    method : RequestMethod.GET
	    },
	    //获取开课单位的下拉框数据源
	    DEPARTMENT_STARTCLASS_FOR_SELECT:{
	    	url : "/udf/department/getStartClassDepartmentSelectList",
		    method : RequestMethod.GET
	    },
	    
	    //获取单位组织
	    DEPARTMENT_ZTREE:{
	    	url : "/udf/department/getListZtree",
		    method : RequestMethod.GET
	    },
	    
	    //根据单位类别获取单位
	    DEPARTMENT_GETLISTBYCLASS:{
	    	url : "/udf/department/getListByClass",
	    	method : RequestMethod.GET
	    },
	    //获取用户有权限的单位信息（院系、开课单位)
	    DEPARTMENT_GETLISTALL:{
	    	url : "/udf/department/getListAll",
	    	method : RequestMethod.GET
	    },
	    //根据单位类别获取单位-获取院系
	    DEPARTMENT_GETDEPTLISTBYCLASS:{
	    	url : "/udf/department/getDeptListByClass",
	    	method : RequestMethod.GET
	    },
	    //导入单位信息
	    DEPARTMENT_IMPORTFILE:{
			url : "/udf/department/importFile",
			method : RequestMethod.POST
		},
		//导出单位模板
		DEPARTMENT_EXPORTTEMPLATE:{
			url : "/udf/department/exportTemplate",
			method : RequestMethod.GET
		},
		//导出单位失败信息
		DEPARTMENT_EXPORT_FAILMESSATE:{
			url : "/udf/department/exportFailMessage",
			method : RequestMethod.GET
		},
		//导出单位信息
		DEPARTMENT_EXPORT:{
			url : "/udf/department/export",
			method : RequestMethod.POST
		},
	    // 获取楼房信息列表
		BUILDING : {
			url : "/udf/building/getPagedList",
			method : RequestMethod.GET

		},
		// 获取单条楼房信息列表
		BUILDING_GET : {
			url : "/udf/building/getItem",
			method : RequestMethod.GET

		},
		// 添加楼房
		BUILDING_ADD : {
			url : "/udf/building/add",
			method : RequestMethod.POST

		},
		// 修改楼房
		BUILDING_UPDATE : {
			url : "/udf/building/update",
			method : RequestMethod.POST

		},
		// 删除楼房
		BUILDING_DELETE : {
			url : "/udf/building/delete",
			method : RequestMethod.POST

		},
		// 修改楼房状态
		BUILDING_SET_STATUS : {
			url : "/udf/building/setStatus",
			method : RequestMethod.POST

		},
		// 根据校区id获取楼房集合
		BUILDING_GET_LIST_BY_CAMPUS_ID : {
			url : "/udf/building/getListByCampusId",
			method : RequestMethod.POST

		},
		// 获取单条学校信息列表
		SCHOOL_GET : {
			url : "/udf/school/getItem",
			method : RequestMethod.GET

		},
		// 新增学校
		SCHOOL_ADD : {
			url : "/udf/school/add",
			method : RequestMethod.POST

		},
		// 修改学校
		SCHOOL_UPDATE : {
			url : "/udf/school/update",
			method : RequestMethod.POST

		},
		//获取行政区划
		CANTON_GET : {
			url : "/udf/canton/getList",
			method : RequestMethod.GET
		},
		// 查询场地
		VENUE_GET_PAGEDLIST : {
			url : "/udf/venue/getPagedList",
			method : RequestMethod.POST

		},
		VENUE_ADD:{
			url : "/udf/venue/add",
			method : RequestMethod.POST
			
		},
		VENUE_UPDATE:{
			url : "/udf/venue/update",
			method : RequestMethod.POST
		}
		,
		VENUE_IMPORTFILE:{
			url : "/udf/venue/importFile",
			method : RequestMethod.POST
		}
		,
		VENUE_GET_ITEM:{
			url : "/udf/venue/getItem",
			method : RequestMethod.POST
		},
		VENUE_DELETE:{
			url : "/udf/venue/delete",
			method : RequestMethod.POST
		},
		VENUE_SET_STATUS:{
			url : "/udf/venue/setStatus",
			method : RequestMethod.POST
		},
		//导入场地
		VENUE_IMPORTFILE:{
			url : "/udf/venue/importFile",
			method : RequestMethod.POST
		},
		//导出模板
		VENUE_EXPORTTEMPLATE:{
			url : "/udf/venue/exportTemplate",
			method : RequestMethod.GET
		},
		//导出失败信息
		VENUE_EXPORT_FAILMESSATE:{
			url : "/udf/venue/exportFailMessage",
			method : RequestMethod.GET
		},
		//导出场地
		VENUE_EXPORT:{
			url : "/udf/venue/export",
			method : RequestMethod.POST
		},
		//根据查询条件获取场地
		VENUE_GETLISTBYQUERY:{
			url : "/udf/venue/getListByQuery",
			method : RequestMethod.POST
		},
		//新增校历
		SCHOOLCALENDAR_ADD : {
			url : "/udf/schoolCalendar/addList",
			method : RequestMethod.POST
		},
		//修改校历
		SCHOOLCALENDAR_UPDATE : {
			url : "/udf/schoolCalendar/updateList",
			method : RequestMethod.POST
		},
		//查询所有校历
		SCHOOLCALENDAR_GETALL : {
			url : "/udf/schoolCalendar/getAll",
			method : RequestMethod.GET
		},
		//根据条件查询校历
		SCHOOLCALENDAR_GET : {
			url : "/udf/schoolCalendar/getList",
			method : RequestMethod.GET
		},
		//根据条件获取单个校历信息
		SCHOOLCALENDAR_GETITEM : {
			url : "/udf/schoolCalendar/getItem",
			method : RequestMethod.GET
		},
		//更新校历状态，是否当前学年学期
		SCHOOLCALENDAR_SETISCURRENTSEMESTER : {
			url : "/udf/schoolCalendar/setIsCurrentSemester",
			method : RequestMethod.POST
		},
		//更新校历备注
		SCHOOLCALENDAR_UPDATEREMARKS : {
			url : "/udf/schoolCalendar/updateRemarks",
			method : RequestMethod.POST
		},
		//获取教学周数
		SCHOOLCALENDAR_GETTEACHWEEK : {
			url : "/udf/schoolCalendar/getTeachWeek",
			method : RequestMethod.GET
		},
		//获取校历信息
		SCHOOLCALENDAR_GETCALENDAR : {
			url : "/udf/schoolCalendar/getCalendar",
			method : RequestMethod.GET
		},
		// 获取个人桌面校历数据
		SCHOOLCALENDAR_GET_PERSONALDESKTOP:{
			url:"/udf/schoolCalendar/getPersonalDesktop",
			method:RequestMethod.GET
		},
		//教师新增
		TEACHER_ADD:{
			url : "/udf/teacher/add",
			method : RequestMethod.POST
		},
		//教师新增
		TEACHER_GET_PAGEDLIST:{
			url : "/udf/teacher/getPagedList",
			method : RequestMethod.POST
		},
		//老师信息列表
		TEACHER_GET_GETLIST:{
			url : "/udf/teacher/getList",
			method : RequestMethod.POST
		},
		//单条教师获取
		TEACHER_GET_ITEM:{
			url : "/udf/teacher/getItem",
			method : RequestMethod.POST
		},
		//教师修改
		TEACHER_UPDATE:{
			url : "/udf/teacher/update",
			method : RequestMethod.POST
		},
		//教师删除
		TEACHER_DELETE:{
			url : "/udf/teacher/delete",
			method : RequestMethod.POST
		},
		//导入教师信息
		TEACHER_IMPORTFILE:{
			url : "/udf/teacher/importFile",
			method : RequestMethod.POST
		},
		//导出教师模板
		TEACHER_EXPORTTEMPLATE:{
			url : "/udf/teacher/exportTemplate",
			method : RequestMethod.GET
		},
		//导出教师失败信息
		TEACHER_EXPORT_FAILMESSATE:{
			url : "/udf/teacher/exportFailMessage",
			method : RequestMethod.GET
		},
		//导出教师信息
		TEACHER_EXPORT:{
			url : "/udf/teacher/export",
			method : RequestMethod.POST
		},
		//根据名称查询教师信息
		TEACHER_GETALLLIST:{
			url : "/udf/teacher/getAllList",
			method : RequestMethod.POST
		},
	    //获取学年学期
	    COMMON_GETSEMESTERLIST:{
	    	url : "/udf/schoolCalendar/getSemesterList",
		    method : RequestMethod.GET
	    },
	    //获取正序学年学期
	    GET_ASC_SEMESTERLIST:{
	    	url : "/udf/schoolCalendar/getAscSemesterList",
		    method : RequestMethod.GET
	    },
	    //获取学年
	    GET_ASC_YEARLIST:{
	    	url : "/udf/schoolCalendar/getAcademicYearList",
		    method : RequestMethod.GET
	    }
	}
    module.exports = config;
});
