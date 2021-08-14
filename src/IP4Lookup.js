import axios from "axios";
import React from 'react';

// The main widget representing the IPV4 lookup tool
// at the moment, this is done by making a post request to
// a python/Flask backend
export default class IP4Lookup extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            searchIP : null,
            lastSearchIP : null,
            result : '',
            statusMsg : "opening GeoLite2 database",
            errMsg : null,
        };
    }

    handleStatusError(errThing) {
        console.log(errThing)
        this.setState({ statusMsg: "DB down " + errThing})
    }

    // Once the component has loaded, check to see if the backend is working.
    componentDidMount() {
        // now proxying because of CORS problems
        // let addrStr = 'http://127.0.0.1:5000/status'
        let addrStr = 'http://127.0.0.1:3000/api/status'
        axios.get(addrStr)
        .then(response => this.setState({ statusMsg: response.data.status + " " + response.data.errMsg}),
              this.handleStatusError.bind(this));
    }

    processLookupResult(_result) {
        console.log('ip lookup on ' + _result.data.ip + ' succeeded')
        let resStr = ''
        if ("error" in _result.data) {
            resStr = "Error looking up " + _result.data.ip + " : \n" +_result.data['error']
        } else {
            resStr = 'Address Lookup on ' + _result.data.ip + " : \n "
            console.log('result: ' + JSON.stringify(_result.data))
            resStr += 'lat, lon: ' + _result.data.latitude + "," + + _result.data.longitude
            let keys = ["accuracy_radius", "country", "region", "city", "postal_code"]
            for(let i = 0; i < keys.length; i += 1) {
                let k = keys[i]
                if (k in _result.data && _result.data[k] !== null) {
                    resStr = resStr + "\n " + k + " : " + _result.data[k]
                }
            }
        }
        this.setState({ result: resStr })
    }

    failedLookupResult(_result) {
        console.log('ip lookup on ' + this.state.searchIP + ' failed') 
        console.log('result: ' + JSON.stringify(_result.data))
        this.setState({ statusMsg: _result});
        this.setState({ result: '' })
    }

    doLookup(ipAddrStr) {
        //let addrStr = 'http://127.0.0.1:5000/lookup?address=' + ipAddrStr
        let addrStr = 'http://127.0.0.1:3000/api/lookup?address=' + ipAddrStr
        this.setState( {searchIP : ipAddrStr} ) // might be redundant
        axios.get(addrStr).then(this.processLookupResult.bind(this), this.failedLookupResult);
    }

    renderResult() {
        return (
            <div>
                <textarea className="resultBox" rows="6" cols="60" readOnly={true} value={this.state.result}>
                </textarea>
            </div>
        );
    }

    render() {
        return (
            <div className="ip4-widget">
                <hr></hr>
                <div className="ip4-status">
                    {this.state.statusMsg}
                </div>
                <hr></hr>
                
                    {this.renderResult()}
                
            </div>
        )
    }
}
    