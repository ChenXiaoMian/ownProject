// 产地模板逻辑
$(function(){
    var nowTime = new Date().Format("yyyy-MM-dd hh:mm:ss"),
        $editId = store.get('editTemp') ? store.get('editTemp') : '',
        $addPanel = $(".addPanel"),
        $editPanel = $(".editPanel"),
        $editDom = '<div class="weui-cell tempName"><div class="weui-cell__hd km-line"><label class="weui-label">模板名称</label></div><div class="weui-cell__bd"><input class="weui-input" type="text" required name="tempTitle" placeholder="请输入模板名称" /></div></div>',
        $addDom = '<div class="js_dialog" style="display: none;"><div class="weui-mask"></div><div class="weui-dialog"><div class="weui-dialog__hd pt-15"><strong class="weui-dialog__title c-000000">提示</strong></div><div class="weui-dialog__bd"><input class="weui-input"required type="text" name="tempTitle" placeholder="填写模板名称"/></div><div class="weui-dialog__ft"><a href="javascript:;"class="weui-dialog__btn weui-dialog__btn_default">取消</a><a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary c-3dbaff" id="form-temp-submit">保存</a></div></div></div>';

    //获取模板类型
    var $tempKey = store.get('chooseTemp') ? store.get('chooseTemp') : '';

    // 初始化
    function init(){
      store.remove('base');
      store.remove('grower');
      store.remove('medicine');
      initSearch('.sText-base','.sVal-base','关键字/产地名称');
      initSearch('.sText-grower','.sVal-grower','关键字/种植户');
      initSearch('.sText-medicine','.sVal-medicine','关键字/药材名称');
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
            $("#form-origin-temp").append($addDom);

        }
    }

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var to = /#tempOrigin$/,
            is = /#itemSearch$/;

        if(is.test(e.oldURL)&&to.test(e.newURL)){
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

    // 编辑模板获取数据
    function getTemplateStore(key,id){
        var json = JSON.parse(store.get(key)),
            data = {};
        $.each(json.data,function(index,item){
            if(item.tid == id) data = item;
        });
        console.log(json.data);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        changeSearch('.sText-grower','.sVal-grower',data.GrowerName);
        changeSearch('.sText-medicine','.sVal-medicine',data.Medicine);
        $("input[name='tempTitle']").val(data.tempTitle);
        $("textarea[name='Addition']").val(data.Addition);
        if(data.IsDefault == 1) $("input[name='IsDefault']").prop("checked","checked").val('1');
    }

    var regexp = {
        regexp: {
            IDNUM: /(?:^\d{15}$)|(?:^\d{18}$)|^\d{17}[\dXx]$/,
            VCODE: /^.{4}$/
        }
    };
    weui.form.checkIfBlur('#form-origin-temp', regexp);

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
    $("#form-origin-temp").on('click','#form-temp-edit',function () {
        weui.form.validate('#form-origin-temp', function (error){
            console.log(error);
            if (!error) {
                // 组织数据,$editId
                var jsonData = {},
                    formData = $("#form-origin-temp").serializeArray(),
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
                store.remove('tempOrigin');
                store.set('tempOrigin',JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);

            }
        }, regexp);
    });
    // 新建按钮
    $("#form-origin-temp").on('click','#form-temp-submit',function () {
        weui.form.validate('#form-origin-temp', function (error){
            console.log(error);
            if (!error) {
                // 组织数据
                var jsonData = {},formData = $("#form-origin-temp").serializeArray();
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                jsonData.tid = new Date().getTime();
                console.log(jsonData);
                var loading = weui.loading('保存中...');
                var $temp = store.get('tempOrigin') ? store.get('tempOrigin') : '';
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
                    store.remove('tempOrigin');
                    store.set('tempOrigin',JSON.stringify(temp));
                }else{
                    // 新建
                    var historyData = {
                        data : []
                    };
                    historyData.data.unshift(jsonData);
                    store.set('tempOrigin',JSON.stringify(historyData));
                }
                init();
                $('.js_dialog').fadeOut(200);
                document.formOriginTemp.reset();
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);
            }
        }, regexp);
    });

});