const pageTitle = document.querySelector("h1.users-page-title")
alert('ok')
    const userList = document.querySelector("ul.users-list")
    const paginator = document.querySelector("ul.paginator")
    const cont = document.querySelector("cont")

    // const response = await fetch("/api/payment/users", { 
    //     method: "GET", 
    //     headers: { "Content-Type": "application/json" },
    // })
    // const data = await response.json()
    // console.log(data)
    

    const arLi = paginator.querySelectorAll('li')
    console.log(arLi)
    async function displayUsersPage() {
        debugger
        let currentPage = this.innerText
        console.log(currentPage)
        const response = await fetch("/api/payment/users", {
                method: "POST",
                headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPage: currentPage
                })
            })
            // .then((res) => res.json())
            // .then((data) => console.log(data))
            // .catch((err) => console.log(err))
            // if (response.ok === true) {
            //     console.log('ok!')
                // const viewArr = await response.json();
                // reset();
                // cont.append(row(viewArr));
            // }
            const data = await response.json()
            console.log(data)
    }
        
    
    for(i=0; i<arLi.length; i++){
        arLi[i].addEventListener('click', displayUsersPage)
    }