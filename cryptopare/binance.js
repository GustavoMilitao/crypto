(function () {
    'use strict';

    angular
        .module('app.cryptopare.binance', [])
        .factory('binance', binance);

    function binance($http) {

        binance.baseUrl = 'https://api.binance.com/api/v1/';

        binance.getMarkets = function (callback) {
            var url = binance.baseUrl + 'ticker/24hr';
            $http.get(url)
                .then(function successCallbasck(result) {
                    var list = result.data.filter(function (e) {
                        return e.symbol.indexOf("BTC") >= 0 && e.volume > 0;
                    }).map(function (s) {
                        return {
                            nome: s.symbol.split("BTC").filter(function (elem) {
                                return elem && elem != '';
                            }) + "/BTC",
                            pedido: s.askPrice,
                            ofertado: s.bidPrice,
                            variacaoCV: (
                                (parseFloat(s.askPrice) - parseFloat(s.bidPrice))
                                / (parseFloat(s.bidPrice) + 0.00000001)) * 100,
                            volume: parseFloat(s.volume),
                            variacao: s.priceChangePercent
                        }
                    });
                    callback(list);
                });
        }

        return binance;
    }

})();