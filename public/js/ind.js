
console.log('start my site!')

// const enter_button = document.getElementById('enter')
// const reg_button = document.getElementById('reg')
const wrap_box = document.getElementById('wrap')
const contmenu_box = document.getElementById('contmenu')

// enter_button.classList.add("d-none")
// reg_button.classList.add("d-none")

const a = 'http://localhost:5000/login'
const but_download = document.getElementById('down_load')
const but_data_save = document.getElementById('data_save')

but_data_save.onclick = () => {
    but_download.disabled = false
}

but_download.onclick = function(){ // функция при клике на неё 
        contmenu_box.classList.remove('hidden')
        wrap_box.classList.add('hidden')
}


const checkbox = document.getElementById('checkbox')
const but_firstReqChange = document.getElementById('reqChange')
const but_nextItem = document.getElementById('nextItem')
const but_joinerWords = document.getElementById('joinerWords')
const but_mainPhrase = document.getElementById('mainPhrase')
const but_swapPlaces = document.getElementById('swap')

const countBlock = document.getElementById('count')

let linamear = document.getElementsByClassName('liname')
let namear = document.getElementsByClassName('name')
console.log(namear)

let lifindar = document.getElementsByClassName('lifind')
let findar = document.getElementsByClassName('find')
let groupFindReq1 = document.getElementById('group1')
let mainPhrase1 = document.getElementById('mainphrase')


let ligroupar = document.getElementsByClassName('ligroup');
let groupar = document.getElementsByClassName('group')

let thisname
let thisfind
let thisgroup

let newFoundValue
checkbox.onclick = () => {
    if (checkbox.checked) {
        but_joinerWords.disabled = true
        but_mainPhrase.disabled = false
    }
    else {
        but_joinerWords.disabled = false
        but_mainPhrase.disabled = true
    }
}
let index = 0;


but_firstReqChange.onclick = () => {
    // groupFindReq1.value = groupFindReq1.value.trim()// строка поисковых запросов
    newFoundValue = newFoundValue.trim()// строка поисковых запросов
    mainPhrase1.value = mainPhrase1.value.trim()// строка главной фразы №1
    // let arrFindReq = groupFindReq1.value.split(" ") // перевод строки group1 в массив с разделителем " "
    let arrFindReq = newFoundValue.split(" ") // перевод строки group1 в массив с разделителем " "
    // arrFindReq = arrFindReq.filter(function (item, position, array) {
    //     return array.lastIndexOf(item) === position; // вернём уникальные элементы
    //   })
    let arMainPhr = mainPhrase1.value.split(" ") // перевод строки mainPhrase в массив с разделителем " "
    // for (let i = 0; i < arrFindReq.length; i++) { // удаление одинаковых слов из mainPhrase в group1  
    //     if (arrFindReq[i] === arMainPhr[0] || arrFindReq[i] === arMainPhr[1]) {
    //         arrFindReq.splice(i, 1) // full deleting from arrey
    //     }
    // }
    // alert(arrFindReq)
    console.log(`arrFindReq:${arrFindReq}`)

    let str1 = `${mainPhrase1.value}, ${arMainPhr[1]} ${arMainPhr[0]}, `
    console.log(`str1: ${str1}`)
    alert(str1)
    for (let i = 0; i < arrFindReq.length; i++) {
        str1 += `${arMainPhr[0]} ${arrFindReq[i]}, ${arrFindReq[i]} ${arMainPhr[0]}, `
        str1 += `${arMainPhr[0]} ${arMainPhr[1]} ${arrFindReq[i]}, `
        str1 += `${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i]}, `
        str1 += `${arMainPhr[0]}  ${arrFindReq[i]} ${arMainPhr[1]}, `
        
        str1 += `${arMainPhr[0]} ${arrFindReq[arrFindReq.length-1]}, ${arrFindReq[arrFindReq.length-1]} ${arMainPhr[0]}, `
        str1 += `${arMainPhr[0]} ${arMainPhr[1]} ${arrFindReq[arrFindReq.length-1]}, `
        str1 += `${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[arrFindReq.length-1]}, `
        str1 += `${arMainPhr[0]}  ${arrFindReq[arrFindReq.length-1]} ${arMainPhr[1]}, `
        
        if(arrFindReq[i+1]){
            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i]} ${arrFindReq[i+1]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]}  ${arMainPhr[1]} ${arrFindReq[i+1]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+1]}  ${arMainPhr[1]}, `    
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+1]}, `    
        }
        if(arrFindReq[i+2]){
            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i]} ${arrFindReq[i+2]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]}  ${arMainPhr[1]} ${arrFindReq[i+2]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+2]}  ${arMainPhr[1]}, `    
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+2]}, `
            
            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i+1]} ${arrFindReq[i+2]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+1]}  ${arMainPhr[1]} ${arrFindReq[i+2]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+1]} ${arrFindReq[i+2]}  ${arMainPhr[1]}, `    
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i+1]} ${arrFindReq[i+2]}, `
        }
        if(arrFindReq[i+3]) {
            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]}  ${arMainPhr[1]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+3]}  ${arMainPhr[1]}, `    
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i]} ${arrFindReq[i+3]}, `

            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i+1]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+1]}  ${arMainPhr[1]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+1]} ${arrFindReq[i+3]}  ${arMainPhr[1]}, `    
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i+1]} ${arrFindReq[i+3]}, `

            str1 += `${arMainPhr[0]}  ${arMainPhr[1]} ${arrFindReq[i+2]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+2]}  ${arMainPhr[1]} ${arrFindReq[i+3]}, `    
            str1 += `${arMainPhr[0]} ${arrFindReq[i+2]} ${arrFindReq[i+3]}  ${arMainPhr[1]}, `    
            
            str1 += ` ${arMainPhr[1]} ${arMainPhr[0]} ${arrFindReq[i+2]} ${arrFindReq[i+3]}, `
        }
           
    }
    str1 = str1.toLowerCase()
    thisfind.value = thisfind.value.toLowerCase()
    let resStr1 = str1.split('_').join(' ').split('  ').join(' ')
    console.log(resStr1)
    // thisfind.value = `${thisfind.value}, ${resStr1}`
    thisfind.value = resStr1
    characterCount(thisfind.value)
}
function displCurrentData() {
    for (let i = 0; i < linamear.length; i++) {
        if(index === linamear.length){
            // index = 0
            // return
            but_nextItem. disabled = true
        }
        if(i!=index){
            linamear[i].classList.add('hidden')
            lifindar[i].classList.add('hidden');
            ligroupar[i].classList.add('hidden');
        }
        linamear[index].classList.remove('hidden');
        lifindar[index].classList.remove('hidden');
        ligroupar[index].classList.remove('hidden');
            

        namear[i].id = 'nameid' + i;
        findar[i].id = 'findid' + i;
        groupar[i].id = 'groupid' + i;

        // divText.innerHTML = findar[i].value

        console.log('ok');
    }
}

const characterCount = (strX) => {
    let countChar = strX.replace(/[\s,]/g, '').length
    countBlock.innerHTML = `Символов: ${countChar}`
    alert(countChar)
}

document.addEventListener('DOMContentLoaded', function(){
    displCurrentData()
    initialReqChange()
    characterCount(thisfind.value)
});


but_nextItem.onclick = () => {
    index++
    if(index === linamear.length) {
        but_nextItem.disabled = true
    }
    displCurrentData()
    initialReqChange()
    mainPhrase1.value = ''
    characterCount(thisfind.value)
}
const initialReqChange = function () {
    thisname = document.getElementById('nameid'+index);
    thisfind = document.getElementById('findid'+index);
    thisgroup = document.getElementById('groupid'+index);

    
    let thisNameValue = thisname.value;
    let thisFindValue = thisfind.value;
    let thisGroupValue = thisgroup.value;

    // groupFindReq1.value = `${thisNameValue}`
    groupFindReq1.value = thisNameValue
    // thisfind.value = `${thisNameValue} ${thisFindValue} ${thisGroupValue}`

    // Удаление знаков препинания:
    //оставить скобки () и дефис -
    groupFindReq1.value = groupFindReq1.value.replace(/[\.,\/#!$%\^&\*;:{}=\_`~@\+\?><\[\]\+]/g, '')
    ////без скобок () и дефиса -
    // thisfind.value = thisfind.value.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g, '')
    
    //замена дефиса "-" на пробел
    groupFindReq1.value = groupFindReq1.value.replace(/-/g, ' ');
    
    // Перевод всех букв в нижний регистр
    groupFindReq1.value = groupFindReq1.value.toLowerCase()

    if(index>linamear.length-1) but_find.disabled = true
}
but_joinerWords.onclick = () => {
    
        let subs = groupFindReq1.value.substring(groupFindReq1.selectionStart, groupFindReq1.selectionEnd);
        // subs = subs.split(' ').join('&nbsp;')
        subs = subs.split(' ').join('_')
        groupFindReq1.value = groupFindReq1.value.substring(0, groupFindReq1.selectionStart) + 
        subs +
        groupFindReq1.value.substring(groupFindReq1.selectionEnd, groupFindReq1.length);
}

but_mainPhrase.onclick = () => {
    let subs = groupFindReq1.value.substring(groupFindReq1.selectionStart, groupFindReq1.selectionEnd);
    // subs = subs.split(' ').join('&nbsp;')
    subs = subs.split(' ')
    // alert(subs)
    mainPhrase1.value = `${subs[0]} ${subs[subs.length-1]}`
    let ar = groupFindReq1.value.split(' ')
    // alert(`ar: ${ar}`)
    // alert(subs[0])
    // alert(subs[1])
    // let ar1 = ar
    for (let i = 0; i < ar.length; i++) {
        if (ar[i] === subs[0] || ar[i] === subs[subs.length-1]){
            ar.splice(i, 1)
        } 
    }
    alert(ar)
    // for (let i = 0; i < ar.length; i++) {
    //     if (ar[i] === subs[1]){
    //         ar.splice(i, 1)
    //     } 
    // }
    // alert(ar)
    // groupFindReq1.value = ar.join(' ')
    newFoundValue = ar.join(' ')
    
    but_firstReqChange.disabled = false
}

but_swapPlaces.onclick = () => {
    alert('swap')
    let arMainPhrase = mainPhrase1.value.split(" ")

    mainPhrase1.value = `${arMainPhrase[1]} ${arMainPhrase[0]}`
}

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}






