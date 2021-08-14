# ipv4-lookup
An ipv4 lookup app consisting of
* Front end : react-js
    * A very simple in-browser UI
* Back end : Flask
    * Lightweight server that queries a MaxMind GeoLite2 database
* Docker Compose build/management

## Installation

* Clone this repository
* Install docker & docker-compose
* At repository root, use docker compose to build:  
`docker-compose build`

* Download MaxMind GeoLite2 City database (binary) from https://dev.maxmind.com/geoip/geoip2/geolite2/ 

    * Unpack the GeoLite2 db anywhere
    * Configure the GeoLite 2 db location by adding a symbolic link from  
    `/usr/share/GeoLite2-City_latest`  
    to the directory containing the GeoLite2 `GeoLite2-City.mmdb` file.  On linux:  
    `cd /usr/share`  
    `sudo ln -s <GeoLite_Dir> GeoLite2-City_latest`  
    Make sure the db file is readable by all users:  
    `ls -logh --time-style="+" /usr/share/GeoLite2-City_latest/GeoLite2-City.mmdb`  
        =>    
    `-rw-r--r-- 1 70M  /usr/share/GeoLite2-City_latest/GeoLite2-City.mmdb`  
        (your file size may be different)

## Run
 * `docker-compose up`
 * Running unit tests on the backend: in the root directory  
    `pytest tests`  
    All tests should succeed.  (Requires pytest in your pip/conda/venv environment)
 * Point your browswer at http://localhost:3000/
 * The UI should be self explanatory.  Try entering "146.115.1.1"
    * sample response:  
    `Address Lookup on 146.115.1.1 :`  
    `lat, lon: 42.3797,-71.1034`  
    `accuracy_radius : 10`  
    `country : United States`  
    `region : Massachusetts`  
    `city : Somerville`  
    `postal_code : 02143`  
 * Troubleshooting:
    * There is a status line below the search button that indicates the status of the backend.  
    * If everything is OK, this will say "Ready".  
    * If not, then the error message may help to indicate where the problem is
    * Also, the unit tests on the backend can help: in the root directory  
    `pytest tests`  
        * If the backend is not up, all of these will fail with ConnectionRefusedError
        * If the backend is up, but failed to load the GeoIP db (did you create the symlink?), then test_status (and some other tests) will fail with an AssertionError showing that the status response was `'LoadFailed'`
            * Once you fix the symlink you can do `docker-compose down` then `docker-compose up` to restart the backend
* You can directly query the backend:
    * status query: http://localhost:3000/api/status
    * lookup query: http://localhost:3000/api/lookup?address=51.52.53.54  
    If the backend is working properly, both of these queries should return JSON data.

## Cleanup
* `docker-compose down`
