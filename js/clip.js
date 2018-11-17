const ES_BASE_URL = "http://ec2-52-197-160-102.ap-northeast-1.compute.amazonaws.com:9200/clip/hirata_test/_search";
const $form = $('#search');
const $button = $form.find('#submit');
const $form2 = $('#search2');
const $button2 = $form.find('#submit2');
let searchWord = ""; // 検索ワード

// 描画時
window.onload = function() {searchByQuery(location.search || "")};

// 履歴の行き来する時
window.onpopstate = function() {searchByQuery(location.search || "")};

// パラメーターがあれば検索して結果を表示
searchByQuery = function(query) {
    if (query) {
        const param = query.substring(1).split('=');
        const nextSearchWord = decodeURIComponent(param[1])
        if (nextSearchWord !== searchWord) {
            searchWord = nextSearchWord
            getResults(searchWord)
        }
    } else {
        getResults("")
    }
}

// トップ画面から検索時
$form.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    searchWord = $form.find("#searchWord").val();
    setParameter(searchWord)
});

// ヘッダーから検索時
$form2.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    searchWord = $form2.find("#searchWord2").val();
    setParameter(searchWord)
});

// パラメーターをセット
setParameter = function(searchWord) {
    history.pushState(null, null, '?q=' + searchWord);
    getResults(searchWord);
}

// 検索して結果を返す
getResults = function(searchWord) {
    const searchUrl = ES_BASE_URL + '?q=' + searchWord
    // 省庁絞り込み結果を取得
    var ministries = $('.ministry:checked').map(function() {
      return parseFloat($(this).val());
    }).get();
    if (ministries.length == 0) {
        ministries = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
    }
    const data = {
        "query": {
            "bool": {
              "filter": [
                    {"terms": {
                        "ministry_id": ministries
                        }
                    },
                    {"query_string": {
                        "default_field" : "text",
                        "query": searchWord
                        }
                    }
                ]
            }
        }
    };

    $.ajax({
        url: ES_BASE_URL + '?size=20',
        type: "POST",
        data: JSON.stringify(data),
        contentType: 'application/json',
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
            setCard(searchWord,result);
            setMinistry(ministries)
            $('#searchWord2').val(searchWord);
            if( searchWord === "" || searchWord === "undefined" ){
                $('#top').show();
                $('#results').hide();
            } else {
                $('#top').hide();
                $('#results').show();
            }
        },
        // 通信失敗時の処理
        error: function(xhr, textStatus, error) {
            console.log(error);
            console.log('NG...');
        }
    });

}

setCard = function(searchWord, result) {
    const numhits = result.hits.total;
    const hitsArray = result.hits.hits;
    const cards = $("#cards2").empty();
    const article = "<article><div class='card'><a href='' class='card-title' target='_blank'></a><div class='card-detail'><p class='card-ministry'></p><p class='card-pdate'></p></div></article>";

    $('#numhits').text(numhits);
    hitsArray.map(function(item) {
        const source = item._source;
        const articleQuery = $(article);
        cards.append(articleQuery);
        articleQuery.find(".card-title").attr("href", source.page_url);
        articleQuery.find(".card-title").html(source.title);
        articleQuery.find(".card-ministry").html(source.ministry_name);
        articleQuery.find(".card-pdate").html(source.pdate);
    })
}

setMinistry = function(ministries) {
    var ministryText = ""
    for(var i = 0; i < ministries.length; i++) {
        const ministryId = ministries[i];
        if (ministryId == 1) {
            ministryText += "内閣府 "
        }
        if (ministryId == 2) {
            ministryText += "総務省 "
        }
        if (ministryId == 3) {
            ministryText += "法務省 "
        }
        if (ministryId == 4) {
            ministryText += "外務省 "
        }
        if (ministryId == 5) {
            ministryText += "財務省 "
        }
        if (ministryId == 6) {
            ministryText += "文部科学省 "
        }
        if (ministryId == 7) {
            ministryText += "厚生労働省 "
        }
        if (ministryId == 8) {
            ministryText += "農林水産省 "
        }
        if (ministryId == 9) {
            ministryText += "経済産業省 "
        }
        if (ministryId == 10) {
            ministryText += "国土交通省 "
        }
        if (ministryId == 11) {
            ministryText += "環境省 "
        }
        if (ministryId == 12) {
            ministryText += "防衛省 "
        }
        if (ministryId == 13) {
            ministryText += "復興庁 "
        }
        if (ministryId == 14) {
            ministryText += "金融庁 "
        }
    }
    $('#specified-ministries').text(ministryText);
}

$(function(){
    $('#filter').click(function(){
        if ($(this).hasClass('selected')) {
            // メニュー非表示
            $(this).removeClass('selected');
            $('#checkbox-container').slideUp('fast');
        }else{
            // メニュー表示
            $(this).addClass('selected');
            $('#checkbox-container').slideDown('fast');
        }
    });

    // マウスカーソルがメニュー上/メニュー外
    $('#checkbox-container, #filter').hover(function(){
        over_flg = true;
    }, function(){
        over_flg = false;
    });

    // メニュー領域外をクリックしたらメニューを閉じる
    $('body').click(function() {
        if (over_flg == false) {
            $('#filter').removeClass('selected');
            $('#checkbox-container').slideUp('fast');
        }
    });
});

$(function(){
    $('#filter2').click(function(){
        if ($(this).hasClass('selected')) {
            // メニュー非表示
            $(this).removeClass('selected');
            $('#checkbox-container2').slideUp('fast');
        }else{
            // メニュー表示
            $(this).addClass('selected');
            $('#checkbox-container2').slideDown('fast');
        }
    });

    // マウスカーソルがメニュー上/メニュー外
    $('#checkbox-container2, #filter2').hover(function(){
        over_flg = true;
    }, function(){
        over_flg = false;
    });

    // メニュー領域外をクリックしたらメニューを閉じる
    $('body').click(function() {
        if (over_flg == false) {
            $('#filter2').removeClass('selected');
            $('#checkbox-container2').slideUp('fast');
        }
    });
});
