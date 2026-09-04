<?php

session_start();

/*
|--------------------------------------------------------------------------
| ADMIN / OWNER ACCESS PROTECTION
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {
    header("Location: ../Login/Login.html");
    exit();
}

if ($_SESSION["role"] !== "admin") {
    header("Location: ../index.php");
    exit();
}

$ownerName = $_SESSION["full_name"] ?? "Owner";

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Figurify — Owner Dashboard</title>

    <link
        rel="stylesheet"
        href="admin.css"
    >

</head>


<body>


<!-- =====================================================
     ADMIN DASHBOARD
===================================================== -->

<div class="admin-layout">


    <!-- =================================================
         SIDEBAR
    ================================================== -->

    <aside class="sidebar">


        <!-- LOGO -->

        <div class="sidebar-logo">

            <img
                src="../Image/Clay and Stuff- Logo.jpg"
                alt="Clay and Stuff"
            >

        </div>


        <!-- MAIN NAVIGATION -->

        <nav class="sidebar-navigation">


            <!-- DASHBOARD -->

            <a
                href="dashboard.php"
                class="sidebar-item active"
            >

                <span class="sidebar-icon">
                    ▦
                </span>

                <span>
                    Dashboard
                </span>

            </a>


            <!-- BOOKINGS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ▣
                    </span>

                    Bookings

                </div>


                <a href="#" class="sidebar-subitem">
                    All Booking
                </a>

                <a href="#" class="sidebar-subitem">
                    Approved
                </a>

                <a href="#" class="sidebar-subitem">
                    Shipped
                </a>

                <a href="#" class="sidebar-subitem">
                    Done
                </a>

                <a href="#" class="sidebar-subitem">
                    Declined
                </a>

                <a href="#" class="sidebar-subitem">
                    Refunded
                </a>

            </div>


            <!-- QUOTATIONS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ●
                    </span>

                    Quotations

                </div>


                <a href="#" class="sidebar-subitem">
                    For Quotation
                </a>

                <a href="#" class="sidebar-subitem">
                    Quoted
                </a>

            </div>


            <!-- PENDING -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ⏱
                    </span>

                    Pending

                </div>


                <a href="#" class="sidebar-subitem">
                    For Approval
                </a>

                <a href="#" class="sidebar-subitem">
                    For Verify
                </a>

                <a href="#" class="sidebar-subitem">
                    Refund
                </a>

            </div>


            <!-- ON PROCESS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ◔
                    </span>

                    On Process

                </div>


                <a href="#" class="sidebar-subitem">
                    On Process
                </a>

                <a href="#" class="sidebar-subitem">
                    For Revision
                </a>

                <a href="#" class="sidebar-subitem">
                    Updated Orders
                </a>

                <a href="#" class="sidebar-subitem">
                    To Ship
                </a>

            </div>


            <!-- USER MANAGEMENT -->

            <a
                href="#"
                class="sidebar-main-link"
            >

                <span class="sidebar-icon">
                    ♙
                </span>

                User Management

            </a>


            <!-- WEBSITE CONTENT -->

            <a
                href="#"
                class="sidebar-main-link"
            >

                <span class="sidebar-icon">
                    ◈
                </span>

                Website Content Management

            </a>


        </nav>


        <!-- LOGOUT -->

        <div class="sidebar-bottom">

            <a
                href="../logout.php"
                class="logout-link"
            >

                <span>
                    ↪
                </span>

                Log out

            </a>

        </div>


    </aside>



    <!-- =================================================
         MAIN CONTENT
    ================================================== -->

    <main class="dashboard-content">


        <!-- TOP HEADER -->

        <header class="dashboard-header">

            <div>

                <span class="dashboard-label">
                    DASHBOARD
                </span>

                <h1>
                    Welcome,
                    <?php echo htmlspecialchars($ownerName); ?>
                </h1>

                <p id="currentDateTime">
                    Loading date...
                </p>

            </div>

        </header>



        <!-- =================================================
             STATISTICS
        ================================================== -->

        <section class="stats-grid">


            <!-- ALL BOOKINGS -->

            <div class="stat-card purple">

                <div>

                    <span class="stat-title">
                        All Bookings
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    ▦
                </span>

            </div>


            <!-- NEW BOOKINGS -->

            <div class="stat-card blue">

                <div>

                    <span class="stat-title">
                        New Bookings
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    +
                </span>

            </div>


            <!-- FOR APPROVAL -->

            <div class="stat-card pink">

                <div>

                    <span class="stat-title">
                        For Approval
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    ✓
                </span>

            </div>


        </section>



        <!-- =================================================
             DASHBOARD LOWER AREA
        ================================================== -->

        <section class="dashboard-grid">


            <!-- =============================================
                 CALENDAR
            ============================================== -->

            <div class="dashboard-card calendar-card">


                <div class="card-header">

                    <button
                        type="button"
                        id="previousMonth"
                    >
                        ‹
                    </button>


                    <h2 id="calendarMonth">
                        May 2026
                    </h2>


                    <button
                        type="button"
                        id="nextMonth"
                    >
                        ›
                    </button>

                </div>


                <div class="calendar-weekdays">

                    <span>SUN</span>
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>

                </div>


                <div
                    class="calendar-days"
                    id="calendarDays"
                ></div>


                <div class="calendar-legend">

                    <span>
                        <i class="legend booking"></i>
                        Booking
                    </span>

                    <span>
                        <i class="legend rush"></i>
                        Rush
                    </span>

                    <span>
                        <i class="legend reserved"></i>
                        Reserved
                    </span>

                </div>


            </div>



            <!-- =============================================
                 QUOTATIONS
            ============================================== -->

            <div class="dashboard-card quotation-card">


                <div class="quotation-header">

                    <h2>
                        For Quotation
                    </h2>

                    <a href="#">
                        View All
                    </a>

                </div>


                <!-- QUOTATION ITEM -->

                <div class="quotation-item">

                    <div class="quotation-number">

                        <strong>
                            For Quotation No. 34
                        </strong>

                        <span>
                            Style: Hirono
                        </span>

                        <span>
                            Product Type:
                            3.5 inches Full Body Standee
                        </span>

                    </div>

                    <button
                        type="button"
                        class="quotation-button"
                    >
                        →
                    </button>

                </div>


                <!-- QUOTATION ITEM -->

                <div class="quotation-item">

                    <div class="quotation-number">

                        <strong>
                            For Quotation No. 31
                        </strong>

                        <span>
                            Style: Chibi
                        </span>

                        <span>
                            Product Type:
                            3 inches Full Body Standee
                        </span>

                    </div>

                    <button
                        type="button"
                        class="quotation-button"
                    >
                        →
                    </button>

                </div>


                <!-- EMPTY STATE -->

                <div
                    class="quotation-empty"
                    id="quotationEmpty"
                >

                    No more quotations.

                </div<?php

session_start();

/*
|--------------------------------------------------------------------------
| ADMIN / OWNER ACCESS PROTECTION
|--------------------------------------------------------------------------
*/

if (!isset($_SESSION["user_id"])) {
    header("Location: ../Login/Login.html");
    exit();
}

if ($_SESSION["role"] !== "admin") {
    header("Location: ../index.php");
    exit();
}

$ownerName = $_SESSION["full_name"] ?? "Owner";

?>

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Figurify — Owner Dashboard</title>

    <link
        rel="stylesheet"
        href="admin.css"
    >

</head>


<body>


<!-- =====================================================
     ADMIN DASHBOARD
===================================================== -->

<div class="admin-layout">


    <!-- =================================================
         SIDEBAR
    ================================================== -->

    <aside class="sidebar">


        <!-- LOGO -->

        <div class="sidebar-logo">

            <img
                src="../Image/Clay and Stuff- Logo.jpg"
                alt="Clay and Stuff"
            >

        </div>


        <!-- MAIN NAVIGATION -->

        <nav class="sidebar-navigation">


            <!-- DASHBOARD -->

            <a
                href="dashboard.php"
                class="sidebar-item active"
            >

                <span class="sidebar-icon">
                    ▦
                </span>

                <span>
                    Dashboard
                </span>

            </a>


            <!-- BOOKINGS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ▣
                    </span>

                    Bookings

                </div>


                <a href="#" class="sidebar-subitem">
                    All Booking
                </a>

                <a href="#" class="sidebar-subitem">
                    Approved
                </a>

                <a href="#" class="sidebar-subitem">
                    Shipped
                </a>

                <a href="#" class="sidebar-subitem">
                    Done
                </a>

                <a href="#" class="sidebar-subitem">
                    Declined
                </a>

                <a href="#" class="sidebar-subitem">
                    Refunded
                </a>

            </div>


            <!-- QUOTATIONS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ●
                    </span>

                    Quotations

                </div>


                <a href="#" class="sidebar-subitem">
                    For Quotation
                </a>

                <a href="#" class="sidebar-subitem">
                    Quoted
                </a>

            </div>


            <!-- PENDING -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ⏱
                    </span>

                    Pending

                </div>


                <a href="#" class="sidebar-subitem">
                    For Approval
                </a>

                <a href="#" class="sidebar-subitem">
                    For Verify
                </a>

                <a href="#" class="sidebar-subitem">
                    Refund
                </a>

            </div>


            <!-- ON PROCESS -->

            <div class="sidebar-group">

                <div class="sidebar-heading">

                    <span class="sidebar-icon">
                        ◔
                    </span>

                    On Process

                </div>


                <a href="#" class="sidebar-subitem">
                    On Process
                </a>

                <a href="#" class="sidebar-subitem">
                    For Revision
                </a>

                <a href="#" class="sidebar-subitem">
                    Updated Orders
                </a>

                <a href="#" class="sidebar-subitem">
                    To Ship
                </a>

            </div>


            <!-- USER MANAGEMENT -->

            <a
                href="#"
                class="sidebar-main-link"
            >

                <span class="sidebar-icon">
                    ♙
                </span>

                User Management

            </a>


            <!-- WEBSITE CONTENT -->

            <a
                href="#"
                class="sidebar-main-link"
            >

                <span class="sidebar-icon">
                    ◈
                </span>

                Website Content Management

            </a>


        </nav>


        <!-- LOGOUT -->

        <div class="sidebar-bottom">

            <a
                href="../logout.php"
                class="logout-link"
            >

                <span>
                    ↪
                </span>

                Log out

            </a>

        </div>


    </aside>



    <!-- =================================================
         MAIN CONTENT
    ================================================== -->

    <main class="dashboard-content">


        <!-- TOP HEADER -->

        <header class="dashboard-header">

            <div>

                <span class="dashboard-label">
                    DASHBOARD
                </span>

                <h1>
                    Welcome,
                    <?php echo htmlspecialchars($ownerName); ?>
                </h1>

                <p id="currentDateTime">
                    Loading date...
                </p>

            </div>

        </header>



        <!-- =================================================
             STATISTICS
        ================================================== -->

        <section class="stats-grid">


            <!-- ALL BOOKINGS -->

            <div class="stat-card purple">

                <div>

                    <span class="stat-title">
                        All Bookings
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    ▦
                </span>

            </div>


            <!-- NEW BOOKINGS -->

            <div class="stat-card blue">

                <div>

                    <span class="stat-title">
                        New Bookings
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    +
                </span>

            </div>


            <!-- FOR APPROVAL -->

            <div class="stat-card pink">

                <div>

                    <span class="stat-title">
                        For Approval
                    </span>

                    <strong>
                        0
                    </strong>

                </div>

                <span class="stat-icon">
                    ✓
                </span>

            </div>


        </section>



        <!-- =================================================
             DASHBOARD LOWER AREA
        ================================================== -->

        <section class="dashboard-grid">


            <!-- =============================================
                 CALENDAR
            ============================================== -->

            <div class="dashboard-card calendar-card">


                <div class="card-header">

                    <button
                        type="button"
                        id="previousMonth"
                    >
                        ‹
                    </button>


                    <h2 id="calendarMonth">
                        May 2026
                    </h2>


                    <button
                        type="button"
                        id="nextMonth"
                    >
                        ›
                    </button>

                </div>


                <div class="calendar-weekdays">

                    <span>SUN</span>
                    <span>MON</span>
                    <span>TUE</span>
                    <span>WED</span>
                    <span>THU</span>
                    <span>FRI</span>
                    <span>SAT</span>

                </div>


                <div
                    class="calendar-days"
                    id="calendarDays"
                ></div>


                <div class="calendar-legend">

                    <span>
                        <i class="legend booking"></i>
                        Booking
                    </span>

                    <span>
                        <i class="legend rush"></i>
                        Rush
                    </span>

                    <span>
                        <i class="legend reserved"></i>
                        Reserved
                    </span>

                </div>


            </div>



            <!-- =============================================
                 QUOTATIONS
            ============================================== -->

            <div class="dashboard-card quotation-card">


                <div class="quotation-header">

                    <h2>
                        For Quotation
                    </h2>

                    <a href="#">
                        View All
                    </a>

                </div>


                <!-- QUOTATION ITEM -->

                <div class="quotation-item">

                    <div class="quotation-number">

                        <strong>
                            For Quotation No. 34
                        </strong>

                        <span>
                            Style: Hirono
                        </span>

                        <span>
                            Product Type:
                            3.5 inches Full Body Standee
                        </span>

                    </div>

                    <button
                        type="button"
                        class="quotation-button"
                    >
                        →
                    </button>

                </div>


                <!-- QUOTATION ITEM -->

                <div class="quotation-item">

                    <div class="quotation-number">

                        <strong>
                            For Quotation No. 31
                        </strong>

                        <span>
                            Style: Chibi
                        </span>

                        <span>
                            Product Type:
                            3 inches Full Body Standee
                        </span>

                    </div>

                    <button
                        type="button"
                        class="quotation-button"
                    >
                        →
                    </button>

                </div>


                <!-- EMPTY STATE -->

                <div
                    class="quotation-empty"
                    id="quotationEmpty"
                >

                    No more quotations.

                </div>


            </div>


        </section>


    </main>

</div>


<script src="admin.js"></script>

</body>

</html>>


            </div>


        </section>


    </main>

</div>


<script src="admin.js"></script>

</body>

</html>