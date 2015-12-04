/*
 * News feed module.
 * Feed info should be configured in a appConfig angular constant
 * All feeds are expected to be public.
 *
 * E.g.
 *
 * angular.constant('appModule', {
 *   news: {
 *     // The URL to the rss feed
 *     feedUrl: "https://feeds.myrss.com/feed.xml",
 *     // The key in the response that contains an array of news items,
 *     // Leave this as default for Google XML to JSON-converted feed
 *     entriesKey: "responseData.feed.entries",
 *     // The key for each news item's title
 *     titleKey: "title",
 *     // The key for each news item's short descrition (subtitle)
 *     contentKey: "contentSnippet",
 *     // The key for each news item's link that is opened when tapping the item
 *     linkKey: "link"
 *   }
 * });
 *
 * This module requires the shared module to work.
 */

var MODULE_NAME = 'news';
module.exports = MODULE_NAME;

angular.module(MODULE_NAME, [])

.controller('NewsController', require('./news.ctrl.js'));
