// 模板列表逻辑

// 模板列表初始化
function tempListInit(key){
    if(store.get(key) && !isEmpty(JSON.parse(store.get(key)).data)){
        loadTemplateStore(key);
        $("#templateListEmpty").hide();
        $("#btnNewTempWrap").show();
        $("#templateList").show();
        // 判断高度是否大于页面高度
        var contHeight = parseInt($(".tempList").height()),
            eleHeight = parseInt($('#templateList').height())+45;
        if(eleHeight>=contHeight){
            $('#templateList').on('touchmove',function(event){
                event.stopPropagation();
            });
        }
    }else{
        $("#templateListEmpty").show();
        $("#btnNewTempWrap").hide();
        $("#templateList").hide();
    }
}

// 模板列表加载
function loadTemplateStore(key){
    var str = '',
        json = JSON.parse(store.get(key));
    $.each(json.data,function(index,item){
        if(item.IsDefault == 1){
            str+='<div class="weui-cell"><div class="weui-cell__bd">'+item.tempTitle+'<span>默认</span></div><div class="weui-cell__opa"><a href="javascript:;" data-id="'+item.tid+'" class="doTempEdit" class="c-999999"><i class="iconfont icon-edit"></i> 编辑</a></div><div class="weui-cell__opa"><a href="javascript:;" class="doTempDel" data-id="'+item.tid+'" class="c-999999"><i class="iconfont icon-delete"></i> 删除</a></div></div>';
        }else{
            str+='<div class="weui-cell"><div class="weui-cell__bd">'+item.tempTitle+'</div><div class="weui-cell__opa"><a href="javascript:;" data-id="'+item.tid+'" class="doTempEdit" class="c-999999"><i class="iconfont icon-edit"></i> 编辑</a></div><div class="weui-cell__opa"><a href="javascript:;" class="doTempDel" data-id="'+item.tid+'" class="c-999999"><i class="iconfont icon-delete"></i> 删除</a></div></div>';
        }

    });
    $("#templateList").html(str);
}
$(function(){
    innerInit();
    var $templateList = $("#templateList"),
        $templateListEmpty = $("#templateListEmpty");
    //获取模板类型
    var $tempKey = store.get('chooseTemp') ? store.get('chooseTemp') : '';

    tempListInit($tempKey);

    $(".tempList").on('touchmove',function(event){
        event.preventDefault();
    });

    // 删除模板
    function delTemplateStore(key,id){
        var json = JSON.parse(store.get(key)),
            tindex = 0;
        $.each(json.data,function(index,item){
            if(item.tid == id){
                tindex = index;
            }
        });
        json.data.splice(tindex,1);
        store.remove(key);
        store.set(key,JSON.stringify(json));
        return true;
    }
    // 设置删除操作
    $(".tempList").on('click','.doTempDel',function(){
        var tid = $(this).data("id");
        weui.confirm('确定删除该模板？', function(){
            if(delTemplateStore($tempKey,tid)){
                tempListInit($tempKey);
                weui.toast('删除成功', 500);
            };
        });
    });
    // 设置编辑操作
    $(".tempList").on('click','.doTempEdit',function(){
        var id = $(this).data("id");
        store.set('editTemp',id);
        window.pageManager.go($tempKey);
    });

    // 设置新建操作
    $("#btnNewTemp,#btnNewTemp2").on('click',function(){
        store.remove('editTemp');
        if(store.get($tempKey)&&store.get($tempKey)!=''){
            var len = JSON.parse(store.get($tempKey)).data.length;
            if(len>=20){
                weui.alert('创建最多20个模板');
            }else{
                window.pageManager.go($tempKey);
            }
        }else{
            window.pageManager.go($tempKey);
        }
    });
});
$(window).on('hashchange', function(){
    var $tempKey = store.get('chooseTemp') ? store.get('chooseTemp') : '';
    if($tempKey && $tempKey!=''){
        tempListInit($tempKey);
    }
});