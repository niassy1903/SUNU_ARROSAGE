import RPi.GPIO as GPIO
from time import sleep
import smbus
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from RPLCD.i2c import CharLCD

# Configuration des broches
BUTTON_PIN = 17
PUMP_PIN = 27
SOIL_SENSOR = 0  # Canal ADS1115 pour capteur d'humidité
LIGHT_SENSOR = 1  # Canal ADS1115 pour capteur de luminosité

# Configuration I2C
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c)
lcd = CharLCD('PCF8574', 0x27)

# Configuration GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(PUMP_PIN, GPIO.OUT)
GPIO.output(PUMP_PIN, GPIO.HIGH)  # Pompe éteinte par défaut

def setup():
    lcd.clear()
    lcd.write_string("System Loading...")
    sleep(2)
    lcd.clear()

def read_soil_moisture():
    chan = AnalogIn(ads, SOIL_SENSOR)
    # Conversion en pourcentage (ajuster selon votre capteur)
    moisture = (chan.value / 65535) * 100
    return round(moisture, 1)

def read_light():
    chan = AnalogIn(ads, LIGHT_SENSOR)
    # Conversion en pourcentage
    light = (chan.value / 65535) * 100
    return round(light, 1)

def display_values(moisture, light):
    # Affichage sur LCD
    lcd.cursor_pos = (0, 0)
    lcd.write_string(f"Humid: {moisture}%    ")
    lcd.cursor_pos = (1, 0)
    lcd.write_string(f"Light: {light}%    ")
    print(f"Humidité du sol: {moisture}%")
    print(f"Luminosité: {light}%")
    print("-" * 20)

    # Affichage sur le moniteur
    print(f"Humidité du sol: {moisture}%")
    print(f"Luminosité: {light}%")
    print("-" * 20)

def main():
    setup()
    pump_status = False
    
    try:
        while True:
            moisture = read_soil_moisture()
            light = read_light()
            display_values(moisture, light)
            
            # Vérification du bouton
            if not GPIO.input(BUTTON_PIN):
                pump_status = not pump_status
                if pump_status:
                    GPIO.output(PUMP_PIN, GPIO.LOW)  # Allumer la pompe
                    print("Pompe: ON")
                else:
                    GPIO.output(PUMP_PIN, GPIO.HIGH)  # Éteindre la pompe
                    print("Pompe: OFF")
                sleep(0.5)  # Debouncing
            
            sleep(1)  # Délai entre les lectures
            
    except KeyboardInterrupt:
        print("Programme arrêté")
        GPIO.cleanup()
        lcd.clear()

if __name__ == "__main__":
    main()
 