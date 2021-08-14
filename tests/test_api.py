# Do some simple testing on the IP4 lookup api. 

import pytest
import requests

# Note to self: pytest -rP prints stdout of passing tests (but not failing)

# test that the status is OK (which means that the GeoIPLite db loaded properly)
# should return json object {errMsg : "", status :"Ready"}
def test_status():
    r =requests.get('http://localhost:3000/api/status')
    assert r.status_code == 200
    assert r.json() == {'errMsg': '', 'status': 'Ready'}

# test that querying a known address gives us the expected result.
# Note that this could fail if the db changes!  
# This works as of GeoLite2-City_20210810
def test_knownAddress():
    r =requests.get('http://localhost:3000/api/lookup?address=146.115.1.1')
    assert r.status_code == 200
    assert r.json() == {'accuracy_radius' :	10,
                        'city' :	"Somerville",
                        'country' :	"United States",
                        'ip' :	"146.115.1.1",
                        'latitude' :	42.3797,
                        'longitude' :	-71.1034,
                        'postal_code' :	"02143",
                        'region' :	"Massachusetts"}

# test that querying a known address with leading 0s gives us identical 
# data to without the leading 0.
def test_knownAddressLeading0():
    r =requests.get('http://localhost:3000/api/lookup?address=146.115.01.1')
    assert r.status_code == 200
    r2 =requests.get('http://localhost:3000/api/lookup?address=146.115.01.1')
    assert r2.status_code == 200
    assert r.json() == r2.json()

# test that querying using a hostname fails
def test_hostnameQuery():
    r =requests.get('http://localhost:3000/api/lookup?address=rcn.com')
    assert r.status_code == 200
    response_json = r.json()
    assert 'error' in response_json
    assert  response_json['error'] == "'rcn.com' does not appear to be an IPv4 or IPv6 address."

# test that querying using an invalid ip address does something reasonable
def test_invalidQuery():
    r =requests.get('http://localhost:3000/api/lookup?address=999.14.14.14')
    assert r.status_code == 200
    response_json = r.json()
    #print(response_json)
    assert 'error' in response_json
    assert  response_json['error'] == "'999.14.14.14' does not appear to be an IPv4 or IPv6 address."

# test that querying lookback gives us a not in the database response
def test_loopback():
    r =requests.get('http://localhost:3000/api/lookup?address=127.0.0.1')
    assert r.status_code == 200
    response_json = r.json()
    print(response_json)
    assert 'error' in response_json
    assert  response_json['error'] == 'The address 127.0.0.1 is not in the database.'

# test that a private IP address gives us a not in the database response
def test_loopback():
    r =requests.get('http://localhost:3000/api/lookup?address=192.168.0.1')
    assert r.status_code == 200
    response_json = r.json()
    print(response_json)
    assert 'error' in response_json
    assert  response_json['error'] == 'The address 192.168.0.1 is not in the database.'
