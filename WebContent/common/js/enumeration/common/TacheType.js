define(function (require, exports, module) {
	/**
	 * 环节类别
	 * @author jing.zhang
	 *
	 */
	 var TacheType = {
			 Internship : {
				 value : "22",
				 describe : "实习"
			 },
			 MilitaryTraining : {
				 value : "23",
				 describe : "军训"
			 },
			 CurriculumDesign : {
				 value : "24",
				 describe : "课程设计"
			 },
			 GraduationProject : {
				 value : "25",
				 describe : "毕业设计"
			 },
			 Other : {
				 value : "99",
				 describe : "其他"
			 }
			 
	 }
	 
	 module.exports = TacheType;
});