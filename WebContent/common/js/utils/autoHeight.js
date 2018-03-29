/**
 * 1.iframe高度自适应
 * 2.tabletree-tbody高度自适应
 * 3.table-tbody高度自适应
 */
define(function(require, exports, module) {
	var autoHeight = {
		
		init : function() {
			this.autoHeightiframe();
		},
	
		/**
		 * 自适应 iframe 
		 */
		autoHeightiframe : function(){
			setInterval(function(){
			//获取当前可视窗口的高度
			var _this = $(window.parent.document),
			mainheight = $(window).height();
			
			var height = mainheight - 116,
				sideheight = mainheight - 58;
			_this.find(".side-bar").css("height", sideheight);  
			_this.find(".iframe").css("height", height);  
			_this.find(".tab-pane.active").css("height", height);
				autoHeight.autoTreetable(height);
			
			}, 200);
		},
		
		/*
		 * 自适应 table滚动高度
		 */
		autoTreetable: function(height){
			var a = height,
				activeId = $(document).find(".tab-pane.active").attr("id"),
				parentOn = $("#iframe-"+activeId).contents(),
				b = parentOn.find(".table>thead").height(), //表格头部高度
				c = parentOn.find(".box-header").outerHeight(true),  //表格顶部操作按钮区域高度
				d = parentOn.find(".header-con").outerHeight(true),  //页面顶部搜索条件区域高度
				p = parentOn.find("#pagination").outerHeight(true),	 //分页区域高度
				t = parentOn.find(".care-tips").outerHeight(true),	 //提示区域高度
				l = parentOn.find(".tab-hd").outerHeight(true),	//tab-li区域高度
				q = parentOn.find(".print-title").outerHeight(true),	//print-title区域高度
				s = parentOn.find(".scoretitle").outerHeight(true),	//scoretitle区域高度
                o = parentOn.find(".scorestate").outerHeight(true),	//scoretitle区域高度
                x = parentOn.find(".contentbox").outerHeight(true), //contentbox区域高度
                y = parentOn.find(".care-tips2").outerHeight(true), //care-tips2区域高度

				treeScorllHeight = a-b-c-5,
				tableScorllHeight = a-b-c-d-p-t-l-20,
			    lefttreeScorllHeight = a-30,
				reportScorllHeight= a-d- 33,
		        scoreScorllHeight = a-b*2-c-d-s-o-q-130;
		        scoreScorllHeighttwo  = a-b*2-c-d-s-o-q-110;
                scoreScorllimport = a-x-y-b-20;

                if(parentOn.find(".scorll-boximport").length>0){
                    parentOn.find(".scorll-boximport").find("tbody").css("height", scoreScorllimport);
                    return false;
                   //table 滚动高度
                }		        
		        //用于一个页面中有2个表格时，不计算高度(例如：教师服务和学生服务的教学任务部分)
                if(parentOn.find(".scorll-boxauto").length>0){
                	return false;
                   //table 滚动高度
                }
                //用于一个页面中有2个表格时，分别计算高度(例如：教师服务和学生服务的辅导员成绩查询部分部分)
                if(parentOn.find(".scorll-box.scoreBox").length>0){
                    parentOn.find(".scorll-box.scoreBox").find("tbody").css("height", scoreScorllHeight);
                    return false;
                }
                 if(parentOn.find(".scorll-box.scoreBoxTwo").length>0){
                    parentOn.find(".scorll-box.scoreBoxTwo").find("tbody").css("height", scoreScorllHeighttwo);
                    return false;
                }
                parentOn.find(".scorll-box .table").find("tbody").css("height", tableScorllHeight );
				//treetable 滚动高度
				parentOn.find(".tree-body>.table").find("tbody").css("height", treeScorllHeight );
			   //左侧tree 滚动高度
			   parentOn.find(".lefttree-con").css("height", lefttreeScorllHeight );
			//登记册报表区域 滚动高度
			parentOn.find(".scroll-box2").css("height", reportScorllHeight);
		},

	}
	
	autoHeight.init();
	module.exports = autoHeight;
});
