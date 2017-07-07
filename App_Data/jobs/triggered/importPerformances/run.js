"use strict";
/**
 * 劇場インポート
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
const debug = createDebug('sskts-jobs:*');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        // todo インポート期間調整
        const IMPORT_TERMS_IN_DAYS = 7;
        const theaterAdapter = sskts.adapter.theater(sskts.mongoose.connection);
        const filmAdapter = sskts.adapter.film(sskts.mongoose.connection);
        const screenAdapter = sskts.adapter.screen(sskts.mongoose.connection);
        const performanceAdapter = sskts.adapter.performance(sskts.mongoose.connection);
        const theaterIds = yield theaterAdapter.model.distinct('_id').exec();
        const promises = theaterIds.map((theaterId) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('importing performances...');
                yield sskts.service.master.importPerformances(theaterId, moment().format('YYYYMMDD'), moment().add(IMPORT_TERMS_IN_DAYS, 'days').format('YYYYMMDD'))(filmAdapter, screenAdapter, performanceAdapter);
                debug('performances imported.');
            }
            catch (error) {
                console.error(error);
            }
        }));
        yield Promise.all(promises);
        sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
