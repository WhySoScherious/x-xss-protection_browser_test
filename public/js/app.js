$(document).ready(function() {
    var $elXssOptions = $('.xss-header-options');
    var $elHttpMethodOptions = $('.http-method-options');
    var initialMethod = $('#xss-input-form').attr('method');
    var baseUrl = 'http://localhost:8081';
    var localConfig = { localhost: 'localhost', port: 8081 };
    var pageConfig = {};

    try {
        pageConfig = JSON.parse(document.getElementById('pageobjjson').innerHTML);
    } catch (e) {}

    if (pageConfig && Object.keys(pageConfig).length && pageConfig.hasOwnProperty('localhost') && pageConfig.hasOwnProperty('port')) {
        localConfig = pageConfig;

        baseUrl = 'http://' + localConfig.localhost + ':' + localConfig.port;
    }

    var propXss = function (data) {
        if (data && data['X-XSS-Protection']) {
            switch (data['X-XSS-Protection']) {
                case '0':
                    $('#xss-mode-0').prop('checked', true);
                    break;
                case '1':
                    $('#xss-mode-1').prop('checked', true);
                    break;
                case '1; mode=block':
                    $('#xss-mode-1-block').prop('checked', true);
                    break;
                case null:
                    $('#xss-mode-none').prop('checked', true);
                    break;
            }
        } else {
            $('#xss-mode-none').prop('checked', true);
        }
    };

    $.ajax({
        url: baseUrl + '/back',
        dataType: 'json',
        cache: false,
        type: 'GET'
    }).done(function (data) {
        propXss(data);
    }).fail(function () {});

    $elHttpMethodOptions.on('click', 'input[name=\'http-methods\']', function () {
        var method = $(this).prop('checked', true).val();

        $('#xss-input-form').attr('method', method);
    }).find('input[value=\'' + initialMethod.toUpperCase() + '\']').prop('checked', true);

    $elXssOptions.on('click', 'input[name=\'xss-modes\']', function () {
        var selected = $(this).prop('checked', true).val();

        $.ajax({
            url: baseUrl + '/setXSS',
            dataType: 'json',
            type: 'POST',
            data: {
                xssMode: selected
            }
        }).done(function (data) {
            propXss(data);
        }).fail(function () {});
    });
});
