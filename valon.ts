/** 
 * @file pxt-valon/valon.ts
 * @brief YFROBOT's VALON makecode library.
 * @n This is a MakeCode graphical programming education robot.
 * 
 * @copyright    YFROBOT,2020
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2020-07-22
*/

let valoncb: Action
let valonmycb: Action
let valone = "1"
let valonparam = 0
let alreadyInit = 0
let IrPressEvent = 0
const MOTER_ADDRESSS = 0x10


// ultrasonic pin
let valonUltrasonicTrig = DigitalPin.P5
let valonUltrasonicEcho = DigitalPin.P11
let distanceBuf = 0
// motor pin 
let valonMotorLD = DigitalPin.P13
let valonMotorLA = AnalogPin.P14
let valonMotorRD = DigitalPin.P15
let valonMotorRA = AnalogPin.P16
// patrol pin
let valonPatrolLeft = DigitalPin.P1
let valonPatrolMiddle = DigitalPin.P2
let valonPatrolRight = DigitalPin.P8

enum PingUnit {
    //% block="cm"
    Centimeters,
}
enum state {
    state1 = 0x10,
    state2 = 0x11,
    state3 = 0x20,
    state4 = 0x21
}
interface KV {
    key: state;
    action: Action;
}

//% color="#7BD239" weight=10 icon="\uf1b0" block="Valon"
namespace valon {

    let kbCallback: KV[] = []

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum Motors {
        //% blockId="left motor" block="left"
        ML = 0,
        //% blockId="right motor" block="right"
        MR = 1,
        //% blockId="all motor" block="all"
        MAll = 2
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 1,
        //% blockId="patrolMiddle" block="middle"
        PatrolMiddle = 2,
        //% blockId="patrolRight" block="right"
        PatrolRight = 8
    }

    export enum LED {
        //% blockId="LEDLeft" block="left"
        LEDLeft = 10,
        //% blockId="LEDRight" block="right"
        LEDRight = 9
    }

    export enum LEDswitch {
        //% blockId="turnOn" block="ON"
        turnOn = 0x01,
        //% blockId="turnOff" block="OFF"
        turnOff = 0x00
    }

    /**
     * Turn on/off the LEDs.
     */
    //% weight=120
    //% blockId=writeLED block="LEDlight |%ledn turn |%ledswitch"
    //% ledn.fieldEditor="gridpicker" ledn.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(ledn: LED, ledswitch: LEDswitch): void {
        led.enable(false);
        if (ledn == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P10, ledswitch);
        } else if (ledn == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P9, ledswitch);
        } else {
            return
        }
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(max, value), min);
    }

    /**
     * Set the direction and speed of Valon motor.
     * @param index motor left/right/all
     * @param direction direction to turn
     * @param speed speed of motors (0 to 255). eg: 120
     */
    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index > 2 || index < 0)
            return

        speed = clamp(speed, 0, 255) * 4.01;  // 0~255 > 0~1023

        if (index == valon.Motors.ML) {
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        } else if (index == Motors.MR) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
        } else if (index == Motors.MAll) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        }
    }

    /**
     * Stop the Valon motor.
     */
    //% weight=89
    //% blockId=motor_motorStop block="motor |%motor stop"
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=2 
    export function motorStop(motor: Motors): void {
        motorRun(motor, 0, 0);
    }

    /**
     * Read ultrasonic sensor.
     */
    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=80
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        // send pulse
        pins.setPull(valonUltrasonicTrig, PinPullMode.PullNone);
        pins.digitalWritePin(valonUltrasonicTrig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(valonUltrasonicTrig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(valonUltrasonicTrig, 0);

        // read pulse
        // d = pins.pulseIn(valonUltrasonicEcho, PulseValue.High, maxCmDistance * 58);  // 8 / 340 = 
        d = pins.pulseIn(valonUltrasonicEcho, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;

        return Math.floor(ret * 9 / 6 / 58);
        // switch (unit) {
        //     case ValonPingUnit.Centimeters: return Math.idiv(d, 58);
        //     default: return d;
        // }
    }

    /**
      * enable line tracking sensor.
      */
     function enablePatrol(enable: number): void {
        pins.digitalWritePin(DigitalPin.P12, enable);
     }
    
    /**
      * Read line tracking sensor.
      * @param patrol patrol sensor number.
      */
    //% weight=70
    //% blockId=valon_read_Patrol block="read %patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        enablePatrol(1);
        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(valonPatrolLeft)
        } else if (patrol == Patrol.PatrolMiddle) {
            return pins.digitalReadPin(valonPatrolMiddle)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(valonPatrolRight)
        } else {
            return -1
        }
    }


}
