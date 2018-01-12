(function () {
    'use strict';

    angular
        .module('app.cryptopare', [])
        .controller('CryptopareController', CryptopareController);

    function CryptopareController($scope, $http, $timeout) {


        $scope.markets = [];

        $scope.opts = {
            baseUrlCryptopia: 'https://www.cryptopia.co.nz/api/',
            baseUrlBinance: 'https://www.binance.com/api/v1/',
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

        $scope.getObjectFromSymbol = function (symbol, list) {
            var lst = $.grep(list, function (e) { return e.symbol == symbol; });
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


        $scope.getUsableListFromMarketsCryptopia = function (result) {
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
                    }
                });
            return res;
        }

        $scope.getUsableListFromMarketsBinance = function (result) {
            var res = result
                .filter(function (elem) {
                    return elem.Volume > 0
                }).map(function (s) {
                    return {
                        nome: s.symbol.split("BTC").filter(function (elem) {
                            return elem && elem != '';
                        }).join("/BTC"),
                        pedido: s.askPrice,
                        ofertado: s.bidPrice,
                        variacaoCV: (((
                            parseFloat(
                                (s.askPrice).toFixed(8)
                            ) - parseFloat((s.bidPrice).toFixed(8)))
                            / parseFloat((s.bidPrice + 0.00000001).toFixed(8))) * 100),
                        volume: parseFloat(s.volume),
                        variacao: s.priceChangePercent
                    }
                });

            return res;
        }

        $scope.getMarketWithLastTransactionsCryptopia =
            function (callback, result, count, min, byVariation) {
                var itemsProcessed = 0;
                result.forEach(function (elem) {
                    $scope.getMarketHistoryCryptopia(function (response) {
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
                                obj.countUltimasTransacoes = $scope.getCountOfDatesFromMinutes(ultimasTransacoes, min);
                                obj.transacaoMaisRecente = ultimasTransacoes[0].toLocaleDateString('pt-BR') + ' ' + ultimasTransacoes[0].toLocaleTimeString('pt-BR');
                            }
                            if (itemsProcessed == result.length) {
                                if (byVariation) {
                                    result.sort(firstBy("variacaoCV", -1)
                                        .thenBy("countUltimasTransacoes"), -1);
                                } else {
                                    result.sort(firstBy("countUltimasTransacoes", -1)
                                        .thenBy("variacaoCV"), -1);
                                }
                                if (count) {
                                    result = result.slice(0, count);
                                }
                                result.sort(firstBy("variacaoCV", -1))
                                callback(result);
                            }
                        }
                    }, elem.nome, 1)
                });
            }

        $scope.getBestMarketsCryptopia = function (callback, baseMarket, count, min, byVariation) {
            $scope.getMarketsCryptopia(function (result) {
                var formattedList = $scope.getUsableListFromMarketsCryptopia(result);
                $scope.getMarketWithLastTransactionsCryptopia(function (list) {
                    callback(list);
                }, formattedList, count, min, byVariation);
            }, baseMarket, 1);
        }


        // Starts Cryptopia
        $scope.getMarketsCryptopia = function (callback, baseMarket, hours) {
            var url = $scope.opts.baseUrlCryptopia + 'getMarkets/';
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
        $scope.getMarketCryptopia = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrlCryptopia + 'GetMarket/';
            url = marketSymbol ? url + marketSymbol : url;
            if (marketSymbol) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.getCurrenciesCryptopia = function (callback) {
            var url = $scope.opts.baseUrlCryptopia + 'GetCurrencies';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.getTradePairsCryptopia = function (callback) {
            var url = $scope.opts.baseUrlCryptopia + 'GetTradePairs';
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }

        $scope.getMarketHistoryCryptopia = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrlCryptopia + 'GetMarketHistory/';
            url = marketSymbol ? url + marketSymbol.replace("/", "_") : url;
            if (marketSymbol) {
                url = hours ? url + '/' + hours : url;
            }
            $http.get(url)
                .then(function successCallback(result) {
                    callback(result);
                });
        }
        $scope.getMarketOrdersCryptopia = function (callback, marketSymbol, hours) {
            var url = $scope.opts.baseUrlCryptopia + 'GetMarketOrders/';
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


        // $scope.getObjectFromSymbol = function (symbol, list) {
        //     var lst = $.grep(list, function (e) { return e.symbol == symbol; });
        //     if (lst.length > 0)
        //         return lst[0];
        //     return undefined;
        // }

        // $scope.getFormatedBinanceMarketsWithPrice = function(callback, markets){
        //     var url = $scope.opts.baseUrlBinance + 'depth';
        //     var prices = [];
        //     var counter = 0;
        //     for(var i = 0; i < markets.length; i++){
        //         counter++;
        //         var symbol = markets[i].symbol;
        //         $http.get(url + '?symbol=' + symbol +'&limit='+5)
        //         .then(function(response){
        //             prices.push({
        //                 precoPedido : response.data.asks[0],
        //                 precoOfertado : response.data.bids[0]
        //             });
        //             if(counter == markets.length){
        //                 for(var j = 0; j < markets.length; j++){
        //                     markets[j].precoPedido = prices[j].precoPedido;
        //                     markets[j].precoOfertado = prices[j].precoOfertado;
        //                 }
        //                 callback(markets);
        //             }
        //         });
        //     }
        // }

        $scope.getMarketsBinance = function (callback) {
            var url = $scope.opts.baseUrlBinance + 'ticker/24hr';
            $http.get(url)
                .then(function successCallback(result) {
                    var r = result.data.symbols.filter(function (e) {
                        return e.symbol.indexOf("BTC") >= 0;
                    });
                    $scope.getUsableListFromMarketsBinance(r);
                    callback(r);
                });
        }

        $scope.getCommonMarkets = function (callback) {
            var binanceM = [];
            var cryptopiaM = [];
            $scope.getMarketsBinance(function (r) {
                binanceM = r;
                $scope.getMarketsCryptopia(function (result) {
                    cryptopiaM = result.data.Data.map(function (elem) {
                        return elem.Label
                    });
                    var ret = binanceM.filter(function (n) {
                        return cryptopiaM.indexOf(n.nome) > -1;
                    });
                    callback(ret);
                }, 'BTC');
            })
        }





        // $scope.getData();
        $scope.getBestMarketsCryptopia(function (result) {
            $scope.markets = result;
        }, "BTC", undefined, 2);
        // $scope.getMarketsBinance(function (result) {
        //     console.log(result);
        // });
        // $scope.getCommonMarkets(function (result) {
        //     // console.log(result);
        //     $scope.markets = result;
        // });
    }
})();
