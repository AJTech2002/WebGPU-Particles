import { device } from "@engine/engine";
import Component from "@engine/scene/component";

export default class BoidComponent extends Component {

 public update(dT: number): void {
    const sDT = dT / 1000;

    const commandEncoder: GPUCommandEncoder = device.createCommandEncoder();
   
    // GPUCompute Work
   
    device.queue.submit([commandEncoder.finish()]);
 } 

}