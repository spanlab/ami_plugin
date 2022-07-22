console.log("this is running?");

chrome.browserAction.onClicked.addListener(widgetClick);

function widgetClick(tab) {
	console.log("widget clicked");
	// let msg = {
	// 	txt:"hello"
	// }
	// chrome.tabs.sendMessage(tab.id, msg);
	console.log(tab.url);
	// let tweet_url = {
	// 	txt:tab.url
	// }
	var tweet_url = tab.url
	chrome.tabs.sendMessage(tab.id, tweet_url+'&');

}