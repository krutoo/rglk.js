;(function () {

'use strict';

var canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d'),
	dungeon = new rglk.Dungeon({
		roomAmount: 16, 
		roomMinSize: 3, 
		roomMaxSize: 7, 
		density: 0
	}),
	pathfinder = new rglk.Pathfinder(function (x, y) {
		if (dungeon._tiles[y] && dungeon._tiles[y][x]) {
			return true;
		}

		return false;
	}),
	explorer = new rglk.Explorer(function (x, y) {
		if (dungeon._tiles[y] && dungeon._tiles[y][x]) {
			return true;
		}

		return false;
	}),
	tileSize = 16,
	path = [],
	fov = [];

function resize() {
	// resize canvas 
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	draw();
}

function draw() {
	tileSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) / Math.max(dungeon.width, dungeon.height));
	drawMap();
	drawFov();
	drawPath();
}

function drawMap() {
	dungeon.forEachTile(function (x, y, isFloor) {
		ctx.fillStyle = isFloor ? '#445' : '#000';
		ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
	});
}

function drawFov() {
	fov.forEach(function (tile) {
		ctx.fillStyle = '#aa7';
		ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);

		ctx.fillStyle = '#333';
		for (var iy = tile.y - 1; iy <= tile.y + 1; iy++) {
			for (var ix = tile.x - 1; ix <= tile.x + 1; ix++) {
				if (dungeon._tiles[iy] && dungeon._tiles[iy][ix] === false) {
					ctx.fillRect(ix * tileSize, iy * tileSize, tileSize, tileSize);
				}
			}
		}
	});
}

function drawPath() {
	ctx.strokeStyle = '#0f0';
	ctx.lineWidth = Math.ceil(tileSize / 2);

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

window.addEventListener('resize', resize, false);

document.addEventListener('DOMContentLoaded', function () {
	resize();

	// generate dungeon 
	dungeon.generate();

	// calculate fov
	explorer.calculate(
		dungeon.rooms[0].center.x, 
		dungeon.rooms[0].center.y, 
		7,
		function (x, y) {
			fov.push({x: x, y: y});
		}
	);

	// search path
	path = pathfinder.search(
		dungeon.rooms[0].center.x, 
		dungeon.rooms[0].center.y, 
		dungeon.rooms[dungeon.rooms.length - 1].center.x, 
		dungeon.rooms[dungeon.rooms.length - 1].center.y
	);

	draw();
}, false);

}());
