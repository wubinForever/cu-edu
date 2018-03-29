/**
 * 考试时间设置
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
	
	var invigilator = {
		// 初始化
		init : function() {
			//初始化学年学期下拉
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarSelect");
			var semesterId=semesterSelect.getValue();

			var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
			batchIdSel = batchSelect.getValue();
			
			// 新增
			$("button[name='addInvigilator']").bind("click", function() {
				invigilator.popAddInvigilator();
			});
			// 复制
			$("button[name='copyInvigilator']").bind("click", function() {
				invigilator.popCopyInvigilator();
			});
			
			// 选择学期级联考试批次，并更新列表
			$("#schoolCalendarSelect").on("change keyup", function() {
				semesterId = semesterSelect.getValue();
				var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
				batchIdSel = batchSelect.getValue();
			})
		},
		
		/*
		 * 弹框 新增
		 */
		popAddInvigilator : function() {
			art.dialog.open(base+'/examplan/parameter/invigilator/html/add.html', // 这里是页面的路径地址
			{
				id : 'addInvigilator',// 唯一标识
				title : '添加监考人员',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 750,// 弹窗高度*/
				okVal : '确认',
				fixed: true,
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
		popCopyInvigilator : function() {
			art.dialog.open(base+'/examplan/parameter/invigilator/html/copyhist.html', // 这里是页面的路径地址
			{
				id : 'copyInvigilator',// 唯一标识
				title : '监考人员继承设置',// 这是标题
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
		}
		
	
	/** ********************* end ******************************* */
	}

	module.exports = invigilator;
	window.invigilator = invigilator;
});