(function () {
    'use strict';

    angular
        .module('app.cryptopare', ['app.cryptopare.cryptopia', 'app.cryptopare.binance'])
        .controller('CryptopareController', CryptopareController);

    function CryptopareController($scope, $http, $timeout, cryptopia, binance) {


        $scope.markets = [];

        $scope.opts = {
            baseUrlCryptopia: 'https://www.cryptopia.co.nz/api/',
            baseUrlBinance: 'https://www.binance.com/api/v1/',
            baseUrlYobit: 'https://yobit.net/api/3/',
        };


        // Screen
        $scope.ordenarVariacao = function () {
            $scope.markets.sort(firstBy("variacaoCV", -1)
                .thenBy("countUltimasTransacoes"), -1);
        }

        $scope.ordenarQuantidadeTransac = function () {
            $scope.markets.sort(firstBy("countUltimasTransacoes", -1)
                .thenBy("variacaoCV"), -1);
        }

        $scope.getUsableListFromMarketsYobit = function (callback, lst) {
            // var url = $scope.opts.baseUrlYobit + 'ticker/' + lst[0].nome.replace("/", "_").toLowerCase();
            // for (var i = 1; i < lst.length; i++) {
            //     url += "-" + lst[i].nome.replace("/", "_").toLowerCase();

            // }
            var counter = 0;
            for (var i = 0; i < lst.length; i++) {
                // url += '?ignore_invalid=1';
                var url = $scope.opts.baseUrlYobit + 'ticker/' + lst[i].nome.replace("/", "_").toLowerCase();
                $http.get(url)
                    .then(function successCallback(result) {
                        counter++;
                        for (var i = 0; i < Object.keys(result.data).length; i++) {
                            var name = Object.keys(result.data)[i];
                            var r = $scope.getObjectFromProperty('nome', name.replace('_', '/').toUpperCase(), lst);
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
        }

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



        $scope.getMarketsYobit = function (callback) {
            var url = $scope.opts.baseUrlYobit + 'info';
            $http.get(url)
                .then(function successCallback(result) {
                    var r = Object.keys(result.data.pairs).filter(function (e) {
                        return e.indexOf("btc") >= 0;
                    }).map(function (elem) {
                        return {
                            nome: elem.replace("_", "/").toUpperCase()
                        };
                    });
                    // r = $scope.getUsableListFromMarketsYobit(callback, r);
                    callback(r);
                });
        }

        $scope.getCommonMarkets = function (callback) {
            var binanceM = [];
            var cryptopiaM = [];
            $scope.getMarketsBinance(function (r) {
                binanceM = r;
                $scope.getMarketsCryptopia(function (result) {
                    cryptopiaM = $scope.getUsableListFromMarketsCryptopia(result);
                    cryptopiaM = result.data.Data.map(function (elem) {
                        return elem.Label
                    });
                    var ret = binanceM.filter(function (n) {
                        return cryptopiaM.indexOf(n.nome) > -1;
                    }).map(function (elem) {
                        return {
                            nome: elem.nome,
                            cryptopiaParaBinance:
                                (($scope.getObjectFromProperty('nome', elem.nome, binanceM).ofertado
                                    - elem.pedido) / elem.pedido) * 100,
                            binanceParaCriptopia:
                                ((elem.pedido -
                                    $scope.getObjectFromProperty('nome', elem.nome, binanceM).ofertado) /
                                    $scope.getObjectFromProperty('nome', elem.nome, binanceM).ofertado) * 100
                        }
                    });
                    callback(ret);
                }, 'BTC');
            })
        }

        // $scope.getCommonMarketsYobit = function (callback) {
        //     var binanceM = [];
        //     var cryptopiaM = [];
        //     $scope.getMarketsYobit(function (r) {
        //         binanceM = r;
        //         $scope.getMarketsCryptopia(function (result) {
        //             cryptopiaM = $scope.getUsableListFromMarketsCryptopia(result);
        //             cryptopiaM = result.data.Data.map(function (elem) {
        //                 return elem.Label
        //             });
        //             var ret = binanceM.filter(function (n) {
        //                 return cryptopiaM.indexOf(n.nome) > -1;
        //             }).map(function (elem) {
        //                 return {
        //                     nome: elem.nome,
        //                 }
        //             });
        //             callback(ret);
        //         }, 'BTC');
        //     })
        // }

        $scope.getCommonMarketsYobit = function (callback, lst) {
            var cryptopiaM = [];
            $scope.getMarketsYobit(function (r) {
                lst = r;
                $scope.getMarketsCryptopia(function (result) {
                    cryptopiaM = $scope.getUsableListFromMarketsCryptopia(result);
                    cryptopiaM = result.data.Data.map(function (elem) {
                        return elem.Label
                    });
                    var ret = lst.filter(function (n) {
                        return cryptopiaM.indexOf(n.nome) > -1;
                    }).map(function (elem) {
                        return {
                            nome: elem.nome,
                            cryptopiaParaYobit:
                                (($scope.getObjectFromProperty('nome', elem.nome, lst).ofertado
                                    - elem.pedido) / elem.pedido) * 100,
                            yobitParaCriptopia:
                                ((elem.pedido -
                                    $scope.getObjectFromProperty('nome', elem.nome, lst).ofertado) /
                                    $scope.getObjectFromProperty('nome', elem.nome, lst).ofertado) * 100

                        }
                    });
                    callback(ret);
                }, 'BTC');
            });
        }

        // Tests

        // cryptopia.getBestMarkets(function (list) {
        //     $scope.markets = list.sort(firstBy('variacaoCV', -1));
        // });

        binance.getMarkets(function (list) {
            $scope.markets = list.sort(firstBy('variacaoCV', -1));
        });
    }
})();
