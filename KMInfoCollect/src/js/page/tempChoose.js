// 选择模板逻辑
$(function(){
    var $tempKey = store.get('getTemp') ? store.get('getTemp') : '';
    var $tempRadio = $("#tempRadio"),
        $tempRadioEmpty = $("#tempRadioEmpty");

    $(".tempChoose").on('touchmove',function(event){
        event.preventDefault();
    });

    loadTempInit($tempKey);
    
    var contHeight = parseInt($(".tempChoose").height()),
        eleHeight = parseInt($('#tempRadio').height())+45;
    if(eleHeight>=contHeight){
        $('#tempRadio').on('touchmove',function(event){
            event.stopPropagation();
        });
    }

    function loadTempInit(key){
        if(store.get(key) && !isEmpty(JSON.parse(store.get(key)).data)){
            loadTempList(key);
            $tempRadio.show();
            $tempRadioEmpty.hide();
        }else{
            $tempRadio.hide();
            $tempRadioEmpty.show();
        }
    }

    function loadTempList(key){
        var str = '',
            json = JSON.parse(store.get(key));
        $.each(json.data,function(index,item){
            if(item.IsDefault==1){
            str+='<label class="weui-cell weui-check__label cTitem" for="x'+index+'" data-id="'+item.tid+'" data-name="'+item.tempTitle+'"><div class="weui-cell__bd"><p>'+item.tempTitle+'</p></div><div class="weui-cell__ft"><input type="radio" class="weui-check" name="chooseTemp" id="x'+index+'" checked="checked"/><span class="weui-icon-checked c-3dbaff"></span></div></label>';
            }else{
            str+='<label class="weui-cell weui-check__label cTitem" for="x'+index+'"data-id="'+item.tid+'" data-name="'+item.tempTitle+'"><div class="weui-cell__bd"><p>'+item.tempTitle+'</p></div><div class="weui-cell__ft"><input type="radio" class="weui-check" name="chooseTemp" id="x'+index+'"/><span class="weui-icon-checked c-3dbaff"></span></div></label>';
            }

        });
        $tempRadio.html(str);
    }

    $tempRadio.on('click','.cTitem',function(e){
        stopBubble(e);e.preventDefault();// 阻止冒泡
        var data = {
            id: $(this).data("id"),
            name: $(this).data("name"),
        }
        store.remove('sea'+$tempKey);
        store.set('sea'+$tempKey,JSON.stringify(data));
        setTimeout(function(){
            window.pageManager.back();
        },100);
    });
});