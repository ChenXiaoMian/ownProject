// 贸易采集逻辑
$(function(){
    var userName = store.get('userName'),
        nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $iosDialog = $('.js_dialog'),
        $getStandard = '';
    $(".getUserName").text(store.get('userName'));
    $(".getNow").text(nowTime);

    init();
    // 初始化
    function init(){
      store.remove('seatempTrading');
      store.remove('market');
      store.remove('medicine');
      store.remove('base');
      initSearch('.sText-market','.sVal-market','关键字/市场名称');
      initSearch('.sText-medicine','.sVal-medicine','关键字/中药材名称');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      $("select[name='Scale'],select[name='MedicineType']").find('option').removeAttr('selected');
      $("select[name='MedicineStandard']").empty();
      $(".getChooseTemp").text('默认模板').removeClass('c-3dbaff').addClass('c-c7c7c7');
    }

    // 根据药材名称获取药材规格
    function getMedicineStandard(str){
      var jsonData = {};
          jsonData.userName = store.get('loginName');
          jsonData.password = store.get('password');
          jsonData.medicine = str;
        $.ajax({
            url: $kmurl+'/likeMedicine',
            type:"GET",
            contentType: 'application/json;charset=utf-8',
            dataType:"jsonp",
            jsonp:"jsoncallback",
            data:{"parms":JSON.stringify(jsonData)},
            success:function(response){
                if(response.result == 'success' && !isEmpty(JSON.parse(response.message))){
                    var data = JSON.parse(response.message);
                    $getStandard = data[0].standard;
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log("输入参数错误，请核对！");
            }
        });
    }

    // 选择模板后加载对应数据
    function loadTemp(tid){
        var data = {},
            $MedicineStandard = $("select[name='MedicineStandard']");
        $.each(JSON.parse(store.get('tempPro')).data,function(index,item){
            if(item.tid == tid) data = item;
        });
        getMedicineStandard(data.MedicineName);
        $("select[name='Product'],select[name='MedicineStandard']").find('option').removeAttr('selected');
        $("select[name='Product']").find('option[value="'+data.Product+'"]').prop('selected',true);
        $("input[name='ProductName']").val(data.ProductName);
        $("input[name='Standard']").val(data.Standard);
        changeSearch('.sText-manufacturer','.sVal-manufacturer',data.ManufacturerName);
        changeSearch('.sText-medicine','.sVal-medicine',data.MedicineName);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $("input[name='Ratio']").val(data.Ratio);
        setTimeout(function(){
            var arr = [],
                strs = '';
            arr = $getStandard.split(",");
            if(arr.length>0){
                $MedicineStandard.empty();
                $.each(arr,function(index,item){
                    strs+='<option value="'+item+'">'+item+'</option>';
                });
                $MedicineStandard.html(strs).find('option[value="'+data.MedicineStandard+'"]').attr('selected',true);
            }else{
                $MedicineStandard.empty();
            }
        },1000);
        $("input[name='Supplier']").val(data.Supplier);
        $("input[name='QualityRequire']").val(data.QualityRequire);
        $(".weui-textarea").val(data.Addition);
        clearSearch('.sVal-manufacturer');
        clearSearch('.sVal-medicine');
        clearSearch('.sVal-base');
    }
    // 验证所需
    var regexp = {
        regexp: {
            IDNUM: /(?:^\d{15}$)|(?:^\d{18}$)|^\d{17}[\dXx]$/,
            VCODE: /^.{4}$/
        }
    };
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
    function validateTemp(){
        var args = arguments,
            cache = [];
        $.each(args,function(index,item){
            var dom = $("input[name='"+item+"']");
            if($.trim(dom.val())==''){
                weui.topTips(dom.attr("emptyTips"));
                return false;
            }else{
                cache.push(item);
            }
        });
        if(cache.length === args.length){
            return true;
        }else{
            return false;
        }

    }
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
                    Supplier: $("input[name='Supplier']").val(),
                    QualityRequire: $("input[name='QualityRequire']").val(),
                    Addition: $.trim($("textarea[name='Addition']").val()),
                };
                var json = JSON.parse(store.get('tempPro')),
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
                store.remove('tempPro');
                store.set('tempPro',JSON.stringify(json));
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
                Supplier: $("input[name='Supplier']").val(),
                QualityRequire: $("input[name='QualityRequire']").val(),
                Addition: $.trim($("textarea[name='Addition']").val()),
                Time: new Date().Format("yyyy-MM-dd hh:mm:ss"),
                tid: new Date().getTime()
            };
            var loading = weui.loading('保存中...');
            var $temp = store.get('tempPro') ? store.get('tempPro') : '';
            //增加历史记录
            if($temp!='' && !isEmpty(JSON.parse($temp).data)){
                // 更新
                var temp = JSON.parse($temp);
                // 若当前设为默认，clear为0
                temp.data.unshift(jsonData);
                store.remove('tempPro');
                store.set('tempPro',JSON.stringify(temp));
            }else{
                // 新建
                var historyData = {
                    data : []
                };
                historyData.data.unshift(jsonData);
                store.set('tempPro',JSON.stringify(historyData));
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
            if($medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.sText-medicine','.sVal-medicine',JSON.parse($medicine).name);
                    // 获取药材规格
                    var standard = JSON.parse($medicine).standard,
                        arr = [],
                        strs = '';
                    arr = standard.split(",");
                    if(arr.length>0){
                        $MedicineStandard.empty();
                        $.each(arr,function(index,item){
                            strs+='<option value="'+item+'">'+item+'</option>';
                        });
                        $MedicineStandard.html(strs);
                    }else{
                        $MedicineStandard.empty();
                    }
                    clearSearch('.sVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });

});
