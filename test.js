var casper = require("casper").create();
casper.start();

casper.wait(100, function() {
    this.viewport(1024, 640);

    yolo("Cover");
});

function yolo(i) {
    if(i == "Cover" || i <= 39) {
        casper.thenOpen('http://localhost:9000/slides.html?full#'+i).then(function() {
            if(i == "Cover") i = 1;
            var n = i < 10 ? '0' + i: i;
            casper.wait(200, function() {
            this.capture('rust-n'+n+'.png');
            });
            yolo(i + 1);
        });
    }
}

casper.run();
