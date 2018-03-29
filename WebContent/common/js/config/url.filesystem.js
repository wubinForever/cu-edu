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
		//文件上传地址
		IMPORT_FILE:{
	    	url : "/filesystem/importFile",
		    method : RequestMethod.POST
	    },

		//文件下载地址
		EXPORT_FILE:{
	    	url : "/filesystem/exportFile",
		    method : RequestMethod.GET
	    },
	    GET_ITEM:{
	    	url : "/filesystem/getItem",
		    method : RequestMethod.GET
	    },
	    GET_LIST:{
	    	url : "/filesystem/getList",
		    method : RequestMethod.GET
	    },
	    DECOMPRESS:{
	    	url : "/filesystem/decompress",
		    method : RequestMethod.POST
	    },
	    GET_ZIP:{
	    	url : "/filesystem/getZip",
		    method : RequestMethod.GET
	    },
	    GET_FILEZIP:{
	    	url : "/filesystem/getFileZip",
		    method : RequestMethod.POST
	    },
	    GET_FILEMESSAGESESSION:{
	    	url : "/filesystem/getFileMessageSession",
		    method : RequestMethod.GET
	    }
	    
	    
	}
    module.exports = config;
});
