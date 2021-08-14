import React from 'react';
import './App.css';
import IP4Widget from './IP4Widget'
import IP4Lookup from './IP4Lookup'

class IP4App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchIP : '',
    };
    this.childIP4LookupRef = React.createRef();
  }
  
  dispatchSearch(ipAddr) {
    console.log('App dispatching ip search on : ' + ipAddr)
    this.childIP4LookupRef.current.doLookup(ipAddr)
    return null;
  }

  render() {
    return (
      <div className="IP4App">
        <IP4Widget
          doSearch={this.dispatchSearch.bind(this)}
        />
        <IP4Lookup 
          ref={this.childIP4LookupRef}
          searchIP={this.state.searchIP}
        />
      </div>
    );
  }
}

///---

function App() {
  return (
    <div className="App">
      <header className="App-header">  
      </header>
      IP4 Lookup, using MaxMind GeoLite2 City database
      <IP4App/>
    </div>
  );
}

export default App;
