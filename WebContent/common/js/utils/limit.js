function limit(txtNote, txtLimit, limitCount) {
    var isbyte; //是否使用字节长度限制（1汉字=2字符） 
    var txtlength; //到达限制时，字符串的长度 
    var txtByte;
//    txtNote.on("keydown", function() {
//        wordsLimit();
//    });
    txtNote.on("keyup",function() {
        wordsLimit();
    });
    //txtLimit.html(0+"/"+limitCount) ;
    wordsLimit();
    function wordsLimit() {
        var noteCount = 0;
        if (isbyte) {
            noteCount = txtNote.val().replace(/[^/x00 - /xff]/g, "xx").length
        } else {
            noteCount = txtNote.val().length;
        }
        if (noteCount > limitCount) {
            if (isbyte) {
            	txtNote.val(txtNote.val().substring(0, txtlength + Math.floor((limitCount - txtByte) / 2)));
                txtByte = txtNote.val().replace(/[^/x00 - /xff]/g, "xx").length;
                txtLimit.html(txtByte+"/"+limitCount) ;
            } else {
            	txtNote.val(txtNote.val().substring(0, limitCount));
                txtLimit.html(limitCount+"/"+limitCount) ;
            }
        } else {
            txtLimit.html(noteCount+"/"+limitCount) ;
        }
        txtlength = txtNote.val().length; //记录每次输入后的长度 
        txtByte = txtNote.val().replace(/[^/x00 - /xff]/g, "xx").length;
    }
}