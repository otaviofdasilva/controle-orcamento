import express from "express";
import routes  from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(function (_, response, next) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.removeHeader("x-powered-by");
    next();
});

routes(app);

app.listen(3000, function () {
    console.log("localhost @ 3000");
});
