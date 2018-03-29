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
			this.bindEvent();
			this.setData();
		},
		formatHtml : function() {
			this.createThead();
			this.createTbody();
		},
		bindEvent : function() {
			var me = this;
			this.option.dom.find("td[section]").click(function(e) {
				var obj = $(this);
				if(e.target.nodeName.toLowerCase()!=="a"){ // 点击a标签，选择教室和删除教室 则不执行TD选中和排课任务排课事件
					if (obj.prop("class") === "unable") {
						var divObj = obj.find("div");
						if(divObj.length>0){
							me.option.dom.find("td[class='selected']").removeClass().addClass("unable");
							obj.removeClass().addClass("selected");
							
							me.checkedDiv(e);
						}
					} else if (obj.prop("class") === "selected") {
						me.checkedDiv(e);
					} else {
						me.option.invok.saveArrangeTask(obj);
					}
				}
			});
		},
		/**
		 * 创建表头
		 */
		createThead : function() {
			var thead = $("<thead></thead>"), tr = $("<tr></tr>"), th = $("<th></th>"), me = this;
			tr.append(th.clone());
			$.each(this.option.weekNum, function(i, num) {
				var weekName = me.getWeekName(num - 1);
				th.clone().append(weekName).appendTo(tr);
			});
			me.option.dom.append(thead.append(tr));
		},
		/**
		 * 创建表身
		 */
		createTbody : function() {
			var am = this.option.section.am;
			var pm = this.option.section.pm;
			var night = this.option.section.night;
			var tbody = $("<tbody></tbody>");
			this.createTbodyTd(tbody, 1, am + pm + night, "晚上");
			this.option.dom.append(tbody);
		},
		/**
		 * 创建表身中的TD节点
		 */
		createTbodyTd : function(tbody, start, max, name) {
			var me = this;
			for (var i = start; i <= Math.ceil(max / 2); i++) {
				var tr = $("<tr></tr>");
				var row;
				if (i * 2 > max) {
					row = (i * 2 - 1) + "";
				} else {
					row = (i * 2 - 1) + "-" + i * 2;
				}
				tr.append("<td>" + row + "</td>");
				var tdWid = 1/this.option.weekNum.length*100+"%";				
				$.each(this.option.weekNum, function(m, item) {
					var sections;
					if (i * 2 > max) {
						sections = item + "" + me.formatNum(i * 2 - 1);
					} else {
						sections = item + "" + me.formatNum(i * 2 - 1) + "," + item + "" + me.formatNum(i * 2);
					}
					tr.append("<td section='" + sections + "' class='unable'  style='padding:0px;width:"+tdWid+";'></td>");
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
		setData : function(data) {
			var me = this;
			var dayNum = me.formatNum(this.option.section.am + this.option.section.pm + this.option.section.night);
			if (data) {
				me.option.data = data;
			}
			me.option.dom.find("td[section]").empty();
			$.each(me.option.data, function(i, item) {
				var sectionList = item.courseArrangeSection.split(',');
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
						var divHtml = "<div schedulingTaskId='" + item.schedulingTaskId + "'><p style='margin-top:5px;'>" + me.option.invok.theoreticalItem.courseName
								+ "</p><p name='weekSection' week='" + item.courseArrangeWeekly + "' section='"
								+ item.courseArrangeSection + "' singleOrDoubleWeek='"+item.singleOrDoubleWeek+"'>" + item.courseArrangeWeekly + "周"+singleOrDoubleWeek+"、"
								+ arrangeSection + "节</p>";
						if (item.teachRoom) {
							divHtml += "<p><a name='chooseTeachRoom'>" + item.teachRoom + "</a><a name='deleteTeachRoom' style='display:inline-block;width:15px;height:16px;background:#804D33;color:white;text-align:center;line-height:16px;border-radius:50%;margin-left:3px;font-size:14px;'>&times;</a></p>"
						}else{
							divHtml += "<p><a name='chooseTeachRoom'>选择教室</a></p>"
						}
						divHtml += "</div>";
						me.option.dom.find("td[section='" + tdSection + "']").append(divHtml).removeClass().addClass("unable");
					}
				});
			});
		},
		/**
		 * 选中排课任务 刷新课表的可排状态
		 * @param data 可排节次集合
		 */
		changeStatus : function(data) {
			var me = this;
			var dayNum = me.formatNum(this.option.section.am + this.option.section.pm + this.option.section.night);
			me.option.dom.find("td[section]").removeClass().addClass("unable");
			var setSection=[];	// 已经设置的节次
			$.each(data, function(i, item) {
				if (!setSection.contains(item)) { // 已设置的节次不在重复设置
					var tdSection;
					if ((Number(item) % 2) > 0) {
						if ((item.substr(0, 1) + dayNum) === item) {
							tdSection = item;
							setSection.push(item);
						} else {
							tdSection = item + "," + (Number(item) + 1);
							setSection.push(item);
							setSection.push((Number(item) + 1) + "");
						}
					} else {
						tdSection = (Number(item) - 1) + "," + item;
						setSection.push((Number(item) - 1) + "");
						setSection.push(item);
					}
					var obj = me.option.dom.find("td[section='" + tdSection + "']");
					obj.removeClass();
				}
			});
			me.checkedRadio();
		},
		/**
		 * 刷新选中的排课任务对应的课表的选中状态样式
		 */
		checkedRadio:function(){
			var me = this;
			var dayNum = me.formatNum(this.option.section.am + this.option.section.pm + this.option.section.night);
			var checkedRadio = $("#tbodyContent").find("input[name='isSeleted']:checked").parent().parent().parent().parent();
			if(checkedRadio.length>0){
				me.option.dom.find("td[class='selected']").removeClass();
				var data = checkedRadio.find("td[name='section']").attr("section").split(",");
				var setSection=[];	// 已经设置的节次
				$.each(data, function(i, item) {
					if (!setSection.contains(item)) { // 已设置的节次不在重复设置
						var tdSection;
						if ((Number(item) % 2) > 0) {
							if ((item.substr(0, 1) + dayNum) === item) {
								tdSection = item;
								setSection.push(item);
							} else {
								tdSection = item + "," + (Number(item) + 1);
								setSection.push(item);
								setSection.push((Number(item) + 1) + "");
							}
						} else {
							tdSection = (Number(item) - 1) + "," + item;
							setSection.push((Number(item) - 1) + "");
							setSection.push(item);
						}
						var obj = me.option.dom.find("td[section='" + tdSection + "']");
						obj.removeClass().addClass("selected");
					}
				});
			}else{
				me.option.dom.find("td[section]").removeClass().addClass("unable");
			}
		},
		/**
		 * 点击课表，反向选中排课任务
		 */
		checkedDiv:function(e){
			var me = this;
			var clickDiv;
			if(e.target.nodeName.toLowerCase()==="div"){
				clickDiv = $(e.target);
			}else if(e.target.nodeName.toLowerCase()==="p"){
				clickDiv = $(e.target).parent();
			}else if(e.target.nodeName.toLowerCase()==="td"){
				clickDiv = $(e.target).find("div");
			}
			var unCheckedRadio = $("#tbodyContent").find("input[name='isSeleted']:checked");
			unCheckedRadio.removeProp("checked");
			unCheckedRadio.parent().parent().removeClass("on-radio");
			
			var checkedRadio = $("#tbodyContent tr[id='"+clickDiv.attr("schedulingTaskId")+"']").find("input[name='isSeleted']");
			checkedRadio.prop("checked","checked");
			checkedRadio.parent().parent().addClass("on-radio");

			me.option.invok.checkArrangeTask(checkedRadio.parent());
		}
	}
	module.exports = schedule; // 与文件名称一致
});