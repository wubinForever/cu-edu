define(function (require, exports, module) {

    var _language = {};
    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        }
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    
    String.prototype.placeholderFormat=function(){  
    	if(arguments.length==0) return this;  
    	for(var s = this, i=0; i < arguments.length; i++){
    		s = s.replace(new RegExp("\\{"+i+"\\}","g"), arguments[i]);  
    	}  
    	return s;  
    };  

    String.prototype.replaceAll = function (reallyDo, replaceWith, ignoreCase) {
        if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
            return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")), replaceWith);
        } else {
            return this.replace(reallyDo, replaceWith);
        }
    };
    
	    // 对字符串中的HTML进行转义
	String.prototype.encodeHTML = function() {
		if (this) {
			var str = this;
			str = str.toString();
			str = str.replace(/&/g, "&amp;");
			str = str.replace(/'/g, "&apos;");
			str = str.replace(/"/g, "&quot;");
			str = str.replace(/>/g, "&gt;");
			str = str.replace(/</g, "&lt;");
		}
		return str;
	};  

	    // 对字符串中的HTML转义字符进行解码
	String.prototype.decodeHTML = function() {
		if (this) {
			var str = this;
			str = str.toString();
			str = str.replace("&lt;", "<");
			str = str.replace("&gt;", ">");
			str = str.replace("&apos;", "'");
			str = str.replace("&quot;", "\"");
			str = str.replace("&amp;", "&");
		}
		return str;
	};    
    
    String.prototype.endsWidth = function (str) {
        if (this == str || str == null || str == "") {
            return true;
        } else {
            var l1 = this.length - 1;
            var l2 = str.length - 1;
            for (; l1 > -1 && l2 > -1 && (this.charAt(l1--) == str.charAt(l2--)););

            return l2 == -1 ? true : false;
        }
    }
    String.prototype.startWith = function (str) {
        if (str == null || str == "" || this.length == 0 || str.length > this.length)
            return false;
        if (this.substr(0, str.length) == str)
            return true;
        else
            return false;
    }
    String.prototype.toDateString = function () {
        if (!this) {
            return this;
        } else {
            return this.replace(/-/g,"/");
        }
    }
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] == obj) {
                return true;
            }
        }
        return false;
    };
    /**
     *  避免添加重复元素
     */
    Array.prototype.set = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] == obj) {
                return false;
            }
        }
        this.push(obj);
        return true;
    };
    
    //列表暂无数据   调用方法$("#tbodycontent").setNoDataHtml();
    (function($){
	   $.fn.setNoDataHtml = function($pagination){
		   if(this.find("tr").length == 0){
			   this.addClass("no-data-html");
			   //暂无数据时，隐藏分页控件
			   if($pagination && $pagination.length > 0){
				   $pagination.hide();
			   }
		   }else{
			   this.removeClass("no-data-html")
			   if($pagination && $pagination.length > 0){
				   $pagination.show();
			   }
		   }
		   return this;
	   }	   
    })(jQuery);
    
    
    var utils = {

        /**
         * getLangKey
         *
         * @param Object key
         * @returns Object
         */
        _parseLangKey: function (key) {
            var match, ns = 'core';
            if ((match = /^(\w+)\.(\w+)$/.exec(key))) {
                ns = match[1];
                key = match[2];
            }
            return { ns: ns, key: key };
        },

        _isArray: function (val) {
            if (!val) {
                return false;
            }
            return Object.prototype.toString.call(val) === '[object Array]';
        },

        _each: function (obj, fn) {
            if (utils._isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    if (fn.call(obj[i], i, obj[i]) === false) {
                        break;
                    }
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (fn.call(obj[key], key, obj[key]) === false) {
                            break;
                        }
                    }
                }
            }
        },
        _formatStr: function (text, param) {
            if (utils._isArray(param)) {
                for (var i in param) {
                    text = text.replace("{" + i + "}", param[i]);
                }
            } else {
                text = text.replace("{0}", param);
            }
            return text;
        },
        _lang: function (mixed, param, langType) {

            var langType = langType === undefined ? "zh_cn" : langType;
            if (typeof mixed === 'string') {
                if (!_language[langType]) {
                    return 'no language[' + mixed + '][' + langType + ']';
                }
                var text;
                var pos = mixed.length - 1;
                if (mixed.substr(pos) === '.') {
                    text = _language[langType][mixed.substr(0, pos)];
                } else {
                    var obj = utils._parseLangKey(mixed);

                    text = _language[langType][obj.ns][obj.key];
                }
                if (text && param != null) {
                    return utils._formatStr(text, param);
                } else {
                    return text;
                }
            }
            utils._each(mixed, function (key, val) {
                var obj = utils._parseLangKey(key);
                if (!_language[langType]) {
                    _language[langType] = {};
                }
                if (!_language[langType][obj.ns]) {
                    _language[langType][obj.ns] = {};
                }
                _language[langType][obj.ns][obj.key] = val;
            });
        },
        getRootPath : function () {
            //example： http://localhost:8083/uimcardprj/share/meun.jsp
        	var curWwwPath= window.document.location.href;  
        	var pathName = window.document.location.pathname;
        	if(window.document.location && window.document.location.href){
        		curWwwPath = window.document.location.href;        		
        	}else{
        		curWwwPath=iframe.contentWindow.location.href;
        		pathName = window.document.location.pathname;
        	}
            //var curWwwPath = window.document.location.href;
            //example： uimcardprj/share/meun.jsp
            var pos = curWwwPath.indexOf(pathName);
            //，example： http://localhost:8083
            var localhostPaht = curWwwPath.substring(0, pos);
            //"/"projectName，example：/uimcardprj
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            //return(localhostPaht + projectName);
            return(localhostPaht);
        },
        getRootPathName : function () {
            //example： http://localhost:8083/uimcardprj/share/meun.jsp
            var curWwwPath = window.document.location.href;
            //example： uimcardprj/share/meun.jsp
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            //，example： http://localhost:8083
            var localhostPaht = curWwwPath.substring(0, pos);
            //"/"projectName，example：/uimcardprj
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);
            return(localhostPaht + projectName);
        },
    	EMPTY : "",
    	isPAD : function(){
    		if(window.ebag!=undefined){
    			return true;
    		}
    		var ua = navigator.userAgent;
    		var ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    	    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    	    isAndroid = ua.match(/(Android)\s+([\d.]+)/),
    	    isMobile = isIphone || isAndroid;
    		if(isMobile){
    			return true;
    		}
    		return false;
    	},
    	isNotEmpty : function(objectEntity) {
    		if (objectEntity == null || objectEntity == ''
    				|| typeof (objectEntity) == 'undefined'
    				|| objectEntity == undefined || 'null' == objectEntity) {
    			return false;
    		}
    		return true;
    	},

    	isEmpty : function(objectEntity) {
    		if (objectEntity == null || objectEntity == ''
    				|| typeof (objectEntity) == 'undefined'
    				|| objectEntity == undefined || 'null' == objectEntity) {
    			return true;
    		}
    		return false;
    	},
    	
    	dealNull : function(stringVal) {
    		if (utils.isEmpty(stringVal)) {
    			return utils.EMPTY;
    		} else {
    			return stringVal;
    		}
    	},
    	getEmptyDiv: function(){
    	 var html = "<div class='m-nodata01'>"+
			  "<img class='center-block' src='"+CONTEXT_PATH+"/css/main/images/nodata02.png' alt='无数据' />"+
        	  "</div>";	
    	 return html;
    	},
    	isEmail : function(m) {
    		if ($.trim(m).length != 0) {
    			//reg =/^([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[-|\-|_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    			//reg = "\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*";
    			reg = new RegExp('\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*');
    			var r = m.match(reg);
    			if (r == null) 
    				return false;
    			return true;
    		}
    		return false;
    	},
    	isDate : function(t) {
    		if ($.trim(t).length != 0) {
    			var reg = /^(\d{4})(-|\/|\.)(\d{1,2})\2(\d{1,2})$|^\d{4}年\d{1,2}月\d{1,2}日$/;
    			var r = t.match(reg);
    			if (r == null)
    				return false;
    			return true;
    		}
    		return false;
    	},
    	isURL : function(url) {
    		var urlReg=/^((https|http|ftp|rtsp|mms):\/\/)?[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;	
    		if (!urlReg.test(url))
    		{
    			return false;
    	    }
    		return true;
    	},
    	//validate  phone Number
    	isPhoneOrMobile : function(p) {
    		if ($.trim(p).length != 0) {
    			var reg = /(^[0-9]{3,4}\-[0-9]{7,8}$)|(^[0-9]{3,4}[0-9]{7,8}$)|(^[0-9]{7,8}$)|(^0{0,1}1[0-9]{10}$)/;
    			var r = p.match(reg);
    			if (r == null)
    				return false;
    			return true;
    		}
    		return false;
    	},
    	randomParam : function(){
    		var randTime = new Date().getTime();
    		return "randParam="+randTime;
    	},
    	dealLength: function(Str,Len)
    	{
    		if(utils.isEmpty(Str))
    		{
    			return "";
    		}
    		else
    		{
    			return $.trim(Str).length > Len ? $.trim(Str).substr(0,Len) : $.trim(Str);
    		}
    	},
    	
    	dealLengthWithEllipsis: function(Str,Len)
    	{
    		if(utils.isEmpty(Str))
    		{
    			return "";
    		}
    		else
    		{
    			return $.trim(Str).length > Len ? $.trim(Str).substr(0,Len) + "..." : $.trim(Str);
    		}
    	},
    	
    	userImage : function(path,type){
    		var userImage = "";
    		if(utils.isEmpty(path))
    		{
    			//default image
    			userImage = CONTEXT_PATH +  + "/css/main/images/defaultHeader.jpg";
    		}
    		
    		if(utils.isEmpty(userImage)){
    			userImage = path;
    		}
    		
    		return userImage;
    	},
    	
    	replaceToBR : function (htmlString){
    		if(htmlString==undefined)
    			return undefined;
    		else
    			return htmlString.replace(/\n/g,"<br>");
    	},
    	
    	replaceFromBR : function (htmlString){
    		if(htmlString==undefined)
    			return undefined;
    		else
    			return htmlString.replace(/<br>/gi,"\n").replace(/&equal;/g,'=');
    		;
    	},
    	
    	replaceToLtGt : function (htmlString){
    		if (htmlString != null) {
    			htmlString = htmlString.replace(/&lt;/g,'<');
    			htmlString = htmlString.replace(/&gt;/g,'>');
    		}
    		return htmlString;
    	},
    	replaceToBRHtml : function (htmlString){
    		if (htmlString != null) {
    			htmlString = htmlString.replace(/&lt;br\s*&gt;/g,'<br>');
    		}
    		return htmlString;
    	},
    	
    	repleaceSpecialCharInput : function (htmlString){
    		if (htmlString != null) {
    			htmlString = htmlString.replace(/<br>/gi,"\n");
    			htmlString = htmlString.replace(/&lt;/g,'<');
    			htmlString = htmlString.replace(/&gt;/g,'>');
    			htmlString = htmlString.replace(/&amp;/g,'&');
    		}
    		return htmlString;
    	},
    	
    	repleaceSpecialCharView : function (htmlString){
    		if (htmlString != null) {
    			htmlString = htmlString.replace(/&lt;/g,'<');
    			htmlString = htmlString.replace(/&gt;/g,'>');
    			htmlString = htmlString.replace(/&amp;/g,'&');
    		}
    		return htmlString;
    	},
    	
    	encodeSpecialChar : function(htmlString)
    	{
    		if(htmlString==undefined)
    			return undefined;
    		else
    			return htmlString.replace(/&/g, '&amp;')
    		    .replace(/</g,'&lt;')
    		    .replace(/>/g,'&gt;');
    		    
    	},
    	fillDate : function(s) {
    		if (utils.isEmpty(s)) {
    			return "00";
    		} else {
    			s += "";
    			return s.length == 1 ? "0" + s : s;
    		}

    	},
    	formatDate : function (t) {
    		var dt = new Date(t);
    		return dt.getFullYear() + "-" + utils.fillDate((dt.getMonth() + 1)) + "-"
    				+ utils.fillDate(dt.getDate()) + " " + utils.fillDate(dt.getHours()) + ":"
    				+ utils.fillDate(dt.getMinutes()) + ":" + utils.fillDate(dt.getSeconds());
    	},
    	getChineseNum : function(num){
    		if (num == null || num == ""){
    			return "";
    		} else {
    			num = ""+ num;
    			var result = "";
    			var result = "";
    			var chineseNum=new Array(utils._lang('comman.zero'), utils._lang('comman.one'), utils._lang('comman.two'), utils._lang('comman.three'), utils._lang('comman.four'), utils._lang('comman.five'), utils._lang('comman.six'), utils._lang('comman.seven'), utils._lang('comman.eight'), utils._lang('comman.nine')); 
    			var unt=new Array( "", utils._lang('comman.ten'), utils._lang('comman.hundred'),utils._lang('comman.thousand'), utils._lang('comman.myriad'), utils._lang('comman.lakh')); 
    			var flag = true;
    			var j=num.length-1;
    			for(var i=0;i <num.length;j--,i++){
    				if (parseInt(num.charAt(j)) == 0 && flag && num.length != 1) {
    					continue;
    				} else {
    					if (!flag && parseInt(num.charAt(j)) == 0 ) {
    						flag = true;
    					} else {
    						flag = false;
    					}
    				}
    				
    				if (j == 0 && parseInt(num.charAt(j)) == 1 && (num.length == 2 || num.length == 6)) {
    					result = unt[i] + result;
    				} else {
    					result = chineseNum[parseInt(num.charAt(j))] + (parseInt(num.charAt(j)) == 0 ? "" : unt[i]) + result;
    				}
    			}
    			
    			return result;
    		}
    	},
    	/**
    	 * 特殊字符
    	 * @param s 输入的字符串
    	 * @returns {String} 去除特殊字符后的字符
    	 */
    	replaceSpecialStr:function (s) {
    	    var pattern = new RegExp("[`~!@#$^%&*=|{}';',\\[\\]\\\\.<>?~！@#￥……&*&;—|{}【】‘；：”“'。，、？]");
    	        var rs = "";
    	    for (var i = 0; i<s.length; i++) {   	    
    	        rs = rs + s.substr(i, 1).replace(pattern, '');    	       
    	    }
    	    return rs;
    	},
    	
    	checkStr:function(str){
    		 var pattern = new RegExp("[`~!@#$^&*=|{}':;',\\[\\].<>?~！@#￥……&*&;—|{}【】‘；：”“'。，、？]");
    		 if(pattern.test(str))
    		 {
    			 return false;
    		 }
    		 else
    		 {
    			 return true;
    		 }
         
        },
        checkStrl:function(str){
   		 var pattern = new RegExp("[@#$^~,.;'，。、；‘&*+=|{}\\[\\]<>]|(\\b(select|SELECT|update|UPDATE|and|AND|or|OR|delete|DELETE|insert|INSERT|trancate|char|CHAR|into|INTO|substr|SUBSTR|ascii|ASCII|declare|DECLARE|exec|EXEC|count|COUNT|master|MASTER|into|INTO|drop|DROP|execute|EXECUTE|as|AS|exist|EXIST|if|IF)\\b)");
   		 if(pattern.test(str))
   		 {
   			 return false;
   		 }
   		 else
   		 {
   			 return true;
   		 }
        
       },
       serarchArr: function(array, key) {//查找key值在数组arr中出现的索引位置
        for(var i=0;i<array.length;i++)
        {
        	if(array[i]==key)
        	{
        		return i+1;
        		break;
        	}
        }
       },
       	commonPagination : function(pageCount, pageIndex, functionName, totalCount) {
    	   utils.commonPagination2(pageCount, pageIndex, functionName, totalCount,  10, [10, 20, 50])
    	},
    	commonPagination2 : function(pageCount, pageIndex, functionName, totalCount, maxSize ,page_size_list) {
    		psl = [];
    		if( totalCount > maxSize )
    	    {
    	    	psl = page_size_list;
    	    }
    		$("#Pagination").pagination(pageCount, {
     			callback : functionName,
     			prev_text : '<span class="fenyi_al"><</span>',
     			next_text : '<span class="fenyi_al">></span>',
     			items_per_page : 1,
     			num_display_entries : 5,
     			current_page : pageIndex,
     			num_edge_entries : 2,
     			total_count:totalCount,
     			page_size_list: psl
     		});
     	},
        // 加入错误码转中文方法
        statusToZh : function (status) {
    		var ret = "";
    		switch (status) {
			case 0:
				ret = "服务器连接重置，请重新登录";
				break;
			case 500 :
				ret = "服务器内部错误，请联系管理员";
				break;
			default:
				break;
			}
    		return ret;
    	},
    	//封装的公用AJAX
		myAJAX : function (href, info, sCallback )
		{
			$.ajax({
        		type : "POST",
        		contentType : "application/json",
        		url : CONTEXT_PATH + href,
        		data : JSON.stringify(info),
        		dataType : "json",
        		success : function(data) 
        		{
        			sCallback(data);
        		},
        		error : function(data, status, e)//服务器响应失败处理函数
    			{
    				
					if(data.status == 500 || data.status == "500")
					{
						MsgTips.showMessageBox
						({
							content : "输入中有敏感字符，请更改。"
						});
					}
					else
					{
						MsgTips.showMessageBox({
							content : utils.statusToZh(data.status) == "" ? "错误码："+data.status+",请联系管理员!" : utils.statusToZh(data.status)
						});
					}
    			}
        	});
		},
		ajaxFunction : function (href, method, info , infoType , callback ){
			if(null != infoType) {
				info = JSON.stringify(info);
				$.ajax({
					type : method,
					contentType : "application/json",
					dataType : "json",
					url : CONTEXT_PATH + href,
					data : info,
					//async : false,
					success : callback
				});
			} else {
				$.ajax({
					type : method,
					dataType : "json",
					url : CONTEXT_PATH + href,
					data : info,
					success : callback
				});
			}
			//"application/json"
			
		},
		formatStr: function (str) {
            if (str == undefined || str == null) {
                str = "";
            } 
            return str;
        },
		//查询小学毕业生详情
		getStudentInfo:function(studentCode)
		{
			var reqdata={"studentCode":studentCode};
			utils.studentInfoAjax(reqdata);
		},
		/*
		 *uploadFile 文件上传的通用方法
		 *reqUrl 请求的上传地址 
		 *fileId 文件上传域的ID
		 *reqData 表单的文本参数 必须Json对象 
		 *sCallBack 回调函数
		 */
		uploadFile:function(reqUrl,fileId,reqData,sCallBack){
			  $.ajaxFileUpload({
					url : reqUrl, //用于文件上传的服务器端请求地址
					secureuri : false, //是否需要安全协议，一般设置为false
					fileElementId : fileId, //文件上传域的ID
					dataType : 'json', //返回值类型 一般设置为json
					data:reqData,
					cache:false, 
					success : function(data, status) //服务器成功响应处理函数
					{
					   var fileJson = eval("(" + data + ")");
					   sCallBack(fileJson);
					},
					error : function(data, status, e)//服务器响应失败处理函数
					{
						if(data.status == 500 || data.status == "500")
						{
							MsgTips.showMessageBox
							({
								content : "输入中有敏感字符，请更改。"
							});
						}
						else
						{
							MsgTips.showMessageBox({
								content : utils.statusToZh(data.status) == "" ? "请求错误,请联系管理员!" : utils.statusToZh(data.status)
							});
						}
							
					}
				});
		},
		
		/* reqdata={"childrenCode":childrenCode};    url : '/getData/childrenInfo'*/
		childrenInfoAjax:function(reqData,url)  
		{
			$.ajax({
				type:'POST',
				data: reqData,
				dataType:'JSON',
				url:CONTEXT_PATH+url,
				success:function(data){
					var childrenInfo= data.childrenInfo;
					if(childrenInfo != null&& childrenInfo != undefined)
					{
						var guardianList = childrenInfo.guardianList;
						
						var jhr1xm ="";
						var jhr1gx ="";
						var jhr1dh ="";
						var jhr1zjlx ="";
						var jhr1zjhm ="";
						var jhr1gzdw ="";
						var jhr1xl ="";
						var jhr2xm ="";
						var jhr2gx ="";
						var jhr2dh ="";
						var jhr2zjlx ="";
						var jhr2zjhm ="";
						var jhr2gzdw ="";
						var jhr2xl ="";
						if(guardianList != null &&  guardianList != undefined)
						{
							for(var i in guardianList)
							{
								if(i == 0)
								{
									jhr1xm = guardianList[i].name;
									jhr1gx = utils.formatStr(guardianList[i].relationName);
									jhr1dh = utils.formatStr(guardianList[i].tel);
									jhr1zjlx = utils.formatStr(guardianList[i].certificateTypeName);
									jhr1zjhm = utils.formatStr(guardianList[i].certificateNum);
									jhr1gzdw = utils.formatStr(guardianList[i].workUnits);
									jhr1xl = utils.formatStr(guardianList[i].degreeName);
								}
								if(i == 1)
								{
									jhr2xm = guardianList[i].name;
									jhr2gx = utils.formatStr(guardianList[i].relationName);
									jhr2dh = utils.formatStr(guardianList[i].tel);
									jhr2zjlx = utils.formatStr(guardianList[i].certificateTypeName);
									jhr2zjhm = utils.formatStr(guardianList[i].certificateNum);
									jhr2gzdw = utils.formatStr(guardianList[i].workUnits);
									jhr2xl = utils.formatStr(guardianList[i].degreeName);
								}
							}
						}
						childrenInfoDiv="<div id='childrenInfodiv' class='modal-body clearfix'><table  class='m-table'>"
							+"<tr><th style='width:21%'>学生编号：</th><td style='width:29%'>"+childrenInfo.childrenCode+"</td><th style='width:21%'>学生姓名：</th><td style='width:29%'>"+childrenInfo.name+"</td></tr>"
							+"<tr><th>出生日期：</th><td>"+utils.formatStr(childrenInfo.birthDay)+"</td><th>学生性别：</th><td>"+utils.formatStr(childrenInfo.sexName)+"</td></tr>"
							+"<tr><th>民族：</th><td>"+utils.formatStr(childrenInfo.nationalitiesName)+"</td><th>证件类型：</th><td>"+utils.formatStr(childrenInfo.certificateTypeName)+"</td></tr>"
							+"<tr><th>国籍：</th><td>"+utils.formatStr(childrenInfo.nationalityName)+"</td><th>证件号码：</th><td>"+utils.formatStr(childrenInfo.certificateNum)+"</td></tr>"
							+"<tr><th>户籍类型：</th><td>"+utils.formatStr(childrenInfo.domicileTypeName)+"</td><th>居住地所在区县：</th><td>"+utils.formatStr(childrenInfo.countyName)+"</td></tr>"
							+"<tr><th>户籍所在地：</th><td>"+utils.formatStr(childrenInfo.dCountyName)+"</td><th>居住地地址社区村：</th><td>"+utils.formatStr(childrenInfo.community)+"</td></tr>"
							+"<tr><th>户籍所在地街乡镇：</th><td>"+utils.formatStr(childrenInfo.dStreet)+"</td><th>居住地地址街乡镇：</th><td>"+utils.formatStr(childrenInfo.street)+"</td></tr>"
							+"<tr><th>户籍详细地址：</th><td>"+utils.formatStr(childrenInfo.dAddr)+"</td><th>居住地详细地址：</th><td>"+utils.formatStr(childrenInfo.addr)+"</td></tr>"
							+"<tr><th>监护人一姓名：</th><td>"+jhr1xm+"</td><th>监护人二姓名：</th><td>"+jhr2xm+"</td></tr>"
							+"<tr><th>第一监护人关系：</th><td>"+jhr1gx+"</td><th>第二监护人关系：</th><td>"+jhr2gx+"</td></tr>"
							+"<tr><th>监护人一电话：</th><td>"+jhr1dh+"</td><th>监护人二电话：</th><td>"+jhr2dh+"</td></tr>"
							+"<tr><th>监护人一证件类型：</th><td>"+jhr1zjlx+"</td><th>监护人二证件类型：</th><td>"+jhr2zjlx+"</td></tr>"
							+"<tr><th>监护人一证件号码：</th><td>"+jhr1zjhm+"</td><th>监护人二证件号码：</th><td>"+jhr2zjhm+"</td></tr>"
							+"<tr><th>第一监护人工作单位：</th><td>"+jhr1gzdw+"</td><th>第二监护人工作单位：</th><td>"+jhr2gzdw+"</td></tr>"
							+"<tr><th>第一监护人学历：</th><td>"+jhr1xl+"</td><th>第二监护人学历：</th><td>"+jhr2xl+"</td></tr>"
							+"</table></div><div id='childrenInfoFoot' class='modal-footer'><a class='u-btn u-btn-blue' data-dismiss='modal'>关闭</a></div>" ;
						
						var v = $("#showChildrenInfo");
						//以前是用类选择器操作的，为了避免有多个地方使用同一个类选择器的情况导致操作有误，尽量使用id选择器，兼容一下
						if(v != undefined){
							$("#childrenInfodiv").remove();
							$("#childrenInfoFoot").remove();
							$("#showChildrenInfo").append(childrenInfoDiv);
						}else{
							$(".modal-body").remove();
							$(".modal-footer").remove();
							$(".modal-content").append(childrenInfoDiv);
						}
						
						$('.js-xxxx').css({"top":"0px"});
						$('.js-xxxx').modal('show');
					}
				},
				error:function(data,status,e){
					if(data.status == 0 || data.status == "0")
					{
						MsgTips.showMessageBox({
							content : utils.statusToZh(data.status),
							callback : function ()
							{
								window.location.href = location.href;
							}
						});
					}
					else
					{
						MsgTips.showMessageBox({
							content : utils.statusToZh(data.status) == "" ? "错误码："+data.status+",请联系管理员!" : utils.statusToZh(data.status)
						});
					}
				}
			});
		},
		//ajax查询学生详情
		studentInfoAjax:function(reqData)
		{
			$.ajax({
				type:'POST',
				data: reqData,
				dataType:'JSON',
				url:CONTEXT_PATH+'/import/studentInfo',
				success:function(data){
					var studentInfo = data.studentInfo;
					if(studentInfo != undefined && studentInfo != null)
					{
						
						studentInfoDiv="<div  id='studentInfodiv' class='modal-body clearfix'><table class='m-table'>"
							+"<tr><th style='width:21%'>学籍号/教育ID：</th><td style='width:29%'>"+studentInfo.studentCode+"</td><th style='width:21%'>学生姓名：</th><td style='width:29%'>"+studentInfo.studentName+"</td></tr>"
							+"<tr><th>出生日期：</th><td>"+utils.formatStr(studentInfo.birthDay)+"</td><th>学生性别：</th><td>"+utils.formatStr(studentInfo.sexName)+"</td></tr>"
							+"<tr><th>民族：</th><td>"+utils.formatStr(studentInfo.nationalitiesName)+"</td><th>证件类型：</th><td>"+utils.formatStr(studentInfo.certificateTypeName)+"</td></tr>"
							+"<tr><th>国籍：</th><td>"+utils.formatStr(studentInfo.nationalityName)+"</td><th>证件号码：</th><td>"+utils.formatStr(studentInfo.certificateNum)+"</td></tr>"
							+"<tr><th>籍贯：</th><td>"+utils.formatStr(studentInfo.nativePlace)+"</td><th>政治面貌：</th><td>"+utils.formatStr(studentInfo.politicalFeatures)+"</td></tr>"
							+"<tr><th>港澳台胞：</th><td>"+utils.formatStr(studentInfo.gatCode)+"</td><th>健康状况：</th><td>"+utils.formatStr(studentInfo.healthyStatus)+"</td></tr>"
							+"<tr><th>户籍所在地：</th><td>"+utils.formatStr(studentInfo.domicilePlace)+"</td><th>居住地址：</th><td>"+utils.formatStr(studentInfo.nowAddr)+"</td></tr>"
							+"<tr><th>特长：</th><td>"+utils.formatStr(studentInfo.specialSkillName)+"</td><th>通信地址：</th><td>"+utils.formatStr(studentInfo.addr)+"</td></tr>"
							+"<tr><th>联系电话：</th><td>"+utils.formatStr(studentInfo.linkTel)+"</td><th>邮政编码：</th><td>"+utils.formatStr(studentInfo.postCode)+"</td></tr>"
							+"<tr><th>毕业小学：</th><td>"+utils.formatStr(studentInfo.fromPrimaryName)+"</td><th>电子邮箱：</th><td>"+utils.formatStr(studentInfo.email)+"</td></tr>"
							+"</table></div><div id='studentInfoFoot' class='modal-footer'><a class='u-btn u-btn-blue' data-dismiss='modal'>关闭</a></div>" ;
						
						$("#studentInfodiv").remove();
						$("#studentInfoFoot").remove();
						$("#showStudentInfo").append(studentInfoDiv);
						$('.js-xxxx').css({"top":"0px"});
						$('.js-xxxx').modal('show');
					}
				},
				error:function(data,status,e){
					if(data.status == 0 || data.status == "0")
					{
						MsgTips.showMessageBox({
							content : utils.statusToZh(data.status),
							callback : function ()
							{
								window.location.href = location.href;
							}
						});
					}
					else
					{
						MsgTips.showMessageBox({
							content : utils.statusToZh(data.status) == "" ? "错误码："+data.status+",请联系管理员!" : utils.statusToZh(data.status)
						});
					}
				}
			});
		},
		
		
		
		
		/**
		 * 公用的方法 全选
		 * @param headerId
		 * @param itemName
		 */
		checkAllCheckboxes: function(headerId, itemName){
			 $(document).on("click","input:checkbox[name="+itemName+"]", function(){
				 if ($("input:not([disabled]):checkbox[name="+itemName+"] " ).length == $("input:not([disabled]):checkbox[name="+itemName+"]:checked").length) 
					{
						$('#'+headerId).prop("checked", true).parent().addClass("on-check");
					}
					else 
					{
						$('#'+headerId).removeAttr("checked").parent().removeClass("on-check");
					}
			});
			 
			 $('#'+headerId).click(function() {
				if ($(this).is(":checked")) {
					$("input:not([disabled]):checkbox[name="+itemName+"]").prop("checked", true).parent().addClass("on-check")
					.parents(".tr-checkbox").addClass("active-tr");
				} else {
					$("input:not([disabled]):checkbox[name="+itemName+"]").removeAttr("checked").parent().removeClass("on-check")
					.parents(".tr-checkbox").removeClass("active-tr");;
				}
			});
			 
		},
		
		//获取url参数
		getUrlParam:function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
			var r = window.location.search.substr(1).match(reg); 
			if (r != null) return unescape(r[2]); return null; 
        },
        //获取枚举对象的所有值
        getEnumValues: function(obj){
        	 var values = new Array();
			 $.each(obj, function(i, item){
				 values.push(item);
			 });
        	return values;
        },
       
        
        /**
         * 将form中的值转换为键值对，形如：{name:'aaa',password:'tttt'}
         */
	    getQueryParamsByFormId: function (frmId) {
	         var o = {};
	         var a = $("#"+frmId).serializeArray();
	         $.each(a, function () {
	             if (o[this.name] !== undefined) {
	                 if (!o[this.name].push) {
	                     o[this.name] = [o[this.name]];
	                 }
	                 o[this.name].push(this.value || '');
	             } else {
	                 o[this.name] = this.value || '';
	             }
	         });
	         return o;
	     },
	     
	     /**
         * 将form中的值转换为键值对，形如：{name:'aaa',password:'tttt'}
         */
	    getQueryParamsByFormObject: function (frmId) {
	    	
	         var o = {};
	         var a=$(frmId).serializeArray()
	         $.each(a, function () {
	             if (o[this.name] !== undefined) {
	                 if (!o[this.name].push) {
	                     o[this.name] = [o[this.name]];
	                 }
	                 o[this.name].push(this.value || '');
	             } else {
	                 o[this.name] = this.value || '';
	             }
	         });
	         return o;
	     },
	     
	     //设置单击radio是否选中
	     isRadio:function(){
	    	 $(document).on("click",".tr-checkbox",function(e){
	    		var  isradio = $(this).find("input[type = radio]").prop("checked");
	    		 if (isradio) {
						$(this).addClass("active-tr");
						$(this).siblings().removeClass("active-tr");
						$(this).find("input[type = radio]:not([disabled])").prop(
								"checked", true).parents("label").addClass("on-radio");
						//任课教师选择
						$('.form-inline input[type = radio]').each(function(){
							$(this).prop("checked", false).parents("label").removeClass("on-radio");
						})
					} else {
						$(this).removeClass("active-tr");
						$(this).find("input[type = radio]:not([disabled])").prop(
								"checked", false).parents("label").removeClass("on-radio");
					}
	    	 })
	     },
	     
	     /**
	      * 将josn对象赋值给form
	      * @param {dom} 指定的选择器
	      * @param {obj} 需要给form赋值的json对象
	      * @method serializeJson
	      * */
	     setForm:function(obj,jsonValue){
	    	 //var obj = this;
	    	  $.each(jsonValue,function(name,ival){
	    	    var $oinput = obj.find("input[name="+name+"]");
	    	    if($oinput.attr("type")=="checkbox"){
	    	      if(ival !== null){
	    	        var checkboxObj = $("[name="+name+"]");
	    	        var checkArray = ival.split(";");
	    	        for(var i=0;i<checkboxObj.length;i++){
	    	          for(var j=0;j<checkArray.length;j++){
	    	            if(checkboxObj[i].value == checkArray[j]){
	    	              checkboxObj[i].click();
	    	            }
	    	          }
	    	        }
	    	      }
	    	    }
	    	    else if($oinput.attr("type")=="radio"){
	    	      $oinput.each(function(){
	    	        var radioObj = $("[name="+name+"]");
	    	        for(var i=0;i<radioObj.length;i++){
	    	          if(radioObj[i].value == ival){
	    	            radioObj[i].click();
	    	          }
	    	        }
	    	      });
	    	    }
	    	    else if($oinput.attr("type")=="textarea"){
	    	      obj.find("[name="+name+"]").html(ival);
	    	    }
	    	    else{
	    	      obj.find("[name="+name+"]").val(ival);
	    	    }
	    	    
	    	    // div填充  qionglin.zhang 2017.12.01
	    	    var $odiv = obj.find("div[name="+name+"]");
	    	    if ($odiv.length != 0){
	    	    	if(ival !== null){
		    	    	$odiv.text(ival);	    	    		
	    	    	}
	    	    }
	    	    
	    	    // span填充 qionglin.zhang 2017.12.13
	    	    var $ospan = obj.find("span[name="+name+"]");
	    	    if ($ospan.length != 0){
	    	    	if(ival !== null){
	    	    		$ospan.text(ival);	    	    		
	    	    	}
	    	    }
	    	  })
	     },
	     loading:function(){
	    	 //获取浏览器页面可见高度和宽度
	    	    var _PageHeight = document.documentElement.clientHeight,
	    	    	_PageWidth = document.documentElement.clientWidth;
	    	    //计算loading框距离顶部和左部的距离（loading框的宽度为215px，高度为61px）
	    	    var _LoadingTop = _PageHeight > 61 ? (_PageHeight - 61) / 2 : 0,
	    	    	_LoadingLeft = _PageWidth > 215 ? (_PageWidth - 215) / 2 : 0;
	    	    //在页面未加载完毕之前显示的loading Html自定义内容
	    	    var _LoadingHtml = '<div id="loadingDiv" style="position:absolute;left:0;width:100%;height:' + _PageHeight + 'px;top:0;background:#f3f8ff;opacity:0.8;filter:alpha(opacity=80);z-index:10000;"><div style="position: absolute; cursor1: wait; left: ' + _LoadingLeft + 'px; top:' + _LoadingTop + 'px; width: auto; height: 57px; line-height: 57px; padding-left: 50px; padding-right: 5px;  border: 2px solid #95B8E7; color: #696969; font-family:\'Microsoft YaHei\';">页面加载中，请等待...</div></div>';
	    	    //呈现loading效果
	    	    $("body").append(_LoadingHtml);
	    	    //window.onload = function () {
	    	    //  var loadingMask = document.getElementById('loadingDiv');
	    	    //  loadingMask.parentNode.removeChild(loadingMask);
	    	    //};
	    	    //监听加载状态改变
	    	    document.onreadystatechange = function completeLoading() {
	    	        if (document.readyState == "complete") {
	    	        	utils.removeLoading();
	    	        }
	    	    };
	     },
	     removeLoading : function(){
 	        	$("#loadingDiv").remove();
	     },
	     isWeek:function(week){
	    	 if(!week){
	    		 return false;
	    	 }
	    	 week = week.replaceAll(" ", "");
	    	 var arr = [];
	    	 var weeks = week.split(",");
    		 for(var i = 0 ; i < weeks.length ; i ++){
    			 var w = weeks[i];
    			 if(w.indexOf("-") != -1){
    				 var ww = w.split("-");
    				 if(ww.length == 2 && parseInt(ww[0]) < parseInt(ww[1])){
    					 arr.push(ww[0]);
    					 arr.push(ww[1]);
    				 }else{
    					 return false;
    				 }
    			 }else{
    				 arr.push(w);
    			 }
    		 }
    		for(var i = 0 ; i < arr.length ; i ++){
    			var w = arr[i];
    			if(w.length == 0){
    				return false;
    			}else if(!this.isNumber(w)){
    				return false;
    			}
    		}
	    	 return true;
	     },
	     getWeekList:function(week){
	    	 week = week.replaceAll(" ", "");
	    	 var arr = [];
	    	 var weeks = week.split(",");
    		 for(var i = 0 ; i < weeks.length ; i ++){
    			 var w = weeks[i];
    			 if(w.indexOf("-") != -1){
    				 var ww = w.split("-");
    				 if(ww.length == 2 && parseInt(ww[0]) < parseInt(ww[1])){
    					 var start = parseInt(ww[0]);
    					 var end = parseInt(ww[1]);
    					 for(; start <= end ; start ++){
    						 if(!arr.contains(start))
    						 arr.push(start);
    					 }
    				 } 
    			 }else{
    				 if(!arr.contains(start))
    				 arr.push(parseInt(w));
    			 }
    		 }
    		 return arr;
    		 
	     },
	     isNumber:function(str){
	    	 if(str == '0'){
	    		 return false;
	    	 }
	    	 var pattern = new RegExp("^[0-9]*$");
	    	 return pattern.test(str);
	     },
	     getSectionName:function(sections){
	    	var weekNameArr = ["","周一","周二","周三","周四","周五","周六","周日"];
	    	var sectionName = [];
	    	var map = {};
	    	$.each(sections, function(i, section){
	    		var day = parseInt(section.substring(0,1)),
	    			section = parseInt(section.substring(1,3)),
	    			sectionList = map[day];
	    		if(!sectionList){
	    			sectionList = [];
	    		}
	    		sectionList.push(section);
	    		map[day] = sectionList;
	    	});
	    	var nameList = [];
	    	$.each(map, function(i, item){
	    		var sectionNameList = [];
	    		for(var m = 0 ,length = item.length ; m < length ; m ++){
	    			var end = start = item[m];
	    			for(var n = m + 1 ; n < length ; n ++){
	    				end = item[n];
		 				if (end - start > n - m) {
		 					end = item[n - 1];
		 					m = n - 1;
		 					break;
		 				}
		 				if (n == length - 1) {
		 					m = n;
		 				}
		    		}
	    			if(end != start){
	    				sectionNameList.push(start + "-" + end);
	    			}else{
	    				sectionNameList.push(start);
	    			}
	    		}
	    		nameList.push(weekNameArr[i]+sectionNameList.join(",")+"节");
	    	});
	    	return nameList.join(",");
	     }
	     
    };
 
   
    window.utils = utils;
    module.exports = utils;
});