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
const mongoose = require("mongoose");
const redis = require("redis");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:updatePerformanceStockStatuses');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const redisClient = redis.createClient({
            host: process.env.STOCK_STATUS_REDIS_HOST,
            // tslint:disable-next-line:no-magic-numbers
            port: parseInt(process.env.STOCK_STATUS_REDIS_PORT, 10),
            password: process.env.STOCK_STATUS_REDIS_KEY,
            tls: { servername: process.env.TEST_REDIS_HOST }
        });
        const IMPORT_TERMS_IN_DAYS = 7;
        const theaterAdapter = sskts.adapter.theater(mongoose.connection);
        const performanceStockStatusAdapter = sskts.adapter.stockStatus.performance(redisClient);
        // 劇場ごとに更新する
        const dayStart = moment();
        const dayEnd = moment(dayStart).add(IMPORT_TERMS_IN_DAYS, 'days');
        const theaterIds = yield theaterAdapter.model.distinct('_id').exec();
        yield Promise.all(theaterIds.map((theaterId) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('updating performance stock statuses...');
                yield sskts.service.stockStatus.updatePerformanceStockStatuses(theaterId, dayStart.format('YYYYMMDD'), dayEnd.format('YYYYMMDD'))(performanceStockStatusAdapter);
                debug('performance stock statuses updated');
            }
            catch (error) {
                console.error(error);
            }
        })));
        redisClient.quit();
        mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
