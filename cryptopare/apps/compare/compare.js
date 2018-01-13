(function () {
    'use strict';

    angular
        .module('app.cryptopare', 
        ['app.cryptopare.cryptopia.service', 
        'app.cryptopare.yobit.service',
        'app.cryptopare.util.service'])
        .controller('CompareController', CompareController);

    function CompareController($scope, cryptopia, yobit, util) {


        $scope.markets = [];

        var cryptopiaList = [];
        var yobitList = [];
        cryptopia.getMarkets(function (list) {
            cryptopiaList = list.sort(firstBy('variacaoCV', -1));
            yobit.getMarkets(function(lst){
                yobitList = lst.sort(firstBy('variacaoCV', -1));
                $scope.markets = util.variationOfMarkets(cryptopiaList, yobitList, 'cryptopia','yobit');
                $scope.markets.sort(firstBy('variacaoCV', -1));
            }, 'btc');
        }, 'BTC');
    }
})();
