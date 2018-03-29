/**
 * 成绩录入时间设置
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlScore = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	var isEnabled = require("basePath/enumeration/common/IsEnabled");
	var courseOrTache = require("basePath/enumeration/trainplan/CourseOrTache");
	var isHaveExam = require("basePath/enumeration/score/IsHaveExam");
	var isMarkUpExam = require("basePath/enumeration/score/IsMarkUpExam");
	var setupStatus = require("basePath/enumeration/score/SetupStatus");
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	//var base  =config.base;
	
	/**
	 * 成绩录入时间设置
	 */
	var scoreEnterTimeSetList = {
		// 初始化
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			var academicYearSemesterChange = function(academicYearSemester){
				if(academicYearSemester){
					var requestParames = {
						//学年
						academicYear: academicYearSemester.split("_")[0],
						//学期
						semesterCode: academicYearSemester.split("_")[1]
					};
				}
			}
			academicYearSemesterChange($("#academicYearSemesterSelect").val());
			$("#academicYearSemesterSelect").on("change", function(){
				academicYearSemesterChange($(this).val());
			});
			// 绑定是否已排考
			simpleSelect.loadEnumSelect("isHaveExam",isHaveExam);
			// 绑定是否补考
			simpleSelect.loadEnumSelect("isMarkUpExam",isMarkUpExam);
			// 绑定开课单位下拉框
			simpleSelect.loadSelect("departmentId",
				urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
					isAuthority : true
				}, {
					firstText : "全部",
					firstValue : "",
					async : false
				});
			// 绑定课程or环节
			simpleSelect.loadEnumSelect("courseOrTache",courseOrTache, {firstText:"全部",firstValue:""});
			// 绑定状态
			simpleSelect.loadEnumSelect("setupStatus",setupStatus, {firstText:"全部",firstValue:""});
			
			$("#examBatch").attr('disabled',"true");
			
			scoreEnterTimeSetList.getPagedList();
			
			// 设置
			$(document).on("click", "button[name='setOne']", function() {
				var ids = [];
				ids.push($(this).attr("courseId"));
				
				if($(this).parent().prev().prev().text() == ""){
					popup.data("beginTime"," ");
					popup.data("endTime"," ");
				}
				else{
					popup.data("beginTime",$(this).parent().prev().prev().text());
		        	popup.data("endTime",$(this).parent().prev().text());
				}
				
				scoreEnterTimeSetList.set(ids);
			});
			
			// 考试批次
			$("#isHaveExam").change(function(){
				if($("#isHaveExam").val() == "1"){
					$("#examBatch").removeAttr("disabled");
				}
				else{
					$("#examBatch").attr('disabled',"true");
				}
			});
			
			
			// 批量设置
			$(document).on("click", "button[name='set']", function() {
				var length = $("input[name='checNormal']:checked").length;
				
				if(length==0){
					popup.warPop("请先选择记录！");
					return false;
				}
				var ids = [];
				$("input[name='checNormal']:checked").each(function(){
					ids.push($(this).attr("id"));
				});
				
				if(ids.length == 1){
					if($("input[name='checNormal']:checked").parent().parent().next().next().next().next().text() == ""){
						popup.data("beginTime"," ");
						popup.data("endTime"," ");
					}
					else{
						popup.data("beginTime",$("input[name='checNormal']:checked").parent().parent().next().next().next().next().text());
			        	popup.data("endTime",$("input[name='checNormal']:checked").parent().parent().next().next().next().next().next().text());
					}
				}
				
				scoreEnterTimeSetList.set(ids);
			});
			
			$('#query').click(function() {
				if($("#isHaveExam").val() == "0"){
					//获取查询参数
					var requestParam = utils.getQueryParamsByFormId("queryForm");
					//学年
					requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
					//学期
					requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
					
					//保存查询条件
					scoreEnterTimeSetList.pagination.setParam(requestParam);
				}
				else{
					if($("#examBatch").val() == ""){
						popup.errPop("请先选择考试批次！");
					}
					else{
						//获取查询参数
						var requestParam = utils.getQueryParamsByFormId("queryForm");
						//学年
						requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
						//学期
						requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
						
						//保存查询条件
						scoreEnterTimeSetList.pagination.setParam(requestParam);
					}
				}
			});
			
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
		},
		//查询分页函数
		getPagedList:function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			
			scoreEnterTimeSetList.pagination = new pagination({
				id: "pagination", 
				url: urlScore.GET_SCORE_ENTER_LIST, 
				param: requestParam
			},function(data){
				 if(data && data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data,helper));
					 $("#pagination").show();
				 }else{
					 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
		/**
		 * 设置 弹窗
		 */
		set: function(ids){
			
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			//是否补考
			isMarkUpExam = requestParam.isMarkUpExam;
			
			popup.data("academicYear",academicYear);
			popup.data("semesterCode",semesterCode);
			popup.data("isMarkUpExam",isMarkUpExam);
			popup.data("courseIds",ids);
			
			popup.open('./score/paramSet/html/scoreEnterTimeSet.html', // 这里是页面的路径地址
				{
					id : 'set',// 唯一标识
					title : '成绩录入时间设置',// 这是标题
					width : 500,// 这是弹窗宽度。其实可以不写
					height : 250,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						var scoreEnterTimeSet = popup.data("scoreEnterTimeSet");
						var params = scoreEnterTimeSet.getParam();
						var academicYear = popup.data("academicYear");
						var semesterCode = popup.data("semesterCode");
						var isMarkUpExam = popup.data("isMarkUpExam");
						var courseIds = popup.data("courseIds");
						
						var v = scoreEnterTimeSet.valid();
						if(v){
							ajaxData.contructor(false);
							ajaxData.request(urlScore.SAVE_SCORE_ENTER_SETUP, {beginTime : params.beginTime,
									endTime : params.endTime,
									academicYear : academicYear,
									semesterCode : semesterCode,
									isMarkUpExam : isMarkUpExam,ids : courseIds},
								function(data) {
									if (data == null)
										return false;
									if (data.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("设置成功", function() {});
										ajaxData.setContentType("application/x-www-form-urlencoded");
										scoreEnterTimeSetList.pagination.loadData();
									} else {
										// 提示失败
										popup.errPop(data.msg);
										return false;
									}
								});
						}
						else{
							return false;
						}
					},
					cancel : function() {
						// 取消逻辑
					}
				});
		}

	}
	module.exports = scoreEnterTimeSetList;
	window.scoreEnterTimeSet = scoreEnterTimeSetList;
});
