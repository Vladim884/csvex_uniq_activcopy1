const res_button = document.getElementById('res')
const rese_input = document.getElementById('rese')

const searchString = new URLSearchParams(window.location.search)
// const searchString = new URLSearchParams(window.location.search)

rese_input.value = searchString.get('resetlink')
console.log(rese_input.value)
// const result = `${token}`; // clickid:22:23

// active_input.value = result