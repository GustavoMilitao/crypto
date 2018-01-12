(function () {
    'use strict';

    angular
        .module('app.cryptopare', ['app.cryptopare.yobit.service'])
        .controller('YobitController', YobitController);

    function YobitController($scope, $http, $timeout, yobit) {


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

        yobit.getMarkets(function (list) {
            $scope.markets = list.sort(firstBy('variacaoCV', -1));
        }, 'BTC');
    }
})();
