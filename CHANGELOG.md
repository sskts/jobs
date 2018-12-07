# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased

### Added

### Changed

- イベントのID属性を文字列型に変更
- 上映イベントインポートタスクを継続的ジョブへ変更

### Deprecated

### Removed

### Fixed

- イベントインポート処理のエラーハンドリング調整のために、複数劇場のインポート処理を直列実行に変更
- スケジュールXMLのschedule属性が未定義の場合にスケジュールの読み込みをスルーするように対応

### Security

## v6.1.1 - 2018-11-16

### Changed

- 劇場マスタ情報を組織へも反映するように変更。

## v6.1.0 - 2018-11-05

### Changed

- XML情報をMongoDBから読み込むように変更。

## v6.0.3 - 2018-10-11

### Changed

- 先行XML参照処理を追加

## v6.0.2 - 2018-10-08

### Changed

- update domain.
- Pecorino環境変数を調整。

## v6.0.1 - 2018-10-06

### Added

- ウェブフックトリガージョブを追加。

### Changed

- 複数のRedisCache接続環境変数を統合。
- 口座タイプを追加して、Pecorinoに指定するように変更。

## v6.0.0 - 2018-08-23

### Fixed

- スケジュールXML同期
- 退会処理
- 1ポイント追加

## v5.1.1 - 2018-06-09

### Fixed

- sskts-domain内でのエラーハンドラーを読み込むパスの間違いを修正。

### Added

- Pecorinoインセンティブ付与ジョブを追加。
- 中止取引に対する監視ジョブを追加。
- Pecorino返金ジョブを追加。
- Pecorino取引中止タスクを追加。
- Pecorinoインセンティブ返却ジョブを追加。
- 会員プログラム登録ジョブを追加。
- Pecorinoインセンティブ承認取消ジョブを追加。
- 会員プログラム登録解除ジョブを追加。

### Changed

- update packages.

## v5.0.2 - 2018-02-28
### Changed
- install sskts-domain@24.0.0.

## v5.0.1 - 2018-02-26
### Added
- Pecorino支払実行ジョブを追加。

## v5.0.0 - 2018-02-21
### Added
- 注文返品取引監視ジョブを追加。
- クレジットカード売上取消ジョブを追加。
- 注文返品処理ジョブを追加。
- 注文配送タスク監視ジョブを追加。
- Eメール送信アクションをパラメーターに持つ、新しいEメール送信タスク監視ジョブを追加。

### Changed
- 注文に対するタスク実行時にアクションを保管するように変更。
- アクションと取引に対して潜在アクション属性を定義。
- 注文取引確定後のアクションフローが、潜在アクションの指定通りに実行されるように変更。
- 承認アクションのobjectに型を定義し、purposeを取引型に変更。
- 注文の配送前後のステータス遷移を管理するように変更。

### Fixed
- COAからの上映イベント同期時に、COAにないイベントをキャンセルステータスへ変更する処理を追加。

## v4.0.5 - 2017-12-13
### Changed
- 確定取引に対する継続ジョブのインターバルを短縮。
- クレジットカードオーソリ取消ジョブがマルチインスタンスで動作しないように設定。

## v4.0.4 - 2017-12-06
### Fixed
- COA本予約時の予約金額パラメーターに注文の割引金額が含まれているバグを修正。

## v4.0.3 - 2017-11-21
### Changed
- 上映イベントの空席状況と、上映イベント自体のインポート期間を合わせるように調整。
- MovieTheaterインポート時にidentifierフィールドがセットされるように修正。

### Fixed
- COAの認証エラーが頻出するバグ対応として[sskts-domain](https://www.npmjs.com/package/@motionpicture/sskts-domain)をアップデート。

## v4.0.2 - 2017-11-01
### Changed
- COA本予約時に渡す電話番号から数字以外の文字列を除去。

## v4.0.1 - 2017-10-31
### Changed
- MongoDBのコレクションのいくつかのインデックスを追加。

## v4.0.0 - 2017-10-31
### Changed
- schema.orgを取り入れた新しいDBインターフェースでジョブを再構築。
- 上映イベントのインポート期間を先3カ月分に延長。

## v3.3.0 - 2017-07-10
### Added
- キュー仕様→タスク仕様の変更において整合性を保つためのジョブを一時的に追加

### Changed
- update package [@motionpicture/sskts-domain@22.0.0](https://www.npmjs.com/package/@motionpicture/sskts-domain)
- jobsからcmdファイルを削除し、全て直接jsファイルを実行するように変更。

### Removed
- キュー仕様前提の不要なジョブを削除。

### Security
- update package [tslint-microsoft-contrib@5.0.1](https://github.com/Microsoft/tslint-microsoft-contrib)
- update package [snyk@1.36.2](https://www.npmjs.com/package/snyk)
- update package [tslint@5.5.0](https://www.npmjs.com/package/tslint)
- update package [typescript@2.4.1](https://www.npmjs.com/package/typescript)

## v3.2.0 - 2017-07-04
### Added
- 各タスクの状態監視ジョブを新規作成。
- タスクの中止あるいはリトライジョブを新規作成。

### Changed
- 取引からタスクをエクスポートするように変更。具体的には、bin/watchClosedTransactionとbin/watchExpiredTransactionの調整。
- MongoDBのslow queriesレポートに対応してindexを追加。
- タスクや取引を監視させるインターバル時間(秒)を調整。1インスタンスあたりの頻度をやや下げる対応。

### Fixed
- タスク実行時のソート条件が間違っていたので修正。

## v3.1.0 - 2017-06-28
### Changed
- パフォーマンス在庫状況表現を空席率(%)に変更。
- package-lock.jsonを追加。

## v3.0.0 - 2017-06-19
### Removed
- 取引在庫準備ジョブが不要になったので削除。
- 取引クリーンジョブが不要になったので削除。

## v2.0.20 - 2017-04-20
### Added
- ファーストリリース
