/**
 * 绩点计算方法设置
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var dataConstant = require("configPath/data.constant");
	var url = require("configPath/url.trainplan");
	var urlScore = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");
	var isEnabled=require("basePath/enumeration/common/IsEnabled");
	var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var base  =config.base;
	
	/**
	 * 课程信息
	 */
	var scorePointCalculateMethodSet = {
		/** ******************* list初始化 开始 ******************* */
		init : function() {
			ajaxData.contructor(false);
			ajaxData.request(urlScore.SCORE_POINT_GET_ITEM, {},
				function(data) {
					$("#scorePointId").val(data.data.scorePointId);
					if (data.data.firstScorePointCalculate == 0){
						$("input:radio[name='check-tab'][value='0']").attr("checked","checked");
						$("input:radio[name='check-tab'][value='0']").parent().parent().addClass("on-radio");
					}
					else{
						$("input:radio[name='check-tab'][value='1']").attr("checked","checked");
						$("input:radio[name='check-tab'][value='1']").parent().parent().addClass("on-radio");
						
						var	tabCon = $("#subtab-bd").children(".sub-bd");
						$(tabCon).hide().eq(1).fadeIn(300);
					}
				
					if(data.data.makeUpExamScorePoint == null){
						$("input:radio[name='makeupExam'][value='1']").attr("checked","checked");
						$("input:radio[name='makeupExam'][value='1']").parent().parent().addClass("on-radio");
						
						$("#makeupExamPoint").attr("disabled","disabled");
					}
					else{
						$("input:radio[name='makeupExam'][value='0']").attr("checked","checked");
						$("input:radio[name='makeupExam'][value='0']").parent().parent().addClass("on-radio");
						$("#makeupExamPoint").val(data.data.makeUpExamScorePointFormat);
					}
					
					if(data.data.delayExamScorePoint == null){
						$("input:radio[name='delayExam'][value='1']").attr("checked","checked");
						$("input:radio[name='delayExam'][value='1']").parent().parent().addClass("on-radio");
						
						$("#delayExamPoint").attr("disabled","disabled");
					}
					else{
						$("input:radio[name='delayExam'][value='0']").attr("checked","checked");
						$("input:radio[name='delayExam'][value='0']").parent().parent().addClass("on-radio");
						$("#delayExamPoint").val(data.data.delayExamScorePointFormat);
					}
				});
			
			//补考
			$("input:radio[name='makeupExam']").click(function(){
				if($(this).val()=="1"){
					$("#makeupExamPoint").attr("disabled","disabled");
				}
				else{
					$("#makeupExamPoint").removeAttr("disabled");
				}
			});
			//缓考后补考
			$("input:radio[name='delayExam']").click(function(){
				if($(this).val()=="1"){
					$("#delayExamPoint").attr("disabled","disabled");
				}
				else{
					$("#delayExamPoint").removeAttr("disabled");
				}
			});
			
			//分段计算
			simpleSelect.loadSelect("scoreRegimenId",urlScore.GET_SCORE_REGIMEN_LIST,null,{async:false});
			scorePointCalculateMethodSet.query();
			
			//公式计算保存
			$(document).on("click", "button[name='formulaBtnSave']", function() {
				var scorePointId = $("#scorePointId").val();
				var firstScorePointCalculate = $("input:radio[name='check-tab']:checked").val();
				var makeupExam = $("input:radio[name='makeupExam']:checked").val();
				var delayExam = $("input:radio[name='delayExam']:checked").val();
				
				if(makeupExam == 0){
					makeupExam = $("#makeupExamPoint").val();
				}
				else{
					makeupExam = null;
				}
				
				if(delayExam == 0){
					delayExam = $("#delayExamPoint").val();
				}
				else{
					delayExam = null;
				}
				
				//验证参数	
				var boole = $("#addForm").valid();
				//验证输入框各个值得正确性
				var valid =scorePointCalculateMethodSet.validateSave();
				if(boole && valid){
					 var param = [];
					 $("#otherSystemBody tr").each(function(){//拿到每次选中的每一行
						 var scoredeto = {};
						 var td = $(this).find("td:first");
						 var inputObj= $(this).find("input");
						 
						 var scorePointDetailId = td.attr("scorePointDetailId");
						 var scoreRegimenId = td.attr("scoreRegimenId");
						 var scoreRegimenDetailId = td.attr("scoreRegimenDetailId");
						 var scoreBegin = parseFloat(td.attr("scoreBegin")).toFixed(1);
						 var scoreEnd = parseFloat(td.attr("scoreEnd")).toFixed(1);
						 var scorePoint = parseFloat(inputObj.eq(0).val()).toFixed(1);
						 
						 scoredeto.scorePointDetailId = scorePointDetailId;
						 scoredeto.scoreRegimenId = scoreRegimenId;
						 scoredeto.scoreRegimenDetailId = scoreRegimenDetailId;
						 scoredeto.scoreBegin = scoreBegin;
						 scoredeto.scoreEnd = scoreEnd;
						 scoredeto.scorePoint = scorePoint;
						 param.push(scoredeto);
					 })
					 var reqre={};
					 reqre.scorePointDetailDto=param;
					 var scorePoint = {};
					 scorePoint.scorePointId = scorePointId;
					 scorePoint.firstScorePointCalculate = firstScorePointCalculate;
					 scorePoint.makeUpExamScorePoint = makeupExam;
					 scorePoint.delayExamScorePoint = delayExam;
					 reqre.scorePointDto = scorePoint;
					 ajaxData.contructor(true);
					 ajaxData.setContentType("application/json;charset=UTF-8");
					 ajaxData.request(urlScore.SCORE_POINT_FORMULA_UPDATE,JSON.stringify(reqre),function(data){
		 		    	ajaxData.setContentType("application/x-www-form-urlencoded");
		 		    	if(data.code==config.RSP_SUCCESS){
		 		    		popup.okPop("保存成功",function(){});
		 		    		scorePointCalculateMethodSet.query();
		 				}else{
		 					if(data.code==config.RSP_WARN){
								 popup.warPop(data.msg);
							}
		 				}
			 		});
				 }
			});
			
			// 点击分制
			$(document).on("change", "#scoreRegimenId", function() {
				scorePointCalculateMethodSet.query();
			});
			
			// 新增
            $(document).on("click", "#addCourse", function() {
            	scorePointCalculateMethodSet.addList();
            });
		},
		
		query : function(){
			
			if($("#scoreRegimenId").find("option:selected").text()===dataConstant.HANDROD_CREDIT_NAME){//百分制
				//百分制
				$("#addCourse").css("display","block");
				$("#centesimalSystem").css("display","block");
				$("#otherSystem").css("display","none");
				
				scorePointCalculateMethodSet.initCentesimalSystemUpdate();
			}else{
				$("#addCourse").css("display","none");
				$("#centesimalSystem").css("display","none");
				$("#otherSystem").css("display","block");
				
				scorePointCalculateMethodSet.initOtherSystemUpdate();
			}
			
			//初始化验证
			scorePointCalculateMethodSet.inputDataChange();
			scorePointCalculateMethodSet.inputDatasChange();
			scorePointCalculateMethodSet.validate();
		},
		
		/**
		 * 修改初始化详情(百分制)
		 */
		initCentesimalSystemUpdate:function(){
			var reqData = {};
			var scoreRegimenId = $("#scoreRegimenId").val();
			var scoreRegimenName = $("#scoreRegimenId").find("option:selected").text()
			reqData.scoreRegimenId = scoreRegimenId;
			reqData.scoreRegimenName = scoreRegimenName;
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.GET_SCORE_POINT_DETAIL_LIST,reqData,function(data){
		    	 if(data && data.data.length != 0){
					 $("#tbody").removeClass("no-data-html").empty().append($("#centesimalSystemTmpl").tmpl(data.data));
				 }else{
					$("#tbody").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
		    
		    $(document).on("click", "button[name='delete']", function() {
	    	    var parentObj = $(this).parents("tr");
                var index = parentObj.index();
                scorePointCalculateMethodSet.deleteList(parentObj,index);
			});
		},
		
		/**
		 * 修改初始化详情(非百分制)
		 */
		initOtherSystemUpdate:function(){
			var reqData = {};
			var scoreRegimenId = $("#scoreRegimenId").val();
			var scoreRegimenName = $("#scoreRegimenId").find("option:selected").text()
			reqData.scoreRegimenId = scoreRegimenId;
			reqData.scoreRegimenName = scoreRegimenName;
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.GET_SCORE_POINT_DETAIL_LIST,reqData,function(data){
		    	 if(data && data.data.length != 0){
					 $("#otherSystemBody").removeClass("no-data-html").empty().append($("#otherSystemTmpl").tmpl(data.data));
				 }else{
					$("#otherSystemBody").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
		},
		
		//删除操作
        deleteList:function(obj,i){
            var len =  $(".scorll-box tbody tr").length;
            var preTr = obj.prev("tr");
            var nextTr = obj.next("tr");
            var preMininum = preTr.find(".mininum").val();
            $(".scorll-box tbody tr").each(function(index,element){
                  if(index > i){
                     var obj = $(".scorll-box tbody tr").eq(index).find("td:eq(0)");
                     var txt = obj.text();
                     obj.text(parseInt(txt)-1);
                  }
            });
            nextTr.find(".maxnum").val(preMininum);
            obj.remove();
            if(len == 10){
               $("#addCourse").addClass("btn-success").removeClass("disabled"); 
            }
            scorePointCalculateMethodSet.inputDataChange();
            scorePointCalculateMethodSet.inputDatasChange();
        },
        
        //分数改变操作
        inputDatasChange:function(){
            $(".middlenum").on("focusout",function(){
                var nextTr = $(this).parents("tr").next();
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
        
        //验证
        validate:function(){
            //分数段
        	$(".mininum").on("focusout",function(){
        		var thisVal = $(this).val();
        		var maxVal = parseFloat($(this).parents("td").find(".maxnum").val());
                if(!$(this).val()){
                   $(this).next().show().text("请输入分数段");
                }else if(thisVal >= maxVal){
                   $(this).next().show().text("最小值不能大于最大值");
                }else{
                   $(this).next().hide().text("");
                }
        	});
        },
		
        //保存时验证
        validateSave:function(){
            $(".mininum").each(function(){
                var thisVal = $(this).val();
        		var maxVal = parseFloat($(this).parents("td").find(".maxnum").val());
                if(!$(this).val()){
                   $(this).next().show().text("请输入分数段");
                }else if(thisVal >= maxVal){
                   $(this).next().show().text("最小值不能大于最大值");
                }else{
                   $(this).next().hide().text("");
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
        },
        
        //新增
 	   addList:function(){
           var trObj = $(".scorll-box tbody tr");
           var len = trObj.length;
           if(len > 9){
               return false;
           }else{
               var lastMinNum =  trObj.eq(len-2).find(".mininum").val();
               if(utils.isEmpty(lastMinNum)){
            	   lastMinNum = "";
               }
               var list = '<tr><td class="">'+len+'</td>'
                          +'<td class="scorepadding"><div class="tip-text verification-info"><input type="text" value="'+lastMinNum+'" class="form-control inp-minimum text-r inline-block maxnum" style="width:80px;" disabled="disabled" > > 分数 ≥ <input type="text" class="form-control inp-minimum text-r inline-block mininum"  style="width:80px;"><label class="error"></label></div></td>'
                          +'<td class="scorepadding"><div class="tip-text verification-info"><input type="text" class="form-control inp-minimum middlenum text-r" style="width:100px;"><label class="error"></label></div></td>'
                          +'<td class=""><button type="button" class="btn-text" name="delete">删除</button></td></tr>';
               //最后一行改变序号
               trObj.eq(len-1).find("td:eq(0)").text(len+1);
               trObj.eq(len-1).find(".maxnum").val("");
               //在倒数第二行插入
               trObj.eq(len-2).after(list);
               if(len == 9){
                  $("#addCourse").removeClass("btn-success").addClass("disabled");
               }else{
                  $("#addCourse").addClass("btn-success").removeClass("disabled");
               }
              
           }
           scorePointCalculateMethodSet.inputDataChange();
           scorePointCalculateMethodSet.inputDatasChange();
           scorePointCalculateMethodSet.validate();
        },
        
        //分数改变操作
        inputDataChange:function(){
            $(".mininum").on("focusout",function(){
                var nextTr = $(this).parents("tr").next();
                if($(this).val()){
                    var fval = parseFloat($(this).val()).toFixed(1);
                    $(this).val(fval);
                    nextTr.find(".maxnum").val(fval);
                }else{
                    nextTr.find(".maxnum").val("");
                }
                
            }).on("keyup",function(){
                var nowval = $(this).val();
                if(nowval){
                    $(this).val(nowval.replace(/[^\-?\d.]/g,''));
                }
            });
        }
	}
	module.exports = scorePointCalculateMethodSet;
	window.course = scorePointCalculateMethodSet;
});
