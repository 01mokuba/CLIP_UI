var constants = Object.freeze({
    "ES_BASE_URL": "//clip.mokuba.tech:9200/clip/clip/_search",
    "PER_PAGE_COUNT": 20
});

var paramObj = {}
var searchWord = ""; // 検索ワード
var currentPage = 1; // 現在のページ数
var over_flg = false;

var $form = $('#search');
var $button = $form.find('#submit');
var $form2 = $('#search2');
var $button2 = $form.find('#submit2');
var $pagination = $('#pagination');

// 描画時
window.onload = function() {searchByQuery(location.search || "")};

// 履歴の行き来する時
window.onpopstate = function() {searchByQuery(location.search || "")};

// クエリがあれば検索して結果を表示
searchByQuery = function(query) {
    if (query) {
        parseQueryString(query)
        var nextSearchWord = paramObj.q
        if (nextSearchWord !== searchWord) {
            searchWord = nextSearchWord
            if (paramObj.page) {
                currentPage = Number(paramObj.page)
            } else {
                currentPage = 1
            }
            setParameter("","")
        }
    } else {
        getResults("","")
    }
}

// クエリをObject型にparse
parseQueryString = function(queryString) {
    var queries = queryString.substring(1).split("&"), tmp;
    for (var i = 0, l = queries.length; i < l; i++ ) {
        tmp = queries[i].split('=');
        paramObj[tmp[0]] = decodeURI(tmp[1]);
    }
};

// トップ画面から検索時
$form.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    currentPage = 1;
    searchWord = $form.find("#searchWord").val();
    gtag(
        'event', 'search', {
            'search_term': searchWord,
            'position': 'top'
        }
    );
    // 期間絞り込み結果を取得
    var fromYear = $('#syear').val();
    var fromMonth = $('#smonth').val();
    var toYear = $('#eyear').val();
    var toMonth = $('#emonth').val();
    var gte = constructPeriod(fromYear, fromMonth);
    var lte = constructPeriod(toYear, toMonth);
    setParameter(gte,lte)
});

// ヘッダーから検索時
$form2.submit(function(event) {
    // HTMLでの送信をキャンセル
    event.preventDefault();
    currentPage = 1;
    searchWord = $form2.find("#searchWord2").val();
    gtag(
        'event', 'search', {
            'search_term': searchWord,
            'position': 'header'
        }
    );
    // 期間絞り込み結果を取得
    var fromYear = $('#syear2').val();
    var fromMonth = $('#smonth2').val();
    var toYear = $('#eyear2').val();
    var toMonth = $('#emonth2').val();
    var gte = constructPeriod(fromYear, fromMonth);
    var lte = constructPeriod(toYear, toMonth);
    setParameter(gte,lte)
});

// 期間絞り込み変数を作成
constructPeriod = function(year, month) {
    var today = new Date();
    var thisYear = today.getFullYear();
    // 開始年が未指定の場合
    if (year === "0") {
        year = "2010";
    }
    // 終了年が未指定の場合
    else if (year === "100") {
        year = thisYear;
    }
    // 月が未指定の場合
    if (month === "0") {
        if (year == thisYear) {
            month = today.getMonth() + 1
        } else {
            month = "1";
        }
    }
    return year + '/' + month;
}

// パラメーターをセット
setParameter = function(gte,lte) {
    // ローダーを表示
    $('#loader-wrapper').show();
    if (currentPage > 1) {
        history.pushState(null, null, '?q=' + searchWord + '&page=' + currentPage);
    } else {
        history.pushState(null, null, '?q=' + searchWord);
    }
    getResults(gte,lte);
}

// 検索して結果を返す
getResults = function(gte,lte) {
    // 省庁絞り込み結果を取得
    var ministries = $('.ministry:checked').map(function() {
      return parseFloat($(this).val());
    }).get();
    var isDefaultMinistry = false;
    // 省庁が未指定の場合
    if (ministries.length == 0) {
        ministries = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]
        isDefaultMinistry = true;
    }
    var isDefaultPeriod = false;
    // 期間が未指定の場合
    if (gte === "" && lte === "") {
        gte = constructPeriod("0","0")
        lte = constructPeriod("100","0")
        isDefaultPeriod = true;
    }
    var data = {
        "query": {
            "bool": {
              "filter": [
                    {"terms": {
                        "ministry_id": ministries
                        }
                    },
                    {"query_string": {
                        "default_field" : "text",
                        "query": '¥"' + searchWord + '¥"'
                        }
                    },
                    {
                        "range": {
                            "pdate": {
                                "gte": gte,
                                "lte": lte,
                                "format": "yyyy/MM"
                            }
                        }
                    }
                ]
            }
        },
        "sort": {
            "pdate": {
                "order": "desc"
            }
        }
    };
    var searchUrl;
    if (currentPage > 1) {
        searchUrl = constants.ES_BASE_URL + '?size=' + constants.PER_PAGE_COUNT + '&from=' + constants.PER_PAGE_COUNT * (currentPage - 1)
    } else {
        searchUrl = constants.ES_BASE_URL + '?size=' + constants.PER_PAGE_COUNT
    }
    $.ajax({
        url: searchUrl,
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
            // スクロール位置をトップにする
            window.scrollTo(0, 0);
            // ローダーを非表示
            $('#loader-wrapper').delay(600).fadeOut(300);
            // 入力値を初期化
            $form[0].reset();
            // 結果の表示
            setCard(searchWord,result);
            setPeriod(gte,lte,isDefaultPeriod)
            setMinistry(ministries, isDefaultMinistry);
            setPagination(result.hits.total);
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

    var numhits = result.hits.total;
    var hitsArray = result.hits.hits;
    var cards = $("#cards2").empty();
    var article = "<article><div class='card'><div class='card-title'></div><div class='card-detail'><p class='card-ministry'></p><p class='card-pdate'></p></div></article>";

    $('#numhits').text(numhits);
    hitsArray.map(function(item) {
        var source = item._source;
        var articleQuery = $(article);
        cards.append(articleQuery);
        articleQuery.find(".card-title").attr("href", source.page_url);
        articleQuery.find(".card-title").html(source.title);
        articleQuery.find(".card-ministry").html(source.ministry_name);
        articleQuery.find(".card-pdate").html(source.pdate);
    })
}

setPeriod = function(gte,lte,isDefaultPeriod) {
    var text = ""
    if (isDefaultPeriod) {
        text = "未指定"
    } else {
        var periodStart = gte.replace("/","年") + "月";
        var periodEnd = lte.replace("/","年") + "月";
        text = periodStart + " から " + periodEnd + " まで"
    }
    $('#specified-period').text(text);
}

setMinistry = function(ministries, isDefaultMinistry) {
    var ministryText = ""
    if (isDefaultMinistry) {
        ministryText = "未指定"
    } else {
        for(var i = 0; i < ministries.length; i++) {
            var ministryId = ministries[i];
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
    }
    $('#specified-ministries').text(ministryText);
}

setPagination = function(numhits) {
    $pagination.twbsPagination('destroy');
    if (numhits > constants.PER_PAGE_COUNT) {
        $pagination.twbsPagination({
            startPage: currentPage,
            totalPages: numhits / constants.PER_PAGE_COUNT,
            visiblePages: 5,
            onPageClick: function (e, page) {
                e.preventDefault();
                if (page !== currentPage) {
                    currentPage = page;
                    setParameter("","");
                }
            }
        });
    }
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

// カードをクリックしたら遷移する
$(function(){
    $(document).on('click', '.card', function(){
        var href = $(this).children('div:first').attr('href');
        window.open(href);
    })
});
