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
	 * 配置所有需要从后端获取下拉框数据源的地址
	 */
	var config = {	    
		//获取开课单位的下拉框数据源
	    DEPARTMENT_STARTCLASS_FOR_SELECT:{
	    	url : "/udf/department/getStartClassDepartmentSelectList",
		    method : RequestMethod.GET
	    }
	}
    module.exports = config;
});
