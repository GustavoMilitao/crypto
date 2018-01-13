(function () {
    'use strict';

    angular
        .module('app.cryptopare.cryptopia.service', ['app.cryptopare.util.service'])
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
                    var listWithNames = result.data.Data
                        .map(function (elem) {
                            return {
                                nome: elem.Label
                            }
                        });
                    var counter = 0;
                    var lst = [];
                    for (var i = 0; i < listWithNames.length; i++) {
                        var url = cryptopia.baseUrl + 'getMarket/' + listWithNames[i].nome.replace("/", "_");
                        $http.get(url)
                            .then(function (response) {
                                counter++;
                                if (response.data && response.data.Data.Volume > 0) {
                                    lst.push({
                                        nome: response.data.Data.Label,
                                        pedido: response.data.Data.AskPrice,
                                        ofertado: response.data.Data.BidPrice,
                                        variacaoCV:
                                            ((parseFloat(response.data.Data.AskPrice) 
                                            - parseFloat(response.data.Data.BidPrice))
                                                / (parseFloat(response.data.Data.BidPrice) + 0.00000001)) * 100,
                                        volume: parseFloat(response.data.Data.Volume),
                                        variacao: response.data.Data.Change
                                    });
                                }
                                if (counter == listWithNames.length) {
                                    callback(lst.filter(function(elem){return elem.volume > 0}));
                                }
                            });
                    }
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