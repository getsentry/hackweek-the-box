#!/usr/bin/env python3
import RPi.GPIO as GPIO
import sys

# Usage: python light.py set <pin> <mode>
# Modes: op (output), dh (drive high), dl (drive low)

def main():
    if len(sys.argv) != 4 or sys.argv[1] != "set":
        print(f"Usage: {sys.argv[0]} set <pin> <mode>")
        print("Modes: op (output), dh (drive high), dl (drive low)")
        sys.exit(1)
    
    try:
        pin = int(sys.argv[2])
        mode = sys.argv[3]
        
        GPIO.setmode(GPIO.BCM)
        
        if mode == "op":
            # Set pin as output
            GPIO.setup(pin, GPIO.OUT)
        elif mode == "dh":
            # Drive high
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.HIGH)
        elif mode == "dl":
            # Drive low
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.LOW)
        else:
            print(f"Unknown mode: {mode}")
            sys.exit(1)
            
    except ValueError:
        print(f"Invalid pin number: {sys.argv[2]}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

