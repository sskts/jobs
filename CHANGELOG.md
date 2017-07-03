# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased
### Added
- 各タスクの状態監視ジョブを新規作成。
- タスクの中止あるいはリトライジョブを新規作成。

### Changed
- 取引からタスクをエクスポートするように変更。具体的には、bin/watchClosedTransactionとbin/watchExpiredTransactionの調整。

### Deprecated

### Removed

### Fixed

### Security

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
