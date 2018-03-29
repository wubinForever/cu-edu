/**
 * 补考成绩审核方法
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlScore = require("configPath/url.score");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var MakeUpAuditPolicy = require("basePath/enumeration/score/MakeUpAuditPolicy");
	var base  =config.base;
	
	/**
	 * 补考成绩审核方法
	 */
	var makeUpExamScoreAuditMethod = {
		// 初始化
		init : function() {
			makeUpExamScoreAuditMethod.query();
			makeUpExamScoreAuditMethod.inputDatasChange();
			$("input:radio[name='rules1']").click(function(){
				if($(this).val()== MakeUpAuditPolicy.Score.value){
					$("#score1").removeAttr("disabled");
				}else{
					$("#score1").attr("disabled","disabled");
				}
			});
			$("input:radio[name='rules2']").click(function(){
				if($(this).val()== MakeUpAuditPolicy.Score.value){
					$("#score2").removeAttr("disabled");
				}else{
					$("#score2").attr("disabled","disabled");
				}
			});
			$("input:radio[name='rules3']").click(function(){
				if($(this).val()== MakeUpAuditPolicy.Score.value){
					$("#score3").removeAttr("disabled");
				}else{
					$("#score3").attr("disabled","disabled");
				}
			});
			$("input:radio[name='rules4']").click(function(){
				if($(this).val()== MakeUpAuditPolicy.Score.value){
					$("#score4").removeAttr("disabled");
				}else{
					$("#score4").attr("disabled","disabled");
				}
			});
			
			//公式计算保存
			$(document).on("click", "button[name='formulaBtnSave']", function() {
				var makeUpExamAuditId = $("#makeUpExamAuditId").val();
				var rules1 = $("input:radio[name='rules1']:checked").val();
				var rules2 = $("input:radio[name='rules2']:checked").val();
				var rules3 = $("input:radio[name='rules3']:checked").val();
				var rules4 = $("input:radio[name='rules4']:checked").val();
				
				var score1 = 0.0;
				var score2 = 0.0;
				var score3 = 0.0;
				var score4 = 0.0;
				
				if(rules1 == MakeUpAuditPolicy.Score.value){
					score1 = $("#score1").val();
				}
				if(rules1 == MakeUpAuditPolicy.Score.value){
					score2 = $("#score2").val();
				}
				if(rules1 == MakeUpAuditPolicy.Score.value){
					score3 = $("#score3").val();
				}
				if(rules1 == MakeUpAuditPolicy.Score.value){
					score4 = $("#score4").val();
				}
				//验证输入框各个值得正确性
				var valid =makeUpExamScoreAuditMethod.validateSave();
				if(valid){
					 var reqre={};
					 reqre.makeUpExamAuditId = makeUpExamAuditId;
					 reqre.rules1 = rules1;
					 reqre.rules2 = rules2;
					 reqre.rules3 = rules3;
					 reqre.rules4 = rules4;
					 reqre.score1 = parseFloat(score1).toFixed(1);
					 reqre.score2 = parseFloat(score2).toFixed(1);
					 reqre.score3 = parseFloat(score3).toFixed(1);
					 reqre.score4 = parseFloat(score4).toFixed(1);
					 ajaxData.contructor(true);
					 ajaxData.request(urlScore.MAKE_UP_EXAM_AUDIT_UPDATE,reqre,function(data){
		 		    	if(data.code==config.RSP_SUCCESS){
		 		    		popup.okPop("保存成功",function(){});
		 		    		makeUpExamScoreAuditMethod.query();
		 				}else{
		 					if(data.code==config.RSP_WARN){
								 popup.warPop(data.msg);
							}
		 				}
			 		});
				 }
			});
		},
		
		query : function(){
			ajaxData.contructor(false);
			ajaxData.request(urlScore.MAKE_UP_EXAM_AUDIT_GETITEM, {},
				function(data) {
					$("#makeUpExamAuditId").val(data.data.makeUpExamAuditId);
					
					$("#score1").val(data.data.score1Format);
					$("#score2").val(data.data.score2Format);
					$("#score3").val(data.data.score3Format);
					$("#score4").val(data.data.score4Format);
					
					if (data.data.rules1 != MakeUpAuditPolicy.Score.value){
						$("#score1").attr("disabled","disabled");
					}
					if (data.data.rules2 != MakeUpAuditPolicy.Score.value){
						$("#score2").attr("disabled","disabled");
					}
					if (data.data.rules3 != MakeUpAuditPolicy.Score.value){
						$("#score3").attr("disabled","disabled");
					}
					if (data.data.rules4 != MakeUpAuditPolicy.Score.value){
						$("#score4").attr("disabled","disabled");
					}
					$("input:radio[name='rules1'][value='"+ data.data.rules1 +"']").attr("checked","checked");
					$("input:radio[name='rules1'][value='"+ data.data.rules1 +"']").parent().parent().addClass("on-radio");
					
					$("input:radio[name='rules2'][value='"+ data.data.rules2 +"']").attr("checked","checked");
					$("input:radio[name='rules2'][value='"+ data.data.rules2 +"']").parent().parent().addClass("on-radio");
					
					$("input:radio[name='rules3'][value='"+ data.data.rules3 +"']").attr("checked","checked");
					$("input:radio[name='rules3'][value='"+ data.data.rules3 +"']").parent().parent().addClass("on-radio");
					
					$("input:radio[name='rules4'][value='"+ data.data.rules4 +"']").attr("checked","checked");
					$("input:radio[name='rules4'][value='"+ data.data.rules4 +"']").parent().parent().addClass("on-radio");
				});
		},

		//分数改变操作
        inputDatasChange:function(){
            $(".middlenum").on("focusout",function(){
                if($(this).val()){
                    var fval = parseFloat($(this).val()).toFixed(1);
                    $(this).val(fval);
                }
            }).on("keyup",function(){
                var nowval = $(this).val();
                if(nowval){
                    $(this).val(nowval.replace(/[^\-?\d.]/g,''));
                }
            });
        },
        
        //保存时验证
        validateSave:function(){
            $(".middlenum").each(function(i){
                var thisVal = $(this).val();
                var ruleVal = $("input:radio[name='rules"+(i+1)+"']:checked").val();
                if(ruleVal == MakeUpAuditPolicy.Score.value){
                	if(!$(this).val()){
                		$(this).next().show().text("请输入新总评成绩");
                	}else if(thisVal<0 || thisVal>100){
                		$(this).next().show().text("成绩可录入0-100，保留一位小数");
                	}else{
                		$(this).next().hide().text("");
                	}
                }
           });

            var count = 0;
            $("label.error").each(function(){
                if($(this).is(":visible")){
                	 count++;
                }
            })
            if(count<1){
            	return true;
            }else{
            	return false;
            }
        }
	}
	module.exports = makeUpExamScoreAuditMethod;
	window.makeUpExamScoreAuditMethod = makeUpExamScoreAuditMethod;
});
