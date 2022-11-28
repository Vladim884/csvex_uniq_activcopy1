window.addEventListener('load', function(){

    const pageTitle = document.querySelector("h1.users-page-title")
    const userList = document.querySelector("ul.users-list")
    const paginator = document.querySelector("ul.paginator")

    let arrPaginBtn = []
    

    let elems = []
    getUser()
    async function getUser() {
        const response = await fetch("http://localhost:5000/api/admin/usersList", { 
            method: "GET", 
            headers: { "Content-Type": "application/json" }
        })
        const data = await response.json()

        const usersList = data.paginationData.users

        if(!usersList) {
            pageTitle.textContent = `Ви не авторизовані! Виповніть вхід`
        } else {
            pageTitle.textContent = `Перелік користувачів сайту`
        }
        let pages = data.paginationData.pages
        let currentPortion = data.paginationData.currentPortion
        let portionSize = data.paginationData.portionSize
        // let btnValueNum = data.paginationData.start
        let btnValueNum = 0
        let portions = data.paginationData.portions

        displayUserList()

        function displayUserList(){

            getUserList(usersList)

            function getUserList(usersList) {
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
            }

            //display user-list after click on paginator-btns
            async function getUsersListForBtnNum () {
                // let btnNum = true

                //currentPage must be a number
                let currentPage = +this.innerText-1 
                for(i=0; i< elems.length; i++){
                    elems[i].classList.remove('active')
                }
                this.classList.add('active')
                
                // console.log(currentPage)
                const response = await fetch("http://localhost:5000/api/admin/usersList", {
                    method: "POST",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPage
                    })
                });
                if (response.ok === true) {
                    const data = await response.json()
                    let usersList = data.paginationData.users
                    userList.innerHTML = ""

                    getUserList(usersList)
                }
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
                    var elText = document.createTextNode( ++btnValueNum )
                    
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
                
                for(i=0; i< elems.length; i++){
                    elems[i].addEventListener('click', getUsersListForBtnNum)
                }

                const elNext = document.createElement("button")
                elNext.setAttribute('type', 'button')
                const elNextText = document.createTextNode(`next`)
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
                    const response = await fetch("http://localhost:5000/api/admin/usersList", {
                        method: "POST",
                        headers: { "Accept": "application/json", "Content-Type": "application/json" },
                        body: JSON.stringify({
                            currentPortion
                        })
                    });
                    if (response.ok === true) {
                        const data = await response.json()
                        let usersList = data.paginationData.users

                        paginator.innerHTML = ''
                        userList.innerHTML = ''

                        getUserList(usersList)
                        displayPaginationBtn()
                    } else {
                        paginator.innerHTML = ''
                        userList.innerHTML = ''
                        pageTitle.textContent = '404 Not Found '

                    }
                }
                
                elNext.addEventListener('click', async function () {
                    // debugger
                    currentPortion = currentPortion + 1
                    arrPaginBtn = []
                    getNewPortion()
                })

                elPrev.addEventListener('click', async function () {
                    currentPortion = currentPortion - 1
                    elems.splice(elems[-portionSize*2])
                    btnValueNum = currentPortion * portionSize - portionSize

                    getNewPortion()
                })
            }
            displayPaginationBtn()
        }
    }
})

