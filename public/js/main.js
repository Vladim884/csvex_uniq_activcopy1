// window.addEventListener('load', function(){
//form logout from account
const linkEnter = document.getElementById('enter')
//form logout from account
const linkLogout = document.getElementById('logout')
const linkCabinet = document.getElementById('cabinet')
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

const deleteHeaderEnterLink = () => {
//    console.log(`cookie array: ${document.cookie.split(';')}`)
    let cookArray = document.cookie.split(';')
    for (let i = 0; i < cookArray.length; i++) {
        if (cookArray[i].split('=')[0].trim() === 'user'
            ||
            cookArray[i].split('=')[0].trim() === 'admin') {
            linkEnter.classList.add('hidden')
            linkLogout.classList.remove('hidden')
            linkCabinet.classList.remove('hidden')
        }
    }
}

deleteHeaderEnterLink()
//==================
//deleting enter-header-link if the user is logged in
const viewAdminWritePayLink = () => {
    let cookArray = document.cookie.split(';')
    console.log(cookArray)
    for (let i = 0; i < cookArray.length; i++) {
        if (cookArray[i].split('=')[0].trim() === 'admin') {
            linkWritePaying.classList.remove('hidden')
        }
    }
}
    
viewAdminWritePayLink()
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

 