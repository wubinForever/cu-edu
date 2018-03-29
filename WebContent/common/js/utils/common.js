/**
 * 1. 选中行勾选复选框选
 * 2. 勾选复选框选中行
 * 3. 点击全选按钮，所有行勾选
 * 4. 复选框不可选
 * 5. 单选复选点击样式切换
 */
define(function(require, exports, module) {
	var utils = require("../utils/utils");
	var cookieUtils = require("../utils/cookieUtils");
	var title = require("../config/title.config");
	var common = {
		
		init : function() {
			//获取上一次设置的皮肤
			var skinDate = cookieUtils.getCookie('skinName');
			
			if(utils.isNotEmpty(skinDate)){
				//修改框架皮肤名称
				$("body").removeClass().addClass(skinDate); 
			}else{
				//默认皮肤加载
				var skinDate = $(window.parent.document).find("body").attr("class");
				$("body").addClass(skinDate); 
			}
			
			//替换标签页名称
			$("title").html(title.name);
			
			//单击table的tr，切换行头复选框选中状态
			$(document).on(
				"click",
				".tr-checkbox",
				function(e) {					
					var ischeck = $(this).find("input[type = checkbox]:lt(1)").prop("checked"),
						isradio = $(this).find("input[type = radio]").prop("checked");
					var flag = e.target.type == "checkbox",
						flag2 = e.target.type == "radio";
					var text = e.target.type =="text";
					var select = e.target.type == "select-one";
					var buttontype =e.target.type == "button";
				    var gr=	$(e.target).attr("title")=="Collapse";
				    var tg=	$(e.target).attr("title")=="Expand";
				    var sdiv=$(e.target).attr("class")=="s-mult";
				    var sc=$(e.target).attr("name")=="scsCheckBox";
				    var sl=$(e.target).parent().attr("class")=="s-mult";
				    
				   
					if (!flag && !flag2 && !buttontype && !gr && !tg && !text &&!select && !sdiv && !sc && !sl) {
						//表格复选选择
						if (ischeck) {
							
							$(this).removeClass("active-tr");
							$(this).find("input[type = checkbox]:not([disabled])").prop(
									"checked", false).parent().removeClass("on-check");
							
						} else {
							
							if($(this).find("input[type = checkbox]").attr("disabled") == "disabled"){

							}else{
								$(this).addClass("active-tr");
								$(this).find("input[type = checkbox]:not([disabled])").prop(
										"checked", true).parent().addClass("on-check");
							}
						}
						//表格单选选择
						if (isradio) {
							//$(this).removeClass("active-tr");
							//$(this).find("input[type = radio]:not([disabled])").prop(
									//"checked", false).parents("label").removeClass("on-radio");
						} else {
							
							var parentTag = $(this).siblings().find("label");
							
							parentTag.removeClass("on-radio");
							$(this).siblings().removeClass("active-tr");	
							$(this).addClass("active-tr");
							$(this).find("input[type = radio]:not([disabled])").prop(
								"checked", true).parents("label").addClass("on-radio");
						}
						
						// 获取全选ID
						var checkdAllId = $(this).parent().prev().find("input").attr("id");
						// 禁用状态下全选的判断
						if ($(this).parent().find("input[type = checkbox][name!='scsCheckBox']:not([disabled])").length == $(this).parent().find("input[type = checkbox][name!='scsCheckBox']:not([disabled]):checked").length
								&& $(this).parent().find("input[type = checkbox]:not([disabled]):checked").length != 0) 
						{
							$("#"+checkdAllId).prop("checked", true).parent().addClass("on-check");
						}
						else 
						{
							$("#"+checkdAllId).removeAttr("checked").parent().removeClass("on-check");
						}
						
					}
					
					//单击table的checkbox，切换tr选中状态
					if ((flag && !sc && !sdiv && !sl)|| flag2) {
						//表格复选选择
						if (ischeck) {
							$(this).addClass("active-tr");
							$(this).find("input[type = checkbox]:not([disabled])").prop(
									"checked", true).parent().addClass("on-check");
							
							
						} else {
							$(this).removeClass("active-tr");
							$(this).find("input[type = checkbox]:not([disabled])").prop(
									"checked", false).parent().removeClass("on-check");
							
						}
						//表格单选选择
						if (isradio) {
							$(this).addClass("active-tr");
							$(this).siblings().removeClass("active-tr");
							$(this).find("input[type = radio]:not([disabled])").prop(
									"checked", true).parents("label").addClass("on-radio");
						} else {
							$(this).removeClass("active-tr");
							$(this).find("input[type = radio]:not([disabled])").prop(
									"checked", false).parents("label").removeClass("on-radio");
						}
					}
				});
				
				
			   //全选	
			   utils.checkAllCheckboxes('check-all', 'checNormal');
			   
			   //复选框点击
			   this.checkCss();
			   //单选框点击
			   this.radioCss();
			   
			   //初始化数字控件
			   this.spinnerNumber();
			   
			   //左右切换tab
			   this.tabInit();
			   
			   //解决 ie10~11 输入框偶发不能点击输入
			   $("input[type='text']").each(function () {
					$(this).focus(function () {
						$(this).select();
					});
				});
			   
		},
		
		//复选框不可选
	   checkDisable: function(){
			$.each($(".checkbox-con"), function(i, obj){
				//初始化 加载不可选状态
				$(obj).removeClass("on-check");
				if($(obj).children("input").attr("disabled") == "disabled"){
					$(obj).addClass("disabled-check");
					$(obj).parents("tr").addClass("tr-checkbox-disabled");
				}
			});
		},
		
		/**	
		 * 公用的方法 复选单选点击
		 */
		checkCss: function(){
			//点击状态
			$(document).on("click", ".checkbox-con",  function(e){
				var objenable = e.currentTarget,
					ischeck = $(objenable).children("input[type = checkbox]:not([disabled])").prop("checked");
				
				//点击后	
				if(ischeck){
					$(objenable).children("input[type = checkbox]").prop("checked", true);
					$(objenable).addClass("on-check");
					
				//取消点击	
				}else{
					$(objenable).children("input[type = checkbox]").prop("checked", false);
					$(objenable).removeClass("on-check");
					
					
				}
			 });
		},
		
		radioCss: function(){
			$(document).on("click", ".radio-con", function(e){
				var _this = $(this).attr("class");
				if(_this == "radio-con disabled-radio"){
					return;
				}
				//获取对象的name
				var	name = $(this).children().attr("name");
 				//遍历相同name的单选
				var otherObj = $(document).find("input[name="+name+"]");
				//debugger
			    otherObj.parents("label").removeClass("on-radio");
			    $(this).parent().addClass("on-radio");
			})
		},
		/**
		 * input框，点击按钮进行数字操作的控件
		 */
		spinnerNumber :function(){
			$(".spinner").each(function(){
				var spinner = $(this);
				var input = spinner.find("input");
				spinner.find(".btn:last-of-type").unbind("click").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) - 1;
					var min = parseInt(input.attr("min"));
					if(!min || inputVal >= min){
						input.val(inputVal);
					}
					  event.stopPropagation();    //  阻止事件冒泡
				});
				spinner.find(".btn:first-of-type").unbind("click").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) + 1;
					var max = parseInt(input.attr("max"));
					if(!max || inputVal <= max){
						input.val(inputVal);
					}
					  event.stopPropagation();    //  阻止事件冒泡
				});
				input.unbind("change").change(function(){
					var currentValue = parseInt($(this).val());
					var min = parseInt(input.attr("min"));
					var max = parseInt(input.attr("max"));
					if(isNaN(currentValue)){
						$(this).val("");
						return ;
					} 
					if(min && currentValue <= min){
						currentValue = min;
						$(this).val(currentValue);
					}
					if(max && currentValue >= max){
						currentValue = max;
						$(this).val(currentValue);
					}
					
					//去除左侧0
					if(currentValue == 0){
				    	$(this).val("0");
				    }else{
				    	$(this).val((currentValue+"").replace(/\b(0+)/gi,""));
				    } 
				});
				input.unbind("keydown").keydown(function (e) {
				    var code = parseInt(e.keyCode);
				    if (code >= 96 && code <= 105 || code >= 48 && code <= 57 || code == 8 || code == 46) {
				        return true;
				    } else {
				        return false;
				    }
				});
			});
		},
		
		/*
		 * tab切换
		*/
		
	   tabInit : function() {
	   	
		    var $tabBox = $(document).find(".tab-box"),
		     	$tabLi = $tabBox.children(".tab-hd").find("li"), //注意children()的用法
		     	$bdCon = $tabBox.children(".tab-bd").find(".bd-con");
		     	
		    $tabLi.click(function(){
			     var index = $(this).index();
			     $(this).addClass("cur").siblings("li").removeClass("cur");
			     $bdCon.hide().eq(index).fadeIn(300);
		    });
	    
	   },
	   
	   /*
	    * table行内td统一添加 title 
	    */
	   titleInit : function() {
			var trArr = $(document).find(".table>tbody>tr>td:not([data]):not([title])").each(function(n, td){
		    	$(td).attr("title", $(td).text());
			});
	   }
	   
	
	}
	common.init();
	module.exports = common;
});
