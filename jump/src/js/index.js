import '../index.less';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import Player from './player';
import GameStage from './gameStage';
import Assist from './assist';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
// 设置固定观察角度
// 以(3,8,8)为视点，观察(0,0,0)
// camera.position.set(3,8,8)
// camera.lookAt(0,0,0)
camera.rotation.set(-0.7853981633974484, 0.25919993750092757, 0.2509060767339454);

window.camera = camera;
window.THREE = THREE;

// 玩家
const player = new Player();

// 游戏场景
const gameStage = new GameStage(camera);
gameStage.resetStage();


// 辅助圆
const assistCircle = new Assist(new THREE.CircleGeometry(0.2), new THREE.MeshBasicMaterial({
    color: 0x000000
}));
assistCircle.rotation.x = -Math.PI / 2;
assistCircle.position.copy(player.position);

// 置入对象
scene.add(player, gameStage, assistCircle);

const renderer = new THREE.WebGLRenderer({
    antialias: true,//是否开启反锯齿
    alpha: true,//是否可以设置背景色透明
    devicePixelRatio: window.devicePixelRatio
});
//设置设备像素比
renderer.setPixelRatio(window.devicePixelRatio);
//设置canvas尺寸
renderer.setSize(window.innerWidth, window.innerHeight);

// 塞进DOM
document.body.appendChild(renderer.domElement);

renderer.domElement.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (player.jumping || !player.alive) return;

    // 设置辅助圆的目标向量及当前位置并开始蓄力
    assistCircle.setTarget(
        player.position.clone(),
        gameStage
        .getLastCubePosition()
        .clone()
        .setY(0.25)
        .sub(player.position.clone())
        .normalize()
    );
    assistCircle.startCharge();
});

renderer.domElement.addEventListener('touchend', function (e) {
    e.preventDefault();
    if (!assistCircle.running || !player.alive) return;

    // 辅助圆停止蓄力
    assistCircle.stopCharge();

    // 计算玩家落脚点
    const here = player.position;
    const endPoint = assistCircle.position.clone();

    // 跳
    player
        .jumpByEndPosition(
            endPoint,
            // 跳之前先加一个盒子，并且可以直接判断是不是死了
            () => {
                !isInSquare(gameStage.getLastCubePosition(), endPoint) && player.dead();
                gameStage.addCube();
            }
        )
        .then(isAlive => {
            if (!isAlive) {
                // 死前挣扎动画
                assistCircle.visible = false;
                return player.deadAnimation();
            }
        })
        .then(() => {
            console.log('complete');
            if (!player.alive) {
                document.querySelector('#retry-container').classList.add('show');
            }
        });
});
/**
 * 用于判断落脚点是否在盒子内
 * @param  {THREE.Vector3} p1: {x, z}
 * @param  {THREE.Vector3} p2: {x, z}
 */
function isInSquare({
    x: x1,
    z: z1
}, {
    x: x2,
    z: z2
}) {
    return Math.abs(x1 - x2) < 1 && Math.abs(z1 - z2) < 1;
}

/**
 * 重置复活
 */
function retry() {
    document.querySelector('#retry-container').classList.remove('show');
    gameStage.resetStage();
    player.reset();
    assistCircle.resetPosition();
}
/**
 * 每帧渲染
 * @param  {number} time
 * @returns void
 */
function update(time) {
    requestAnimationFrame(update);
    renderer.render(scene, camera);
    assistCircle.render();
    TWEEN.update(time);
}

requestAnimationFrame(update);

document.querySelector('#retry-button').addEventListener('click', retry);
