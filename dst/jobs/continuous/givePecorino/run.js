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
 * Pecorinoインセンティブ入金実行
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:continuous:settleCreditCard');
sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default).then(debug).catch(console.error);
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepository = new sskts.repository.Task(sskts.mongoose.connection);
const authClient = new sskts.pecorinoapi.auth.ClientCredentials({
    domain: process.env.PECORINO_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.PECORINO_CLIENT_ID,
    clientSecret: process.env.PECORINO_CLIENT_SECRET,
    scopes: [],
    state: ''
});
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    count += 1;
    try {
        yield sskts.service.task.executeByName(sskts.factory.taskName.GivePecorino)({
            taskRepo: taskRepository,
            connection: sskts.mongoose.connection,
            pecorinoAuthClient: authClient
        });
    }
    catch (error) {
        console.error(error.message);
    }
    count -= 1;
}), INTERVAL_MILLISECONDS);
