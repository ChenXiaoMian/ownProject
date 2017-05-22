// 产品采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $getStandard = '',
        $storeKey = 'tempPro';  //tempPro

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
      store.remove('seatempPro');
      store.remove('manufacturer');
      store.remove('medicine');
      store.remove('base');
      initSearch('.sText-manufacturer','.sVal-manufacturer','关键字/生产商名称');
      initSearch('.sText-medicine','.sVal-medicine','关键字/中药材名称');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      $("select[name='Product'],select[name='MedicineStandard']").find('option').removeAttr('selected');
      $("select[name='MedicineStandard']").empty();
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {},
            $MedicineStandard = $("select[name='MedicineStandard']");
        $.each(JSON.parse(store.get($storeKey)).data,function(index,item){
            if(item.tid == tid) data = item;
        });
        $("select[name='Product'],select[name='MedicineStandard']").find('option').removeAttr('selected');
        $("select[name='Product']").find('option[value="'+data.Product+'"]').prop('selected',true);
        $("input[name='ProductName']").val(data.ProductName);
        $("input[name='Standard']").val(data.Standard);
        changeSearch('.sText-manufacturer','.sVal-manufacturer',data.ManufacturerName);
        changeSearch('.sText-medicine','.sVal-medicine',data.MedicineName);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $("input[name='Ratio']").val(data.Ratio);
        if(data.hasOwnProperty('StandardStr')&&data.StandardStr!=''){
            loadMedicineStandard($MedicineStandard,data.StandardStr);
            $MedicineStandard.find('option[value="'+data.MedicineStandard+'"]').attr('selected',true);
        }
        $("input[name='Supplier']").val(data.Supplier);
        $("input[name='QualityRequire']").val(data.QualityRequire);
        $(".weui-textarea").val(data.Addition);
        clearSearch('.sVal-manufacturer');
        clearSearch('.sVal-medicine');
        clearSearch('.sVal-base');
    }
    weui.form.checkIfBlur('#form-pro', regexp);
    // 定义对应链接
    var getUrl = function(val){
        var url = '';
        switch(val){
            case '成药':
                return url = '/saveManufactureMedicineJSONP';
                break;
            case '食品':
                return url = '/saveManufactureFoodJSONP';
                break;
            case '保健品':
                return url = '/saveManufactureHealthProductsJSONP';
                break;
        }
    }
    // 上传按钮
    $('#form-pro-submit').on('click',function () {
        weui.form.validate('#form-pro', function (error) {
            console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-pro").serializeArray();
                jsonData.UserName = store.get('loginName');
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Address = Cookies.get('location') ? Cookies.get('location') : '暂无位置';
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                var loading = weui.loading('上传中...');
                uploader(jsonData,getUrl(jsonData.Product),function(){
                    jsonData.hid = new Date().getTime();
                    jsonData.cUserName = store.get('userName');
                    //增加历史记录
                    if(store.get('histPro') && store.get('histPro')!=''){
                        // 更新
                        var history = JSON.parse(store.get('histPro'));
                        history.data.unshift(jsonData);
                        store.remove('histPro');
                        store.set('histPro',JSON.stringify(history));
                    }else{
                        // 新建
                        var historyData = {
                            data : []
                        };
                        historyData.data.unshift(jsonData);
                        store.set('histPro',JSON.stringify(historyData));
                    }
                    console.log(jsonData);
                    init();
                    document.formPro.reset();
                });
            }
        }, regexp);
    });
    // 存为模板按钮
    $('#open-temp-dialog').on('click',function () {
        // 判断用户是否选择模板
        var tempId = $(".getChooseTemp").data("tid");
        if(validateTemp('ManufacturerName','MedicineName','BaseName')){
            if(tempId&&tempId!=''){
                // 存为模板更新操作
                var oldData = {
                    Product: $("select[name='Product']").val(),
                    ProductName: $("input[name='ProductName']").val(),
                    Standard: $("input[name='Standard']").val(),
                    ManufacturerName: $("input[name='ManufacturerName']").val(),
                    MedicineName: $("input[name='MedicineName']").val(),
                    BaseName: $("input[name='BaseName']").val(),
                    Ratio: $("input[name='Ratio']").val(),
                    MedicineStandard: $("select[name='MedicineStandard']").val(),
                    StandardStr: store.get('StandardStr') ? store.get('StandardStr') : '',
                    Supplier: $("input[name='Supplier']").val(),
                    QualityRequire: $("input[name='QualityRequire']").val(),
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
    $("#form-pro").on('click','#save-for-temp',function () {
        if(validateTemp('tempName')){
            $(this).parents('.js_dialog').fadeOut(200);
            var jsonData = {
                IsDefault: '0',
                tempTitle: $("input[name='tempName']").val(),
                Product: $("select[name='Product']").val(),
                ProductName: $("input[name='ProductName']").val(),
                Standard: $("input[name='Standard']").val(),
                ManufacturerName: $("input[name='ManufacturerName']").val(),
                MedicineName: $("input[name='MedicineName']").val(),
                BaseName: $("input[name='BaseName']").val(),
                Ratio: $("input[name='Ratio']").val(),
                MedicineStandard: $("select[name='MedicineStandard']").val(),
                StandardStr: store.get('StandardStr') ? store.get('StandardStr') : '',
                Supplier: $("input[name='Supplier']").val(),
                QualityRequire: $("input[name='QualityRequire']").val(),
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
            ap = /#addPro$/,
            is = /#itemSearch$/;

        if(tc.test(e.oldURL)&&ap.test(e.newURL)){
            // 选择模板返回响应
            var $key = store.get('seatempPro') ? store.get('seatempPro') : '';
            if($key!=''){
                if(!isEmpty(JSON.parse($key))){
                    $(".getChooseTemp").text(JSON.parse($key).name).data("tid",JSON.parse($key).id).removeClass('c-c7c7c7').addClass('c-3dbaff');
                    loadTemp(JSON.parse($key).id);
                    store.remove('seatempPro');
                }
            }
        }else if(is.test(e.oldURL)&&ap.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
            if($base!=''){
                if(!isEmpty(JSON.parse($base))){
                    changeSearch('.sText-base','.sVal-base',JSON.parse($base).name);
                    clearSearch('.sVal-base');
                    store.remove('base');
                }
            }
            var $manufacturer = store.get('manufacturer') ? store.get('manufacturer') : '';
            if($manufacturer!=''){
                if(!isEmpty(JSON.parse($manufacturer))){
                    changeSearch('.sText-manufacturer','.sVal-manufacturer',JSON.parse($manufacturer).name);
                    clearSearch('.sVal-manufacturer');
                    store.remove('manufacturer');
                }
            }
            var $medicine = store.get('medicine') ? store.get('medicine') : '';
            var $MedicineStandard = $("select[name='MedicineStandard']");
            if($medicine&&$medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.sText-medicine','.sVal-medicine',JSON.parse($medicine).name);
                    store.set('StandardStr',JSON.parse($medicine).standard);  //设置药品规格
                    loadMedicineStandard($MedicineStandard,JSON.parse($medicine).standard); //加载药品规格
                    clearSearch('.sVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });

});