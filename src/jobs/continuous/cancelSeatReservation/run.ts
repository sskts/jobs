/**
 * COA仮予約キャンセル
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions)
    .then(debug)
    // tslint:disable-next-line:no-console
    .catch(console.error);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await sskts.service.task.executeByName(
                sskts.factory.taskName.CancelSeatReservation
            )({
                taskRepo: taskRepo,
                connection: sskts.mongoose.connection
            });
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
