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
            $('#kw').val(kw);
            var temp = $('#kw').val();
            $('#kwResults').text(kw);
            if( $('#kw').val() == "" ){
                $('#top').show();
                $('#results').hide();
            } else {
                $('#top').hide();
                $('#results').show();
            }
        },
        // 通信失敗時の処理
        error: function(xhr, textStatus, error) {
            console.log('NG...');
        }
    });

}

var setCard = function(kw,result){
  var numhits = result["hits"]["total"];
  console.log(numhits);
  console.log(kw);
  $('#numhits').text(numhits);

  var hitsArr = result["hits"]["hits"];
  console.log(hitsArr);

  var cards = $("#cards2").empty();
  var article = "<article><div class='card'><a href='' class='card-title' target='blank'></a><div class='card-detail'><p>国土交通省</p><p>2018年9月28日</p></div></article>";

  for (var i = 0; i < hitsArr.length; i++) {
    var hit = hitsArr[i];
    var source = hit["_source"];
    var articleQuery = $(article);
    cards.append(articleQuery);
    console.log(source["title"]);
    articleQuery.find(".card-title").html(source["title"]);
  }
}


var $form2 = $('#search2');
var $button2 = $form.find('#submit2');

$form2.submit(function(event) {
  // HTMLでの送信をキャンセル
  event.preventDefault();

  var kw = $form2.find("#kw2").val();
  getResults2(kw)

});

var getResults2 = function(kw){
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
            $button2.attr('disabled', true);
        },
        // 応答後
        complete: function(xhr, textStatus) {
            // ボタンを有効化し、再送信を許可
            $button2.attr('disabled', false);
        },
        // 通信成功時の処理
        success: function(result, textStatus, xhr) {
            // 入力値を初期化
            console.log($form);
            $form[0].reset();

            console.log('OK');
            //console.log(result);
            setCard2(kw,result);
            $('#kw2').val(kw);
            $('#kwResults').text(kw);
            if( $('#kw2').val() == "" ){
                $('#top').show();
                $('#results').hide();
            } else {
                $('#top').hide();
                $('#results').show();
            }
        },
        // 通信失敗時の処理
        error: function(xhr, textStatus, error) {
            console.log('NG...');
        }
    });

}

var setCard2 = function(kw,result){
  var numhits = result["hits"]["total"];
  console.log(numhits);
  console.log(kw);
  $('#numhits').text(numhits);

  var hitsArr = result["hits"]["hits"];
  console.log(hitsArr);

  var cards = $("#cards2").empty();
  var article = "<article><div class='card'><a href='' class='card-title' target='blank'></a><div class='card-detail'><p>国土交通省</p><p>2018年9月28日</p></div></article>";

  for (var i = 0; i < hitsArr.length; i++) {
    var hit = hitsArr[i];
    var source = hit["_source"];
    var articleQuery = $(article);
    cards.append(articleQuery);
    console.log(source["title"]);
    articleQuery.find(".card-title").html(source["title"]);
  }
}
