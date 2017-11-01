# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security


## v4.0.2- 2017-11-01
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
