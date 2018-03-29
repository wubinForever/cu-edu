/**
 * 课程成绩录入人设置
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
	var urlTrainPlan = require("basePath/config/url.trainplan");
	var urlCousrsePlan = require("basePath/config/url.courseplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    /**
     * 课程成绩录入人设置
     */
    var courseScoreEnterOperatorSet = {
        // 初始化
        init : function(){
        	// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
			courseScoreEnterOperatorSet.getCourseScoreEnTerPagedList();
			// 绑定开课单位下拉框
			var openDepartmentId = simpleSelect.loadSelect("departmentId",
					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						firstText : "全部",
						firstValue : "",
						async : false
					});
        	
			// 学期变化，教学班变化
			$("#semester").change(function(){
				 $("#departmentId").change();
			});
			// 课程：下拉模糊查询
			var courseInfo = new select({
				dom : $("#courseDiv"),
				param : {
					departmentId : $("#departmentId").val()
				},
				loadData : function() {
					return [];
				},
				onclick : courseScoreEnterOperatorSet.initTeachingClass
			}).init();
			this.courseInfoSelect = courseInfo;
			// 开课单位联动课程
			$("#departmentId").change(function() {
				// 模糊查询
				$(".toggle-select").val("数据正在加载中...");
				courseScoreEnterOperatorSet.getData();
				$("#teachingClassNo").html("<option value=''>全部</option>");
				$(".toggle-select").val("");
				$("#courseId").val("");
			});
			// 课程联动教学班号
			$("#courseDiv").change(function(){
				courseScoreEnterOperatorSet.initTeachingClass(courseInfo.getValue());
			});
            // 设置-批量
            $(document).on("click", "button[name='setAll']", function(){
        	   var trlength = $("#tbodycontent input[type='checkbox']:checked").length;
               if(trlength==0){
              	popup.warPop("请选择一个记录");
              	return false;
               }	
            	courseScoreEnterOperatorSet.setAll(this);
            });
            // 设置-单个
            $(document).on("click", "button[name='set']", function(){
                courseScoreEnterOperatorSet.set(this);
            });
            //查询
            $('#query').on("click",function(){
            	ajaxData.setContentType("application/x-www-form-urlencoded");
            	//保存查询条件
            	var param = utils.getQueryParamsByFormId("queryForm");
            	
            	var courseName =  $('.toggle-select').val();
			  	if(utils.isEmpty(courseName)){
			  		param.courseId ="";//插件有问题是个坑
			  	}else{
			  		param.courseId = $("#courseId").val();//插件有问题是个坑
			  	}
            	courseScoreEnterOperatorSet.pagination.setParam(param);
            	courseScoreEnterOperatorSet.getScoreNum();
            })
            //导出
            $(document).on("click", "button[name='export']", function() {
					ajaxData.exportFile(url.EXPORT,courseScoreEnterOperatorSet.pagination.option.param);
			});
        },
        
        //批量
        initbatch:function(){
        	//查询老师信息
        	courseScoreEnterOperatorSet.getTeacherList();
			//查询老师
			$('#btnSearch').on("click",function(){
				courseScoreEnterOperatorSet.getTeacherList();
			})
        },
        //单个
        initOperator:function(){
        	//获取任何教师信息
        	var teacherList = $(popup.data("obj")).attr("value");
        	if(teacherList.length>0){
        		var teachers = teacherList.split('、');
            	var htmlStr="";
            
            	for(var i =0 ;i<teachers.length;i++)
            	{
            		var teacherNo =teachers[i].substr(0,teachers[i].indexOf(']')+1);
            		htmlStr+="<label class='radio-inline'><div class='radio-con'><input type='radio' name='onReadio' value='"+teacherNo+"'></div>"+teachers[i]+"</label>";
            	}
            	$('.form-inline').append(htmlStr);
        	}
        	//查询老师信息
        	courseScoreEnterOperatorSet.getTeacherList();
			//查询老师
			$('#btnSearch').on("click",function(){
				courseScoreEnterOperatorSet.getTeacherList();
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
					 $("#bodycontent").removeClass("no-data-html").empty().append($("#tbodyContentImpl").tmpl(data.data));
				 }else 
				 {
					 $("#bodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				//初始化选中单选框
	        	utils.isRadio();
			});
        },
        
        /**
		 * 教学班查询条件初始化
		 * 
		 */
		initTeachingClass : function(courseId) {
			$("#courseId").val(courseId);
			// 课程联动教学班
			var reqData = {};
			reqData.courseId = courseId;
			reqData.semester=$("#semester").val();
			if (utils.isEmpty(courseId)) {
				$("#teachingClassNo").html("<option value=''>全部</option>");
				return false;
			}
			simpleSelect.loadSelect("teachingClassNo", url.GET_TASKNO_SELECT_LIST,reqData,{firstText:"全部",firstValue:""});
		},
		
		/**
		 * 得到课程数据
		 * 
		 */
		getData : function() {
			var param = {
				openDepartmentId : $("#departmentId").val(),
				semester : $("#semester").val(),
				isAuthority:true
			};
			var dataDom = [];
			var me = this;
			var departmentId = $("#departmentId").val();
			if(utils.isEmpty(departmentId)){
				me.courseInfoSelect.reload(dataDom);
				return ;
			}
			ajaxData.contructor(true); //异步
			ajaxData.request(url.GET_COURSE_SELECT_LIST, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.value,
							name : item.name
						};
						dataDom.push(option);
					});
					me.courseInfoSelect.reload(dataDom);
				}
			});
		},
		
		/**
		 * 查询分页函数
		 */
        getCourseScoreEnTerPagedList:function(){
        	ajaxData.setContentType("application/x-www-form-urlencoded");
        	courseScoreEnterOperatorSet.pagination = new pagination({
				id: "pagination", 
				url: url.GET_COURSE_SCORE_ENTRY_PAGEDLIST, 
				param: {semester:$("#semester").val()}
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
        	//查询未设置的数量
        	courseScoreEnterOperatorSet.getScoreNum();
		},
		
		//查询未设置的数量
		getScoreNum:function(){
			var req = {};
			req.semester = $("#semester").val();
			 ajaxData.request(url.GET_SCORE_ENTRY_USERID_NOSET_NUM,req,function(data){
  				if (data.code == config.RSP_SUCCESS){
  					 $("#total").text(data.data);
  				}
  			});
		},
		
        /**
         * 教师选择-批量 弹窗
         */
        setAll: function(){
           var mydialog = popup.open('./score/score/html/courseScoreEnterOperatorBatchSet.html', // 这里是页面的路径地址
                {
                    id : 'setAll',// 唯一标识
                    title : '教师选择',// 这是标题
                    width : 900,// 这是弹窗宽度。其实可以不写
                    height : 460,// 弹窗高度
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
	                   		 rep.id = $(this).attr("id");
	                   		 rep.courseId = $(this).attr("courseId");
	                   		 rep.classId =$(this).attr("classId");
	                   		 rep.academicYear = $(this).attr("academicYear");
	                   		 rep.semesterCode = $(this).attr("semesterCode");
	                   		 rep.scoreType = 1;//首选
	                   		 courseList.push(rep);
	                   	 });
	          		     reqre.scoreSetListDto=courseList;
	          		     // ajax提示错误前会自动关闭弹框
	          		     iframe.$("body").append("<div class='loading'></div>");//缓冲提示
	          		     iframe.$("body").append("<div class='loading-back'></div>");		
		          		 this.button({name: '确定', disabled: true});
		          		 this.button({name: '取消', disabled: true});
		          		 ajaxData.contructor(true);
	                   	 ajaxData.setContentType("application/json;charset=utf-8");
                    	 ajaxData.request(url.BATCH_SAVE_ENTERUSER,JSON.stringify(reqre),function(data){
                    		ajaxData.setContentType("application/x-www-form-urlencoded");
             				if (data.code == config.RSP_SUCCESS){
             					iframe.$(".loading,.loading-back").remove();
             					mydialog.close();
             					courseScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             					courseScoreEnterOperatorSet.getScoreNum();
             				} else{
             					iframe.$(".loading,.loading-back").remove();
             					popup.errPop("保存失败");
             				}
             			});
                        return false;
                    },
                    cancel : function() {
                    }
                });
        },
        
        /**
         * 教师选择-单个 弹窗
         */
        set: function(obj){
        	
        	 popup.data("obj",obj);//传对象过去
             var courseId = $(obj).attr("courseId");
             var classId = $(obj).attr("classId");
             var academicYear = $(obj).attr("academicYear");
             var semesterCode = $(obj).attr("semesterCode");
        	
             var mydialog = art.dialog.open('./score/score/html/courseScoreEnterOperatorSingleSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '教师选择',// 这是标题
                    width : 900,// 这是弹窗宽度。其实可以不写
                    height : 460,// 弹窗高度
                    okVal : '确定',
                    cancelVal : '取消',
                    ok : function(iframe) {
                    	//拿到选中的值
                    	var _this =iframe.$("input[name='onReadio']:checked");
                    	 var param ={};
                    	 param.entryUserId = _this.attr("value");
                    	 param.courseScoreSetId = $(obj).attr("courseScoreSetId");
                    	 param.courseId = courseId;
                    	 param.classId = classId;
                    	 param.academicYear = academicYear;
                    	 param.semesterCode = semesterCode;
                    	 param.scoreType = 1;
                    	 //保存到数据库中
                    	 if(_this.length==0){
                    		 popup.warPop("请先选择教师!");
                    		 return false;
                    	 }
                    	 ajaxData.request(url.SAVE_ENTERUSER,param,function(data){
             				if (data.code == config.RSP_SUCCESS){
             					mydialog.close();
             					courseScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             					courseScoreEnterOperatorSet.getScoreNum();
             				} else{
             					popup.errPop("保存失败");
             				}
             			});
                        return false;
                    },
                    cancel : function() {
                    }
                });
        }

    }
    module.exports = courseScoreEnterOperatorSet;
    window.courseScoreEnterOperatorSet = courseScoreEnterOperatorSet;
});