(function () {
    'use strict';

    angular
        .module('app.cryptopare', ['app.cryptopare.cryptopia.service',
            'app.cryptopare.util.service'])
        .controller('CryptopiaController', CryptopiaController);

    function CryptopiaController($scope, $http, $timeout, cryptopia, util) {

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

        // cryptopia.getMarkets(function (list) {
        //     var a = list.sort(firstBy('variacaoCV', -1));
        //     console.log(cryptopia.variationOfBaseMarkets(a));
        // });

        cryptopia.getBestMarkets(function (list) {
            $scope.markets = list.sort(firstBy('variacaoCV', -1));
        });
    }
})();
