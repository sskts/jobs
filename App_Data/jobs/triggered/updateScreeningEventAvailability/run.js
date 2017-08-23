"use strict";
/**
 * パフォーマンス空席状況を更新する
 * COA空席情報から空席状況を生成してredisに保管する
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const moment = require("moment");
const mongooseConnectionOptions_1 = require("../../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:updateScreeningEventAvailability');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const redisClient = sskts.redis.createClient({
            host: process.env.STOCK_STATUS_REDIS_HOST,
            // tslint:disable-next-line:no-magic-numbers
            port: parseInt(process.env.STOCK_STATUS_REDIS_PORT, 10),
            password: process.env.STOCK_STATUS_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
        const IMPORT_TERMS_IN_DAYS = 7;
        const placeAdapter = sskts.adapter.place(sskts.mongoose.connection);
        const performanceStockStatusAdapter = sskts.adapter.itemAvailability.individualScreeningEvent(redisClient);
        // update by branchCode
        const dayStart = moment();
        const dayEnd = moment(dayStart).add(IMPORT_TERMS_IN_DAYS, 'days');
        const branchCodes = yield placeAdapter.placeModel.distinct('branchCode').exec();
        yield Promise.all(branchCodes.map((branchCode) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('updating item availability...branchCode:', branchCode, dayStart.format('YYYYMMDD'), dayEnd.format('YYYYMMDD'));
                yield sskts.service.itemAvailability.updatePerformanceStockStatuses(branchCode, dayStart.format('YYYYMMDD'), dayEnd.format('YYYYMMDD'))(performanceStockStatusAdapter);
                debug('item availability updated');
            }
            catch (error) {
                console.error(error);
            }
        })));
        redisClient.quit();
        sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
