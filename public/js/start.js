const enter_button = document.getElementById('enter')
// const logout_button = document.getElementById('logout')
const reg_button = document.getElementById('reg')

//form logout from account
const formLogout = document.getElementById('logout')

//functiom try logging out, confirm: yes or no?
formLogout.onclick = function (e) {
   if (!confirm('Вы уверены, что хотите выйти?')){
    e.preventDefault();
   }
}
enter_button.classList.add("hidden")
reg_button.classList.add("hidden")