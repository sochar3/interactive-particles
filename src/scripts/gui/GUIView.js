import ControlKit from '@brunoimbrizi/controlkit';
import Stats from 'stats.js';

export default class GUIView {

	constructor(app) {
		this.app = app;

		// Touch controls
		this.particlesHitArea = false;
		this.touchRadius = 0.26;

		// Particle controls with user-preferred defaults
		this.particlesRandom = 2.66; // user specified randomness
		this.particlesDepth = 15; // full depth (max value)
		this.particlesSize = 5.0; // max size
		
		// New particle controls
		this.particleBrightness = 3.0; // max brightness
		this.particleDensity = 0.98; // user specified density
		
		// Color controls (RGB) - warm white default
		this.particleColorR = 1.0;
		this.particleColorG = 1.0;
		this.particleColorB = 0.95;
		
		// Ranges for sliders
		this.range = [0, 1];
		this.rangeRandom = [1, 10];
		this.rangeSize = [0, 5];
		this.rangeDepth = [1, 15];
		this.rangeRadius = [0, 0.5];
		this.rangeBrightness = [0.1, 3.0];
		this.rangeDensity = [0.1, 3.0];
		this.rangeColor = [0, 1];

		this.initControlKit();
		// this.initStats();

		// Apply default settings after a short delay to ensure particles are ready
		setTimeout(() => {
			this.onParticlesChange();
		}, 100);

		// this.disable();
	}

	initControlKit() {
		this.controlKit = new ControlKit();
		this.controlKit.addPanel({ width: 320, enable: false })

		.addGroup({label: 'Touch', enable: true })
		.addCanvas({ label: 'trail', height: 64 })
		.addSlider(this, 'touchRadius', 'rangeRadius', { label: 'radius', onChange: this.onTouchChange.bind(this) })
		
		.addGroup({label: 'Particle Color', enable: true })
		.addSlider(this, 'particleColorR', 'rangeColor', { label: 'red', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particleColorG', 'rangeColor', { label: 'green', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particleColorB', 'rangeColor', { label: 'blue', onChange: this.onParticlesChange.bind(this) })
		
		.addGroup({label: 'Particle Appearance', enable: true })
		.addSlider(this, 'particleBrightness', 'rangeBrightness', { label: 'brightness', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesSize', 'rangeSize', { label: 'size', onChange: this.onParticlesChange.bind(this) })
		
		.addGroup({label: 'Particle Behavior', enable: true })
		.addSlider(this, 'particleDensity', 'rangeDensity', { label: 'density', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesRandom', 'rangeRandom', { label: 'randomness', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesDepth', 'rangeDepth', { label: 'depth', onChange: this.onParticlesChange.bind(this) })
		
		.addGroup({label: 'Color Presets', enable: true })
		.addButton('Warm White', this.setWarmWhite.bind(this))
		.addButton('Cool White', this.setCoolWhite.bind(this))
		.addButton('Golden', this.setGolden.bind(this))
		.addButton('Blue', this.setBlue.bind(this))
		.addButton('Purple', this.setPurple.bind(this))
		.addButton('Green', this.setGreen.bind(this))
		
		.addGroup({label: 'Images', enable: true })
		.addButton('Next Image', this.nextImage.bind(this))
		.addButton('Show Logo', this.showLogo.bind(this))
		
		.addGroup({label: 'Effect Presets', enable: true })
		.addButton('Reset All', this.resetToDefaults.bind(this))
		.addButton('Photographic', this.presetPhotographic.bind(this))
		.addButton('Dreamy', this.presetDreamy.bind(this))
		.addButton('High Contrast', this.presetHighContrast.bind(this));

		// store reference to canvas
		const component = this.controlKit.getComponentBy({ label: 'trail' });
		if (!component) return;

		this.touchCanvas = component._canvas;
		this.touchCtx = this.touchCanvas.getContext('2d');
	}

	initStats() {
		this.stats = new Stats();

		document.body.appendChild(this.stats.dom);
	}

	// ---------------------------------------------------------------------------------------------
	// PRESETS
	// ---------------------------------------------------------------------------------------------

	resetToDefaults() {
		this.particleColorR = 1.0;
		this.particleColorG = 1.0;
		this.particleColorB = 0.95;
		this.particleBrightness = 3.0; // max brightness
		this.particleDensity = 0.98; // user specified density
		this.particlesSize = 5.0; // max size
		this.particlesRandom = 2.66; // user specified randomness
		this.particlesDepth = 15; // full depth
		this.touchRadius = 0.26; // user specified radius
		this.updateControls();
		this.onParticlesChange();
		this.onTouchChange();
	}

	presetPhotographic() {
		this.particleColorR = 1.0;
		this.particleColorG = 0.98;
		this.particleColorB = 0.92;
		this.particleBrightness = 1.4;
		this.particleDensity = 1.3;
		this.particlesSize = 1.8;
		this.particlesRandom = 1.5;
		this.particlesDepth = 6;
		this.updateControls();
		this.onParticlesChange();
	}

	presetDreamy() {
		this.particleColorR = 0.9;
		this.particleColorG = 0.95;
		this.particleColorB = 1.0;
		this.particleBrightness = 0.8;
		this.particleDensity = 0.7;
		this.particlesSize = 2.2;
		this.particlesRandom = 3.5;
		this.particlesDepth = 8;
		this.updateControls();
		this.onParticlesChange();
	}

	presetHighContrast() {
		this.particleColorR = 1.0;
		this.particleColorG = 1.0;
		this.particleColorB = 1.0;
		this.particleBrightness = 2.0;
		this.particleDensity = 1.5;
		this.particlesSize = 1.2;
		this.particlesRandom = 1.8;
		this.particlesDepth = 10;
		this.updateControls();
		this.onParticlesChange();
	}

	updateControls() {
		// Force ControlKit to update the UI
		this.controlKit.update();
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		// draw touch texture
		if (this.touchCanvas) {
			if (!this.app.webgl) return;
			if (!this.app.webgl.particles) return;
			if (!this.app.webgl.particles.touch) return;
			const source = this.app.webgl.particles.touch.canvas;
			const x = Math.floor((this.touchCanvas.width - source.width) * 0.5);
			this.touchCtx.fillRect(0, 0, this.touchCanvas.width, this.touchCanvas.height);
			this.touchCtx.drawImage(source, x, 0);
		}
	}

	enable() {
		this.controlKit.enable();
		if (this.stats) this.stats.dom.style.display = '';
	}

	disable() {
		this.controlKit.disable();
		if (this.stats) this.stats.dom.style.display = 'none';
	}

	toggle() {
		if (this.controlKit._enabled) this.disable();
		else this.enable();
	}

	// Color preset methods
	setWarmWhite() {
		this.particleColorR = 1.0;
		this.particleColorG = 1.0;
		this.particleColorB = 0.95;
		this.updateControls();
		this.onParticlesChange();
	}

	setCoolWhite() {
		this.particleColorR = 0.95;
		this.particleColorG = 0.98;
		this.particleColorB = 1.0;
		this.updateControls();
		this.onParticlesChange();
	}

	setGolden() {
		this.particleColorR = 1.0;
		this.particleColorG = 0.8;
		this.particleColorB = 0.4;
		this.updateControls();
		this.onParticlesChange();
	}

	setBlue() {
		this.particleColorR = 0.4;
		this.particleColorG = 0.7;
		this.particleColorB = 1.0;
		this.updateControls();
		this.onParticlesChange();
	}

	setPurple() {
		this.particleColorR = 0.8;
		this.particleColorG = 0.4;
		this.particleColorB = 1.0;
		this.updateControls();
		this.onParticlesChange();
	}

	setGreen() {
		this.particleColorR = 0.4;
		this.particleColorG = 1.0;
		this.particleColorB = 0.6;
		this.updateControls();
		this.onParticlesChange();
	}

	// Image navigation methods
	nextImage() {
		if (this.app.webgl) {
			this.app.webgl.next();
		}
	}

	showLogo() {
		if (this.app.webgl) {
			this.app.webgl.showLogo();
		}
	}

	onTouchChange() {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;

		this.app.webgl.particles.touch.radius = this.touchRadius;
	}
	
	onParticlesChange() {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;
		if (!this.app.webgl.particles.object3D) return;

		const uniforms = this.app.webgl.particles.object3D.material.uniforms;

		// Update all particle uniforms
		uniforms.uRandom.value = this.particlesRandom;
		uniforms.uDepth.value = this.particlesDepth;
		uniforms.uSize.value = this.particlesSize;
		uniforms.uBrightness.value = this.particleBrightness;
		uniforms.uDensity.value = this.particleDensity;
		uniforms.uColor.value.set(this.particleColorR, this.particleColorG, this.particleColorB);

		// Update hit area visibility
		if (this.app.webgl.particles.hitArea) {
			this.app.webgl.particles.hitArea.material.visible = this.particlesHitArea;
		}
	}

	onPostProcessingChange() {
		if (!this.app.webgl.composer) return;
		this.app.webgl.composer.enabled = this.postProcessing;
	}
}
