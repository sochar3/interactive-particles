// @author brunoimbrizi / http://brunoimbrizi.com

precision highp float;

uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uBrightness;

varying vec2 vPUv;
varying vec2 vUv;

void main() {
	vec4 color = vec4(0.0);
	vec2 uv = vUv;
	vec2 puv = vPUv;

	// pixel color from texture
	vec4 colA = texture2D(uTexture, puv);

	// enhanced luminosity calculation for photographic realism
	float luminance = dot(colA.rgb, vec3(0.2126, 0.7152, 0.0722));
	
	// balanced contrast enhancement with gamma correction
	float brightness = pow(luminance, 0.8); // less aggressive gamma correction
	brightness = smoothstep(0.1, 0.95, brightness); // more visible range
	brightness = max(brightness, 0.15); // ensure minimum visibility
	
	// apply user brightness control
	brightness *= uBrightness;
	
	// apply user color control with brightness modulation
	vec3 particleColor = uColor * brightness;
	
	// create softer, more organic particle shape
	float border = 0.35;
	float radius = 0.5;
	float dist = radius - distance(uv, vec2(0.5));
	float t = smoothstep(0.0, border, dist);
	
	// add subtle glow for particles in bright areas
	float glow = smoothstep(0.7, 1.0, brightness);
	particleColor += glow * 0.3 * uColor;

	// final color with balanced alpha for depth
	color = vec4(particleColor, t * brightness * 1.2); // linear alpha with boost for visibility

	gl_FragColor = color;
}