var $form = $('#search');
var $button = $form.find('#submit');
window.onload = function() {
  getResults("");
}

$form.submit(function(event) {
  // HTMLでの送信をキャンセル
  event.preventDefault();

  var kw = $form.find("#kw").val();
  getResults(kw)

});

var getResults = function(kw){
  console.log(kw);
  var esurl = "https://search-clip-uu6oh7i2l7fon6tlma23e6ax3a.ap-northeast-1.es.amazonaws.com/_search";
  if(kw !== ""){
    var query = "?q=" + kw;
    esurl += query;
  }

  console.log(esurl);
  var data ={
      "query":{
          "match_all":{}
      }
  };

    $.ajax({
        url: esurl,
        type: "POST",
        data: data,
        timeout: 10000,  // 単位はミリ秒

        // 送信前
        beforeSend: function(xhr, settings) {
            // ボタンを無効化し、二重送信を防止
            $button.attr('disabled', true);
        },
        // 応答後
        complete: function(xhr, textStatus) {
            // ボタンを有効化し、再送信を許可
            $button.attr('disabled', false);
        },
        // 通信成功時の処理
        success: function(result, textStatus, xhr) {
            // 入力値を初期化
            console.log($form);
            $form[0].reset();

            console.log('OK');
            //console.log(result);
            setCard(kw,result);
        },
        // 通信失敗時の処理
        error: function(xhr, textStatus, error) {
            console.log('NG...');
        }
    });

}
var setCard = function(kw,result){
  var content = $("#content").empty();

  var numhits = result["hits"]["total"];
  var hitsArr = result["hits"]["hits"];
  console.log(numhits);
  console.log(hitsArr);
  var stat = "<div class='stat'>キーワード:<span class='kw'></span><br>\
        ヒット数:<span class='numhits'></span></div><br>";

  var statQuery = $(stat);
  content.append(statQuery);
  console.log(kw);
  statQuery.find(".kw").html(kw);
  statQuery.find(".numhits").html(numhits);

  var article = "<article><h3 class='title'></h3>\
          <p class='text'></p></article>";


  $('#numhits').text(numhits);
  $('#kwResults').text(kw);

  for (var i = 0; i < hitsArr.length; i++) {
    var hit = hitsArr[i];
    var source = hit["_source"];
    var articleQuery = $(article);

    content.append(articleQuery);

    console.log(source["title"]);
    articleQuery.find(".title").html(source["title"]);
    articleQuery.find(".text").html(source["text"]);
  }
}

