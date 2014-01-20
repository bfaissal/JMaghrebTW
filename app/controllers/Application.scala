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
  val (enumerator,channel) = Concurrent.broadcast[String]

  val requestToken = RequestToken("access token","access token secret")
  val consumerKey = ConsumerKey("consumer key","consumer secret")
  WS.url("https://stream.twitter.com/1.1/statuses/filter.json?track=qsd").withRequestTimeout(-1)
    .sign(new OAuthCalculator(consumerKey, requestToken))
    .get { headers => Iteratee.foreach[Array[Byte]]( bytes => channel.push(new String(bytes))) }.map(_.run)

  def wsTweet = WebSocket.using[String] { request =>
    val in = Iteratee.foreach[String]( msg => { () })
    (in, enumerator)
  }

}
