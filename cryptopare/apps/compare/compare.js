(function () {
    'use strict';

    angular
        .module('app.cryptopare', 
        ['app.cryptopare.cryptopia.service', 
        'app.cryptopare.yobit.service',
        'app.cryptopare.util.service',
        'app.cryptopare.binance.service'])
        .controller('CompareController', CompareController);

    function CompareController($scope, cryptopia, yobit, util, binance) {


        $scope.markets = [];

        $scope.ordenarCryptopiaYobit = function () {
            $scope.markets.sort(
                function(a, b){
                    return b.cryptopiaParayobit.variacao-a.cryptopiaParayobit.variacao;
                }
            );
        }

        $scope.ordenarYobitCryptopia = function () {
            $scope.markets.sort(function(a, b){
                return b.yobitParacryptopia.variacao-a.yobitParacryptopia.variacao;
            });
        }

        var cryptopiaList = [];
        var yobitList = [];
        cryptopia.getMarkets(function (list) {
            cryptopiaList = list.sort(firstBy('variacaoCV', -1));
            yobit.getMarkets(function(lst){
                $scope.markets = util.variationOfMarkets(cryptopiaList, yobitList, 'cryptopia','yobit');
                $scope.markets.sort(firstBy('variacaoCV', -1));
            }, 'btc');
        }, 'BTC');
    }
})();
