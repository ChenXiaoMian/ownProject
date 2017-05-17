// 历史记录详情逻辑
$(function(){
    var $histColl = $("#histColl"),
        $histCollCon = $("#histCollCon");
    //获取历史采集id及类型
    var $histDetail = pageManager.pageOther ? pageManager.pageOther : '',
        $histarr = $histDetail.split('_');

    loadHistDetailStore($histarr[0],$histarr[1]);

    function loadHistDetailStore(type,hid){
        var str = '',
            con = '',
            json = JSON.parse(store.get(type));

        $.each(json.data,function(index,item){
            if(item.hid == $histarr[1]){
                $histColl.html('<div class="weui-flex km-history-info"><p class="weui-flex__item">信息员：'+item.cUserName+'</p><p class="weui-flex__item">采集时间：'+item.Time+'</p></div><p>采集地点：中国广东省深圳市福田区泰科路3号</p>');
                switch($histarr[0]){
                    case 'histStock':
                        $histCollCon.html('<p>产地名称：'+item.Market+'</p><p>药材名称：'+item.Medicine+'</p><p>商户名称：'+item.MerchantName+'</p><p>商户地址：'+item.MerchantAddress+'</p><p>联系人：'+item.ContactPerson+'</p><p>联系方式：'+item.Phone+'</p><p>年消耗量：'+item.Consume+'公斤</p><p>库存数量：'+item.Inventory+'公斤</p><p>存量进价：'+item.InventoryCost+'元/公斤</p><p>库存地址：'+item.InventoryAddress+'</p><p>备注：'+item.Addition+'</p>');
                        break;
                }
            }
        });
    }
});