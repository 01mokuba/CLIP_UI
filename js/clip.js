var $form = $('#search');
var $button = $form.find('#submit');
var $form2 = $('#search2');
var $button2 = $form.find('#submit2');
var kw = "";

window.onload = function() {
  if (location.search) {
    // パラメーターに含まれた検索ワードを取得
    const param = location.search.substring(1).split('=');
    const searchValue = decodeURIComponent(param[1])
    if (searchValue !== kw) {
      // 検索する
      getResults(searchValue)
      kw = searchValue
    }
  }
}

$form.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    kw = $form.find("#kw").val();
    window.location.href = `?q=${kw}`
});

$form2.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    kw = $form2.find("#kw2").val();
    window.location.href = `?q=${kw}`
});

var getResults = function(kw){
  var esurl = "https://search-clip-uu6oh7i2l7fon6tlma23e6ax3a.ap-northeast-1.es.amazonaws.com/_search";
  if(kw !== ""){
    var query = "?q=" + kw;
    esurl += query;
  }

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
            $form[0].reset();
            setCard(kw,result);
            if (kw !== "undefined") {
                $('#kw').val(kw);
            }
            $('#kw2').val(kw);
            if( kw == "" || kw === "undefined" ){
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
  $('#numhits').text(numhits);

  var hitsArr = result["hits"]["hits"];

  var cards = $("#cards2").empty();
  var article = "<article><div class='card'><a href='' class='card-title' target='_blank'></a><div class='card-detail'><p class='card-ministry'></p><p class='card-pdate'></p></div></article>";

  for (var i = 0; i < hitsArr.length; i++) {
    var hit = hitsArr[i];
    var source = hit["_source"];
    var articleQuery = $(article);
    cards.append(articleQuery);
    articleQuery.find(".card-title").attr("href", source["htmlurl"]);
    articleQuery.find(".card-title").html(source["title"]);
    articleQuery.find(".card-ministry").html(source["ministry"]);
    articleQuery.find(".card-pdate").html(source["pdate"]);
  }
}