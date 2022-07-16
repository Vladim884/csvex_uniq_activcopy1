const active_button = document.getElementById('act')
const active_input = document.getElementById('myt')

const searchString = new URLSearchParams(window.location.search);

const token = searchString.get('token');
// const param1 = searchString.get('param1');
// const param2 = searchString.get('param2');

const result = `${token}`; // clickid:22:23

active_input.value = result

console.log(`active_input.value: ${active_input.value}`)
// active_button.addEventListener('click', () => {
    sendUser();
async function sendUser() {
    const response = await fetch("/api/auth/activate", { method: "POST", body: result});
    const responseText = await response.text();
    console.log(responseText);
}
// })


console.log(result)