window.addEventListener('load', function(){

    const pageTitle = document.querySelector("h1.users-page-title")
    const userList = document.querySelector("ul.users-list")
    const paginator = document.querySelector("ul.paginator")

    let arrPaginBtn = []
    

    let elems = []
    getUser()
    async function getUser() {
        const response = await fetch("http://localhost:5000/api/payment/usersList", { 
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        })
        const data = await response.json()
        console.log(data)

        const usersList = data.paginationData.users

        if(!usersList) {
            pageTitle.textContent = `Ви не авторизовані! Виповніть вхід`
        } else {
            pageTitle.textContent = `Перелік користувачів сайту`
        }
        let pages = data.paginationData.pages
        let currentPortion = data.paginationData.currentPortion
        let portionSize = data.paginationData.portionSize
        let btnValueNum = data.paginationData.start
        let portions = data.paginationData.portions

        displayUserList()
        function displayUserList(){
            for (i=0;i<=usersList.length-1;i++) {
                //создаем элемент
                var elem = document.createElement("li");
                //создаем для него текст
                var elemText = document.createTextNode(`
                ${usersList[i].role}: ${usersList[i].nicname} 
                з ${moment(usersList[i].registrDate).format('DD.MM.YY')}
                email: ${usersList[i].email} 
                на рахунку: ${usersList[i].balance.toFixed(2)} грн. 
                послугу активовано до: ${moment(usersList[i].endDay).format('DD.MM.YY')}
                `)
                //добавляем текст в элемент в качестве дочернего элемента
                elem.appendChild(elemText);
                //добавляем элемент в блок div
                userList.appendChild(elem)
            }
            
            function displayPaginationBtn(){
                const elPrev = document.createElement("button")
                elPrev.setAttribute('type', 'button')
                var elPrevText = document.createTextNode(`prev`)
                elPrev.appendChild(elPrevText)
                paginator.appendChild(elPrev)

                // debugger
                for (i=0;i<portionSize;i++) {
                    // console.log(portionSize)

                    //create element
                    const el = document.createElement("li")
                    // 
                    var elText = document.createTextNode(`${++btnValueNum}`)
                    console.log(typeof(btnValueNum))
                    
                    //добавляем текст в элемент в качестве дочернего элемента
                    el.appendChild(elText);
                    //добавляем элемент в блок ul
                    paginator.appendChild(el)
                    elems.push(el)
                    console.log(`for pag-elems: ${elems.length}`)
                    console.log(`for pages: ${pages}`)
                    if(btnValueNum === pages) break
                   
                }

                arrPaginBtn = paginator.querySelectorAll('li')
                arrPaginBtn[0].classList.add('active')
                console.log(`arrPaginBtn: ${Object.values(arrPaginBtn)}`)
                // console.log(elems)
                console.log(Object.values(elems))
                for(i=0; i< elems.length; i++){
                    // if(i === elems[i].innerText - 1) elems[i].classList.add('active')
                    // elems[0].classList.add('active')
                    elems[i].addEventListener('click', displayUsersPage1)
                }

                const elNext = document.createElement("button")
                elNext.setAttribute('type', 'button')
                var elNextText = document.createTextNode(`next`)
                elNext.appendChild(elNextText)
                paginator.appendChild(elNext)

                //hidden next-button
                if(currentPortion === portions) {
                    elNext.classList.add('hidden')
                    // return
                }

                if(currentPortion < 2) {
                    elPrev.classList.add('hidden')
                    // return
                }
                
                elNext.addEventListener('click', async function () {
                    currentPortion = currentPortion + 1
                    console.log(`1next elems: ${elems.length}`)
                    
                    const response = await fetch("http://localhost:5000/api/payment/usersList1", {
                        method: "POST",
                        headers: { "Accept": "application/json", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            currentPortion
                        })
                    });
                    if (response.ok === true) {
                        const data = await response.json()
                        console.log(data)
                        let usersList = data.paginationData.users
                        
                        userList.innerHTML = ""

                        for (i=0;i<=usersList.length-1;i++) {
                            //create element
                            var elem = document.createElement("li")
            
                            //create text for element
                            var elemText = document.createTextNode(`
                                ${usersList[i].role}: ${usersList[i].nicname} 
                                з ${moment(usersList[i].registrDate).format('DD.MM.YY')}
                                email: ${usersList[i].email} 
                                на рахунку: ${usersList[i].balance.toFixed(2)} грн. 
                                послугу активовано до: ${moment(usersList[i].endDay).format('DD.MM.YY')}
                            `)
            
                            //adding text into element
                            elem.appendChild(elemText)
            
                            //adding element into ul - .userList
                            userList.appendChild(elem)
                        }
                        
                        paginator.innerHTML = ''
                        arrPaginBtn = []
                        
                        displayPaginationBtn()
                        console.log(`2next elems: ${elems.length}`)
                    }

                })

                elPrev.addEventListener('click', async function () {
                    currentPortion = currentPortion - 1
                    // for (let i = 0; i < (portionSize * 2); i++) {
                    //     elems.pop()
                    // }

                    elems.splice(elems[-portionSize*2])

                    console.log(`1prev elems: ${elems.length}`)
                    
                    
                    console.log(`elPrev currentPortion: ${currentPortion}`)
                    const response = await fetch("http://localhost:5000/api/payment/usersList1", {
                        method: "POST",
                        headers: { "Accept": "application/json", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            currentPortion
                        })
                    });
                    if (response.ok === true) {
                        const data = await response.json()
                        console.log(data)
                        let usersList = data.paginationData.users
                        
                        userList.innerHTML = ""

                        for (i=0;i<=usersList.length-1;i++) {
                            //create element
                            var elem = document.createElement("li")
            
                            //create text for element
                            var elemText = document.createTextNode(`
                                ${usersList[i].role}: ${usersList[i].nicname} 
                                з ${moment(usersList[i].registrDate).format('DD.MM.YY')}
                                email: ${usersList[i].email} 
                                на рахунку: ${usersList[i].balance.toFixed(2)} грн. 
                                послугу активовано до: ${moment(usersList[i].endDay).format('DD.MM.YY')}
                            `)
            
                            //adding text into element
                            elem.appendChild(elemText)
            
                            //adding element into ul - .userList
                            userList.appendChild(elem)
                        }
                        
                        paginator.innerHTML = ''
                        
                        
                        // elems.splice(-+portionSize)
                        console.log(`prev onclick elems: ${elems.length}`)

                        btnValueNum = currentPortion * portionSize - portionSize
                        // console.log(`elPrev elems: ${elems}`)
                        displayPaginationBtn()
                        console.log(`2prev elems: ${elems.length}`)
                    }

                })

            }
            displayPaginationBtn()
        }
    }


    //display user-list after click on paginator-btns
    async function displayUsersPage1 () {

        //currentPage must be a number
        let currentPage = +this.innerText-1 
        for(i=0; i< elems.length; i++){
            elems[i].classList.remove('active')
        }
        this.classList.add('active')
        
        // console.log(currentPage)
        const response = await fetch("http://localhost:5000/api/payment/usersList", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPage,
            })
        });
        if (response.ok === true) {
            const data = await response.json()
            console.log(data)
            let usersList = data.paginationData.users
            userList.innerHTML = ""

            for (i=0;i<=usersList.length-1;i++) {
                //create element
                var elem = document.createElement("li")

                //create text for element
                var elemText = document.createTextNode(`
                    ${usersList[i].role}: ${usersList[i].nicname} 
                    з ${moment(usersList[i].registrDate).format('DD.MM.YY')}
                    email: ${usersList[i].email} 
                    на рахунку: ${usersList[i].balance.toFixed(2)} грн. 
                    послугу активовано до: ${moment(usersList[i].endDay).format('DD.MM.YY')}
                `)

                //adding text into element
                elem.appendChild(elemText)

                //adding element into ul - .userList
                userList.appendChild(elem)
            }
        }
    }
})

