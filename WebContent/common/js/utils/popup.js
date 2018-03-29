define(function (require, exports, module) {
	var utils = require("./utils");
	var popup={
		tipsPop:function(content){
			return art.dialog.tips(
					content     //这里是内容
					).time(2)       //这里是自动关闭的时间：2s ，可以不写。所有弹窗通用
		},
		
		waitPop:function(){
			return art.dialog.waiting
			(
					'正在查询中，请稍后！',       //这里是内容
					function(){               //弹出时执行的事件
						 alert("弹出了消息");
					},
					function(){               //关闭时执行的事件
						alert("关闭了消息");
					}
			)
		},
		askPop:function(content,callback){
			return window.top.art.dialog.confirm('question','提示信息',content,callback,function(){});
		},
		askPop:function(content,confirmCall,cancelCall){
			return window.top.art.dialog.confirm('question','提示信息',content,confirmCall,cancelCall);
		},
		askDeletePop:function(content,callback){
			return window.top.art.dialog.confirm('question','提示信息',"确认删除所选{0}吗？".placeholderFormat(content),callback,function(){});
		},
		okPop:function(content,callback){
			//window.top.art.dialog.alert('succeed','成功提示',content,callback).time(2);			
			window.top.art.dialog.tipsWithICON("succeed",content,2);
			setTimeout(callback, 2000); 			 
		},
		warPop:function(content, callback){
			return window.top.art.dialog.alert('warning','警告提示',content,function(){if(callback)callback();else return true;});
		},
		errPop:function(content, callback){
			return window.top.art.dialog.alert('error','错误信息',content,function(){if(callback)callback();else return true;});
		},
		open:function(url,param){
			return window.top.art.dialog.open(url,param);
		},
		dialog:function(obj){
			return window.top.art.dialog(obj);
		},
		data : function(key, value){
			if(value){
				window.top.art.dialog.removeData(key);
				window.top.art.dialog.data(key, value);
			}else{
				return window.top.art.dialog.data(key);
			}
		},
		setData:function(key, value){
			if(!value) value = {};
			window.top.art.dialog.removeData(key);
			window.top.art.dialog.data(key, value);
		},
		getData : function(key){
			return window.top.art.dialog.data(key);
		}
	}
    module.exports = popup;
	window.popup = popup;
});
