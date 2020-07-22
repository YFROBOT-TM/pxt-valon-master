 
# Maqueen

[Maqueen is an easy-to-use programming educational Robot](https://www.dfrobot.com.cn/goods-1802.html)

## Basic usage

* Set the direction and speed of Maqueen motor

```blocks
 valon.motorRun(valon.Motors.M1, valon.Dir.CW, 120)
 valon.motorRun(valon.Motors.M2, valon.Dir.CCW, 120)
```

* Read ultrasonic sensor

```blocks
basic.showNumber(valon.Ultrasonic(PingUnit.Centimeters))
```

* Set the  Maqueen servos 

```blocks
valon.servoRun(valon.Servos.S1, 90)
```

* Stop the Maqueen motor 

```blocks
valon.motorStop(valon.Motors.M1)
```

* Read line tracking sensor

```blocks
serial.writeNumber(valon.readPatrol(valon.Patrol.PatrolLeft))
```

* Turn on/off the LEDs

```blocks
valon.writeLED(valon.LED.LEDLeft, valon.LEDswitch.turnOn)
```

* Read IR sensor value

```blocks
basic.showNumber(valon.IR_read())
```

* Read the version number

```blocks
basic.showString(valon.IR_read_version())
```

## License

MIT

Copyright (c) 2018, microbit/micropython Chinese community  


## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)
