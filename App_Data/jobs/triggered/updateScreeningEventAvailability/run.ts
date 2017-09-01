/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:updateScreeningEventAvailability');

async function main() {
    sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const redisClient = sskts.redis.createClient({
        host: <string>process.env.ITEM_AVAILABILITY_REDIS_HOST,
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(<string>process.env.ITEM_AVAILABILITY_REDIS_PORT, 10),
        password: <string>process.env.ITEM_AVAILABILITY_REDIS_KEY,
        tls: { servername: <string>process.env.ITEM_AVAILABILITY_REDIS_HOST }
    });

    const IMPORT_TERMS_IN_DAYS = 7;
    const placeRepository = sskts.repository.place(sskts.mongoose.connection);
    const itemAvailabilityRepository = sskts.repository.itemAvailability.individualScreeningEvent(redisClient);

    // update by branchCode
    const dayStart = moment();
    const dayEnd = moment(dayStart).add(IMPORT_TERMS_IN_DAYS, 'days');
    const branchCodes = <string[]>await placeRepository.placeModel.distinct('branchCode').exec();
    await Promise.all(branchCodes.map(async (branchCode) => {
        try {
            debug('updating item availability...branchCode:', branchCode, dayStart.format('YYYYMMDD'), dayEnd.format('YYYYMMDD'));
            await sskts.service.itemAvailability.updatePerformanceStockStatuses(
                branchCode,
                dayStart.format('YYYYMMDD'),
                dayEnd.format('YYYYMMDD')
            )(itemAvailabilityRepository);
            debug('item availability updated');
        } catch (error) {
            console.error(error);
        }
    }));

    redisClient.quit();
    sskts.mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
