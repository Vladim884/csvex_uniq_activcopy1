window.addEventListener('load', function(){ 
    const searchStringEm = new URLSearchParams(window.location.search)
    const idpay = searchStringEm.get('id')
    // console.log(idpay)
    const pageTitle = document.querySelector("h1.history-page-title")
    const paymentsList = document.querySelector("ul.payment-list")
    const paginator = document.querySelector("ul.paginator")
    let arrPaginBtn = []
    let elems = []
    const user = getUser()
    async function getUser() {
        let currentPage = 0
        let currentPortion = 1
        const response = await fetch(`/api/admin/payhistory`, { 
            method: "POST", 
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPage,
                        currentPortion,
                        idpay
                    })
                });
                if (response.ok === true) {
                    console.log('all ok!')
                } else {
                    console.log('server send bad response')
                }
                const data = await response.json()
                const nicname = data.paginationData.nicname
                // console.log(nicname)
        

        //const payments = data.userPaymentsData.payments
        const currPaymentsData = data.paginationData.currPaymentsData
        if (currPaymentsData.length === 0) return
        
        
        if(!currPaymentsData) {
            pageTitle.textContent = `Ви не авторизовані! Виповніть вхід`
        } else {
            pageTitle.textContent = `Історія платежів ${nicname}`

        }

        let pages = data.paginationData.pages
        //let currentPortion = data.paginationData.currentPortion
        let portionSize = data.paginationData.portionSize
        // let btnValueNum = data.paginationData.start
        let btnValueNum = currentPortion * portionSize - portionSize
        let portions = data.paginationData.portions
        let rows = data.paginationData.rows
            
        displayPaymentsList()

        function displayPaymentsList(){

            getPaymentsList(currPaymentsData)

            function getPaymentsList(currPaymentsData) {
        
                for (i=0; i<currPaymentsData.length; i++) {
                    const d = moment(currPaymentsData[i].date).format()
                    // создаем элемент
                    var elem = document.createElement("li");
                    // создаем для него текст
                    var elemText = document.createTextNode(`
                        Плата за послугу "Генератор тегів"
                        №${currPaymentsData[i].number}
                        дата: ${moment(d).format('DD.MM.YY')} /
                        сума: ${currPaymentsData[i].sum}.00(грн)`)
                    // добавляем текст в элемент в качестве дочернего элемента
                    elem.appendChild(elemText);
                    // добавляем элемент в блок div
                    paymentsList.appendChild(elem)
                }
            }

            //display user-list after click on paginator-btns
            async function getPaymentsListForBtnNum () {
                // let btnNum = true

                //currentPage must be a number
                let currentPage = +this.innerText-1 
                for(i=0; i< elems.length; i++){
                    elems[i].classList.remove('active')
                }
                this.classList.add('active')
                
                // console.log(currentPage)
                const response = await fetch("/api/admin/payhistory", {
                    method: "POST",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPage,
                        currentPortion,
                        idpay
                    })
                });
                if (response.ok === true) {
                    const data = await response.json()
                    let currPaymentsData = data.paginationData.currPaymentsData
                    paymentsList.innerHTML = ""

                    getPaymentsList(currPaymentsData)
                }
            }

            function displayPaginationBtn(){

                const elPrev = document.createElement("button")
                elPrev.classList.add('users-page-btn')
                elPrev.setAttribute('type', 'button')
                var elPrevText = document.createTextNode(`< prev`)
                elPrev.appendChild(elPrevText)
                paginator.appendChild(elPrev)

                // debugger
                for (i=0;i<portionSize;i++) {
                    // console.log(portionSize)

                    //create element
                    const el = document.createElement("li")
                    // 
                    var elText = document.createTextNode( ++btnValueNum )
                    
                    //добавляем текст в элемент в качестве дочернего элемента
                    el.appendChild(elText);
                    //добавляем элемент в блок ul
                    paginator.appendChild(el)
                    elems.push(el)
                    
                    console.log(`for pages: ${pages}`)
                    if(btnValueNum === pages) break
                   
                }

                arrPaginBtn = paginator.querySelectorAll('li')
                arrPaginBtn[0].classList.add('active')
                
                
                for(i=0; i< elems.length; i++){
                    elems[i].addEventListener('click', getPaymentsListForBtnNum)
                }

                const elNext = document.createElement("button")
                elNext.classList.add('users-page-btn')
                elNext.setAttribute('type', 'button')
                const elNextText = document.createTextNode(`next >`)
                elNext.appendChild(elNextText)
                paginator.appendChild(elNext)

                //hidden next-button
                if(currentPortion === portions) {
                    elNext.classList.add('hidden')
                }

                if(currentPortion < 2) {
                    elPrev.classList.add('hidden')
                }

                async function getNewPortion () {
                    const response = await fetch("/api/admin/payhistory", {
                        method: "POST",
                        headers: { "Accept": "application/json", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            currentPage,
                            currentPortion,
                            idpay
                        })
                    });
                    if (response.ok === true) {
                        const data = await response.json()
                        let currPaymentsData = data.paginationData.currPaymentsData

                        paginator.innerHTML = ''
                        paymentsList.innerHTML = ''

                        getPaymentsList(currPaymentsData)
                        displayPaginationBtn()
                    } else {
                        paginator.innerHTML = ''
                        userList.innerHTML = ''
                        pageTitle.textContent = '404 Not Found '

                    }
                }
                
                elNext.addEventListener('click', async function () {
                    
                    currentPortion = currentPortion + 1
                    currentPage = (currentPortion - 1) * portionSize
                    arrPaginBtn = []
                    getNewPortion()
                })

                elPrev.addEventListener('click', async function () {
                    currentPortion = currentPortion - 1
                    currentPage = (currentPortion - 1) * portionSize 
                    
                    elems.splice(elems[-portionSize*2])
                    btnValueNum = currentPortion * portionSize - portionSize

                    getNewPortion()
                })
            }
            displayPaginationBtn()
        }
    }
}) 