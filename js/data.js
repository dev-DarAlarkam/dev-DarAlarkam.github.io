const today = new Date();
const year = today.getFullYear();

// displaying the year on the home page
const displayElement = document.getElementById('year-display');
if (displayElement) {
    displayElement.textContent = year;
}

console.log(year)
// Format date into Islamic (Hijri) calendar
const hijriDate = new Intl.DateTimeFormat('en-SA-u-ca-islamic-umalqura', {
  year: 'numeric'
}).format(today);
const formattedHijriYear = hijriDate.split(' ')[0]


const currentYear = {
    "georgian" : year.toString(),
    "hijri" : formattedHijriYear
};