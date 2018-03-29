/**
 * 环节成绩分制设置
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var url = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var base  =config.base;

    /**
     * 环节成绩分制设置
     */
    var tacheScoreCreditRegimenSet = {
        // 初始化
        init : function() {
            // 设置
            $(document).on("click", "button[name='set']", function() {
                courseScoreConstitutionSet.set(this);
            });
            // 构成修改设置
            $(document).on("click", "button[name='modify']", function() {
                courseScoreConstitutionSet.modify(this);
            });
            // 复选框
            utils.checkAllCheckboxes('check-all', 'checNormal');
        },
        /**
         * 环节成绩分制设置 弹窗
         */
        set: function(){
            art.dialog.open('./score/score/html/tacheScoreCreditRegimenSet.html', // 这里是页面的路径地址
                {
                    id : 'set',// 唯一标识
                    title : '环节成绩分制设置',// 这是标题
                    width : 500,// 这是弹窗宽度。其实可以不写
                    height : 200,// 弹窗高度
                    okVal : '确定',
                    cancelVal : '取消',
                    ok : function() {
                        return true;
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        },
        /**
         * 分制修改设置 弹窗
         */
        modify: function(){
            art.dialog.open('./score/score/html/tacheCreditRegimenModifySet.html', // 这里是页面的路径地址
                {
                    id : 'modify',// 唯一标识
                    title : '分制修改设置',// 这是标题
                    width : 500,// 这是弹窗宽度。其实可以不写
                    height : 320,// 弹窗高度
                    okVal : '保存',
                    cancelVal : '关闭',
                    ok : function() {
                        return true;
                    },
                    cancel : function() {
                        // 取消逻辑
                    }
                });
        }

    }
    module.exports = tacheScoreCreditRegimenSet;
    window.tacheScoreCreditRegimenSet = tacheScoreCreditRegimenSet;
});