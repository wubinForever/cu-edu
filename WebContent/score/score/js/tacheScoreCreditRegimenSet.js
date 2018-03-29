/**
 * 环节成绩分制
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var dataConstant = require("configPath/data.constant");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var pagination = require("basePath/utils/pagination");
	var urlstudent = require("configPath/url.studentarchives");// 学籍url
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var dataDictionary = require("configPath/data.dictionary");

	/**
	 * 环节成绩分制
	 */
	var tacheScoreCreditRegimenSet = {
		// 初始化
		init : function() {
             
			//查询按钮
			$("#query").on("click",function(){
				ajaxData.setContentType("application/x-www-form-urlencoded");
				//保存查询条件
				tacheScoreCreditRegimenSet.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
				//查询未设置的数量
				tacheScoreCreditRegimenSet.getTacheScoreNum();
			});
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester",
					urlData.COMMON_GETSEMESTERLIST, "", "", "");
			// 绑定开课单位下拉框
			var openDepartmentId = simpleSelect.loadSelect("openDepartmentId",
					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						firstText : "全部",
						firstValue : "",
						async : false
					});
			// 环节类别
			simpleSelect.loadDictionarySelect("tacheTypeCode",
					dataDictionary.TACHE_TYPE_CODE, {
						firstText : "全部",
						firstValue : ""
					});
			// 加载年级、院系、专业、班级
			tacheScoreCreditRegimenSet.loadAcademicYearAndRelation();
			//加载分页
			tacheScoreCreditRegimenSet.getTacheScoreSetPagedList();
			//设置分制
            $(document).on("click", "button[name='batchset']", function() {
            	 //如果没有勾选提示
                var trlength =$("#tbodycontent input[type='checkbox']:checked").length;
                if(trlength==0){
                	popup.warPop("请选择一个记录");
                	return false;
                }	
                var paramCopy = [];
                //获取页面上的值
                $("#tbodycontent input[type='checkbox']:checked").each(function(i,item){
    				var reqDataCopy ={};
    				reqDataCopy.courseId=$(this).attr("courseid");//班级id
    				reqDataCopy.classId=$(this).attr("classid");//班级id
    				reqDataCopy.academicYear=$(this).attr("academicyear");//学年id
    				reqDataCopy.semesterCode=$(this).attr("semestercode");//学期
    				paramCopy.push(reqDataCopy);
    		    });
                var reqre={};
 				reqre.scoreSetListDto=paramCopy;
	 	       	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
	 	        ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(url.CHECK_TACHE_RELEVANCE, JSON.stringify(reqre), function(data) {
					if(data.data == true){
						 	popup.warPop("此班级已录入环节成绩，不能修改环节分制!");
						 	return false;
					}else{
						tacheScoreCreditRegimenSet.batchset(this);
					}
				});
                
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
            // 环节：下拉模糊查询
			/*var tacheInfo = new select({
				dom : $("#courseDiv"),
				param : {
					openDepartmentId : $("#openDepartmentId").val(),
					semeseter:$("#semester").val()
				},
				loadData : function() {
					return tacheScoreCreditRegimenSet.getData("")
				},
				onclick : function(){
					$("#courseId").val(tacheInfo.getValue());
				}
			}).init();*/
			// 开课单位联动环节名称
			/*$("#openDepartmentId").change(function() {
				// 模糊查询
				tacheInfo.reload(tacheScoreCreditRegimenSet.getData(),"");
				$("#courseId").val("");
			});*/
			//学年学期，联动
			//$("#semester").change(function(){
				//开课单位
				/* simpleSelect.loadSelect("departmentId",
							urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
								isAuthority : true
							}, {
								firstText : "全部",
								firstValue : "",
								async : false
							});*/
				 //$("#openDepartmentId").change();
			//});
		},
		
		
		/**
		 * 环节下拉模糊搜索
		 */
		/*getData:function(){
			
			   var param = {
					  openDepartmentId : $("#openDepartmentId").val(),
					  semester : $("#semester").val()
				};
				var dataDom = [];
				ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
				ajaxData.request(url.GET_TACHE_SCORE_NAME, param, function(data) {
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
		
		/**
		 * 分制名称
		 */
		initAdd:function(){
			//进来加载成绩分制
        	simpleSelect.loadSelect("scoreRegimenName",url.GET_SCORE_REGIMEN_LIST,{},{firstText:"--请选择--",firstValue:""});
		},
		/**
		 * 查询分页函数
		 */
		getTacheScoreSetPagedList:function(){
			//ajaxData.setContentType("application/x-www-form-urlencoded");
			tacheScoreCreditRegimenSet.pagination = new pagination({
				id: "pagination", 
				url: url.GET_TACHE_SCORE_SET_PAGEDLIST, 
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
			tacheScoreCreditRegimenSet.getTacheScoreNum();
		},
		
		//查询未设置的数量
		getTacheScoreNum:function(){
			ajaxData.setContentType("application/x-www-form-urlencoded");
			var req = {};
			req.semester = $("#semester").val();
			 ajaxData.request(url.GET_TACHE_SCORE_NUM,req,function(data){
  				if (data.code == config.RSP_SUCCESS){
  					 $("#total").text(data.data);
  				}
  			});
		},
		
		/**
		 * 加载年级、院系、专业、班级 int类型默认为-1，如年级，String类型默认为空，如院系等
		 */
		loadAcademicYearAndRelation : function() {
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,
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
								isAuthority : false
							}, {
								firstText : dataConstant.SELECT_ALL,
								firstValue : ""
							});
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",
					urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
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
									urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
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
									urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
			// 专业联动班级
			$("#majorId").change(
					function() {
						var reqData = {};
						reqData.majorId = $(this).val();
						reqData.grade = $("#grade").val();
						if (utils.isEmpty($(this).val())) {
							$("#classId").html(
									"<option value=''>"
											+ dataConstant.SELECT_ALL
											+ "</option>");
							return false;
						}
						simpleSelect.loadSelect("classId",
								urlstudent.CLASS_GET_CLASSSELECTBYQUERY,
								reqData, {
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
					});
		},
		  
        /**
         * 设置分制是否可修改
         */
        modify: function(){
        	
           var mydialog = art.dialog.open('./score/score/html/tacheScoreConstitutionModifyList.html', // 这里是页面的路径地址
                {
                    id : 'modifys',// 唯一标识
                    title : '分制修改设置',// 这是标题
                    width : 500,// 这是弹窗宽度。其实可以不写
                    height : 100,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function(obj) {
                    var paramCopy = [];
                	var isallowModify= obj.$("#report").prop("checked");
                	var allowModify =enableChanges.NotAllow.value;
                	if(isallowModify){
                		allowModify=enableChanges.Allow.value;
                	}
                    //获取页面上的值
                    $("#tbodycontent input[type='checkbox']:checked").each(function(i,item){
        				var reqDataCopy ={};
        				reqDataCopy.courseId=$(this).attr("courseid");//班级id
        				reqDataCopy.classId=$(this).attr("classid");//班级id
        				reqDataCopy.academicYear=$(this).attr("academicyear");//学年id
        				reqDataCopy.semesterCode=$(this).attr("semestercode");//学期
        				reqDataCopy.allowModify=allowModify;
        				paramCopy.push(reqDataCopy);
        		    });
                    var reqre={};
        		    reqre.scoreSetListDto=paramCopy;
                	ajaxData.contructor(false);
                    ajaxData.setContentType("application/json;charset=UTF-8");
                	ajaxData.request(url.UPDATE_ALLOW_MODIFY,JSON.stringify(reqre),function(data){
          		    	if(data.code==config.RSP_SUCCESS)
          		    	{
          		    		mydialog.close();//关窗
          		    		popup.okPop("保存成功",function(){
          					});
          		    		ajaxData.setContentType("application/x-www-form-urlencoded");
          		    		tacheScoreCreditRegimenSet.pagination.loadData();
          		    		//查询未设置的数量
          					tacheScoreCreditRegimenSet.getTacheScoreNum();
          				}
          			});
                    return false;
                    },
                    cancel : function() {
                    }
                });
        },
        
        //批量设置分制
        batchset: function(obj){
           var mydialog = art.dialog.open('./score/score/html/tacheScoreRegimenSet.html',
                {
                    id : 'set',// 唯一标识
                    title : '设置分制',// 这是标题
                    width : 500,// 这是弹窗宽度。其实可以不写
                    height : 100,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function(obj) {
                        var paramCopy = [];
                        var scoreRegimenName =obj.$("#scoreRegimenName").val();
                        if(utils.isEmpty(scoreRegimenName)){
                        	popup.warPop("请选择分制");
                        	return false;
                        }
                        //获取页面上的值
                        $("#tbodycontent input[type='checkbox']:checked").each(function(i,item){
            				var reqDataCopy ={};
            				reqDataCopy.courseId=$(this).attr("courseid");//班级id
            				reqDataCopy.classId=$(this).attr("classid");//班级id
            				reqDataCopy.academicYear=$(this).attr("academicyear");//学年id
            				reqDataCopy.semesterCode=$(this).attr("semestercode");//学期
            				reqDataCopy.scoreRegimenId=scoreRegimenName;
            				paramCopy.push(reqDataCopy);
            		    });
                        var reqre={};
            		    reqre.scoreSetListDto=paramCopy;
                    	ajaxData.contructor(false);
                        ajaxData.setContentType("application/json;charset=UTF-8");
                    	ajaxData.request(url.SAVE_TACHE_SCORE_SET,JSON.stringify(reqre),function(data){
                    		ajaxData.setContentType("application/x-www-form-urlencoded");
              		    	if(data.code==config.RSP_SUCCESS)
              		    	{
              		    		mydialog.close();//关窗
              		    		popup.okPop("保存成功",function(){
              					});
              		    		tacheScoreCreditRegimenSet.pagination.loadData();
              		    		//查询未设置的数量
              					tacheScoreCreditRegimenSet.getTacheScoreNum();
              				}else{
              					if(data.code==config.RSP_WARN){
          							 popup.warPop(data.msg);
          						}else{
          							 popup.errPop("保存失败");
          						}
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
	module.exports = tacheScoreCreditRegimenSet;
	window.tacheScoreCreditRegimenSet = tacheScoreCreditRegimenSet;
});