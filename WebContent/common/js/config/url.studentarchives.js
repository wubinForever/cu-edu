/**
 * 学籍管理
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
		 *获取学生信息分页列表 
		 */	
		STUDENT_GETPAGELIST:{
	    	url : "/stu/student/getPagedList",
		    method : RequestMethod.GET
	    },
	    /**
		 *新增学生信息 
		 */	
	    STUDENT_ADD:{
	    	url : "/stu/student/add",
		    method : RequestMethod.POST
	    },
	    /**
		 *修改学生信息 
		 */	
	    STUDENT_UPDATE:{
	    	url : "/stu/student/update",
		    method : RequestMethod.POST
	    },
	    /**
		 *批量修改学生信息 
		 */	
	    STUDENT_BATCHUPDATE:{
	    	url : "/stu/student/batchUpdate",
		    method : RequestMethod.POST
	    },
	    /**
		 *删除学生信息 
		 */	
	    STUDENT_DELETE:{
	    	url : "/stu/student/delete",
		    method : RequestMethod.POST
	    },
	    /**
		 *删除学生信息 
		 */	
	    STUDENT_GETITEM:{
	    	url : "/stu/student/getItem",
		    method : RequestMethod.GET
	    },
	    /**
		 * 获取学生修改个人信息控制信息
		 */	
	    STUDENT_GETSETTINGITEM:{
	    	url : "/stu/student/getSettingItem",
		    method : RequestMethod.GET
	    },
	    /**
		 * 导入学生信息
		 */	
		STUDENT_IMPORTFILE:{
			url : "/stu/student/importFile",
			method : RequestMethod.POST
		},
		/**
	     * 下载导入学生模板
	     */
		STUDENT_EXPORTTEMPLATE:{
	    	url : "/stu/student/exportTemplate",
		    method : RequestMethod.GET
	    },
	    /**
	     * 导出导入学生信息失败信息
	     */
	    STUDENT_EXPORT_FAILMESSATE:{
	    	url : "/stu/student/exportFailMessage",
		    method : RequestMethod.GET
	    },
	    /**
	     * 下载导入班级模板
	     */
		CLASS_EXPORTTEMPLATE:{
	    	url : "/stu/classmanage/exportTemplate",
		    method : RequestMethod.GET
	    },
	    /**
	     * 导出导入班级失败信息
	     */
	    CLASS_EXPORT_FAILMESSATE:{
	    	url : "/stu/classmanage/exportFailMessage",
		    method : RequestMethod.GET
	    },
	    /**
		 * 导入学生信息
		 */	
		CLASS_IMPORTFILE:{
			url : "/stu/classmanage/importFile",
			method : RequestMethod.POST
		},
	    /**
		 * 设置学生修改个人信息控制信息
		 */	
	    STUDENT_SETTING:{
	    	url : "/stu/student/setting",
		    method : RequestMethod.POST
	    }, 
	    /**
		 * 根据不同参数获取学生列表
		 */	
	    STUDENT_GETLISTBYPARAMS:{
	    	url : "/stu/student/getlistByParams",
		    method : RequestMethod.GET
	    }, 
	    /**
		 * 根据不同参数获取学生分页数据
		 */	
	    STUDENT_GETPAGEDLISTBYPARAMS:{
	    	url : "/stu/student/getPagedListByParams",
		    method : RequestMethod.GET
	    }, 
	    /**
		 * 根据参数获取所有学生信息
		 */	
	    STUDENT_GETLISTBYCONDITION:{
	    	url : "/stu/student/getListByCondition",
		    method : RequestMethod.GET
	    }, 
	    /**
		 * 导入学生照片
		 */	
	    STUDENT_IMPORTPHOTO:{
	    	url : "/stu/student/importPhoto",
		    method : RequestMethod.POST
	    }, 
	    /**
		 * 导出学生照片失败提示信息
		 */	
	    STUDENT_EXPORTPHOTOFAIL:{
	    	url : "/stu/student/exportPhotoFailMessage",
		    method : RequestMethod.GET
	    },
	    /**
		 * 获取学籍卡列表
		 */	
	    STUDENT_ARCHIVESCARDLIST:{
	    	url : "/stu/studentArchivesCard/getPagedList",
		    method : RequestMethod.GET
	    }, 
	    /**
		 * 打印学籍卡列表
		 */	
	    STUDENT_ARCHIVESCARDPRINT:{
	    	url : "/stu/studentArchivesCard/print",
		    method : RequestMethod.GET
	    }, 
	    /**
	     * 导出学籍卡列表
	     */
	    STUDENT_ARCHIVESCARDEXPORT:{
	    	url : "/stu/studentArchivesCard/export",
		    method : RequestMethod.GET
	    }, 
	    /**
		 *毕业系统接口-修改学生信息 
		 */	
	    STUDENT_UPDATEGRADUATE:{
	    	url : "/stu/student/updateGraduate",
		    method : RequestMethod.POST
	    },
	    /**
	     * 开放学生申请异动控制设置保存
	     */	    
	    ALIENCHANGE_APPLYSETTING:{
	    	url : "/stu/alienChange/applySetting",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取开放学生申请异动控制设置数据项
	     */	    
	    ALIENCHANGE_GETAPPLYSETTINGITEM:{
	    	url : "/stu/alienChange/getApplySettingItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动类别设置列表
	     */	    
	    ALIENCHANGESETTING_GETLIST:{
	    	url : "/stu/alienChangeSetting/getList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动类别设置选择列表
	     */	    
	    ALIENCHANGESETTING_GETSELECTLIST:{
	    	url : "/stu/alienChangeSetting/getSelectList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动类别设置数据项
	     */	    
	    ALIENCHANGESETTING_GETITEM:{
	    	url : "/stu/alienChangeSetting/getItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 保存学籍异动类别设置
	     */	    
	    ALIENCHANGESETTING_SAVE:{
	    	url : "/stu/alienChangeSetting/save",
		    method : RequestMethod.POST
	    },
	    /**
	     * 保存学籍异动类别设置启用/禁用
	     */	    
	    ALIENCHANGESETTING_SAVESTATUS:{
	    	url : "/stu/alienChangeSetting/saveStatus",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取学籍异动申请登记列表
	     */	    
	    ALIENCHANGERECORD_GETREGISTERLIST:{
	    	url : "/stu/alienChange/getRegisterList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 学籍异动登记
	     */	    
	    ALIENCHANGERECORD_REGISTER:{
	    	url : "/stu/alienChange/register",
		    method : RequestMethod.POST
	    },
	    /**
	     * 学籍异动申请处理
	     */	    
	    ALIENCHANGERECORD_DEAL:{
	    	url : "/stu/alienChange/deal",
		    method : RequestMethod.POST
	    },
	    /**
	     * 学籍异动登记删除
	     */	    
	    ALIENCHANGERECORD_DELETE:{
	    	url : "/stu/alienChange/delete",
		    method : RequestMethod.POST
	    },
	    /**
	     * 学籍异动登记导出
	     */	    
	    ALIENCHANGERECORD_EXPORTREGISTER:{
	    	url : "/stu/alienChange/exportRegister",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动登记项
	     */	    
	    ALIENCHANGERECORD_GETREGISTERITEM:{
	    	url : "/stu/alienChange/getRegisterItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 学籍异动登记更新
	     */	    
	    ALIENCHANGERECORD_UPDATE:{
	    	url : "/stu/alienChange/update",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取学籍异动处理列表
	     */	    
	    ALIENCHANGERECORD_GETDEALLIST:{
	    	url : "/stu/alienChange/getDealList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 学籍申请处理导出
	     */	    
	    ALIENCHANGERECORD_EXPORTDEAL:{
	    	url : "/stu/alienChange/exportDeal",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取学籍异动处理申请项
	     */	    
	    ALIENCHANGERECORD_GETDEALREGISTERITEM:{
	    	url : "/stu/alienChange/getDealRegisterItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取在校年级
	     */	    
	    ARCHIVESREGISTER_GETGRADESINSCHOOL:{
	    	url : "/stu/archivesRegister/getGradesInSchool",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取在校年级对应的专业
	     */	    
	    ARCHIVESREGISTER_GETMAJORSINSCHOOL:{
	    	url : "/stu/archivesRegister/getMajorsInSchool",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取在校年级对应的院系
	     */	    
	    ARCHIVESREGISTER_GETDEPARTMENTINSCHOOL:{
	    	url : "/stu/archivesRegister/getDepartmentInSchool",
		    method : RequestMethod.GET
	    },
	    /**
	     * 学籍异动取消
	     */	    
	    ALIENCHANGERECORD_CANCEL:{
	    	url : "/stu/alienChange/cancel",
		    method : RequestMethod.POST
	    },
	    /**
	     * 更新异动学生选课结果（选课接口）
	     */	    
	    ALIENCHANGERECORD_UPDATECHOICEPROCESSSTATUS:{
	    	url : "/stu/alienChange/updateChoiceProcessStatus",
		    method : RequestMethod.POST
	    },
	    /**
	     * 班级新增
	     */
	    CLASS_ADD:{
	    	url : "/stu/classmanage/add",
		    method : RequestMethod.POST
	    },
	    /**
	     * 班级修改
	     */
	    CLASS_UPDATE:{
	    	url : "/stu/classmanage/update",
		    method : RequestMethod.POST
	    },
	    /**
	     * 班级分页
	     */
	    CLASS_GET_PAGEDLIST:{
	    	url : "/stu/classmanage/getPagedList",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取班级实体对象
	     */
	    CLASS_GET_ITEM:{
	    	url : "/stu/classmanage/getItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 根据查询条件获取班级下拉框
	     */
	    CLASS_GET_CLASSSELECTBYQUERY:{
	    	url : "/stu/classmanage/getClassSelectByQuery",
		    method : RequestMethod.GET
	    },
	    /**
	     * 删除班级实体对象
	     */
	    CLASS_DELETE:{
	    	url : "/stu/classmanage/delete",
		    method : RequestMethod.POST
	    },
	    /**
	     * 导出班级信息
	     */
	    CLASS_EXPORT:{
	    	url : "/stu/classmanage/export",
		    method : RequestMethod.GET
	    },
	    /**
	     * 获取报到注册设置
	     */
	    REGISTERSETTING_GETITEM:{
	    	url : "/stu/registerSetting/getItem",
		    method : RequestMethod.GET
	    },
	    /**
	     * 保存报到注册设置
	     */
	    REGISTERSETTING_SAVE:{
	    	url : "/stu/registerSetting/save",
		    method : RequestMethod.POST
	    },
	    /**
	     * 查询学生报到
	     */
	    REPORT_GETLIST:{
	    	url : "/stu/report/getList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 报到学生名册
	     */
	    REPORT_ROLL:{
	    	url : "/stu/report/roll",
		    method : RequestMethod.POST
	    },
	    /**
	     * 报到学生名册
	     */
	    REPORT_EXPORT:{
	    	url : "/stu/report/exportRoll",
		    method : RequestMethod.POST
	    },
	    /**
	     * 办理学生报到
	     */
	    REPORT_ADD:{
	    	url : "/stu/report/transact",
		    method : RequestMethod.POST
	    },
	    /**
	     * 撤销学生报到
	     */
	    REPORT_REVOK:{
	    	url : "/stu/report/revok",
		    method : RequestMethod.POST
	    },
	    /**
	     * 查询学生注册
	     */
	    REGISTER_GETLIST:{
	    	url : "/stu/register/getList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 注册学生名册
	     */
	    REGISTER_ROLL:{
	    	url : "/stu/register/roll",
		    method : RequestMethod.POST
	    },
	    /**
	     * 报到学生名册
	     */
	    REGISTER_EXPORT:{
	    	url : "/stu/register/exportRoll",
		    method : RequestMethod.POST
	    },
	    /**
	     * 办理学生注册
	     */
	    REGISTER_ADD:{
	    	url : "/stu/register/register",
		    method : RequestMethod.POST
	    },
	    /**
	     * 撤销学生注册
	     */
	    REGISTER_REVOK:{
	    	url : "/stu/register/revok",
		    method : RequestMethod.POST
	    },
	    /**
	     * 获取当前用户权限
	     */
	    REPORT_GETPOWER:{
	    	url : "/stu/report/getPower",
		    method : RequestMethod.POST
	    },
	    /**
	     * 批量注册
	     */
	    REGISTER_BATCHREGISTER:{
	    	url : "/stu/register/batchRegister",
		    method : RequestMethod.POST
	    },
	    /**
	     * 导出班级在校学生人数
	     */
	    STUDENTNUMBEROFCLASS_EXPORT:{
	    	url : "/stu/statistic/exportClassStudent",
		    method : RequestMethod.POST
	    },
	    /**
	     * 导出院系在校学生人数
	     */
	    STUDENTNUMBEROFDEPARTMENT_EXPORT:{
	    	url : "/stu/statistic/exportDepartmentStudent",
		    method : RequestMethod.POST
	    },
	    /**
	     * 学生名册
	     */
	    STUDENT_ROLL:{
	    	url : "/stu/studentRoll/getPagedList",
		    method : RequestMethod.GET
	    },
	    /**
	     * 学生名册导出
	     */
	    STUDENT_ROLL_EXPORT:{
	    	url : "/stu/studentRoll/export",
		    method : RequestMethod.GET
	    },
	    /**
	     * 按班级统计人数列表数据源
	     */
	    STUDENTNUMBEROFCLASS_GETLIST:{
	    	url : "/stu/statistic/getClassStudent",
		    method : RequestMethod.GET
	    },
	    /**
	     * 按院系统计人数列表数据源
	     */
	    STUDENTNUMBEROFDEPATMENT_GETLIST:{
	    	url : "/stu/statistic/getDepartmentStudent",
		    method : RequestMethod.GET
	    },
	    /**
	     * 根据查询条件获取在校年级的班级下拉框
	     */
	    CLASS_GET_CLASSSELECTBYINSCHOOL:{
	    	url : "/stu/classmanage/getClassSelectByInSchool",
		    method : RequestMethod.GET
	    },
	    /**
	     * 根据学号和学生姓名查询学生数据
	     */
		GET_SELECT_LISTBYNOORNAME: {
			url : "/stu/student/getSelectListByNoOrName",
			method : RequestMethod.GET
		},
	    /**
	     * 根据查询条件获取当前学年学期学籍注册信息
	     */
		GET_CURRENT_STUDENT: {
			url : "/stu/studentRoll/getCurrentStudent",
			method : RequestMethod.GET
		},
	    /**
	     * 根据学号获取学生信息
	     */
		GET_STUDENT: {
			url : "/stu/student/getStudent",
			method : RequestMethod.GET
		},
		
		/**
		 * 照片管理-获取学生管理照片信息分页列表 
		 */	
		STUDENT_GETSTUDENTPHOTOPAGEDLIST:{
	    	url : "/stu/student/getStudentPhotoPagedList",
		    method : RequestMethod.GET
	    },
	    
	    /**
		 * 照片管理-上传照片 
		 */	
		STUDENT_UPLOAD_STUDENTPHOTO:{
	    	url : "/stu/student/saveStudentPhoto",
		    method : RequestMethod.POST
	    },  
	    
	    /**
		 * 照片管理-导出学生照片-获取照片信息
		 */	
	    STUDENT_GETEXPORTPHOTOLIST:{
	    	url : "/stu/student/getExportPhotoList",
		    method : RequestMethod.POST
	    }, 
	    
	    /**
		 * 照片管理-导出学生照片导出失败提示信息
		 */	
	    STUDENT_EXPORTPHOTOEXPORTFAILMESSAGE:{
	    	url : "/stu/student/exportPhotoExportFailMessage",
		    method : RequestMethod.GET
	    }
	}
    module.exports = config;
});
