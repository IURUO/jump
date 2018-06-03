/**
 * 辅助圆片
 */
import * as THREE from 'three';

export default class Assist extends THREE.Mesh {
    startPosition: THREE.Vector3;
    targetDirection: THREE.Vector3;
    running: boolean;
    distance: number;
    chargeDirection: number;

    constructor(geo: THREE.Geometry, mat: THREE.Material) {
        super(geo, mat);

        this.targetDirection = new THREE.Vector3(1, 0, 0);
        this.running = false;
        this.distance = 0;
        this.chargeDirection = 0.05;
        this.startPosition = this.position.clone();
    }

    /**
     * 设置辅助圆的起始点以及目标向量：玩家
     * 起始点：玩家当前所在位置
     * 目标向量：玩家当前位置指向下一个box中心
     * @param  {THREE.Vector3} start
     * @param  {THREE.Vector3} target
     */
    setTarget(start: THREE.Vector3, target: THREE.Vector3) {
        this.startPosition.copy(start);
        this.position.copy(start);
        this.targetDirection.copy(target);
    }
    /**
     * 开始蓄力，从最小距离开始增加
     */
    startCharge() {
        this.running = true;
        this.distance = 1;
    }
    /**
     * 停止蓄力
     */
    stopCharge() {
        this.running = false;
    }
    /**
     * 蓄力中情况下，圆片沿着设置的目标向量，从玩家位置逐渐变远
     */
    render() {
        if (this.running) {
            const position = this.startPosition.clone().add(this.targetDirection.setLength(this.distance));
            this.position.copy(position);
            this.distance += this.chargeDirection;
        }
    }
    /**
     * 重置位置
     */
    resetPosition() {
        this.position.set(0, 0.25, 0);
        this.visible = true;
    }
}
