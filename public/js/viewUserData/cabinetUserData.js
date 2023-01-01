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
    linkHistory.href = `/api/admin/payhistorypage?id=${user.id}`
    linkPay.textContent = `Сплатити`
    //return data
    
}