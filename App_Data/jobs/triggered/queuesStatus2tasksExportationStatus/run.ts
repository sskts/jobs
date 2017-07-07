/**
 * キューステータスがtrueの取引のタスクエクスポートステータスをtrueに変更する
 * キュー仕様→タスク仕様の変更において整合性を保つためのジョブ
 * スケジュールはなしで、手動トリガー
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

async function main() {
    debug('connecting mongodb...');
    sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);
    const result = await transactionAdapter.transactionModel.update(
        {
            queues_status: 'EXPORTED',
            tasks_exportation_status: sskts.factory.transactionTasksExportationStatus.Unexported
        },
        {
            tasks_exportation_status: sskts.factory.transactionTasksExportationStatus.Exported
        }
    ).exec();
    console.error('result is', result);

    sskts.mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
