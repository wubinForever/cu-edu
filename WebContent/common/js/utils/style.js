/**
 * 单选复选样式定义
 * 1.复选框不可选
 * 2.单选复选点击样式切换
 */
define(function(require, exports, module) {
	var style = {
		init : function() {
			this.checkCss();
			this.radioCss();
		},
	
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
				var objenable = e.currentTarget;
				
				//点击后	
				if( $(objenable).children("input[type = checkbox]:not([disabled])").prop("checked") == true ){
					$(objenable).addClass("on-check");
					
				//取消点击	
				}else{
					$(objenable).removeClass("on-check");
				}
			 });
		},
		
		radioCss: function(){
			$(document).on("click", ".radio-con", function(){
			    $(this).parent().addClass("on-radio").siblings().removeClass("on-radio");
			})
		},
	}
	style.init();
	module.exports = style;
});
