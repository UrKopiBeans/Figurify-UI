/* =====================================================
   CURRENT DATE AND TIME
===================================================== */

function updateDateTime() {

    const dateElement =
        document.getElementById("currentDateTime");

    if (!dateElement) {
        return;
    }

    const now = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    const date = now.toLocaleDateString(
        "en-US",
        options
    );

    const time = now.toLocaleTimeString(
        "en-US"
    );

    dateElement.textContent =
        date + " | " + time;
}


updateDateTime();

setInterval(
    updateDateTime,
    1000
);


/* =====================================================
   CALENDAR
===================================================== */

const calendarDays =
    document.getElementById("calendarDays");

const calendarMonth =
    document.getElementById("calendarMonth");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");


let currentCalendarDate =
    new Date();


/*
|--------------------------------------------------------------------------
| Example reserved dates
|--------------------------------------------------------------------------
|
| Later these can come from MySQL.
|
*/

const reservedDates = [
    "2026-05-07",
    "2026-05-16"
];


const rushDates = [
    "2026-05-07"
];


const bookingDates = [
    "2026-05-16"
];


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(year, month, day) {

    const monthNumber =
        String(month + 1).padStart(2, "0");

    const dayNumber =
        String(day).padStart(2, "0");

    return `${year}-${monthNumber}-${dayNumber}`;
}


/* =====================================================
   RENDER CALENDAR
===================================================== */

function renderCalendar() {

    if (!calendarDays || !calendarMonth) {
        return;
    }

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendarMonth.textContent =
        monthName;


    calendarDays.innerHTML = "";


    /*
    |--------------------------------------------------------------------------
    | First day of month
    |--------------------------------------------------------------------------
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
    |--------------------------------------------------------------------------
    | Number of days
    |--------------------------------------------------------------------------
    */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
    |--------------------------------------------------------------------------
    | Empty spaces
    |--------------------------------------------------------------------------
    */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(
            emptyDay
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Days
    |--------------------------------------------------------------------------
    */

    const today =
        new Date();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");


        dayElement.classList.add(
            "calendar-day"
        );


        dayElement.textContent =
            day;


        const dateString =
            formatDate(
                year,
                month,
                day
            );


        /*
        |--------------------------------------------------------------------------
        | Sunday
        |--------------------------------------------------------------------------
        */

        const dayOfWeek =
            new Date(
                year,
                month,
                day
            ).getDay();


        if (dayOfWeek === 0) {

            dayElement.classList.add(
                "sunday"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Today
        |--------------------------------------------------------------------------
        */

        if (
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day
        ) {

            dayElement.classList.add(
                "today"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Reserved
        |--------------------------------------------------------------------------
        */

        if (
            reservedDates.includes(
                dateString
            )
        ) {

            dayElement.classList.add(
                "reserved"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Rush
        |--------------------------------------------------------------------------
        */

        if (
            rushDates.includes(
                dateString
            )
        ) {

            dayElement.classList.add(
                "rush"
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Booking
        |--------------------------------------------------------------------------
        */

        if (
            bookingDates.includes(
                dateString
            )
        ) {

            dayElement.classList.add(
                "booking"
            );

        }


        calendarDays.appendChild(
            dayElement
        );

    }

}


/* =====================================================
   PREVIOUS MONTH
===================================================== */

previousMonth.addEventListener(
    "click",
    function () {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() - 1
        );

        renderCalendar();

    }
);


/* =====================================================
   NEXT MONTH
===================================================== */

nextMonth.addEventListener(
    "click",
    function () {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() + 1
        );

        renderCalendar();

    }
);


/* =====================================================
   START
===================================================== */

renderCalendar();