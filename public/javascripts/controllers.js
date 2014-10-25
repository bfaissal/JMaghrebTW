angular.module('jmaghreb',['ngSanitize']).factory('WSocket', ['$rootScope','$location', function ($rootScope,$location) {
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

	//filter to linkify link in text
angular.module('jmaghreb').filter('parseUrlFilter', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return function (text) {
        return text.replace(urlPattern, '<a href="$&">$&</a>');
    };
});


//filter to linkify #hashtags and @mention texts
var app = angular.module('jmaghreb');

app.filter('tweetLinky',['$filter',
    function($filter) {
        return function(text, target) {
            if (!text) return text;

            var replacedText = $filter('linky')(text, target);

            var targetAttr = "";
            if (angular.isDefined(target)) {
                targetAttr = ' target="' + target + '"';
            }

            // replace #hashtags and send them to twitter
            var replacePattern1 = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = text.replace(replacePattern1, '$1<a href="https://twitter.com/search?q=%23$2"' + targetAttr + '>#$2</a>');

            // replace @mentions but keep them to our site
            var replacePattern2 = /(^|\s)\@(\w*[a-zA-Z_]+\w*)/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="https://twitter.com/$2"' + targetAttr + '>@$2</a>');

            return replacedText;
        };

    }
]);
