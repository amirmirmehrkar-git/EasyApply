const emptyGuid = "00000000-0000-0000-0000-000000000000";
const multiSelectLocalLang = {
    selectAll: "انتخاب همه",
    selectNone: "حذف همه",
    reset: "بازنشانی",
    search: "جستجو ...",
    nothingSelected: "موردی انتخاب نشده است"
}
const userType = {
    Admin: 0,
    Teacher: 1,
    Student: 2,
    Employee: 3,
    Labels: [
        { id: 0, title: "Admin" },
        { id: 1, title: "Teacher" },
        { id: 2, title: "Student" },
        { id: 3, title: "Employee" }
    ]
}
const priority = {
    High: 0,
    Medium: 1,
    Low: 2,
    Labels: [
        { id: 0, title: "بالا" },
        { id: 1, title: "متوسط" },
        { id: 2, title: "پایین" }
    ]
}
const ticketStatus = {
    Open: 0,
    Seen: 1,
    Close: 2,
    Labels: [
        { id: 0, title: "باز" },
        { id: 1, title: "مشاهده شده" },
        { id: 2, title: "بسته" }
    ]
}
const paymentStatus = {
    Waiting: 0,
    Approved: 1,
    Rejected: 2,
    Labels: [
        { id: 0, title: "در انتظار" },
        { id: 1, title: "تایید شده" },
        { id: 2, title: "رد شده" }
    ]
}
const paymentType = {
    ToWallet: 0,
    Gold: 1,
    Instalment: 2,
    FromWallet: 3,
    FromWalletInstalment: 4,
    Labels: [
        { id: 0, title: "شارژ کیف پول" },
        { id: 1, title: "خرید طلا" },
        { id: 2, title: "اقساط" },
        { id: 3, title: "خرید از کیف پول" },
        { id: 4, title: "اقساط از کیف پول" },
    ]
}
const paymentState = {
    Payed: 0,
    NotPayed: 1,
    Labels: [
        { id: 0, title: "پرداخت شده" },
        { id: 1, title: "پرداخت نشده" },
    ]
}
const requestType = {
    FromWallet: 0,
    FromGold: 1,
    Labels: [
        { id: 0, title: "برداشت از کیف پول" },
        { id: 1, title: "برداشت از صندوق طلا" },
    ]
}
const partnershipSource = {
    FromWallet: 0,
    FromGold: 1,
    FromCard: 2,
    Labels: [
        { id: 0, title: "کیف پول" },
        { id: 1, title: "صندوق طلا" },
        { id: 2, title: "پرداخت مستقیم" },
    ]
}
const payProfitType = {
    Money: 0,
    Gold: 1,
    Labels: [
        { id: 0, title: "پرداخت سود به کیف پول" },
        { id: 1, title: "پرداخت سود به صندوق طلا" },
    ]
}
const warrantyType = {
    FromWallet: 0,
    FromGold: 1,
    FromPartnership: 2,
    PhisicalGold: 3,
    Dollar: 4,
    Euro: 5,
    Labels: [
        { id: 0, title: "کیف پول" },
        { id: 1, title: "صندوق طلا" },
        { id: 2, title: "مضاربه" },
        { id: 3, title: "طلای فیزیکی" },
        { id: 4, title: "دلار" },
        { id: 5, title: "یورو" },
    ]
}