/**
 * 游戏场景，主要用于承载盒子
 */
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { Vector2, Vector3 } from 'three';

export default class GameStage extends THREE.Object3D {
    camera: THREE.Camera;
    lastCenter: THREE.Vector3;
    tween: TWEEN.Tween;

    constructor(camera: THREE.Camera) {
        super();

        this.camera = camera;
        this.lastCenter = new Vector3(0, 0, 0);
    }

    /**
     * 重置场景，类似于初始化，设置第1、2个盒子
     */
    resetStage() {
        this.remove(...this.children);
        this.add(new THREE.Mesh(new THREE.CubeGeometry(2, 0.5, 2), new THREE.MeshNormalMaterial()));
        this.addCube();
    }

    /**
     * 新增一个盒子，并将相机位置从当前位置移动到下一个关注点
     * 关注点：指当前盒子到下一个盒子的中间位置
     */
    addCube() {
        const isToZ: boolean = Math.random() > 0.5;
        const distance: number = Math.random() * 4 + 3;
        const lastPosition: THREE.Vector3 = this.children[this.children.length - 1].position;
        const newCube: THREE.Mesh = new THREE.Mesh(new THREE.CubeGeometry(2, 0.5, 2), new THREE.MeshNormalMaterial());
        if (isToZ) {
            newCube.position.copy(lastPosition).add(new THREE.Vector3(0, 0, -distance));
        } else {
            newCube.position.copy(lastPosition).add(new THREE.Vector3(-distance, 0, 0));
        }

        this.add(newCube);

        const centerPoint = newCube.position
            .clone()
            .add(lastPosition)
            .multiplyScalar(0.5);
        this.lastCenter.copy(centerPoint);
        const startCameraPosition = this.camera.position.clone();
        const nowCameraPosition = this.camera.position.clone();
        const endCameraPosition = centerPoint.clone().add(new THREE.Vector3(3, 8, 8));
        const cameraTeen = new TWEEN.Tween(nowCameraPosition)
            .to(endCameraPosition, 500)
            .onStart(() => {})
            .onUpdate(() => {
                this.camera.position.copy(nowCameraPosition);
            })
            .start();
    }

    /**
     * 返回最新一个盒子的位置
     * @return {THREE.Vector3}
     */
    getLastCubePosition() {
        return this.children[this.children.length - 1].position;
    }
}
