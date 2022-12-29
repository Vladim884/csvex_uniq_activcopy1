(function() {
    

    var audio = new Audio("/sound/sound.mp3")

    const socket = io('/admin')
    //const socket = io()

    var messages = document.getElementById('messages-chat');
    var form = document.getElementById('form-chat');
    var input = document.getElementById('input-chat');
    
    const room = 'adminchat'

    form.addEventListener('submit', function(e) {
      e.preventDefault()
      if (input.value) {
        socket.emit('chat message', {msg: input.value, room})
        input.value = ''
      }
    })

    socket.on('chat message', function(msg) {
        var item = document.createElement('li')
        item.textContent = msg
        console.log(msg)
        let arr = msg.split(' ')
        
        if(messages.childNodes){
            let arrmes = messages.childNodes
            for (let i = 0; i < arrmes.length; i++) {
                if (arr[0] === 'joined'&& arrmes[i].innerText === arr[1]){
                    return
                }
            }
        }
        if(arr[0] === 'joined' && arr[1] !== 'admin' && arr[2] !== 'adminchat'){
            item.innerHTML = `<a href='${arr[3]}' target='_blank'>${arr[1]}</a> 
            `
            if (confirm('sound?')){
                audio.play();
            }
            debugger
            // audio.play()
            // <iframe src="/sound/sound.mp3" allow="autoplay">
            messages.appendChild(item)
        } else if (arr[0] === 'disconnect' && arr[2] !== 'adminchat'){
            //debugger
            if(messages.childNodes){
                let arrmes = messages.childNodes
                for (let i = 0; i < arrmes.length; i++) {
                if (arrmes[i].innerText === arr[1]){
                        arrmes[i].remove()
                    }
                }
            }
            
        }
    //   messages.appendChild(item)
      window.scrollTo(0, document.body.scrollHeight)
    })

    socket.on('connect', () => {
      socket.emit('join', {room})
    })
    // socket.on('disconnect', () => {
    //   socket.emit('join', {room})
    // })

    function sendMSGToAll(){
      socket.emit('send msg to all', {msg: input.value, room})
    }
    const  createLink = document.getElementById('createLink')

    createLink.addEventListener('click', function (){
        //debugger
        let elems = messages.childNodes

        for (let i = 0; i < elems.length; i++) {
            // if(elems[i].tagName = 'a'){
            //debugger
            if(elems[i].firstChild && elems[i].firstChild.tagName === 'A'){
                let els = messages.childNodes
                for (let j = 0; j < els.length; j++) {
                    //debugger
                    if(els[j].firstChild && els[j].firstChild.firstChild === null){
                        
                    // if(elems[i].innerText === els[i].innerText){
                        let arr = els[j].innerText.split(' ')
                        if(arr[3]){ // because this string.solit from 4 els: 'disconnect vladim10 XXBU93%l3H http://localhost:5000/chats/rooms?name=XXBU93%l3H
                            if(arr[0] === 'disconnect' && arr[2] === elems[i].innerText){
                                els[j].remove()
                                elems[i].remove()
                            } else if (arr[0] === 'joined' && arr[1] === 'undefined'){
                                els[j].remove()
                            } else if (arr[0] === 'disconnect' && arr[1] === 'undefined'){
                                els[j].remove()
                            }
                        }
                        
                    }
                }
                
            }
            elems = messages.childNodes
            for (let i = 0; i < elems.length; i++) {
                debugger
                if(elems[i].tagName = 'Li' && elems[i].innerText){
                    let arr = elems[i].innerText.split(' ')
                    if(arr[0] === 'joined' && arr[1] !== 'undefined' && arr[1] !== 'admin'){
                        elems[i].innerHTML = `<a href='${arr[3]}' target='_blank'>${arr[2]}</a>`
                    }
                }
            }
        }
    })  
        
        
             

      
        
          
 
 
    
})()