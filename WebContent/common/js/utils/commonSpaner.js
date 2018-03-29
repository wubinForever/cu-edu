/**
 * 1.培养方案数字控件公共的js
 */
define(function(require, exports, module) {
	var utils = require("../utils/utils");
	var common = {
		init : function() {
			   this.spinnerNumber();
		},
		/**
		 * input框，点击按钮进行数字操作的控件
		 */
		spinnerNumber :function(){
			$(".spinner").each(function(){
				var spinner = $(this);
				var input = spinner.find("input");
				spinner.find(".btn:last-of-type").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) - 1;
					var min = input.attr("min");
					if(!min || inputVal >= min){
						input.val(inputVal);
					}
				   var totalPeriod=0;
				   $(this).parent().parent().parent().parent().find("input[type=text]:lt(4)").each(function(){
					var val=$(this).val();
					if(val){
						totalPeriod+=(parseInt(val));
					 }		
				   })
				  $(this).parent().parent().parent().parent().find("td[name=totalPeriod]").html(totalPeriod);
				  event.stopPropagation();    //  阻止事件冒泡
				});
				spinner.find(".btn:first-of-type").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) + 1;
					var max = input.attr("max");
					if(!max || inputVal <= max){
						input.val(inputVal);
					}
					var totalPeriod=0;
					$(this).parent().parent().parent().parent().find("input[type=text]:lt(4)").each(function(){
				    var val=$(this).val();
					if(val){
							totalPeriod+=(parseInt(val));
						}		
					})
					$(this).parent().parent().parent().parent().find("td[name=totalPeriod]").html(totalPeriod);
					event.stopPropagation();    //  阻止事件冒泡
				});
				input.change(function(){
					var currentValue = $(this).val();
					if(!currentValue) return;
					var min = input.attr("min");
					var max = input.attr("max");
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
				    	$(this).val(currentValue.replace(/\b(0+)/gi,""));
				    } 
				});
				input.keydown(function (e) {
				    var code = parseInt(e.keyCode);
				    if (code >= 96 && code <= 105 || code >= 48 && code <= 57 || code == 8 || code == 46) {
				        return true;
				    } else {
				        return false;
				    }
				});
			});
		}
	
	}
	common.init();
	module.exports = common;
});
