window.addEventListener('load', function(){

    const res_button = document.getElementById('res')
    const rese_input = document.getElementById('rese')

    const searchString = new URLSearchParams(window.location.search)

    rese_input.value = searchString.get('resetlink')
    
})