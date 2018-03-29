 define(function (require, exports, module) {

/**
 * 学校性质
 * @author 谭鹏
 *
 */
var SchollType = {
		Sport:{
			value:0,
			name:"体育院校"
		},
		Comprehensive : {
			 value : 1,
			 name : "综合性大学"
		},
		Industry : {
			 value : 2,
			 name : "工科院校"
		},
		Agriculture : {
			 value : 3,
			 name : "农业院校"
		},
		Forestry : {
			 value : 4,
			 name : "林业院校"
		},
		Medicine : {
			 value : 5,
			 name : "医药院校"
		},
		Teacher : {
			 value : 6,
			 name : "高等师范院校"
		},
		Language : {
			 value : 7,
			 name : "语文院校"
		},
		Economics : {
			 value : 8,
			 name : "财经院校"
		},
		Law : {
			 value : 9,
			 name : "政法院校"
		},
		Art : {
			 value : 1,
			 name : "艺术院校"
		},
		Nation : {
			 value : 2,
			 name : "民族院校"
		},
		HightVocational:{
			value:5,
			name:"高等职业技术学校"
		},
		MiddleVocational:{
			value:9,
			name:"短期职业大学"
		}
		
}
module.exports = SchollType;
});