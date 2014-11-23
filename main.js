

var sendChannel, receiveChannel;

var startButton = document.getElementById("startButton");
var sendButton = document.getElementById("sendButton");
var stopButton = document.getElementById("stopButton");
var receiveButton = document.getElementById("receiveButton");

startButton.disabled = false;
sendButton.disabled = true;
stopButton.disabled = true;
startButton.onclick = createConnection;
receiveButton.onclick = receiveOffer;
sendButton.onclick = sendData;


function trace(text) {
    console.log((performance.now() / 1000).toFixed(3) + ": " + text);    
}

function error(e) {
        trace('Got failure: ' + e.message + ": " + e);
}

function createConnection() {

    setupConn();
    trace('Created local peer connection object localPeerConnection');
    
    try {
        // Just initialize with some options and a label.
        sendChannel = localPeerConnection.createDataChannel('sendDataChannel',
                {reliable: false});
        trace('Created send data channel');
    } catch (e) {
        alert('Failed to create data channel. ');
        trace('createDataChannel() failed with exception: e.message');
    }
        
    sendChannel.onopen = handleSendChannelStateChange;
    sendChannel.onclose = handleSendChannelStateChange;
    
    localPeerConnection.createOffer(function (desc) {
        trace('Got local description: ' + desc);
        localPeerConnection.setLocalDescription(desc, function() {    
            var offerOut = document.getElementById("offerOut");
            offerOut.innerHTML = JSON.stringify(desc);
        });    
    }, error);
    
    startButton.disabled = true;
    stopButton.disabled = false;
    
    // TODO: Remove
    sendButton.disabled = false;
    dataChannelSend.disabled = false;
}

function handleSendChannelStateChange(state) {
    trace("Send channel state changed: " + state);
    sendButton.disabled = false;
    dataChannelSend.disabled = false;
}

function sendData() {
    trace('Sending data.');
    trace(sendChannel.readyState);
    var data = document.getElementById('dataChannelSend').value;
    sendChannel.send(data);
    trace('Sent.');
}



function receiveAnswer(offer) {
    trace('Receiving answer.');
    localPeerConnection.setRemoteDescription(
        new RTCSessionDescription(offer), function() { trace("done"); }, error);
}

function setupConn() {
    trace('Setup conn.');
    
    var servers =  { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
    window.localPeerConnection = new webkitRTCPeerConnection(servers,
            {optional: [{RtpDataChannels: true}]});
    localPeerConnection.onicecandidate = function(event) {        
        if (event.candidate) {  
            localPeerConnection.addIceCandidate(event.candidate);
            trace('Local ICE candidate: \n' + event.candidate.candidate);
        }
    };
}

function receiveConnection(offer) {
    trace('Receiving connection.');
    setupConn();
    
    desc = new RTCSessionDescription(offer); 
//    localPeerConnection.ondatachannel =    
    localPeerConnection.setRemoteDescription(desc, function() {
        localPeerConnection.createAnswer(function(answer) {
              localPeerConnection.setLocalDescription(new RTCSessionDescription(answer), function() {
                var offerOut = document.getElementById("offerOut");
                offerOut.innerHTML = JSON.stringify(answer);
              }, error)
        }, error)
    }, error);
}



function receiveOffer() {
    trace('Receving offer.');
    var offer = JSON.parse(document.getElementById("offerIn").value);
    if (window.localPeerConnection) {
       receiveAnswer(offer);
    } else {
        receiveConnection(offer);
    }    
}

