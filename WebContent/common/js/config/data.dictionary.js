define(function (require, exports, module) {
	/**
	 * 字典常量
	 */
	var dictionaryConstant = { 			
			
		/**
		 * 基础数据
		 */	
		ID_FOR_TRAINING_LEVEL: "PYCC", // 基础数据-专业信息-培养层次
		ID_FOR_DEGREE : "GB/T 6864-2003", // 基础数据-专业信息-（专业）学位	
		ID_FOR_DEPARTMENT_CLASS_CODE : "DWLB", // 基础数据-单位信息-单位类别
		ID_FOR_DEPARTMENT_TYPE_CODE : "GTA_DEPARTMENT_TYPE", // 基础数据-单位信息-单位类型	
		ID_FOR_START_UP_TYPE_CODE : "DWBB", // 基础数据-单位信息-单位办别
		
		ID_FOR_BUILDING_TYPE_CODE:"LFLX", //基础数据-教师信息-楼房类型
		ID_FOR_VENUE_TYPE_CODE:"JSLX", //基础数据-教师信息-场地类型
		ID_FOR_SEX_CODE:"GB/T 2261.1-2003", //基础数据-教师信息-性别
		ID_FOR_ID_CARD_TYPE_CODE:"SFZJLX", //基础数据-教师信息-身份证件类型
		ID_FOR_NATION_CODE:"GB/T 3304-1991", //基础数据-教师信息-民族
		ID_FOR_NATIONALITY_CODE:"GB/T 2659-2000", //基础数据-教师信息-国籍		
		ID_FOR_ID_CARD_TYPE_CODE:"SFZJLX", //基础数据-教师信息-身份证件类型
		ID_FOR_MARITAL_STATUS_CODE:"GB/T 2261.2-2003", //基础数据-教师信息-婚姻状况
		ID_FOR_OVERSEAS_CHINESE_CODE:"GATQW", //基础数据-教师信息-港澳台侨外
		ID_FOR_POLITICAL_STATUS_CODE:"GB/T 4762-1984", //基础数据-教师信息-政治面貌
		ID_FOR_HEALTH_CODE:"GB/T 2261.3-2003", //基础数据-教师信息-健康状况
		ID_FOR_HIGHEST_EDUCATION_CODE:"GB/T 4658-2006", //基础数据-教师信息-学历
		ID_FOR_HIGHEST_DEGREE_CODE:"GB/T 6864-2003", //基础数据-教师信息-学位
		ID_FOR_HIGHEST_TITLE_CODE:"GB/T 8561-2001", //基础数据-教师信息-专业技术职务
		ID_FOR_TEACHER_TYPE_CODE:"GTA_TEACHER_TYPE", //基础数据-教师信息-教师类型
		ID_FOR_COMPILATION_CATEGORY_CODE:"BZLB", //基础数据-教师信息-编制类别
		ID_FOR_STAFF_CATEGORY_CODE:"JZGLB", //基础数据-教师信息-教职工类别
		ID_FOR_CLASSROOM_SITUATION_CODE:"RKZK", //基础数据-教师信息-任课状况
		ID_FOR_CURRENT_STATE:"JZGDQZT", //基础数据-教师信息-当前状态
		
		/**
		 * 培养方案
		 */
		ENROLL_SEASON_CODE:"GTA_ENROLL_SEASON",//培养方案,招生季节编号
		CHECK_WAY_CODE:"GTA_CHECK_WAY", //培养方案-考核方式编号
		COURSE_TYPE_CODE:"GTA_COURSE_CATEGORY", //培养方案-课程类别编号
		COURSE_ATTRIBUTE_CODE:"GTA_COURSE_ATTRIBUTE", //培养方案-课程属性编号
		TACHE_TYPE_CODE:"GTA_TACHE_CATEGORY", //培养方案-环节类别编号
		COURSE_BIG_CATEGORY:"GTA_COURSE_BIG_CATEGORY", //培养方案-课程大类编号
		/**
		 * 学籍管理 
		 */
		ARCHIEVES_STATUS_CODE:"GTA_ARCHIEVES_STATUS",//学籍状态
		SCHOOL_STATUS_CODE:"GTA_SCHOOL_STATUS",//在校状态
		FAILTH_CODE:"ZJXY",//宗教信仰
		BLOOD_TYPE_CODE:"XX",//血型
		ENTRANCE_WAY_CODE:"RXFS",//入学方式
		STUDENT_CATEGORY_CODE:"XSLB",//学生类别
		STUDY_FORM_CODE:"GB/T 14946.1-2009",//学习形式
		TRAINING_WAY_CODE:"PYFS",//培养方式
		GTA_TRAINING_OBJECT:"GTA_TRAINING_OBJECT",//培养对象
		CURRENT_STATUS_CODE:"XSDQZT",//学生当前状态
		FOREIGN_LANGUAGE_CODE:"GB/T 4880.1-2005",//外语语种
		STUDENT_ORIGIN_CODE:"XSLY",//学生来源
		STUDENT_CONFIRM_CLASS_CODE : "GTA_CONFIRM_CLASS",// 确定所在班级
		DATA_SOURCE_CODE : "GTA_DATA_SOURCE",// 异动数据来源
		ALIENCHANGE_REASON : "XJYDYY",// 异动原因
		ALIENCHANGE_CATEGORY_OTHER : "99",// 异动类别-其他
		SEMESTER : "XQ",// 学期
		/**
	    * 排课管理
	    */
		COURSEPLAN_SKFS_CODE : "GTA_TEACHINGMODE", // 授课方式
	   /**
	    * 考务管理
	    */
		ID_FOR_TIMES_PROPERTY:"46587178ee254fc888b86724a8a3d4fa",// 考务管理-场次性质
		SCHOOL_SCHEDULE_CODE : "XXXZ",							//学校性质
		SCHOOL_TYPE_CODE : "BXLX",								//办学类型
		MERCY_RELIEF_CODE : "XXJYJGJBZ"							//举办者
	}
    module.exports = dictionaryConstant;
});