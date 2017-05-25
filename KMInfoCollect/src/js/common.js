// 参数设置
$kmurl = 'http://km126.km1818.com:8181/KMInfoCollect/services';
$tempNum = 20;  //模板设置最大数
$historyNum = 20; //历史记录保留数

// 对Date的扩展，将 Date 转化为指定格式的String
Date.prototype.Format = function (fmt){
  var o = {
      "M+": this.getMonth() + 1, //月份
      "d+": this.getDate(), //日
      "h+": this.getHours(), //小时
      "m+": this.getMinutes(), //分
      "s+": this.getSeconds(), //秒
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度
      "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

// 判断一个对象是否为空
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {
  // 本身为空直接返回true
  if (obj == null) return true;
  // 然后可以根据长度判断，在低版本的ie浏览器中无法这样判断。
  if (obj.length > 0)    return false;
  if (obj.length === 0)  return true;
  //最后通过属性长度判断。
  for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) return false;
  }
  return true;
}


// 上传ajax
function uploader(jsonData,url,callback){
  var loading = weui.loading('上传中...');
  $.ajax({
    url: $kmurl+url,
    type:"GET",
    contentType: 'application/json; charset=utf-8',
    dataType:"jsonp",
    jsonp:"jsoncallback",
    data:{"parms":JSON.stringify(jsonData)},
    success:function(response){
      loading.hide();
      weui.toast('上传成功', 2000);
      callback();
    },
    error: function(jqXHR, textStatus, errorThrown){
      loading.hide();
      weui.alert('上传失败');
    }
  });
}

// 阻止冒泡
function stopBubble(e){
  if(e && e.stopPropagation){
    e.stopPropagation();
  }else{
    window.event.cancelBubble = true;
  }
};

// 初始化搜索关键字
function initSearch(tdom,vdom,str){
  $(tdom).text(str).addClass('c-c7c7c7').removeClass('c-3dbaff');
  $(vdom).val("");
};

// 得到搜索结果改变样式
function changeSearch(tdom,vdom,str){
  $(tdom).text(str).removeClass('c-c7c7c7').addClass('c-3dbaff');
  $(vdom).val(str);
};

// 搜索验证后清除样式
function clearSearch(vdom){
  if($(vdom).val() && $(vdom).val()!=''){
      $(vdom).parents(".weui-cell_access").removeClass('weui-cell_warn');
  }
}

// 输入验证后清除样式
function clearInput(vdom){
  if($(vdom).val() && $(vdom).val()!=''){
      $(vdom).parents(".weui-cell").removeClass('weui-cell_warn');
  }
}

// 对象拷贝
function cloneObj(obj) {
  var newObj = {};
  for(var prop in obj) {
    newObj[prop] = obj[prop];
  }
  return newObj;
}

//内页初始化
function innerInit(){
  $("body").scrollTop(0);
}

// 获取地址
function getPosition(){
  if(Cookies.get('location')=='' || !Cookies.get('location')){
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            var url = 'http://api.map.baidu.com/geocoder/v2/?ak=oN5ln95bD6YRawbMzfavu3GE&callback=?&location=' + r.point.lat + ',' + r.point.lng + '&output=json&pois=1';
            var inOneHour = 1/24;
            $.getJSON(url, function (res) {
                Cookies.set('location', res.result.formatted_address, { expires: inOneHour });
            });
        }else{
            alert('failed'+this.getStatus());
        }
    },{enableHighAccuracy: true});
  }
}

// 设置地址栏
function setPosition(dom){
  if(Cookies.get('location') && Cookies.get('location')!=''){
      dom.text(Cookies.get('location'));
  }else{
      dom.text('暂无位置');
  }
}

// 自定义验证项
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

// 加载药品规格
function loadMedicineStandard(ele,data){
    var arr = [],
        strs = '';
    arr = data.split(",");
    if(arr.length>0){
        ele.empty();
        $.each(arr,function(index,item){
            strs+='<option value="'+item+'">'+item+'</option>';
        });
        ele.html(strs);
    }else{
        ele.empty();
    }
}

// 页面通用操作
$(function(){
  // 选择模板类型
  $(".container").on('click','.js-tempChoose',function(){
      var type = $(this).data("item");
      store.set('getTemp',type);
      window.pageManager.go('tempChoose');
      return false;
  });
  // 搜索项目
  $(".container").on('click','.js-itemSearch',function(){
      if($(this).hasClass('disabled')) return false;
      var type = $(this).data("search");
      store.set('getSearch',type);
      window.pageManager.go('itemSearch');
  });
});
// 验证所需
var regexp = {
    regexp: {
        IDNUM: /(?:^\d{15}$)|(?:^\d{18}$)|^\d{17}[\dXx]$/,
        NUMBER: /^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/
    }
};

//将对象元素转换成字符串以作比较
function obj2key(obj, keys){
    var n = keys.length,
        key = [];
    while(n--){
        key.push(obj[keys[n]]);
    }
    return key.join('|');
}
//去重操作
function uniqeByKeys(array,keys){
    var arr = [];
    var hash = {};
    for (var i = 0, j = array.length; i < j; i++) {
        var k = obj2key(array[i], keys);
        if (!(k in hash)) {
            hash[k] = true;
            arr.push(array[i]);
        }
    }
    return arr ;
}