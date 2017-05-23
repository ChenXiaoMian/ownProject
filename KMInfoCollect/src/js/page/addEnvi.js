// 环境采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $storeKey = 'tempEnvi';  //tempEnvi

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
      store.remove('seatempEnvi');
      store.remove('base');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      $("select[name='Weather'],select[name='Disaster'],select[name='Tendency']").find('option').removeAttr('selected');
      $("input[name='Range']").prop("disabled",true).val("");
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {};
        $.each(JSON.parse(store.get($storeKey)).data,function(index,item){
            if(item.tid == tid) data = item;
        });
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $("select[name='Weather']").find('option[value="'+data.Weather+'"]').attr('selected',true);
        $("select[name='Disaster']").find('option[value="'+data.Disaster+'"]').attr('selected',true);
        $("input[name='Policy']").val(data.Policy);
        $("select[name='Tendency']").find('option[value="'+data.Tendency+'"]').attr('selected',true);
        if(data.Range=='0' || data.Range=='持平'){
            $("input[name='Range']").prop("disabled",true).val("");
        }else{
            $("input[name='Range']").prop("disabled",false).val(data.Range);
        }
        $(".weui-textarea").val(data.Addition);
        clearSearch('.sVal-base');
    }
    weui.form.checkIfBlur('#form-envi', regexp);
    // 上传按钮
    $('#form-envi-submit').on('click',function () {
        weui.form.validate('#form-envi', function (error) {
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-envi").serializeArray();
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Address = Cookies.get('location') ? Cookies.get('location') : '暂无位置';
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var loading = weui.loading('上传中...');
                uploader(jsonData,'/saveGrowEnvironmentJSONP',function(){
                    jsonData.hid = new Date().getTime();
                    jsonData.cUserName = store.get('userName');
                    //增加历史记录
                    if(store.get('histEnvi') && store.get('histEnvi')!=''){
                        // 更新
                        var history = JSON.parse(store.get('histEnvi'));
                        history.data.unshift(jsonData);
                        store.remove('histEnvi');
                        store.set('histEnvi',JSON.stringify(history));
                    }else{
                        // 新建
                        var historyData = {
                            data : []
                        };
                        historyData.data.unshift(jsonData);
                        store.set('histEnvi',JSON.stringify(historyData));
                    }
                    init();
                    document.formEnvi.reset();
                });
            }
        }, regexp);
    });
    // 存为模板按钮
    $('#open-temp-dialog').on('click',function () {
        // 判断用户是否选择模板
        var tempId = $(".getChooseTemp").data("tid");
        if(validateTemp('BaseName')){
            if(tempId&&tempId!=''){
                // 存为模板更新操作
                var oldData = {
                    BaseName: $("input[name='BaseName']").val(),
                    Weather: $("select[name='Weather']").val(),
                    Disaster: $("select[name='Disaster']").val(),
                    Policy: $("input[name='Policy']").val(),
                    Tendency: $("select[name='Tendency']").val(),
                    Range: $("input[name='Range']").val() ? $("input[name='Range']").val() : 0,
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
    $("#form-envi").on('click','#save-for-temp',function () {
        if(validateTemp('tempName')){
            $(this).parents('.js_dialog').fadeOut(200);
            var jsonData = {
                IsDefault: '0',
                tempTitle: $("input[name='tempName']").val(),
                BaseName: $("input[name='BaseName']").val(),
                Weather: $("select[name='Weather']").val(),
                Disaster: $("select[name='Disaster']").val(),
                Policy: $("input[name='Policy']").val(),
                Tendency: $("select[name='Tendency']").val(),
                Range: $("input[name='Range']").val() ? $("input[name='Range']").val() : 0,
                Address: Cookies.get('location') ? Cookies.get('location') : '暂无位置',
                Addition: $.trim($("textarea[name='Addition']").val()),
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
            ae = /#addEnvi$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&ae.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempEnvi') ? store.get('seatempEnvi') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempEnvi');
                }
            }
        }else if(is.test(e.oldURL)&&ae.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
            if($base!=''){
                if(!isEmpty(JSON.parse($base))){
                    changeSearch('.sText-base','.sVal-base',JSON.parse($base).name);
                    clearSearch('.sVal-base');
                    store.remove('base');
                }
            }
        }
    });

    $("select[name='Tendency']").on('change',function(){
        var $val = $(this).val();
        if($val=='' || $val=='持平'){
            $("input[name='Range']").prop("disabled",true).val("");
        }else{
            $("input[name='Range']").prop("disabled",false);
        }
    });
});