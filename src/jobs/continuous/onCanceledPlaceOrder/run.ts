/**
 * 中止注文取引監視
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions).then(debug).catch(console.error);

let countExecute = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepository = new sskts.repository.Task(sskts.mongoose.connection);
const transactionRepository = new sskts.repository.Transaction(sskts.mongoose.connection);

setInterval(
    async () => {
        if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countExecute += 1;

        try {
            debug('exporting tasks...');
            await sskts.service.transaction.placeOrder.exportTasks(
                sskts.factory.transactionStatusType.Canceled
            )({
                task: taskRepository,
                transaction: transactionRepository
            });
        } catch (error) {
            console.error(error.message);
        }

        countExecute -= 1;
    },
    INTERVAL_MILLISECONDS
);
