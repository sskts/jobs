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
 * 映画作品インポート
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:jobs');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        yield mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const creativeWorkRepository = new sskts.repository.CreativeWork(mongoose.connection);
        const sellerRepo = new sskts.repository.Seller(mongoose.connection);
        // 全劇場組織を取得
        const sellers = yield sellerRepo.search({});
        // 劇場ごとに映画作品をインポート
        for (const seller of sellers) {
            if (seller.location !== undefined && seller.location.branchCode !== undefined) {
                try {
                    const branchCode = seller.location.branchCode;
                    debug('importing movies...', branchCode);
                    yield sskts.service.masterSync.importMovies(branchCode)({ creativeWork: creativeWorkRepository });
                    debug('movies imported', branchCode);
                }
                catch (error) {
                    // tslint:disable-next-line:no-console
                    console.error(error);
                }
            }
        }
        yield mongoose.disconnect();
    });
}
exports.main = main;
main()
    .then(() => {
    debug('success!');
})
    .catch((err) => {
    // tslint:disable-next-line:no-console
    console.error(err);
    process.exit(1);
});
