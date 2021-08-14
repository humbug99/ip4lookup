// An IPv4 entry widget with some affordances to help the user
// (separate octet fields with validation, clear button, button state, etc.)
// The search button is included here.  If we were doing anything real 
// with this, we'd generalize this widget so it could be used for non-search things
// (like netmask entry), and move the search button outside this component.

import React from 'react';
import ReactTooltip from 'react-tooltip';

// fontawesome button icon imports
import { faBackspace, faSearchLocation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// An Octet represents one of the 4 fields of the IPv4 address, where each
// is a number [0,255].  Here we use an input element to let the user
// enter text, which will be validated as it is entered.
// The Octet is a function component; its data lives in the IP4Widget
function Octet(props) {
    return (
      <input className="octet"
        maxLength="3"
        data-tip data-for="octetTip" 
        onChange={(e) => props.handleChange(e)} 
        value={props.value}/>
    );
  }

// The main widget representing the IPV4 address
export default class IP4Widget extends React.Component {

constructor(props) {
    super(props)
    this.state = {
        octets: Array(4).fill(''), // start value is all fields empty
        isValidIP: false,
        isEmptyIP: true,
        //doSearch={(ip) => props.doSearch(ip)}
      };
  }

renderOctet(i) {
    return (
    <Octet
      value={this.state.octets[i]}
      handleChange={(e) => this.handleOctetChange(i, e.target.value)}
    />
    );
}

/* Check that a single octet string is valid.
   Octet strings are valid only if they are entirely numeric and represent 
   integers in the range [0, 255].
   For this use, we also define the empty string as valid, because the 
   user needs to be able to have empty fields when entering/modifying octets.
   Maybe JS has some better way to do this.
   Doing it here by using parseInt.  This requires a second step, because 
   parseInt cleverly stops parsing a string when it hits an alpha char, e.g.
   "15Q6" => 15.  TO deal with this, we convert back to a string and check 
   equality with the original string */
checkValidOctetString(octetStr) {
  // we do want to allow the empty string, and leading 0s
  while (octetStr.startsWith('0')) {
    octetStr = octetStr.substring(1) // strip leading 0s
  }
  if (octetStr === '') {
    return true // this case also covers all digits 0, which is OK, because that is valid...
  } 
	let myInt = parseInt(octetStr)
  let secondStr = myInt.toString()
  let isValid = false
  if (secondStr === octetStr) {
    isValid = true // This comparison is true for negative integers, that is handled below
  }
  if (!isValid) {
    return false;
  }
  if (myInt > 255 || myInt < 0) {
    return false;
  }
  return true;
}

// Are all the fields empty?
checkEmptyIPV4(octets) {
  for (let i = 0; i < octets.length; i++) {
    let octetStr = octets[i];
    if (octetStr.trim() !== '') {
      return false;
    }
  }
  return true;
}

// If any of the fields is empty, then the address is not valid
// This check does not detect special/private IP addresses
// (e.g. loopback, NAT blocks, etc)
checkValidIPV4(octets) {
  //let invalidOctetIdx = -1;
  let errMsg = '' // TODO, could use this to make helpful message for user
  for (let i = 0; i < octets.length; i++) {
    let octetStr = octets[i];
    if (!this.checkValidOctetString(octetStr)) {
      errMsg = 'invalid IP field'
    }
    if (octetStr.trim() === '') {
      errMsg = 'empty IP field'
    }
    if (errMsg !== '') {
      return false;
    }
  }
  return true;
}

/* validate octet change:
   if string is not an integer, don't allow the change
   if numeric value > 255 don't allow the change
*/
handleOctetChange(i, newValue) {    
  //const newValue = this.state.octets[i];
  const octets = this.state.octets.slice(); // copy all octets
  if (!this.checkValidOctetString(newValue)) {
    console.log('bad octet value: ' + newValue)
    this.setState({octets: octets}) // force re-render to make the changed value match the octet state
    // TODO useful error message for user?
    return;
  }
  // OK to change, set the new state
  octets[i] = newValue;
  let isValid = this.checkValidIPV4(octets)
  let isEmpty = this.checkEmptyIPV4(octets)
  this.setState({octets: octets, isValidIP: isValid, isEmptyIP: isEmpty,}) // update state var
}

renderOctetSeparator() {
    return (
        <div className="octetSeparator">.</div>
    )
}

// clear all 4 octets
clearIP() {
  this.setState({octets: Array(4).fill(''), isValidIP: false, isEmptyIP: true,})
}

// aggregate the octets into a full address
getIP(octets) {
  let addr = ''
  for (let i = 0; i < octets.length; i++) {
    let octetStr = octets[i];
    while (octetStr.startsWith('0') && octetStr.length > 1) {
      octetStr = octetStr.substring(1) // strip leading 0s
    }
    if (i > 0) {
      addr = addr + '.'
    }
    addr = addr + octetStr;
  }
  return addr;
}

searchIP() {
  this.props.doSearch(this.getIP(this.state.octets))
}

render() {
    return (
        <div className="ip4-widget">
            <div className="title"></div>
            <div className="ip-entry">
                {this.renderOctet(0)}
                {this.renderOctetSeparator()}
                {this.renderOctet(1)}
                {this.renderOctetSeparator()}
                {this.renderOctet(2)}
                {this.renderOctetSeparator()}
                {this.renderOctet(3)}
                <button className="faButton faButton-clear"
                  disabled={this.state.isEmptyIP}
                  data-tip data-for="widgetClearTip" 
                  //onClick={() => this.clearIP}>
                  onClick={this.clearIP.bind(this)}>
                  <FontAwesomeIcon icon={faBackspace} />
                </button>
            </div>
            <button className="faButton"
              disabled={!this.state.isValidIP}
              data-tip data-for="ipSearchTip"
              onClick={this.searchIP.bind(this)}>
              <FontAwesomeIcon icon={faSearchLocation} size="2x"/>
            </button>
            <div className="statusMessage"></div>
            <ReactTooltip id="octetTip" place="top" effect="solid">
              Enter a number between 0 and 255.  All 4 fields form the IP4 address, e.g. 68.8.132.240
            </ReactTooltip>
            <ReactTooltip id="widgetClearTip" place="bottom" effect="solid">
              Clear all IP address fields
            </ReactTooltip>
            <ReactTooltip id="ipSearchTip" place="right" effect="solid">
              Lookup the IP address location
            </ReactTooltip>
        </div>
        )
    }
}