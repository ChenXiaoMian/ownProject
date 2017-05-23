// 产出采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $storeKey = 'tempOutput';

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
      store.remove('seatempOutput');
      store.remove('base');
      store.remove('grower');
      store.remove('medicine');
      store.remove('cmedicine');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      initSearch('.sText-grower','.sVal-grower','关键字/种植户');
      initSearch('.sText-medicine','.sVal-medicine','关键字/中药材名称');
      initSearch('.sText-cmedicine','.sVal-cmedicine','关键字/中药材名称');
      $("select[name='ProdcutionTendency'],select[name='PriceTendency']").find('option').removeAttr('selected');
      $("input[name='ProductionRange']").prop("disabled",true).val("");
      $("input[name='PriceRange']").prop("disabled",true).val("");
      $(".sClick-cmedicine").attr("href","javascript:;");
      $(".sText-cmedicine").addClass('bg-efefef');
      $("input[name='ChangeArea']").prop("disabled",true).val("");
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
    weui.form.checkIfBlur('#form-output', regexp);
    // 上传按钮
    $('#form-output-submit').on('click',function () {
        weui.form.validate('#form-output', function (error) {
            //console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-output").serializeArray();
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Address = Cookies.get('location') ? Cookies.get('location') : '暂无位置';
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var loading = weui.loading('上传中...');
                uploader(jsonData,'/saveGrowOutputJSONP',function(){
                    jsonData.hid = new Date().getTime();
                    jsonData.cUserName = store.get('userName');
                    //增加历史记录
                    if(store.get('histOutput') && store.get('histOutput')!=''){
                        // 更新
                        var history = JSON.parse(store.get('histOutput'));
                        history.data.unshift(jsonData);
                        store.remove('histOutput');
                        store.set('histOutput',JSON.stringify(history));
                    }else{
                        // 新建
                        var historyData = {
                            data : []
                        };
                        historyData.data.unshift(jsonData);
                        store.set('histOutput',JSON.stringify(historyData));
                    }
                    //console.log(jsonData);
                    init();
                    document.formOutput.reset();
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
    $("#form-output").on('click','#save-for-temp',function () {
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
            ao = /#addOutput$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&ao.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempOutput') ? store.get('seatempOutput') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempOutput');
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
            var $cmedicine = store.get('cmedicine') ? store.get('cmedicine') : '';
            if($cmedicine!=''){
                if(!isEmpty(JSON.parse($cmedicine))){
                    changeSearch('.sText-cmedicine','.sVal-cmedicine',JSON.parse($cmedicine).name);
                    clearSearch('.sVal-cmedicine');
                    store.remove('cmedicine');
                }
            }
        }
    });

    $("select[name='ProdcutionTendency']").on('change',function(){
        var $val = $(this).val();
        if($val=='' || $val=='持平'){
            $("input[name='ProductionRange']").prop("disabled",true).val("");
        }else{
            $("input[name='ProductionRange']").prop("disabled",false);
        }
    });
    $("select[name='PriceTendency']").on('change',function(){
        var $val = $(this).val();
        if($val=='' || $val=='持平'){
            $("input[name='PriceRange']").prop("disabled",true).val("");
        }else{
            $("input[name='PriceRange']").prop("disabled",false);
        }
    });
    $("input[name='ChangeMode']").on('change',function(){
        var $val = $(this).val();
        if($val=='是'){
            $("#sClick-cmedicine").removeClass('disabled');
            $(".sText-cmedicine").removeClass('bg-efefef');
            $("input[name='ChangeArea']").prop("disabled",false);
        }else{
            $("#sClick-cmedicine").addClass("disabled");
            $(".sText-cmedicine").addClass('bg-efefef');
            initSearch('.sText-cmedicine','.sVal-cmedicine','关键字/中药材名称');
            $("input[name='ChangeArea']").prop("disabled",true).val("");
            $("input[name='ChangeArea']").parents(".weui-cell").removeClass('weui-cell_warn');
        }
    });
});