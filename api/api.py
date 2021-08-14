import os
from flask import Flask, request
from flask_cors import CORS, cross_origin
import geoip2.database
from dotenv import load_dotenv

# geoip2 database takes a while to load and is big.
# Here, we use a global object to hold the geoip2 db.
# This is, in general, a bad idea, because it may not 
# be thread-safe, and multiple clients could be accesssing
# at the same time.
# Here, this is a hack to get a backend up and running quickly. 
# To fix, take a look at flask_caching
reader = None
status = 'Loading'
errMsg = ''

dotenv_path = os.path.join(os.path.dirname(__file__), '.flaskenv')
load_dotenv(dotenv_path)
GEOIP_FILE = os.environ.get("GEOIP_FILE", '~/Downloads/GeoLite2-City_latest/GeoLite2-City.mmdb')

print('loading geoip2 file: ', GEOIP_FILE)
try:
    reader = geoip2.database.Reader(GEOIP_FILE)
    status = 'Ready'
except Exception as ex:
    status = 'LoadFailed'
    errMsg = str(ex)
    reader = None
# geoip examples
#response = reader.city('66.115.83.131') # Glasgow, KY
#response = reader.city('51.252.29.139') # Riyadh
#response = reader.city('68.8.132.240') # San Diego, CA
# see https://github.com/maxmind/GeoIP2-python/issues/22 for some other possibilities

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/api/status')
def get_status():
    return {'status': status, 'errMsg': errMsg}

@app.route('/api/lookup')
def do_ip_lookup():
    address = request.args.get('address', '68.8.132.240') # default to San Diego to make development easier
    if reader is None:
        result = { 'error' : 'LoadFailed ' + errMsg,
                 'ip':address
        }
        return result
    try:
        response = reader.city(address) # San Diego, CA
        # Put the interesting stuff into a dict, which gets translated to JSON in the response
        result = { 'city':response.city.name,
                   'country':response.country.name,
                   'region':response.subdivisions.most_specific.name,
                   'latitude':response.location.latitude,
                   'longitude':response.location.longitude,
                   'accuracy_radius':response.location.accuracy_radius,
                   'postal_code':response.postal.code,
                   'ip':address 
                }
    except Exception as ex:
        result = { 'error' : str(ex),
                'ip':address
        }
    print('result: ', result)
    return result