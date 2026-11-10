import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const viewport = $('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9dbac0);
scene.fog = new THREE.FogExp2(0x9dbac0, 0.0042);
const camera = new THREE.PerspectiveCamera(63, 1, 0.1, 500);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
const isTouchDevice = matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, isTouchDevice ? 1.35 : 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.id = 'game-canvas';
viewport.prepend(renderer.domElement);

const clock = new THREE.Clock();
const mat = (color, roughness = 0.88, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const materials = {
  grass: mat(0x657f4d), grass2: mat(0x708753), dirt: mat(0x8c8063), road: mat(0x99927b),
  concrete: mat(0x77786d), roof: mat(0x414c45), bark: mat(0x55402b), leaves: mat(0x315938),
  window: mat(0x354c4b, 0.35, 0.15), player: mat(0x405c46), enemy: mat(0x885844), skin: mat(0xc4a17c),
  pants: mat(0x303d32), weapon: mat(0x1d2520, 0.5, 0.4), gold: mat(0xe4bd5b, 0.35, 0.5)
};
scene.add(new THREE.HemisphereLight(0xdcecff, 0x455435, 1.65));
const sun = new THREE.DirectionalLight(0xffe9c9, 3.6);
sun.position.set(-55, 85, 45); sun.castShadow = true; sun.shadow.mapSize.set(isTouchDevice ? 1024 : 2048, isTouchDevice ? 1024 : 2048); sun.shadow.camera.near=1; sun.shadow.camera.far=240; sun.shadow.normalBias=.035;
Object.assign(sun.shadow.camera, { left: -115, right: 115, top: 115, bottom: -115, near: 1, far: 220 });
sun.shadow.bias = -0.00015; scene.add(sun);

const terrainGeo = new THREE.PlaneGeometry(220, 220, 180, 180);
const pos = terrainGeo.attributes.position;
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i), y = pos.getY(i);
  const hill = Math.sin(x * 0.045) * 1.25 + Math.cos(y * 0.052) * 1.0 + Math.sin((x - y) * 0.025) * 1.2 + Math.sin(x*.17)*.16*Math.cos(y*.13);
  pos.setZ(i, hill);
}
terrainGeo.computeVertexNormals();
const terrainColors = [];
for (let i=0;i<pos.count;i++){ const h=pos.getZ(i); const n=(Math.sin(pos.getX(i)*.31+pos.getY(i)*.17)*.5+.5)*.12; const c=new THREE.Color().setRGB(.25+n, .34+n+Math.max(0,h)*.008, .19+n*.35); terrainColors.push(c.r,c.g,c.b); }
terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));
materials.grass.vertexColors = true; materials.grass.color.set(0xffffff);
const terrain = new THREE.Mesh(terrainGeo, materials.grass);
terrain.rotation.x = -Math.PI / 2; terrain.receiveShadow = true; scene.add(terrain);

const water = new THREE.Mesh(new THREE.PlaneGeometry(520,520), new THREE.MeshStandardMaterial({color:0x426b79,roughness:.32,metalness:.12})); water.rotation.x=-Math.PI/2; water.position.y=-3.6; scene.add(water);
// Lightweight instanced grass gives the island surface detail without thousands of draw calls.
const grassBlade = new THREE.ConeGeometry(.075,.42,4); const grassField = new THREE.InstancedMesh(grassBlade, new THREE.MeshStandardMaterial({color:0x8da65d,roughness:1}), isTouchDevice?420:900); const grassDummy=new THREE.Object3D(); const grassTint=new THREE.Color();
for(let i=0;i<grassField.count;i++){const gx=THREE.MathUtils.randFloatSpread(205),gz=THREE.MathUtils.randFloatSpread(205);grassDummy.position.set(gx,terrainY(gx,gz)+.13,gz);grassDummy.rotation.set(0,Math.random()*Math.PI,THREE.MathUtils.randFloat(-.12,.12));const sc=THREE.MathUtils.randFloat(.45,1.15);grassDummy.scale.set(sc,sc,sc);grassDummy.updateMatrix();grassField.setMatrixAt(i,grassDummy.matrix);grassTint.setHSL(.22+Math.random()*.06,.25,.32+Math.random()*.12);grassField.setColorAt(i,grassTint);}grassField.castShadow=false;grassField.receiveShadow=true;scene.add(grassField);

function addBox(parent, x, y, z, sx, sy, sz, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function terrainY(x, z) { return Math.sin(x * 0.045) * 1.25 + Math.cos(z * 0.052) * 1.0 + Math.sin((x + z) * 0.025) * 1.2 + Math.sin(x*.17)*.16*Math.cos(z*.13); }
function makeTree(x, z, scale = 1) {
  solidBuildings.push({x,z,rx:.62*scale,rz:.62*scale,kind:'tree'});
  const g = new THREE.Group(); g.position.set(x, terrainY(x, z), z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.2 * scale, .32 * scale, 2.5 * scale, 8), materials.bark);
  trunk.position.y = 1.25 * scale; trunk.castShadow = true; g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const crown = new THREE.Mesh(new THREE.ConeGeometry((1.45 - i * .16) * scale, 2.45 * scale, 8), materials.leaves);
    crown.position.y = (2.9 + i * .65) * scale; crown.castShadow = true; g.add(crown);
  }
  scene.add(g); return g;
}
const solidBuildings = [];
function makeBuilding(x, z, scale = 1) {
  solidBuildings.push({x,z,rx:4.35*scale,rz:3.85*scale,kind:'building'});
  const g = new THREE.Group(); g.position.set(x, terrainY(x, z), z);
  addBox(g, 0, 2.1 * scale, 0, 8 * scale, 4.2 * scale, 7 * scale, materials.concrete);
  const roofMesh = new THREE.Mesh(new THREE.ConeGeometry(6.3*scale,2.0*scale,4), materials.roof); roofMesh.rotation.y=Math.PI/4; roofMesh.position.y=5.25*scale; roofMesh.castShadow=true; g.add(roofMesh);
  for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) addBox(g, i * 2.3 * scale, 2.5 * scale, side * 3.53 * scale, 1.0 * scale, 1.25 * scale, .08, materials.window, false);
  addBox(g, 0, 1.05 * scale, 3.56 * scale, 1.2 * scale, 2.1 * scale, .1, materials.bark, false);
  scene.add(g); return g;
}
// Roads and a small settlement.
for (const [x, z, w, d] of [[0, 0, 220, 5], [0, 0, 5, 220], [-35, -25, 65, 3], [40, 35, 62, 3]]) {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(w, d), materials.road);
  road.rotation.x = -Math.PI / 2; road.position.set(x, terrainY(x, z) + .04, z); scene.add(road);
}
[[-34,-30,1.15],[-26,-29,.9],[31,-34,1.1],[42,-28,.9],[-38,33,1.1],[34,39,1.1],[0,-56,.85],[57,13,.9],[-58,5,1.1],[58,54,.85]].forEach(([x,z,s]) => makeBuilding(x,z,s));
for (let i = 0; i < (isTouchDevice ? 72 : 150); i++) {
  const x = THREE.MathUtils.randFloatSpread(195), z = THREE.MathUtils.randFloatSpread(195);
  if ((Math.abs(x) < 14 || Math.abs(z) < 12) || (Math.abs(x) < 18 && Math.abs(z) < 18)) continue;
  makeTree(x, z, THREE.MathUtils.randFloat(.7, 1.3));
}
for (let i = 0; i < (isTouchDevice ? 16 : 30); i++) {
  const x = THREE.MathUtils.randFloatSpread(185), z = THREE.MathUtils.randFloatSpread(185);
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(.5, 1.8), 1), mat(0x737967));
  rock.position.set(x, terrainY(x,z) + .35, z); rock.scale.y = .65; rock.castShadow = true; scene.add(rock); solidBuildings.push({x,z,rx:1.05,rz:1.05,kind:'rock'});
}
for (let i = 0; i < (isTouchDevice ? 18 : 30); i++) {
  const a = i / (isTouchDevice ? 18 : 30) * Math.PI * 2, r = 112 + Math.random() * 8;
  const hill = new THREE.Mesh(new THREE.ConeGeometry(THREE.MathUtils.randFloat(8, 16), THREE.MathUtils.randFloat(14, 28), 8), mat(0x637c63));
  hill.position.set(Math.cos(a) * r, 5, Math.sin(a) * r); scene.add(hill);
}

function makeOperator(bodyMaterial) {
  const root = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.42, .78, 5, 9), bodyMaterial); torso.position.y = 1.45; torso.castShadow = true; root.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.29, 16, 12), materials.skin); head.position.y = 2.23; head.castShadow = true; root.add(head);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x26382d)); helmet.position.y = 2.35; root.add(helmet);
  for (const x of [-.25, .25]) { const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .64, 4, 7), materials.pants); leg.position.set(x, .52, 0); root.add(leg); const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.58,4,7),bodyMaterial); arm.position.set(x*1.85,1.48,-.03); arm.rotation.z=-x*.65; root.add(arm); }
  const pack=addBox(root,0,1.52,.36,.55,.72,.28,mat(0x344235));
  const rifle = addBox(root, .37, 1.52, -.3, .15, .15, 1.15, materials.weapon); rifle.rotation.x = .1;
  return root;
}
const player = makeOperator(materials.player); scene.add(player);
const enemies = [];
for (let i = 0; i < (isTouchDevice ? 8 : 10); i++) {
  const model = makeOperator(mat(i % 2 ? 0x815542 : 0x625c47));
  const a = Math.random() * Math.PI * 2, r = 28 + Math.random() * 58;
  model.position.set(Math.cos(a) * r, terrainY(Math.cos(a)*r, Math.sin(a)*r), Math.sin(a) * r); scene.add(model);
  enemies.push({ model, hp: 100, alive: true, speed: 2.1 + Math.random() * 1.2, cooldown: Math.random() * 2, wander: 1 + Math.random() * 3, tx: THREE.MathUtils.randFloatSpread(110), tz: THREE.MathUtils.randFloatSpread(110) });
}
const loot = [];
for (let i = 0; i < (isTouchDevice ? 18 : 26); i++) {
  const g = new THREE.Group(), x = THREE.MathUtils.randFloatSpread(165), z = THREE.MathUtils.randFloatSpread(165);
  const kind = i % 4 === 0 ? 'med' : i % 5 === 0 ? 'armor' : 'ammo';
  const color = kind === 'med' ? 0x66d68a : kind === 'armor' ? 0x69a9e4 : 0xe6bd51;
  const crate = new THREE.Mesh(new THREE.BoxGeometry(.85, .62, .85), mat(color, .45, .15)); crate.position.y = .5; crate.castShadow = true; g.add(crate);
  const light = new THREE.PointLight(color, 1.4, 5); light.position.y = 1.3; g.add(light);
  g.position.set(x, terrainY(x,z), z); scene.add(g); loot.push({ group: g, kind, taken: false });
}
const zoneRing = new THREE.Mesh(new THREE.TorusGeometry(85, .4, 8, 180), new THREE.MeshBasicMaterial({ color: 0x3bc9ff }));
zoneRing.rotation.x = Math.PI / 2; zoneRing.position.y = .2; scene.add(zoneRing);
const zoneWall = new THREE.Mesh(new THREE.CylinderGeometry(85, 85, 22, 96, 1, true), new THREE.MeshBasicMaterial({ color: 0x258dfc, transparent: true, opacity: .07, side: THREE.DoubleSide, depthWrite: false }));
zoneWall.position.y = 11; scene.add(zoneWall);
const bulletGeometry = new THREE.SphereGeometry(.12, 8, 6);
const bullets = [], hostileBullets = [];
const mini = $('minimap'), miniCtx = mini.getContext('2d');
let active = false, paused = false, finished = false, health = 100, armor = 50, ammo = 30, reserve = 120, medkits = 2, kills = 0, elapsed = 0, zoneRadius = 85, reloadTimer = 0, fireTimer = 0, shooting = false;
let yaw = 0, pitch = .18, verticalSpeed = 0, grounded = true, keys = {}, pointerLocked = false, lastFrame = 0;
const cameraTarget = new THREE.Vector3(), cameraOffset = new THREE.Vector3(), move = new THREE.Vector3(), forward = new THREE.Vector3(), right = new THREE.Vector3();
function updateHud() {
  $('alive').textContent = 1 + enemies.filter(e => e.alive).length; $('kills').textContent = kills;
  $('zone-stat').textContent = Math.round(zoneRadius / 85 * 100) + '%';
  $('time').textContent = String(Math.floor(elapsed / 60)).padStart(2,'0') + ':' + String(Math.floor(elapsed % 60)).padStart(2,'0');
  $('health-value').textContent = Math.ceil(health) + ' / 100'; $('health-bar').style.width = Math.max(0, health) + '%';
  $('armor-value').textContent = Math.ceil(armor) + ' / 100'; $('armor-bar').style.width = Math.max(0, armor) + '%';
  $('ammo-value').textContent = ammo + ' / ' + reserve; $('ammo-bar').style.width = ammo / 30 * 100 + '%'; $('medkit-count').textContent = medkits + ' MEDKITS';
}
function toast(text) { $('toast').textContent = text; }
function clearProjectiles(list) { for (const b of list) scene.remove(b.mesh); list.length = 0; }
function resetGame() {
  player.position.set(0, terrainY(0,0), 0); player.visible = true; yaw = 0; pitch = .18; verticalSpeed = 0; grounded = true;
  health = 100; armor = 50; ammo = 30; reserve = 120; medkits = 2; kills = 0; elapsed = 0; zoneRadius = 85; reloadTimer = 0; fireTimer = 0; finished = false; paused = false;
  enemies.forEach((e, i) => { const a = i / enemies.length * Math.PI * 2, r = 34 + Math.random() * 45; const x = Math.cos(a) * r, z = Math.sin(a) * r; e.model.position.set(x, terrainY(x,z), z); e.model.visible = true; e.hp = 100; e.alive = true; e.cooldown = Math.random() * 2; e.wander = 1 + Math.random() * 3; });
  loot.forEach(l => { l.taken = false; l.group.visible = true; });
  clearProjectiles(bullets); clearProjectiles(hostileBullets);
  zoneRing.scale.setScalar(1); zoneWall.scale.set(1,1,1);
  updateHud(); toast('MISSION ACTIVE — Secure equipment and survive.');
}
function spawnBullet(origin, direction, hostile = false) {
  const mesh = new THREE.Mesh(bulletGeometry, new THREE.MeshBasicMaterial({ color: hostile ? 0xff735e : 0xffefad }));
  mesh.position.copy(origin); scene.add(mesh);
  (hostile ? hostileBullets : bullets).push({ mesh, velocity: direction.clone().multiplyScalar(hostile ? 32 : 68), life: hostile ? 2.2 : 1.5, hostile });
}
function shoot() {
  if (!active || paused || finished || reloadTimer > 0 || fireTimer > 0) return;
  if (ammo <= 0) { toast('OUT OF AMMO — PRESS R TO RELOAD'); return; }
  ammo--; fireTimer = .12;
  const flatForward = new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
  const origin = player.position.clone().add(new THREE.Vector3(0, 1.55, 0)).addScaledVector(flatForward, .9);
  // Fire toward the actual camera reticle so mouse/touch aiming matches the shot.
  const viewDirection = camera.getWorldDirection(new THREE.Vector3());
  const aimPoint = camera.position.clone().addScaledVector(viewDirection, 100);
  const direction = aimPoint.sub(origin).normalize();
  spawnBullet(origin, direction); updateHud();
}
function enemyShoot(enemy) {
  const origin = enemy.model.position.clone().add(new THREE.Vector3(0, 1.55, 0));
  const target = player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const direction = target.sub(origin).normalize();
  direction.x += (Math.random() - .5) * .12; direction.y += (Math.random() - .5) * .06; direction.z += (Math.random() - .5) * .12; direction.normalize();
  spawnBullet(origin, direction, true);
}
function doReload() { if (reloadTimer <= 0 && ammo < 30 && reserve > 0) { reloadTimer = 1.45; toast('RELOADING…'); } }
function doHeal() { if (medkits > 0 && health < 100) { medkits--; health = Math.min(100, health + 40); toast('MEDKIT USED'); updateHud(); } else toast('NO MEDKIT AVAILABLE'); }
function finish(win) {
  if (finished) return; finished = true; active = false;
  if (document.pointerLockElement === renderer.domElement) document.exitPointerLock();
  $('end-title').textContent = win ? 'CHICKEN DINNER!' : 'ELIMINATED';
  $('end-summary').innerHTML = `Eliminations: <b>${kills}</b><br>Survival time: <b>${Math.floor(elapsed)} seconds</b>`;
  $('end-screen').classList.remove('hidden');
}
function damagePlayer(amount) {
  const absorbed = Math.min(armor, amount * .65); armor -= absorbed; health -= amount - absorbed;
}
function updateBullets(list, dt) {
  for (let i = list.length - 1; i >= 0; i--) {
    const b = list[i];
    const previous = b.mesh.position.clone();
    b.mesh.position.addScaledVector(b.velocity, dt); b.life -= dt; let hit = false;
    if (!b.hostile) {
      for (const e of enemies) {
        if (!e.alive) continue;
        const center = e.model.position.clone().add(new THREE.Vector3(0,1.25,0));
        if (pointSegmentDistance(center, previous, b.mesh.position) < .9) { e.hp -= 38; hit = true; if (e.hp <= 0) { e.alive = false; e.model.visible = false; kills++; toast('HOSTILE OPERATOR ELIMINATED'); } break; }
      }
    } else {
      const target = player.position.clone().add(new THREE.Vector3(0,1.1,0));
      if (pointSegmentDistance(target, previous, b.mesh.position) < .9) { damagePlayer(12); hit = true; }
    }
    // Bullets stop at the ground instead of travelling through the island.
    if (b.mesh.position.y < terrainY(b.mesh.position.x,b.mesh.position.z) + .15) hit = true;
    if (hit || b.life <= 0 || b.mesh.position.length() > 260) { scene.remove(b.mesh); list.splice(i,1); }
  }
}
function drawMinimap() {
  const w = mini.width, h = mini.height; miniCtx.clearRect(0,0,w,h);
  miniCtx.fillStyle = '#304b35'; miniCtx.fillRect(0,0,w,h);
  miniCtx.strokeStyle = '#849274'; miniCtx.lineWidth = 5; miniCtx.beginPath(); miniCtx.moveTo(0,h/2); miniCtx.lineTo(w,h/2); miniCtx.moveTo(w/2,0); miniCtx.lineTo(w/2,h); miniCtx.stroke();
  const scale = w / 220, cx = w/2, cy = h/2;
  miniCtx.strokeStyle = '#50c8ff'; miniCtx.lineWidth = 2; miniCtx.beginPath(); miniCtx.arc(cx,cy,zoneRadius*scale,0,Math.PI*2); miniCtx.stroke();
  for (const e of enemies) if (e.alive) { miniCtx.fillStyle = '#e87560'; miniCtx.beginPath(); miniCtx.arc(cx + e.model.position.x*scale, cy + e.model.position.z*scale, 3, 0, Math.PI*2); miniCtx.fill(); }
  miniCtx.fillStyle = '#fff0b0'; miniCtx.beginPath(); miniCtx.arc(cx + player.position.x*scale, cy + player.position.z*scale, 4, 0, Math.PI*2); miniCtx.fill();
}
function resolveWorldCollision(entity, radius = .48) {
  // Resolve the operator against building footprints, tree trunks and rocks.
  for (const obstacle of solidBuildings) {
    const dx = entity.position.x - obstacle.x;
    const dz = entity.position.z - obstacle.z;
    const rx = obstacle.rx + radius;
    const rz = obstacle.rz + radius;
    if (Math.abs(dx) >= rx || Math.abs(dz) >= rz) continue;
    const nx = Math.abs(dx) / rx;
    const nz = Math.abs(dz) / rz;
    if (nx > nz) entity.position.x = obstacle.x + Math.sign(dx || 1) * rx;
    else entity.position.z = obstacle.z + Math.sign(dz || 1) * rz;
  }
  entity.position.x = THREE.MathUtils.clamp(entity.position.x, -105, 105);
  entity.position.z = THREE.MathUtils.clamp(entity.position.z, -105, 105);
}
function pointSegmentDistance(point, start, end) {
  const segment = end.clone().sub(start);
  const lengthSq = segment.lengthSq();
  if (lengthSq < 1e-8) return point.distanceTo(start);
  const t = THREE.MathUtils.clamp(point.clone().sub(start).dot(segment) / lengthSq, 0, 1);
  return point.distanceTo(start.clone().addScaledVector(segment, t));
}
function update(dt) {
  elapsed += dt; if (fireTimer > 0) fireTimer -= dt;
  if (reloadTimer > 0) { reloadTimer -= dt; if (reloadTimer <= 0) { const amount = Math.min(30-ammo,reserve); ammo += amount; reserve -= amount; toast('RELOAD COMPLETE'); } }
  forward.set(Math.sin(yaw),0,-Math.cos(yaw)); right.set(Math.cos(yaw),0,Math.sin(yaw)); move.set(0,0,0);
  if (keys.w || keys.arrowup) move.add(forward); if (keys.s || keys.arrowdown) move.sub(forward);
  if (keys.d || keys.arrowright) move.add(right); if (keys.a || keys.arrowleft) move.sub(right);
  if (move.lengthSq() > 0) { move.normalize(); const speed = keys.shift ? 13 : 7.2; player.position.addScaledVector(move,speed*dt); player.rotation.y = Math.atan2(move.x,move.z); }
  resolveWorldCollision(player, .5);
  if (keys.space && grounded) { verticalSpeed = 8; grounded = false; }
  if (!grounded) { verticalSpeed -= 21*dt; player.position.y += verticalSpeed*dt; if (player.position.y <= terrainY(player.position.x,player.position.z)) { player.position.y = terrainY(player.position.x,player.position.z); verticalSpeed = 0; grounded = true; } }
  else player.position.y = terrainY(player.position.x,player.position.z);
  player.rotation.y = yaw; if (shooting) shoot();
  zoneRadius = Math.max(18,85-elapsed*.17); zoneRing.scale.setScalar(zoneRadius/85); zoneWall.scale.set(zoneRadius/85,1,zoneRadius/85);
  if (Math.hypot(player.position.x,player.position.z) > zoneRadius) { health -= 8.5*dt; if (Math.floor(elapsed*2)%2===0) toast('⚠ OUTSIDE SAFE ZONE — MOVE IN!'); }
  for (const e of enemies) {
    if (!e.alive) continue;
    const p = e.model.position, dx = player.position.x-p.x, dz = player.position.z-p.z, distance = Math.hypot(dx,dz);
    e.wander -= dt;
    if (e.wander <= 0) { e.tx = THREE.MathUtils.randFloatSpread(110); e.tz = THREE.MathUtils.randFloatSpread(110); e.wander = 2 + Math.random()*3; }
    const targetPlayer = distance < 42;
    const tx = targetPlayer ? player.position.x : e.tx, tz = targetPlayer ? player.position.z : e.tz;
    const angle = Math.atan2(tx-p.x,tz-p.z);
    if (distance > 9 || !targetPlayer) { p.x += Math.sin(angle)*e.speed*dt; p.z += Math.cos(angle)*e.speed*dt; }
    resolveWorldCollision(e.model, .48);
    p.y = terrainY(p.x,p.z); e.model.rotation.y = angle;
    e.cooldown -= dt;
    if (targetPlayer && distance < 39 && e.cooldown <= 0) { e.cooldown = 1.1 + Math.random()*1.5; enemyShoot(e); }
    if (Math.hypot(p.x,p.z) > zoneRadius) { e.hp -= 3.5*dt; if (e.hp <= 0) { e.alive = false; e.model.visible = false; } }
  }
  updateBullets(bullets,dt); updateBullets(hostileBullets,dt);
  for (const item of loot) {
    if (item.taken || item.group.position.distanceTo(player.position) > 2.6) continue;
    item.taken = true; item.group.visible = false;
    if (item.kind === 'ammo') { reserve += 30; toast('AMMO PICKED UP +30'); }
    else if (item.kind === 'med') { medkits++; toast('MEDKIT PICKED UP'); }
    else { armor = Math.min(100,armor+35); toast('ARMOR PICKED UP +35'); }
  }
  if (health <= 0) { health = 0; updateHud(); finish(false); return; }
  if (enemies.every(e => !e.alive)) { updateHud(); finish(true); return; }
  updateHud(); drawMinimap();
}
function render() {
  const target = player.position.clone().add(new THREE.Vector3(0,1.55,0));
  const distance = isTouchDevice ? 7.2 : 8.8;
  cameraOffset.set(-Math.sin(yaw)*distance*Math.cos(pitch), 3.2 - Math.sin(pitch)*distance*.65, Math.cos(yaw)*distance*Math.cos(pitch));
  camera.position.lerp(target.clone().add(cameraOffset),.18);
  camera.lookAt(target.clone().add(new THREE.Vector3(Math.sin(yaw)*2, .15, -Math.cos(yaw)*2)));
  renderer.render(scene,camera);
}
function resize() { const w = viewport.clientWidth, h = viewport.clientHeight; renderer.setSize(w,h,false); camera.aspect = w/h; camera.fov = w<700 ? 72 : 63; camera.updateProjectionMatrix(); }
window.addEventListener('resize',resize); resize();
function animate(now) {
  if (!active) return;
  const dt = Math.min((now-lastFrame)/1000 || 0,.04); lastFrame = now;
  if (!paused && !finished) update(dt);
  render();
  if (active) requestAnimationFrame(animate);
}
function deploy() { resetGame(); active = true; $('start-screen').classList.add('hidden'); $('end-screen').classList.add('hidden'); $('pause-screen').classList.add('hidden'); lastFrame = 0; requestAnimationFrame(animate); }
$('deploy').addEventListener('click',deploy); $('again').addEventListener('click',deploy);
$('reload').addEventListener('click',doReload); $('heal').addEventListener('click',doHeal);
$('pause').addEventListener('click',() => {
  if (!active || finished) return; paused = !paused; if (paused) { keys = {}; shooting = false; } $('pause').innerHTML = paused ? 'RESUME <kbd>P</kbd>' : 'PAUSE <kbd>P</kbd>';
  $('pause-screen').classList.toggle('hidden',!paused);
  if (paused && document.pointerLockElement === renderer.domElement) document.exitPointerLock();
});
renderer.domElement.addEventListener('click',() => { if (active && !paused && renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock(); });
document.addEventListener('pointerlockchange',() => { pointerLocked = document.pointerLockElement === renderer.domElement; });
document.addEventListener('mousemove',e => { if (pointerLocked) { yaw -= e.movementX*.0024; pitch = THREE.MathUtils.clamp(pitch-e.movementY*.0014,-.18,.62); } });
window.addEventListener('keydown',e => { const k=e.key.toLowerCase(); keys[k]=true; if ([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault(); if(k==='r')doReload(); if(k==='h')doHeal(); if(k==='p' || k==='escape')$('pause').click(); });
window.addEventListener('keyup',e => { keys[e.key.toLowerCase()]=false; });
renderer.domElement.addEventListener('mousedown',e => { if(!isTouchDevice && e.button===0) shooting=true; }); window.addEventListener('mouseup',()=>shooting=false);
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
// Touch controls: left virtual stick for movement, drag the right side to look, buttons to act.
const stick = $('move-stick'), stickKnob = $('stick-knob');
let stickPointer=null, lookPointer=null, stickOrigin={x:0,y:0}, lastTouch={x:0,y:0};
function setStick(e){ const dx=e.clientX-stickOrigin.x, dy=e.clientY-stickOrigin.y, len=Math.hypot(dx,dy), max=48, k=Math.min(1,max/(len||1)); const x=dx*k,y=dy*k; stickKnob.style.transform=`translate(${x}px,${y}px)`; keys.w = y < -10; keys.s = y > 10; keys.a = x < -10; keys.d = x > 10; }
if(stick){
 stick.addEventListener('pointerdown',e=>{e.preventDefault();stickPointer=e.pointerId;stickOrigin={x:e.clientX,y:e.clientY};stick.setPointerCapture(e.pointerId);setStick(e);});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)setStick(e);});
 const releaseStick=e=>{if(e.pointerId!==stickPointer)return;stickPointer=null;keys.w=keys.a=keys.s=keys.d=false;stickKnob.style.transform='translate(0,0)';};
 stick.addEventListener('pointerup',releaseStick);stick.addEventListener('pointercancel',releaseStick);
}
const touchLook=$('viewport');
touchLook.addEventListener('pointerdown',e=>{if(!isTouchDevice || e.target.closest('.touch-controls') || e.target.closest('button') || !active || paused)return;lookPointer=e.pointerId;lastTouch={x:e.clientX,y:e.clientY};touchLook.setPointerCapture(e.pointerId);});
touchLook.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;const dx=e.clientX-lastTouch.x,dy=e.clientY-lastTouch.y;lastTouch={x:e.clientX,y:e.clientY};yaw-=dx*.006;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-.25,.7);});
const endLook=e=>{if(e.pointerId===lookPointer)lookPointer=null;};touchLook.addEventListener('pointerup',endLook);touchLook.addEventListener('pointercancel',endLook);
$('touch-fire')?.addEventListener('pointerdown',e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);shooting=true;});$('touch-fire')?.addEventListener('pointerup',()=>shooting=false);$('touch-fire')?.addEventListener('pointercancel',()=>shooting=false);$('touch-fire')?.addEventListener('lostpointercapture',()=>shooting=false);
$('touch-jump')?.addEventListener('pointerdown',e=>{e.preventDefault();if(grounded)keys.space=true;});$('touch-jump')?.addEventListener('pointerup',()=>keys.space=false);$('touch-jump')?.addEventListener('pointercancel',()=>keys.space=false);$('touch-jump')?.addEventListener('lostpointercapture',()=>keys.space=false);
$('touch-reload')?.addEventListener('click',doReload);$('touch-heal')?.addEventListener('click',doHeal);
$('resume')?.addEventListener('click',()=>{$('pause').click();});
$('loading').style.display='none'; toast('3D ENGINE READY — DEPLOY WHEN READY.'); drawMinimap(); render();
