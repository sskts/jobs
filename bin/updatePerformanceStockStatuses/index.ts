/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as redis from 'redis';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:updatePerformanceStockStatuses');

async function main() {
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const redisClient = redis.createClient({
        host: process.env.STOCK_STATUS_REDIS_HOST,
        port: process.env.STOCK_STATUS_REDIS_PORT,
        password: process.env.STOCK_STATUS_REDIS_KEY,
        tls: { servername: process.env.TEST_REDIS_HOST }
    });

    const IMPORT_TERMS_IN_DAYS = 7;
    const theaterAdapter = sskts.adapter.theater(mongoose.connection);
    const performanceStockStatusAdapter = sskts.adapter.stockStatus.performance(redisClient);

    // 劇場ごとに更新する
    const dayStart = moment();
    const dayEnd = moment(dayStart).add(IMPORT_TERMS_IN_DAYS, 'days');
    const theaterIds = <string[]>await theaterAdapter.model.distinct('_id').exec();
    await Promise.all(theaterIds.map(async (theaterId) => {
        try {
            debug('updating performance stock statuses...');
            await sskts.service.stockStatus.updatePerformanceStockStatuses(
                theaterId,
                dayStart.format('YYYYMMDD'),
                dayEnd.format('YYYYMMDD')
            )(performanceStockStatusAdapter);
            debug('performance stock statuses updated');
        } catch (error) {
            console.error(error);
        }
    }));

    redisClient.quit();
    mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
