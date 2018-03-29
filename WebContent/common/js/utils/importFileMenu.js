/**
 * 导入操作类
 */
define(function(require, exports, module) {
	
	var uploaderFile = require("../base/core/uploadUtil"); //文件上传帮助
	var config = require("./config"); //文件上传帮助
	var ajaxData = require("./ajaxData"); //文件上传帮助
	var utils = require("./utils"); //文件上传帮助
	require("./common"); 
	var config = require("./config");
	var popup = require("./popup");
 
	/**
	 * 单位信息导入
	 */
	var importFileMenu = {
		init : function(option){
			this.option = option;
			var me = this;
			var uploader = new uploaderFile({
		        $id: "uploaderDiv",
		        callBack: function (data) {
		        	ajaxData.checkStatus(data);
		        	if(data.code == config.RSP_SUCCESS){
		        		importFileMenu.loadBack(data.data);
		        		me.option.successCallback();
		        	}else{
		        		popup.errPop(data.msg);
		        	}
		        },
		        extensions: me.option.extensions,
		        uploadUrl:  me.option.uploadUrl.url,
		        auto:false,
		        beforeFileQueued:function(file){
					$("#showFileName").val(file.name);
					return true;
				},
				uploadBeforeSend:function(object, data, headers){
					data.isAppend = $("input[name='isValidity']:checked").val();
				}
		    });
			uploader.init();
			
			$("#importBtn").click(function(){
				uploader.upload();
			});
			
			$("#exportTemplate").click(function(){
				ajaxData.exportFile(me.option.templateUrl);
			});
			$("#exportFailBtn").click(function(){
				if($("#tbody tr").length > 0){
					ajaxData.exportFile(me.option.exportFailUrl);
				}else{
					$(this).removeClass("btn-success").addClass("disabled");
				}
			}).removeClass("btn-success").addClass("disabled");
			
			this.setThead();
		},
		/**
		 * 导入后数据处理
		 */
		loadBack : function(data){
			$("#successCount").html(data.successCount + "条");
			$("#failCount").html(data.failCount + "条");
			var outputMessages = data.list;
			if(outputMessages){
				var displayMaxCount = 100;
				var displayedMessages = outputMessages.slice(0, outputMessages.length > displayMaxCount ? displayMaxCount : outputMessages.length);
				this.setTbody(displayedMessages);
			}
		},
		/**
		 * 设置错误信息显示去取的头部值
		 */
		setThead : function(){
			if(this.option.data && this.option.data.length > 0){
				var tr = $("#thead tr");
				tr.append("<th>序号</th>");
				$.each(this.option.data, function(i, item){
					tr.append("<th>"+item.name+"</th>");
				});
			}
		},
		setTbody : function(list){
			var me = this;
			$("#tbody").empty();
			if(list && list.length > 0){
				$("#exportFailBtn").addClass("btn-success").removeClass("disabled");
				var tbody = $("#tbody");
				$.each(list, function(i, item){
					var tr = $("<tr></tr>");
					tr.append("<td>"+(i+1)+"</td>");
					if(me.option.data && me.option.data.length > 0){
						$.each(me.option.data, function(i, bean){
							var value = item[bean.field];
							if(utils.isEmpty(value)){
								value = "";
							}
							tr.append("<td title='"+value+"'>"+value+"</td>");
						});
					}
					tbody.append(tr);
				});
			}else{
				$("#exportFailBtn").removeClass("btn-success").addClass("disabled");
			}
		}
	}
	module.exports = importFileMenu;
});
