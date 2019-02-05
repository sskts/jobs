/**
 * 上映イベントインポートタスク作成
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';
import * as mongoose from 'mongoose';

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
    debug('connecting mongodb...');
    await mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const placeRepo = new sskts.repository.Place(mongoose.connection);
    const sellerRepo = new sskts.repository.Seller(mongoose.connection);
    const taskRepo = new sskts.repository.Task(mongoose.connection);

    // 全劇場組織を取得
    const sellers = await sellerRepo.search({});
    const movieTheaters = await placeRepo.searchMovieTheaters({});
    const importFrom = moment()
        .toDate();
    const importThrough = moment(importFrom)
        .add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks')
        .toDate();
    const runsAt = new Date();

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            const branchCode = movieTheater.branchCode;
            const seller = sellers.find((m) => {
                return m.location !== undefined
                    && m.location.branchCode !== undefined
                    && m.location.branchCode === branchCode;
            });

            if (seller !== undefined) {
                let xmlEndPoint: any;
                if (Array.isArray((<any>seller).additionalProperty)) {
                    const xmlEndPointProperty = (<any>seller).additionalProperty.find(((p: any) => {
                        return p.name === 'xmlEndPoint';
                    }));
                    xmlEndPoint = (xmlEndPointProperty !== undefined) ? JSON.parse(xmlEndPointProperty.value) : undefined;
                }

                const taskAttributes: sskts.factory.task.IAttributes<sskts.factory.taskName.ImportScreeningEvents> = {
                    name: sskts.factory.taskName.ImportScreeningEvents,
                    status: sskts.factory.taskStatus.Ready,
                    runsAt: runsAt,
                    remainingNumberOfTries: 1,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        locationBranchCode: branchCode,
                        importFrom: importFrom,
                        importThrough: importThrough,
                        xmlEndPoint: xmlEndPoint
                    }
                };
                await taskRepo.save(taskAttributes);
                debug('task saved', movieTheater.branchCode);
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    }));

    await new Promise((resolve) => {
        setTimeout(
            async () => {
                await mongoose.disconnect();
                resolve();
            },
            // tslint:disable-next-line:no-magic-numbers
            10000
        );
    });
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
