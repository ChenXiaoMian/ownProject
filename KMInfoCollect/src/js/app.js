requirejs.config({
    //默认情况下模块所在目录为js/lib
    baseUrl: 'js/lib',
    //当模块id前缀为app时，他便由js/app加载模块文件
    //这里设置的路径是相对与baseUrl的，不要包含.js
    paths: {
        zepto: 'zepto.min',
        pageManager: 'pageManager',
        store: 'store.everything.min'
    }
});
require(['zepto','pageManager','store'], function ($,pageManager,store){

    $(function(){
        // 判断用户是否登录
        function IsLogin(){
            if(!store.get("loginName")){
                window.location.href = '/login.html';
            }
        }
        IsLogin();
        $("#btnSignOut").on('click',function(){
            store.remove('userName');
            store.remove('loginName');
            store.remove('password');
        });

        $('.js_item').on('click', function(){
            var id = $(this).data('id');
            window.pageManager.go(id);
        });
    });
});