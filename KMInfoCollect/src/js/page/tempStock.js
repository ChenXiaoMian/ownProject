// 存量模板逻辑
$(function(){
    var nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $editId = store.get('editTemp') ? store.get('editTemp') : '',
        $addPanel = $(".addPanel"),
        $editPanel = $(".editPanel"),
        $editDom = '<div class="weui-cell tempName"><div class="weui-cell__hd km-line"><label class="weui-label">模板名称</label></div><div class="weui-cell__bd"><input class="weui-input" type="text" required name="tempTitle" placeholder="请输入模板名称" /></div></div>',
        $addDom = '<div class="js_dialog" style="display: none;"><div class="weui-mask"></div><div class="weui-dialog"><div class="weui-dialog__hd pt-15"><strong class="weui-dialog__title c-000000">提示</strong></div><div class="weui-dialog__bd"><input class="weui-input"required type="text" name="tempTitle" placeholder="填写模板名称"/></div><div class="weui-dialog__ft"><a href="javascript:;"class="weui-dialog__btn weui-dialog__btn_default">取消</a><a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary c-3dbaff" id="form-stock-temp-submit">保存</a></div></div></div>';

    //获取模板类型
    var $tempKey = store.get('chooseTemp') ? store.get('chooseTemp') : '';

    // 初始化
    function stockAddInit(){
      store.remove('market');
      store.remove('medicine');
      initSearch('.stockText-market','.stockVal-market','关键字/市场名称');
      initSearch('.stockText-medicine','.stockVal-medicine','关键字/中药材名称');
    }

    templateInit();

    // 初始化模板
    function templateInit(){
        stockAddInit();
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
            $("#form-stock-temp").append($addDom);

        }
    }

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var ts = /#tempStock$/,
            is = /#itemSearch$/;

        if(is.test(e.oldURL)&&ts.test(e.newURL)){
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

    // 编辑模板获取数据
    function getTemplateStore(key,id){
        var json = JSON.parse(store.get(key)),
            data = {};
        $.each(json.data,function(index,item){
            if(item.tid == id) data = item;
        });
        //console.log(json.data);
        changeSearch('.stockText-market','.stockVal-market',data.Market);
        changeSearch('.stockText-medicine','.stockVal-medicine',data.Medicine);
        $("#form-stock-temp").find("input[name='tempTitle']").val(data.tempTitle);
        $("#form-stock-temp").find("textarea[name='Addition']").val(data.Addition);
        if(data.IsDefault == 1) $("#form-stock-temp").find("input[name='IsDefault']").prop("checked","checked").val('1');
    }

    weui.form.checkIfBlur('#form-stock-temp', regexp);

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
    $("#form-stock-temp").on('click','#form-stock-temp-edit',function () {
        weui.form.validate('#form-stock-temp', function (error){
            //console.log(error);
            if (!error) {
                // 组织数据,$editId
                var jsonData = {},
                    formData = $("#form-stock-temp").serializeArray(),
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
                store.remove('tempStock');
                store.set('tempStock',JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);

            }
        }, regexp);
    });
    // 新建按钮
    $("#form-stock-temp").on('click','#form-stock-temp-submit',function () {
        weui.form.validate('#form-stock-temp', function (error){
            //console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-stock-temp").serializeArray();
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                jsonData.tid = new Date().getTime();
                //console.log(jsonData);
                var loading = weui.loading('保存中...');
                //增加历史记录
                if(store.get('tempStock') && store.get('tempStock')!=''){
                    // 更新
                    var tempStock = JSON.parse(store.get('tempStock'));
                    // 若当前设为默认，clear为0
                    if(jsonData.IsDefault == 1){
                        $.each(tempStock.data,function(index,item){
                            item.IsDefault = '0';
                        });
                    }
                    tempStock.data.unshift(jsonData);
                    store.remove('tempStock');
                    store.set('tempStock',JSON.stringify(tempStock));
                }else{
                    // 新建
                    var historyData = {
                        data : []
                    };
                    historyData.data.unshift(jsonData);
                    store.set('tempStock',JSON.stringify(historyData));
                }
                store.remove('market');
                store.remove('medicine');
                initSearch('.stockText-market','.stockVal-market','关键字/市场名称');
                initSearch('.stockText-medicine','.stockVal-medicine','关键字/中药材名称');
                $('.js_dialog').fadeOut(200);
                document.formStockTemp.reset();
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);
            }
        }, regexp);
    });
    $(".btnShowDialog").on('click',function(){
      $("#form-stock-temp").find("input[name='tempTitle']").focus();
    });
});