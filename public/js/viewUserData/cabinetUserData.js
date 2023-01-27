
getUser();
async function getUser() {
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
    const response = await fetch("/api/auth/usercabinet", { 
            method: "GET", 
            headers: { "Content-Type": "application/json" },
    });
    const data = await response.json()

    const user = data.user
    const role = user.status
    
    fieldUser.textContent = user.nicname
    fieldEmail.textContent = user.email
    fieldUserId.textContent = user.id
    fieldStatusData.textContent = user.status
    
    const dateB = moment(user.endDay)
    const dateC = moment(moment().format())

    const hours = dateB.diff(dateC, 'hours')
    let days = dateB.diff(dateC, 'days')
    let endpart = hours % 24
    if(endpart <= 0){
        endpart = 0
    }

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
    
    registrDate.textContent = moment(user.registrDate).format("DD.MM.YYYY")
    let lastPayment = user.lastPayment
    if(!lastPayment) {lastPayingDate.textContent = 'Оплат ще не було'}
    else {
        lastPayingDate.textContent = ` 
            №${lastPayment.number} /
            ${moment(lastPayment.date).format("DD.MM.YY")} /
            ${lastPayment.sum}.00(грн)`
        }
    linkHistory.textContent = `Переглянути`
    linkHistory.href = `/api/admin/payhistorypage?id=${user.id}`
    linkPay.textContent = `Сплатити`
}