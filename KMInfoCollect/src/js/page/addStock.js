// 存量采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $storeKey = 'tempStock';

    // 设置信息员、时间、地址
    $(".getUserName").text(store.get('userName'));
    $(".getNow").text(nowTime);
    getPosition();
    setPosition($(".getLocation"));

    init();

    // 市场存量初始化
    function init(){
      store.remove('getTemp');
      store.remove('getSearch');
      store.remove('seatempStock');
      store.remove('market');
      store.remove('medicine');
      initSearch('.stockText-market','.stockVal-market','关键字/市场名称');
      initSearch('.stockText-medicine','.stockVal-medicine','关键字/中药材名称');
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {};
        $.each(JSON.parse(store.get($storeKey)).data,function(index,item){
            if(item.tid == tid) data = item;
        });
        changeSearch('.stockText-market','.stockVal-market',data.Market);
        changeSearch('.stockText-medicine','.stockVal-medicine',data.Medicine);
        $(".weui-textarea").val(data.Addition);
        clearSearch('.stockVal-market');
        clearSearch('.stockVal-medicine');
    }
    // 验证所需
    var regexp = {regexp: {}};
    weui.form.checkIfBlur('#form-stock', regexp);
    // 上传按钮
    $('#form-stock-submit').on('click',function () {
        weui.form.validate('#form-stock', function (error) {
            console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-stock").serializeArray();
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Address = Cookies.get('location') ? Cookies.get('location') : '暂无位置';
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var loading = weui.loading('上传中...');
                uploader(jsonData,'/saveInventoryJSONP',function(){
                    jsonData.hid = new Date().getTime();
                    jsonData.cUserName = store.get('userName');
                    //增加历史记录
                    if(store.get('histStock') && store.get('histStock')!=''){
                        // 更新
                        var histStock = JSON.parse(store.get('histStock'));
                        histStock.data.unshift(jsonData);
                        store.remove('histStock');
                        store.set('histStock',JSON.stringify(histStock));
                    }else{
                        // 新建
                        var historyData = {data : []};
                        historyData.data.unshift(jsonData);
                        store.set('histStock',JSON.stringify(historyData));
                    }
                    init();
                    document.formStock.reset();
                });
            }
        }, regexp);
    });
    
    // 存为模板按钮
    $('#open-temp-dialog').on('click',function () {
        // 判断用户是否选择模板
        var tempId = $(".getChooseTemp").data("tid");
        if(validateTemp('Market','Medicine')){
            if(tempId&&tempId!=''){
                // 存为模板更新操作
                var oldData = {
                    Market: $("input[name='Market']").val(),
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
    $("#form-stock").on('click','#save-for-temp',function () {
        if(validateTemp('tempName')){
            $(this).parents('.js_dialog').fadeOut(200);
            var jsonData = {
                IsDefault: '0',
                tempTitle: $("input[name='tempName']").val(),
                Market: $("input[name='Market']").val(),
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
                    // 更新若当前设为默认，clear为0
                    var temp = JSON.parse($temp);
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
            as = /#addStock$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&as.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempStock') ? store.get('seatempStock') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempStock');
                }
            }
        }else if(is.test(e.oldURL)&&as.test(e.newURL)){
            // 搜索结果返回响应
            var $market = store.get('market') ? store.get('market') : '';
            if($market!=''){
                if(!isEmpty(JSON.parse($market))){
                    changeSearch('.stockText-market','.stockVal-market',JSON.parse($market).name);
                    clearSearch('.stockVal-market');
                    store.remove('market');
                }
            }
            var $medicine = store.get('medicine') ? store.get('medicine') : '';
            if($medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.stockText-medicine','.stockVal-medicine',JSON.parse($medicine).name);
                    clearSearch('.stockVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });

});