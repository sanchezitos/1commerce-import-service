let express = require("express");
let app = express();
let logger = require('log4js');
let config = require(`./config/${process.env.NODE_ENV || 'development'}.config.js`);

app.workspace = __dirname;
app.locals.logger = logger;
app.config = config;

(async app => {

    let isReady = await require('./boot').boot(app).catch((e) => {
        throw (new Error(`[ERROR]: starting app ${e.message}`));
    })

    if (isReady) {
        app.httpServer.listen(process.env.PORT || 80, function () {
            console.log(`[${process.env.NODE_ENV || 'development'}] - 1commerce-import-service on PORT ${(process.env.PORT || 443)}`);
            app.config.cron.map((c)=>c.job.start());
        });
    }
})(app);

