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
    
    /**
     * 设置成绩构成
     */
    var courseScoreSet = {
        //设置构成
    		initAdd:function(){
        	//切换圆筒按钮
        	$("input[name='weekStartDay']").on("click",function(){
        		var courseVal = $(this).val();
        		if(courseVal == 0){
        			$('.sub-content').show();
        		}else{
        			$('.sub-content').hide();
        		}
        	})
        	//切换成绩分制
        	$("#scoreRegimenName").on("change",function(){
        		var creditName = $(this).find("option:selected").text();
        		var checkWay = $(":radio[name='weekStartDay']:checked").val();
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
        	courseScoreSet.getPopupData();
        	//初始化弹窗验证
        	courseScoreSet.validateText($("#addForm"));
        },
		//获取参数信息
        getPopupData:function(){
        	var obj = popup.data("obj");
        	var scoreRegimenId = $(obj).attr("scoreRegimenId");
        	//获取信息
        	var param ={};
        	param.courseId = $(obj).attr("courseId");
        	param.classId = $(obj).attr("classId");
        	param.scoreRegimenId = $(obj).attr("scoreRegimenId");
        	param.academicYear = $(obj).attr("semester").split("_")[0];
        	param.semesterCode = $(obj).attr("semester").split("_")[1];
        		ajaxData.contructor(false);
        		ajaxData.request(url.GET_COURSE_SCORE_GETITEM, param, function(data){
    				if (data.code == config.RSP_SUCCESS) {
    					var onlyEntryTotalScore = data.data.onlyEntryTotalScore;//是否允许录入总评成绩
    					if(onlyEntryTotalScore !=null){
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
    						$("#scoreRegimenId").val(data.data.scoreRegimenId);
    					}
    					$("#scoreRegimenName").change();
    				}
    			});
        },
        /**
         * 设置成绩构成 弹窗
         */
        set: function(formFlag){
        	var queryParams=utils.getQueryParamsByFormId("queryForm");
        	popup.data("obj",queryParams);//传值过去
			if(queryParams.theoreticalTaskId==dataConsTant.EMPTY){
				popup.warPop("请先选择教学班号");
				return false;
			}else{
				queryParams["classId"]=queryParams.theoreticalTaskId; // 班级id
				
				
				// 查询成绩构成
				ajaxData.contructor(false);
				ajaxData.request(url.GET_COURSE_SCORE_SET_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.allowModify === 0){
							popup.warPop("成绩构成已被设置成不可修改");
							return false;
						}
						var mydialog = art.dialog.open('./score/score/html/courseScoreSetConstratorSet.html', // 这里是页面的路径地址
				                {
				                    id : 'set',// 唯一标识
				                    title : '课程成绩构成设置',// 这是标题
				                    width : 520,// 这是弹窗宽度。其实可以不写
				                    height : 420,// 弹窗高度
				                    okVal : '保存',
				                    cancelVal : '关闭',
				                    ok : function(obj) {
				                    	courseScoreSet.saveCourseScoreSet(obj,queryParams,mydialog);
				                        return false;
				                    },
				                    cancel : function() {
				                    	if(formFlag==1){ // 1点查询时进来，2 点设置成绩构成链接进来
				                    		courseScoreEnter.bindNoData();
				                    	}
				                    			
				                    }
				               });
					     
					}
				});
			}
				
				
				
				
			      
        },
       
        //单个设置
        saveCourseScoreSet:function(obj,queryParams,mydialog){
        	//验证参数
        	var boole = obj.$("#addForm").valid();
        	if(!boole){
        		return false;
        	}
        	var flag = courseScoreSet.validate(obj);
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
            //获取弹窗参数
            reqData.courseId = queryParams.courseId;
            reqData.classId = queryParams.classId;
            var semester = queryParams.semester;
            reqData.academicYear = semester.split("_")[0];
            reqData.semesterCode = semester.split("_")[1];
            reqData.scoreRegimenId = obj.$("#scoreRegimenName").val();
            reqData.scoreEnterFlag = 1;
            reqData.scoreType = 1;//首考
            var scoreRegimenId = obj.$("#scoreRegimenId").val();//修改的标记
            //数组装好
            param.push(reqData);
            var reqre={};
			reqre.scoreSetListDto=param;
			//保存到后台
			if(utils.isEmpty(scoreRegimenId)){
				courseScoreSet.save(reqre,mydialog,false);
			}else{ // 修改
				popup.askPop("保存将会删除当前页面已录入学生成绩，是否要继续？",function(){
					courseScoreSet.save(reqre,mydialog,true);
				});
			}
			
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
						"usualRatioFormat":"0-100之间，可保留一位小数",
					},
					midtermRatio:{
						"usualRatioFormat":"0-100之间，可保留一位小数",
					},
					endtermRatio:{
						"usualRatioFormat":"0-100之间，可保留一位小数",
					},
					skillRatio:{
						"usualRatioFormat":"0-100之间，可保留一位小数",
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
        save:function(reqre,mydialog, isModify){  
        	ajaxData.contructor(false);
            ajaxData.setContentType("application/json;charset=UTF-8");
		     ajaxData.request(url.SAVE_COURSE_SCORE_SET,JSON.stringify(reqre),function(data){
		    	if(data.code==config.RSP_SUCCESS)
		    	{
		    		mydialog.close();//关窗
		    		popup.okPop("保存成功",function(){
					});
		    		if(isModify){
		    			// 修改
		    			courseScoreEnter.deleteOriginalScore();
		    		}else{
		    			//新增
		    			// 刷新列表						
						courseScoreEnter.getInitData();	
		    		}		    		
				}else{
					if(data.code==config.RSP_WARN){
						 popup.warPop(data.msg);
					}
				}
			});        	 
        },
        
        // 调用后台判断当前设置成绩构成是否可以修改
		judgeAllowModify:function(queryParams){
			if(queryParams.theoreticalTaskId==dataConstant.EMPTY){
				popup.warPop("请先选择教学班号");
				return false;
			}
			else{				
				// 查询成绩构成
				queryParams.classId=queryParams.theoreticalTaskId;
				ajaxData.contructor(false);
				ajaxData.request(url.GET_COURSE_SCORE_SET_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data){
							if(data.data.allowModify === 0 ){
								popup.warPop("成绩构成已被设置成不可修改");
								return false;
							}
							else{
								return true;
							}
						}else{
							//没有设置成绩构成，可以进去设置
							return true;
						}
					}
					popup.warPop(data.msg);
					return false;
				});
			}
		}
        

    }
    module.exports = courseScoreSet;
    window.courseScoreSet = courseScoreSet;
});