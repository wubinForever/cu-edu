/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("../../../common/js/utils/utils");
	var config = require("../../../common/js/utils/config");
	require("../../../common/js/utils/common");
	var weekNameArr = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
	var dayArr = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18"];
	// 节次
	var section = function(id, option){
		/**
		 * 参数
		 */
		var opt = {
			dom:$("#"+id),
			weekNum:[1,2,3,4,5,6,7],
			section:{
				am:4,
				pm:4,
				night:2
			},
			status:["禁排","固排"],
			data:[[],[]],
			checkboxName:"禁排"
		}
		this.option =  $.extend({}, opt, option);
		this.init();
	}
	section.prototype = {
		init : function(){
			this.option.dom.empty();
			this.formatHtml();
			this.bindEvent();
			this.setData();
		},
		/**
		 *  绑定事件
		 */
		bindEvent:function(){
			var me = this;
			this.option.dom.find("td[section]").click(function(){
				me.setStatus(this);
			});
			this.option.dom.find("input[type=checkbox][name=checNormal]").click(function(){
				me.checkAll(this);
			});
		},
		/**
		 * 设置状态
		 */
		setStatus : function(obj){
			var td = $(obj);
			var status = td.attr("status");
			var statusArr = this.option.status;
			var section = td.attr("section");
			if(status){
				status = parseInt(status);
			}else{
				status = 0;
			} 
			var item = statusArr[status];
			if(item){
				td.html(item);
				td.attr("status", status + 1);
			}else{
				td.html("");
				td.removeAttr("status");
			}
			//设置选中
			var day = section.substring(0,1);
			var checkbox = this.option.dom.find("input[type=checkbox][name=checNormal][day="+day+"]");
			var count = this.getCheckboxStatus();
			if(count == (status + 1)){
				var tds = this.option.dom.find("td[section^="+day+"]");
				var statusTds = this.option.dom.find("td[section^="+day+"][status="+(status + 1)+"]");
				if(tds.length == statusTds.length){
					checkbox.prop("checked", true).parent().addClass("on-check");
				}
			}else{
				checkbox.removeAttr("checked").parent().removeClass("on-check");
			}
		},
		/**
		 * 初始化页面结构
		 */
		formatHtml: function(){
			this.createThead();
			this.createTbody();
		},
		/**
		 * 创建表头
		 */
		createThead:function(){
			var thead = $("<thead></thead>"),
				tr = $("<tr></tr>"),
				th = $("<th></th>"),
				me = this;
			var _th = th.clone();
			_th.attr("width","120").attr("style","background:url(./../../../../common/images/talbe-line.png) 0 0 no-repeat;height: 53px;");
			_th.html("<div class='table-out'><b>星期</b><em>节次</em></div>");
			tr.append(th.clone()).append(_th);
			$.each(this.option.weekNum, function(i, num){
				var weekName = me.getWeekName(num - 1);
				th.clone().append(weekName).append(me.getCheckbox(num)).appendTo(tr);
			});
			me.option.dom.append(thead.append(tr));
		},
		/**
		 * 创建表身
		 */
		createTbody:function(){
			var am = this.option.section.am,
				pm = this.option.section.pm,
				night = this.option.section.night,
				tbody = $("<tbody></tbody>");
			this.createTbodyTd(tbody, 1, am,"上午");
			this.createTbodyTd(tbody, am + 1, am + pm,"下午");
			this.createTbodyTd(tbody, am + pm + 1, am + pm + night,"晚上");
			this.option.dom.append(tbody);
		},
		/**
		 * 创建表身中的td节点
		 * @param tr
		 * @param i
		 * @param max
		 */
		createTbodyTd:function(tbody, start, max, name){
			var me = this;
			for(var i = start; i <= max; i ++){
				var tr = $("<tr></tr>");
				if(i == start){
					tr.append("<td rowspan="+(max - start + 1)+">"+name+"</td>");
				}
				tr.append("<td width='120'>"+i+"</td>");
				$.each(this.option.weekNum, function(m, item){
					tr.append("<td section="+item + me.formatNum(i) +"></td>");
				});
				tbody.append(tr)
			}
		},
		/**
		 * 数字补齐
		 */
		formatNum : function(i){
			if(i < 10){
				return "0" + i;
			}else{
				return i;
			}
		},
		/**
		 * 获取星期几的名称
		 */
		getWeekName:function(i){
			return weekNameArr[i];
		},
		/**
		 * 获取复选框
		 * @param i
		 * @returns
		 */
		getCheckbox : function(num){
			var div = $("<div></div>"),
				label = $("<label></label>"),
				_div = $("<div class='checkbox-con' style='margin-top:-2px;'><input type='checkbox' name='checNormal' day="+num+"  class='checNormal'></div>");
			return div.append(label.append(_div).append(this.option.checkboxName));
		},
		/**
		 * 获取数据
		 * @returns {Array}
		 */
		getData: function(){
			var result = [], me = this;
			 $.each(this.option.status, function(i){
				 var obj = [];
				 me.option.dom.find("td[section][status="+(i+1)+"]").each(function(i, item){
					 obj.push($(item).attr("section"));
				 });
				 result.push(obj);
			 });
			 return result;
		},
		/**
		 * 设置数据
		 */
		setData : function(data){
			var me = this;
			if(data){
				me.option.data = data;
			}
			me.option.dom.find("td[section]").html("").removeAttr("status");
			var count = this.getCheckboxStatus();
			$.each(me.option.data, function(i, item){
				var name = me.option.status[i];
				$.each(item, function(j, _item){
					me.option.dom.find("td[section="+_item+"]").html(name).attr("status", i + 1);
				});
			});
			me.setCheckAll();
		},
		setCheckAll:function(){
			var me = this;
			var count = me.getCheckboxStatus();
			me.option.dom.find("input[type=checkbox][name=checNormal]").each(function(i, item){
				var day = $(item).attr("day");
				var l = me.option.dom.find("td[section^="+day+"]").length;
				var length = me.option.dom.find("td[section^="+day+"][status="+count+"]").length;
				if(l == length){
					$(item).prop("checked", true).parent().addClass("on-check");
				}
			});
		},
		/**
		 * 点击选中
		 * @param obj
		 */
		checkAll : function(obj){
			var _ = $(obj),
				me = this,
				dom = me.option.dom,
				checkboxName = me.option.checkboxName,
				count = this.getCheckboxStatus();
			var day = _.attr("day");
			if(_.is(':checked')){
				me.option.dom.find("td[section^="+day+"]").html(checkboxName).attr("status", count);
			}else{
				me.option.dom.find("td[section^="+day+"]").html("").removeAttr("status");
			}
		},
		/**
		 * 获取选中值对应的状态值
		 * @returns {Number}
		 */
		getCheckboxStatus : function(){
			var count,
				status = this.option.status,
				checkboxName = this.option.checkboxName;
			for(var i = 0 , length = status.length; i < length; i ++){
				if(status[i] == checkboxName){
					count = i + 1;
					break;
				}
			}
			return count;
		}
	}
	module.exports = section; //根文件夹名称一致
});