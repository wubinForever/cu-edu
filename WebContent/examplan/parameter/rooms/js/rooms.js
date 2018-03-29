/**
 * 考场及容量设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	
	var rooms = {
		// 初始化
		init : function() {
			//初始化学年学期下拉
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarSelect");
			var semesterId=semesterSelect.getValue();

			var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
			batchIdSel = batchSelect.getValue();
			
			// 1.0 获取列表
			rooms.infoQuery(0,100);
			
			// 新增
			$("button[name='addRooms']").bind("click", function() {
				rooms.popAddRoomsHtml();
			});
			// 复制
			$("button[name='copyRooms']").bind("click", function() {
				rooms.popCopyRoomsHtml();
			});
			// 设置
			$("button[name='setRooms']").bind("click", function() {
				rooms.popSetRoomsHtml();
			});
			
			// 选择学期级联考试批次，并更新列表
			$("#schoolCalendarSelect").on("change keyup", function() {
				semesterId = semesterSelect.getValue();
				var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
				batchIdSel = batchSelect.getValue();
			})
		},
		
		
		/** ******************* 1.0 获取列表 ******************* */
		/**
		 * 1.1查询函数
		 */
		infoQuery : function(pageIndex, pageSize) {
			var reqData = {
				pageIndex : pageIndex,
				pageSize : pageSize
			};
			rooms.commonAjax(reqData, URL_EXAMPLAN.ROOMS_GETPAGEDLIST, pageSize);
		},
		
		/**
		 * 1.2获取列表
		 * 
		 * @param reqdata
		 *            查询条件
		 * @param url
		 *            控制器路径
		 * @param pageNum
		 *            页码
		 */
		commonAjax : function(reqdata, url, pageNum) {
			var _ = this;
			ajaxData.contructor(false);// 同步
			ajaxData.request(url, reqdata, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				$("#pagination").show();
				if (data.code == config.RSP_SUCCESS) {
					$("#bodyContentImpl").tmpl(data.data.list).appendTo(
							'#tbodycontent');
					page.commonPagination(data.data.page, data.data.pageIndex,
							rooms.infoCallBack, data.data.totalRows);
					$("select[name='page_size']").val(pageNum);
					common.checkDisable();
				} else {
					$("#tbodycontent")
							.append("<tr><td colspan='11'></td></tr>")
							.addClass("no-data-html");
					$("#pagination").hide();
				}
			});
		},
		/**
		 * 1.3回调函数
		 * 
		 * @param pageIndex
		 *            页码
		 */
		infoCallBack : function(pageIndex) {
			var pagesize = $("select[name='page_size']").val();
			if (pagesize != '') {
				pagesize = pagesize;
			} else {
				pagesize = 10;
			}
			if (pageIndex > -1) {
				var reqdata = {
					pageIndex : pageIndex,
					pageSize : pagesize
				};
				rooms.commonAjax(reqdata, URL_EXAMPLAN.ROOMS_GETPAGEDLIST,
						pagesize);
			}
		},
		
		/*
		 * 弹框 新增
		 */
		popAddRoomsHtml : function() {
			art.dialog.open(base+'/examplan/parameter/rooms/html/add.html', // 这里是页面的路径地址
			{
				id : 'addRooms',// 唯一标识
				title : '新增考场',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 750,// 弹窗高度*/
				okVal : '确认',
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/*
		 * 弹框 复制
		 */
		popCopyRoomsHtml : function() {
			art.dialog.open(base+'/examplan/parameter/rooms/html/copyhist.html', // 这里是页面的路径地址
			{
				id : 'copyRooms',// 唯一标识
				title : '复制历史考场',// 这是标题
				width : 850,// 这是弹窗宽度。其实可以不写
				height : 300,// 弹窗高度
				okVal : '确认',
				cancelVal : '关闭',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/*
		 * 弹框 设置
		 */
		popSetRoomsHtml : function() {
			art.dialog.open(base+'/examplan/parameter/rooms/html/set.html', // 这里是页面的路径地址
			{
				id : 'setRooms',// 唯一标识
				title : '设置考场容量',// 这是标题
				width : 500,// 这是弹窗宽度。其实可以不写
				height : 400,// 弹窗高度
				okVal : '确认',
				cancelVal : '关闭',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
	
	/** ********************* end ******************************* */
	}

	module.exports = rooms;
	window.rooms = rooms;
});