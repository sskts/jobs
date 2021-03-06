/**
 * 劇場インポート
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:jobs');

async function main() {
    debug('connecting mongodb...');
    await mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const sellerRepo = new sskts.repository.Seller(mongoose.connection);
    const placeRepo = new sskts.repository.Place(mongoose.connection);

    // 全劇場組織を取得
    const sellers = await sellerRepo.search({});

    for (const seller of sellers) {
        if (seller.location !== undefined && seller.location.branchCode !== undefined) {
            try {
                const branchCode = seller.location.branchCode;
                debug('importing movieTheater...', branchCode);
                await sskts.service.masterSync.importMovieTheater(branchCode)({
                    seller: sellerRepo,
                    place: placeRepo
                });
                debug('movieTheater imported', branchCode);
            } catch (error) {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        }
    }

    await mongoose.disconnect();
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
