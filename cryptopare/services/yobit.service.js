(function () {
    'use strict';

    angular
        .module('app.cryptopare.yobit.service', [])
        .factory('yobit', yobit);

    function yobit() {

        yobit.baseUrl = 'https://yobit.net/api/3/';

        yobit.getMarkets = function (callback) {
            var url = yobit.baseUrl + 'info';
            $http.get(url)
                .then(function successCallback(result) {
                    var lst = Object.keys(result.data.pairs).filter(function (e) {
                        return e.indexOf("btc") >= 0;
                    }).map(function (elem) {
                        return {
                            nome: elem.replace("_", "/").toUpperCase()
                        };
                    });
                    var counter = 0;
                    for (var i = 0; i < lst.length; i++) {
                        var url = yobit.baseUrl + 'ticker/' + lst[i].nome.replace("/", "_").toLowerCase();
                        $http.get(url)
                            .then(function successCallback(result) {
                                counter++;
                                for (var i = 0; i < Object.keys(result.data).length; i++) {
                                    var name = Object.keys(result.data)[i];
                                    var r = yobit.getObjectFromProperty('nome', name.replace('_', '/').toUpperCase(), lst);
                                    r.pedido = result.data[name].sell;
                                    r.ofertado = result.data[name].buy;
                                    r.volume = result.data[name].vol;
                                    variacaoCV:
                                    ((result.data[name].sell - result.data[name].buy)
                                        / (result.data[name].buy + 0.00000001)) * 100;
                                    if (counter == lst.length) {
                                        callback(lst);
                                    }
                                }
                            });
                    }
                });
        }

        return yobit;
    }
})();