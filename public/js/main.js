// window.addEventListener('load', function(){

// const { recommender } = require("googleapis/build/src/apis/recommender")

//form logout from account
const linkEnter = document.getElementById('enter')
//form logout from account
const linkLogout = document.getElementById('logout')
const linkLogout1 = document.getElementById('logout1')
const linkCabinet = document.getElementById('cabinet')
//const linkChat = document.getElementById('chat')
//const linkCloseChat = document.getElementById('close-chat')

const linkWritePaying = document.getElementById('writepaying')
const iconBtn = document.getElementById('icon')
const navMenu = document.getElementById('nav-menu')
iconBtn.onclick = () => {
    navMenu.classList.toggle("vizibly")
}
const contTitle = document.getElementById('contname')
const navTitle = document.getElementById('navname')

const navFooterMenu = document.getElementById('navmenu')
const navFooterContact = document.getElementById('navcontact')

contTitle.onclick = () => {
    navFooterContact.classList.toggle("vizibly")
}
navTitle.onclick = () => {
    navFooterMenu.classList.toggle("vizibly")
}

// для захвата всех элементов надо использовать  document.querySelectorAll
let li = document.querySelectorAll('.menu-links .nav-item')
for (let i = 0; i < li.length; i++) {
    if(window.location.href === li[i].children[0].href){
        li[i].children[0].classList.add('active');
    }
}
//================================================
const delEnterForAdmOrUserLink = async () => {
    // const searchStr = window.location.href
    // console.log(searchStr)
    const response = await fetch("http://localhost:5000/api/auth/userstatus", { 
    method: "GET", 
    headers: { "Content-Type": "application/json" }
})

const data = await response.json()
const user = data.userRole
console.log(`user.status: ${user.role}`)
// console.log(`user.status: ${user.status}`)
// if(!user) console.log('error!!!')

    if (user.role === 'user' || user.role === 'admin'){
        linkEnter.classList.add('hidden')
        linkLogout.classList.remove('hidden')
        linkCabinet.classList.remove('hidden')
        //linkChat.classList.remove('hidden')

        // linkChat.addEventListener('click', () => {
        //     linkCloseChat.classList.remove('hidden')
        //     linkChat.classList.add('hidden')
        // })
        // linkCloseChat.addEventListener('click', () => {
        //     linkChat.classList.remove('hidden')
        //     linkCloseChat.classList.add('hidden')
        // })
    }
    if (user.role === 'admin'){
        console.log('admin')
        linkWritePaying.classList.remove('hidden')
    }
}
delEnterForAdmOrUserLink()

    //================================
const enter_button = document.getElementById('enter')
// const logout_button = document.getElementById('logout')
const reg_button = document.getElementById('reg')



//functiom try logging out, confirm: yes or no?
linkLogout.onclick = function (e) {
   if (!confirm('Вы уверены, что хотите выйти?')){
    e.preventDefault();
   }
}

if(linkLogout1){
    linkLogout1.onclick = function (e) {
        if (!confirm('Вы уверены, что хотите выйти?')){
         e.preventDefault();
        }
     }
}

// })

 