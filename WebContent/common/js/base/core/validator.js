define("base/core/validator", function(require, exports, module)
{
	var utils = require("base/core/common");
	require("base/jquery/jquery.qtip.js");
	
	var validator =
	{
		tipShowTime: 5000,
		timeoutIdMap: {},
		showValidateMsg: function(validateSpace, errors)//显示验证失败信息
		{
			validator.clearValidateMsg(validateSpace);
			for(var key in errors)
			{
				var input = $("[validate-space='" + validateSpace + "'] [name='" + key + "']");
				input.qtip({
					content: {text: errors[key]},
					position: {
						at: "center right",
						my: "left center"
					},
					style: {
						classes: "qtip-red"
					},
					show: true,
					hide: false
				});
			}
			
			validator.timeoutIdMap[validateSpace] = setTimeout(function(){
				validator.clearValidateMsg(validateSpace);
			}, this.tipShowTime)
			
			$("[validate-space='" + validateSpace + "'] [data-dismiss='modal']").each(function(i, o) {
				var $o = $(o);
				$o.unbind("click.validate.destroy").bind("click.validate.destroy", function(){
					validator.clearValidateMsg(validateSpace);
				})
				
			})
		},
		clearValidateMsg: function(validateSpace, key)//清楚验证失败信息
		{
			if(utils.isEmpty(key))
			{
				$("[validate-space='" + validateSpace + "'] [name]").qtip('destroy', true);
				
				if(validator.timeoutIdMap[validateSpace]) {
					clearTimeout(validator.timeoutIdMap[validateSpace]);
					delete validator.timeoutIdMap[validateSpace];
				}
				return;
			}
			
			$("[validate-space='" + validateSpace+"'] [name='" + key + "']").qtip('destroy', true);
		}
	}
	
	module.exports = validator;
});