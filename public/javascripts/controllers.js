angular.module('jmaghreb',[]).factory('WSocket', ['$rootScope','$location', function ($rootScope,$location) {
    var WSocket = {};
    WSocket.ws = new WebSocket('ws://'+$location.host()+':'+$location.port()+'/wsTweet');
    WSocket.ws.onopen = function(){
        console.log("Socket has been opened!");
    };
    WSocket.ws.onmessage = function(message) {
        $rootScope.$apply(function(){
            $rootScope.addTweet(JSON.parse(message.data))
            console.log("Socket = "+JSON.parse(message.data))
        })
    };
    return WSocket;
}]);

angular.module('jmaghreb').
    filter('fromNow', function() {
        return function(dateString) {
            return moment(new Date(dateString)).fromNow()
        };
    });
	


function tweetWall($scope,$rootScope,WSocket,$location){
    $rootScope.tweets = []
    $scope.showTweets = false
    $rootScope.addTweet = function(data){
        $rootScope.tweets.unshift( data)
        $scope.showTweets = true
        if($rootScope.tweets.length > 5 ){
            $rootScope.tweets.pop()
        }
    }
}

