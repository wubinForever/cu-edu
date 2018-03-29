define(function(require, exports, module) {
	/**
	 * 排课进度设置进入页面 
	 */
	var ScheduleSettingsEnterPage = {
		PracticeTask : {
			value : 0,
			describe : "实践任务"
		},
		PracticeArrange : {
			value : 1,
			describe : "实践安排"
		},
		TheoreticalTask : {
			value : 2,
			describe : " 理论任务设置"
		},
		ScheduleArrange : {
			value : 3,
			describe : " 课表编排"
		}
	}
	module.exports = ScheduleSettingsEnterPage;
});