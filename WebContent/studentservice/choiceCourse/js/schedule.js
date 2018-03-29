/**
 * 课表
 */
define(function(require, exports, module) {

	var weekNameArr = [ "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日" ];
	var dayArr = [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16",
			"17", "18" ];
	// 课表
	var schedule = function(id, option) {
		/**
		 * 参数
		 */
		var opt = {
			dom : $("#" + id),			
			weekNum : [ 1, 2, 3, 4, 5, 6, 7 ],
			section : {
				am : 4,
				pm : 4,
				night : 2
			},
			data:"",
			invok:""
		}
		this.option = $.extend({}, opt, option);
		this.init();
	}
	schedule.prototype = {
		init : function() {
			this.option.dom.empty();
			this.formatHtml();
		},
		formatHtml : function(data,no) {
			if (!no) {
				no = 0;
			}
			this.createTitle(no);
			this.setData(data,no);
		},
		/**
		 * 创建课表Title
		 */
		createTitle:function(no){
			var div = $("<div id='schedule" + no + "'></div>");
			var table = $("<table class='table table-bordered table-cm table-cm-normal'></table>");
			this.createThead(table);
			this.createTbody(table);			
			div.append(table);			
			this.option.dom.append(div);
		},
		/**
		 * 创建表头
		 */
		createThead : function(table) {
			var thead = $("<thead></thead>"), tr = $("<tr></tr>"), th = $("<th></th>"), me = this;
			tr.append(th.clone());
			tr.append(th.clone());						
			$.each(this.option.weekNum, function(i, num) {
				var weekName = me.getWeekName(num - 1);
				th.clone().append(weekName).appendTo(tr);
			});
			table.append(thead.append(tr));
		},
		/**
		 * 创建表身
		 */
		createTbody : function(table) {
			var tbody = $("<tbody></tbody>");
			this.createTbodyTd(tbody);
			table.append(tbody);
		},
		/**
		 * 创建表身中的TD节点
		 */
		createTbodyTd : function(tbody) {
			var me = this;
			var am = this.option.section.am;
			var pm = this.option.section.pm;
			var night = this.option.section.night;
			var max = am + pm + night;
			
			for (var i = 1; i <= max; i++) {
				var tr = $("<tr></tr>");
				if (i === 1) {
					tr.append("<td rowspan='" + am + "'>上午</td>");
				} else if (i === (am + 1)) {
					tr.append("<td rowspan='" + pm + "'>下午</td>");
				} else if (i === (am + pm + 1)) {
					tr.append("<td rowspan='" + night + "'>晚上</td>");
				}
				
				if (i % 2 === 0) { // 若为偶数行 则无内容显示
					tbody.append(tr);
					continue;
				}
				
				var row;
				if (i === max) {
					row = i + "";
				} else {
					row = i + "-" + (i + 1);
				}
				tr.append("<td rowspan='2'>" + row + "</td>");
				var tdWid = 1 / this.option.weekNum.length * 100 + "%";
				$.each(this.option.weekNum, function(m, item) {
					var sections;
					if (i === max) {
						sections = item + "" + me.formatNum(i);
					} else {
						sections = item + "" + me.formatNum(i) + "," + item + "" + me.formatNum(i + 1);
					}
					tr.append("<td rowspan='2' section='" + sections + "' style='white-space:normal;padding:0px;text-align:left;width:" + tdWid
							+ ";'></td>");
				});
				tbody.append(tr);
			}
		},
		/**
		 * 获取星期几的名称
		 */
		getWeekName : function(i) {
			return weekNameArr[i];
		},
		/**
		 * 数字补齐
		 */
		formatNum : function(i) {
			if (i < 10) {
				return "0" + i;
			} else {
				return i;
			}
		},
		/**
		 * 通过节次字符串获取节次数字
		 * @param item 节次字符串
		 * @returns 节次数字
		 */
		getNum:function(item){
			return Number(item) - Number(item.substr(0, 1) + "00");
		},
		/**
		 * 设置数据
		 */
		setData : function(data,no) {
			var me = this;
			var dayNum = me.formatNum(this.option.section.am + this.option.section.pm + this.option.section.night);
			if (data) {
				me.option.data = data;
			}
			var schedule = me.option.dom.find("#schedule" + no);			
			$.each(me.option.data.scheduleList, function(i, item) {
				var sectionList =item.courseArrangeSection==null?[]:item.courseArrangeSection.split(',');
				var setSection = []; // 已经设置的节次
				$.each(sectionList, function(j, sectionName) {
					var arrangeSection=""; // TD中显示的节次信息
					if (!setSection.contains(sectionName)) { // 已设置的节次不在重复设置						
						var tdSection;
						if ((Number(sectionName) % 2) > 0) {
							if ((sectionName.substr(0, 1) + dayNum) === sectionName) {
								tdSection = sectionName;
								setSection.push(sectionName);
								var sectionNum = me.getNum(sectionName);
								arrangeSection=sectionNum+"";
							} else {
								tdSection = sectionName + "," + (Number(sectionName) + 1);
								setSection.push(sectionName);
								setSection.push((Number(sectionName) + 1) + "");
								
								var sectionNum = me.getNum(sectionName);
								if(item.courseArrangeSection.indexOf((Number(sectionName) + 1) + "")>=0){
									arrangeSection=sectionNum+"-"+(sectionNum + 1);
								}else{
									arrangeSection=sectionNum+"";
								}
							}
						} else {
							tdSection = (Number(sectionName) - 1) + "," + sectionName;
							setSection.push((Number(sectionName) - 1) + "");
							setSection.push(sectionName);
							
							var sectionNum = me.getNum(sectionName);
							if(item.courseArrangeSection.indexOf((Number(sectionName) - 1) + "")>=0){
								arrangeSection=(sectionNum - 1)+"-"+sectionNum;
							}else{
								arrangeSection=sectionNum+"";
							}
						}
						var singleOrDoubleWeek="";
						switch (item.singleOrDoubleWeek) {
						case 1:
							singleOrDoubleWeek = "单周";
							break;
						case 2:
							singleOrDoubleWeek = "双周";
							break;
						}
						
						var divHtml = "<div style='margin-top:5px;margin-left:5px;'>";						
						if (item.courseName) {
							divHtml += "<p><b>" + item.courseName + "</b></p>";
						}
						
						divHtml += "<p>";
						if (item.teachers) {
							divHtml += item.teachers + "（";
						}
						divHtml += item.courseArrangeWeekly + "周" + singleOrDoubleWeek + "、" + arrangeSection
								+ "节";
						if (item.teachers) {
							divHtml += "）";
						}
						divHtml += "</p>";						
						
						if (item.venueName) {
							divHtml += "<p>" + item.buildingName + item.venueName + "</p>";
						}
						divHtml += "</div>";
						schedule.find("td[section='" + tdSection + "']").append(divHtml);
					}
				});
			});
		}
	}
	module.exports = schedule; // 与文件名称一致
});