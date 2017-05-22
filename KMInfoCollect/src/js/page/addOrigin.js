// 产地采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $storeKey = 'tempOrigin';

    // 设置信息员、时间、地址
    $(".getUserName").text(store.get('userName'));
    $(".getNow").text(nowTime);
    getPosition();
    setPosition($(".getLocation"));

    init();

    // 初始化
    function init(){
      store.remove('getTemp');
      store.remove('getSearch');
      store.remove('seatempOrigin');
      store.remove('base');
      store.remove('grower');
      store.remove('medicine');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      initSearch('.sText-grower','.sVal-grower','关键字/种植户');
      initSearch('.sText-medicine','.sVal-medicine','关键字/药材名称');
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {};
        $.each(JSON.parse(store.get($storeKey)).data,function(index,item){
            if(item.tid == tid) data = item;
        });
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        changeSearch('.sText-grower','.sVal-grower',data.GrowerName);
        changeSearch('.sText-medicine','.sVal-medicine',data.Medicine);
        $(".weui-textarea").val(data.Addition);
        clearSearch('.sVal-base');
        clearSearch('.sVal-grower');
        clearSearch('.sVal-medicine');
    }
    weui.form.checkIfBlur('#form-origin', regexp);
    // 上传按钮
    $('#form-origin-submit').on('click',function () {
        weui.form.validate('#form-origin', function (error) {
            console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-origin").serializeArray();
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Address = Cookies.get('location') ? Cookies.get('location') : '暂无位置';
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var loading = weui.loading('上传中...');
                uploader(jsonData,'/saveGrowBaseJSONP',function(){
                    jsonData.hid = new Date().getTime();
                    jsonData.cUserName = store.get('userName');
                    //增加历史记录
                    if(store.get('histOrigin') && store.get('histOrigin')!=''){
                        // 更新
                        var history = JSON.parse(store.get('histOrigin'));
                        history.data.unshift(jsonData);
                        store.remove('histOrigin');
                        store.set('histOrigin',JSON.stringify(history));
                    }else{
                        // 新建
                        var historyData = {
                            data : []
                        };
                        historyData.data.unshift(jsonData);
                        store.set('histOrigin',JSON.stringify(historyData));
                    }
                    init();
                    document.formOrigin.reset();
                });
            }
        }, regexp);
    });
    // 存为模板按钮
    $('#open-temp-dialog').on('click',function () {
        // 判断用户是否选择模板
        var tempId = $(".getChooseTemp").data("tid");
        if(validateTemp('BaseName','GrowerName','Medicine')){
            if(tempId&&tempId!=''){
                // 存为模板更新操作
                var oldData = {
                    BaseName: $("input[name='BaseName']").val(),
                    GrowerName: $("input[name='GrowerName']").val(),
                    Medicine: $("input[name='Medicine']").val(),
                    Addition: $.trim($("textarea[name='Addition']").val()),
                };
                var json = JSON.parse(store.get($storeKey)),
                    eindex = 0,
                    jsonData = {};
                $.each(json.data,function(index,item){
                    if(item.tid == tempId){
                        eindex = index;
                        jsonData = item;
                    }
                });
                $.extend(jsonData, oldData);
                json.data.splice(eindex,1,jsonData);
                var loading = weui.loading('保存中...');
                store.remove($storeKey);
                store.set($storeKey,JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
            }else{
                $iosDialog.fadeIn(200);
            }
        }
    });
    // 取消关闭弹出框
    $('.js_dialog').on('click', '.weui-dialog__btn_default', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    // 存为模板新建操作
    $("#form-origin").on('click','#save-for-temp',function () {
        if(validateTemp('tempName')){
            $(this).parents('.js_dialog').fadeOut(200);
            var jsonData = {
                IsDefault: '0',
                tempTitle: $("input[name='tempName']").val(),
                BaseName: $("input[name='BaseName']").val(),
                GrowerName: $("input[name='GrowerName']").val(),
                Medicine: $("input[name='Medicine']").val(),
                Addition: $.trim($("textarea[name='Addition']").val()),
                Address: Cookies.get('location') ? Cookies.get('location') : '暂无位置',
                Time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                tid: new Date().getTime()
            };
            var $temp = store.get($storeKey) ? store.get($storeKey) : '';
            if($temp && $temp!=''){
                var len = JSON.parse($temp).data.length;
                if(len>=$tempNum){
                    weui.alert('创建最多'+$tempNum+'个模板');
                    return false;
                }
            }
                var loading = weui.loading('保存中...');
                //增加模板
                if($temp!='' && !isEmpty(JSON.parse($temp).data)){
                    // 更新
                    var temp = JSON.parse($temp);
                    // 若当前设为默认，clear为0
                    temp.data.unshift(jsonData);
                    store.remove($storeKey);
                    store.set($storeKey,JSON.stringify(temp));
                }else{
                    // 新建
                    var historyData = {data : []};
                    historyData.data.unshift(jsonData);
                    store.set($storeKey,JSON.stringify(historyData));
                }
                loading.hide();
                weui.toast('模板保存成功', 500);

        }

    });

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var tc = /#tempChoose$/,
            ao = /#addOrigin$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&ao.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempOrigin') ? store.get('seatempOrigin') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempOrigin');
                }
            }
        }else if(is.test(e.oldURL)&&ao.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
            if($base!=''){
                if(!isEmpty(JSON.parse($base))){
                    changeSearch('.sText-base','.sVal-base',JSON.parse($base).name);
                    clearSearch('.sVal-base');
                    store.remove('base');
                }
            }
            var $grower = store.get('grower') ? store.get('grower') : '';
            if($grower!=''){
                if(!isEmpty(JSON.parse($grower))){
                    changeSearch('.sText-grower','.sVal-grower',JSON.parse($grower).name);
                    clearSearch('.sVal-grower');
                    store.remove('grower');
                }
            }
            var $medicine = store.get('medicine') ? store.get('medicine') : '';
            if($medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.sText-medicine','.sVal-medicine',JSON.parse($medicine).name);
                    clearSearch('.sVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });
});