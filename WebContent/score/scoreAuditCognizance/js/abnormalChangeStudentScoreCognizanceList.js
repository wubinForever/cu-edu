/**
 * 异动学生成绩认定
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var dataConstant = require("configPath/data.constant");
    var simpleSelect = require("basePath/module/select.simple");
    var entryType = require("basePath/enumeration/score/EntryType");

    /**
     * 成绩审核列表
     */
    var abnormalChangeStudentScoreCognizanceList = {
        // 初始化
        init : function() {
        	//异动学生成绩认定
        	$("button[name='identified-pop']").click(function(){
        		abnormalChangeStudentScoreCognizanceList.identifiedPop();
        	});
        },
        
        //弹框 异动学生成绩认定
        identifiedPop : function(){
        	popup.open('./score/scoreAuditCognizance/html/identified.html', // 这里是页面的路径地址
				{
					id : 'identified',
					title : '异动学生成绩认定',
					width : 1400,
					height : 780,
				});
        }

    }
    module.exports = abnormalChangeStudentScoreCognizanceList;
    window.scoreAudit = abnormalChangeStudentScoreCognizanceList;
});