/**
 * 成绩审核
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
    var dataConstant = require("configPath/data.constant");
    var simpleSelect = require("basePath/module/select.simple");
    var entryType = require("basePath/enumeration/score/EntryType");

    /**
     * 成绩审核列表
     */
    var scoreAuditList = {
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
			
			// 绑定开课单位下拉框
			simpleSelect.loadSelect("departmentId",
				urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
					isAuthority : false
				}, {
					firstText : dataConstant.SELECT_ALL, // 全部
					firstValue : "",
					async : false,
					length:12
			});
			
			// 录入方式
			simpleSelect.loadEnumSelect("entryType",entryType, {firstText:dataConstant.SELECT_ALL,firstValue:""});
        	
			// 成绩批量审核
            $(document).on("click", "[name='batchAudit']", function() {
            	var length = $("input[name='checNormal']:checked").length;
				/*var ids = [];*/
            	var list=[];
            	
				if(length==0){
					popup.warPop("至少选择一条数据");
					return false;
				}
				$("input[name='checNormal']:checked").each(function(){
					/*ids.push($(this).attr("combinationId"));*/
					
					var param = {};
	            	param.academicYear = $(this).attr("academicYear");
	            	param.semesterCode = $(this).attr("semesterCode");
	            	param.courseId = $(this).attr("courseId");
	            	param.entryUser = $(this).attr("entryUser");
	            	param.entryType = $(this).attr("entryType");
	            	param.isModify = $(this).attr("isModify");
	            	
	  		    	list.push(param);
				})
				
		    	popup.askPop('确定审核通过已选记录？',function(){
					ajaxData.contructor(false);
					ajaxData.setContentType("application/json;charset=utf-8");
				    ajaxData.request(urlScore.SCORE_APPROVAL,JSON.stringify(list),function(data){
				    	if(data.code==config.RSP_SUCCESS){
							// 提示成功
				    		popup.okPop("审核成功", function() { });
				    		scoreAuditList.pagination.loadData();
						}
						else{
							popup.errPop(data.msg,function(){});
						}
					},true);
		    	});
            });
			
            // 成绩审核
            $(document).on("click", "[name='audit']", function() {
            	scoreAuditList.audit(this);
            });
            // 成绩审核-修改
            $(document).on("click", "[name='modify']", function() {
            	scoreAuditList.modify(this);
            });
            
            //加载数据
            scoreAuditList.getPagedList();
            
            $("#query").click(function(){
            	//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				
				//保存查询条件
				scoreAuditList.pagination.setParam(requestParam);
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
			
			scoreAuditList.pagination = new pagination({
				id: "pagination", 
				url: urlScore.GET_SCORE_APPROVAL_PAGEDLIST, 
				param: requestParam
			},function(data){
				 if(data && data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
					 $("#pagination").show();
				 }else{
					 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
        /**
         * 成绩审核 弹窗
         */
        audit: function(obj){
        	popup.data("combinationId",$(obj).attr("combinationId"));
        	
        	popup.data("academicYear",$(obj).attr("academicYear"));
        	popup.data("semesterCode",$(obj).attr("semesterCode"));
        	popup.data("courseId",$(obj).attr("courseId"));
        	popup.data("entryUserId",$(obj).attr("entryUserId"));
        	popup.data("entryTypeId",$(obj).attr("entryType"));
        	popup.data("isModify",$(obj).attr("isModify"));
        	
        	popup.data("userNameOrNo",$(obj).parent().prev().prev().text());
        	popup.data("entryType",$(obj).parent().prev().prev().prev().text());
        	popup.data("courseNameOrNo",$(obj).parent().prev().prev().prev().prev().text());
        	
            art.dialog.open('./score/score/html/scoreAudit.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '成绩审核',// 这是标题
                    width : 1200,// 这是弹窗宽度。其实可以不写
                    height : 500,// 弹窗高度
                    okVal : '确定审核',
                    cancelVal : '取消',
                    ok : function() {
                    	/*var ids = [];
      				  	ids.push(popup.data("combinationId"));
      				    var reqData={ids:ids};*/
                    	var param = {};
                    	param.academicYear = popup.data("academicYear");
                    	param.semesterCode = popup.data("semesterCode");
                    	param.courseId = popup.data("courseId");
                    	param.entryUser = popup.data("entryUserId");
                    	param.entryType = popup.data("entryTypeId");
                    	param.isModify = popup.data("isModify");
                    	
                    	var list=[];
	      		    	list.push(param);
	      		    	
	      		    	
      					ajaxData.contructor(false);
      					ajaxData.setContentType("application/json;charset=utf-8");
      				    ajaxData.request(urlScore.SCORE_APPROVAL,JSON.stringify(list),function(data){
      				    	if(data.code==config.RSP_SUCCESS){
      							// 提示成功
      				    		popup.okPop("审核成功", function() { });
      				    		scoreAuditList.pagination.loadData();
      						}
      						else{
      							popup.errPop(data.msg,function(){});
      						}
      					},true);
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        },
        /**
         * 成绩审核-修改 弹窗
         */
        modify: function(obj){
        	popup.data("combinationId",$(obj).attr("combinationId"));
        	
        	popup.data("academicYear",$(obj).attr("academicYear"));
        	popup.data("semesterCode",$(obj).attr("semesterCode"));
        	popup.data("courseId",$(obj).attr("courseId"));
        	popup.data("entryUserId",$(obj).attr("entryUserId"));
        	popup.data("entryTypeId",$(obj).attr("entryType"));
        	popup.data("isModify",$(obj).attr("isModify"));
        	
        	popup.data("userNameOrNo",$(obj).parent().prev().prev().text());
        	popup.data("entryType",$(obj).parent().prev().prev().prev().text());
        	popup.data("courseNameOrNo",$(obj).parent().prev().prev().prev().prev().text());
        	
            art.dialog.open('./score/score/html/scoreAuditForModify.html', // 这里是页面的路径地址
                {
                    id : 'modify',// 唯一标识
                    title : '成绩审核',// 这是标题
                    width : 1400,// 这是弹窗宽度。其实可以不写
                    height : 500,// 弹窗高度
                    okVal : '确定审核',
                    cancelVal : '取消',
                    ok : function() {
                    	/*var ids = [];
      				  	ids.push(popup.data("combinationId"));
      				    var reqData={ids:ids};*/
                    	
                    	var param = {};
                    	param.academicYear = popup.data("academicYear");
                    	param.semesterCode = popup.data("semesterCode");
                    	param.courseId = popup.data("courseId");
                    	param.entryUser = popup.data("entryUserId");
                    	param.entryType = popup.data("entryTypeId");
                    	param.isModify = popup.data("isModify");
                    	
                    	var list=[];
	      		    	list.push(param);
	      		    	
      					ajaxData.contructor(false);
      					ajaxData.setContentType("application/json;charset=utf-8");
      				    ajaxData.request(urlScore.SCORE_APPROVAL,JSON.stringify(list),function(data){
      				    	if(data.code==config.RSP_SUCCESS){
      							// 提示成功
      				    		popup.okPop("审核成功", function() { });
      				    		scoreAuditList.pagination.loadData();
      						}
      						else{
      							popup.errPop(data.msg,function(){});
      						}
      					},true);
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        }

    }
    module.exports = scoreAuditList;
    window.scoreAudit = scoreAuditList;
});