/**
 * 按院系统计在校学生数
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var common = require("basePath/utils/common");
	var helper = require("basePath/utils/tmpl.helper");
	var CONSTANT = require("basePath/config/data.constant");
	var base = config.base;
	/**
	 * 按院系统计在校学生数
	 */
	var numofdeptlist = {	
		// 初始化
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			var academicYearSemesterChange = function(academicYearSemester){
				if(!academicYearSemester){
		    	   $("#grade").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return;
				}
				
				var requestParames = {
					//学年
					academicYear: academicYearSemester.split("_")[0],
					//学期
					semesterCode: academicYearSemester.split("_")[1]
				};
				// 年级（从数据库获取数据）
				simpleSelect.loadSelect("grade", URL_STUDENTARCHIVES.ARCHIVESREGISTER_GETGRADESINSCHOOL,requestParames, {firstText : CONSTANT.SELECT_ALL,firstValue : ""},{async:false});	
			}
			academicYearSemesterChange($("#academicYearSemesterSelect").val());
			$("#academicYearSemesterSelect").on("change", function(){
				academicYearSemesterChange($(this).val());
			});
			
			var gradeId = "", departmentId = "", majorId = "";
			
		    gradeId = $("#grade");
		    

			numofdeptlist.loadNumOfDeptList();
			
			// 查询
			$("#query").click(function() {
				 numofdeptlist.loadNumOfDeptList();
				 $("#semesterName").text($("#academicYearSemesterSelect").find("option:selected").text());
			});
			
			//绑定导出
			$(document).on("click", "#export", function() {
				ajaxData.exportFile(URL_STUDENTARCHIVES.STUDENTNUMBEROFDEPARTMENT_EXPORT, numofdeptlist.getQueryParams(true));
			});
			
			numofdeptlist.initSchoolInfo();
			$("#semesterName").text($("#academicYearSemesterSelect").find("option:selected").text());
		},
		getQueryParams: function(getCachedParams){
			var params = $('#queryForm').data("data-query-params");
			if(!params || !getCachedParams){
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				//学年学期名称
				requestParam.academicYearSemesterName = $("#academicYearSemesterSelect").find("option:selected").text();
				//缓存查询参数
				$('#queryForm').data("data-query-params", requestParam);
				return requestParam;
			}
			return params;
		}, 
		/**
		 * 初始化学校数据
		 */
		initSchoolInfo:function(){
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {					
					$("#schoolName").text(data.data.schoolName+"在校学生人数统计");
				} else {
					return false;
				}				
			});
		},
    /**
     * 计算表格相应列之和
     */
    totalTable:function(table,start){ 
         table.append("<tr><td class='width20'>总计</td></tr>");
         var cells =  table.find("tr").eq(start).children("td").length;
         for(var i =1;i<cells;i++){
             calcTotal(table,i,start);
         }
         
        function calcTotal(table,column,start){
         var total=0;
         var trs=table.find('tr');
         var start=start,//忽略第一行的表头
         end=trs.length-1;//忽略最后合计的一行

         for(var i=start;i<end;i++){
            var td=trs.eq(i).find('td').eq(column);
            var t=parseFloat(td.text());
            if(t)total+=t;
         }
         var td = $("<td></td>");
         td.attr("title",total); 
         trs.eq(end).append(td);
         trs.eq(end).find('td').eq(column).text(total);
      }
    },

    /**
	 * 加载在校学生人数(按院系统计)
	 */
	loadNumOfDeptList : function(){
 	var requestData = numofdeptlist.getQueryParams();
 	ajaxData.request(URL_STUDENTARCHIVES.STUDENTNUMBEROFDEPATMENT_GETLIST,requestData,function(data){
 		if(data.data.length > 0){
 			if(!$("input[name=containTrainingLevel]").is(':checked')){
			$("#tableone").hide();
			$("#tabletwo").show();
			appendData(data,"#tbodycontenttwo","#theadcontenttwo","#bodyContentImplTwo","#bodyHeadImplTwo");
			numofdeptlist.totalTable($("#tabletwo"),1);
		 }else{
		    $("#tableone").show();
			$("#tabletwo").hide();
			appendData(data,"#tbodycontentone","#theadcontentone","#bodyContentImplOne","#bodyHeadImplOne");
			numofdeptlist.totalTable($("#tableone"),2);
		 }
 		}else{
 			$(".table-box").addClass("no-data-html")
 		}
 		
 	}, true);

       
     /**
     * 填充数据通用方法
     */
      function appendData(data,tbodyparam,theadparm,bodytmpl,headtmpl){

          if (data.code == config.RSP_SUCCESS) {
              
                $(tbodyparam).empty().append($(bodytmpl).tmpl(data.data,helper)).removeClass("no-data-html");
                $(theadparm).empty().append($(headtmpl).tmpl(data.data)).removeClass("no-data-html");
         }
      }

		}
	}
	module.exports = numofdeptlist;
	window.numofdeptlist = numofdeptlist;
});
