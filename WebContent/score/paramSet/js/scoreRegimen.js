/**
 * 分制设置
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
	 * 分制设置
	 */
	var scoreRegimen = {
		// 初始化
		init : function() {
			// 新增
			$(document).on("click", "button[name='add']", function() {
				scoreRegimen.add(this);
			});
			// 查看
			$(document).on("click", "button[name='view']", function() {
				scoreRegimen.view(this);
			});
			//删除
			$(document).on("click", "[name='outdelete']",function(){	
				  scoreRegimen.deleteScore(this); 
		    });
			//修改
			$(document).on("click", "[name='update']",function(){	
				  scoreRegimen.update(this); 
		    });
			// 新增
            $(document).on("click", "#addCourse", function() {
            	scoreRegimen.addList();
            });
            //子页面弹窗删除
            $(document).on("click", "button[name='delete']", function() {
	    	    var parentObj = $(this).parents("tr");
                var index = parentObj.index();
                scoreRegimen.deleteList(parentObj,index);
            });
			//初始化验证
			scoreRegimen.validateText($("#addForm"));
			scoreRegimen.inputDataChange();
			scoreRegimen.inputDatasChange();
			scoreRegimen.queryList();
			scoreRegimen.validate();
		},
		
		//查询list
		queryList:function(){
			ajaxData.contructor(true);
			ajaxData.request(url.GET_ALLLIST, null, function(data) {
				 if(data && data.data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
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
        	//等级中文名称
        	$(".cname").on("focusout",function(){
                if(!$(this).val()){
                   $(this).next().show().text("请输入等级中文名称");
                }else{
                   $(this).next().hide().text("");
                }
        	});

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

            //对应百分制分数
        	$(".middlenum").on("focusout",function(){
        	    var thisVal = parseFloat($(this).val());
        	    var maxVal = parseFloat($(this).parents("tr").find(".maxnum").val());
        	    var mininum  = parseFloat($(this).parents("tr").find(".mininum").val());
        	    //序号
        	    var tdText = $(this).parents("tr").find("td:eq(0)").text();
                if(!thisVal && thisVal !=0){
                   $(this).next().show().text("请输入百分制分数");
                }else if(thisVal<mininum||thisVal>=maxVal){
                	if(tdText==1){
                		if(thisVal <mininum || thisVal>maxVal){
                			$(this).next().show().text("必须在分数段之间");
                		}else{
                			$(this).next().hide().text("");
                		}
                	}else{
                		$(this).next().show().text("必须在分数段之间");
                	}
                }else{
                   $(this).next().hide().text("");
                }
        	});
        },
        //保存时验证
        validateSave:function(obj){
        	
            obj.$(".cname").each(function(){
                if(!$(this).val()){
                   $(this).next().show().text("请输入等级中文名称");
                }else{
                   $(this).next().hide().text("");
                }
            });

            obj.$(".mininum").each(function(){
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

            obj.$(".middlenum").each(function(){
                var thisVal = parseFloat($(this).val());
        	    var maxVal = parseFloat($(this).parents("tr").find(".maxnum").val());
        	    var mininum  = parseFloat($(this).parents("tr").find(".mininum").val());
        	    //序号
        	    var tdText = $(this).parents("tr").find("td:eq(0)").text();
                if(!thisVal && thisVal !=0 ){
                   $(this).next().show().text("请输入百分制分数");
                }else if(thisVal<mininum||thisVal>=maxVal){
                	if(tdText==1){
                		if(thisVal <mininum || thisVal>maxVal){
                			$(this).next().show().text("必须在分数段之间");
                		}else{
                			$(this).next().hide().text("");
                		}
                	}else{
                		$(this).next().show().text("必须在分数段之间");
                	}
                }else{
                   $(this).next().hide().text("");
                }
            });

            var count = 0;
            obj.$("label.error").each(function(){
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
	               var list = '<tr><td class="width48">'+len+'</td><td class="width20 scorepadding"><div class="tip-text verification-info"><input type="text" class="form-control inp-minimum cname"  maxlength="10"><label class="error"></label></div></td>'
	                          +'<td class="width20"><input type="text" class="form-control inp-minimum"><label class="error"></label></div></td>'
	                          +'<td class="scorepadding"><div class="tip-text verification-info"><input type="text" value="'+lastMinNum+'" class="form-control inp-minimum text-r inline-block maxnum" style="width:80px;" disabled="disabled" > > 分数 ≥ <input type="text" class="form-control inp-minimum text-r inline-block mininum"  style="width:80px;"><label class="error"></label></div></td>'
	                          +'<td class="width120 scorepadding"><div class="tip-text verification-info"><input type="text" class="form-control inp-minimum middlenum text-r" style="width:100px;"><label class="error"></label></div></td>'
	                          +'<td class="width60"><button type="button" class="btn-text" name="delete">删除</button></td></tr>';
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
	          scoreRegimen.inputDataChange();
	          scoreRegimen.inputDatasChange();
	          scoreRegimen.validate();
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
	            scoreRegimen.inputDataChange();
	            scoreRegimen.inputDatasChange();
	            scoreRegimen.validate();
	        },
	        
		/**
		 * 新增 弹窗
		 */
		add: function(){
			var mydialog = popup.open('./score/paramSet/html/scoreRegimenAdd.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '分制新增',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 800,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function(obj){
					 //验证参数	
					 var boole = obj.$("#addForm").valid();
					 //验证输入框各个值得正确性
					 var valid =scoreRegimen.validateSave(obj);
					 
			         if(valid && boole){
                         var scoreRegimenName = obj.$("#scoreRegimenName").val();
						 var isHierarchical  = obj.$(":radio:checked").val();
						 var param = [];
						 obj.$("#tbody tr").each(function(){//拿到每次选中的每一行
							 var scoredeto = {};
							 var inputObj= $(this).find("input");
							 scoredeto.cnName = inputObj.eq(0).val();//中文名称
							 scoredeto.enName = inputObj.eq(1).val();
							 scoredeto.scoreBegin = parseFloat(inputObj.eq(2).val()).toFixed(1);
							 scoredeto.scoreEnd  = parseFloat(inputObj.eq(3).val()).toFixed(1);
							 scoredeto.percentileScore = parseFloat(inputObj.eq(4).val()).toFixed(1);
							 scoredeto.scoreRegimenName = scoreRegimenName;//分制名称
							 scoredeto.isHierarchical = isHierarchical;//是否等级制
							 param.push(scoredeto);
						 })
						 var reqre={};
						 reqre.scoreReginmenDetailDto=param;
						 ajaxData.contructor(true);
						 ajaxData.setContentType("application/json;charset=UTF-8");
						 ajaxData.request(url.SCORE_REGIMEN_DETAIL_ADD,JSON.stringify(reqre),function(data){
				 		    	ajaxData.setContentType("application/x-www-form-urlencoded");
				 		    	if(data.code==config.RSP_SUCCESS){
				 		    		mydialog.close();//关窗
				 		    		popup.okPop("保存成功",function(){});
				 		    		scoreRegimen.queryList();//回调
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
		 * 父级窗口删除
		 * @param obj
		 */
		deleteScore:function(obj){
            var reqData =  {};
            reqData.scoreRegimenId =  $(obj).attr("scoreRegimenId");
			popup.askPop('确定删除此分制？',function(){
				ajaxData.contructor(false);
			    ajaxData.request(url.SCORE_DELETE_REGIMEN,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		popup.okPop("删除成功",function(){});
			    		scoreRegimen.queryList();//回调
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
		 * 查看初始化详情
		 */
		initDetail:function(){
			var obj = popup.data("obj");
			var reqData = {};
			reqData.scoreRegimenId = $(obj).attr("scoreregimenid")
			ajaxData.contructor(false);
		    ajaxData.request(url.SCORE_GET_ITEM_ALLLIST,reqData,function(data){
		    	 if(data && data.data.length != 0){
		    		 $("#viewName").text(data.data[0].scoreRegimenName);
					 $("#tbody").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#tbody").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
		},
		
		/**
		 * 查看弹窗
		 */
		view: function(obj){
		    popup.data("obj",obj);//传值过去
		    popup.open('./score/paramSet/html/scoreRegimenView.html', // 这里是页面的路径地址
				{
					id : 'view',// 唯一标识
					title : '分制查看',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 320,// 弹窗高度
					fixed: true,
					cancelVal : '关闭',
					cancel : function() {
					}
				});
		},
		
		/**
		 * 修改初始化详情
		 */
		initUpdate:function(){
			var obj = popup.data("obj");
			var reqData = {};
			var scoreRegimenId  = $(obj).attr("scoreregimenid");
			reqData.scoreRegimenId = scoreRegimenId;
			ajaxData.contructor(false);
		    ajaxData.request(url.SCORE_GET_ITEM_ALLLIST,reqData,function(data){
		    	 if(data && data.data.length != 0){
		    		 $("#scoreRegimenName").val(data.data[0].scoreRegimenName);
					 $("#tbody").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#tbody").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
			});
		    
		    $(document).on("click", "button[name='delete']", function() {
		    	    var parentObj = $(this).parents("tr");
	                var index = parentObj.index();
	                scoreRegimen.deleteList(parentObj,index);
			});
		    
		    // 新增
            $(document).on("click", "#addCourse", function() {
            	scoreRegimen.addList();
            });
        	//初始化验证
			scoreRegimen.validateTextUpdate($("#addForm"),scoreRegimenId);
			scoreRegimen.inputDataChange();
			scoreRegimen.inputDatasChange();
			scoreRegimen.validate();
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
            scoreRegimen.inputDataChange();
            scoreRegimen.inputDatasChange();
        },
		
		/**
		 * 修改弹窗
		 */
		update: function(obj){
			
			popup.data("obj",obj);//传值过去
			var scoreRegimenId = $(obj).attr("scoreRegimenId");
			var mydialog = popup.open('./score/paramSet/html/scoreRegimenModify.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '分制修改',// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 420,// 弹窗高度
					fixed: true,
					okVal : '保存',
					cancelVal : '关闭',
					ok : function(obj){
					 //验证参数	
					 var boole = obj.$("#addForm").valid();
					 //验证输入框各个值得正确性
					 var valid =scoreRegimen.validateSave(obj);	
					 if(boole && valid){
						 var scoreRegimenName = obj.$("#scoreRegimenName").val();//分制名称
						 var scoreRegimenName = obj.$("#scoreRegimenName").val();
						 var isHierarchical  = obj.$(":radio:checked").val();
						 var param = [];
						 obj.$("#tbody tr").each(function(){//拿到每次选中的每一行
						 var scoredeto = {};
						 var inputObj= $(this).find("input");
						 var td = $(this).find("td:first");
						 scoredeto.cnName = inputObj.eq(0).val();//中文名称
						 scoredeto.enName = inputObj.eq(1).val();
						 scoredeto.scoreBegin = parseFloat(inputObj.eq(2).val()).toFixed(1);
						 scoredeto.scoreEnd = parseFloat(inputObj.eq(3).val()).toFixed(1);
						 scoredeto.percentileScore = parseFloat(inputObj.eq(4).val()).toFixed(1);
						 scoredeto.scoreRegimenName = scoreRegimenName;//分制名称
						 scoredeto.isHierarchical = isHierarchical;//是否等级制
						 scoredeto.scoreRegimenId = scoreRegimenId;
						 scoredeto.scoreRegimenDetailId = td.attr("scoreRegimenDetailId");
						 param.push(scoredeto);
						 })
						 var reqre={};
						 reqre.scoreReginmenDetailDto=param;
						 ajaxData.contructor(true);
						 ajaxData.setContentType("application/json;charset=UTF-8");
						 ajaxData.request(url.SCORE_REGIMEN_UPDATE,JSON.stringify(reqre),function(data){
				 		    	ajaxData.setContentType("application/x-www-form-urlencoded");
				 		    	if(data.code==config.RSP_SUCCESS)
				 		    	{
				 		    		mydialog.close();//关窗
				 		    		popup.okPop("保存成功",function(){});
				 		    		scoreRegimen.queryList();//回调
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
        },
		
        //新增 验证只能输入
        validateText:function(formId){
        	ve.validateEx();
        	formId.validate({
				rules : {
					scoreRegimenName:{
						"required" : true,
					}
				},
				messages : {
					scoreRegimenName:{
						"required" : '分制名称不能为空',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
        	
        	//分制名称不能重复
			jQuery.validator.addMethod("scoreRegimenNameRepeatVerify", function(value,element) {
				return false;	
			}, "分制名称已经存在");
			//分制名称改变的时候进行改变
			$(document).on("change", "#scoreRegimenName",function(){	
				var scoreRegimenName = $.trim($(this).val());
				if (utils.isNotEmpty(scoreRegimenName)){
					var param =
			        {
                      scoreRegimenName : scoreRegimenName
					};
					ajaxData.contructor(false);
					ajaxData.request(url.SCORE_IS_SCOREREGINAME_EXIT,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS) {					
							if(data.data){
								$("#scoreRegimenName").rules("add",	{"scoreRegimenNameRepeatVerify" : true,	messages : {"scoreRegimenNameRepeatVerify" : "分制名称不能重复"}});
							}else{
								$("#scoreRegimenName").rules("remove","scoreRegimenNameRepeatVerify");
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
        
        
        //修改只能输入
        validateTextUpdate:function(formId,scoreRegimenId){
        	ve.validateEx();
        	formId.validate({
				rules : {
					scoreRegimenName:{
						"required" : true,
					}
				},
				messages : {
					scoreRegimenName:{
						"required" : '分制名称不能为空',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
        	
        	//分制名称不能重复
			jQuery.validator.addMethod("scoreRegimenNameRepeatVerify", function(value,element) {
				return false;	
			}, "分制名称已经存在");
			//分制名称改变的时候进行改变
			$(document).on("change", "#scoreRegimenName",function(){	
				var scoreRegimenName = $.trim($(this).val());
				if (utils.isNotEmpty(scoreRegimenName)){
					var param =
			        {
                      scoreRegimenName : scoreRegimenName,
                      scoreRegimenId:scoreRegimenId
					};
					ajaxData.contructor(false);
					ajaxData.request(url.SCORE_IS_SCOREREGINAME_EXIT,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS) {					
							if(data.data){
								$("#scoreRegimenName").rules("add",	{"scoreRegimenNameRepeatVerify" : true,	messages : {"scoreRegimenNameRepeatVerify" : "分制名称不能重复"}});
							}else{
								$("#scoreRegimenName").rules("remove","scoreRegimenNameRepeatVerify");
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
	module.exports = scoreRegimen;
	window.scoreRegimen = scoreRegimen;
});