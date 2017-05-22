import {parse} from "opts";
import pjson from "pjson";

let version = pjson.version;

parse([{
    short: "v",
    long: "version",
    description: "Show the version",
    required: false,
    callback: function () {
        console.log(version);
        return process.exit(1);
    }
}].reverse(), true);