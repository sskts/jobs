/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:jobs');

/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;

async function main() {
    await sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const redisClient = sskts.redis.createClient({
        host: <string>process.env.REDIS_HOST,
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(<string>process.env.REDIS_PORT, 10),
        password: <string>process.env.ITEM_AVAILABILITY_REDIS_KEY,
        tls: { servername: <string>process.env.REDIS_HOST }
    });

    const itemAvailabilityRepository = new sskts.repository.itemAvailability.ScreeningEvent(redisClient);
    const sellerRepo = new sskts.repository.Seller(sskts.mongoose.connection);

    // update by branchCode
    const sellers = await sellerRepo.search({});
    const startFrom = moment()
        .toDate();
    const startThrough = moment()
        .add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks')
        .toDate();
    await Promise.all(sellers.map(async (seller) => {
        try {
            if (seller.location !== undefined && seller.location.branchCode !== undefined) {
                await sskts.service.itemAvailability.updateIndividualScreeningEvents(
                    seller.location.branchCode,
                    startFrom,
                    startThrough
                )({ itemAvailability: itemAvailabilityRepository });
                debug('item availability updated');
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    }));

    redisClient.quit();
    await sskts.mongoose.disconnect();
}

main()
    .then(() => {
        debug('success!');
    })
    .catch((err) => {
        // tslint:disable-next-line:no-console
        console.error(err);
        process.exit(1);
    });
