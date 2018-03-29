/**
 * 教师服务
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var url = require("configPath/url.teacherservice");// 教师服务url
	var validate = require("basePath/utils/validateExtend");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	/**
	 * 个人信息
	 */
	var teacherInformation = {			
		/**
		 * 初始化个人信息
		 */
		init : function() {
			// 加载学生基本信息
			teacherInformation.loadInformation();
			 //图片上传
			var uploader = new uploaderFile({
		        $id: "importBtn",
		        extensions:"JPG,jpg",
		        callBack: function (data) {
		        	$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+data.data.fileId);
		        	$("#fileId").val(data.data.fileId);
		        },
				fileSize:1,
				module:businessModule.data
		    }).init();
			
			//保存
			$("#saveButton").on("click", function() {
			    var v = $("#infoForm").valid();// 验证表单
			    if(v){
			    	var reqData= utils.getQueryParamsByFormId('infoForm');
					var rvData = null;// 定义返回对象
					ajaxData.contructor(false);// 同步
					ajaxData.request(url.TEACHER_UPDATE,reqData,function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
				        	popup.okPop("保存成功");
							//更新加载信息
							teacherInformation.loadInformation();
						}else{
						   // 提示失败
					       popup.errPop(data.msg);
						}
					});
			    }
			    
			});
		},
		/**
		 * 页面绑定验证
		 */
        loadInformation : function(){
            // 请求数据
			ajaxData.request(url.TEACHER_GETITEM,null,function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var resData = data.data;	
					//验证绑定事件
		            teacherInformation.validation();
					//工号
					$("#teacherNo").text(resData.teacherNo||"");
					//姓名
					$("#teacherName").text(resData.teacherName||"");
					//性别
					$("#sexName").text(resData.sexName||"");
					//所在校区
					$("#campusName").text(resData.campusName||"");
					//教学单位
					$("#teachingUnitName").text(resData.teachingUnitName||"");
					//行政单位
					$("#administrativeUnitName").text(resData.administrativeUnitName||"");
					//身份证件类型
					$("#idCardTypeName").text(resData.idCardTypeName||"");
					//身份证件号码
					$("#idCard").text(resData.idCard||"");
					//出生日期
					if(utils.isNotEmpty(resData.birthday)){
						$("#birthday").text(new Date(resData.birthday).format("yyyy-MM-dd")||"");
					}
					//籍贯
					$("#nativePlace").text(resData.nativePlace||"");
					//民族
					$("#nationName").text(resData.nationName||"");
					//政治面貌
					$("#politicalStatusName").text(resData.politicalStatusName||"");
					//最高学历
					$("#highestEducationName").text(resData.highestEducationName||"");
					//最高学位
					$("#highestDegreeName").text(resData.highestDegreeName||"");
					//最高职称
					$("#highestTitleName").text(resData.highestTitleName||"");
					//当前状态
					$("#currentStateName").text(resData.currentStateName||"");
					//办公电话
					$("#officePhone").val(resData.officePhone||"");
					//移动电话
					$("#mobilePhone").val(resData.mobilePhone||"");
					//传真号码
					$("#fax").val(resData.fax||"");
					//QQ号
					$("#qq").val(resData.qq||"");
					//微信号
					$("#wechat").val(resData.wechat||"");
					//电子邮箱
					$("#email").val(resData.email||"");
					//邮政编码
					$("#postalCode").val(resData.postalCode||"");
					//通信地址
					$("#address").val(resData.address||"");
				     //头像
                    if(utils.isNotEmpty(resData.fileId)){
                    	$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+resData.fileId);
                    	$("#fileId").val(resData.fileId);
                    }
		        }
		    });
        },
		/**
		 * 验证基本信息
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#infoForm").validate({
				rules : {
					mobilePhone : {
						"isMobilePhone":true	//移动电话
					},
					qq : {
						"isQQ":true   //qq号
					},
					email : {
						"isEmail":true//电子邮箱
					},
					postalCode : {
						"isPostalCode":true //邮政编码
					}
					
				},
				messages : {
					mobilePhone : {
						"isMobilePhone" : '移动电话格式不正确'
					},
					qq : {
						"isQQ" : 'qq号码格式不正确'
					},
					email : {
						"isEmail": '邮箱格式不正确'
					},
					postalCode : {
					    "isPostalCode":"邮政编码格式不正确"
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					$(element).parent("div.tips-text").append(error);
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
		}
	}
	module.exports = teacherInformation;
	window.teacherInformation = teacherInformation;
});
