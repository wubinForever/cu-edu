define(function (require, exports, module) {
	var ajaxData = require("./ajaxData");
	var config = require("./config");
	
	/**
	 * 翻页对象，option主要包含url、param，由用户传入需要请求后台的地址和筛选的条件
	 * callback 用于返回翻页数据的装载
	 */
	var pagination = function(option, callback){
		var opt = {
			id: "pagination",	//分页组件容器id
			url: null, //地址对象， 从url.xxx中获取
			param: {}, //后台需要筛选的对象,
			pageSizeList:[15, 20, 50, 100, 200],
			pageSize:15
		}
		this.option =  $.extend({}, opt, option);
		this.callback = callback;
		//加载数据
		this.loadData = function(pageNo){
			var me = this;
    		if(pageNo || pageNo == 0){
    			me.option.param.pageIndex = pageNo;
    		}
    		if(!me.option.param.pageIndex){
    			me.option.param.pageIndex = 0;
    		}
    		if(!me.option.param.pageSize){
    			me.option.param.pageSize = me.option.pageSize;
    		}
    		ajaxData.request(me.option.url, me.option.param, function(data){
			    if(data.code == config.RSP_SUCCESS){
			    	if(data.data === null || data.data === undefined){
			    		return;
			    		//程序异常
			    	}
			    	if(data.data.list && data.data.list.length==0 && data.data.pageIndex!=0){
			    		me.option.param.pageIndex=0;
			    		//进行重新封装
			    		if(pageNo || pageNo == 0){
			    			me.option.param.pageIndex = pageNo;
			    		}
			    		//if(!me.option.param.pageIndex){
			    			me.option.param.pageIndex = 0;
			    		//}
			    		if(!me.option.param.pageSize){
			    			me.option.param.pageSize = me.option.pageSize;
			    		}
			    		ajaxData.request(me.option.url, me.option.param, function(data){
						    if(data.code == config.RSP_SUCCESS){
						    	me.initPagination(data.data.totalRows, data.data.page);
						    	me.callback(data.data.list,data.data.totalRows);
						    }else{
						    	//程序异常
						    }
			    		}, true);
			    		
			    	}else{
			    		me.callback(data.data.list,data.data.totalRows);
			    	}
			    	me.initPagination(data.data.totalRows, data.data.page);
			    	
			    }else{
			    	//程序异常
			    }
    		}, true);
		}
		
	}
	
	
    pagination.prototype = {
    	/**
    	 * 初始化
    	 */
    	init:function(){
    		this.loadData();
    		return this;
    	},
    	/**
    	 * 调用查询
    	 * @param param
    	 */
    	seach : function(param){
    		this.option.param = param;
    	},
    	
    	
    	initPagination : function(totalCount){
    		$("#"+this.option.id).pagination(totalCount, {
 			    callback: this.pageCallBack,//调用主体函数
 				num_edge_entries: 1, //边缘页数
 				num_display_entries: 4, //主体页数
 				prev_text:"<",//上一页显示
 				next_text:">",//下一页显示
 				current_page:this.option.param.pageIndex,//当前显示的页面
 				total_count:totalCount,//自定义共有多少条
 				page_size_list: this.option.pageSizeList,//自定下拉框,
 				items_per_page: this.option.param.pageSize,
 				pagination:this
 			});
    	},
    
    	
    	/**
    	 * 翻页回调函数
    	 * @param pageIndex
    	 * @param panel
    	 * @param pageSize
    	 */
    	pageCallBack : function(pageIndex,panel, pageSize){
    		if(pageSize){
    			this.pagination.option.param.pageSize = pageSize;
    		}
    		this.pagination.loadData(pageIndex);
    	},
    	setParam:function(param){
    		param.pageSize = this.option.param.pageSize;
    		this.option.param = param;
    		this.loadData();
    	},
    	getTotalCount:function(totalCount){
    		return totalCount;
    	}
    }
    module.exports = pagination;
});
