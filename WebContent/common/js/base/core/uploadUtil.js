define(function (require, exports, module) {
	var config = require("../../utils/config");
	var URL = require("../../config/url.filesystem");
	var popup = require("../../utils/popup");
	require("../../utils/utils");
    var option = {
        $id: "uploaderDiv",
        callBack: function (data) {
        },
        module:"",
        extensions: 'gif,jpg,png,mp3,mp4,flv,txt,doc,docx,ppt,pptx,xls,xlsx,zip,pdf,swf',
        uploadUrl: URL.IMPORT_FILE.url/*上传文件路径*/,
        validateUploadLimit: false,
        fileSize : 200,
        auto:true
    };
    var uploaderFile = function (opt) {
        this.option = opt ? $.extend({}, option, opt) : $.extend({}, option);
    };
    var uploader;
    uploaderFile.prototype = {
    	init : function(){
	    	 this.initUploder();
    	},	
        initUploder: function () {
            var me = this;
            var mimeTypes = [];
            if (me.option.extensions) {
                $.each(me.option.extensions.split(","), function () {
                    mimeTypes.push("." + this);
                });
                mimeTypes = mimeTypes.join(",");
            }
            uploader = WebUploader.create({
            	 auto:me.option.auto,
                // swf文件路径
                swf: config.base + "/common/js/base/webuploader/Uploader.swf",

                // 文件接收服务端。
                server: config.PROJECT_NAME + me.option.uploadUrl + "?businessModule="+me.option.module,
                fileSingleSizeLimit: 2000 * 1024 * 1024,
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: "#" + me.option.$id ,
                    multiple: false
                }  
               
            });
            var setHeader = function(object, data, headers) {
                headers['Access-Control-Allow-Origin'] = '*';
                headers['Access-Control-Request-Headers'] = 'content-type';
                headers['Access-Control-Request-Method'] = 'POST';
            }
            uploader.on('uploadBeforeSend ', setHeader);

            uploader.on('beforeFileQueued', function (file) {
                if (typeof me.option.beforeFileQueued == "function") {
                    var ifFileQueue = me.option.beforeFileQueued.call(me, file);
                    if (ifFileQueue == false) {
                        return false;
                    }
                }
                // 文件大小校验
                var flag = false;
                if(me.option.extensions){
                	var exts = me.option.extensions.split(",");
                	if(exts.contains(file.ext)){
                		flag = true;
                		
                	}
                	if(!flag){
                		popup.errPop("格式不符，请上传" + me.option.extensions + "格式文件");
                		$("#fileNameShow").val("");
                		return false;
                	}
                }
                flag = me.fileSizeCheck(file);
                return flag;
            });
            uploader.on('uploadBeforeSend', function (object, data, headers) {
            	if (typeof me.option.uploadBeforeSend == "function") {
            		var ifFileQueue = me.option.uploadBeforeSend.call(me, object, data, headers);
            	}
				$("body").append("<div class='loading'></div>");
				$("body").append("<div class='loading-back'></div>");
            });
             
            uploader.on('uploadComplete', function (file) {
                uploader.reset();
                $("#showFileName").val("");
            });
            uploader.on('uploadSuccess', function (file, data) {
                if (data) {
                    me.option.callBack.call(me, data);
                }
				$(".loading,.loading-back").remove();
            });
            uploader.onError = function (code) {
            	if (code == 'Q_TYPE_DENIED') {
            		popup.errPop("格式不符，请上传" + me.option.extensions + "格式文件");
                } else if (code == 'F_EXCEED_SIZE') {
                	 popup.errPop("文件过大，请上传"+(me.option.fileSize)+"M以内文件！");
                }
            };
            uploader.onUploadProgress = function (file, percentage) {
                if (me.option.progressCallback) {
                    me.option.progressCallback.call(me, file, percentage);
                } 
                
            };
        },
        fileSizeCheck : function(file){
        	var flag = true;
        	 var me=this;
        	 if (file.size > me.option.fileSize * 1024 * 1024) {
                 flag = false;
                 popup.errPop("文件过大，请上传"+(me.option.fileSize)+"M以内文件！");
             }
             
        	return flag;
        },
        upload:function(){
        	uploader.upload();
        } 
    }
    module.exports = uploaderFile;
});                