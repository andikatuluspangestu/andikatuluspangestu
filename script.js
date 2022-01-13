let canvas,
	ctx,
	source,
	context,
	analyser,
	fbc_array,
	bar_count,
	firstClick,
	audio,
	handImg,
	playing,
	muted;

handImg = false;
firstClick = true;
playing = false;
muted = false;
canvas = document.getElementById("canvas");
canvas.width = $("#canvas-holder").outerWidth();
canvas.height = $("#canvas-holder").outerWidth() * 1.125;
ctx = canvas.getContext("2d");

$("audio").on("play", function () {
	playing = true;
	if (firstClick) {
		firstClick = false;
		audio = document.getElementById("audioObj");

		context = new AudioContext();
		analyser = context.createAnalyser();
		source = context.createMediaElementSource(audio);

		source.connect(analyser);
		analyser.connect(context.destination);

		drawCanvas();

		// start FrameLooper
		FrameLooper();
	}
});

$("audio").on("pause", function () {
	playing = false;
});

$("#play").on("click", function () {
	$(this).toggleClass("playing");
	playing = !playing;
	if (playing) {
		$("audio")[0].play();
	} else {
		$("audio")[0].pause();
	}
});

$("#mute").on("click", function () {
	$(this).toggleClass("muted");
	muted = !muted;
	if (muted) {
		$("audio")[0].muted = true;
	} else {
		$("audio")[0].muted = false;
	}
});

$(window).on("load resize", function () {
	if (firstClick) {
		// redraw canvas
		drawCanvas();
	}
});

$(document).on("keyup", function (e) {
	if (e.which == 49) {
		// glitch test 1
		console.log("glitch test 1");
		drawBoxGlitch();
	}
	if (e.which == 50) {
		// glitch test 2
		console.log("glitch test 2");
		drawBoxGlitch2();
	}
	if (e.which == 51) {
		// glitch test 3
		console.log("glitch test 3");
		drawRGBGlitch({ rOffset: 5, gOffset: 15, bOffset: 25 });
	}
});

function drawBoxGlitch() {
	// get a random square of data from the canvas image
	var randX = Math.random() * canvas.width;
	var randY = Math.random() * canvas.height;
	var randW = 10 + Math.random() * 40;
	var randH = 10 + Math.random() * 40;
	var randDestX = Math.random() * canvas.width;
	var randDestY = Math.random() * canvas.height;
	// deal with edge limits
	if (randX + randW > canvas.width) {
		randX = canvas.width - randW;
	}
	if (randY + randH > canvas.height) {
		randY = canvas.height - randY;
	}
	// draw glitch square
	var imgData = ctx.getImageData(randX, randY, randW, randH);
	ctx.putImageData(imgData, randDestX, randDestY);
}

function drawBoxGlitch2() {
	// get a random square of data from the canvas image
	var randX = Math.random() * canvas.width;
	var randY = Math.random() * canvas.height;
	var randW = 20 + Math.random() * 60;
	var randH = 20 + Math.random() * 60;
	var randDestX = randX - 30 + Math.random() * 60;
	var randDestY = randY - 30 + Math.random() * 60;
	// deal with edge limits
	if (randX + randW > canvas.width) {
		randX = canvas.width - randW;
	}
	if (randY + randH > canvas.height) {
		randY = canvas.height - randY;
	}
	// draw glitch square
	var imgData = ctx.getImageData(randX, randY, randW, randH);
	ctx.putImageData(imgData, randDestX, randDestY);
}

function drawRGBGlitch(options) {
	var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const { rOffset = 0, gOffset = 0, bOffset = 0 } = options;
	const arr = new Uint8ClampedArray(imgData.data);
	for (let i = 0; i < arr.length; i += 4) {
		arr[i + 0 + rOffset * 4] = imgData.data[i + 0]; // 🔴
		arr[i + 1 + gOffset * 4] = imgData.data[i + 1]; // 🟢
		arr[i + 2 + bOffset * 4] = imgData.data[i + 2]; // 🔵
	}
	const glitch = new ImageData(arr, imgData.width, imgData.height);
	ctx.putImageData(glitch, 0, 0);
}

function drawCanvas() {
	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// add canvas image
	if (handImg != false) {
		ctx.drawImage(handImg, 0, 0, canvas.width, canvas.width * 1.5);
	} else {
		//Loading of the home test image - img1
		handImg = new Image();
		handImg.crossOrigin = "Anonymous";

		//drawing of the test image - img1
		handImg.onload = function () {
			//draw background image
			ctx.drawImage(handImg, 0, 0, canvas.width, canvas.width * 1.5);
		};

		handImg.src =
			"nafa.jpg";
	}
}

let count = 0;
function FrameLooper() {
	window.RequestAnimationFrame =
		window.requestAnimationFrame(FrameLooper) ||
		window.msRequestAnimationFrame(FrameLooper) ||
		window.mozRequestAnimationFrame(FrameLooper) ||
		window.webkitRequestAnimationFrame(FrameLooper);

	fbc_array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(fbc_array);
	count++;

	if (fbc_array[0] != 0 && count > 3) {
		bar_count = canvas.height / 2;
		count = 0;
		drawCanvas();
		levelAvg = 0;

		for (var i = 0; i < bar_count; i++) {
			levelAvg += fbc_array[i];
		}

		levelAvg = levelAvg / bar_count;

		// console.log("sound data", fbc_array, levelAvg);
		const boxCount = Math.ceil((levelAvg / 110) ** (levelAvg / 110));
		const glitchCount = Math.ceil((levelAvg / 70) ** (levelAvg / 70));
		console.log(
			"outputting " + boxCount + " boxes and glitching " + glitchCount + " times.",
			levelAvg
		);

		const randR = parseInt(-glitchCount + Math.random() * glitchCount * 2);
		const randG = parseInt(-glitchCount + Math.random() * glitchCount * 2);
		const randB = parseInt(-glitchCount + Math.random() * glitchCount * 2);
		const glitchOptions = { rOffset: randR, gOffset: randG, bOffset: randB };
		// console.log(glitchOptions);
		drawRGBGlitch(glitchOptions);

		for (var a = 0; a < boxCount; a++) {
			if (Math.random() * 100 + levelAvg > 220) {
				drawBoxGlitch2();
			}
		}

		// draw glitch lines
		for (var i = 0; i < bar_count; i++) {
			if (Math.random() * 150 + levelAvg > 300) {
				createGlitchLine(canvas.width * 0.1, i * 2);
			}
		}
	}
}

function createGlitchLine(x, y) {
	let bar_pos = y;
	let bar_height = 1;
	let bar_shift = Math.round(fbc_array[y] / 20);

	var imgData = ctx.getImageData(x, y, canvas.width * 0.8, bar_height);

	const rOffset = -bar_shift,
		gOffset = bar_shift,
		bOffset = bar_shift * 2;
	const arr = new Uint8ClampedArray(imgData.data);
	for (let i = 0; i < arr.length; i += 4) {
		arr[i + 0 + rOffset * 4] = imgData.data[i + 0]; // 🔴
		arr[i + 1 + gOffset * 4] = imgData.data[i + 1]; // 🟢
		arr[i + 2 + bOffset * 4] = imgData.data[i + 2]; // 🔵
	}
	// console.log("shifting line " + rOffset + " " + gOffset + " " + bOffset, arr);
	const glitch = new ImageData(arr, imgData.width, imgData.height);
	ctx.putImageData(glitch, x, y);
}