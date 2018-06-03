/**
 * 玩家对象，包含一个头，一个桶身，两片防走光片
 */
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const GRAVITY = 20 / 1000;
const DURATION = 500;

export default class Player extends THREE.Object3D {
    // 玩家是否在跳跃途中
    jumping: boolean;

    // 玩家是否活着
    alive: boolean;

    constructor() {
        super();

        const body: THREE.Object3D = new THREE.Object3D();
        const points: THREE.Vector2[] = [new THREE.Vector2(0.2, 0), new THREE.Vector2(0.13, 0.8), new THREE.Vector2(0.2, 1)];
        const bodyRound: THREE.Mesh = new THREE.Mesh(new THREE.LatheGeometry(points, 20), new THREE.MeshNormalMaterial());
        const bodyUp: THREE.Mesh = new THREE.Mesh(new THREE.CircleGeometry(0.2), new THREE.MeshNormalMaterial());
        const bodyDown: THREE.Mesh = new THREE.Mesh(new THREE.CircleGeometry(0.2), new THREE.MeshNormalMaterial());
        bodyUp.rotation.x = -Math.PI / 2;
        bodyUp.position.y = 1;
        bodyDown.rotation.x = Math.PI / 2;
        body.add(bodyUp, bodyDown, bodyRound);

        const head: THREE.Mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshNormalMaterial());
        head.position.y = 1.2;
        this.add(head, body);
        this.position.y = 0.25;

        this.jumping = false;
        this.alive = true;
    }
    /**
     * 以设置初始速度的方式起跳
     * @param  {boolean} isToZ
     * @param  {number} initSpeed
     */
    jumpBySpeed(isToZ: boolean, initSpeed: number) {
        if (this.jumping) return;

        const flyDuration = 2 * initSpeed / GRAVITY;

        const startPoint = this.position.clone();
        const movePoint = this.position.clone();
        const endPoint: THREE.Vector3 = isToZ
            ? this.position.clone().sub(new THREE.Vector3(0, 0, initSpeed * flyDuration).multiplyScalar(1 / 1000))
            : this.position.clone().sub(new THREE.Vector3(initSpeed * flyDuration, 0, 0).multiplyScalar(1 / 1000));

        const tween = new TWEEN.Tween(movePoint)
            .to(endPoint, flyDuration)
            .onUpdate(() => {
                let t =
                    movePoint
                        .clone()
                        .sub(startPoint)
                        .length() /
                    initSpeed *
                    1000;
                let sy = (initSpeed * t - 0.5 * GRAVITY * t * t) / 1000 + 0.25;
                this.position.copy(movePoint);
                this.position.y = sy;
                this.rotation[isToZ ? 'x' : 'z'] = Math.PI * 2 * t / flyDuration * (isToZ ? -1 : 1);
            })
            .start();
    }

    /**
     * 以设置位移距离方式起跳
     * @param  {boolean} isToZ
     * @param  {number} distance
     */
    jumpByDistance(isToZ: boolean, distance: number) {
        if (this.jumping) return;

        const startPoint = this.position.clone();
        const movePoint = this.position.clone();
        const endPoint = isToZ
            ? this.position.clone().sub(new THREE.Vector3(0, 0, distance))
            : this.position.clone().sub(new THREE.Vector3(distance, 0, 0));

        const tween = new TWEEN.Tween(movePoint)
            .to(endPoint, DURATION)
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
            .start();
    }

    /**
     * 这个最简单，直接设置落脚点
     * @param  {THREE.Vector3} endPosition 落脚位置
     * @param  {()=>void} onStart 开始时的回调
     */
    jumpByEndPosition(endPosition: THREE.Vector3, onStart: () => void) {
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
