(function () {
    'use strict';

    angular
        .module('app.cryptopare.yobit.service', ['app.cryptopare.util.service'])
        .factory('yobit', yobit);

    function yobit($http, $timeout, util) {

        yobit.baseUrl = 'https://yobit.net/api/3/';

        yobit.getMarkets = function (callback, baseMarket) {
            var url = yobit.baseUrl + 'info';
            var lst = [];
            $http.get(url)
                .then(function successCallback(result) {
                    lst = Object.keys(result.data.pairs).filter(function (e) {
                        return baseMarket ? e.indexOf(baseMarket.toLowerCase()) >= 0 : true;
                    }).map(function (elem) {
                        return {
                            nome: elem.replace("_", "/").toUpperCase()
                        };
                    });
                    var counter = 0;
                    var listOfLsts = util.split(lst,61);
                    for (var i = 0; i < listOfLsts.length; i++) {
                        var url = yobit.baseUrl + 'ticker/' + 
                        listOfLsts[i]
                        .map(function(elem){
                            return elem.nome.replace("/", "_").toLowerCase();
                        }).join('-');
                        $timeout(function(){
                        $http.get(url)
                            .then(function successCallback(result) {
                                counter++;
                                for (var i = 0; i < Object.keys(result.data).length; i++) {
                                    var name = Object.keys(result.data)[i];
                                    var r = util.getObjectFromProperty('nome', name.replace('_', '/').toUpperCase(), lst);
                                    r.pedido = result.data[name].sell;
                                    r.ofertado = result.data[name].buy;
                                    r.volume = result.data[name].vol;
                                    variacaoCV:
                                    ((result.data[name].sell - result.data[name].buy)
                                        / (result.data[name].buy + 0.00000001)) * 100;
                                }
                                if (counter == listOfLsts.length) {
                                    callback(lst);
                                }@
                            });
                        }, 10000);
                    }
                });
        }

        return yobit;
    }
})();