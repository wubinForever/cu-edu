/**
 * 环节成绩录入人设置
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var urlCousrsePlan = require("basePath/config/url.courseplan");
	var dataConstant = require("configPath/data.constant");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var pagination = require("basePath/utils/pagination");
	var urlstudent = require("configPath/url.studentarchives");// 学籍url
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var urlTrainplans = require("configPath/url.trainplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var dataDictionary = require("configPath/data.dictionary");

    /**
     * 环节成绩录入人设置
     */
    var tacheScoreEnterOperatorSet = {
        // 初始化
        init : function() {
        	//查询按钮
			$("#query").on("click",function(){
				//保存查询条件
				tacheScoreEnterOperatorSet.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
				tacheScoreEnterOperatorSet.getScoreNum();
			});
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester",
					urlData.COMMON_GETSEMESTERLIST, "", "", "");
			// 环节类别
			simpleSelect.loadDictionarySelect("tacheTypeCode",
					dataDictionary.TACHE_TYPE_CODE, {
						firstText : "全部",
						firstValue : ""
					});
			// 加载年级、院系、专业、班级
			tacheScoreEnterOperatorSet.loadAcademicYearAndRelation();
			//加载分页
			tacheScoreEnterOperatorSet.getTacheScoreSetPagedList();
			//设置分制
            $(document).on("click", "button[name='batchset']", function() {
            	 //如果没有勾选提示
                var trlength =$("#tbodycontent input[type='checkbox']:checked").length;
                if(trlength==0){
                	popup.warPop("请选择一个记录");
                	return false;
                }	
            	tacheScoreCreditRegimenSet.batchset(this);
            });
            //设置分制是否可修改
            $(document).on("click", "button[name='modify']", function() {
            	 //如果没有勾选提示
                var trlength =$("#tbodycontent input[type='checkbox']:checked").length;
                if(trlength==0){
                	popup.warPop("请选择一个记录");
                	return false;
                }	
            	tacheScoreCreditRegimenSet.modify(this);
            });
            // 设置-批量
            $(document).on("click", "button[name='setAll']", function() {
            	
            	 var length = $("input[name='checNormal']:checked").length;
            	 if(length==0){
        		 		popup.warPop("请先选择记录!");
    		 			return false;
            	 }
            	
                tacheScoreEnterOperatorSet.setAll(this);
            });
            // 设置-单个
            $(document).on("click", "button[name='set']", function() {
                tacheScoreEnterOperatorSet.set(this);
            });
            // 环节：下拉模糊查询
			/*var tacheInfo = new select({
				dom : $("#courseDiv"),
				param : {
					semeseter:$("#semester").val(),
					grade:$("#grade").val(),
					departmentId:$("#departmentId").val(),
					majorId:$("#majorId").val(),
					openDepartmentId : $("#openDepartmentId").val()
				},
				loadData : function() {
					return "";
				},
				onclick:function(){
					$("#courseId").val(tacheInfo.getValue());
				}
			}).init();*/
			
			//学期 、开课单位联动环节名称
			/*$("#majorId,#semester").change(function() {
				// 模糊查询
				tacheInfo.reload(tacheScoreEnterOperatorSet.getData(),"");
				$("#courseId").val("");
			});*/
			
			 //导出
            $(document).on("click", "button[name='export']", function() {
					ajaxData.exportFile(url.EXPORT_FILE,tacheScoreEnterOperatorSet.pagination.option.param);
			});
            tacheScoreEnterOperatorSet.getScoreNum();
        },
        
      //查询未设置的数量
		getScoreNum:function(){
			var req = {};
			req.semester = $("#semester").val();
			 ajaxData.request(url.GET_TACHE_SCORE_ENTRY_NUM,req,function(data){
  				if (data.code == config.RSP_SUCCESS){
  					 $("#total").text(data.data);
  				}
  			});
		},
        //加载数据
    /*    getData:function(){
        	
        	 var param = {
        			    semester:$("#semester").val(),
						grade:$("#grade").val(),
						departmentId:$("#departmentId").val(),
						majorId:$("#majorId").val(),
						openDepartmentId : $("#openDepartmentId").val()
				};
				var dataDom = [];
				ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
				ajaxData.request(url.GET_TACHE_ENTRY_SCORE_NAME, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						$.each(data.data, function(i, item) {
							var option = {
								value : item.value,
								name : item.name
							};
							dataDom.push(option);
						});
					}
				});
				return dataDom;
        	
        },*/
        //批量
        initbatch:function(){
        		//查询老师信息
        		tacheScoreEnterOperatorSet.getTeacherList();
        		//查询老师
			$('#btnSearch').on("click",function(){
				tacheScoreEnterOperatorSet.getTeacherList();
			})
        },
        
        //单个设置的时候将教师的信息携带过来
        initOperator:function(){
        	//获取任何教师信息
        	var teacherList = $(popup.data("obj")).attr("value");
        	if(teacherList && teacherList.length>0){
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
        	tacheScoreEnterOperatorSet.getTeacherList();
			//查询老师
			$('#btnSearch').on("click",function(){
				tacheScoreEnterOperatorSet.getTeacherList();
			})
        },
        
        //获取老师信息
        getTeacherList:function(){
        	var param = {};
        	var teacherNoAndName =$("#teacherNoAndName").val();
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
        
        /**
		 * 查询分页函数
		 */
        getTacheScoreSetPagedList:function(){
        	tacheScoreEnterOperatorSet.pagination = new pagination({
				id: "pagination", 
				url: url.GET_TACHE_SCORE_ENTRY_SET_PAGEDLIST, 
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
        	
        	tacheScoreEnterOperatorSet.getScoreNum();
		},
        
        /**
		 * 加载年级、院系、专业、班级 int类型默认为-1，如年级，String类型默认为空，如院系等
		 */
		loadAcademicYearAndRelation : function() {
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplans.GRADEMAJOR_GRADELIST,
					null, {
						firstText : dataConstant.SELECT_ALL,
						firstValue : "-1"
					});

			// 院系（从数据库获取数据）
			simpleSelect
					.loadSelect(
							"departmentId",
							urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
								isAuthority : true
							}, {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",
					urlTrainplans.GRADEMAJOR_MAJORLIST, null, {
						firstText : dataConstant.SELECT_ALL,
						firstValue : ""
					});
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						$("#classId").html(
								"<option value=''>" + dataConstant.SELECT_ALL
										+ "</option>");
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",
									urlTrainplans.GRADEMAJOR_MAJORLIST, null, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplans.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			// 院系联动专业
			$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						reqData.grade = $("#grade").val();

						$("#classId").html(
								"<option value=''>" + dataConstant.SELECT_ALL
										+ "</option>");
						if (utils.isEmpty($(this).val())
								&& utils.isNotEmpty($("#grade").val())
								&& $("#grade").val() == '-1') {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",
									urlTrainplans.GRADEMAJOR_MAJORLIST, null, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplans.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
		},
        
        
        /**
         * 教师选择-批量 弹窗
         */
        setAll: function(){
        	
           var mydialog = popup.open('./score/score/html/tacheScoreEnterOperatorBatchSet.html', // 这里是页面的路径地址
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
	                     iframe.$("body").append("<div class='loading'></div>");// 缓冲提示
	          		     iframe.$("body").append("<div class='loading-back'></div>");
	          		     this.button({name: '确定', disabled: true});
	          		     this.button({name: '取消', disabled: true});
	                   	 var reqre={};
	                   	 var tacheList = [];
	                   	 $("#tbodycontent input[type='checkbox']:checked").each(function(){
	                   		 var rep = {};
	                   		 rep.tacheScoreEnterId = $(this).attr("tacheScoreEnterId");
	                   		 rep.entryUserId = entryUserId;
	                   		 rep.grade = $(this).attr("grade");
	                   		 rep.courseId = $(this).attr("courseId");
	                   		 rep.academicYear = $(this).attr("academicYear");
	                   		 rep.semesterCode = $(this).attr("semesterCode");
	                   		 rep.groupNo = $(this).attr("groupNo");
	                   		 rep.majorId = $(this).attr("majorId");
	                   		 rep.id = $(this).attr("id");
	                   		 tacheList.push(rep);
	                   	 });
	          		     reqre.scoreSetListDto=tacheList;
	          		     ajaxData.contructor(true);
	                   	 ajaxData.setContentType("application/json;charset=utf-8");
                    	 ajaxData.request(url.BATCH_SAVE_ENTER_TACHE_USER,JSON.stringify(reqre),function(data){
             				if (data.code == config.RSP_SUCCESS){
             					mydialog.close();
             					ajaxData.setContentType("application/x-www-form-urlencoded");
             					tacheScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             					tacheScoreEnterOperatorSet.getScoreNum();
             					iframe.$(".loading,.loading-back").remove();
             				} else{
             					popup.errPop("保存失败");
             					iframe.$(".loading,.loading-back").remove();
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
             var courseId = $(obj).attr("courseId");//课程id
             var grade = $(obj).attr("grade");//年级
             var academicYear = $(obj).attr("academicYear");//学年学期
             var semesterCode = $(obj).attr("semesterCode");
        	 var groupNo = $(obj).attr("groupNo");
        	 var majorId = $(obj).attr("majorId");
        	 var tacheScoreEnterId = $(obj).attr("tacheScoreEnterId");
            var mydialog = art.dialog.open('./score/score/html/tacheScoreEnterOperatorSingleSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '教师选择',// 这是标题
                    width : 900,// 这是弹窗宽度。其实可以不写
                    height : 460,// 弹窗高度
                    okVal : '确定',
                    cancelVal : '取消',
                    ok : function(obj) {
                    	//拿到选中的值
                    	 var _this =obj.$("input[name='onReadio']:checked");
                    	 var param ={};
                    	 param.entryUserId = _this.attr("value");
                    	 param.courseId = courseId;//环节id
                    	 param.groupNo = groupNo;//小组号
                    	 param.grade = grade;//年级
                    	 param.academicYear = academicYear;//学年
                    	 param.semesterCode = semesterCode;//学期
                    	 param.majorId = majorId;
                    	 param.tacheScoreEnterId=tacheScoreEnterId;
                    	 //保存到数据库中
                    	 if(_this.length==0){
                    		 popup.warPop("请先选择教师!");
                    		 return false;
                    	 }
                    	 ajaxData.request(url.SAVE_ENTER_USER,param,function(data){
             				if (data.code == config.RSP_SUCCESS){
             					mydialog.close();
             					tacheScoreEnterOperatorSet.pagination.loadData();//局部刷新列表
             					tacheScoreEnterOperatorSet.getScoreNum();
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
    }
    module.exports = tacheScoreEnterOperatorSet;
    window.tacheScoreEnterOperatorSet = tacheScoreEnterOperatorSet;
});