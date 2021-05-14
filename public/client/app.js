/* Global Variables */
let token
let peer
let dc
let ms_width = 1920
let ms_height = 1080
let divided_width
let divided_height
let setWidth
let setHeight
let count = 0

/* Import or Initilization */
const socket = io.connect('/')
const display = document.getElementById('display')
const tokenBox = document.getElementById('tokenBox') 
const maxBtn = document.getElementById('maxBtn')

/* Connection Establishment Event */
socket.on('YourId', (myId) => {
    document.getElementById('btn').disabled = false
})

/* Connection Establishment Function */
const startConnection = () => {
    token = document.getElementById('token').value
    if(token) { 
        tokenBox.remove()
        socket.emit('makeCall', token) 
        peer = new Peer(token.toString(), {
            host: 'lite-mirror-suite.herokuapp.com',
            port: 443,
            path: '/peerjs',
            secure: true,
            config: {
            'iceServers': [
                { url: 'stun:stun1.l.google.com:19302' },
                {
                    url: 'turn:3.131.158.239:3478?transport=udp',
                    credential: 'ragul',
                    username: 'ragul'
                }]
            }
        })
        receiveShare() 
    }
    else { window.alert('Token should not be empty... Try Again') }
}

/* Initializing display function */
const receiveShare = () => {
    peer.on('call', (call) => {
        dc = peer.connect('software')
        console.log('Incoming Call')
        call.answer(null)
        call.on('stream', (stream) => {
            count++
            if(count === 2){
                createDisplay(stream)
            }
            else {
                console.log(`Stream received for ${count} times`)
            }
        })

        dc.on('open', () => {
            dc.on('data', (msg) => {
                console.log(msg)
            })
        })
    })
}

/* Function to create display and sizing */
const createDisplay = (stream) => {
    divided_width = ms_width / window.innerWidth
    divided_height = ms_height / window.innerHeight
    setWidth = ms_width / Math.round(divided_width)
    setHeight = ms_height / Math.round(divided_height)
    display.width = setWidth
    display.height = setHeight
    //display.muted = true
    display.style.display = "block"
    maxBtn.style.display = "block"
    display.srcObject = stream
    display.play()
}

/* Mouse onclick event function */
function mouseClick(e){
    let posX = display.offsetLeft
    let posY = display.offsetTop
    let tempX = (e.pageX - posX) / setWidth * 100 
    let tempY = (e.pageY - posY) / setHeight * 100
    /*-----------------------------*/
    let X = tempX / 100 * ms_width
    let Y = tempY / 100 * ms_height
    /*-----------------------------*/
    let pointer = {x: Math.round(X), y: Math.round(Y)}
    console.log(pointer)
    dc.send(pointer)
}

/* Keyboard event function */
const keyEvent = (e) => {
    var keys = e.which || e.keyCode;
    try {
        dc.send(String.fromCharCode(keys))
    } catch (error) {
        console.log('Peer not initiated')
    }
}

/* Display full screen size setter function */
const fullScreen = () => {
    if(display.requestFullscreen)
    {
        display.requestFullscreen();
        display.controls = false;
    } 
    else if (display.mozRequestFullScreen) 
    {
        display.mozRequestFullScreen();
        display.controls = false;
    } 
    else if (display.webkitRequestFullscreen) 
    {
        display.webkitRequestFullscreen();
        display.controls = false;
    }
}
