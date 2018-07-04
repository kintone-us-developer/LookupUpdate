/*
* Code based on example provided at: https://kintoneapp.com/blog/lookup_improvement/
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
  "use strict";

  var DEST_APP = 88;
  // 「従業員マスタ」アプリでのレコード編集画面保存時、レコード一覧編集画面保存時イベント
  kintone.events.on(['app.record.edit.submit', 'app.record.index.edit.submit'], function(event) {
  	var afterRecord = event.record;
  	var appId = kintone.app.getId();
  	var recId = event.recordId;

  	// まず、変更前のルックアップデータを取得する
  	kintone.api('/k/v1/record', 'GET', {app: appId, id: recId}, function(resp) {
  		var beforeRecord = resp.record;

  		// 次に、ルックアップ参照元（コピー先）の更新対象レコードを取得する
  		fetchRecords(DEST_APP.toString(), 'id = "' + beforeRecord.id.value + '"').then(function(records) {
  			var recCount = records.length;
  			var putCount = Math.ceil(recCount / 100);
  			for (var i = 0; i < putCount; i++) {
  				var offset = i * 100;
  				var limit = 100;
  				if (offset + limit > recCount) {
  					limit = recCount - offset;
  				}
  				var putLimit = limit + offset;

  				var editRecords = [];

  				// 更新対象レコードに更新後のデータを上書き
  				for (offset; offset < putLimit; offset++) {
  					var record = $.extend(true, {}, records[offset]);
  					var recNo = record['$id'].value;
  					delete record['$id'];
  					delete record['$revision'];
  					delete record['Record_number'];
  					delete record['Created_datetime'];
  					delete record['Created_by'];
  					delete record['Updated_datetime'];
  					delete record['Updated_by'];
  					record['id'] = afterRecord.id;
  					record['name'] = afterRecord.name;
  					editRecords.push({'id': recNo, 'record': record});
  				}

  				// 最後に更新処理
  				kintone.api('/k/v1/records', 'PUT', {app: DEST_APP, 'records': editRecords},
  						function(resp) {}
  				);
  			}
  		});
  	});

  	return event;
  });

  // 全件取得関数
  function fetchRecords(appId, query, opt_offset, opt_limit, opt_records) {
  	var offset = opt_offset || 0;
  	var limit = opt_limit || 100;
  	var allRecords = opt_records || [];
  	var params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
  	return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
  		allRecords = allRecords.concat(resp.records);
  		if (resp.records.length === limit) {
  			return fetchRecords(appId, query, offset + limit, limit, allRecords);
  		}
  		return allRecords;
  	});
  }
})(jQuery, kintone.$PLUGIN_ID);
