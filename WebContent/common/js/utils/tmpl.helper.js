define(function (require, exports, module) {
	var utils = require("./utils");
	var helper = {
		format : function(time, format){
			if(utils.isNotEmpty(time))
			{
				if(!format){
					format = "yyyy-MM-dd hh:mm:ss";
				}
				return new Date(time).format(format);
			}else{
				return "";
			}
			
		}, 
		showOrder:function(index){
            return index < 10 ? ("0"+index):index
		},
		/**
		 * 十进制转二进制补0
		 */
		repairZero:function(a, length){
			var b = "";
			if(a){
				b = a.toString(2);
			}
			if(b.length < length){
				for(var i = 0 , l = b.length ; i < length - l ; i ++){
					b = "0" + b;
				}
			}
			return b;
		}
	}
	
	
	module.exports = helper;
});