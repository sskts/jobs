/**
 * タスク中止
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

(<any>sskts.mongoose).Promise = global.Promise;
sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const RETRY_INTERVAL_MINUTES = 10;
const taskRepository = sskts.repository.task(sskts.mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await sskts.service.task.abort(RETRY_INTERVAL_MINUTES)(taskRepository);
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
