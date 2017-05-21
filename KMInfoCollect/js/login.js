;(function($){
$(function(){
    getPosition();
    var $txtusername = $("#txtusername"),
        $txtuserpass = $("#txtuserpass"),
        kmurl = 'http://km126.km1818.com:8181/KMInfoCollect/services';

    function initLogin(){
        if(store.get("loginName") && store.get("password")){
            window.location.href = 'index.html';
        }
    }
    initLogin();
    // 验证所需
    var regexp = {
        regexp: {}
    };
    weui.form.checkIfBlur('#form-login', regexp);

    function login(){
        weui.form.validate('#form-login', function (error) {
            if(error){
                error.ele.focus();
            }else{
                var jsonData = {};
                jsonData.userName = $.trim($txtusername.val());
                jsonData.password = hex_md5($.trim($txtuserpass.val()));

                $.ajax({
                  url: kmurl+'/loginJSONP',
                  type: 'GET',
                  contentType: 'application/json;charset=utf-8',
                  data: {"parms":JSON.stringify(jsonData)},
                  dataType: 'jsonp',
                  timeout: 300,
                  jsonp: 'jsoncallback',
                  success: function(data){
                    if(data.result=='success'){
                        store.set('userName', JSON.parse(data.message).name);
                        store.set('loginName', jsonData.userName);
                        store.set('password', jsonData.password);
                        weui.toast('登录成功！', 500);
                        setTimeout(function(){
                            window.location.href = 'index.html';
                        },600);
                    }else{
                        weui.topTips('账号或密码错误！');
                        $txtusername.val("");
                        $txtuserpass.val("");
                    }
                  },
                  error: function(xhr, type){
                    alert('Ajax error!');
                  }
                });
            }
        }, regexp);
    }

    $("#btnLogin").on('click',function(){
        login();
    });
    $txtusername.on('keydown',function(event) {
        if(event.keyCode==13){
            $txtuserpass.focus();
        }
    });
    $txtuserpass.on('keydown',function(event) {
        if(event.keyCode==13){
            login();
        }
    });
});
})(window.Zepto);