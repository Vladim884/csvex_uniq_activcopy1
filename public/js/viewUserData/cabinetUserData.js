alert('cabUsData')

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
    const response = await fetch("http://localhost:5000/api/auth/usercabinet", { 
            method: "GET", 
            headers: { "Content-Type": "application/json" },
    });
    const data = await response.json()

    const user = data.user
    const role = user.status
    console.log(user)
    
    fieldUser.textContent = user.nicname
    fieldEmail.textContent = user.email
    fieldUserId.textContent = user.id
    fieldStatusData.textContent = user.status

    //balance and activation-days
    var dateB = moment(user.endDay)
    var dateC = moment(moment().format())

    const hours = dateB.diff(dateC, 'hours')
    const days = dateB.diff(dateC, 'days')
    const endpart = hours % 24
    // console.log(`days = ${days}дн.${endpart}годин`)

    const countOneHour = 100 / 30 / 24
    const balance = hours * countOneHour

    // console.log('Разница в ', dateB.diff(dateC), 'миллисекунд')
    // console.log('Разница в ', dateB.diff(dateC, 'days'), 'дней')
    // console.log('Разница в ', dateB.diff(dateC, 'hours'), 'часов')
    // console.log('Разница в ', dateB.diff(dateC, 'months'), 'месяцев')
    if (days <= 0){
        days === 0
    }
    fieldActiveGenerator.textContent = `Активовано ${days} дн.${endpart} год.`
    fieldBalance.textContent = balance.toFixed(2) + ' грн'
    
    //==================
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
    linkHistory.href = `/api/admin/payhistorypage?id=${user.id}`
    linkPay.textContent = `Сплатити`
    //return data
}