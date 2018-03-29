 define(function (require, exports, module) {

/**
 * 成绩类型(1总评成绩2平时成绩3期中成绩4期末成绩5技能成绩)
 * @author chen.qiaomei
 *
 */
var ScoreCategory = {
		TotalScore : {
			 value : 1,
			 name : "总评成绩"
		 },
		 UsualScore : {
			 value : 2,
			 name : "平时成绩"
		 },
		 MidtermScore : {
			 value : 3,
			 name : "期中成绩"
		 },
		 EndtermScore : {
			 value : 4,
			 name : "期末成绩"
		 },
		 SkillScore : {
			 value : 5,
			 name : "技能成绩"
		 },
}
module.exports = ScoreCategory;
});