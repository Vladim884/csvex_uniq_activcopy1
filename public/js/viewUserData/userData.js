const eml = document.getElementById('inputval')
const flag = document.getElementById('flag')
    const inputval = eml.value
    let reqstring
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
        if(flag.value === 'email') {
            reqstring = "/api/admin/finduser"
        }
        if(flag.value === 'id') {
            reqstring = "/api/admin/finduserbyid"
        }
        
        // const response = await fetch("/api/admin/finduser", { 
        const response = await fetch(reqstring, { 
                method: 'POST',
                    headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usdata: inpval
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

        //balance and activation-days
        
        var dateB = moment(user.endDay)
        var dateC = moment(moment().format())

        const hours = dateB.diff(dateC, 'hours')
        let days = dateB.diff(dateC, 'days')
        let endpart = hours % 24
        if(endpart <= 0){
            endpart = 0
        }
        // console.log(`days = ${days}дн.${endpart}годин`)

        const countOneHour = 100 / 30 / 24
        let balance = hours * countOneHour
        if(balance <= 0){
            balance = 0
        }

        // console.log('Разница в ', dateB.diff(dateC), 'миллисекунд')
        // console.log('Разница в ', dateB.diff(dateC, 'days'), 'дней')
        // console.log('Разница в ', dateB.diff(dateC, 'hours'), 'часов')
        // console.log('Разница в ', dateB.diff(dateC, 'months'), 'месяцев')
        if (days <= 0){
            days = 0
        }
        fieldActiveGenerator.textContent = `Активовано ${days} дн.${endpart} год.`
        fieldBalance.textContent = balance.toFixed(2) + ' грн'
        //==================
        
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
        }
    }