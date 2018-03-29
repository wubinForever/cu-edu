/**
 * 分制设置
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var url = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var dataConsTant = require("configPath/data.constant");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var urlTrainPlan = require("basePath/config/url.trainplan");
    var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
    var ve = require("basePath/utils/validateExtend");
    var enableChanges = require("basePath/enumeration/score/EnableChanges");
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var scoreType = require("basePath/enumeration/score/ScoreType");
    var base  =config.base;
    /**
     * 分制新增
     */
    var scoreRegimenAdd = {
        // 初始化
        init : function() {
            // 新增
            $(document).on("click", "#addCourse", function() {
                scoreRegimenAdd.addList();
            });

            // 删除
           $(document).on("click", "button[name='delete']", function() {
                var parentObj = $(this).parents("tr");
                var index = parentObj.index();
                scoreRegimenAdd.deleteList(parentObj,index);
            });

           scoreRegimenAdd.inputDataChange();
        },
        // 新增
        addList:function(){
           var trObj = $(".scorll-box tbody tr");
           var len = trObj.length;
           if(len > 9){
               return false;
           }else{
               var lastMinNum =  trObj.eq(len-2).find(".mininum").val();
               var list = '<tr><td class="width48">'+len+'</td><td class="width20 scorepadding"><div class="tip-text verification-info"><input type="text" class="form-control inp-minimum cname"></td>'
                          +'<td class="width20"><input type="text" class="form-control inp-minimum"><label class="error"></label></div></td>'
                          +'<td class="scorepadding"><div class="tip-text verification-info"><input type="text" value="'+lastMinNum+'" class="form-control inp-minimum text-r inline-block maxnum" style="width:80px;" disabled="disabled" > ≥ 分数 ≥ <input type="text" class="form-control inp-minimum text-r inline-block mininum"  style="width:80px;"><label class="error"></label></div></td>'
                          +'<td class="width120 scorepadding"><div class="tip-text verification-info"><input type="text" class="form-control inp-minimum middlenum text-r" style="width:100px;"><label class="error"></label></div></td>'
                          +'<td class="width60"><button type="button" class="btn-text" name="delete">删除</button></td></tr>';
               //最后一行改变序号
               trObj.eq(len-1).find("td:eq(0)").text(len+1);
               trObj.eq(len-1).find(".maxnum").val("");
               //在倒数第二行插入
               trObj.eq(len-2).after(list);
               if(len == 9){
                  $("#addCourse").removeClass("btn-success").addClass("disabled");
               }else{
                  $("#addCourse").addClass("btn-success").removeClass("disabled");
               }
              
           }

           scoreRegimenAdd.inputDataChange();
           
        },
        //删除操作
        deleteList:function(obj,i){
            var len =  $(".scorll-box tbody tr").length;
            var preTr = obj.prev("tr");
            var nextTr = obj.next("tr");
            var preMininum = preTr.find(".mininum").val();
            $(".scorll-box tbody tr").each(function(index,element){
                  if(index > i){
                     var obj = $(".scorll-box tbody tr").eq(index).find("td:eq(0)");
                     var txt = obj.text();
                     obj.text(parseInt(txt)-1);
                  }
            });
            nextTr.find(".maxnum").val(preMininum);
            obj.remove();
            if(len == 10){
               $("#addCourse").addClass("btn-success").removeClass("disabled"); 
            }
            scoreRegimenAdd.inputDataChange();
        },
        //分数改变操作
        inputDataChange:function(){
            $(".mininum,.middlenum").on("focusout",function(){
                var nextTr = $(this).parents("tr").next();
                if($(this).val()){
                    var fval = parseFloat($(this).val()).toFixed(1);
                    $(this).val(fval);
                    nextTr.find(".maxnum").val(fval);
                }else{
                    nextTr.find(".maxnum").val("");
                }
                
            }).on("keyup",function(){
                var nowval = $(this).val();
                if(nowval){
                    $(this).val(nowval.replace(/[^\-?\d.]/g,''));
                }
            });
        },
        //验证
        validate:function(){
            $(".cname").each(function(){
                if(!$(this).val()){
                   $(this).parents("td").append("<div>请输入等级中文名称</div")  
                }
            });

             $(".mininum").each(function(){
                if(!$(this).val()){
                   $(this).parents("td").append("<div>请输入分数段成绩</div")  
                }
            });

             $(".mininum").each(function(){
                if(!$(this).val()){
                   $(this).parents("td").append("<div>请输入分数段成绩</div")  
                }
            });

        },

    }
    module.exports = scoreRegimenAdd;
    window.scoreRegimenAdd = scoreRegimenAdd;
});