(function () {
    'use strict';

    angular
        .module('app.cryptopare', ['app.cryptopare.binance.service'])
        .controller('BinanceController', BinanceController);

    function BinanceController($scope, $http, $timeout, binance) {


        $scope.markets = [];


        // Screen
        $scope.ordenarVariacao = function () {
            $scope.markets.sort(firstBy("variacaoCV", -1)
                .thenBy("countUltimasTransacoes"), -1);
        }

        $scope.ordenarQuantidadeTransac = function () {
            $scope.markets.sort(firstBy("countUltimasTransacoes", -1)
                .thenBy("variacaoCV"), -1);
        }

        // Tests

        binance.getMarkets(function (list) {
            $scope.markets = list.sort(firstBy('variacaoCV', -1));
        }, 'BTC');
    }
})();
