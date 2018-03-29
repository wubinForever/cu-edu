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
			
	    /* **********考试批次设置*************************************/	
		//考试批次设置
		BATCH_GETPAGEDLIST:{
	    	url : "/examplan/parameter/batch/getPagedList",
		    method : RequestMethod.GET
	    },

		//新增考试批次
	    BATCH_ADD:{
	    	url : "/examplan/parameter/batch/add",
		    method : RequestMethod.POST
	    },
		
		//修改考试批次
		BATCH_UPDATE:{
	    	url : "/examplan/parameter/batch/update",
		    method : RequestMethod.POST
	    },
	    
	    //删除考试批次
		BATCH_DELETE:{
	    	url : "/examplan/parameter/batch/delete",
		    method : RequestMethod.POST		   
	    },   
	    
	    //获取考试批次
		BATCH_GETITEM:{
	    	url : "/examplan/parameter/batch/getItem",
		    method : RequestMethod.GET
	    },
	    
	    // 批次名称验证 
	    BATCH_VALIDATIONBATCHNAME:{
	    	url : "/examplan/parameter/batch/validationBatchName",
		    method : RequestMethod.GET
	    },
	    
	    //根据学年学期（校历Id）获取考试批次
		BATCH_GETLIST_BY_SCHOOLCALENDARID:{
	    	url : "/examplan/parameter/batch/getListBySchoolCalendarId",
		    method : RequestMethod.GET
	    },
	    
	    /* *********考试时间设置**********************************************/
	    //考试时间信息
		TIMES_GETPAGEDLIST:{
	    	url : "/examplan/parameter/times/getPagedList",
		    method : RequestMethod.GET
	    },

		//新增考试时间
		TIMES_ADD:{
	    	url : "/examplan/parameter/times/add",
		    method : RequestMethod.POST
	    },

		//修改考试时间
		TIMES_UPDATE:{
	    	url : "/examplan/parameter/times/update",
		    method : RequestMethod.POST
	    },
	    
	    //删除考试时间
		TIMES_DELETE:{
	    	url : "/examplan/parameter/times/delete",
		    method : RequestMethod.POST		   
	    },   
	    
	    //获取考试时间
		TIMES_GETITEM:{
	    	url : "/examplan/parameter/times/getItem",
		    method : RequestMethod.GET
	    },
	    //获取考试时间集合
		TIMES_GETALLLIST:{
	    	url : "/examplan/parameter/times/getAllList",
		    method : RequestMethod.GET
	    },
	    //设置禁考时段
	    TIMES_FORBID:{
	    	url : "/examplan/parameter/times/forbid",
		    method : RequestMethod.POST
	    },
	    //取消禁考时段
	    TIMES_CANCLE:{
	    	url : "/examplan/parameter/times/cancle",
		    method : RequestMethod.POST
	    },
	    
	    /* **********考场设置*************************************/	
		//考场设置
		ROOMS_GETPAGEDLIST:{
	    	url : "/examplan/parameter/rooms/getPagedList",
		    method : RequestMethod.GET
	    },

		//添加考场
	    ROOMS_ADD:{
	    	url : "/examplan/parameter/rooms/add",
		    method : RequestMethod.POST
	    },
		
		//复制历史考场
	    ROOMS_COPY:{
	    	url : "/examplan/parameter/rooms/copy",
		    method : RequestMethod.POST
	    },
	    
	    //设置考场容量
	    ROOMS_SETUP:{
	    	url : "/examplan/parameter/rooms/setup",
		    method : RequestMethod.POST		   
	    },   
	    
	    //删除考场
	    ROOMS_DELETE:{
	    	url : "/examplan/parameter/rooms/delete",
		    method : RequestMethod.POST
	    }
	}
    module.exports = config;
});
