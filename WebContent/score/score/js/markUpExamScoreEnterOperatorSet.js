/**
 * 补考成绩录入人设置
 */
define(function(require, exports, module) {
	    var utils = require("basePath/utils/utils");
	    var ajaxData = require("basePath/utils/ajaxData");
	    var config = require("basePath/utils/config");
	    var url = require("configPath/url.score");
	    var urlData = require("configPath/url.data");
	    var urlUdf = require("configPath/url.udf");
	    var dataConsTant = require("configPath/data.constant");
	    var pagination = require("basePath/utils/pagination");
	    var popup = require("basePath/utils/popup");
	    var common = require("basePath/utils/common");
	    var ve = require("basePath/utils/validateExtend");
	    var urlCousrsePlan = require("basePath/config/url.courseplan");
		var urlTrainPlan = require("basePath/config/url.trainplan");
		var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
		var ve = require("basePath/utils/validateExtend");
		var enableChanges = require("basePath/enumeration/score/EnableChanges");
	    var select = require("basePath/module/select");
	    var simpleSelect = require("basePath/module/select.simple");

    /**
     * 补考成绩录入人设置
     */
    var markUpExamScoreEnterOperatorSet = {
        // 初始化
        init : function() {
        	
            //设置
            $(document).on("click", "button[name='set']", function() {
                markUpExamScoreEnterOperatorSet.set(this);
            });
            
            //批量设置
            $(document).on("click", "button[name='batchset']", function() {
            	 var length = $("input[name='checNormal']:checked").length;
	   		      if(length==0){
	   			   popup.warPop("请先选择记录!");
	   			   return false;
	   		      }
                markUpExamScoreEnterOperatorSet.batchSet(this);
            });
            
            //查询按钮
			$("#query").on("click",function(){
				
				var semester = $("#semester").val();
				//保存查询条件
				var param = utils.getQueryParamsByFormId("queryForm");
				param.studyAcademicYear = semester.split("_")[0];
				param.studySemesterCode = semester.split("_")[1];
				markUpExamScoreEnterOperatorSet.pagination.setParam(param);
				markUpExamScoreEnterOperatorSet.getMarkUpEntryUserIdNoSetNum();
				
			});
            
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
			
			// 绑定开课单位下拉框
			var openDepartmentId = simpleSelect.loadSelect("openDepartmentId",
					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						firstText : "全部",
						firstValue : "",
						async : false
					});
			
			 //课程成绩构成设置分页查询
			markUpExamScoreEnterOperatorSet.getMarkupScoreSetPagedList();
			
			  //导出
            $(document).on("click", "button[name='export']", function() {
					ajaxData.exportFile(url.GET_EXPORT,markUpExamScoreEnterOperatorSet.pagination.option.param);
			});
        },
        
        initAddTeacher:function(){
        	//查询老师信息
        	markUpExamScoreEnterOperatorSet.getTeacherList();
			//查询老师
			$('#btnSearch').on("click",function(){
				markUpExamScoreEnterOperatorSet.getTeacherList();
			})
        },
        
        
        //获取老师信息
        getTeacherList:function(){
        	var param = {};
        	var teacherNoAndName =$("#teacherNameAndTeacherNo").val();
        	param.teacherNoAndName = teacherNoAndName;
        	param.isOrder = true;
        	ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(urlCousrsePlan.COMMON_TEACHERINFO_GETLIST,JSON.stringify(param), function(data) {
				
				if(data.data && data.data.length != 0){
					 $("#bodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
				 }else 
				 {
					 $("#bodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				//初始化选中单选框
	        	utils.isRadio();
			});
        },
       
        //查询未设置的数量
        getMarkUpEntryUserIdNoSetNum:function(){
			var req = {};
			var semester = $("#semester").val();
			req.studyAcademicYear = semester.split("_")[0];
			req.studySemesterCode = semester.split("_")[1];
			
			 ajaxData.request(url.GET_MARKUP_ENTRY_USER_ID_NOSETNUM,req,function(data){
  				if (data.code == config.RSP_SUCCESS){
  					 $("#total").text(data.data);
  				}
  			});
		},
        
        getMarkupScoreSetPagedList:function(){
        	
        	var semester = $("#semester").val();
        	var studyAcademicYear = semester.split("_")[0];
        	var studySemesterCode = semester.split("_")[1];
        	markUpExamScoreEnterOperatorSet.pagination = new pagination({
				id: "pagination", 
				url: url.GET_MARKUP_SCORE_ENTRY_USER_LIST, 
				param: {studyAcademicYear:studyAcademicYear,studySemesterCode:studySemesterCode}
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else 
				 {
					$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
        	markUpExamScoreEnterOperatorSet.getMarkUpEntryUserIdNoSetNum();
        },
        
        //单个
        set: function(obj){
        	  var courseId = $(obj).attr("courseId");
              //var classId = $(obj).attr("classId");
              var academicYear = $(obj).attr("academicYear");
              var semesterCode = $(obj).attr("semesterCode");
           var mydialog= art.dialog.open('./score/score/html/markUpExamScoreEnterOperatorSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '教师选择',// 这是标题
                    width : 900,// 这是弹窗宽度。其实可以不写
                    height : 330,// 弹窗高度
                    okVal : '确定',
                    cancelVal : '取消',
                    ok : function(iframe) {
                    	 //拿到选中的值
                    	 var _this =iframe.$("input[name='onReadio']:checked");
                    	 var param ={};
                    	 param.entryUserId = _this.attr("value");
                    	 param.courseScoreSetId = $(obj).attr("courseScoreSetId");
                    	 param.courseId = courseId;
                    	// param.classId = classId;
                    	 param.academicYear = academicYear;
                    	 param.semesterCode = semesterCode;
                    	 param.scoreType = 2;
                    	 //保存到数据库中
                    	 if(_this.length==0){
                    		 popup.warPop("请先选择教师!");
                    		 return false;
                    	 }
                    	 ajaxData.request(url.SAVE_ENTERUSER,param,function(data){
             				if (data.code == config.RSP_SUCCESS){
             					mydialog.close();
             					markUpExamScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             		        	markUpExamScoreEnterOperatorSet.getMarkUpEntryUserIdNoSetNum();
             				} else{
             					popup.errPop("保存失败");
             				}
             			});
                        return false;
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        },

        //批量
        batchSet: function(){
        	var mydialog=  popup.open('./score/score/html/markUpExamScoreEnterOperatorSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '教师选择',// 这是标题
                    width : 900,// 这是弹窗宽度。其实可以不写
                    height : 330,// 弹窗高度
                    okVal : '确定',
                    cancelVal : '取消',
                    ok : function(iframe) {
                    	var param ={};
                    	//拿到选中的值
                    	var _this =iframe.$("input[name='onReadio']:checked");
                    	var entryUserId = _this.attr("value");//拿到选中的值
                    	 //保存到数据库中
	                   	 if(_this.length==0){
	                   		 popup.warPop("请先选择教师!");
	                   		 return false;
	                   	 }
	                   	 var reqre={};
	                   	 var courseList = [];
	                   	 $("#tbodycontent input[type='checkbox']:checked").each(function(){
	                   		 var rep = {};
	                   		 rep.courseScoreSetId = $(this).attr("courseScoreSetId")
	                   		 rep.entryUserId = entryUserId;
	                   		 rep.courseId = $(this).attr("courseId");
	                   		// rep.classId =$(this).attr("classId");
	                   		 rep.academicYear = $(this).attr("academicYear");
	                   		 rep.semesterCode = $(this).attr("semesterCode");
	                   		 rep.scoreType = 2;//
	                   		 courseList.push(rep);
	                   	 });
	          		     reqre.scoreSetListDto=courseList;
	          		     iframe.$("body").append("<div class='loading'></div>");// 缓冲提示
	          		     iframe.$("body").append("<div class='loading-back'></div>");
	          		     this.button({name: '确定', disabled: true});
	          		     this.button({name: '取消', disabled: true});
	          		     ajaxData.contructor(true);
	                   	 ajaxData.setContentType("application/json;charset=utf-8");
                    	 ajaxData.request(url.BATCH_MARK_UP_SAVEN_ENTRY_USER,JSON.stringify(reqre),function(data){
                    		 ajaxData.setContentType("application/x-www-form-urlencoded");
             				if (data.code == config.RSP_SUCCESS){
             					iframe.$(".loading,.loading-back").remove();
             					mydialog.close();
             					markUpExamScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             					//
             		        	markUpExamScoreEnterOperatorSet.getMarkUpEntryUserIdNoSetNum();
             				} else{
             					iframe.$(".loading,.loading-back").remove();
             					popup.errPop("保存失败");
             				}
             			});
                        return false;
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        }
        
    }
    module.exports = markUpExamScoreEnterOperatorSet;
    window.markUpExamScoreEnterOperatorSet = markUpExamScoreEnterOperatorSet;
});