/**
 * 会員プログラム登録タスク
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions).then(debug).catch(console.error);

const redisClient = sskts.redis.createClient({
    host: <string>process.env.REDIS_HOST,
    // tslint:disable-next-line:no-magic-numbers
    port: parseInt(<string>process.env.REDIS_PORT, 10),
    password: <string>process.env.REDIS_KEY,
    tls: { servername: <string>process.env.REDIS_HOST }
});

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 200;
const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
const cognitoIdentityServiceProvider = new sskts.AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: 'ap-northeast-1',
    credentials: new sskts.AWS.Credentials({
        accessKeyId: <string>process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: <string>process.env.AWS_SECRET_ACCESS_KEY
    })
});

setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await sskts.service.task.executeByName(
                sskts.factory.taskName.RegisterProgramMembership
            )({
                taskRepo: taskRepo,
                connection: sskts.mongoose.connection,
                redisClient: redisClient,
                cognitoIdentityServiceProvider: cognitoIdentityServiceProvider
            });
        } catch (error) {
            console.error(error);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);
