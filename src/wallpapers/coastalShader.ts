// All compositing happens in linear light. Terrain stays still; atmosphere and
// wave normals move. The water deliberately reflects only a small fraction of
// the sky, with a separate sun glint and broken reflections of the same stars
// and meteor that are visible overhead. The sky gradient is not reflected.
export const coastalFragment = /* glsl */ `
varying vec2 vUv;
uniform vec3 sky; uniform vec3 horizon; uniform vec3 land;
uniform float time; uniform float sunlight; uniform float aspect; uniform float season;
uniform bool mirror;
uniform vec2 viewport; uniform vec4 meteor; uniform float meteorOpacity;
const float seaLevel=.43;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
}
float terrainNoise(vec2 p){return noise(p)*.57+noise(p*2.07+7.)*.28+noise(p*4.13+13.)*.15;}
float ridge(float x,float layer){
 return seaLevel+.035+layer*.035+.032*sin(x*3.7+layer*2.)
  +.016*sin(x*10.3+layer)+.018*terrainNoise(vec2(x*7.,layer*5.));
}
vec3 terrainColour(float distance){
 vec3 base=mix(land,horizon*.42,distance);
 vec3 autumn=sRGBTransferEOTF(vec4(.32,.23,.12,1.)).rgb;
 vec3 winter=sRGBTransferEOTF(vec4(.58,.67,.69,1.)).rgb;
 base=mix(base,autumn*(sunlight*.65+.10),max(season,0.)*.35);
 return mix(base,winter*(sunlight*.7+.035),max(-season,0.)*.45);
}
vec3 stars(vec2 p,float scale,float density){
 // Keep points resolvable after the reflected sky is compressed into the water.
 // Derivatives must be evaluated before the non-uniform empty-cell branch.
 vec2 footprint=max(fwidth(p)*viewport.y*.75,vec2(.45));
 vec2 grid=p*scale,cell=floor(grid);float seed=hash(cell);
 if(seed<1.-density)return vec3(0.);
 vec2 offset=.18+.64*vec2(hash(cell+17.3),hash(cell+41.9));
 vec2 delta=(fract(grid)-offset)*viewport.y/scale;
 float radius=mix(.45,1.05,hash(cell+8.));
 vec2 filtered=delta/max(vec2(radius),footprint);
 float d2=dot(filtered,filtered);
 float point=exp(-d2);
 float halo=exp(-d2/8.)*.045;
 float twinkle=.88+.12*sin(time*(.55+hash(cell+3.))+seed*190.);
 vec3 tint=mix(vec3(.64,.77,1.),vec3(1.,.88,.69),hash(cell+9.));
 return tint*(point+halo)*mix(.12,.65,hash(cell+12.))*twinkle;
}
vec3 shootingStar(vec2 p){
 if(meteorOpacity<.001)return vec3(0.);
 vec2 segment=meteor.xy-meteor.zw;
 float along=clamp(dot(p-meteor.zw,segment)/max(dot(segment,segment),.000001),0.,1.);
 float distance=length(p-meteor.zw-segment*along)*viewport.y;
 float taper=pow(along,2.2),core=exp(-distance*distance/1.2);
 float glow=exp(-distance*distance/12.)*.16;
 float headDistance=length(p-meteor.xy)*viewport.y;
 float head=exp(-headDistance*headDistance/3.);
 return mix(vec3(.48,.66,1.),vec3(1.,.95,.86),along)*((core+glow)*taper+head*.5)*meteorOpacity;
}
// Both the direct sky and the water sample this one field. In particular, a
// meteor reflection shares its live head, tail and fade, never a separate timer.
vec3 nightLights(vec2 p){
 return stars(p,140.,.027)+stars(p+7.1,65.,.017)+shootingStar(p);
}
// These two shores leave an open channel, instead of painting hills over the sea.
float rightShore(float u){
 return -.15+.60*smoothstep(.40,1.08,u)+.020*sin(u*15.)+.012*noise(vec2(u*38.,3.));
}
float leftShore(float u){
 return -.15+.33*(1.-smoothstep(-.08,.37,u))+.013*sin(u*21.)+.008*noise(vec2(u*45.,8.));
}
vec3 sea(vec2 p,vec2 sunPosition,float night){
 float depth=clamp((seaLevel-p.y)/seaLevel,0.,1.);
 vec2 water=vec2(p.x/(.24+depth),1./(.10+depth));
 float swell=sin(water.y*9.+water.x*2.7-time*.7);
 float crossWave=sin(water.y*17.3-water.x*4.1+time*.46);
 float ripples=sin(water.y*37.+water.x*8.3+time*.9+swell*1.4);
 // Fade fine frequencies before they reach the pixel grid: no horizon shimmer.
 float resolved=1.-smoothstep(1.,3.1,fwidth(water.y*37.));
 float wave=swell*.55+crossWave*.30+ripples*.15*resolved;
 vec3 deep=mix(vec3(.0015,.007,.013),vec3(.008,.055,.065),sunlight);
 vec3 shallows=mix(deep,horizon*.26,.62);
 vec3 colour=mix(shallows,deep,smoothstep(0.,.9,depth));
 colour+=vec3(.014,.029,.034)*wave*(.08+.50*sunlight)*(.25+.75*depth);
 // Low reflectance with a grazing-angle lift. This never copies the whole sky.
 float fresnel=.06+.15*(1.-depth)*(1.-depth);
 colour=mix(colour,horizon*.40,fresnel);
 float distortion=(swell*.006+crossWave*.003)*(.18+depth);
 float reflectionX=p.x-sunPosition.x+distortion;
 float width=.008+depth*.11;
 float beam=exp(-reflectionX*reflectionX/(width*width));
 float ridgeLight=smoothstep(.18,.9,swell*.55+crossWave*.35+ripples*.10*resolved);
 float glint=beam*(.07+ridgeLight*.72)*(.40+.60*depth)*sunlight;
 colour+=vec3(1.,.72,.37)*glint*.48;
 if(night>.001){
  // Project the entire visible sky into the bay. A plain 2*horizon-y mirror
  // clipped everything above y=.86, including the beginning of most meteors.
  // The top of the sky lands at y=.07, clear of the bottom edge of the scene.
  float reflectionScale=(seaLevel-.07)/(1.-seaLevel);
  vec2 reflected=vec2(p.x+distortion*(.30+depth*.35),
   seaLevel+(seaLevel-p.y)/reflectionScale+crossWave*.001*(.3+depth));
  // A short horizontal blur makes little wave glints, not a second sharp sky.
  float spread=(1.1+depth*1.5)/viewport.y;
  vec3 lights=nightLights(reflected)*.50;
  lights+=nightLights(reflected+vec2(spread,0.))*.25;
  lights+=nightLights(reflected-vec2(spread,0.))*.25;
  float visibleSky=smoothstep(.46,.69,reflected.y)
   *(1.-smoothstep(.99,1.02,reflected.y));
  // Troughs dim the reflection instead of erasing every subpixel star.
  float waveBreak=.30+.70*smoothstep(-.5,.85,wave);
  colour+=lights*night*.42*visibleSky*waveBreak;
 }
 // A soft, displaced reflection of the distant ridge anchors the coastline.
 float reflectedRidge=2.*seaLevel-ridge(p.x+distortion,0.);
 colour*=mix(1.,.70,smoothstep(reflectedRidge-.012,reflectedRidge+.012,p.y));
 return max(colour,vec3(.0005));
}
void main(){
 vec2 uv=vec2(mirror?1.-vUv.x:vUv.x,vUv.y);
 float x=(uv.x-.5)*aspect,night=1.-smoothstep(.02,.42,sunlight);
 float edge=1.2/viewport.y;
 vec2 p=vec2(x,uv.y),sunPosition=vec2(.17*min(aspect,2.),.57+sunlight*.18);
 vec3 colour=mix(horizon,sky,smoothstep(.36,1.,uv.y));
 float cloud=terrainNoise(vec2(x*1.8-time*.007,uv.y*7.));
 float cloudVeil=smoothstep(.44,.74,cloud)*smoothstep(.54,.76,uv.y);
 colour=mix(colour,horizon*.80+vec3(.11)*sunlight,cloudVeil*.17*sunlight);
 float sunDistance=length(p-sunPosition);
 colour+=vec3(1.,.70,.38)*exp(-sunDistance*8.)*.085*sunlight;
 colour=mix(colour,vec3(1.,.91,.74),(1.-smoothstep(.019,.019+edge,sunDistance))*sunlight);
 if(night>.001){
  float bandDistance=(x*.3+uv.y-.95)*5.;
  colour+=vec3(.002,.0025,.006)*exp(-bandDistance*bandDistance)*noise(p*13.)*night;
  colour+=nightLights(p)*night*smoothstep(.46,.69,uv.y);
 }
 // Atmospheric perspective and textured slopes, all anchored to the ground.
 for(int i=2;i>=0;i--){
  float layer=float(i),height=ridge(x,layer);
  float grain=terrainNoise(vec2(x*(13.+layer*3.),uv.y*24.));
  vec3 hillColour=terrainColour(.33+layer*.22)*(1.+(grain-.5)*.24);
  float contours=sin(x*21.+uv.y*64.+grain*4.);
  hillColour+=terrainColour(.55)*contours*.035*sunlight;
  colour=mix(colour,hillColour,1.-smoothstep(height-edge,height+edge,uv.y));
 }
 if(uv.y<seaLevel)colour=sea(p,sunPosition,night);
 float right=rightShore(uv.x),left=leftShore(uv.x);
 float shore=max(right,left);
 // Narrow wet sand and wavelets hug the shore; the open water remains dark.
 float wet=exp(-abs(uv.y-shore)*270.)*step(uv.y,seaLevel);
 float wash=.5+.5*sin(time*.75+uv.x*28.+noise(p*30.)*2.);
 colour+=vec3(.07,.11,.105)*wet*wash*(sunlight*.45+.015);
 float texture=terrainNoise(vec2(x*12.,uv.y*21.));
 vec3 headland=terrainColour(.10)*(1.+(texture-.5)*.40);
 headland+=terrainColour(.35)*smoothstep(.56,.76,texture)*.19*sunlight;
 colour=mix(colour,headland,1.-smoothstep(shore-edge,shore+edge,uv.y));
 // Sparse, varied pines on the larger headland. No billboard assets or grid of trees.
 float cell=floor(uv.x*72.),local=fract(uv.x*72.)-.5;
 float seed=hash(vec2(cell,17.)),treeU=(cell+.5)/72.;
 float treeBase=rightShore(treeU),treeHeight=.005+seed*.015;
 float treeY=(uv.y-treeBase)/treeHeight;
 float crown=(1.-smoothstep((1.-treeY)*.29,(1.-treeY)*.29+.09,abs(local)))*step(0.,treeY)*(1.-step(1.,treeY));
 float trees=crown*step(.67,treeU)*step(.31,seed)*step(treeBase,seaLevel-.003);
 colour=mix(colour,terrainColour(0.)*.66,trees*.88);
 // Slow mist collects above the waterline instead of sliding the mountains.
 float mistHeight=(uv.y-seaLevel-.012)/.028;
 float mist=exp(-mistHeight*mistHeight)*noise(vec2(x*3.-time*.012,uv.y*12.));
 colour=mix(colour,horizon*.60,mist*.14*(.20+sunlight)*smoothstep(shore,shore+.018,uv.y));
 colour=max(vec3(0.),colour+(hash(gl_FragCoord.xy)-.5)/1800.);
 gl_FragColor=vec4(colour,1.);
 #include <colorspace_fragment>
}`
