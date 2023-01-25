let titleTv = document.getElementById('titletv')
        let checkBlackout = document.getElementById('check-blackout')
        let bodyEl = document.getElementsByTagName('body')
        let headerEl = document.getElementById('heade')
        let uslinks = document.getElementsByClassName('user-link')
        console.log(uslinks)
        
        checkBlackout.onclick = () => {
            if (checkBlackout.checked) {
                bodyEl[0].classList.add('black')
                headerEl.classList.add('black')
                titleTv.classList.add('lighty-color')
                for(let i = 0; i<=uslinks.length; i++ ){
                    uslinks[i].style.backgroundColor = "black"
                }
            }
            else {
                bodyEl[0].classList.remove('black')
                titleTv.classList.remove('lighty-color')
                headerEl.classList.remove('black')
                for(let i = 0; i<=uslinks.length; i++ ){
                    uslinks[i].style.backgroundColor = '#99CCCC'
                }
            }
        }   