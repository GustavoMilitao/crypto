(function () {
    'use strict';

    angular
        .module('app.cryptopia', [])
        .controller('CryptopiaController', CryptopiaController);

    function CryptopiaController($scope, $http, $timeout) {


        $scope.markets = [];

        $scope.opts = {
            baseUrl: 'https://www.cryptopia.co.nz/api/',
            apikey: 'APIKEY',
            apisecret: 'APISECRET',
            verbose: false,
            cleartext: false,
            stream: false
        };

        $scope.getObjectFromId = function (id, list) {
            var lst = $.grep(list, function (e) { return e.id == id; });
            if (lst.length > 0)
                return lst[0];
            return undefined;
        }

        $scope.getCountOfDatesFromDateArray = function (date, dates) {
            var returnDates = [];
            for (var i = 0; i < dates.length; i++) {
                if (dates[i] >= date) {
                    returnDates.push(dates[i]);
                }
            }
            return returnDates.length;
        }

        $scope.getCountOfDatesFromMinutes = function (dates, min) {
            var a = new Date();
            var dateAgo = new Date(a.getTime() - 1000 * 60 * min);
            return $scope.getCountOfDatesFromDateArray(dateAgo, dates);
        }

        $scope.ordenarVariacao = function () {
            $scope.markets.sort(firstBy("variacaoCV", -1)
                .thenBy("countUltimasTransacoes"), -1);
        }

        $scope.ordenarQuantidadeTransac = function () {
            $scope.markets.sort(firstBy("countUltimasTransacoes", -1)
                .thenBy("variacaoCV"), -1);
        }


        $scope.getUsableListFromMarkets = function (result) {
            var res = result.data.Data
                .filter(function (elem) {
                    return elem.Volume > 0
                }).map(function (s) {
                    return {
                        id: s.TradePairId,
                        nome: s.Label,
                        pedido: s.AskPrice,
                        ofertado: s.BidPrice,
                        variacaoCV: (((
                            parseFloat(
                                (s.AskPrice).toFixed(8)
                            ) - parseFloat((s.BidPrice).toFixed(8)))
                            / parseFloat((s.BidPrice + 0.00000001).toFixed(8))) * 100),
                        volume: parseFloat(s.Volume),
                        variacao: s.Change
                    };
                }).filter(function (elemento) {
                    return elemento.variacaoCV > 0;
                });
            return res;
        }

        $scope.getMarketWithLastTransactions =
            function (callback, result, count, min, byVariation) {
                var itemsProcessed = 0;
                result.forEach(function (elem) {
                    $scope.getmarkethistory(function (response) {
                        itemsProcessed++;
                        if (response.data && response.data.Data.length > 0) {
                            var id = response.data.Data[0].TradePairId;
                            var obj = $scope.getObjectFromId(id, result);
                            if (obj) {
                                response.data.Data.sort(firstBy("Timestamp", -1));
                                var ultimasTransacoes =
                                    response.data.Data.map(function (elem) {
                                        return new Date(elem.Timestamp * 1000);
                                    });
                                obj.CountUltimasTransacoes = $scope.getCountOfDatesFromMinutes(ultimasTransacoes, min);
                                obj.TransacaoMaisRecente = ultimasTransacoes[0].toLocaleDateString('pt-BR') + ' ' + ultimasTransacoes[0].toLocaleTimeString('pt-BR');
                            }
                            if (itemsProcessed == result.length) {
                                if (byVariation) {
                                    result.sort(firstBy("variacaoCV", -1)
                                        .thenBy("countUltimasTransacoes"), -1);
                                } else {
                                    result.sort(firstBy("countUltimasTransacoes", -1)
                                        .thenBy("variacaoCV"), -1);
                                }
                                result = result.slice(0, count);
                                result.sort(firstBy("variacaoCV", -1))
                                callback(result);
                            }
                        }
                    }, elem.nome, 1)
                });
            }

        $scope.getBestMarkets = function (callback, baseMarket, count, min, byVariation) {
            $scope.getmarkets(function (result) {
                var formattedList = $scope.getUsableListFromMarkets(result);
                $scope.getMarketWithLastTransactions(function (list) {
                    callback(list);
                }, formattedList, count, min, byVariation);
            }, baseMarket, 1);
        }


        // Starts Cryptopia
        $scope.getmarkets = function (callback, baseMarket, hours) {
            var url = $scope.opts.baseUrl + 'GetMarkets/';
            url = baseMarket ? url + baseMarket : url;
            if (baseMarket) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        // Starts Cryptopia
        $scope.getmarket = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrl + 'GetMarket/';
            url = marketSymbol ? url + marketSymbol : url;
            if (marketSymbol) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.getcurrencies = function (callback) {
            var url = $scope.opts.baseUrl + 'GetCurrencies';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.gettradepairs = function (callback) {
            var url = $scope.opts.baseUrl + 'GetTradePairs';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        $scope.getmarkethistory = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrl + 'GetMarketHistory/';
            url = marketSymbol ? url + marketSymbol.replace("/", "_") : url;
            if (marketSymbol) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.getmarketorders = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrl + 'GetMarketOrders/';
            url = marketSymbol ? url + marketSymbol.replace("/", "_") : url;
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        // Starts Private API - unfinished

        $scope.getbalances = function (callback) {
        }
        $scope.getbalance = function (options, callback) {
        }

        // End of calls

        // $scope.getData();
        $scope.getBestMarkets(function (result) {
            $scope.markets = result;
        }, "BTC", 20, 2, true);
    }
})();
