/**
 * 选择教室（手动排课）
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var base = config.base;
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	// 枚举
	var weekType = require("basePath/enumeration/courseplan/WeekType");

	var classroomlist = {
		init : function() {
			var reqData = popup.getData("chooseVenue");
			popup.setData("checkedVenue",-1); // 页面初始化，返回值初始值为-1
			// 绑定校区下拉框
			simpleSelect.loadCampus("campusId", true, reqData.campusId, constant.SELECT_ALL, "");
			// 绑定建筑下拉框
			simpleSelect.loadAllBuilding("buildingId", reqData.campusId, {
				defaultValue : reqData.buildingId,
				firstText : "全部",
				firstValue : ""
			});
			// 绑定教室类型
			simpleSelect.loadDictionarySelect("venueTypeCode", urlDictionary.ID_FOR_VENUE_TYPE_CODE, {
				defaultValue : reqData.venueTypeCode,
				firstText : constant.SELECT_ALL,
				firstValue : ""
			});

			this.QueryParam = reqData;
			$("#minSeatNum").val(reqData.minSeatNum);
			reqData.isUsed = $("#isUsed").prop("checked") ? 0 : 1;
			classroomlist.pagination = new pagination({
				url : urlCoursePlan.ARRANGE_MANUALARRANGE_GETTEACHROOMPAGEDLIST,
				param : reqData
			}, function(data) {
				if (data.length > 0) {
					$("#tbodycontent").empty().append($("#teachRoomTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
					//添加title
					common.titleInit();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();

			$("#query").click(function() {
				classroomlist.pagination.setParam(classroomlist.getQueryParam());
			});
			$("#isUsed").click(function() {
				classroomlist.pagination.setParam(classroomlist.getQueryParam());
			});
			// 点击TR触发选中状态
			$(document).on("click", ".tr-checkbox", function() {
				popup.setData("checkedVenue",this);
			});
			$("#campusId").change(function(){
				// 绑定建筑下拉框
				simpleSelect.loadAllBuilding("buildingId", $("#campusId").val(),{
					firstText : constant.SELECT_ALL,
					firstValue : ""
				});
			});
		},
		/**
		 * 获取查询条件
		 */
		getQueryParam : function() {
			var param=this.QueryParam;
			param.campusId = $("#campusId").val();
			param.buildingId = $("#buildingId").val();
			param.venueTypeCode = $("#venueTypeCode").val();
			param.minSeatNum = $("#minSeatNum").val();
			param.maxSeatNum = $("#maxSeatNum").val();
			param.isUsed = $("#isUsed").prop("checked") ? 0 : 1;
			return param;
		}
	};

	module.exports = classroomlist; // 与当前文件名一致
	window.classroomlist = classroomlist; // 根据文件夹名称一致
});