var express = require("express");
var router = express.Router();
var log = function (req) {
    // console.log("toEmail: " + req.body.toEmail);
    // console.log("fromEmail: " + req.body.fromEmail);
    // console.log("emailMessage: " + req.body.emailMessage);
}

router.post("/", function (req, res, next) {
    log(req);

    res.json({
        "success": true
    });
});


// an end-point that returns response after the specified delay in seconds. Delay is specified by 
// the caller in the parth param :delay
router.post("/delay/:delay([0-9]+)", function (req, res, next) {
    var delay = req.params.delay;

    if (delay > 30) {
        delay = 30;
    }

    delay = delay * 1000;

    log(req);

    setTimeout(function () {
        res.json({
            "success": true
        });
    }, delay);    
});

// an end-point that throws a HTTP 500
router.post("/generateError", function (req, res, next) {
    log(req);

    res.status(500).json({ error: 'a test error message' })    
});

module.exports = router;