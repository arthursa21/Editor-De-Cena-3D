// ============================================================
// MATH LIBRARY
// ============================================================
const M4 = {
  id: () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]),
  clone: m => new Float32Array(m),
  mul(a, b) {
    const o = new Float32Array(16);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      let s = 0; for (let k = 0; k < 4; k++) s += a[r + k*4] * b[k + c*4]; o[r + c*4] = s;
    }
    return o;
  },
  perspective(fovY, aspect, near, far) {
    const f = 1/Math.tan(fovY/2), nf = 1/(near-far), o = new Float32Array(16);
    o[0] = f/aspect; o[5] = f; o[10] = (near+far)*nf; o[11] = -1; o[14] = 2*near*far*nf;
    return o;
  },
  lookAt(eye, center, up) {
    let fx=center[0]-eye[0], fy=center[1]-eye[1], fz=center[2]-eye[2];
    let fl=Math.hypot(fx,fy,fz); fx/=fl; fy/=fl; fz/=fl;
    let rx=fy*up[2]-fz*up[1], ry=fz*up[0]-fx*up[2], rz=fx*up[1]-fy*up[0];
    let rl=Math.hypot(rx,ry,rz); rx/=rl; ry/=rl; rz/=rl;
    let ux=ry*fz-rz*fy, uy=rz*fx-rx*fz, uz=rx*fy-ry*fx;
    const o = new Float32Array(16);
    o[0]=rx; o[1]=ux; o[2]=-fx;
    o[4]=ry; o[5]=uy; o[6]=-fy;
    o[8]=rz; o[9]=uz; o[10]=-fz;
    o[12]=-(rx*eye[0]+ry*eye[1]+rz*eye[2]);
    o[13]=-(ux*eye[0]+uy*eye[1]+uz*eye[2]);
    o[14]= (fx*eye[0]+fy*eye[1]+fz*eye[2]);
    o[15]=1; return o;
  },
  translation(x,y,z) { const o=M4.id(); o[12]=x; o[13]=y; o[14]=z; return o; },
  rotX(a) { const c=Math.cos(a),s=Math.sin(a),o=M4.id(); o[5]=c; o[6]=s; o[9]=-s; o[10]=c; return o; },
  rotY(a) { const c=Math.cos(a),s=Math.sin(a),o=M4.id(); o[0]=c; o[2]=-s; o[8]=s; o[10]=c; return o; },
  rotZ(a) { const c=Math.cos(a),s=Math.sin(a),o=M4.id(); o[0]=c; o[1]=s; o[4]=-s; o[5]=c; return o; },
  scale(x,y,z) { const o=M4.id(); o[0]=x; o[5]=y; o[10]=z; return o; },
  fromTRS(t, r, s) {
    const [qx,qy,qz,qw] = r;
    const x2=qx+qx, y2=qy+qy, z2=qz+qz;
    const xx=qx*x2, yx=qy*x2, yy=qy*y2, zx=qz*x2, zy=qz*y2, zz=qz*z2, wx=qw*x2, wy=qw*y2, wz=qw*z2;
    const o = new Float32Array(16);
    o[0]=(1-yy-zz)*s[0]; o[1]=(yx+wz)*s[0]; o[2]=(zx-wy)*s[0];
    o[4]=(yx-wz)*s[1]; o[5]=(1-xx-zz)*s[1]; o[6]=(zy+wx)*s[1];
    o[8]=(zx+wy)*s[2]; o[9]=(zy-wx)*s[2]; o[10]=(1-xx-yy)*s[2];
    o[12]=t[0]; o[13]=t[1]; o[14]=t[2]; o[15]=1; return o;
  },
  inv(m) {
    const [m00,m01,m02,m03,m04,m05,m06,m07,m08,m09,m10,m11,m12,m13,m14,m15] = m;
    const b00=m00*m05-m01*m04, b01=m00*m06-m02*m04, b02=m00*m07-m03*m04;
    const b03=m01*m06-m02*m05, b04=m01*m07-m03*m05, b05=m02*m07-m03*m06;
    const b06=m08*m13-m09*m12, b07=m08*m14-m10*m12, b08=m08*m15-m11*m12;
    const b09=m09*m14-m10*m13, b10=m09*m15-m11*m13, b11=m10*m15-m11*m14;
    let det = b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;
    if (!det) return M4.id(); det = 1/det;
    const o = new Float32Array(16);
    o[0]=(m05*b11-m06*b10+m07*b09)*det; o[1]=(m02*b10-m01*b11-m03*b09)*det;
    o[2]=(m13*b05-m14*b04+m15*b03)*det; o[3]=(m10*b04-m09*b05-m11*b03)*det;
    o[4]=(m06*b08-m04*b11-m07*b07)*det; o[5]=(m00*b11-m02*b08+m03*b07)*det;
    o[6]=(m14*b02-m12*b05-m15*b01)*det; o[7]=(m08*b05-m10*b02+m11*b01)*det;
    o[8]=(m04*b10-m05*b08+m07*b06)*det; o[9]=(m01*b08-m00*b10-m03*b06)*det;
    o[10]=(m12*b04-m13*b02+m15*b00)*det; o[11]=(m09*b02-m08*b04-m11*b00)*det;
    o[12]=(m05*b07-m04*b09-m06*b06)*det; o[13]=(m00*b09-m01*b07+m02*b06)*det;
    o[14]=(m13*b01-m12*b03-m14*b00)*det; o[15]=(m08*b03-m09*b01+m10*b00)*det;
    return o;
  },
  transposeInv(m) {
    const inv=M4.inv(m), o=new Float32Array(16);
    o[0]=inv[0]; o[1]=inv[4]; o[2]=inv[8];
    o[4]=inv[1]; o[5]=inv[5]; o[6]=inv[9];
    o[8]=inv[2]; o[9]=inv[6]; o[10]=inv[10];
    o[15]=1; return o;
  },
  transformPoint(m, p) {
    const w = m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];
    return [
      (m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12])/w,
      (m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13])/w,
      (m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14])/w,
    ];
  },
};

const V3 = {
  add: (a,b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]],
  sub: (a,b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]],
  scale: (a,s) => [a[0]*s, a[1]*s, a[2]*s],
  dot: (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross: (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]],
  len: a => Math.hypot(a[0],a[1],a[2]),
  norm: a => { const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l]; },
};

const Q = {
  slerp(a, b, t) {
    let dot = a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
    if (dot < 0) { b = [-b[0],-b[1],-b[2],-b[3]]; dot = -dot; }
    if (dot > 0.9995) return Q.norm([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t, a[3]+(b[3]-a[3])*t]);
    const th=Math.acos(dot), st=Math.sin(th);
    const sa=Math.sin((1-t)*th)/st, sb=Math.sin(t*th)/st;
    return [a[0]*sa+b[0]*sb, a[1]*sa+b[1]*sb, a[2]*sa+b[2]*sb, a[3]*sa+b[3]*sb];
  },
  norm: q => { const l=Math.hypot(...q)||1; return q.map(v=>v/l); },
};

// ============================================================
// SHADER SOURCES
// ============================================================
const VERT_PBR = `
attribute vec3 aPos;
attribute vec3 aNorm;
attribute vec2 aUV;
uniform mat4 uMVP;
uniform mat4 uModel;
uniform mat4 uNormalMat;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUV;
void main(){
  vec4 wp=uModel*vec4(aPos,1.0);
  vWorldPos=wp.xyz;
  vNormal=normalize((uNormalMat*vec4(aNorm,0.0)).xyz);
  vUV=aUV;
  gl_Position=uMVP*vec4(aPos,1.0);
}`;

const FRAG_PBR = `
precision highp float;
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUV;
uniform vec3 uCamPos;
uniform vec3 uBaseColor;
uniform float uMetallic;
uniform float uRoughness;
uniform float uOpacity;
uniform float uEmissive;
uniform bool uHasTexture;
uniform sampler2D uTex;
uniform bool uSelected;
const vec3 LIGHT_DIR=normalize(vec3(0.8,1.2,0.6));
const vec3 LIGHT_COL=vec3(1.2,1.15,1.1);
const vec3 AMB=vec3(0.25,0.25,0.35);
vec3 fresnelSchlick(float cosT,vec3 F0){
  return F0+(1.0-F0)*pow(clamp(1.0-cosT,0.0,1.0),5.0);
}
float DistributionGGX(float NdH,float r){
  float a=r*r,a2=a*a,d=NdH*NdH*(a2-1.0)+1.0;
  return a2/(3.14159*d*d+0.0001);
}
float GeomSmith(float NdV,float NdL,float r){
  float k=(r+1.0)*(r+1.0)/8.0;
  float g1=NdV/(NdV*(1.0-k)+k),g2=NdL/(NdL*(1.0-k)+k);
  return g1*g2;
}
void main(){
  vec3 base=uBaseColor;
  if(uHasTexture) base*=texture2D(uTex,vUV).rgb;
  vec3 N=normalize(vNormal);
  vec3 V=normalize(uCamPos-vWorldPos);
  vec3 L=LIGHT_DIR;
  vec3 H=normalize(V+L);
  float NdV=max(dot(N,V),0.0001);
  float NdL=max(dot(N,L),0.0);
  float NdH=max(dot(N,H),0.0);
  float HdV=max(dot(H,V),0.0);
  vec3 F0=mix(vec3(0.04),base,uMetallic);
  vec3 F=fresnelSchlick(HdV,F0);
  float D=DistributionGGX(NdH,uRoughness);
  float G=GeomSmith(NdV,NdL,uRoughness);
  vec3 spec=D*G*F/(4.0*NdV*NdL+0.0001);
  vec3 kd=(1.0-F)*(1.0-uMetallic);
  vec3 diff=kd*base/3.14159;
  vec3 Lo=(diff+spec)*LIGHT_COL*NdL;
  vec3 color=AMB*base+Lo+base*uEmissive;
  if(uSelected) color=mix(color,vec3(0.48,0.44,0.88),0.25);
  gl_FragColor=vec4(color,uOpacity);
}`;

const VERT_FLAT = `
attribute vec3 aPos;
uniform mat4 uMVP;
void main(){gl_Position=uMVP*vec4(aPos,1.0);}`;

const FRAG_FLAT = `
precision mediump float;
uniform vec4 uColor;
void main(){gl_FragColor=uColor;}`;

// ============================================================
// WEBGL STATE
// ============================================================
let gl, canvas, W, H;
let progPBR, progFlat;
let sceneObjects = [], selectedObj = null, objectCounter = 0;
let collisionEnabled = true;
let libraryModels = [];
let wireframeGlobal = false, gridVisible = true;
let animFrameId;
let fpsFrames = 0, fpsLast = performance.now(), fpsCur = 0;

let cam = {
  eye: [3,3,5], target: [0,0,0], up: [0,1,0],
  phi: Math.atan2(3,5),
  theta: Math.asin(3/Math.hypot(3,3,5)),
  radius: Math.hypot(3,3,5),
  fov: 55*Math.PI/180, near: 0.01, far: 500,
};

let gridVAO = { vbo: null, count: 0 };

// ============================================================
// INIT
// ============================================================
function initGL() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true, alpha: false });
  if (!gl) { alert('WebGL não suportado!'); return; }
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  progPBR  = makeProgram(VERT_PBR, FRAG_PBR);
  progFlat = makeProgram(VERT_FLAT, FRAG_FLAT);
  buildGrid();
  onResize();
  window.addEventListener('resize', onResize);
  setupMouseControls();
  initThumbRenderer();
  buildLibraryPrimitives();
  setupTransformWidgets();
  animate();
}

function makeProgram(vsrc, fsrc) {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsrc); gl.compileShader(vs);
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) console.error('VS:', gl.getShaderInfoLog(vs));
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsrc); gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) console.error('FS:', gl.getShaderInfoLog(fs));
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.error('Prog:', gl.getProgramInfoLog(prog));
  return prog;
}

function onResize() {
  const vp = document.getElementById('viewport');
  W = vp.clientWidth; H = vp.clientHeight;
  canvas.width = W; canvas.height = H;
  gl.viewport(0, 0, W, H);
}

// ============================================================
// GRID
// ============================================================
function buildGrid() {
  const verts = [], n = 20, step = 1;
  for (let i = -n; i <= n; i++) {
    verts.push(i*step, 0, -n*step, i*step, 0, n*step);
    verts.push(-n*step, 0, i*step, n*step, 0, i*step);
  }
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gridVAO = { vbo, count: verts.length/3 };
}

// ============================================================
// CAMERA
// ============================================================
function getViewMatrix() { return M4.lookAt(cam.eye, cam.target, cam.up); }
function getProjMatrix() { return M4.perspective(cam.fov, W/H, cam.near, cam.far); }
function updateCamFromOrbit() {
  const r = cam.radius, cosT = Math.cos(cam.theta);
  cam.eye = [
    cam.target[0] + r*cosT*Math.sin(cam.phi),
    cam.target[1] + r*Math.sin(cam.theta),
    cam.target[2] + r*cosT*Math.cos(cam.phi),
  ];
}

// ============================================================
// MOUSE CONTROLS
// ============================================================
let mouse = { down: false, btn: 0, x: 0, y: 0, sx: 0, sy: 0, dragged: false };
function setupMouseControls() {
  canvas.addEventListener('mousedown', e => {
    mouse.down = true; mouse.btn = e.button;
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.sx = e.clientX; mouse.sy = e.clientY;
    mouse.dragged = false;
    e.preventDefault();
  });
  canvas.addEventListener('mousemove', e => {
    if (!mouse.down) return;
    const dx = e.clientX - mouse.x, dy = e.clientY - mouse.y;
    mouse.x = e.clientX; mouse.y = e.clientY;
    const totalD = Math.hypot(e.clientX - mouse.sx, e.clientY - mouse.sy);
    if (totalD > 6) mouse.dragged = true;
    if (!mouse.dragged) return;
    if (mouse.btn === 0) {
      cam.phi -= dx * 0.007;
      cam.theta = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, cam.theta + dy*0.007));
      updateCamFromOrbit();
    }
  });
  canvas.addEventListener('mouseup', e => {
    if (!mouse.dragged && mouse.btn === 0) pickObject(e);
    mouse.down = false; mouse.dragged = false;
  });
  window.addEventListener('mouseup', () => { if (mouse.down) { mouse.down = false; mouse.dragged = false; } });
  canvas.addEventListener('wheel', e => {
    cam.radius = Math.max(0.5, Math.min(80, cam.radius * (1 + e.deltaY*0.001)));
    updateCamFromOrbit();
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

// ============================================================
// RAY PICKING
// ============================================================
function pickObject(e) {
  const rect = canvas.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / W) * 2 - 1;
  const ny = -((e.clientY - rect.top) / H) * 2 + 1;
  const proj = getProjMatrix(), view = getViewMatrix();
  const invProj = M4.inv(proj), invView = M4.inv(view);
  const clip = [nx, ny, -1, 1];
  const eyeX = invProj[0]*clip[0]+invProj[4]*clip[1]+invProj[8]*clip[2]+invProj[12]*clip[3];
  const eyeY = invProj[1]*clip[0]+invProj[5]*clip[1]+invProj[9]*clip[2]+invProj[13]*clip[3];
  const eyeZ = invProj[2]*clip[0]+invProj[6]*clip[1]+invProj[10]*clip[2]+invProj[14]*clip[3];
  const eyeW = invProj[3]*clip[0]+invProj[7]*clip[1]+invProj[11]*clip[2]+invProj[15]*clip[3];
  const viewPos = [eyeX/eyeW, eyeY/eyeW, eyeZ/eyeW];
  const rd = [
    invView[0]*viewPos[0]+invView[4]*viewPos[1]+invView[8]*viewPos[2],
    invView[1]*viewPos[0]+invView[5]*viewPos[1]+invView[9]*viewPos[2],
    invView[2]*viewPos[0]+invView[6]*viewPos[1]+invView[10]*viewPos[2],
  ];
  const ro = cam.eye, rdN = V3.norm(rd);
  let bestT = Infinity, bestObj = null;
  sceneObjects.forEach(obj => {
    if (!obj.visible) return;
    const tAABB = rayAABB(ro, rdN, obj);
    if (!(tAABB > 0 && tAABB < bestT)) return;
    const tMesh = rayObjectIntersection(ro, rdN, obj);
    if (tMesh > 0 && tMesh < bestT) { bestT = tMesh; bestObj = obj; }
  });
  if (bestObj) {
    selectObject(bestObj);
  } else {
    selectedObj = null;
    document.getElementById('props-content').style.display = 'none';
    document.getElementById('no-selection').style.display = '';
    document.getElementById('sb-selected').textContent = 'Nenhum selecionado';
    updateSceneTree();
  }
}

function rayObjectIntersection(ro, rd, obj) {
  const invM = M4.inv(obj.modelMatrix);
  const lo = [
    invM[0]*ro[0]+invM[4]*ro[1]+invM[8]*ro[2]+invM[12],
    invM[1]*ro[0]+invM[5]*ro[1]+invM[9]*ro[2]+invM[13],
    invM[2]*ro[0]+invM[6]*ro[1]+invM[10]*ro[2]+invM[14],
  ];
  const ld = [
    invM[0]*rd[0]+invM[4]*rd[1]+invM[8]*rd[2],
    invM[1]*rd[0]+invM[5]*rd[1]+invM[9]*rd[2],
    invM[2]*rd[0]+invM[6]*rd[1]+invM[10]*rd[2],
  ];
  const dir = V3.norm(ld);
  let best = Infinity;
  obj.meshes.forEach(mesh => {
    const pos = mesh.geo.pos, idx = mesh.geo.idx;
    for (let i = 0; i < idx.length; i += 3) {
      const a=idx[i]*3, b=idx[i+1]*3, c=idx[i+2]*3;
      const t = rayTriangleIntersect(lo,
        [pos[a],pos[a+1],pos[a+2]],
        [pos[b],pos[b+1],pos[b+2]],
        [pos[c],pos[c+1],pos[c+2]], dir);
      if (t > 0 && t < best) best = t;
    }
  });
  return best === Infinity ? Infinity : best;
}

function rayTriangleIntersect(orig, a, b, c, dir) {
  const edge1 = [b[0]-a[0], b[1]-a[1], b[2]-a[2]];
  const edge2 = [c[0]-a[0], c[1]-a[1], c[2]-a[2]];
  const p = V3.cross(dir, edge2);
  const det = V3.dot(edge1, p);
  if (Math.abs(det) < 1e-8) return null;
  const invDet = 1/det;
  const tvec = [orig[0]-a[0], orig[1]-a[1], orig[2]-a[2]];
  const u = V3.dot(tvec, p) * invDet;
  if (u < 0 || u > 1) return null;
  const q = V3.cross(tvec, edge1);
  const v = V3.dot(dir, q) * invDet;
  if (v < 0 || u+v > 1) return null;
  const t = V3.dot(edge2, q) * invDet;
  return t > 1e-5 ? t : null;
}

function rayAABB(ro, rd, obj) {
  const invM = M4.inv(obj.modelMatrix);
  const lo = [
    invM[0]*ro[0]+invM[4]*ro[1]+invM[8]*ro[2]+invM[12],
    invM[1]*ro[0]+invM[5]*ro[1]+invM[9]*ro[2]+invM[13],
    invM[2]*ro[0]+invM[6]*ro[1]+invM[10]*ro[2]+invM[14],
  ];
  const ld = [
    invM[0]*rd[0]+invM[4]*rd[1]+invM[8]*rd[2],
    invM[1]*rd[0]+invM[5]*rd[1]+invM[9]*rd[2],
    invM[2]*rd[0]+invM[6]*rd[1]+invM[10]*rd[2],
  ];
  const mn = obj.aabbMin, mx = obj.aabbMax;
  let tmin = -Infinity, tmax = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(ld[i]) < 1e-8) continue;
    const t1=(mn[i]-lo[i])/ld[i], t2=(mx[i]-lo[i])/ld[i];
    tmin = Math.max(tmin, Math.min(t1,t2));
    tmax = Math.min(tmax, Math.max(t1,t2));
  }
  return tmax >= tmin && tmax > 0 ? tmin : Infinity;
}

// ============================================================
// GEOMETRY BUILDERS
// ============================================================
function makeBox(w=1, h=1, d=1) {
  const hw=w/2, hh=h/2, hd=d/2;
  const pos=[], nor=[], uv=[], idx=[];
  const faces = [
    [[ hw,-hh,-hd],[ hw, hh,-hd],[ hw, hh, hd],[ hw,-hh, hd],[1,0,0]],
    [[-hw,-hh, hd],[-hw, hh, hd],[-hw, hh,-hd],[-hw,-hh,-hd],[-1,0,0]],
    [[-hw, hh,-hd],[-hw, hh, hd],[ hw, hh, hd],[ hw, hh,-hd],[0,1,0]],
    [[-hw,-hh, hd],[-hw,-hh,-hd],[ hw,-hh,-hd],[ hw,-hh, hd],[0,-1,0]],
    [[-hw,-hh, hd],[ hw,-hh, hd],[ hw, hh, hd],[-hw, hh, hd],[0,0,1]],
    [[ hw,-hh,-hd],[-hw,-hh,-hd],[-hw, hh,-hd],[ hw, hh,-hd],[0,0,-1]],
  ];
  const uvs = [[0,0],[0,1],[1,1],[1,0]];
  faces.forEach(([p0,p1,p2,p3,n]) => {
    const base = pos.length/3;
    [p0,p1,p2,p3].forEach((p,i) => { pos.push(...p); nor.push(...n); uv.push(...uvs[i]); });
    idx.push(base,base+1,base+2,base,base+2,base+3);
  });
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

function makeSphere(r=0.6, lat=24, lon=24) {
  const pos=[], nor=[], uv=[], idx=[];
  for (let i=0; i<=lat; i++) {
    const t=i/lat, phi=Math.PI*t-Math.PI/2;
    for (let j=0; j<=lon; j++) {
      const s=j/lon, th=2*Math.PI*s;
      const x=Math.cos(phi)*Math.cos(th), y=Math.sin(phi), z=Math.cos(phi)*Math.sin(th);
      pos.push(x*r,y*r,z*r); nor.push(x,y,z); uv.push(s,t);
    }
  }
  for (let i=0; i<lat; i++) for (let j=0; j<lon; j++) {
    const a=i*(lon+1)+j, b=a+lon+1;
    idx.push(a,b,a+1,b,b+1,a+1);
  }
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

function makeCylinder(rTop=0.5, rBot=0.5, h=1.2, segs=32) {
  const pos=[], nor=[], uv=[], idx=[];
  const hh = h/2;
  for (let i=0; i<=segs; i++) {
    const a=2*Math.PI*i/segs, c=Math.cos(a), s=Math.sin(a);
    for (let k=0; k<=1; k++) {
      const y=k===0?-hh:hh, r2=k===0?rBot:rTop;
      pos.push(r2*c, y, r2*s); nor.push(c,0,s); uv.push(i/segs, k);
    }
  }
  for (let i=0; i<segs; i++) { const b=i*2; idx.push(b,b+2,b+1,b+1,b+2,b+3); }
  const addCap = (y, r2, flip) => {
    const ci = pos.length/3;
    pos.push(0,y,0); nor.push(0,flip?-1:1,0); uv.push(0.5,0.5);
    for (let i=0; i<=segs; i++) {
      const a=2*Math.PI*i/segs;
      pos.push(r2*Math.cos(a),y,r2*Math.sin(a)); nor.push(0,flip?-1:1,0);
      uv.push(0.5+0.5*Math.cos(a), 0.5+0.5*Math.sin(a));
    }
    for (let i=0; i<segs; i++) {
      if (flip) idx.push(ci,ci+i+2,ci+i+1); else idx.push(ci,ci+i+1,ci+i+2);
    }
  };
  addCap(-hh, rBot, true); addCap(hh, rTop, false);
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

function makeTorus(R=0.5, r=0.2, segsR=40, segsr=16) {
  const pos=[], nor=[], uv=[], idx=[];
  for (let i=0; i<=segsR; i++) {
    const u=2*Math.PI*i/segsR, cu=Math.cos(u), su=Math.sin(u);
    for (let j=0; j<=segsr; j++) {
      const v=2*Math.PI*j/segsr, cv=Math.cos(v), sv=Math.sin(v);
      pos.push((R+r*cv)*cu, r*sv, (R+r*cv)*su); nor.push(cv*cu,sv,cv*su); uv.push(i/segsR,j/segsr);
    }
  }
  for (let i=0; i<segsR; i++) for (let j=0; j<segsr; j++) {
    const a=i*(segsr+1)+j, b=a+segsr+1;
    idx.push(a,b,a+1,b,b+1,a+1);
  }
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

function makeCone(r=0.6, h=1.4, segs=32) { return makeCylinder(0, r, h, segs); }

function makePlane(w=2, d=2, sw=1, sd=1) {
  const pos=[], nor=[], uv=[], idx=[];
  for (let i=0; i<=sd; i++) for (let j=0; j<=sw; j++) {
    const x=(j/sw-0.5)*w, z=(i/sd-0.5)*d;
    pos.push(x,0,z); nor.push(0,1,0); uv.push(j/sw,i/sd);
  }
  for (let i=0; i<sd; i++) for (let j=0; j<sw; j++) {
    const a=i*(sw+1)+j;
    idx.push(a,a+sw+1,a+1,a+1,a+sw+1,a+sw+2);
  }
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

function makeTorusKnot(R=0.4, r=0.12, p=2, q=3, segs=128, tubeSegs=16) {
  function pt(t) {
    const phi=2*Math.PI*t, r1=Math.cos(q*phi), r2=Math.sin(q*phi);
    return [(2+r1)*Math.cos(p*phi)*R, (2+r1)*Math.sin(p*phi)*R, r2*R];
  }
  const pos=[], nor=[], uv=[], idx=[];
  for (let i=0; i<=segs; i++) {
    const u=i/segs, c=pt(u), n=pt(u+0.01);
    const T=V3.norm(V3.sub(n,c));
    let B=V3.norm(V3.cross(T,[0,1,0]));
    if (V3.len(B)<0.001) B=V3.norm(V3.cross(T,[1,0,0]));
    const N=V3.cross(T,B);
    for (let j=0; j<=tubeSegs; j++) {
      const v=2*Math.PI*j/tubeSegs, cv=Math.cos(v), sv=Math.sin(v);
      const nx=N[0]*cv+B[0]*sv, ny=N[1]*cv+B[1]*sv, nz=N[2]*cv+B[2]*sv;
      pos.push(c[0]+nx*r, c[1]+ny*r, c[2]+nz*r); nor.push(nx,ny,nz); uv.push(u,j/tubeSegs);
    }
  }
  for (let i=0; i<segs; i++) for (let j=0; j<tubeSegs; j++) {
    const a=i*(tubeSegs+1)+j, b=a+tubeSegs+1;
    idx.push(a,b,a+1,b,b+1,a+1);
  }
  return { pos:new Float32Array(pos), nor:new Float32Array(nor), uv:new Float32Array(uv), idx:new Uint16Array(idx) };
}

// ============================================================
// GPU MESH UPLOAD
// ============================================================
function uploadMesh(geo) {
  const posVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posVbo);
  gl.bufferData(gl.ARRAY_BUFFER, geo.pos, gl.STATIC_DRAW);
  const norVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, norVbo);
  gl.bufferData(gl.ARRAY_BUFFER, geo.nor, gl.STATIC_DRAW);
  const uvVbo = geo.uv ? gl.createBuffer() : null;
  if (uvVbo) { gl.bindBuffer(gl.ARRAY_BUFFER, uvVbo); gl.bufferData(gl.ARRAY_BUFFER, geo.uv, gl.STATIC_DRAW); }
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);
  return { posVbo, norVbo, uvVbo, ibo, count: geo.idx.length, geo };
}

function computeAABB(posArr) {
  let mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
  for (let i=0; i<posArr.length; i+=3) {
    mn[0]=Math.min(mn[0],posArr[i]); mn[1]=Math.min(mn[1],posArr[i+1]); mn[2]=Math.min(mn[2],posArr[i+2]);
    mx[0]=Math.max(mx[0],posArr[i]); mx[1]=Math.max(mx[1],posArr[i+1]); mx[2]=Math.max(mx[2],posArr[i+2]);
  }
  return { mn, mx };
}

// ============================================================
// SCENE OBJECT
// ============================================================
function createSceneObject(meshes, name, mat=null) {
  const id = 'obj_' + (++objectCounter);
  let mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
  meshes.forEach(m => {
    const a = computeAABB(m.geo.pos);
    mn[0]=Math.min(mn[0],a.mn[0]); mn[1]=Math.min(mn[1],a.mn[1]); mn[2]=Math.min(mn[2],a.mn[2]);
    mx[0]=Math.max(mx[0],a.mx[0]); mx[1]=Math.max(mx[1],a.mx[1]); mx[2]=Math.max(mx[2],a.mx[2]);
  });
  const obj = {
    id, name, meshes,
    pos:[0,0,0], rot:[0,0,0], sca:[1,1,1],
    modelMatrix: M4.id(),
    aabbMin: mn, aabbMax: mx,
    visible: true,
    material: mat || { baseColor:[1,1,1], metallic:0, roughness:0.5, opacity:1, emissive:0, wireframe:false },
    animations:[], currentClip:-1, animTime:0, animSpeed:1, playing:false,
    texture: null,
    moveTarget:[0,0,0], moveOrigin:null, moveSpeed:2, moveMode:'once', isMoving:false,
  };
  updateModelMatrix(obj);
  sceneObjects.push(obj);
  updateSceneTree();
  selectObject(obj);
  updateStatusBar();
  return obj;
}

function updateModelMatrix(obj) {
  const t=obj.pos, r=obj.rot, s=obj.sca;
  const mx = M4.mul(M4.translation(t[0],t[1],t[2]), M4.mul(M4.rotY(r[1]), M4.mul(M4.rotX(r[0]), M4.rotZ(r[2]))));
  obj.modelMatrix = M4.mul(mx, M4.scale(s[0],s[1],s[2]));
}

// ============================================================
// RENDER
// ============================================================
function renderScene() {
  gl.clearColor(0.067, 0.067, 0.075, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const proj=getProjMatrix(), view=getViewMatrix(), vp=M4.mul(proj,view);

  // Grid
  if (gridVisible) {
    gl.useProgram(progFlat);
    gl.uniformMatrix4fv(gl.getUniformLocation(progFlat,'uMVP'), false, vp);
    gl.uniform4f(gl.getUniformLocation(progFlat,'uColor'), 0.18,0.18,0.22,1);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridVAO.vbo);
    const aPos = gl.getAttribLocation(progFlat,'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINES, 0, gridVAO.count);
    gl.disableVertexAttribArray(aPos);
  }

  // Ground
  gl.useProgram(progPBR);
  {
    const gm = uploadMesh(makePlane(40,40));
    gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uMVP'), false, vp);
    gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uModel'), false, M4.id());
    gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uNormalMat'), false, M4.id());
    gl.uniform3fv(gl.getUniformLocation(progPBR,'uCamPos'), cam.eye);
    gl.uniform3f(gl.getUniformLocation(progPBR,'uBaseColor'), 0.1,0.1,0.14);
    gl.uniform1f(gl.getUniformLocation(progPBR,'uMetallic'), 0);
    gl.uniform1f(gl.getUniformLocation(progPBR,'uRoughness'), 0.9);
    gl.uniform1f(gl.getUniformLocation(progPBR,'uOpacity'), 1);
    gl.uniform1f(gl.getUniformLocation(progPBR,'uEmissive'), 0);
    gl.uniform1i(gl.getUniformLocation(progPBR,'uHasTexture'), 0);
    gl.uniform1i(gl.getUniformLocation(progPBR,'uSelected'), 0);
    bindMeshAndDraw(gm, progPBR, false);
    gl.deleteBuffer(gm.posVbo); gl.deleteBuffer(gm.norVbo); gl.deleteBuffer(gm.ibo);
  }

  // Scene objects
  sceneObjects.forEach(obj => {
    if (!obj.visible) return;
    const mvp = M4.mul(vp, obj.modelMatrix);
    const nm  = M4.transposeInv(obj.modelMatrix);
    const mat = obj.material;
    obj.meshes.forEach(mesh => {
      const wire = wireframeGlobal || mat.wireframe;
      if (wire) {
        gl.useProgram(progFlat);
        gl.uniformMatrix4fv(gl.getUniformLocation(progFlat,'uMVP'), false, mvp);
        gl.uniform4fv(gl.getUniformLocation(progFlat,'uColor'), obj===selectedObj ? [0.6,0.55,1,1] : [0.4,0.4,0.5,1]);
        bindMeshAndDraw(mesh, progFlat, true);
      } else {
        gl.useProgram(progPBR);
        gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uMVP'), false, mvp);
        gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uModel'), false, obj.modelMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(progPBR,'uNormalMat'), false, nm);
        gl.uniform3fv(gl.getUniformLocation(progPBR,'uCamPos'), cam.eye);
        gl.uniform3fv(gl.getUniformLocation(progPBR,'uBaseColor'), mat.baseColor);
        gl.uniform1f(gl.getUniformLocation(progPBR,'uMetallic'), mat.metallic);
        gl.uniform1f(gl.getUniformLocation(progPBR,'uRoughness'), mat.roughness);
        gl.uniform1f(gl.getUniformLocation(progPBR,'uOpacity'), mat.opacity);
        gl.uniform1f(gl.getUniformLocation(progPBR,'uEmissive'), mat.emissive);
        gl.uniform1i(gl.getUniformLocation(progPBR,'uHasTexture'), mesh.texture ? 1 : 0);
        gl.uniform1i(gl.getUniformLocation(progPBR,'uSelected'), obj===selectedObj ? 1 : 0);
        if (mesh.texture) {
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, mesh.texture);
          gl.uniform1i(gl.getUniformLocation(progPBR,'uTex'), 0);
        }
        bindMeshAndDraw(mesh, progPBR, false);
      }
    });
  });
}

function bindMeshAndDraw(mesh, prog, lines) {
  const aPos = gl.getAttribLocation(prog,'aPos');
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.posVbo);
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  if (!lines) {
    const aNorm = gl.getAttribLocation(prog,'aNorm');
    if (aNorm >= 0 && mesh.norVbo) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.norVbo);
      gl.enableVertexAttribArray(aNorm);
      gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);
    }
    const aUV = gl.getAttribLocation(prog,'aUV');
    if (aUV >= 0 && mesh.uvVbo) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvVbo);
      gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    }
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
  if (lines) gl.drawElements(gl.LINES, mesh.count, gl.UNSIGNED_SHORT, 0);
  else       gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
  gl.disableVertexAttribArray(aPos);
  const aN = gl.getAttribLocation(prog,'aNorm'); if (aN >= 0) gl.disableVertexAttribArray(aN);
  const aU = gl.getAttribLocation(prog,'aUV');   if (aU >= 0) gl.disableVertexAttribArray(aU);
}

// ============================================================
// ANIMATION LOOP
// ============================================================
let lastTime = 0;
function animate(ts=0) {
  animFrameId = requestAnimationFrame(animate);
  const dt = (ts - lastTime) / 1000; lastTime = ts;

  sceneObjects.forEach(obj => {
    if (!obj.playing || obj.currentClip < 0 || !obj.animations.length) return;
    const clip = obj.animations[obj.currentClip];
    if (!clip) return;
    obj.animTime += dt * obj.animSpeed;
    if (obj.animTime > clip.duration) obj.animTime = clip.duration > 0 ? obj.animTime % clip.duration : 0;
    applyClipToObject(obj, clip, obj.animTime);
  });

  sceneObjects.forEach(obj => {
    if (!obj.isMoving || !obj.moveTarget) return;
    const dx=obj.moveTarget[0]-obj.pos[0], dy=obj.moveTarget[1]-obj.pos[1], dz=obj.moveTarget[2]-obj.pos[2];
    const dist = Math.hypot(dx,dy,dz);
    const step = (obj.moveSpeed||2) * dt;
    if (dist <= step) {
      obj.pos = [...obj.moveTarget];
      if (obj.moveMode === 'loop' && obj.moveOrigin) {
        obj.pos = [...obj.moveOrigin];
      } else if (obj.moveMode === 'pingpong' && obj.moveOrigin) {
        const tmp = [...obj.moveTarget]; obj.moveTarget = [...obj.moveOrigin]; obj.moveOrigin = tmp;
      } else {
        obj.isMoving = false;
      }
    } else {
      obj.pos[0] += dx/dist*step; obj.pos[1] += dy/dist*step; obj.pos[2] += dz/dist*step;
    }
    updateModelMatrix(obj);
    if (collisionEnabled) resolveAABBCollision(obj);
    if (selectedObj === obj) {
      document.getElementById('p-x').value = r3(obj.pos[0]);
      document.getElementById('p-y').value = r3(obj.pos[1]);
      document.getElementById('p-z').value = r3(obj.pos[2]);
    }
  });

  renderScene();

  fpsFrames++;
  const now = performance.now();
  if (now - fpsLast > 600) {
    fpsCur = Math.round(fpsFrames / ((now - fpsLast) / 1000));
    fpsFrames = 0; fpsLast = now;
    document.getElementById('sb-fps').textContent = 'FPS: ' + fpsCur;
  }
}

// ============================================================
// GLTF LOADER
// ============================================================
async function loadGLTF(buffer, name) {
  showLoading('Parseando GLTF…');
  try {
    const ab = buffer instanceof ArrayBuffer ? buffer : await buffer.arrayBuffer();
    const dv = new DataView(ab);
    let gltf, binChunk;

    if (dv.getUint32(0, true) === 0x46546C67) {
      const jsonLen = dv.getUint32(12, true);
      const jsonStr = new TextDecoder().decode(new Uint8Array(ab, 20, jsonLen));
      gltf = JSON.parse(jsonStr);
      const binStart = 20 + jsonLen + 8;
      const binLen = dv.getUint32(binStart - 8, true);
      binChunk = ab.slice(binStart, binStart + binLen);
    } else {
      gltf = JSON.parse(new TextDecoder().decode(ab));
    }

    function getAccessor(idx) {
      const acc=gltf.accessors[idx], bv=gltf.bufferViews[acc.bufferView];
      const buf=binChunk||ab, offset=(bv.byteOffset||0)+(acc.byteOffset||0);
      const comps={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[acc.type]||1;
      const TypeArr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array}[acc.componentType];
      const stride = bv.byteStride;
      if (stride && stride != comps*(TypeArr.BYTES_PER_ELEMENT)) {
        const out=new TypeArr(acc.count*comps);
        for (let i=0; i<acc.count; i++) { const sv=new TypeArr(buf,offset+i*stride,comps); out.set(sv,i*comps); }
        return out;
      }
      return new TypeArr(buf, offset, acc.count*comps);
    }

    const texCache = {};
    async function loadTex(imgIdx) {
      if (texCache[imgIdx]) return texCache[imgIdx];
      const img=gltf.images[imgIdx]; let blob;
      if (img.bufferView !== undefined) {
        const bv=gltf.bufferViews[img.bufferView];
        const data=new Uint8Array(binChunk||ab,(bv.byteOffset||0),bv.byteLength);
        blob=new Blob([data],{type:img.mimeType||'image/png'});
      }
      if (!blob) return null;
      return new Promise(res => {
        const url=URL.createObjectURL(blob), image=new Image();
        image.onload=()=>{
          const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
          URL.revokeObjectURL(url); texCache[imgIdx]=tex; res(tex);
        };
        image.onerror=()=>res(null); image.src=url;
      });
    }

    const scene = gltf.scenes[gltf.scene||0];
    const gpuMeshes = []; let allPos = [];

    async function processNode(nodeIdx, parentMat) {
      const node=gltf.nodes[nodeIdx]; let localMat=M4.id();
      if (node.matrix) { localMat=new Float32Array(node.matrix); }
      else { localMat=M4.fromTRS(node.translation||[0,0,0], node.rotation||[0,0,0,1], node.scale||[1,1,1]); }
      const worldMat = parentMat ? M4.mul(parentMat,localMat) : localMat;
      if (node.mesh !== undefined) {
        const mesh=gltf.meshes[node.mesh];
        for (const prim of mesh.primitives) {
          const posAcc=prim.attributes.POSITION, normAcc=prim.attributes.NORMAL, uvAcc=prim.attributes.TEXCOORD_0;
          if (posAcc === undefined) continue;
          const posArr=getAccessor(posAcc);
          const tPos=new Float32Array(posArr.length);
          for (let i=0; i<posArr.length; i+=3) {
            const wp=M4.transformPoint(worldMat,[posArr[i],posArr[i+1],posArr[i+2]]);
            tPos[i]=wp[0]; tPos[i+1]=wp[1]; tPos[i+2]=wp[2];
            allPos.push(wp[0],wp[1],wp[2]);
          }
          const norArr = normAcc !== undefined ? getAccessor(normAcc) : null;
          const nm2 = M4.transposeInv(worldMat); let tNor=null;
          if (norArr) {
            tNor=new Float32Array(norArr.length);
            for (let i=0; i<norArr.length; i+=3) {
              const n=[nm2[0]*norArr[i]+nm2[4]*norArr[i+1]+nm2[8]*norArr[i+2],
                       nm2[1]*norArr[i]+nm2[5]*norArr[i+1]+nm2[9]*norArr[i+2],
                       nm2[2]*norArr[i]+nm2[6]*norArr[i+1]+nm2[10]*norArr[i+2]];
              const l=Math.hypot(...n)||1; tNor[i]=n[0]/l; tNor[i+1]=n[1]/l; tNor[i+2]=n[2]/l;
            }
          }
          const uvArr = uvAcc !== undefined ? getAccessor(uvAcc) : null;
          let idxArr;
          if (prim.indices !== undefined) {
            const raw=getAccessor(prim.indices);
            idxArr = raw instanceof Uint16Array ? raw : new Uint16Array(raw);
          } else {
            idxArr=new Uint16Array(tPos.length/3); for (let i=0;i<idxArr.length;i++) idxArr[i]=i;
          }
          const geo={pos:tPos, nor:tNor||new Float32Array(tPos.length), uv:uvArr||new Float32Array(tPos.length/3*2), idx:idxArr};
          const gpuMesh=uploadMesh(geo);
          if (prim.material !== undefined && gltf.materials) {
            const mat=gltf.materials[prim.material];
            if (mat && mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture) {
              const ti=mat.pbrMetallicRoughness.baseColorTexture;
              gpuMesh.texture=await loadTex(gltf.textures[ti.index].source);
            }
          }
          gpuMeshes.push(gpuMesh);
        }
      }
      if (node.children) for (const c of node.children) await processNode(c, worldMat);
    }

    for (const ni of scene.nodes) await processNode(ni, null);

    if (allPos.length > 0) {
      let mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
      for (let i=0; i<allPos.length; i+=3) {
        mn[0]=Math.min(mn[0],allPos[i]); mn[1]=Math.min(mn[1],allPos[i+1]); mn[2]=Math.min(mn[2],allPos[i+2]);
        mx[0]=Math.max(mx[0],allPos[i]); mx[1]=Math.max(mx[1],allPos[i+1]); mx[2]=Math.max(mx[2],allPos[i+2]);
      }
      const cx=(mn[0]+mx[0])/2, cy=mn[1], cz=(mn[2]+mx[2])/2;
      const sc=2/Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2],0.001);
      gpuMeshes.forEach(mesh => {
        const pa=mesh.geo.pos;
        for (let i=0; i<pa.length; i+=3) { pa[i]=(pa[i]-cx)*sc; pa[i+1]=(pa[i+1]-cy)*sc; pa[i+2]=(pa[i+2]-cz)*sc; }
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.posVbo);
        gl.bufferData(gl.ARRAY_BUFFER, pa, gl.STATIC_DRAW);
      });
    }

    const animations = [];
    if (gltf.animations) {
      gltf.animations.forEach((anim, ai) => {
        let duration=0; const channels=[];
        anim.channels.forEach(ch => {
          const sampler=anim.samplers[ch.sampler];
          const times=getAccessor(sampler.input), values=getAccessor(sampler.output);
          duration=Math.max(duration, times[times.length-1]);
          channels.push({ nodeIdx:ch.target.node, path:ch.target.path,
            interpolation:sampler.interpolation||'LINEAR',
            times:Float32Array.from(times), values:Float32Array.from(values) });
        });
        animations.push({ name:anim.name||'Clip '+ai, duration, channels });
      });
    }

    const obj = createSceneObject(gpuMeshes, name);
    obj.animations = animations;
    if (animations.length > 0) obj.currentClip = 0;
    updatePropsPanel(); hideLoading();
    toast(`"${name}" carregado (${gpuMeshes.length} meshes)${animations.length?' + '+animations.length+' anim':''}`, 'success');
    return obj;
  } catch(e) {
    hideLoading();
    toast('Erro ao carregar GLTF: '+e.message, 'error');
    console.error(e);
  }
}

function applyClipToObject(obj, clip, t) {
  clip.channels.forEach(ch => {
    const v = sampleAnim(ch, t); if (!v) return;
    if (ch.path === 'translation') { obj.pos=[v[0],v[1],v[2]]; }
    else if (ch.path === 'rotation') {
      const [qx,qy,qz,qw]=v;
      const sinr=2*(qw*qx+qy*qz), cosr=1-2*(qx*qx+qy*qy), rx=Math.atan2(sinr,cosr);
      const sinp=2*(qw*qy-qz*qx), ry=Math.abs(sinp)>=1?Math.sign(sinp)*Math.PI/2:Math.asin(sinp);
      const siny=2*(qw*qz+qx*qy), cosy=1-2*(qy*qy+qz*qz), rz=Math.atan2(siny,cosy);
      obj.rot=[rx,ry,rz];
    }
    else if (ch.path === 'scale') { obj.sca=[v[0],v[1],v[2]]; }
    updateModelMatrix(obj);
  });
}

function sampleAnim(ch, t) {
  const {times, values, interpolation} = ch;
  if (!times.length) return null;
  const c = getComponents(ch);
  if (t <= times[0]) return Array.from(values.slice(0, c));
  if (t >= times[times.length-1]) return Array.from(values.slice(-c));
  let lo=0, hi=times.length-1;
  while (lo+1 < hi) { const m=(lo+hi)>>1; times[m]<=t?lo=m:hi=m; }
  const a=(t-times[lo])/(times[hi]-times[lo]);
  const va=Array.from(values.slice(lo*c,(lo+1)*c)), vb=Array.from(values.slice(hi*c,(hi+1)*c));
  if (interpolation === 'STEP') return va;
  if (ch.path === 'rotation') return Q.slerp(va,vb,a);
  return va.map((v,i) => v+(vb[i]-v)*a);
}

function getComponents(ch) {
  return { translation:3, scale:3, rotation:4, weights:1 }[ch.path] || 3;
}

// ============================================================
// OBJ LOADER
// ============================================================
function loadOBJ(text, name) {
  const lines=text.split('\n');
  const positions=[], normals=[], texcoords=[];
  const posOut=[], norOut=[], uvOut=[], idxOut=[];
  const vertMap={}; let vi=0;
  lines.forEach(line => {
    const parts=line.trim().split(/\s+/);
    if (parts[0]==='v') positions.push(parseFloat(parts[1]),parseFloat(parts[2]),parseFloat(parts[3]));
    else if (parts[0]==='vn') normals.push(parseFloat(parts[1]),parseFloat(parts[2]),parseFloat(parts[3]));
    else if (parts[0]==='vt') texcoords.push(parseFloat(parts[1]),parseFloat(parts[2])||0);
    else if (parts[0]==='f') {
      const faceVerts=parts.slice(1).map(s => {
        const [pi,ti,ni]=s.split('/').map(x=>parseInt(x)||0);
        const key=`${pi}/${ti}/${ni}`;
        if (vertMap[key]===undefined) {
          const p=(pi>0?pi-1:positions.length/3+pi)*3;
          posOut.push(positions[p],positions[p+1],positions[p+2]);
          if (ni>0){const n=(ni-1)*3;norOut.push(normals[n],normals[n+1],normals[n+2]);}else norOut.push(0,1,0);
          if (ti>0){const t2=(ti-1)*2;uvOut.push(texcoords[t2],texcoords[t2+1]);}else uvOut.push(0,0);
          vertMap[key]=vi++;
        }
        return vertMap[key];
      });
      for (let i=1; i<faceVerts.length-1; i++) idxOut.push(faceVerts[0],faceVerts[i],faceVerts[i+1]);
    }
  });
  let mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity];
  for (let i=0; i<posOut.length; i+=3) {
    mn[0]=Math.min(mn[0],posOut[i]); mn[1]=Math.min(mn[1],posOut[i+1]); mn[2]=Math.min(mn[2],posOut[i+2]);
    mx[0]=Math.max(mx[0],posOut[i]); mx[1]=Math.max(mx[1],posOut[i+1]); mx[2]=Math.max(mx[2],posOut[i+2]);
  }
  const cx=(mn[0]+mx[0])/2, cy=mn[1], cz=(mn[2]+mx[2])/2;
  const sc=2/Math.max(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2],0.001);
  for (let i=0;i<posOut.length;i+=3){posOut[i]=(posOut[i]-cx)*sc;posOut[i+1]=(posOut[i+1]-cy)*sc;posOut[i+2]=(posOut[i+2]-cz)*sc;}
  const chunkSize=65535, meshes=[];
  for (let start=0; start<idxOut.length; start+=chunkSize*3) {
    const chunk=idxOut.slice(start,start+chunkSize*3);
    const minIdx=Math.min(...chunk), localIdx=new Uint16Array(chunk.map(i=>i-minIdx));
    const vc=Math.max(...chunk)-minIdx+1;
    meshes.push(uploadMesh({
      pos:new Float32Array(posOut.slice(minIdx*3,(minIdx+vc)*3)),
      nor:new Float32Array(norOut.slice(minIdx*3,(minIdx+vc)*3)),
      uv: new Float32Array(uvOut.slice(minIdx*2,(minIdx+vc)*2)),
      idx:localIdx,
    }));
  }
  const mat={baseColor:randColor(),metallic:0,roughness:0.5,opacity:1,emissive:0,wireframe:false};
  const obj=createSceneObject(meshes, name, mat);
  toast(`"${name}" (OBJ) carregado, ${meshes.length} chunk(s)`, 'success');
  return obj;
}

// ============================================================
// THUMBNAIL RENDERER
// ============================================================
let thumbCtx=null, _tGeos=null;
function initThumbRenderer() {
  const tc=document.createElement('canvas'); tc.width=64; tc.height=64;
  const tgl=tc.getContext('webgl',{antialias:true,preserveDrawingBuffer:true,alpha:false});
  if (!tgl) return;
  const vs=tgl.createShader(tgl.VERTEX_SHADER);
  tgl.shaderSource(vs,`attribute vec3 aPos;attribute vec3 aNorm;uniform mat4 uMVP;uniform mat4 uNM;varying vec3 vN;void main(){vN=normalize((uNM*vec4(aNorm,0.0)).xyz);gl_Position=uMVP*vec4(aPos,1.0);}`);
  tgl.compileShader(vs);
  const fs=tgl.createShader(tgl.FRAGMENT_SHADER);
  tgl.shaderSource(fs,`precision mediump float;varying vec3 vN;uniform vec3 uColor;void main(){vec3 L=normalize(vec3(0.7,1.2,0.9));float d=max(dot(normalize(vN),L),0.0);float rim=pow(1.0-max(dot(normalize(vN),normalize(vec3(1.8,1.4,2.2))),0.0),3.0)*0.18;vec3 c=uColor*(0.2+0.8*d)+vec3(rim);gl_FragColor=vec4(c,1.0);}`);
  tgl.compileShader(fs);
  const prog=tgl.createProgram(); tgl.attachShader(prog,vs); tgl.attachShader(prog,fs); tgl.linkProgram(prog);
  tgl.enable(tgl.DEPTH_TEST); tgl.enable(tgl.CULL_FACE); tgl.cullFace(tgl.BACK);
  thumbCtx={canvas:tc, gl:tgl, prog};
}

function _tGeo() {
  if (_tGeos) return _tGeos;
  _tGeos={box:makeBox(.85,.85,.85),sph:makeSphere(.6,14,14),cone:makeCone(.55,1.3,20),flat:makeBox(.8,.32,.8)};
  return _tGeos;
}

function makeThumb(geo, color) {
  if (!thumbCtx) return null;
  const {canvas,gl:g,prog}=thumbCtx;
  g.viewport(0,0,64,64); g.clearColor(.09,.09,.13,1); g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);
  const pb=g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER,pb); g.bufferData(g.ARRAY_BUFFER,geo.pos,g.STATIC_DRAW);
  const nb=g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER,nb); g.bufferData(g.ARRAY_BUFFER,geo.nor,g.STATIC_DRAW);
  const ib=g.createBuffer(); g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,ib); g.bufferData(g.ELEMENT_ARRAY_BUFFER,geo.idx,g.STATIC_DRAW);
  const proj=M4.perspective(42*Math.PI/180,1,.01,100);
  const view=M4.lookAt([1.8,1.4,2.2],[0,0,0],[0,1,0]);
  const model=M4.rotY(Math.PI/8);
  const mvp=M4.mul(proj,M4.mul(view,model)), nm=M4.transposeInv(model);
  g.useProgram(prog);
  g.uniformMatrix4fv(g.getUniformLocation(prog,'uMVP'),false,mvp);
  g.uniformMatrix4fv(g.getUniformLocation(prog,'uNM'),false,nm);
  g.uniform3fv(g.getUniformLocation(prog,'uColor'),new Float32Array(color));
  const ap=g.getAttribLocation(prog,'aPos'); g.bindBuffer(g.ARRAY_BUFFER,pb); g.enableVertexAttribArray(ap); g.vertexAttribPointer(ap,3,g.FLOAT,false,0,0);
  const an=g.getAttribLocation(prog,'aNorm'); g.bindBuffer(g.ARRAY_BUFFER,nb); g.enableVertexAttribArray(an); g.vertexAttribPointer(an,3,g.FLOAT,false,0,0);
  g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,ib);
  g.drawElements(g.TRIANGLES,geo.idx.length,g.UNSIGNED_SHORT,0);
  g.disableVertexAttribArray(ap); g.disableVertexAttribArray(an);
  g.deleteBuffer(pb); g.deleteBuffer(nb); g.deleteBuffer(ib);
  return canvas.toDataURL('image/png');
}

function thumbForModel(name) {
  const geos=_tGeo(), n=name.toLowerCase();
  let geo, color;
  if (/tree|palm/.test(n)) { geo=geos.cone; color=[.14,.48,.18]; }
  else if (/bush|shrub/.test(n)) { geo=geos.sph; color=[.22,.58,.16]; }
  else if (/grass/.test(n)) { geo=geos.flat; color=[.38,.68,.16]; }
  else if (/rock|stone/.test(n)) { geo=geos.sph; color=[.52,.50,.46]; }
  else {
    geo=geos.box;
    let h=0; for (const c of name) h=(h*31+c.charCodeAt(0))&0xFFFFFF;
    color=[((h>>16)&0xFF)/255*.5+.25, ((h>>8)&0xFF)/255*.5+.25, (h&0xFF)/255*.5+.25];
  }
  return makeThumb(geo, color);
}

// ============================================================
// LIBRARY
// ============================================================
function buildLibraryPrimitives() {
  libraryModels = [];
  (async () => {
    try {
      const resp = await fetch('assets/');
      if (resp.ok) {
        const text = await resp.text();
        const hrefs = [], re = /href\s*=\s*"([^"]+)"/gi; let m;
        while ((m=re.exec(text)) !== null) {
          if (/\.(obj|glb|gltf)$/i.test(m[1])) hrefs.push(new URL(m[1], resp.url).toString());
        }
        const seen = new Set();
        hrefs.forEach(u => {
          const name=u.split('/').pop();
          if (seen.has(name)) return; seen.add(name);
          libraryModels.push({ id:'asset-'+name, name, emoji:'📦', type:'Asset', url:u });
        });
        libraryModels.forEach(m => { try { m.thumb=thumbForModel(m.name); } catch(e){} });
      }
    } catch(e) {
      console.warn('Could not read assets directory:', e);
    } finally {
      renderLibrary();
    }
  })();
}

function renderLibrary() {
  const scroll = document.getElementById('models-scroll');
  scroll.innerHTML = '';
  libraryModels.forEach(m => {
    const div = document.createElement('div');
    div.className = 'model-item';
    const thumbEl = m.thumb
      ? `<img class="model-thumb-img" src="${m.thumb}" alt="${m.name}">`
      : `<div class="model-thumb">${m.emoji||'📦'}</div>`;
    div.innerHTML = `${thumbEl}
      <div class="model-info"><div class="model-name">${m.name}</div><div class="model-type">${m.type}</div></div>
      <div class="model-add" title="Adicionar">+</div>`;
    div.querySelector('.model-add').addEventListener('click', e => { e.stopPropagation(); addToScene(m.id); });
    div.addEventListener('dblclick', () => addToScene(m.id));
    scroll.appendChild(div);
  });
}

function addToScene(id) {
  const m = libraryModels.find(x => x.id === id);
  if (!m) return;
  if (m.fn) {
    const mesh = uploadMesh(m.fn());
    const mat = { baseColor:randColor(), metallic:0, roughness:0.5, opacity:1, emissive:0, wireframe:false };
    const obj = createSceneObject([mesh], m.name, mat);
    obj.libId = m.id;
    toast(`${m.name} adicionado`, 'success');
  } else if (m.url) {
    if (/\.obj$/i.test(m.url)) {
      fetch(m.url).then(r=>r.text()).then(txt=>{ const o=loadOBJ(txt,m.name); if(o)o.libId=m.id; }).catch(()=>toast('Falha ao carregar OBJ','error'));
    } else if (/\.(glb|gltf)$/i.test(m.url)) {
      fetch(m.url).then(r=>r.arrayBuffer()).then(buf=>loadGLTF(buf,m.name).then(o=>{ if(o)o.libId=m.id; })).catch(()=>toast('Falha ao carregar GLTF/GLB','error'));
    } else {
      toast('Formato não suportado', 'error');
    }
  } else if (m.buffer) {
    loadGLTF(m.buffer, m.name).then(o=>{ if(o)o.libId=m.id; });
  }
}

// ============================================================
// SCENE TREE UI
// ============================================================
function updateSceneTree() {
  const scroll=document.getElementById('scene-scroll'), empty=document.getElementById('scene-empty');
  scroll.innerHTML='';
  if (sceneObjects.length === 0) { scroll.appendChild(empty); empty.style.display=''; return; }
  empty.style.display='none';
  sceneObjects.forEach(obj => {
    const div=document.createElement('div');
    div.className='scene-item'+(selectedObj===obj?' selected':'');
    div.innerHTML=`<span class="icon">${obj.animations.length?'🎬':'◈'}</span>
      <span class="label">${obj.name}</span><span class="del">✕</span>`;
    div.addEventListener('click', ()=>selectObject(obj));
    div.querySelector('.del').addEventListener('click', e=>{ e.stopPropagation(); removeObject(obj.id); });
    scroll.appendChild(div);
  });
}

function selectObject(obj) {
  selectedObj = obj;
  document.getElementById('props-content').style.display = obj ? '' : 'none';
  document.getElementById('no-selection').style.display  = obj ? 'none' : '';
  updateSceneTree();
  try { updatePropsPanel(); } catch(err) { console.error('updatePropsPanel error:', err); }
  document.getElementById('sb-selected').textContent = obj ? 'Selecionado: '+obj.name : 'Nenhum selecionado';
}

function removeObject(id) {
  const idx=sceneObjects.findIndex(o=>o.id===id); if (idx<0) return;
  const obj=sceneObjects[idx];
  obj.meshes.forEach(m=>{
    gl.deleteBuffer(m.posVbo); gl.deleteBuffer(m.norVbo);
    if (m.uvVbo) gl.deleteBuffer(m.uvVbo); gl.deleteBuffer(m.ibo);
  });
  sceneObjects.splice(idx,1);
  if (selectedObj && selectedObj.id===id) {
    selectedObj=null;
    document.getElementById('props-content').style.display='none';
    document.getElementById('no-selection').style.display='';
  }
  updateSceneTree(); updateStatusBar();
  toast(obj.name+' removido');
}

// ============================================================
// PROPERTIES PANEL
// ============================================================
function updatePropsPanel() {
  if (!selectedObj) {
    document.getElementById('props-content').style.display='none';
    document.getElementById('no-selection').style.display='';
    return;
  }
  document.getElementById('props-content').style.display='';
  document.getElementById('no-selection').style.display='none';
  const obj=selectedObj;
  document.getElementById('p-x').value=r3(obj.pos[0]);
  document.getElementById('p-y').value=r3(obj.pos[1]);
  document.getElementById('p-z').value=r3(obj.pos[2]);
  document.getElementById('r-x').value=r3(obj.rot[0]*180/Math.PI);
  document.getElementById('r-y').value=r3(obj.rot[1]*180/Math.PI);
  document.getElementById('r-z').value=r3(obj.rot[2]*180/Math.PI);
  document.getElementById('s-x').value=r3(obj.sca[0]);
  document.getElementById('s-y').value=r3(obj.sca[1]);
  document.getElementById('s-z').value=r3(obj.sca[2]);
  const avg=r3((obj.sca[0]+obj.sca[1]+obj.sca[2])/3);
  document.getElementById('sl-scale').value=Math.min(5,Math.max(0.05,avg));
  document.getElementById('val-scale').textContent=avg.toFixed(2);
  const mat=obj.material;
  const hex='#'+mat.baseColor.map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');
  document.getElementById('mat-color').value=hex;
  document.getElementById('mat-color-hex').value=hex;
  document.getElementById('sl-opacity').value=mat.opacity;
  document.getElementById('val-opacity').textContent=mat.opacity.toFixed(2);
  // Movement
  const mt=obj.moveTarget||[0,0,0];
  document.getElementById('mv-x').value=r3(mt[0]);
  document.getElementById('mv-y').value=r3(mt[1]);
  document.getElementById('mv-z').value=r3(mt[2]);
  const ms=obj.moveSpeed||2;
  document.getElementById('sl-move-speed').value=ms;
  document.getElementById('val-move-speed').textContent=ms.toFixed(1);
  document.getElementById('move-mode').value=obj.moveMode||'once';
}

function applyTransform(axis) {
  if (!selectedObj) return;
  const obj=selectedObj;
  obj.pos=[
    parseFloat(document.getElementById('p-x').value)||0,
    parseFloat(document.getElementById('p-y').value)||0,
    parseFloat(document.getElementById('p-z').value)||0,
  ];
  obj.rot=[
    (parseFloat(document.getElementById('r-x').value)||0)*Math.PI/180,
    (parseFloat(document.getElementById('r-y').value)||0)*Math.PI/180,
    (parseFloat(document.getElementById('r-z').value)||0)*Math.PI/180,
  ];
  const sx=parseFloat(document.getElementById('s-x').value)||1;
  const sy=parseFloat(document.getElementById('s-y').value)||1;
  const sz=parseFloat(document.getElementById('s-z').value)||1;
  const uniform=document.getElementById('uniform-scale').checked;
  if (uniform && axis) {
    const v=axis==='x'?sx:axis==='y'?sy:sz;
    obj.sca=[v,v,v];
    document.getElementById('s-x').value=r3(v);
    document.getElementById('s-y').value=r3(v);
    document.getElementById('s-z').value=r3(v);
  } else {
    obj.sca=[sx,sy,sz];
  }
  updateModelMatrix(obj);
}

function applyScaleSlider() {
  if (!selectedObj) return;
  const v=parseFloat(document.getElementById('sl-scale').value)||1;
  document.getElementById('val-scale').textContent=v.toFixed(2);
  document.getElementById('s-x').value=r3(v);
  document.getElementById('s-y').value=r3(v);
  document.getElementById('s-z').value=r3(v);
  selectedObj.sca=[v,v,v];
  updateModelMatrix(selectedObj);
}

function applyMaterial() {
  if (!selectedObj) return;
  const mat=selectedObj.material;
  const hex=document.getElementById('mat-color').value;
  document.getElementById('mat-color-hex').value=hex;
  mat.baseColor=[parseInt(hex.slice(1,3),16)/255, parseInt(hex.slice(3,5),16)/255, parseInt(hex.slice(5,7),16)/255];
  mat.opacity=parseFloat(document.getElementById('sl-opacity').value);
  document.getElementById('val-opacity').textContent=mat.opacity.toFixed(2);
}

function syncColorFromHex() {
  const hex=document.getElementById('mat-color-hex').value;
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) { document.getElementById('mat-color').value=hex; applyMaterial(); }
}

function applyVisibility() { if (selectedObj) selectedObj.visible=true; }

function playClip(i) {
  if (!selectedObj) return;
  selectedObj.currentClip=i; selectedObj.animTime=0; selectedObj.playing=true;
}
function stopClip() { if (selectedObj) selectedObj.playing=false; }

// ============================================================
// COLLISION SYSTEM
// ============================================================
function toggleCollision() {
  collisionEnabled=!collisionEnabled;
  document.getElementById('btn-collision').classList.toggle('active', collisionEnabled);
  toast('Colisão '+(collisionEnabled?'ativada':'desativada'), collisionEnabled?'success':'');
}

function getWorldAABB(obj) {
  const mn=obj.aabbMin, mx=obj.aabbMax, sx=obj.sca[0], sy=obj.sca[1], sz=obj.sca[2];
  const cx=obj.pos[0], cy=obj.pos[1], cz=obj.pos[2];
  return {
    min:[cx+(sx>=0?mn[0]*sx:mx[0]*sx), cy+(sy>=0?mn[1]*sy:mx[1]*sy), cz+(sz>=0?mn[2]*sz:mx[2]*sz)],
    max:[cx+(sx>=0?mx[0]*sx:mn[0]*sx), cy+(sy>=0?mx[1]*sy:mn[1]*sy), cz+(sz>=0?mx[2]*sz:mn[2]*sz)],
  };
}

function aabbOverlap(a, b) {
  return a.min[0]<b.max[0] && a.max[0]>b.min[0] &&
         a.min[1]<b.max[1] && a.max[1]>b.min[1] &&
         a.min[2]<b.max[2] && a.max[2]>b.min[2];
}

function resolveAABBCollision(obj) {
  for (let pass=0; pass<3; pass++) {
    let any=false;
    const a=getWorldAABB(obj);
    for (const other of sceneObjects) {
      if (other===obj || !other.visible) continue;
      const b=getWorldAABB(other);
      if (!aabbOverlap(a,b)) continue;
      any=true;
      const ox=Math.min(a.max[0]-b.min[0],b.max[0]-a.min[0]);
      const oy=Math.min(a.max[1]-b.min[1],b.max[1]-a.min[1]);
      const oz=Math.min(a.max[2]-b.min[2],b.max[2]-a.min[2]);
      if (ox<=oy && ox<=oz) { obj.pos[0]+=a.min[0]<b.min[0]?-ox:ox; }
      else if (oy<=ox && oy<=oz) { obj.pos[1]+=a.min[1]<b.min[1]?-oy:oy; }
      else { obj.pos[2]+=a.min[2]<b.min[2]?-oz:oz; }
      Object.assign(a, getWorldAABB(obj));
    }
    if (!any) break;
  }
}

// ============================================================
// MOVEMENT
// ============================================================
function applyMoveTarget() {
  if (!selectedObj) return;
  selectedObj.moveTarget=[
    parseFloat(document.getElementById('mv-x').value)||0,
    parseFloat(document.getElementById('mv-y').value)||0,
    parseFloat(document.getElementById('mv-z').value)||0,
  ];
}
function applyMoveSpeed() {
  const v=parseFloat(document.getElementById('sl-move-speed').value)||2;
  document.getElementById('val-move-speed').textContent=v.toFixed(1);
  if (selectedObj) selectedObj.moveSpeed=v;
}
function applyMoveMode() { if (selectedObj) selectedObj.moveMode=document.getElementById('move-mode').value; }
function startMovement() {
  if (!selectedObj) return;
  applyMoveTarget();
  selectedObj.moveOrigin=[...selectedObj.pos];
  selectedObj.isMoving=true;
  toast('Movimento iniciado', 'success');
}
function stopMovement() { if (selectedObj) { selectedObj.isMoving=false; toast('Movimento parado'); } }
function setMoveTargetFromPos() {
  if (!selectedObj) return;
  const p=selectedObj.pos;
  document.getElementById('mv-x').value=r3(p[0]);
  document.getElementById('mv-y').value=r3(p[1]);
  document.getElementById('mv-z').value=r3(p[2]);
  applyMoveTarget();
  toast('Destino definido como posição atual');
}

// ============================================================
// TRANSFORM DRAG WIDGETS
// ============================================================
function setupTransformWidgets() {
  setupJoyPad('joy-move','joy-move-k',(dx,dy)=>{
    if (!selectedObj) return;
    const v=getViewMatrix();
    const rightX=v[0], rightZ=v[8], fwdX=-v[2], fwdZ=-v[10];
    const rl=Math.hypot(rightX,rightZ)||1, fl=Math.hypot(fwdX,fwdZ)||1;
    const s=Math.max(0.3,cam.radius)*0.003;
    selectedObj.pos[0]+=(rightX/rl*dx - fwdX/fl*dy)*s;
    selectedObj.pos[2]+=(rightZ/rl*dx - fwdZ/fl*dy)*s;
    if (collisionEnabled) resolveAABBCollision(selectedObj);
    updateModelMatrix(selectedObj);
    document.getElementById('p-x').value=r3(selectedObj.pos[0]);
    document.getElementById('p-z').value=r3(selectedObj.pos[2]);
  });
  setupJoyStrip('joy-height','joy-height-k',dy=>{
    if (!selectedObj) return;
    selectedObj.pos[1]-=dy*Math.max(0.3,cam.radius)*0.003;
    if (collisionEnabled) resolveAABBCollision(selectedObj);
    updateModelMatrix(selectedObj);
    document.getElementById('p-y').value=r3(selectedObj.pos[1]);
  });
  setupJoyPad('joy-rot','joy-rot-k',(dx,dy)=>{
    if (!selectedObj) return;
    selectedObj.rot[1]+=dx*0.013; selectedObj.rot[0]+=dy*0.013;
    updateModelMatrix(selectedObj);
    document.getElementById('r-y').value=r3(selectedObj.rot[1]*180/Math.PI);
    document.getElementById('r-x').value=r3(selectedObj.rot[0]*180/Math.PI);
  });
  setupJoyStrip('joy-rot-z','joy-rot-z-k',dy=>{
    if (!selectedObj) return;
    selectedObj.rot[2]+=dy*0.013;
    updateModelMatrix(selectedObj);
    document.getElementById('r-z').value=r3(selectedObj.rot[2]*180/Math.PI);
  });
  const makeScaleStrip=(id,kid,axis)=>setupJoyStrip(id,kid,dy=>{
    if (!selectedObj) return;
    selectedObj.sca[axis]=Math.max(0.001,selectedObj.sca[axis]-dy*0.005);
    updateModelMatrix(selectedObj);
    document.getElementById(['s-x','s-y','s-z'][axis]).value=r3(selectedObj.sca[axis]);
    const avg=r3((selectedObj.sca[0]+selectedObj.sca[1]+selectedObj.sca[2])/3);
    document.getElementById('sl-scale').value=avg;
    document.getElementById('val-scale').textContent=avg.toFixed(2);
  });
  makeScaleStrip('joy-scl-x','joy-scl-x-k',0);
  makeScaleStrip('joy-scl-y','joy-scl-y-k',1);
  makeScaleStrip('joy-scl-z','joy-scl-z-k',2);
}

function setupJoyPad(padId, knobId, onDelta) {
  const pad=document.getElementById(padId), knob=document.getElementById(knobId);
  if (!pad||!knob) return;
  let active=false, lx=0, ly=0;
  pad.addEventListener('pointerdown', e=>{
    active=true; lx=e.clientX; ly=e.clientY;
    pad.setPointerCapture(e.pointerId); knob.classList.add('joy-active'); e.preventDefault();
  });
  pad.addEventListener('pointermove', e=>{
    if (!active) return;
    const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
    const rect=pad.getBoundingClientRect(), cx=rect.width/2, cy=rect.height/2;
    const ox=e.clientX-rect.left-cx, oy=e.clientY-rect.top-cy;
    const maxR=cx-6, dist=Math.hypot(ox,oy), scale=dist>maxR?maxR/dist:1;
    knob.style.left=r3(50+(ox*scale/cx)*50)+'%';
    knob.style.top =r3(50+(oy*scale/cy)*50)+'%';
    onDelta(dx,dy);
  });
  const stop=()=>{ if(!active)return; active=false; knob.classList.remove('joy-active'); knob.style.left='50%'; knob.style.top='50%'; };
  pad.addEventListener('pointerup',stop); pad.addEventListener('pointercancel',stop);
}

function setupJoyStrip(stripId, knobId, onDelta) {
  const strip=document.getElementById(stripId), knob=document.getElementById(knobId);
  if (!strip||!knob) return;
  let active=false, ly=0;
  strip.addEventListener('pointerdown', e=>{
    active=true; ly=e.clientY;
    strip.setPointerCapture(e.pointerId); knob.classList.add('joy-active'); e.preventDefault();
  });
  strip.addEventListener('pointermove', e=>{
    if (!active) return;
    const dy=e.clientY-ly; ly=e.clientY;
    const rect=strip.getBoundingClientRect();
    knob.style.top=Math.max(8,Math.min(rect.height-8,e.clientY-rect.top))+'px';
    onDelta(dy);
  });
  const stop=()=>{ if(!active)return; active=false; knob.classList.remove('joy-active'); knob.style.top='50%'; };
  strip.addEventListener('pointerup',stop); strip.addEventListener('pointercancel',stop);
}

// ============================================================
// SCENE OPERATIONS
// ============================================================
function toggleGrid() {
  gridVisible=!gridVisible;
  document.getElementById('btn-grid').classList.toggle('active', !gridVisible);
}
function toggleSection(el) {
  el.classList.toggle('collapsed');
  const body=el.nextElementSibling;
  if (body) body.style.display=el.classList.contains('collapsed')?'none':'';
}
function clearScene() {
  if (sceneObjects.length===0) return;
  if (!confirm('Remover todos os objetos?')) return;
  sceneObjects.forEach(obj=>obj.meshes.forEach(m=>{
    gl.deleteBuffer(m.posVbo); gl.deleteBuffer(m.norVbo);
    if (m.uvVbo) gl.deleteBuffer(m.uvVbo); gl.deleteBuffer(m.ibo);
  }));
  sceneObjects=[]; selectedObj=null;
  document.getElementById('props-content').style.display='none';
  document.getElementById('no-selection').style.display='';
  updateSceneTree(); updateStatusBar(); toast('Cena limpa');
}
function resetTransform() {
  if (!selectedObj) return;
  selectedObj.pos=[0,0,0]; selectedObj.rot=[0,0,0]; selectedObj.sca=[1,1,1];
  updateModelMatrix(selectedObj); updatePropsPanel();
}
function removeSelected() { if (selectedObj) removeObject(selectedObj.id); }
function updateStatusBar() { document.getElementById('sb-objects').textContent='Objetos: '+sceneObjects.length; }

// ============================================================
// SAVE / LOAD
// ============================================================
function saveScene() {
  const data={
    version:2,
    name:document.getElementById('scene-name').value,
    camera:{ target:[...cam.target], radius:cam.radius, phi:cam.phi, theta:cam.theta },
    objects:sceneObjects.map(obj=>({
      id:obj.id, name:obj.name, libId:obj.libId||null,
      pos:obj.pos, rot:obj.rot, sca:obj.sca,
      material:{...obj.material}, visible:obj.visible,
      playing:obj.playing, animSpeed:obj.animSpeed, currentClip:obj.currentClip,
      moveTarget:obj.moveTarget, moveSpeed:obj.moveSpeed, moveMode:obj.moveMode,
    }))
  };
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=(data.name||'scene')+'.json'; a.click();
  URL.revokeObjectURL(url);
  toast('Cena salva','success');
}

function handleSceneLoad(e) {
  const file=e.target.files[0]; if (!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{ try{const data=JSON.parse(ev.target.result);applySceneData(data);}catch(err){toast('Erro ao ler arquivo','error');} };
  reader.readAsText(file); e.target.value='';
}

function applySceneData(data) {
  clearScene();
  document.getElementById('scene-name').value=data.name||'Untitled';
  if (data.camera) {
    const c=data.camera;
    cam.target=Array.from(c.target||[0,0,0]);
    cam.radius=c.radius||Math.hypot(3,3,5);
    cam.phi=c.phi!=null?c.phi:Math.atan2(3,5);
    cam.theta=c.theta!=null?c.theta:Math.asin(3/Math.hypot(3,3,5));
    updateCamFromOrbit();
  }
  (async()=>{
    for (const od of data.objects||[]) {
      const lib=libraryModels.find(m=>m.id===od.libId)||libraryModels.find(m=>m.name===od.name);
      if (!lib){console.warn('Modelo não encontrado na biblioteca:',od.name);continue;}
      let obj=null;
      try {
        if (lib.fn) {
          const mesh=uploadMesh(lib.fn());
          obj=createSceneObject([mesh],od.name,{baseColor:[1,1,1],metallic:0,roughness:0.5,opacity:1,emissive:0,wireframe:false});
        } else if (lib.url) {
          showLoading('Restaurando '+od.name+'…');
          if (/\.obj$/i.test(lib.url)) { obj=loadOBJ(await fetch(lib.url).then(r=>r.text()), od.name); }
          else { obj=await loadGLTF(await fetch(lib.url).then(r=>r.arrayBuffer()), od.name); }
        } else if (lib.buffer) {
          obj=await loadGLTF(lib.buffer, od.name);
        }
      } catch(e) { console.error('Erro ao restaurar',od.name,e); continue; }
      if (!obj) continue;
      obj.libId=lib.id;
      obj.pos=Array.from(od.pos||[0,0,0]);
      obj.rot=Array.from(od.rot||[0,0,0]);
      obj.sca=Array.from(od.sca||[1,1,1]);
      if (od.material) Object.assign(obj.material,od.material);
      obj.visible=od.visible!==false;
      obj.animSpeed=od.animSpeed||1;
      obj.currentClip=od.currentClip??-1;
      if (od.moveTarget) obj.moveTarget=Array.from(od.moveTarget);
      obj.moveSpeed=od.moveSpeed||2;
      obj.moveMode=od.moveMode||'once';
      updateModelMatrix(obj);
    }
    hideLoading();
    toast(`Cena "${data.name||'Untitled'}" carregada`,'success');
    updatePropsPanel();
  })();
}

// ============================================================
// THEME
// ============================================================
function toggleTheme() {
  const dark=document.documentElement.classList.toggle('dark');
  document.getElementById('theme-btn').textContent=dark?'☀️':'🌙';
  localStorage.setItem('theme', dark?'dark':'light');
}
(function(){
  if (localStorage.getItem('theme')==='dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('theme-btn').textContent='☀️';
  }
})();

// ============================================================
// EXPORT PNG
// ============================================================
function exportPNG() {
  renderScene();
  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='scene_render.png'; a.click();
    URL.revokeObjectURL(url);
    toast('Imagem exportada','success');
  });
}

// ============================================================
// UTILS
// ============================================================
function randColor() {
  const p=[[0.48,0.44,0.88],[0.31,0.80,0.77],[0.88,0.48,0.44],[0.43,0.71,0.88],[0.88,0.79,0.43],[0.62,0.88,0.43]];
  return p[Math.floor(Math.random()*p.length)];
}
function r3(n) { return Math.round(n*1000)/1000; }
function showLoading(msg) { document.getElementById('loading-msg').textContent=msg||'Carregando…'; document.getElementById('loading').classList.add('active'); }
function hideLoading() { document.getElementById('loading').classList.remove('active'); }
let toastTimer;
function toast(msg, type='') {
  const el=document.getElementById('toast'); el.textContent=msg; el.className='show '+(type||'');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.className='',2800);
}

// ============================================================
// BOOT
// ============================================================
window.addEventListener('DOMContentLoaded', initGL);
window.addEventListener('resize', ()=>{ onResize && onResize(); });
