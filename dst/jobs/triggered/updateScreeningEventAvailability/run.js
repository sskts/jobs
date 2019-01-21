"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const moment = require("moment");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:jobs');
/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const redisClient = sskts.redis.createClient({
            host: process.env.REDIS_HOST,
            // tslint:disable-next-line:no-magic-numbers
            port: parseInt(process.env.REDIS_PORT, 10),
            password: process.env.ITEM_AVAILABILITY_REDIS_KEY,
            tls: { servername: process.env.REDIS_HOST }
        });
        const itemAvailabilityRepository = new sskts.repository.itemAvailability.IndividualScreeningEvent(redisClient);
        const organizationRepository = new sskts.repository.Organization(sskts.mongoose.connection);
        // update by branchCode
        const movieTheaters = yield organizationRepository.searchMovieTheaters({});
        const startFrom = moment()
            .toDate();
        const startThrough = moment()
            .add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks')
            .toDate();
        yield Promise.all(movieTheaters.map((movieTheater) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('updating item availability...branchCode:', movieTheater.location.branchCode, startFrom, startThrough);
                yield sskts.service.itemAvailability.updateIndividualScreeningEvents(movieTheater.location.branchCode, startFrom, startThrough)({ itemAvailability: itemAvailabilityRepository });
                debug('item availability updated');
            }
            catch (error) {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        })));
        redisClient.quit();
        yield sskts.mongoose.disconnect();
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
