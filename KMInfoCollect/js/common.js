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

$kmurl = 'http://km126.km1818.com:8181/KMInfoCollect/services';
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
      weui.toast('上传失败', 2000);
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