package controllers

import play.api._
import play.api.mvc._
import play.api.libs.iteratee._
import play.api.libs.oauth.{OAuthCalculator, ConsumerKey, RequestToken}
import play.api.libs.ws.WS
import scala.concurrent.ExecutionContext.Implicits.global

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }
  // initiate the broadcas, that will be used to push data
  val (enumerator,channel) = Concurrent.broadcast[String]

  // get you OAuth config from you twitter dev account : https://dev.twitter.com
  val requestToken = RequestToken("access token","access token secret")
  val consumerKey = ConsumerKey("consumer key","consumer secret")
  // make a get request to twitter streaming API
  WS.url("https://stream.twitter.com/1.1/statuses/filter.json?track=qsd")
    // no time out as it's an infinite stream ( we are talking big big data here ;) )
    .withRequestTimeout(-1)
    .sign(new OAuthCalculator(consumerKey, requestToken))
    // every time we get somthing from twitter we push it into our websocket channel
    .get { headers => Iteratee.foreach[Array[Byte]]( bytes => channel.push(new String(bytes))) }.map(_.run)
  /* this is how websockets work inside play framework: http://www.playframework.com/documentation/2.2.x/ScalaWebSockets
      * TL;DR:
      * in: Itratee = is a consumer you can use it to handle mssage sent from you clients
      * enumerator : Enumerator = is a message producer
     */
  def wsTweet = WebSocket.using[String] { request =>
    // do nothing when we got a websocket messae from one of the connected client
    val in = Iteratee.foreach[String]( msg => { () })
    (in, enumerator)
  }

}
