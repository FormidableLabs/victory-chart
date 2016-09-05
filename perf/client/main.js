const Perf = require("react-addons-perf");

window.Perf = Perf;

// Use webpack to infer and `require` tests automatically.
const benchesReq = require.context(".", true, /\.bench.js?$/);
benchesReq.keys().map(benchesReq);
