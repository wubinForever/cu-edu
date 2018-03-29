define('module/core/datePicker', function (require, exports, module) {
	require('base/jquery/jquery.ui.core.min');
	require('base/jquery/jquery.ui.datepicker.min');
	require('base/jquery/jquery.ui.timepicker.addon');

	var dateText = {	
		showDate: function(id,showTimepicker) {
				$("#"+id).datetimepicker({
					showSecond: true, //显示秒
			    	showButtonPanel:true,
			    	showTimepicker: showTimepicker,
			    	dateFormat: "yy-mm-dd",
			    	timeFormat: "HH:mm:ss",//格式化时间
			    	stepHour: 1,//设置步长
			    	stepMinute: 5,
			    	stepSecond: 5,
			    	//closeText:'关闭',
			    	onClose: function(dateText, inst) {
			
			    	}
			    });
			}
	};	
	window.dateText = dateText;
	module.exports = dateText;
 });

