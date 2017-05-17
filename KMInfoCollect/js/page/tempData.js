// 选择模板类型逻辑
$(function(){
    store.remove('chooseTemp');
    $("#tempType a").on('click',function(){
        var type = $(this).data("type");
        store.set('chooseTemp',type);
        window.pageManager.go('tempList');
    });
});