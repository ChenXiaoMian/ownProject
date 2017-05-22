// 产品模板逻辑
$(function(){
    var nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $editId = store.get('editTemp') ? store.get('editTemp') : '',
        $addPanel = $(".addPanel"),
        $editPanel = $(".editPanel"),
        $editDom = '<div class="weui-cell tempName"><div class="weui-cell__hd km-line"><label class="weui-label">模板名称</label></div><div class="weui-cell__bd"><input class="weui-input" type="text" required name="tempTitle" placeholder="请输入模板名称" /></div></div>',
        $addDom = '<div class="js_dialog" style="display: none;"><div class="weui-mask"></div><div class="weui-dialog"><div class="weui-dialog__hd pt-15"><strong class="weui-dialog__title c-000000">提示</strong></div><div class="weui-dialog__bd"><input class="weui-input"required type="text" name="tempTitle" placeholder="填写模板名称"/></div><div class="weui-dialog__ft"><a href="javascript:;"class="weui-dialog__btn weui-dialog__btn_default">取消</a><a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary c-3dbaff" id="form-temp-submit">保存</a></div></div></div>',
        $getStandard = '';

    //获取模板类型
    var $tempKey = store.get('chooseTemp') ? store.get('chooseTemp') : '';

    // 初始化
    function init(){
      store.remove('manufacturer');
      store.remove('medicine');
      store.remove('base');
      initSearch('.sText-manufacturer','.sVal-manufacturer','关键字/生产商名称');
      initSearch('.sText-medicine','.sVal-medicine','关键字/中药材名称');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
    }

    templateInit();

    // 初始化模板
    function templateInit(){
        init();
        if($editId && $editId!=''){
            // 编辑模板
            $addPanel.hide();
            $editPanel.show();
            $(".firstTemp").prepend($editDom);
            getTemplateStore($tempKey,$editId);
        }else{
            // 新建模板
            $editPanel.hide();
            $addPanel.show();
            $("#form-pro-temp").append($addDom);

        }
    }

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var tp = /#tempPro$/,
            is = /#itemSearch$/;

        if(is.test(e.oldURL)&&tp.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
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
    // 编辑模板获取数据
    function getTemplateStore(key,id){
        var json = JSON.parse(store.get(key)),
            data = {},
            $MedicineStandard = $("select[name='MedicineStandard']");
        $.each(json.data,function(index,item){
            if(item.tid == id) data = item;
        });
        console.log(json.data);
        getMedicineStandard(data.MedicineName);
        $("select[name='Product'],select[name='MedicineStandard']").find('option').removeAttr('selected');
        $("select[name='Product']").find('option[value="'+data.Product+'"]').prop('selected',true);
        $("input[name='ProductName']").val(data.ProductName);
        $("input[name='Standard']").val(data.Standard);
        changeSearch('.sText-manufacturer','.sVal-manufacturer',data.ManufacturerName);
        changeSearch('.sText-medicine','.sVal-medicine',data.MedicineName);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $("input[name='tempTitle']").val(data.tempTitle);
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
        $("textarea[name='Addition']").val(data.Addition);
        if(data.IsDefault == 1) $("input[name='IsDefault']").prop("checked","checked").val('1');
    }

    var regexp = {
        regexp: {
            IDNUM: /(?:^\d{15}$)|(?:^\d{18}$)|^\d{17}[\dXx]$/,
            VCODE: /^.{4}$/
        }
    };
    weui.form.checkIfBlur('#form-pro-temp', regexp);

    $('.js_dialog').on('click', '.weui-dialog__btn_default', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    $(".btnShowDialog").on('click',function(){
        $(this).parents("form").find(".js_dialog").fadeIn(200);
    });

    $("input[name='IsDefault']").on('change',function(){
        var isCheck = $(this).is(':checked') ? 1 : 0;
        $(this).val(isCheck);
    });

    // 保存按钮
    $("#form-pro-temp").on('click','#form-temp-edit',function () {
        weui.form.validate('#form-pro-temp', function (error){
            console.log(error);
            if (!error) {
                // 组织数据,$editId
                var jsonData = {},
                    formData = $("#form-pro-temp").serializeArray(),
                    json = JSON.parse(store.get($tempKey)),
                    eindex = 0;
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                $.each(json.data,function(index,item){
                    if(jsonData.IsDefault == 1)  item.IsDefault = '0';
                    if(item.tid == $editId)  eindex = index;
                });
                jsonData.tid = $editId;
                json.data.splice(eindex,1,jsonData);

                var loading = weui.loading('保存中...');
                store.remove('tempPro');
                store.set('tempPro',JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);

            }
        }, regexp);
    });
    // 新建按钮
    $("#form-pro-temp").on('click','#form-temp-submit',function () {
        weui.form.validate('#form-pro-temp', function (error){
            console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-pro-temp").serializeArray();
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                jsonData.tid = new Date().getTime();
                console.log(jsonData);
                var loading = weui.loading('保存中...');
                var $temp = store.get('tempPro') ? store.get('tempPro') : '';
                //增加历史记录
                if($temp!='' && !isEmpty(JSON.parse($temp).data)){
                    // 更新
                    var temp = JSON.parse($temp);
                    // 若当前设为默认，clear为0
                    if(jsonData.IsDefault == 1){
                        $.each(tempStock.data,function(index,item){
                            item.IsDefault = '0';
                        });
                    }
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
                init();
                $('.js_dialog').fadeOut(200);
                document.formProTemp.reset();
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);
            }
        }, regexp);
    });
    $(".btnShowDialog").on('click',function(){
      $("#form-pro-temp").find("input[name='tempTitle']").focus();
    });
});