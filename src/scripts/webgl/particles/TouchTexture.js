import * as THREE from 'three';

import { easeOutQuad, easeInOutQuad, easeOutSine, easeInOutSine } from '../../utils/easing.utils';

export default class TouchTexture {
	constructor(parent) {
		this.parent = parent;
		this.size = 128; // increased resolution for better quality
		this.maxAge = 180; // longer trail duration
		this.radius = 0.26; // user specified radius
		this.trail = [];

		this.initTexture();
	}

	initTexture() {
		this.canvas = document.createElement('canvas');
		this.canvas.width = this.canvas.height = this.size;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.texture = new THREE.Texture(this.canvas);

		this.canvas.id = 'touchTexture';
		this.canvas.style.width = this.canvas.style.height = `${this.canvas.width}px`;
	}

	update(delta) {
		this.clear();

		// age points
		this.trail.forEach((point, i) => {
			point.age++;
			// remove old
			if (point.age > this.maxAge) {
				this.trail.splice(i, 1);
			}
		});

		this.trail.forEach((point, i) => {
			this.drawTouch(point);
		});

		this.texture.needsUpdate = true;
	}

	clear() {
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	addTouch(point) {
		let force = 0;
		const last = this.trail[this.trail.length - 1];
		if (last) {
			const dx = last.x - point.x;
			const dy = last.y - point.y;
			const dd = dx * dx + dy * dy;
			force = Math.min(dd * 10000, 1);
		}
		this.trail.push({ x: point.x, y: point.y, age: 0, force });
	}

	drawTouch(point) {
		const pos = {
			x: point.x * this.size,
			y: (1 - point.y) * this.size
		};

		// improved easing for smoother trails
		let intensity = 1;
		const ageFactor = point.age / this.maxAge;
		
		if (ageFactor < 0.2) {
			// fast fade in
			intensity = easeOutQuad(ageFactor / 0.2, 0, 1, 1);
		} else if (ageFactor < 0.7) {
			// stable phase
			intensity = 1.0;
		} else {
			// smooth fade out
			intensity = easeInOutSine(1 - (ageFactor - 0.7) / 0.3, 0, 1, 1);
		}

		// enhance force effect
		intensity *= Math.min(point.force * 1.5, 1.0);

		// ensure radius is always positive and has a minimum value
		const radius = Math.max(this.size * this.radius * intensity, 1.0);
		
		// create multi-layer gradient for more visual depth
		const grd = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
		const alpha = intensity * 0.4; // increased alpha for stronger effect
		
		grd.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
		grd.addColorStop(0.4, `rgba(255, 255, 255, ${alpha * 0.6})`);
		grd.addColorStop(0.8, `rgba(255, 255, 255, ${alpha * 0.2})`);
		grd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

		this.ctx.beginPath();
		this.ctx.fillStyle = grd;
		this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
		this.ctx.fill();
	}
}
