(function () {
    'use strict';

    angular
        .module('app.cryptopare', ['app.cryptopare.cryptopia.service'])
        .controller('CryptopiaController', CryptopiaController);

    function CryptopiaController($scope, $http, $timeout, cryptopia) {

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

        cryptopia.getBestMarkets(function (list) {
            $scope.markets = list.sort(firstBy('variacaoCV', -1));
        }, 'BTC');
    }
})();
