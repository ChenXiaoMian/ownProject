// 贸易模板逻辑
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
      store.remove('market');
      store.remove('medicine');
      store.remove('base');
      store.remove('standard');
      store.remove('StandardStr');
      initSearch('.sText-market','.sVal-market','关键字/市场名称');
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
            $("#form-trading-temp").append($addDom);

        }
    }

    // 页面切换数据返回
    $(window).on('hashchange', function(e){
        e.preventDefault();
        var tt = /#tempTrading$/,
            is = /#itemSearch$/;

        if(is.test(e.oldURL)&&tt.test(e.newURL)){
            // 搜索结果返回响应
            var $base = store.get('base') ? store.get('base') : '';
            if($base!=''){
                if(!isEmpty(JSON.parse($base))){
                    changeSearch('.sText-base','.sVal-base',JSON.parse($base).name);
                    clearSearch('.sVal-base');
                    store.remove('base');
                }
            }
            var $market = store.get('market') ? store.get('market') : '';
            if($market!=''){
                if(!isEmpty(JSON.parse($market))){
                    changeSearch('.sText-market','.sVal-market',JSON.parse($market).name);
                    clearSearch('.sVal-market');
                    store.remove('market');
                }
            }
            var $medicine = store.get('medicine') ? store.get('medicine') : '';
            var $Standard = $("select[name='Standard']");
            if($medicine!=''){
                if(!isEmpty(JSON.parse($medicine))){
                    changeSearch('.sText-medicine','.sVal-medicine',JSON.parse($medicine).name);
                    store.set('StandardStr',JSON.parse($medicine).standard);  //设置药品规格
                    $(".innerType").find("select[name='Standard']").each(function(){
                        loadMedicineStandard($(this),JSON.parse($medicine).standard); //加载药品规格
                    });
                    clearSearch('.sVal-medicine');
                    store.remove('medicine');
                }
            }
        }
    });

    function getStandardStr(key,id){
      var json = JSON.parse(store.get(key)),
          data = {};
      $.each(json.data,function(index,item){
          if(item.tid == id) data = item;
      });
      return data.StandardStr;
    }

    // 编辑模板获取数据
    function getTemplateStore(key,id){
        var json = JSON.parse(store.get(key)),
            data = {};
        $.each(json.data,function(index,item){
            if(item.tid == id) data = item;
        });
        //console.log(json.data);
        $("select[name='Scale'],select[name='MedicineType']").find('option').removeAttr('selected');
        $("select[name='Scale']").find('option[value="'+data.Scale+'"]').prop('selected',true);
        $("select[name='MedicineType']").find('option[value="'+data.MedicineType+'"]').prop('selected',true);
        $("input[name='MerchantName']").val(data.MerchantName);
        changeSearch('.sText-market','.sVal-market',data.Market);
        changeSearch('.sText-medicine','.sVal-medicine',data.Medicine);
        changeSearch('.sText-base','.sVal-base',data.BaseName);
        $("input[name='tempTitle']").val(data.tempTitle);
        $("textarea[name='Addition']").val(data.Addition);
        if(data.IsDefault == 1) $("input[name='IsDefault']").prop("checked","checked").val('1');
        $(".innerType").empty();
        // 加载多规格
        // 加载节点
        $.each(data.innerType,function(index,item){
          var $contains = $(".innerType");
          // if(index>0){
            var len = index + 1;
            var $str = '<form id="innerType'+len+'" name="innerType'+len+'" autocomplete="off"><div class="weui-cells weui-cells_form"><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label adLet">规 格 '+len+'</label></div><div class="weui-cell__bd"><select class="weui-select"name="Standard"></select></div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易数量<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"placeholder=""name="TradeProduction" disabled="disabled"/></div><div class="weui-cell__dw c-c7c7c7">公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易价格<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"required placeholder=""name="Price"emptyTips="请输入交易价格" disabled="disabled"/></div><div class="weui-cell__dw c-c7c7c7">元/公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">价格趋势</label></div><div class="weui-cell__bd"><select class="weui-select"name="PriceTendency" disabled="disabled"><option value="">请选择</option><option value="持平">持平</option><option value="上升">上升</option><option value="下降">下降</option></select></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"disabled="disabled"placeholder="0"name="PriceRange"/></div><div class="weui-cell__dw flex-20 c-c7c7c7">%</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">市场表现</label></div><div class="weui-cell__bd"><select class="weui-select"name="MarketStatus" disabled="disabled"><option value="">请选择</option><option value="正常">正常</option><option value="活跃">活跃</option><option value="不活跃">不活跃</option></select></div></div></div></form>';
            $contains.append($str);
            weui.form.checkIfBlur('#innerType'+len, regexp);
          // }
        });
        // 添加规格
        $(".innerType").find("select[name='Standard']").each(function(){
            loadMedicineStandard($(this),data.StandardStr); //加载药品规格
        });
        // 设置规格数据
        $.each(data.innerType,function(index,item){
          var index = index+1;
          // $("#innerType"+index).find("input[name='TradeProduction']").val(item.TradeProduction);
          // $("#innerType"+index).find("input[name='Price']").val(item.Price);
          // if(item.PriceRange&&item.PriceRange!=''){
          //     $("#innerType"+index).find("input[name='PriceRange']").prop("disabled",false).val(item.PriceRange);
          // }
          $("#innerType"+index).find("select[name='Standard']").children('option[value="'+item.Standard+'"]').prop('selected',true);
          // $("#innerType"+index).find("select[name='PriceTendency']").children('option[value="'+item.PriceTendency+'"]').prop('selected',true);
          // $("#innerType"+index).find("select[name='MarketStatus']").children('option[value="'+item.MarketStatus+'"]').prop('selected',true);
        });
    }

    weui.form.checkIfBlur('#form-trading-temp', regexp);

    $('.js_dialog').on('click', '.weui-dialog__btn_default', function(){
        $(this).parents('.js_dialog').fadeOut(200);
    });

    $(".btnShowDialog").on('click',function(){
        $("#form-trading-temp").find(".js_dialog").fadeIn(200);
        $("#form-trading-temp").find("input[name='tempTitle']").focus();
    });

    $("input[name='IsDefault']").on('change',function(){
        var isCheck = $(this).is(':checked') ? 1 : 0;
        $(this).val(isCheck);
    });

    $(".innerType").on('change','select[name="PriceTendency"]',function(){
        var $val = $(this).val(),
            $text = $(this).parents(".weui-cell").find("input[name='PriceRange']");
        if($val=='' || $val=='持平'){
            $text.prop("disabled",true).val("");
        }else{
            $text.prop("disabled",false);
        }
    });
    $(".innerType").on('input propertychange','input[name="Price"]',function(){
        clearInput($(this));
    });

    // 增加规格
    $("#btnAddStandard").on('click',function(){
        var $contains = $(".innerType"),
            len = $contains.find("form").length + 1;
        if(len < 11){
            var $str = '<form id="innerType'+len+'" name="innerType'+len+'" autocomplete="off"><div class="weui-cells weui-cells_form"><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label adLet">规 格 '+len+'</label></div><div class="weui-cell__bd"><select class="weui-select"name="Standard"></select></div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易数量<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"placeholder=""name="TradeProduction" disabled="disabled"/></div><div class="weui-cell__dw c-c7c7c7">公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label ">交易价格<br/>(日平均)</label></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"required placeholder=""name="Price"emptyTips="请输入交易价格" disabled="disabled"/></div><div class="weui-cell__dw c-c7c7c7">元/公斤</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">价格趋势</label></div><div class="weui-cell__bd"><select class="weui-select"name="PriceTendency" disabled="disabled"><option value="">请选择</option><option value="持平">持平</option><option value="上升">上升</option><option value="下降">下降</option></select></div><div class="weui-cell__bd"><input class="weui-input"type="text"pattern="REG_NUMBER"notmatchtips="请输入正确的数字格式"disabled="disabled"placeholder="0"name="PriceRange"/></div><div class="weui-cell__dw flex-20 c-c7c7c7">%</div></div><div class="weui-cell"><div class="weui-cell__hd km-line"><label class="weui-label">市场表现</label></div><div class="weui-cell__bd"><select class="weui-select"name="MarketStatus" disabled="disabled"><option value="">请选择</option><option value="正常">正常</option><option value="活跃">活跃</option><option value="不活跃">不活跃</option></select></div></div></div></form>';

            $contains.append($str);
            weui.form.checkIfBlur('#innerType'+len, regexp);
            var $dom = $("#innerType"+len).find("select[name='Standard']"),
                standard = store.get('StandardStr') || getStandardStr($tempKey,$editId);
            if(standard&&standard!=''){
                loadMedicineStandard($dom,standard);
            }
        }else{
            weui.alert('最多可添加10个规格');
        }
    });

    // 保存按钮
    $(".tempTrading").on('click','#form-temp-edit',function () {
        weui.form.validate('#form-trading-temp', function (error){
            //console.log(error);
            if (!error) {
                // 组织数据,$editId
                var jsonData = {},
                    formData = $("#form-trading-temp").serializeArray(),
                    json = JSON.parse(store.get($tempKey)),
                    eindex = 0;
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");

                $.each(json.data,function(index,item){
                    if(jsonData.IsDefault == 1)  item.IsDefault = '0';
                    if(item.tid == $editId) eindex = index;
                });
                jsonData.tid = $editId;
                jsonData.StandardStr = store.get('StandardStr') ? store.get('StandardStr') : json.data[eindex].StandardStr;
                jsonData.innerType = [];

                // 组织多种规格数据
                var $typeForm = $(".innerType").find("form[name^='innerType']");
                var cache = [],uniArr;
                $typeForm.each(function(index){
                    var data = $(this).serializeArray(),
                        values = {};
                    for (var item in data) {
                        values[data[item].name] = data[item].value;
                    }
                    cache.push(values);
                });
                uniArr = uniqeByKeys(cache,['Standard']);  //数组去重
                jsonData.innerType = uniArr;

                json.data.splice(eindex,1,jsonData);

                var loading = weui.loading('保存中...');
                store.remove('tempTrading');
                store.set('tempTrading',JSON.stringify(json));
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);

            }
        }, regexp);
    });
    // 新建按钮
    $("#form-trading-temp").on('click','#form-temp-submit',function () {
        // 验证基本信息
        weui.form.validate('#form-trading-temp', function (error){
            if (!error) {
                // 组织数据
                var jsonData = {},
                    formData = $("#form-trading-temp").serializeArray();
                jsonData.IsDefault = '0';
                $.each(formData,function(key,value){
                    jsonData[value.name] = value.value;
                });
                jsonData.Time = new Date().Format("yyyy-MM-dd hh:mm:ss");
                jsonData.tid = new Date().getTime();
                jsonData.StandardStr = store.get('StandardStr') ? store.get('StandardStr') : '';
                jsonData.innerType = [];

                // 组织多种规格数据
                var $typeForm = $(".innerType").find("form[name^='innerType']");
                var cache = [],uniArr;
                $typeForm.each(function(index){
                    var data = $(this).serializeArray(),
                        values = {};
                    for (var item in data) {
                        values[data[item].name] = data[item].value;
                    }
                    cache.push(values);
                });
                uniArr = uniqeByKeys(cache,['Standard']);  //数组去重
                jsonData.innerType = uniArr;

                var loading = weui.loading('保存中...');
                var $temp = store.get('tempTrading') ? store.get('tempTrading') : '';
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
                    store.remove('tempTrading');
                    store.set('tempTrading',JSON.stringify(temp));
                }else{
                    // 新建
                    var historyData = {
                        data : []
                    };
                    historyData.data.unshift(jsonData);
                    store.set('tempTrading',JSON.stringify(historyData));
                }
                init();
                $('.js_dialog').fadeOut(200);
                loading.hide();
                weui.toast('模板保存成功', 500);
                setTimeout(function(){
                    window.pageManager.back();
                },800);
            }
        }, regexp);
    });

});
