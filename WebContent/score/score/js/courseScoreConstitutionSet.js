/**
 * 课程成绩构成设置
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
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var scoreType = require("basePath/enumeration/score/ScoreType");
    var base  =config.base;

    /**
     * 课程成绩构成设置
     */
    var courseScoreConstitutionSet = {
        // 初始化
        init : function() {
        	//查询按钮
			$("#query").on("click",function(){
				ajaxData.setContentType("application/x-www-form-urlencoded");
				//保存查询条件
				var param = utils.getQueryParamsByFormId("queryForm");
			  	var courseName =  $('.toggle-select').val();
			  	if(utils.isEmpty(courseName)){
			  		param.courseId ="";//插件有问题是个坑
			  	}else{
			  		param.courseId = $("#courseId").val();//插件有问题是个坑
			  	}
				courseScoreConstitutionSet.pagination.setParam(param);
				//查询未设置的数量
				courseScoreConstitutionSet.getScoreNum();
			});
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
			 //课程成绩构成设置分页查询
        	courseScoreConstitutionSet.getCourseScoreSetPagedList();
			// 绑定开课单位下拉框
			var openDepartmentId = simpleSelect.loadSelect("departmentId",
					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						firstText : "全部",
						firstValue : "",
						async : false
					});

			// 课程：下拉模糊查询
			var courseInfo = new select({
				dom : $("#courseDiv"),
				param : {
					departmentId : $("#departmentId").val(),
					semester : $("#semester").val()
				},
				loadData : function(){
					return [];
				},
				onclick : courseScoreConstitutionSet.initTeachingClass
			}).init();
			this.courseInfoSelect = courseInfo;
			// 学期变化，教学班变化
			$("#semester").change(function(){
				 $("#departmentId").change();
			});
			// 开课单位联动课程
			$("#departmentId").change(function(){
				// 模糊查询
				$(".toggle-select").val("数据正在加载中...");
				courseScoreConstitutionSet.getData();
				$("#teachingClassNo").html("<option value=''>全部</option>");
				$(".toggle-select").val("");
				$("#courseId").val("");
			});
			// 课程联动教学班
			$("#courseDiv").change(function() {
				courseScoreConstitutionSet.initTeachingClass(courseInfo.getValue());
			});
            // 设置
            $(document).on("click", "button[name='set']", function() {
                courseScoreConstitutionSet.set(this,1);
            });
            // 批量设置
            $(document).on("click", "button[name='batchSet']", function() {
               
                  var length = $("input[name='checNormal']:checked").length;
     		      if(length==0){
     			   popup.warPop("请先选择记录!");
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
 					reqDataCopy.scoreType = scoreType.FirstTest.value;//首考
 					paramCopy.push(reqDataCopy);
 				 });
 	            var reqre={};
 				reqre.scoreSetListDto=paramCopy;
	 	       	ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
	 	        ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(url.CHECK_RELE_VANCE, JSON.stringify(reqre), function(data) {
					if(data.data == true){
						 	popup.warPop("此教学班已录入课程成绩，不能修改成绩构成！");
						 	return false;
					}else{
						courseScoreConstitutionSet.set(this,2);
					}
				});
				
            });
            // 构成修改设置
            $(document).on("click", "button[name='modify']", function() {
            	 var length = $("input[name='checNormal']:checked").length;
    		      if(length==0){
    			   popup.warPop("请先选择记录!");
    			   return false;
    		      }
                courseScoreConstitutionSet.modify(this);
            });
           
        },
        //设置构成
        initAdd:function(){
        	//切换圆筒按钮
        	$("input[name='weekStartDay']").on("click",function(){
        		var courseVal = $(this).val();
        		if(courseVal == 0){
        			$(":radio[name='weekStartDay'][value='1']").attr("checked",false);
        			$(":radio[name='weekStartDay'][value='0']").attr("checked",true);
        			$('.sub-content').show();
        		}else{
        			$(":radio[name='weekStartDay'][value='0']").attr("checked",false);
        			$(":radio[name='weekStartDay'][value='1']").attr("checked",true);
        			$('.sub-content').hide();
        		}
        	})
        	//切换成绩分制
        	$("#scoreRegimenName").on("change",function(){
        		var creditName = $(this).find("option:selected").text();
        		//var checkWay = $(":radio[name='weekStartDay']:checked").val();
        		var checkWay = $(".on-radio :radio").val();
        		var crediWay = $(this).find("option:selected").val();
        		if(utils.isNotEmpty(crediWay) && creditName != dataConsTant.HANDROD_CREDIT_NAME){
					$(":radio[name='weekStartDay'][value='0']").attr("disabled","disabled").attr("aria-invalid","false").attr("class","valid").attr("checked",false).parent().attr("class","radio-con disabled-radio").parent().attr("class","radio-inline").attr("disabled","disabled");
					$(":radio[name='weekStartDay'][value='1']").attr("checked","checked").parent().parent().attr("class","radio-inline on-radio").attr("disabled",false);
        			$('.sub-content').hide();
        		}else{
        			$(":radio[name='weekStartDay'][value='0']").attr("disabled",false).parent().attr("class","radio-con").parent().attr("disabled",false);
        			if(checkWay == 0){
        				$('.sub-content').show();
        			}else{
        				$('.sub-content').hide();
        			}
        		}
        	})
        	//进来加载成绩分制
        	simpleSelect.loadSelect("scoreRegimenName",url.GET_SCORE_REGIMEN_LIST,{},{firstText:"--请选择--",firstValue:"",async:false});
        	//获取单个设置参数携带弹窗的信息
        	courseScoreConstitutionSet.getPopupData();
        	//初始化弹窗验证
        	courseScoreConstitutionSet.validateText($("#addForm"));
        },
    	/**
		 * 查询分页函数
		 */
        getCourseScoreSetPagedList:function(){
        	courseScoreConstitutionSet.pagination = new pagination({
				id: "pagination", 
				url: url.GET_COURSE_SCORE_SET_PAGEDLIST, 
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
    		courseScoreConstitutionSet.getScoreNum();
		},
		//查询未设置的数量
		getScoreNum:function(){
			var req = {};
			req.semester = $("#semester").val();
			 ajaxData.request(url.GET_SCORE_NOT_NUM,req,function(data){
  				if (data.code == config.RSP_SUCCESS){
  					 $("#total").text(data.data);
  				}
  			});
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
			var me = this;
			var dataDom = [];
			var departmentId = $("#departmentId").val();
			if(utils.isEmpty(departmentId)){
				me.courseInfoSelect.reload(dataDom);
				return ;
			}
			ajaxData.contructor(true); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(url.GET_COURSE_SELECT_LIST, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item){
						var option = {
							value : item.value,
							name :  item.name
						};
						dataDom.push(option);
					});
					me.courseInfoSelect.reload(dataDom);
				}
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
		//获取参数信息
        getPopupData:function(){
        	var obj = popup.data("obj");
        	var scoreReGimenId = $(obj).attr("scoreReGimenId");
        	//获取信息
        	var param ={};
        	param.courseId = $(obj).attr("courseId");
        	param.classId = $(obj).attr("classId");
        	param.scoreReGimenId = $(obj).attr("scoreReGimenId");
        	param.academicYear = $(obj).attr("academicYear");
        	param.semesterCode = $(obj).attr("semesterCode");
        	if(utils.isNotEmpty(scoreReGimenId)){//如果分制不为空修改
        		ajaxData.contructor(false);
        		ajaxData.request(url.GET_COURSE_SCORE_GETITEM, param, function(data){
    				if (data.code == config.RSP_SUCCESS) {
    					
    					var onlyEntryTotalScore = data.data.onlyEntryTotalScore;//是否允许录入总评成绩
    					if(onlyEntryTotalScore == 0){
    						$('#scoreRegimenName').val(data.data.scoreRegimenId);
    						$('#usualRatio').val(data.data.usualRatio);
    						$('#midtermRatio').val(data.data.midtermRatio);
    						$('#endtermRatio').val(data.data.endtermRatio);
    						$('#skillRatio').val(data.data.skillRatio);
    						$('.sub-content').show();
    						$(":radio[name='weekStartDay'][value='0']").attr("checked","checked");
    					}else{
    						$('.sub-content').hide();
    						$('#scoreRegimenName').val(data.data.scoreRegimenId);
    						$(":radio[name='weekStartDay'][value='0']").attr("checked",false).parent().parent().attr("class","radio-inline"); 
    						$(":radio[name='weekStartDay'][value='1']").attr("checked","checked").parent().parent().attr("class","radio-inline on-radio").attr("disabled",false);
    					}
    					$("#scoreRegimenName").change();
    				}
    			});
        	}
        },
        
        /**
         * 课程成绩构成设置 弹窗
         */
        set: function(obj,flag){
          
           popup.data("obj",obj);//传值过去
           var mydialog = art.dialog.open('./score/score/html/courseScoreConstitutionSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '课程成绩构成设置',// 这是标题
                    width : 600,// 这是弹窗宽度。其实可以不写
                    height : 440,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function(obj) {
                    	if(flag==1){
                    		//单个设置
                    		courseScoreConstitutionSet.saveCourseScoreSet(obj,mydialog)
                    	}else{
                    		//批量设置
                    		courseScoreConstitutionSet.batcSaveCourseScoreSet(obj,mydialog)
                    	}
                        return false;
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        },
        
        //单个设置
        saveCourseScoreSet:function(obj,mydialog){
        	//验证参数
        	var boole = obj.$("#addForm").valid();
        	if(!boole){
        		return false;
        	}
        	var flag = courseScoreConstitutionSet.validate(obj);
        	if(flag!=undefined && !flag){
        		return false;
        	}
        	//单个设置参数获取，封装
        	var param = [];
            var reqData = {};
            var onlyEntryTotalScore = obj.$(".on-radio :radio").val();
            if(onlyEntryTotalScore == 0){
            	reqData.usualRatio = obj.$('#usualRatio').val();
            	reqData.midtermRatio = obj.$('#midtermRatio').val();
            	reqData.endtermRatio = obj.$('#endtermRatio').val();
            	reqData.skillRatio = obj.$('#skillRatio').val();
            }else{
            	reqData.usualRatio = "";
            	reqData.midtermRatio = "";
            	reqData.endtermRatio = "";
            	reqData.skillRatio = "";
            }
            reqData.onlyEntryTotalScore=onlyEntryTotalScore;
            reqData.scoreType = scoreType.FirstTest.value;//首考
            //获取弹窗参数
            var objData = popup.data("obj");
            reqData.courseId = $(objData).attr("courseId");
            reqData.classId = $(objData).attr("classId");
            reqData.academicYear = $(objData).attr("academicYear");
            reqData.semesterCode = $(objData).attr("semesterCode");
            reqData.scoreRegimenId = obj.$("#scoreRegimenName").val();
            //数组装好
            param.push(reqData);
            var reqre={};
			reqre.scoreSetListDto=param;
			//保存到后台
			courseScoreConstitutionSet.save(reqre,mydialog);
        },
        
        //批量设置
        batcSaveCourseScoreSet:function(obj,mydialog){
        	//验证参数
        	var boole = obj.$("#addForm").valid();
        	if(!boole){
        		return false;
        	}
        	var flag =  courseScoreConstitutionSet.validate(obj);
        	if(flag!=undefined && !flag){
        		return false;
        	}
        	//批量设置参数获取，封装
        	var param = [];
        	var paramCopy = [];
            var reqData = {};
            var bigData = [];
            var onlyEntryTotalScore = obj.$(".on-radio :radio").val();
            reqData.onlyEntryTotalScore=onlyEntryTotalScore;
            if(onlyEntryTotalScore == 0){
            	reqData.usualRatio = obj.$('#usualRatio').val();
            	reqData.midtermRatio = obj.$('#midtermRatio').val();
            	reqData.endtermRatio = obj.$('#endtermRatio').val();
            	reqData.skillRatio = obj.$('#skillRatio').val();
        	    reqData.scoreRegimenId = obj.$("#scoreRegimenName").val();
            }
            else
            {
            	reqData.usualRatio = "";
            	reqData.midtermRatio = "";
            	reqData.endtermRatio = "";
            	reqData.skillRatio = "";
            	reqData.scoreRegimenId = obj.$("#scoreRegimenName").val();
            }
            reqData.courseEnterFlag = 1;//批量设置的标记
            param.push(reqData);
           //获取页面上的值
            $("#tbodycontent input[type='checkbox']:checked").each(function(i,item){
				var reqDataCopy ={};
				reqDataCopy.courseId=$(this).attr("courseid");//班级id
				reqDataCopy.classId=$(this).attr("classid");//班级id
				reqDataCopy.academicYear=$(this).attr("academicyear");//学年id
				reqDataCopy.semesterCode=$(this).attr("semestercode");//学期
				reqDataCopy.scoreType = scoreType.FirstTest.value;//首考
				paramCopy.push(reqDataCopy);
			});
            
           //重新组装两个数组到一个数组中形成一个大的数组
			for(var i =0;i<param.length;i++){
				for(var j =0 ;j<paramCopy.length;j++){
					bigData.push($.extend({}, param[i], paramCopy[j]));
				}
			}
			var reqre={};
			reqre.scoreSetListDto=bigData;
			//保存到后台
			courseScoreConstitutionSet.save(reqre,mydialog);
        },
        
        //验证参数
        validate:function(obj){
        	var scoreRegimenId = obj.$("#scoreRegimenName").val();
        	var onlyEntryTotalScore = obj.$(".on-radio :radio").val();
            if(utils.isEmpty(scoreRegimenId)){
            	popup.warPop("请选择成绩分制");//后台验证
            	return false;
            }
            //是只录入成绩进行验证
            if(utils.isNotEmpty(onlyEntryTotalScore) && onlyEntryTotalScore == 0){
        	 var total=0;
         	 obj.$('.ratio').each(function(){
         		if(utils.isNotEmpty($(this).val())){
         			total += Number($(this).val());
         		}
         	})
         	 if(total==0){
         		popup.warPop(" 请至少录入一个成绩项目的总评成绩占比!");
         		return false;
         	 }
         	 if(total!=100){
         		popup.warPop("各成绩项目占比之和必须为100%!");
         		return false;
         	 }
            }
        	var flag = obj.$("#addForm").valid(); //验证表单	
        	if(!flag){
        		return false;
        	}
        },
        //验证只能输入
        validateText:function(formId){
        	ve.validateEx();
        	formId.validate({
				rules : {
					usualRatio:{
						"usualRatioFormat":true,
					},
					midtermRatio:{
						"usualRatioFormat":true,
					},
					endtermRatio:{
						"usualRatioFormat":true,
					},
					skillRatio:{
						"usualRatioFormat":true
					}
				},
				messages : {
					usualRatio:{
						"usualRatioFormat":"0-100之间,可保留一位小数",
					},
					midtermRatio:{
						"usualRatioFormat":"0-100之间,可保留一位小数",
					},
					endtermRatio:{
						"usualRatioFormat":"0-100之间,可保留一位小数",
					},
					skillRatio:{
						"usualRatioFormat":"0-100之间,可保留一位小数",
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
        },
        //保存到后台
        save:function(reqre,mydialog){
        	 ajaxData.contructor(false);
             ajaxData.setContentType("application/json;charset=UTF-8");
 		     ajaxData.request(url.SAVE_COURSE_SCORE_SET,JSON.stringify(reqre),function(data){
 		    	ajaxData.setContentType("application/x-www-form-urlencoded");
 		    	if(data.code==config.RSP_SUCCESS)
 		    	{
 		    		mydialog.close();//关窗
 		    		popup.okPop("保存成功",function(){
 					});
 		    		courseScoreConstitutionSet.pagination.loadData();//局部刷新列表
 		    		courseScoreConstitutionSet.getScoreNum();
 				}else{
 					if(data.code==config.RSP_WARN){
						 popup.warPop(data.msg);
					}
 				}
 			});
        },
        
        /**
         * 成绩构成修改设置 弹窗
         */
        modify: function(){
        	
           var mydialog = art.dialog.open('./score/score/html/scoreConstitutionModifyList.html', // 这里是页面的路径地址
                {
                    id : 'modify',// 唯一标识
                    title : '成绩构成修改设置',// 这是标题
                    width : 500,// 这是弹窗宽度。其实可以不写
                    height : 200,// 弹窗高度
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
        				reqDataCopy.scoreType =scoreType.FirstTest.value;//首考;
        				paramCopy.push(reqDataCopy);
        		   });
                   var reqre={};
        		   reqre.scoreSetListDto=paramCopy;
                	ajaxData.contructor(false);
                    ajaxData.setContentType("application/json;charset=UTF-8");
                	ajaxData.request(url.UPDATE_ALLOW_MODIFY_COURSE,JSON.stringify(reqre),function(data){
          		    	if(data.code==config.RSP_SUCCESS)
          		    	{
          		    		mydialog.close();//关窗
          		    		popup.okPop("保存成功",function(){
          					});
          		    		ajaxData.setContentType("application/x-www-form-urlencoded");
          		    		courseScoreConstitutionSet.pagination.loadData();
          		    		courseScoreConstitutionSet.getScoreNum();
          				}
          			});
                    return false;
                    },
                    cancel : function() {
                    }
                });
        }

    }
    module.exports = courseScoreConstitutionSet;
    window.courseScoreConstitutionSet = courseScoreConstitutionSet;
});