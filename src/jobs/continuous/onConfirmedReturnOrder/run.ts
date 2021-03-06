/**
 * 確定注文返品取引監視
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions)
    .then(debug)
    // tslint:disable-next-line:no-console
    .catch(console.error);

let countExecute = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepo = new sskts.repository.Task(mongoose.connection);
const transactionRepository = new sskts.repository.Transaction(mongoose.connection);

setInterval(
    async () => {
        if (countExecute > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        countExecute += 1;

        try {
            debug('exporting tasks...');
            await sskts.service.transaction.returnOrder.exportTasks(
                sskts.factory.transactionStatusType.Confirmed
            )({
                task: taskRepo,
                transaction: transactionRepository
            });
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }

        countExecute -= 1;
    },
    INTERVAL_MILLISECONDS
);
