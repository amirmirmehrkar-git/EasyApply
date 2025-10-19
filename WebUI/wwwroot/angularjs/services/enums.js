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
    User: 1,
    Labels: [
        { id: 0, title: "Admin" },
        { id: 1, title: "User" },
    ]
}
const priority = {
    High: 0,
    Medium: 1,
    Low: 2,
    Labels: [
        { id: 0, title: "High" },
        { id: 1, title: "Medium" },
        { id: 2, title: "Low" }
    ]
}
const ticketStatus = {
    Open: 0,
    Seen: 1,
    Close: 2,
    Labels: [
        { id: 0, title: "Open" },
        { id: 1, title: "Seen" },
        { id: 2, title: "Closed" }
    ]
}
const skillValue = [
    1,
    2,
    3,
    4,
    5,
];
const fileType = {
    Video: 0,
    Pdf: 1,
    Image: 2,
    Labels: [
        { id: 0, title: "Video" },
        { id: 1, title: "Pdf" },
        { id: 2, title: "Image" }
    ]
}