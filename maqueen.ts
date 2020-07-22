/** 
 * @file pxt-valon/valon.ts
 * @brief DFRobot's VALON makecode library.
 * @n This is a MakeCode graphical programming education robot.
 * 
 * @copyright    YFROBOT,2020
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2020-07-22
*/

let maqueencb: Action
let maqueenmycb: Action
let maqueene = "1"
let maqueenparam = 0
let alreadyInit = 0
let IrPressEvent = 0
const MOTER_ADDRESSS = 0x10

enum PingUnit {
    //% block="cm"
    Centimeters,
}
enum state {
        state1=0x10,
        state2=0x11,
        state3=0x20,
        state4=0x21
    }
interface KV {
    key: state;
    action: Action;
}

//% weight=10 color=#008B00 icon="\uf136" block="Maqueen"
namespace maqueen {

    let kbCallback: KV[] = []

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum Motors {
        //% blockId="left motor" block="left"
        M1 = 0,
        //% blockId="right motor" block="right"
        M2 = 1,
        //% blockId="all motor" block="all"
        All = 2
    }

    export enum Servos {
        //% blockId="S1" block="S1"
        S1 = 0,
        //% blockId="S2" block="S2"
        S2 = 1
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 13,
        //% blockId="patrolRight" block="right"
        PatrolRight = 14
    }

    export enum Patrol1 {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 0x10,
        //% blockId="patrolRight" block="right"
        PatrolRight = 0x20
    }
    export enum Voltage {
        //%block="high"
        High = 0x01,
        //% block="low"
        Low = 0x00
    }

    export enum LED {
        //% blockId="LEDLeft" block="left"
        LEDLeft = 8,
        //% blockId="LEDRight" block="right"
        LEDRight = 12
    }

    export enum LEDswitch {
        //% blockId="turnOn" block="ON"
        turnOn = 0x01,
        //% blockId="turnOff" block="OFF"
        turnOff = 0x00
    }

    /**
     * Read ultrasonic sensor.
     */

    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=95
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        pins.digitalWritePin(DigitalPin.P1, 0);
        if (pins.digitalReadPin(DigitalPin.P2) == 0) {
            pins.digitalWritePin(DigitalPin.P1, 1);
            pins.digitalWritePin(DigitalPin.P1, 0);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58);
        } else {
            pins.digitalWritePin(DigitalPin.P1, 0);
            pins.digitalWritePin(DigitalPin.P1, 1);
            d = pins.pulseIn(DigitalPin.P2, PulseValue.Low, maxCmDistance * 58);
        }
        let x = d / 39;
        if (x <= 0 || x > 500) {
            return 0;
        }
        switch (unit) {
            case PingUnit.Centimeters: return Math.round(x);
            default: return Math.idiv(d, 2.54);
        }

    }

    /**
     * Set the direction and speed of Maqueen motor.
     */

    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%Dir|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        let buf = pins.createBuffer(3);
        if (index == 0) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 1) {
            buf[0] = 0x02;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (index == 2) {
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = speed;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }
    }

    /**
     * Stop the Maqueen motor.
     */
    //% weight=20
    //% blockId=motor_motorStop block="motor |%motors stop"
    //% motors.fieldEditor="gridpicker" motors.fieldOptions.columns=2 
    export function motorStop(motors: Motors): void {
        let buf = pins.createBuffer(3);
        if (motors == 0) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }
        if (motors == 1) {
            buf[0] = 0x02;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
        }

        if (motors == 2) {
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf);
            buf[0] = 0x02;
            pins.i2cWriteBuffer(0x10, buf);
        }

    }


    /**
     * Turn on/off the LEDs.
     */

    //% weight=20
    //% blockId=writeLED block="LEDlight |%led turn |%ledswitch"
    //% led.fieldEditor="gridpicker" led.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(led: LED, ledswitch: LEDswitch): void {
        if (led == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P8, ledswitch)
        } else if (led == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P12, ledswitch)
        } else {
            return
        }
    }
}
