import express from "express";
import routes  from "./routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

app.listen(3000, function () {
    console.log("localhost @ 3000");
});
