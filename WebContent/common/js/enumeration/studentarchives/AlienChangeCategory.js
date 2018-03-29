define(function(require, exports, module) {
	/**
	 * 学籍异动类别
	 * 
	 * @version 2017.11.15
	 * @author zhang.qionglin
	 */
	var alienChangeCategory = {
		GPLX : {
			value : "01",
			name : "公派留学"
		},
		LJ : {
			value : "02",
			name : "留级"
		},
		JJ : {
			value : "03",
			name : "降级"
		},
		TJ : {
			value : "04",
			name : "跳级"
		},
		SD : {
			value : "05",
			name : "试读"
		},
		YCNX : {
			value : "06",
			name : "延长年限"
		},
		SDTG : {
			value : "07",
			name : "试读通过"
		},
		HGFX : {
			value : "08",
			name : "回国复学"
		},
		XX : {
			value : "11",
			name : "休学"
		},
		FX : {
			value : "12",
			name : "复学"
		},
		TX : {
			value : "13",
			name : "停学"
		},
		BLRXZG : {
			value : "14",
			name : "保留入学资格"
		},
		HFRXZG : {
			value : "15",
			name : "恢复入学资格"
		},
		QXRXZG : {
			value : "16",
			name : "取消入学资格"
		},
		HFXJ : {
			value : "17",
			name : "恢复学籍"
		},
		QXXJ : {
			value : "18",
			name : "取消学籍"
		},
		BLXJ : {
			value : "19",
			name : "保留学籍"
		},
		ZXZC : {
			value : "21",
			name : "转学（转出）"
		},
		ZXZR : {
			value : "22",
			name : "转学（转入）"
		},
		ZZY : {
			value : "23",
			name : "转专业"
		},
		ZSB : {
			value : "24",
			name : "专升本"
		},
		BZZ : {
			value : "25",
			name : "本转专"
		},
		ZX : {
			value : "26",
			name : "转系"
		},
		ZBJ : {
			value : "29",
			name : "转班级"
		},
		TUX : {
			value : "31",
			name : "退学"
		},
		KCXJ : {
			value : "42",
			name : "开除学籍"
		},
		SW : {
			value : "51",
			name : "死亡"
		},
		GNFX : {
			value : "64",
			name : "国内访学"
		},
		GNFXHFX : {
			value : "65",
			name : "国内访学后返校"
		},
		OTHER : {
			value : "99",
			name : "其他"
		}
	}
	module.exports = alienChangeCategory;
});
