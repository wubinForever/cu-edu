define("base/core/httpUtils", function(require, exports, module)
{
	var utils = require("base/core/common"),
		validator = require("base/core/validator");

	var HttpUtils =
	{
		defaultVer : "",
		baseUrl : CONTEXT_PATH + "/", //以/结尾
		invalidParamResultCode: 101001,
		post : function(options)
		{
			options.type = "POST";
			return HttpUtils.sendRequest(options)
		},
		get : function(options)
		{
			return HttpUtils.sendRequest(options)
		},

		/**
		 * 此处options中应该有buildParamFn属性，为获取参数的方法 如下： 
		 * 	options.buildParamFn = function(){ 
		 * 		var param = {}; 
		 * 		param.userId = $("#userId").val(); 
		 * 		param.userType = $("#userType").val();
		 * 		return param; 
		 * 	}
		 * 
		 * 除了分页组件按钮，其他触发刷新或者查询的按钮需要传入queryBtn参数 如下：
		 * 	options.queryBtn = $(".js-query-btn, .js-subject-id");
		 */
		page : function(options)
		{
			options.isPageRequest = true;
			if(utils.isNotEmpty(options.queryBtn))
			{
				if(typeof options.queryBtn=="string")
				{
					options.queryBtn = $(options.queryBtn);
				}
				options.queryBtn.unbind("click.httputils").bind("click.httputils", function()
				{
					HttpUtils.page(options)
				});
			}
			
			return HttpUtils.sendRequest(options);
		},
		sendRequest : function(options)
		{
			var newOptions = $.extend(true, {}, options);
			
			newOptions.url = HttpUtils.buildUrl(newOptions);
			newOptions.dataType = (newOptions.dataType || "JSON").toUpperCase();
			newOptions.type = (newOptions.type || "GET").toUpperCase();

			newOptions.success = function(rspBody)
			{
				if (HttpUtils.isSuccess(rspBody))
				{
					// 是否为分页请求
					if (newOptions.isPageRequest)
					{
						if(rspBody.result.totalSize==0) {
							$("#pagination").hide();
						}
						else
						{
							$("#pagination").show();
							utils.commonPagination(
									Math.ceil(rspBody.result.totalSize/rspBody.result.pageSize),
									rspBody.result.currentPageNo - 1,
									rspBody.result.totalSize,
									$("#pagination"),
									function(pageNo)
									{
										newOptions = $.extend(true, {}, options);
										newOptions.data.pageNo = pageNo + 1;
										HttpUtils.sendRequest(newOptions)
									}
							)
						}
					}

					if (typeof options.success === "function")
					{
						options.success(rspBody);
					}
				} else {
					
					
					if(options.validateSpace && HttpUtils.getResultCode(rspBody)==HttpUtils.invalidParamResultCode)//如果是参数校验不通过
					{
						validator.showValidateMsg(options.validateSpace, rspBody.errors);
					}
					else
					{
						if (typeof options.error === "function")
						{
							options.error(rspBody, true)
						}
						else
						{
							var resultErrMsg = HttpUtils.getErrorMsg(rspBody);
							MsgTips.alert((newOptions.errorMsg ? (newOptions.errorMsg + ":") : "") + resultErrMsg);
						}
					}
				}
			};

			if(typeof options.error === "function")
			{
				newOptions.error = function(rspBody)
				{
					HttpUtils.handleReturnCode(rspBody);
					options.error(rspBody);
				}
			}
			else
			{
				newOptions.error = function(rspBody)
				{
					if (!HttpUtils.handleReturnCode(rspBody))
					{
						MsgTips.alert("网络或系统出现异常");
					}
				}
			}
			
			if (newOptions.isPageRequest)
			{
				(typeof newOptions.buildParamFn == "function") && (newOptions.data = newOptions.buildParamFn())
				
				newOptions.data.pageNo = options.data.pageNo;
				newOptions.data.pageSize = options.data.pageSize;
			}
			
			if(typeof newOptions.beforeRequest == "function")
			{
				newOptions.beforeRequest();
			}
			
			return $.ajax(newOptions)
		},
		handleReturnCode : function(rspBody)
		{
			if (typeof rspBody !== "undefined")
			{
				var status = rspBody.status;
				if (typeof status !== "undefined")
				{
					if (status == 401)
					{
						MsgTips.showMessageBox(
						{
							content : "您已经太久没有操作了，请重新登录",
							callback : function()
							{
								location.reload();
							}
						});
					}
					else if(status == 400)
					{
						MsgTips.alert("请求失败，缺少必要的参数");
						return true;
					}
					else if(status == 404)
					{
						MsgTips.alert("调用的接口不存在");
						return true;
					}
				}
			}
			return false
		},
		isSuccess : function(rspBody)
		{
			if (utils.isEmpty(rspBody))
			{
				return false
			}
			return typeof rspBody.serverResult != "undefined"
					&& rspBody.serverResult != null
					&& rspBody.serverResult.resultCode == 0;
		},
		getErrorMsg : function(rspBody)
		{
			if (utils.isNotEmpty(rspBody)
					&& utils.isNotEmpty(rspBody.serverResult)
					&& utils.isNotEmpty(rspBody.serverResult.resultMessage))
			{
				return rspBody.serverResult.resultMessage;
			}
			else
			{
				return "系统出现未知错误";
			}
		},
		getResultCode: function(rspBody)
		{
			if (utils.isNotEmpty(rspBody)
					&& utils.isNotEmpty(rspBody.serverResult))
			{
				return rspBody.serverResult.resultCode;
			}
			return null;
		},
		buildUrl : function(options)
		{
			var url = options.url;
			if(options.url.indexOf(HttpUtils.baseUrl)==-1)
			{
				url = HttpUtils.baseUrl + options.url;
			}
			
			if(options.cache!=true)
			{
				url += (url.indexOf("?")==-1 ? "?_=" : "&_=") + new Date().getTime();
			}
			return url;
		}
	}
	module.exports = HttpUtils;
});