const eml = document.getElementById('inputval')
    const inputval = eml.value
    // console.log(`email = ${inputval}`)
    getUser(inputval);
    async function getUser(inpval) {
        const fieldUser = document.querySelector('.field-user')
        const fieldEmail = document.querySelector('.field-email')
        const fieldUserId = document.querySelector('.field-userid')
        const registrDate = document.querySelector('.field-registrDate')
        const lastPayingDate = document.querySelector('.field-lastPaying')
        const fieldStatusData = document.querySelector('.field-status')
        const fieldActiveGenerator = document.querySelector('.field-active-generator')
        const fieldBalance = document.querySelector('.field-balance')
        const linkHistory = document.querySelector('.linkhistory')
        const linkPay = document.querySelector('.linkpay')
        const response = await fetch("http://localhost:5000/api/admin/finduser", { 
                method: "POST",
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: inpval
                    })
                });
                if (response.ok === true) {
                    const data = await response.json()
                    console.log(data)
                

                    

        const user = data.user
        const role = user.status
        console.log(user)
        
        fieldUser.textContent = user.nicname
        fieldEmail.textContent = user.email
        fieldUserId.textContent = user._id
        fieldStatusData.textContent = user.status
        //fieldBalance.textContent = (100/30 * user.daysLeft).toFixed(2) + '(грн)'
        fieldBalance.textContent = user.balance.toFixed(2) + '(грн)'
        fieldActiveGenerator.textContent = `Активовано на ${user.daysLeft} днів`
        //const registrDate = document.querySelector('.field-registrDate')
        //registrDate.textContent = formatNowDate(user.registrDate)
        registrDate.textContent = moment(user.registrDate).format("DD.MM.YYYY")
        //let lastPayments = user.payments[user.payments.length - 1];
        let lastPayment = user.lastPayment
        if(!lastPayment) {lastPayingDate.textContent = 'Оплат ще не було'}
        else {
            lastPayingDate.textContent = ` 
                №${lastPayment.number} /
                ${moment(lastPayment.date).format("DD.MM.YY")} /
                ${lastPayment.sum}.00(грн)`
            }
        linkHistory.textContent = `Переглянути`
        linkHistory.href = `http://localhost:5000/api/admin/payhistorypage?id=${user._id}`
        linkPay.href = `http://localhost:5000/api/admin/payhistorypage?id=${user._id}`
        linkPay.textContent = `Сплатити`
        //return data
        }
        
    }