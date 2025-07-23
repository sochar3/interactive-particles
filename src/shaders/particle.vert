// @author brunoimbrizi / http://brunoimbrizi.com

precision highp float;

attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;
attribute float angle;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;
uniform float uDensity;
uniform vec2 uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTouch;

varying vec2 vPUv;
varying vec2 vUv;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

float random(float n) {
	return fract(sin(n) * 43758.5453123);
}

void main() {
	vUv = uv;

	// particle uv
	vec2 puv = offset.xy / uTextureSize;
	vPUv = puv;

	// pixel color
	vec4 colA = texture2D(uTexture, puv);
	float grey = dot(colA.rgb, vec3(0.2126, 0.7152, 0.0722)); // proper luminosity

	// displacement
	vec3 displaced = offset;
	
	// improved randomization with multiple noise layers - affected by density
	vec2 noiseCoord = vec2(pindex * 0.01 * uDensity, uTime * 0.15);
	float noise1 = snoise2(noiseCoord);
	float noise2 = snoise2(noiseCoord * 2.0) * 0.5;
	float combinedNoise = noise1 + noise2;
	
	// randomise with smoother distribution - density affects spacing
	float densityEffect = mix(0.5, 1.5, uDensity);
	displaced.xy += vec2(
		random(pindex) - 0.5 + combinedNoise * 0.3,
		random(offset.x + pindex) - 0.5 + combinedNoise * 0.2
	) * uRandom * densityEffect;
	
	// enhanced z displacement with breathing effect - density affects depth variation
	float rndz = (random(pindex) + combinedNoise);
	float breathe = sin(uTime * 0.8 + pindex * 0.05) * 0.3;
	displaced.z += rndz * (random(pindex) * 1.5 * uDepth * uDensity) + breathe;
	
	// center
	displaced.xy -= uTextureSize * 0.5;

	// enhanced touch interaction
	float t = texture2D(uTouch, puv).r;
	float touchStrength = t * t; // quadratic for more dramatic effect
	
	// create radial displacement from touch point
	float displacement = touchStrength * 35.0 * rndz;
	displaced.z += displacement;
	
	// add rotational movement around touch point
	float rotationForce = touchStrength * 25.0;
	displaced.x += cos(angle + uTime * 2.0) * rotationForce * rndz;
	displaced.y += sin(angle + uTime * 2.0) * rotationForce * rndz;

	// balanced particle size for realistic but visible density variation
	float brightness = pow(grey, 0.7); // gamma correction for better contrast
	
	// balanced size scaling for density variation - density affects size variation
	float psize = 1.2 + (snoise2(vec2(pindex * 0.01, uTime * 0.1)) + 1.0) * 0.2 * uDensity;
	
	// quadratic scaling creates good size differences without going too extreme
	psize *= brightness * brightness; // quadratic scaling for good contrast
	psize *= uSize;
	
	// reasonable minimum size to maintain visibility - affected by density
	psize = max(psize, uSize * 0.15 * uDensity);

	// final position
	vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	mvPosition.xyz += position * psize;
	vec4 finalPosition = projectionMatrix * mvPosition;

	gl_Position = finalPosition;
}
