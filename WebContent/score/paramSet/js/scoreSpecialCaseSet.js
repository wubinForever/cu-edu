/**
 * 成绩特殊情况设置
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

    /**
     * 成绩特殊情况
     */
    var scoreSpecialCaseSet = {
        // 初始化
        init : function() {
            // 新增
            $(document).on("click", "[name='add']", function() {
                scoreSpecialCaseSet.add(this);
            });
            scoreSpecialCaseSet.queryList();
            //删除
            $(document).on("click", "[name='delete']", function() {
                scoreSpecialCaseSet.deleteSpecase(this);
            });
            //修改
            $(document).on("click", "[name='update']", function() {
                scoreSpecialCaseSet.update(this);
            });
        },
        
        initUpdate:function(){
        	scoreSpecialCaseSet.getItem();
        	scoreSpecialCaseSet.validateText($("#addForm"));
        },
        
        getItem:function(){
        	var obj = popup.data("obj");
        	var reqData = {};
        	reqData.specialCaseId = $(obj).attr("specialCaseId")
        	ajaxData.contructor(false);
		    ajaxData.request(url.SCORE_SPECIAL_GETITEM,reqData,function(data){
		    	$("#name").val(data.data.name);
		    	$("#totalScore").val(data.data.totalScore);
		    	if(data.data.isSystem == 1){
		    		$("#name").prop("disabled",true);
		    	}
		    	if(data.data.isEnabled == 1){
		    		$(":radio[name='isEnabled'][value='1']").attr("checked","checked").parents().parents().addClass("on-radio");
		    	}else{
		    		$(":radio[name='isEnabled'][value='0']").attr("checked","checked").parents().parents().addClass("on-radio");
		    	}
			});
        	
        },
        
        initAdd:function(){
        	scoreSpecialCaseSet.validateText($("#addForm"));
        },
       //查询list
		queryList:function(){
			var reqData = {};
			reqData.isFlag=1;
			ajaxData.contructor(true);
			ajaxData.request(url.SPECIAL_CASE_GET_LIST, reqData, function(data) {
				 if(data && data.data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
		},
		
		//删除
		deleteSpecase:function(obj){
			 var reqData =  {};
	         reqData.specialCaseId =  $(obj).attr("specialCaseId");
			 popup.askPop('确定删除此记录？？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(url.SCORE_SPECIAL_DELETE,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		popup.okPop("删除成功",function(){});
			    		scoreSpecialCaseSet.queryList();//回调
					}else{
						if(data.code==config.RSP_WARN){
							 popup.warPop(data.msg);
						}else{
							 popup.errPop("删除失败");
						}
					}
				});
		   });
			
		},
        /**
         * 新增 弹窗
         */
        add: function(){
           var mydialog =  popup.open('./score/paramSet/html/scoreSpecialCaseSetAdd.html', // 这里是页面的路径地址
                {
                    id : 'add',// 唯一标识
                    title : '成绩特殊情况新增',// 这是标题
                    width : 450,// 这是弹窗宽度。其实可以不写
                    height : 220,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function(obj) {
                    	var flag = obj.$("#addForm").valid();
                    	if(flag){
                    		var reqDatas = {};
                    		 var reqData=utils.getQueryParamsByFormObject(obj.$("#addForm"));
                    		 reqDatas.name = reqData.name;
                    		 reqDatas.totalScore =parseFloat(reqData.totalScore).toFixed(1);
                    		 reqDatas.isEnabled = reqData.isEnabled;
                    		 ajaxData.request(url.SCORE_SPECIAL_ADD,reqDatas,function(data){
 				 		    	if(data.code==config.RSP_SUCCESS)
 				 		    	{
 				 		    		mydialog.close();//关窗
 				 		    		popup.okPop("保存成功",function(){});
 				 		    		scoreSpecialCaseSet.queryList();
 				 				}else{
 				 					if(data.code==config.RSP_WARN){
 										 popup.warPop(data.msg);
 									}
 				 				}
 				 			});
                    	}
                        return false;
                    },
                    cancel : function() {
                    }
                });
        },
        
        
        /**
         * 修改 弹窗
         */
        update: function(obj){
        	
           popup.data("obj",obj);//传值过去
           var specialCaseId = $(obj).attr("specialCaseId");
           var mydialog =  popup.open('./score/paramSet/html/scoreSpecialCaseSetModify.html', // 这里是页面的路径地址
                {
                    id : 'update',// 唯一标识
                    title : '成绩特殊情况修改',// 这是标题
                    width : 450,// 这是弹窗宽度。其实可以不写
                    height : 220,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function(obj) {
                    	var flag = obj.$("#addForm").valid();
                    	if(flag){
                    		var reqDatas = {};
                    		 var reqData=utils.getQueryParamsByFormObject(obj.$("#addForm"));
                    		 reqDatas.name = obj.$("#name").val();
                    		 reqDatas.totalScore =parseFloat(reqData.totalScore).toFixed(1);
                    		 reqDatas.isEnabled = reqData.isEnabled;
                    		 reqDatas.specialCaseId = specialCaseId;
                    		 ajaxData.request(url.SCORE_SPECIAL_UPDATE,reqDatas,function(data){
 				 		    	if(data.code==config.RSP_SUCCESS)
 				 		    	{
 				 		    		mydialog.close();//关窗
 				 		    		popup.okPop("保存成功",function(){});
 				 		    		scoreSpecialCaseSet.queryList();
 				 				}else{
 				 					if(data.code==config.RSP_WARN){
 										 popup.warPop(data.msg);
 									}
 				 				}
 				 			});
                    	}
                        return false;
                    },
                    cancel : function() {
                    }
                });
        },
		
		 //新增 验证只能输入
        validateText:function(formId){
        	
        	ve.validateEx();
        	formId.validate({
				rules : {
					name:{
						"required" : true
					},
					totalScore:{
						"required":true,
						"usualRatioFormat":true
					}
				},
				messages : {
					name:{
						"required" : '名称不能为空'
					},
					totalScore:{
						"required":"总评成绩不能为空",
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
        	
        	//名称不能重复
			jQuery.validator.addMethod("nameRepeatVerify", function(value,element) {
				return false;	
			}, "名称不能重复");
			//名称改变的时候进行改变
			$(document).on("change", "#name",function(){	
				var name = $.trim($(this).val());
				if (utils.isNotEmpty(name)){
					var param =
			        {
							name : name
					};
					ajaxData.contructor(false);
					ajaxData.request(url.SCORE_IS_NAME_EXIT,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS) {					
							if(data.data){
								$("#name").rules("add",	{"nameRepeatVerify" : true,	messages : {"scoreRegimenNameRepeatVerify" : "名称不能重复"}});
							}else{
								$("#name").rules("remove","nameRepeatVerify");
							}
						} else {
							// 提示失败
							popup.errPop(data.msg);
							return false;
						}								
					});		
				}		  
			 });
        },

    }
    module.exports = scoreSpecialCaseSet;
    window.scoreSpecialCaseSet = scoreSpecialCaseSet;
});