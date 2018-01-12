(function () {
    'use strict';

    angular
        .module('app.cryptopare.cryptopia', ['app.cryptopare.util'])
        .factory('cryptopia', cryptopia);

    function cryptopia(util, $http) {

        cryptopia.baseUrl = 'https://www.cryptopia.co.nz/api/';

        cryptopia.getMarkets = function (callback, baseMarket, hours) {
            var url = cryptopia.baseUrl + 'getMarkets/';
            url = baseMarket ? url + baseMarket : url;
            if (baseMarket) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    var list = result.data.Data
                        .filter(function (elem) {
                            return elem.Volume > 0
                        }).map(function (s) {
                            return {
                                nome: s.Label,
                                pedido: s.AskPrice,
                                ofertado: s.BidPrice,
                                variacaoCV:
                                    ((parseFloat(s.AskPrice) - parseFloat(s.BidPrice))
                                        / (parseFloat(s.BidPrice) + 0.00000001)) * 100,
                                volume: parseFloat(s.Volume),
                                variacao: s.Change
                            }
                        });
                    callback(list);
                });
        }

        cryptopia.getMarket = function (callback, marketSymbol, hours) {
            var url = cryptopia.baseUrl + 'GetMarket/';
            url = marketSymbol ? url + marketSymbol : url;
            if (marketSymbol) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        cryptopia.getTradePairs = function (callback) {
            var url = cryptopia.baseUrl + 'GetTradePairs';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        cryptopia.getCurrencies = function (callback) {
            var url = cryptopia.baseUrl + 'GetCurrencies';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        cryptopia.getMarketOrders = function (callback, marketSymbol, hours) {
            var url = cryptopia.baseUrl + 'GetMarketOrders/';
            url = marketSymbol ? url + marketSymbol.replace("/", "_") : url;
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        cryptopia.getMarketHistory = function (callback, marketSymbol, hoursHistory) {
            var url = cryptopia.baseUrl + 'GetMarketHistory/';
            url = marketSymbol ? url + marketSymbol.replace("/", "_") : url;
            if (marketSymbol) {
                url = hoursHistory ? url + '/' + hoursHistory : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        cryptopia.getBestMarkets = function (callback, baseMarket, hoursHistory, howManyMinutesAgo) {
            cryptopia.getMarkets(function (result) {
                var itemsProcessed = 0;
                result.forEach(function (elem) {
                    cryptopia.getMarketHistory(function (response) {
                        itemsProcessed++;
                        if (response.data && response.data.Data.length > 0) {
                            var obj = util.getObjectFromProperty(
                                'id',
                                response.data.Data[0].TradePairId,
                                result);
                            if (obj) {
                                response.data.Data.sort(firstBy("Timestamp", -1));
                                var ultimasTransacoes =
                                    response.data.Data.map(function (elem) {
                                        return new Date(elem.Timestamp * 1000);
                                    });
                                obj.countUltimasTransacoes = util.getCountOfDatesFromMinutes(ultimasTransacoes, howManyMinutesAgo);
                                obj.transacaoMaisRecente = ultimasTransacoes[0].toLocaleDateString('pt-BR') + ' ' + ultimasTransacoes[0].toLocaleTimeString('pt-BR');
                            }
                            if (itemsProcessed == result.length) {
                                callback(result);
                            }
                        }
                    },
                        elem.nome,
                        hoursHistory)
                });
            },
                baseMarket,
                hoursHistory);
        }

        return cryptopia;
    }
})();