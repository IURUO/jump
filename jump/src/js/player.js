/**
 * 玩家对象，包含一个头，一个桶身，两片防走光片
 */
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const GRAVITY = 20 / 1000;
const DURATION = 500;

export default class Player extends THREE.Object3D {


    constructor() {
        super();

        const body = new THREE.Object3D();
        const points = [new THREE.Vector2(0.2, 0), new THREE.Vector2(0.13, 0.8), new THREE.Vector2(0.2, 1)];
        const bodyRound = new THREE.Mesh(new THREE.LatheGeometry(points, 120), new THREE.MeshNormalMaterial());
        const bodyUp = new THREE.Mesh(new THREE.CircleGeometry(0.2), new THREE.MeshNormalMaterial());
        const bodyDown = new THREE.Mesh(new THREE.CircleGeometry(0.2), new THREE.MeshNormalMaterial());
        bodyUp.rotation.x = -Math.PI / 2;
        bodyUp.position.y = 1;
        bodyDown.rotation.x = Math.PI / 2;
        body.add(bodyUp, bodyDown, bodyRound);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshNormalMaterial());
        head.position.y = 1.2;
        this.add(head, body);
        this.position.y = 0.25;

        this.jumping = false;
        this.alive = true;
    }
    
    /**
     * 直接设置落脚点
     * @param  {THREE.Vector3} endPosition 落脚位置
     * @param  {()=>void} onStart 开始时的回调
     */
    jumpByEndPosition(endPosition, onStart) {
        if (this.jumping) return;
        return new Promise((resolve, reject) => {
            const startPoint = this.position.clone();
            const movePoint = this.position.clone();
            const endPoint = endPosition;
            const distance = endPoint.clone().distanceTo(startPoint);
            const direction = endPoint
                .clone()
                .sub(startPoint)
                .normalize();
            const isToZ = Math.abs(direction.z) > Math.abs(direction.x);

            const tween = new TWEEN.Tween(movePoint)
                .to(endPoint, DURATION)
                .onStart(() => {
                    this.jumping = true;
                    onStart();
                })
                .onUpdate(() => {
                    let percent =
                        movePoint
                        .clone()
                        .sub(startPoint)
                        .length() / distance;
                    this.position.copy(movePoint);
                    let sy = -12 * Math.pow(percent - 0.5, 2) + 3.25;
                    this.position.y = sy;
                    this.rotation[isToZ ? 'x' : 'z'] = Math.PI * 2 * percent * (isToZ ? -1 : 1);
                })
                .onComplete(() => {
                    this.jumping = false;
                    resolve(this.alive);
                })
                .start();
        });
    }

    /**
     * 死了
     */
    dead() {
        this.alive = false;
    }

    /**
     * 死前挣扎动画
     */
    deadAnimation() {
        return new Promise((resolve, reject) => {
            const startRotation = this.rotation.clone();
            const tween = new TWEEN.Tween(this.position)
                .to(new THREE.Vector3(this.position.x, -0.25, this.position.z), 1000)
                .onComplete(() => {
                    resolve();
                })
                .start();
        });
    }

    /**
     * 重置复活
     */
    reset() {
        this.alive = true;
        this.position.set(0, 0.25, 0);
    }
}
