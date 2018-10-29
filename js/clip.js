const ES_BASE_URL = "https://search-clip-uu6oh7i2l7fon6tlma23e6ax3a.ap-northeast-1.es.amazonaws.com/_search";
const $form = $('#search');
const $button = $form.find('#submit');
const $form2 = $('#search2');
const $button2 = $form.find('#submit2');
let searchWord = ""; // 検索ワード

// 描画時
window.onload = () => searchByQuery(location.search || "");

// 履歴の行き来する時
window.onpopstate = () => searchByQuery(location.search || "");

// パラメーターがあれば検索して結果を表示
searchByQuery = query => {
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
setParameter = searchWord => {
    history.pushState(null, null, `?q=${searchWord}`);
    getResults(searchWord);
}

// 検索して結果を返す
getResults = searchWord => {
    const searchUrl = `${ES_BASE_URL}?q=${searchWord}`
    const data ={
        "query":{
            "match_all":{}
        }
    };

    $.ajax({
        url: searchUrl,
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
            setCard(searchWord,result);
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
            console.log('NG...');
        }
    });

}

setCard = (searchWord, result) => {
    const numhits = result.hits.total;
    const hitsArray = result.hits.hits;
    const cards = $("#cards2").empty();
    const article = "<article><div class='card'><a href='' class='card-title' target='_blank'></a><div class='card-detail'><p class='card-ministry'></p><p class='card-pdate'></p></div></article>";

    $('#numhits').text(numhits);
    hitsArray.map(item => {
        const source = item._source;
        const articleQuery = $(article);
        cards.append(articleQuery);
        articleQuery.find(".card-title").attr("href", source.htmlurl);
        articleQuery.find(".card-title").html(source.title);
        articleQuery.find(".card-ministry").html(source.ministry);
        articleQuery.find(".card-pdate").html(source.pdate);
    })
}