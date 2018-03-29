/**
 * 基本信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlStu = require("configPath/url.studentarchives");// 学籍url
	var url = require("configPath/url.studentservice");// 学生服务url
	var dataDictionary = require("configPath/data.dictionary");// 数据字典
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
    var validate = require("basePath/utils/validateExtend");
	/**
	 * 基本信息
	 */
	var studentInformation = {			
		/**
		 * 初始化基本信息
		 */
		init : function() {
			// 加载申请时间
			studentInformation.loadApplySetting();
			// 加载学生基本信息
			studentInformation.loadInformation();
            // 修改
			$("#modifyButton").on("click", function() {
				studentInformation.modifyInformation();
			    $(this).hide();
			    $("#saveButton,.requiretxt").show();
			    if($(".avatar-upload").attr('open')=='open'){
			     	$(".school-infoList #importBtn,.school-infoList .avatar-tip").show();
			    }
			    $(".tableBox td").each(function(){
                    if($(this).find(".conSpan").attr('open')=='open'){
                    	$(this).find(".conSpan").hide();
                    	$(this).find(".verification-info").show();
                    }else{
                    	$(this).find(".conSpan").show();
                    	$(this).find(".verification-info").hide();
                    }
			    });
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
			});

			//保存
			$("#saveButton").on("click", function() {
			    var v = $("#infoForm").valid();// 验证表单
			    if(v){
			    	var reqData= utils.getQueryParamsByFormId('infoForm');
					ajaxData.contructor(false);// 同步
					ajaxData.request(url.STUDENT_SAVE, reqData,function(data) {
						if (data.code == config.RSP_SUCCESS){
							$("#modifyButton").show();
							$("#saveButton,.school-infoList #importBtn,.school-infoList .avatar-tip").hide();
							// 提示成功
				        	popup.okPop("保存成功");
							//更新加载信息
							studentInformation.loadInformation();
						   $(".tableBox td .conSpan").show();
						   $(".tableBox td .verification-info,.requiretxt").hide();
						}else{
						   // 提示失败
					       popup.errPop(data.msg);
						}
					});
			    }
			    
			});
		},
		/**
		 * 加载修改时间
		 */
		loadApplySetting : function(){
			// 加载修改时间
			ajaxData.request(urlStu.STUDENT_GETSETTINGITEM,null, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var applyData = data.data;
					if (applyData != null && applyData.settingId != null){
						 // 开始和结束时间同当前时间比较
					    var timeObject = {
					    	beginTime : applyData.beginTime,
					    	endTime : applyData.endTime
					    };

					    if(!studentInformation.validateTime(timeObject)){
					    	 $("#modifyButton").hide();
					    }                       
					}else{
                       $("#modifyButton").hide();
					}

					var fields = applyData.fields,
					    count = 0;
					$.each(fields,function(index,ele){
					   if(studentInformation.humpName(ele.fieldName.toLowerCase())=='fileId'){
					     if(ele.isOpen == 0){
                       	   count++;
                         }else{
                       	  $(".avatar-upload").attr("open","open");
                         }

					   }else{
					   	if(ele.isOpen == 0){
                       	  count++;
                        }else{
                       	  $("td span."+studentInformation.humpName(ele.fieldName.toLowerCase())).attr("open","open");
                        }
					   } 
					});

					if(count >= fields.length){
						$("#modifyButton").hide();
					}
				}
			},true)
		},
		/**
		 * 加载学生基本信息
		 */
		loadInformation : function() {
			// 请求数据
			ajaxData.request(url.STUDENT_GETITEM,null,function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					//验证绑定事件
		            studentInformation.validation();
					var studentData = data.data;
					//学号
					$(".tableBox .studentNo").text(studentData.studentNo||"");
					$(".tableBox #studentNo").val(studentData.studentNo||"");
					//姓名
					$(".tableBox .studentName").text(studentData.studentName||"");
					$(".tableBox #studentName").val(studentData.studentName||"");
					//姓名拼音
					$(".tableBox .nameSpell").text(studentData.nameSpell||"");
					$(".tableBox #nameSpell").val(studentData.nameSpell||"");
					//曾用名
					$(".tableBox .usedName").text(studentData.usedName||"");
					$(".tableBox #usedName").val(studentData.usedName||"");
					//性别
			        $(".tableBox .sexCode").text(studentData.sexName||"").attr("sexCode",studentData.sexCode||"");
		            //出生日期
                    if(studentData.birthday>0){
                      $(".tableBox .birthday").text(new Date(studentData.birthday||"").format("yyyy-MM-dd"));
					  $(".tableBox #birthday").val(new Date(studentData.birthday||"").format("yyyy-MM-dd"));
                    }
					//政治面貌
					$(".tableBox .politicalStatusCode").text(studentData.politicalStatusName||"").attr('politicalStatusCode',studentData.politicalStatusCode||"");
					//初始化加载省市区
					$(".tableBox .birthProvinceCode").text(studentData.birthProvinceCityAreaName||"").attr('birthProvinceCode',studentData.birthProvinceCode||"").attr('birthCityCode',studentData.birthCityCode||"").attr('birthAreaCode',studentData.birthAreaCode||""); 
			        //籍贯
				    $(".tableBox .nativePlace").text(studentData.nativePlace||"");
				    $(".tableBox #nativePlace").val(studentData.nativePlace||"");
				    //民族
				    $(".tableBox .nationCode").text(studentData.nationName||"").attr("nationCode",studentData.nationCode||"");
				    //国籍
				    $(".tableBox .nationalityCode").text(studentData.nationalityName||"").attr("nationalityCode",studentData.nationalityCode||"");
				    //身份证件类型
				    $(".tableBox .idCardTypeCode").text(studentData.idCardTypeName||"").attr("idCardTypeCode",studentData.idCardTypeCode||"");
                    //身份证件号
				    $(".tableBox .idCard").text(studentData.idCard||"");
				    //港澳台侨胞
				    $(".tableBox .overseasChineseCode").text(studentData.overseasChineseName||"").attr("overseasChineseCode",studentData.overseasChineseCode||"");
                    //宗教信仰
				    $(".tableBox .faithCode").text(studentData.faithName||"").attr("faithCode",studentData.faithCode||"");
				    //健康状况
				    $(".tableBox .healthCode").text(studentData.healthName||"").attr("healthCode",studentData.healthCode||"");
				    //血型
				    $(".tableBox .bloodTypeCode").text(studentData.bloodTypeName||"").attr("bloodTypeCode",studentData.bloodTypeCode||"");
                    //qq号码
				    $(".tableBox .qq").text(studentData.qq||"");
				    $(".tableBox #qq").val(studentData.qq||"");
				    //微信号码
				    $(".tableBox .wechat").text(studentData.wechat||"");
				    $(".tableBox #wechat").val(studentData.wechat||"");
				    //手机号码
				    $(".tableBox .mobilePhone").text(studentData.mobilePhone||"");
				    $(".tableBox #mobilePhone").val(studentData.mobilePhone||"");
                    //联系人
				    $(".tableBox .contactPerson").text(studentData.contactPerson||"");
				    $(".tableBox #contactPerson").val(studentData.contactPerson||"");
				    //联系人电话
				    $(".tableBox .contactPhone").text(studentData.contactPhone||"");
				    $(".tableBox #contactPhone").val(studentData.contactPhone||"");
				    //邮政编码
				    $(".tableBox .postalCode").text(studentData.postalCode||"");
				    $(".tableBox #postalCode").val(studentData.postalCode||"");
                    //电子邮箱
                    $(".tableBox .email").text(studentData.email||"");
                    $(".tableBox #email").val(studentData.email||"");
                    //联系地址
                    $(".tableBox .address").text(studentData.address||"");
                    $(".tableBox #address").val(studentData.address||"");
                    //考生特征
				    $(".tableBox .candidateFeature").text(studentData.candidateFeature||"");
				    $(".tableBox #candidateFeature").val(studentData.candidateFeature||"");
                    //入学日期
                    if(studentData.entranceDate>0){
                    	 $(".tableBox .entranceDate").text(new Date(studentData.entranceDate).format("yyyy-MM-dd")||"");
                    }
				    //招生季节
                    $(".tableBox .enrollSeasonCode").text(studentData.enrollSeasonName||"").attr("enrollSeasonCode",studentData.enrollSeasonCode||"");
                    //入学方式
				    $(".tableBox .entranceWayCode").text(studentData.entranceWayName||"").attr("entranceWayCode",studentData.entranceWayCode||"");
				    //学生类别
				    $(".tableBox .studentCategoryCode").text(studentData.studentCategoryName||"").attr("studentCategoryCode",studentData.studentCategoryCode||"");
                    //考生号
				    $(".tableBox .candidateNo").text(studentData.candidateNo||"");
				    //院系
                    $(".tableBox .departmentId").text(studentData.departmentName||"");
                    //专业
				    $(".tableBox .majorId").text(studentData.majorName||"");
				    //班级
				    $(".tableBox .classId").text(studentData.className||"");
				    //当前年级
				    $(".tableBox .grade").text(studentData.grade||"");
				    //培养层次
                    $(".tableBox .trainingLevelName").text(studentData.trainingLevelName||"").attr("trainingLevelCode",studentData.trainingLevelCode||"");
                    //学制
				    $(".tableBox .educationSystem").text(studentData.educationSystem||"");
				    //学生当前状态
				    $(".tableBox .currentStatusCode").text(studentData.currentStatusName||"").attr("currentStatusCode",studentData.currentStatusCode||"");
				    // 入学成绩
				    $(".tableBox .entranceScore").text(studentData.entranceScore||"");
                    //外语语种
                    $(".tableBox .foreignLanguageCode").text(studentData.foreignLanguageName||"").attr("foreignLanguageCode",studentData.foreignLanguageCode||"");
			        //学生来源
			        $(".tableBox .studentOriginCode").text(studentData.studentOriginName||"").attr("studentOriginCode",studentData.studentOriginCode||"");
			       	//生源地省市区三级联动
			        $(".tableBox .fromProvinceCode").text(studentData.fromProvinceCityAreaName||"").attr("fromProvinceCode",studentData.fromProvinceCode||"").attr("fromCityCode",studentData.fromCityCode||"").attr("fromAreaCode",studentData.fromAreaCode||"");
			        //备注
			        $(".tableBox .remark").text(studentData.remark||"");
			        $(".tableBox #remark").val(studentData.remark||"");
                    //头像
                    if(utils.isNotEmpty(studentData.fileId)){
                    	$("#studentImage").prop("src", config.PROJECT_NAME +  urlFilesystem.EXPORT_FILE.url+"?fileId="+studentData.fileId);
                        $("#fileId").val(studentData.fileId);
                    }
                    
				}
			},true)
		},
		/**
		 * 修改学生基本信息
		 */
		 modifyInformation : function() {
		   //省市区三级联动
		   simpleSelect.loadProvinces("birthProvinceCode","birthCityCode","birthAreaCode");
		   //生源地
		   simpleSelect.loadProvinces("fromProvinceCode","fromCityCode","fromAreaCode");
		   //性别
		   var sexCode = $(".tableBox .sexCode").attr("sexCode");
           simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {defaultValue:sexCode,firstText:"--请选择--",firstValue:""});
           //政治面貌
           var politicalStatusCode = $(".tableBox .politicalStatusCode").attr('politicalStatusCode');
		   simpleSelect.loadDictionarySelect("politicalStatusCode",dataDictionary.ID_FOR_POLITICAL_STATUS_CODE, {defaultValue:politicalStatusCode,firstText:"--请选择--",firstValue:""});
		   //初始化加载省市区
		   var birthProvinceCode = $(".tableBox .birthProvinceCode").attr("birthProvinceCode");
		   var birthCityCode = $(".tableBox .birthProvinceCode").attr("birthCityCode");
		   var birthAreaCode = $(".tableBox .birthProvinceCode").attr("birthAreaCode");
		   simpleSelect.loadProvincesInitialValue("birthProvinceCode|"+birthProvinceCode, "birthCityCode|"+birthCityCode, "birthAreaCode|"+birthAreaCode);
		   //民族
		   var nationCode = $(".tableBox .nationCode").attr("nationCode");
		   simpleSelect.loadDictionarySelect("nationCode",dataDictionary.ID_FOR_NATION_CODE,{defaultValue:nationCode,firstText:"--请选择--",firstValue:""}); 
		   //国籍
		   var nationalityCode = $(".tableBox .nationalityCode").attr("nationalityCode");
		   simpleSelect.loadDictionarySelect("nationalityCode",dataDictionary.ID_FOR_NATIONALITY_CODE,{defaultValue:nationalityCode,firstText:"--请选择--",firstValue:""}); 
	       //港澳台侨胞
	       var overseasChineseCode = $(".tableBox .overseasChineseCode").attr("overseasChineseCode");
	       simpleSelect.loadDictionarySelect("overseasChineseCode",dataDictionary.ID_FOR_OVERSEAS_CHINESE_CODE, {defaultValue:overseasChineseCode,firstText:"--请选择--",firstValue:""});
	       //宗教信仰
	       var faithCode = $(".tableBox .faithCode").attr("faithCode");
		   simpleSelect.loadDictionarySelect("faithCode",dataDictionary.FAILTH_CODE, {defaultValue:faithCode,firstText:"--请选择--",firstValue:""});
		   //健康状况
		   var healthCode = $(".tableBox .healthCode").attr("healthCode");
		   simpleSelect.loadDictionarySelect("healthCode",dataDictionary.ID_FOR_HEALTH_CODE, {defaultValue:healthCode,firstText:"--请选择--",firstValue:""});
		   //血型
		   var bloodTypeCode = $(".tableBox .bloodTypeCode").attr("bloodTypeCode");
	       simpleSelect.loadDictionarySelect("bloodTypeCode",dataDictionary.BLOOD_TYPE_CODE,bloodTypeCode, {defaultValue:bloodTypeCode,firstText:"--请选择--",firstValue:""});
		   //生源地省市区三级联动
		   var fromProvinceCode = $(".tableBox .fromProvinceCode").attr("fromProvinceCode");
		   var fromCityCode = $(".tableBox .fromProvinceCode").attr("fromCityCode");
		   var fromAreaCode = $(".tableBox .fromProvinceCode").attr("fromAreaCode");
		   simpleSelect.loadProvincesInitialValue("fromProvinceCode|"+fromProvinceCode, "fromCityCode|"+fromCityCode, "fromAreaCode|"+fromAreaCode);
		 },
		 /**
	     * 校验时间
	     * 
	     * @param rvData 对象
	     * @return bool值
	     */
		 validateTime : function(applyData) {
			var beginTime = applyData.beginTime;
			var endTime = applyData.endTime;
			var nowDate = studentInformation.getNowDate();
			// 开始和结束时间与当前时间比较
			if (applyData.beginTime != null && applyData.endTime != null) {
				if (beginTime > nowDate || endTime < nowDate) {					
					return false;
				}
			}
			// 开始时间与当前时间比较
			if (applyData.beginTime != null) {
				if (beginTime > nowDate) {
					return false;
				}
			}
			// 结束时间与当前时间比较
			if (applyData.endTime != null) {
				if (endTime < nowDate) {
					return false;
				}
			}
			return true;
		},
		/**
		 * 获取当前时间
		 * 
		 * @returns 时间根式字符串
		 */
		getNowDate : function() {
			var myDate = new Date();
			// 获取当前年
			var year = myDate.getFullYear();
			// 获取当前月
			var month = myDate.getMonth() + 1;
			// 获取当前日
			var date = myDate.getDate();
			var h = myDate.getHours(); // 获取当前小时数(0-23)
			var m = myDate.getMinutes(); // 获取当前分钟数(0-59)
			var s = myDate.getSeconds();

			var now = year + '-' + studentInformation.p(month) + "-"
					+ studentInformation.p(date) + " " + studentInformation.p(h)
					+ ':' + studentInformation.p(m);
			return now;
		},
		/**
		 * 获取当前时间
		 * 
		 * @param s 时间单位
		 */
		p:function(s) {
		    return s < 10 ? '0' + s: s;
		},
		/**
		 * 转换成驼峰命名
		 */
		humpName:function(str){
		  var arr=str.split("_");
		  for(var i=1;i<arr.length;i++){
		    arr[i]=arr[i].charAt(0).toUpperCase()+arr[i].substring(1);
		  }
		  return arr.join("");
		},
			/**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#infoForm").validate({
			    rules : {
					sexCode : {
						required : true,
					},
					nationCode : {
					    required : true
					},
					mobilePhone:{
						isMobilePhone:true
					},
					qq:{
						isQQ:true
					},
					email:{
						isEmail:true
					},
					postalCode:{
						isPostalCode:true
					}
				},
			    messages : {
			    	sexCode : {
					    required : '性别不能为空'
					},
					nationCode : {
						required : '民族不能为空'
					},
					mobilePhone:{
						isMobilePhone:"手机号码格式不正确"
					},
					qq:{
						isQQ:"QQ号码格式不正确"
					},
					email:{
						isEmail:"电子邮箱格式不正确"
					},
					postalCode:{
						isPostalCode:"邮政编码格式不正确"
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text")
							.append(error);
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			})
		}
		
	}
	module.exports = studentInformation;
	window.studentInformation = studentInformation;
});
