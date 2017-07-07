"use strict";
/**
 * キューステータスがtrueの取引のタスクエクスポートステータスをtrueに変更する
 * キュー仕様→タスク仕様の変更において整合性を保つためのジョブ
 * スケジュールはなしで、手動トリガー
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
const mongooseConnectionOptions_1 = require("../../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:*');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const transactionAdapter = sskts.adapter.transaction(sskts.mongoose.connection);
        const result = yield transactionAdapter.transactionModel.update({
            queues_status: 'EXPORTED',
            tasks_exportation_status: sskts.factory.transactionTasksExportationStatus.Unexported
        }, {
            tasks_exportation_status: sskts.factory.transactionTasksExportationStatus.Exported
        }).exec();
        console.error('result is', result);
        sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
