define(function (require, exports, module) {
	
     var page = {
		//分页插件封装
	     commonPagination : function(pageNationId,pageCount, pageIndex, functionName, totalCount) {
    	   page.commont(pageNationId,pageCount, pageIndex, functionName, totalCount,  10, [10, 20, 50, 100, 200, 1000, 2000])
    	},
    	commont : function(pageNationId ,pageCount, pageIndex, functionName, totalCount, maxSize ,page_size_list){
    		//psl = [];
    		/*if( totalCount > maxSize )//如果不满10业就不显示
    	    {
    	    	psl = page_size_list;
    	    }*/
		   $("#"+pageNationId).pagination(pageCount, {
			    callback: functionName,//调用主体函数
				num_edge_entries: 1, //边缘页数
				num_display_entries: 4, //主体页数
				items_per_page:1, //每页显示1项
				prev_text:"<",//上一页显示
				next_text:">",//下一页显示
				current_page:pageIndex,//当前显示的页面
				total_count:totalCount,//自定义共有多少条
				page_size_list: page_size_list//自定下拉框
			});
     	}
	}
    module.exports = page;
});
