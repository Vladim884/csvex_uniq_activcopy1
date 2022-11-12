const pageTitle = document.querySelector("h1.users-page-title")
const userList = document.querySelector("ul.users-list")
const paginator = document.querySelector("ul.paginator")
const arLi = paginator.querySelectorAll('li')
console.log(arLi)

let elems = []
getUser()
async function getUser() {
    const response = await fetch("http://localhost:5000/api/payment/users1", { 
        method: "get", 
        headers: { "Content-Type": "application/json" }
    })
    // if (response.ok === true) {
    const data = await response.json()
    console.log(data)

    const usersList = data.paginationData.usersData
    let pages = data.paginationData.pages
    // console.log(usersList)
    if(!usersList) {
        pageTitle.textContent = `Ви не авторизовані! Виповніть вхід`
    } else {
        pageTitle.textContent = `Перелік користувачів сайту`
    }
    
    //start display user-list
    displayUserList()
    function displayUserList(){
        for (i=0;i<=usersList.length-1;i++) {
            //создаем элемент
            var elem = document.createElement("li");
            //создаем для него текст
            var elemText = document.createTextNode(`${usersList[i].nicname}`)
            //добавляем текст в элемент в качестве дочернего элемента
            elem.appendChild(elemText);
            //добавляем элемент в блок div
            userList.appendChild(elem)
        }
        function displayPaginationBtn(){
            // debugger
           for (i=0;i<pages;i++) {
                console.log(pages)

                //create element
                const el = document.createElement("li")
                var elText = document.createTextNode(`${i + 1}`)
                
                //добавляем текст в элемент в качестве дочернего элемента
                el.appendChild(elText);
                //добавляем элемент в блок ul
                paginator.appendChild(el)
                elems.push(el)
            }
            console.log(Object.values(elems))
            for(i=0; i< elems.length; i++){
            
                elems[i].addEventListener('click', displayUsersPage1)
            }
        }
        displayPaginationBtn()
    }
}


//display user-list after click on paginator-btns
async function displayUsersPage1 (rows) {
    // debugger

    //currentPage must be a number
    let currentPage = +this.innerText-1 
    // console.log(currentPage)
    const response = await fetch("http://localhost:5000/api/payment/users1", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
            currentPage,
            rows
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
            var elemText = document.createTextNode(` ${usersList[i].nicname}`)

            //adding text into element
            elem.appendChild(elemText)

            //adding element into ul - .userList
            userList.appendChild(elem)
        }
    }
}

