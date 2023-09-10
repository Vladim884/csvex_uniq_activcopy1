window.addEventListener('load', function () {

(function() {

    const iframe = document.getElementById('iframe')
    const footerEl = document.getElementById('foote')
    const headerEl = document.getElementById('heade')
    footerEl.classList.add('hidden')
    headerEl.classList.add('hidden')

    const spanname = document.getElementById('nicn')
    const userIdName = document.getElementById('userIdName')
    const roomName = document.getElementById('roomName')

    

    const socket = io('/admin')
    const messages = document.getElementById('messages-chat')
    var form = document.getElementById('form-chat');
    var input = document.getElementById('input-chat');

    
    const nicname = spanname.innerText
    const userId = userIdName.innerText
    const room = roomName.innerText
    

    form.addEventListener('submit', function(e) {
      e.preventDefault()
      if (input.value) {
        socket.emit('chat message', {msg: `${nicname}: ${input.value}`, room})
        input.value = ''
      }
      //async function saveChatData(name) {
      //  const response = await fetch(`/saveChatData`, { 
      //      method: "POST", 
      //      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      //      body: JSON.stringify({
      //          room: `${room}`,
      //          message: `${nicname}: ${input.value}`
      //      })
      //  })
      //  if (response.ok === true) return console.log('data was send')
      //  return console.log('server send bad response')
      //}
      //saveChatData()
    })
  

    socket.on('chat message', function(msg) {
      var item = document.createElement('li')
      item.textContent = msg
      //console.log(msg)
      messages.appendChild(item)
      iframe.innerHTML = iframe.innerHTML = `<iframe src="/sound/beep-27.mp3" allow="autoplay" style="width: 130px;height:55px;opacity: 0">`
      //iframe.innerHTML = iframe.innerHTML = `<iframe src="/sound/melody.mp3" allow="autoplay" style="width: 130px;height:55px;opacity: 0">`
      window.scrollTo(0, document.body.scrollHeight)
    })

    socket.on('connect', () => {
      socket.emit('join', {room, nicname, userId})
    })
    document.addEventListener("onunload", function(){
        const adres = '/chat'
        const hrefto = (adres) => {
            window.location.href = adres;
        }
        //hrefto(adres)

    })

    //function sendMSGToAll(){
      //socket.emit('send msg to all', {msg: input.value, room})
    //}

  })()

})