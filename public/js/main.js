// window.addEventListener('load', function(){
    //form logout from account
    const linkEnter = document.getElementById('enter')
    //form logout from account
    const linkLogout = document.getElementById('logout')
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
        console.log(li[i].children[0].href)
        li[i].children[0].classList.add('active');
    }
    //deleting enter-header-link if the user is logged in
    if(document.cookie.split('=')[0] === 'cookid'){
        console.log(li[i].children[0].href)
        // li[4].classList.add('hidden')
        linkEnter.classList.add('hidden')
        linkLogout.classList.remove('hidden')
    }

}

const enter_button = document.getElementById('enter')
// const logout_button = document.getElementById('logout')
const reg_button = document.getElementById('reg')



//functiom try logging out, confirm: yes or no?
linkLogout.onclick = function (e) {
   if (!confirm('Вы уверены, что хотите выйти?')){
    e.preventDefault();
   }
}
// enter_button.classList.add("hidden")
// reg_button.classList.add("hidden")



//   console.log(`document.cookie: ${document.cookie}`)

var xy = document.cookie;
console.log(document.cookie.split(';'))
console.log(typeof xy)
 