// 历史记录逻辑
$(function(){
    store.remove('chooseHistory');
    $("#historyType a").on('click',function(){
        var type = $(this).data("type");
        store.set('chooseHistory',type);
        window.pageManager.go('historyList');
    });
});