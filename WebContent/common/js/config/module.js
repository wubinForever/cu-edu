define(function (require, exports, module) {
	/**
	 * 文件上传对应的模块名，与后端代码中的BusinessModule类对应
	 */
	var businessModule = {
		choicecourse : "choicecourse",	//选课
		courseplan : "courseplan",		//排课管理
		examplan : "examplan",			//考务管理
		graduation : "graduation",		//毕业管理
		score : "score",				//学分管理
		studentarchives : "studentarchives",	//学籍管理
		studentservice : "studentservice",		//学生服务
		teacherservice : "teacherservice",		//老师服务
		trainplan : "trainplan",				//培养计划
		udf : "udf",	//后台管理
		data : "data"	//统一数据
	}
    module.exports = businessModule;
});