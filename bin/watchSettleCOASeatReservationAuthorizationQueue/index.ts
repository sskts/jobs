/**
 * COA仮予約資産移動
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

(<any>mongoose).Promise = global.Promise;
mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 250;
const assetAdapter = sskts.adapter.asset(mongoose.connection);
const ownerAdapter = sskts.adapter.owner(mongoose.connection);
const performanceAdapter = sskts.adapter.performance(mongoose.connection);
const queueAdapter = sskts.adapter.queue(mongoose.connection);

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            // tslint:disable-next-line:max-line-length
            await sskts.service.queue.executeSettleCOASeatReservationAuthorization()(assetAdapter, ownerAdapter, performanceAdapter, queueAdapter);
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
