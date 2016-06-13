var app = angular.module('app', ['euTree.directive']);

var controller = treeApp.controller('controller', function($scope, $http) {
    $scope.list = [];
    $http.get('/tree').then(function(response) {
        $scope.list = [response.data];
    });
    $scope.$watch('selectedPath', function() {
        console.log($scope.selectedPath);
        $scope.error = "";
    });
    $scope.sync = function() {
        if(!$scope.selectedPath) {
            $scope.error = "Please select a directory from the directory tree";
        }
        else {
            async.series([
                function(callback){
                    $scope.message = "Uploading data to Pi";
                    $http.get('/api/upload?path=' + $scope.selectedPath).then(function(response) {
                        $scope.message = "New data uploaded from pendrive to Pi";
                        callback(null, 'one');
                    }).catch(function(response) {
                        callback(response, null);
                    });
                },
                function(callback){
                    $scope.message = "Syncing database to Pi";
                    $http.get('/api/syncdb?path=' + $scope.selectedPath).then(function(response) {
                        $scope.message = "Database synced";
                        callback(null, 'two');
                    }).catch(function(response) {
                        callback(response, null);
                    })
                },
                function(callback){
                    $scope.message = "Downloading Pi database to pendrive";
                    $http.get('/api/download?path=' + $scope.selectedPath).then(function(response) {
                        $scope.message = "Database downloaded";
                        callback(null, 'three');
                    }).catch(function(response) {
                        callback(response, null);
                    })
                },
                function(callback){
                    $scope.message = "Restarting the server. Refresh the page in 30 secs";
                    $http.get('/api/restart').then(function(response) {
                        $scope.message = "Server restarted. This message should never get displayed on the screen though";
                        callback(null, 'four');
                    }).catch(function(response) {
                        callback(response, null);
                    })
                }
            ],
            // optional callback
            function(err, results){
                // results is now equal to ['one', 'two']
            });

        }
    }
})
