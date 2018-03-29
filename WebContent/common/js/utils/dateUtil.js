define(function(require, exports, module) {
	// 扩展Date的format方法
	Date.prototype.format = function(format) {
		var o = {
			"M+" : this.getMonth() + 1,
			"d+" : this.getDate(),
			"h+" : this.getHours(),
			"m+" : this.getMinutes(),
			"s+" : this.getSeconds(),
			"q+" : Math.floor((this.getMonth() + 3) / 3),
			"S" : this.getMilliseconds()
		}
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.getFullYear() + "")
					.substr(4 - RegExp.$1.length));
		}
		for ( var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
						: ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	}
	var dateUtil = {
		/**
		 * 转换日期对象为日期字符串
		 * 
		 * @param date
		 *            日期对象
		 * @param isFull
		 *            是否为完整的日期数据, 为true时, 格式如"2000-03-05 01:05:04" 为false时, 格式如
		 *            "2000-03-05"
		 * @return 符合要求的日期字符串
		 */
		getSmpFormatDate : function(date, isFull) {
			var pattern = "";
			if (isFull == true || isFull == undefined) {
				pattern = "yyyy-MM-dd hh:mm:ss";
			} else {
				pattern = "yyyy-MM-dd";
			}
			return getFormatDate(date, pattern);
		},
		/**
		 * 转换当前日期对象为日期字符串
		 * 
		 * @param date
		 *            日期对象
		 * @param isFull
		 *            是否为完整的日期数据, 为true时, 格式如"2000-03-05 01:05:04" 为false时, 格式如
		 *            "2000-03-05"
		 * @return 符合要求的日期字符串
		 */
		getSmpFormatNowDate : function(isFull) {
			return getSmpFormatDate(new Date(), isFull);
		},
		/**
		 * 转换long值为日期字符串
		 * 
		 * @param l
		 *            long值
		 * @param isFull
		 *            是否为完整的日期数据, 为true时, 格式如"2000-03-05 01:05:04" 为false时, 格式如
		 *            "2000-03-05"
		 * @return 符合要求的日期字符串
		 */
		getSmpFormatDateByLong : function(l, isFull) {
			return getSmpFormatDate(new Date(l), isFull);
		},
		/**
		 * 转换long值为日期字符串
		 * 
		 * @param l
		 *            long值
		 * @param pattern
		 *            格式字符串,例如：yyyy-MM-dd hh:mm:ss
		 * @return 符合要求的日期字符串
		 */
		getFormatDateByLong : function(l, pattern) {
			return getFormatDate(new Date(l), pattern);
		},
		/**
		 * 转换日期对象为日期字符串
		 * 
		 * @param l
		 *            long值
		 * @param pattern
		 *            格式字符串,例如：yyyy-MM-dd hh:mm:ss
		 * @return 符合要求的日期字符串
		 */
		getFormatDate : function(date, pattern) {
			if (date == undefined) {
				date = new Date();
			}
			if (pattern == undefined) {
				pattern = "yyyy-MM-dd hh:mm:ss";
			}
			return date.format(pattern);
		},

		/**
		 * 转换日期对象为日期字符串 星期一（9月9日）
		 */
		getFormatDayByLong : function(l) {
			if (l != undefined) {
				var d = new Date(l);
				var week = {};
				week[0] = "星期日";
				week[1] = "星期一";
				week[2] = "星期二";
				week[3] = "星期三";
				week[4] = "星期四";
				week[5] = "星期五";
				week[6] = "星期六";
				return week[d.getDay()] + "(" + d.format("MM月dd日") + ")";
			}
		},

		/**
		 * 将字符串转化成日期 类型为 yyyy-mm-dd HH:mi:ss
		 */
		getDateForStringDate : function(strDate) {
			// 切割年月日与时分秒称为数组
			var s = strDate.split(" ");
			var s1 = s[0].split("-");
			var s2 = s[1].split(":");
			if (s2.length == 2) {
				s2.push("00");
			}
			return new Date(s1[0], s1[1] - 1, s1[2], s2[0], s2[1], s2[2]);
		},

		// 计算天数差的函数，通用 sDate1和sDate2是2002-12-18格式
		dateDiff : function(sDate1, sDate2) {
			var aDate, oDate1, oDate2, iDays
			aDate = sDate1.split("-")
			oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) // 转换为12-18-2002格式
			aDate = sDate2.split("-")
			oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
			iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24) // 把相差的毫秒数转换为天数
			return iDays
		}
	};
	window.dateUtil = dateUtil;
	module.exports = dateUtil;
});
// alert(getSmpFormatDate(new Date(1279849429000), true));
// alert(getSmpFormatDate(new Date(1279849429000),false));
// alert(getSmpFormatDateByLong(1279829423000, true));
// alert(getSmpFormatDateByLong(1279829423000,false));
// alert(getFormatDateByLong(1279829423000, "yyyy-MM"));
// alert(getFormatDate(new Date(1279829423000), "yy-MM"));
// alert(getFormatDateByLong(1279849429000, "yyyy-MM hh:mm"));
