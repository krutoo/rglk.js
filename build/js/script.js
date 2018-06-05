;(function () {
	'use strict';

	var canvas = document.querySelector('canvas'),
		ctx = canvas.getContext('2d'),
		dungeon = new rglk.Dungeon({
			roomsAmount: 64,
			roomMinSize: 3,
			roomMaxSize: 12,
			corridorMinLength: 1,
			corridorMaxLength: 8,
			seed: Math.random(),
		}),
		pathfinder = new rglk.Pathfinder(function (x, y) {
			return !dungeon.isWall(x, y);
		}),
		explorer = new rglk.Explorer(function (x, y) {
			return !dungeon.isWall(x, y);
		}),
		tileSize = 32,
		path = [],
		fov = [];

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var canvasMinSide = Math.min(window.innerWidth, window.innerHeight),
			dungeonMaxSide = Math.max(dungeon.width, dungeon.height);
		tileSize = Math.floor(canvasMinSide / dungeonMaxSide);
		drawMap();
		drawFov();
		drawPath();
	}

	function drawMap() {
		dungeon.forEachTile(function (x, y, isFloor) {
			ctx.fillStyle = isFloor ? '#445' : '#000';
			ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
		});
		dungeon.rooms.forEach((room) => {
			ctx.fillStyle = '#a00';
			ctx.fillRect(
				(-tileSize / 2) + (room.center.x * tileSize),
				(-tileSize / 2) + (room.center.y * tileSize),
				tileSize,
				tileSize
			);
		});
	}

	function drawFov() {
		fov.forEach(function (tile) {
			ctx.fillStyle = '#aa7';
			ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
		});
	}

	function drawPath() {
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = Math.ceil(tileSize / 3);
		if (path.length) {
			ctx.beginPath();
			ctx.moveTo(path[0].x * tileSize + (tileSize / 2), path[0].y * tileSize + (tileSize / 2));
			path.forEach(function (point) {
				ctx.lineTo(point.x * tileSize + (tileSize / 2), point.y * tileSize + (tileSize / 2));
			});
			ctx.stroke();
			ctx.closePath();
		}
	}

	function init() {
		generateDungeon();
		calculateFov();
		searchPath();
	}

	function generateDungeon() {
		console.time('dungeon generate');
		dungeon.generate();
		console.timeEnd('dungeon generate');
	}

	function calculateFov() {
		console.time('fov calculate');
		fov = [];
		explorer.calculate(
			dungeon.rooms[0].x,
			dungeon.rooms[0].y,
			7,
			function (x, y) {
				fov.push({x: x, y: y});
			}
		);
		console.timeEnd('fov calculate');
	}

	function searchPath() {
		console.time('path search');
		path = pathfinder.search(
			dungeon.rooms[0].x,
			dungeon.rooms[0].y,
			dungeon.rooms[dungeon.rooms.length - 1].x,
			dungeon.rooms[dungeon.rooms.length - 1].y
		);
		console.timeEnd('path search');
	}

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		draw();
	}

	document.addEventListener('DOMContentLoaded', function () {
		resize();
		init();
		draw();
		window.addEventListener('resize', resize, false);
	}, false);

	window.addEventListener('keydown', function (event) {
		if (event.keyCode === 32) {
			init();
			draw();
		}
	});
}());