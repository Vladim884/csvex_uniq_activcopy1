const pageTitle = document.querySelector("h1.users-page-title")
const userList = document.querySelector("ul.users-list")
const paginator = document.querySelector("ul.paginator")
let flag = 0
const arLi = paginator.querySelectorAll('li')
console.log(arLi)

let elems = []
console.log(flag)
if(flag === 0){
    getUser()
}
async function getUser() {
    
        const response = await fetch("http://localhost:5000/api/payment/users1", { 
            method: "get", 
            headers: { "Content-Type": "application/json" }
            
        })
        
        // console.log(res)
        // if (response.ok === true) {
            const data = await response.json()
        // }

    console.log(data)
    const usersList = data.paginationData.usersData
    const pagesCount = data.paginationData.pagesCount
    let currentPage = data.paginationData.currentPage
    let rows = data.paginationData.rows
    let pages = data.paginationData.pages
    // const nicname = data.userData.nicname
    console.log(usersList)
    // console.log(nicname)
    if(!usersList) {
        pageTitle.textContent = `Ви не авторизовані! Виповніть вхід`
    } else {
        pageTitle.textContent = `Перелік користувачів сайту`
    }
    
    
    displayUserList()
    function displayUserList(){
        
        for (i=0;i<=usersList.length-1;i++) {
            //создаем элемент
            var elem = document.createElement("li");
            //создаем для него текст
            var elemText = document.createTextNode(`
                ${usersList[i].nicname}

                    `)
            //добавляем текст в элемент в качестве дочернего элемента
            elem.appendChild(elemText);
            //добавляем элемент в блок div
            userList.appendChild(elem)
        }
        function displayPaginationBtn(){
            // debugger
            //создаем элемент
            
            for (i=0;i<pages;i++) {
                console.log(pages)
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



async function displayUsersPage1 () {
    // debugger
    flag = 1
    let currentPage = this.innerText
    console.log(currentPage)
        const response = await fetch("http://localhost:5000/api/payment/users1", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPage: +currentPage - 1
            })
        });
        if (response.ok === true) {
            const data = await response.json()
            console.log(data)
            let usersList = data.paginationData.usersData
            userList.innerHTML = ""

            //=========
            for (i=0;i<=usersList.length-1;i++) {
                //создаем элемент
                var elem = document.createElement("li");
                //создаем для него текст
                var elemText = document.createTextNode(`
                    ${usersList[i].nicname}
    
                        `)
                //добавляем текст в элемент в качестве дочернего элемента
                elem.appendChild(elemText);
                //добавляем элемент в блок div
                userList.appendChild(elem)
            }
            // function displayPaginationBtn(){
            //     // debugger
            //     //создаем элемент
                
            //     for (i=0;i<pages;i++) {
            //         console.log(pages)
            //         const el = document.createElement("li")
            //         var elText = document.createTextNode(`${i + 1}`)
                    
            //         //добавляем текст в элемент в качестве дочернего элемента
            //         el.appendChild(elText);
            //         //добавляем элемент в блок ul
            //         paginator.appendChild(el)
            //         elems.push(el)
            //     }
            //     console.log(Object.values(elems))
            //     for(i=0; i< elems.length; i++){
                
            //         elems[i].addEventListener('click', displayUsersPage1)
            //     }
            // }
            //============
        }
}

