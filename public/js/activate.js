window.addEventListener('load', function(){
    const active_button = document.getElementById('act')
    const active_input = document.getElementById('myt')

    const searchString = new URLSearchParams(window.location.search);

    const token = searchString.get('check');
    // const param1 = searchString.get('param1');
    // const param2 = searchString.get('param2');

    const result = `${token}`; 

    active_input.value = result

    sendUser()
    async function sendUser() {
        const response = await fetch("/api/auth/activate", { method: "POST", body: result});
        const responseText = await response.text();
    }
})