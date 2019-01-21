/**
 * 取引キューエクスポートが実行中のままになっている取引を監視する
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions)
    .then(debug)
    // tslint:disable-next-line:no-console
    .catch(console.error);

let countRetry = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const transactionRepository = new sskts.repository.Transaction(sskts.mongoose.connection);
const RETRY_INTERVAL_MINUTES = 10;

setInterval(
    async () => {
        if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countRetry += 1;

        try {
            debug('reexporting tasks...');
            await transactionRepository.reexportTasks(RETRY_INTERVAL_MINUTES);
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }

        countRetry -= 1;
    },
    INTERVAL_MILLISECONDS
);
