<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="javax.servlet.http.HttpSession" %>
<%
    // Validate session existence standardly in JSP
    String userName = (String) session.getAttribute("user_name");
    String userEmail = (String) session.getAttribute("user_email");
    Integer userId = (Integer) session.getAttribute("user_id");

    if (userName == null) {
        response.sendRedirect("../login.html");
        return;
    }

    // Default fallbacks for health dashboard settings standard attributes
    String userPhone = (String) session.getAttribute("user_phone");
    if (userPhone == null) userPhone = "+1 (123) 456-7890";

    String userAddress = (String) session.getAttribute("user_address");
    if (userAddress == null) userAddress = "505 Green Garden Boulevard, Suite 101";

    String userGoal = (String) session.getAttribute("user_goal");
    if (userGoal == null) userGoal = "Maintain Health";

    String userDiet = (String) session.getAttribute("user_diet");
    if (userDiet == null) userDiet = "Balanced";

    Double userHeight = (Double) session.getAttribute("user_height");
    if (userHeight == null) userHeight = 175.0;

    Double userWeight = (Double) session.getAttribute("user_weight");
    if (userWeight == null) userWeight = 70.0;

    double bmiVal = userWeight / ((userHeight / 100.0) * (userHeight / 100.0));
    String bmiFormatted = String.format("%.1f", bmiVal);
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NutriLife | Admin & User Dashboard</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .logout-panel {
            margin-top: 20px;
            display: flex;
            gap: 15px;
        }

        /* Bento-style dashboard tab systems */
        .dashboard-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 30px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            flex-wrap: wrap;
        }
        .dash-tab {
            background: none;
            border: none;
            font-size: 0.95rem;
            font-weight: 600;
            color: #6b7280;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .dash-tab:hover {
            color: var(--primary-green);
            background: rgba(34, 197, 94, 0.06);
        }
        .dash-tab.active {
            color: white;
            background: var(--primary-green);
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
        }
        .tab-content {
            display: none;
            animation: tabFadeIn 0.35s ease-out;
        }
        .tab-content.active {
            display: block;
        }
        @keyframes tabFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Profile Hub Grid Layout */
        .profile-grid {
            display: grid;
            grid-template-columns: 1.1fr 1.9fr;
            gap: 30px;
        }
        @media (max-width: 900px) {
            .profile-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .profile-side-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
            text-align: center;
            height: fit-content;
        }
        .profile-avatar-circle {
            width: 90px;
            height: 90px;
            background: #f0fdf4;
            color: var(--primary-green);
            font-size: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            box-shadow: 0 6px 15px rgba(34, 197, 94, 0.12);
        }
        .profile-side-card h3 {
            font-size: 1.35rem;
            color: #1f2937;
            font-weight: 750;
            margin-bottom: 4px;
        }
        .profile-side-card p {
            font-size: 0.9rem;
            color: #6b7280;
            margin-bottom: 24px;
        }
        
        /* Stats summary inside profile side card */
        .profile-meta-metric {
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .meta-stat-box {
            background: #f8fafc;
            border-radius: 12px;
            padding: 12px;
            border: 1px solid #f1f5f9;
            text-align: center;
        }
        .meta-stat-box .label {
            font-size: 0.7rem;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
        }
        .meta-stat-box .value {
            font-size: 1.1rem;
            font-weight: 700;
            color: #334155;
        }

        /* Settings Card and form */
        .settings-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
            position: relative;
        }
        .settings-card h3 {
            font-size: 1.25rem;
            color: #1f2937;
            font-weight: 700;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 12px;
        }

        .settings-form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
        }
        @media (max-width: 640px) {
            .settings-form-grid {
                grid-template-columns: 1fr;
            }
        }

        .form-row-full {
            grid-column: span 2;
        }
        @media (max-width: 640px) {
            .form-row-full {
                grid-column: span 1;
            }
        }

        /* Beautiful profile list group items when viewing profile */
        .profile-details-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
            text-align: left;
        }
        .profile-details-item {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 12px 16px;
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #f1f5f9;
            transition: all 0.2s ease;
        }
        .profile-details-item:hover {
            border-color: #cbd5e1;
            background: #f1f5f9;
        }
        .profile-details-item .icon {
            font-size: 1.25rem;
            width: 36px;
            height: 36px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            flex-shrink: 0;
        }
        .profile-details-item .text-group {
            display: flex;
            flex-direction: column;
        }
        .profile-details-item .text-group .label {
            font-size: 0.725rem;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }
        .profile-details-item .text-group .val {
            font-size: 0.95rem;
            color: #334155;
            font-weight: 600;
        }

        /* BMI Calculator block inside profile */
        .bmi-showcase-container {
            border-top: 1px solid #f1f5f9;
            margin-top: 24px;
            padding-top: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            background: #f0fdf4;
            padding: 20px;
            border-radius: 16px;
            border: 1px solid rgba(34, 197, 94, 0.15);
            transition: all 0.3s;
        }
        .bmi-showcase-container.underweight {
            background: #fffbeb;
            border-color: rgba(217, 119, 6, 0.15);
        }
        .bmi-showcase-container.normal {
            background: #f0fdf4;
            border-color: rgba(34, 197, 94, 0.15);
        }
        .bmi-showcase-container.overweight {
            background: #fffbeb;
            border-color: rgba(217, 119, 6, 0.15);
        }
        .bmi-showcase-container.obese {
            background: #fef2f2;
            border-color: rgba(220, 38, 38, 0.15);
        }

        .bmi-score-dial {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: white;
            border: 4px solid var(--primary-green);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(34,197,94,0.12);
            flex-shrink: 0;
            transition: border-color 0.3s;
        }
        .bmi-score-dial .num {
            font-size: 1.35rem;
            font-weight: 800;
            color: #1f2937;
            line-height: 1.1;
        }
        .bmi-score-dial .lbl {
            font-size: 0.65rem;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: 600;
        }
        .bmi-text-content h4 {
            font-size: 1rem;
            font-weight: 700;
            color: #15803d;
            margin-bottom: 4px;
        }
        .bmi-text-content p {
            font-size: 0.825rem;
            color: #166534;
            line-height: 1.4;
            margin: 0;
        }

        /* Beautiful profile edit form components */
        .form-group label {
            font-weight: 600 !important;
            font-size: 0.85rem !important;
            margin-bottom: 6px !important;
            color: #374151 !important;
        }
        .settings-form input, .settings-form select {
            height: 44px;
            border-radius: 10px;
            border: 1px solid #d1d5db;
            font-size: 0.9rem;
            padding: 0 14px;
            transition: all 0.2s;
            width: 100%;
        }
        .settings-form input:focus, .settings-form select:focus {
            outline: none;
            border-color: var(--primary-green);
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
        }

        /* Floating Alert Toast Alert */
        .alert-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            color: white;
            padding: 14px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            z-index: 105;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            transform: translateY(20px);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        }
        .alert-toast.visible {
            transform: translateY(0);
            opacity: 1;
        }
    </style>
</head>
<body class="bg-gradient-to-br">
    <!-- Navbar dynamic JSP layout -->
    <nav class="sticky-nav">
        <div class="nav-container">
            <a href="../index.html" class="logo">
                <span class="logo-leaf">🌱</span> NutriLife
            </a>
            <ul class="nav-links">
                <li><a href="../index.html">Home</a></li>
                <li><a href="../products.html">Store</a></li>
                <li><a href="../bmi.html">BMI Tool</a></li>
                <li><a href="dashboard.jsp" class="active">My Dashboard</a></li>
                <li><a href="/login.html?logout=true" class="nav-btn">Log Out</a></li>
            </ul>
        </div>
    </nav>

    <!-- Floating Global Toast -->
    <div class="alert-toast" id="globalToast">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="color: #22c55e;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span id="toastMessage">Updates saved to database successfully!</span>
    </div>

    <main class="dashboard-wrapper container" style="margin-top: 50px;">
        <section class="dashboard-hero">
            <h1 class="fade-in">Welcome Back, <span class="highlight" id="dashboardHeroName"><%= userName %></span>!</h1>
            <p class="user-id-badge">Registered Profile: <strong id="dashboardHeroEmail"><%= userEmail %></strong> (Account ID: #<%= userId %>)</p>
        </section>

        <!-- Bento-style System level Navigation Tabs -->
        <div class="dashboard-tabs">
            <button class="dash-tab active" data-tab="overview">
                <span>📊</span> Overview & Purchases
            </button>
            <button class="dash-tab" data-tab="profile">
                <span>👤</span> Wellness Hub & Profile
            </button>
            <button class="dash-tab" data-tab="admin">
                <span>🛡️</span> System Admin Access
            </button>
        </div>

        <!-- 1. OVERVIEW & PURCHASES TAB CONTENT -->
        <div class="tab-content active" id="tab-overview">
            <div class="metrics-grid">
                <div class="glass-card metric-card">
                    <h3>🛒 Total Items Purchased</h3>
                    <p class="metric-num">08</p>
                    <span class="metric-desc">Nutritional products ordered directly</span>
                </div>
                <div class="glass-card metric-card">
                    <h3>🔥 Health Streak</h3>
                    <p class="metric-num">12 Days</p>
                    <span class="metric-desc">Consistent activity & balanced eating</span>
                </div>
                <div class="glass-card metric-card animate-pulse">
                    <h3>🏋️ Active BMI</h3>
                    <p class="metric-num" id="overviewBmiVal"><%= bmiFormatted %></p>
                    <span class="metric-desc" id="overviewBmiDesc">Perfect healthy category status</span>
                </div>
            </div>

            <div class="glass-card main-panel" style="margin-top: 30px;">
                <h2>📦 Recent Order History</h2>
                <div class="orders-table-wrapper">
                    <table class="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date Issued</th>
                                <th>Items Ordered</th>
                                <th>Total Bill</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="ordersTableBody">
                            <tr><td colspan="5" style="text-align:center;">Loading orders...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 2. WELLNESS HUB & USER PROFILE TAB CONTENT -->
        <div class="tab-content" id="tab-profile">
            <div class="profile-grid">
                
                <!-- Left Details Box: Information Card -->
                <div class="profile-side-card">
                    <div class="profile-avatar-circle" id="profileAvatarText">
                        <%= userName.substring(0, 1).toUpperCase() %>
                    </div>
                    <h3 id="displayCardName"><%= userName %></h3>
                    <p id="displayCardEmail"><%= userEmail %></p>

                    <div class="profile-details-list">
                        <div class="profile-details-item">
                            <span class="icon">📞</span>
                            <div class="text-group">
                                <span class="label">Phone Number</span>
                                <span class="val" id="displayPhone"><%= userPhone %></span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">📍</span>
                            <div class="text-group">
                                <span class="label">Mailing Address</span>
                                <span class="val" id="displayAddress"><%= userAddress %></span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">🎯</span>
                            <div class="text-group">
                                <span class="label">Nutritional Goal</span>
                                <span class="val" id="displayGoal"><%= userGoal %></span>
                            </div>
                        </div>
                        <div class="profile-details-item">
                            <span class="icon">🥗</span>
                            <div class="text-group">
                                <span class="label">Diet Preference</span>
                                <span class="val" id="displayDiet"><%= userDiet %></span>
                            </div>
                        </div>
                    </div>

                    <!-- Left bottom BMI gauge -->
                    <div class="bmi-showcase-container" id="bmiDisplayBox">
                        <div class="bmi-score-dial" id="bmiDialColor">
                            <span class="num" id="displayBmiScore"><%= bmiFormatted %></span>
                            <span class="lbl">BMI</span>
                        </div>
                        <div class="bmi-text-content">
                            <h4 id="displayBmiStatus">Normal Weight</h4>
                            <p id="displayBmiRecommendation">Great shape! Maintain your physical workout stream and fiber seed foods.</p>
                        </div>
                    </div>
                </div>

                <!-- Right Details Box: View Mode or Settings Editor -->
                <div class="settings-card">
                    <div id="profileViewContainer">
                        <h3>👤 Health &amp; Security Profile</h3>
                        <p style="color: #6b7280; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">
                            Welcome to your health and metrics configuration page. Here you can configure your vital physical details like height and weight to calculate recommendations, track parameters, or update address registries.
                        </p>
                        
                        <div class="settings-form-grid" style="margin-bottom: 30px;">
                            <div class="profile-details-item">
                                <span class="icon">📏</span>
                                <div class="text-group">
                                    <span class="label">Listed Height</span>
                                    <span class="val" id="viewHeightText"><%= userHeight.intValue() %> cm</span>
                                </div>
                            </div>
                            <div class="profile-details-item">
                                <span class="icon">⚖️</span>
                                <div class="text-group">
                                    <span class="label">Listed Weight</span>
                                    <span class="val" id="viewWeightText"><%= userWeight.intValue() %> kg</span>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="btn btn-primary" id="editProfileBtn" style="font-size: 0.9rem; padding: 12px 24px;">✏️ Edit Profile Configuration</button>
                    </div>

                    <div id="profileEditFormContainer" style="display: none;">
                        <h3>✏️ Edit Nutritional Settings</h3>
                        
                        <form id="profileUpdateForm" class="settings-form">
                            <div class="settings-form-grid">
                                
                                <div class="form-group">
                                    <label for="editName">Full Name</label>
                                    <input type="text" id="editName" required value="<%= userName %>">
                                </div>
                                <div class="form-group">
                                    <label for="editPhone">Phone Number</label>
                                    <input type="text" id="editPhone" value="<%= userPhone %>" placeholder="e.g. +1 (123) 456-7890">
                                </div>
                                
                                <div class="form-group form-row-full">
                                    <label for="editAddress">Mailing Address</label>
                                    <input type="text" id="editAddress" value="<%= userAddress %>" placeholder="e.g. Street City, Zip Code">
                                </div>

                                <div class="form-group">
                                    <label for="editGoal">Daily Nutritional Goal</label>
                                    <select id="editGoal">
                                        <option value="Maintain Health" <%= "Maintain Health".equals(userGoal) ? "selected" : "" %>>Maintain Health</option>
                                        <option value="Weight Loss" <%= "Weight Loss".equals(userGoal) ? "selected" : "" %>>Weight Loss</option>
                                        <option value="Muscle Gain" <%= "Muscle Gain".equals(userGoal) ? "selected" : "" %>>Muscle Gain</option>
                                        <option value="Endurance Booster" <%= "Endurance Booster".equals(userGoal) ? "selected" : "" %>>Endurance Booster</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editDiet">Dietary Lifestyle Alignment</label>
                                    <select id="editDiet">
                                        <option value="Balanced" <%= "Balanced".equals(userDiet) ? "selected" : "" %>>Balanced</option>
                                        <option value="Vegetarian" <%= "Vegetarian".equals(userDiet) ? "selected" : "" %>>Vegetarian</option>
                                        <option value="Vegan" <%= "Vegan".equals(userDiet) ? "selected" : "" %>>Vegan</option>
                                        <option value="Keto/Low-Carb" <%= "Keto/Low-Carb".equals(userDiet) ? "selected" : "" %>>Keto / Low Carb</option>
                                        <option value="Gluten-Free" <%= "Gluten-Free".equals(userDiet) ? "selected" : "" %>>Gluten Free</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label for="editHeight">Height (in cm)</label>
                                    <input type="number" id="editHeight" min="50" max="300" required value="<%= userHeight.intValue() %>">
                                </div>
                                <div class="form-group">
                                    <label for="editWeight">Weight (in kg)</label>
                                    <input type="number" id="editWeight" min="20" max="500" required value="<%= userWeight.intValue() %>">
                                </div>

                            </div>

                            <!-- Live calculation feedback inside editing card -->
                            <div style="background: #f8fafc; border: 1px dotted #cbd5e1; padding: 14px 18px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                                <div style="display: flex; flex-direction: column; text-align: left;">
                                    <span style="font-weight: 700; color: #334155; font-size: 0.9rem;">Live BMI Calculator Feed</span>
                                    <span style="font-size: 0.775rem; color: #64748b;">Telemetry calculations adjust in real-time as you type stats.</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span id="formLiveBmiScore" style="font-size: 1.35rem; font-weight: 800; color: var(--primary-green);"><%= bmiFormatted %></span>
                                    <span id="formLiveBmiCategory" class="badge badge-success" style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px;">Normal</span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 12px;">
                                <button type="submit" class="btn btn-primary" style="font-size: 0.9rem; padding: 12px 24px;">💾 Save Profile Settings</button>
                                <button type="button" class="btn btn-secondary" id="cancelEditBtn" style="font-size: 0.9rem; padding: 12px 24px; background: #e2e8f0; color: #475569;">Cancel</button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </div>

        <!-- 3. SYSTEM ADMIN ACCESS TAB CONTENT -->
        <div class="tab-content" id="tab-admin">
            <div class="glass-card side-panel" style="width: 100%; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px;">
                <div class="profile-avatar-circle" style="background: #fef2f2; color: #dc2626; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.1);">🛡️</div>
                <h2>System Administration Portal</h2>
                <p style="margin-top: 15px; font-size: 0.95rem; color: #6b7280; line-height: 1.6;">
                    Authorized administrative access only. Configure direct digital product ranges, adjust pricing matrices, or evaluate SQL schema logs instantly.
                </p>
                <div class="logout-panel" style="justify-content: center; margin-top:30px;">
                    <a href="../products.html?admin=true" class="btn btn-primary" style="font-size: 0.925rem; padding: 12px 28px;">Run Stockroom Admin Controls</a>
                </div>
                <div class="quick-status" style="margin-top: 30px; font-size: 0.825rem; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <span class="status-indicator online" style="margin-right: 6px;"></span> simulated JDBC Driver v8.0 Active (Localhost Port 3306)
                </div>
            </div>
        </div>
    </main>

    <footer style="margin-top: 80px;">
        <div class="footer-container container">
            <p style="text-align:center; width:100%; color:#94a3b8; font-size:0.85rem;">&copy; 2026 NutriLife Health Solutions. Dynamic JDBC &amp; Servlet mapping powered by Node runtime container.</p>
        </div>
    </footer>

    <!-- Interactive JS scripts -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Tab system handling
            const tabs = document.querySelectorAll('.dash-tab');
            const contents = document.querySelectorAll('.tab-content');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));

                    tab.classList.add('active');
                    const target = tab.getAttribute('data-tab');
                    document.getElementById('tab-' + target).classList.add('active');
                });
            });

            // Toggle view / edit states in Profile Tab
            const editProfileBtn = document.getElementById('editProfileBtn');
            const cancelEditBtn = document.getElementById('cancelEditBtn');
            const viewContainer = document.getElementById('profileViewContainer');
            const editFormContainer = document.getElementById('profileEditFormContainer');

            if (editProfileBtn && cancelEditBtn && viewContainer && editFormContainer) {
                editProfileBtn.addEventListener('click', () => {
                    viewContainer.style.display = 'none';
                    editFormContainer.style.display = 'block';
                });

                cancelEditBtn.addEventListener('click', () => {
                    editFormContainer.style.display = 'none';
                    viewContainer.style.display = 'block';
                });
            }

            // Live Telemetry BMI calculator inside Form
            const formHeightInput = document.getElementById('editHeight');
            const formWeightInput = document.getElementById('editWeight');
            const liveBmiScore = document.getElementById('formLiveBmiScore');
            const liveBmiCategory = document.getElementById('formLiveBmiCategory');

            function calculateFormLiveBmi() {
                const height = parseFloat(formHeightInput.value);
                const weight = parseFloat(formWeightInput.value);

                if (height > 50 && weight > 20) {
                    const bmi = weight / ((height / 100) * (height / 100));
                    liveBmiScore.innerText = bmi.toFixed(1);
                    
                    // Categorize live badge
                    if (bmi < 18.5) {
                        liveBmiCategory.innerText = 'Underweight';
                        liveBmiCategory.className = 'badge badge-warning';
                    } else if (bmi < 25.0) {
                        liveBmiCategory.innerText = 'Normal';
                        liveBmiCategory.className = 'badge badge-success';
                    } else if (bmi < 30.0) {
                        liveBmiCategory.innerText = 'Overweight';
                        liveBmiCategory.className = 'badge badge-warning';
                    } else {
                        liveBmiCategory.innerText = 'Obese';
                        liveBmiCategory.className = 'badge badge-danger';
                    }
                } else {
                    liveBmiScore.innerText = '--';
                    liveBmiCategory.innerText = 'Invalid stats';
                    liveBmiCategory.className = 'badge';
                }
            }

            if (formHeightInput && formWeightInput) {
                formHeightInput.addEventListener('input', calculateFormLiveBmi);
                formWeightInput.addEventListener('input', calculateFormLiveBmi);
                calculateFormLiveBmi(); // Run initial compile
            }

            // Real-time categorization of left-side gauge on first page load
            const initialBmiVal = parseFloat("<%= bmiFormatted %>");
            updateBmiGaugeUI(initialBmiVal);

            function updateBmiGaugeUI(bmi) {
                const displayBmiScore = document.getElementById('displayBmiScore');
                const displayBmiStatus = document.getElementById('displayBmiStatus');
                const displayBmiRec = document.getElementById('displayBmiRecommendation');
                const bmiDisplayBox = document.getElementById('bmiDisplayBox');
                const overviewBmiValField = document.getElementById('overviewBmiVal');
                const overviewBmiDescField = document.getElementById('overviewBmiDesc');

                if (!bmi || isNaN(bmi)) return;

                if (displayBmiScore) displayBmiScore.innerText = bmi.toFixed(1);
                if (overviewBmiValField) overviewBmiValField.innerText = bmi.toFixed(1);

                // Set corresponding badge classifications
                if (bmi < 18.5) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Underweight Focus 🟡';
                    if (displayBmiRec) displayBmiRec.innerText = 'Include daily dense fats, complex grains, and mass protein shakes to reach ideal metrics.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container underweight';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Below ideal physical metric ratio';
                } else if (bmi < 25.0) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Normal Healthy Weight 🟢';
                    if (displayBmiRec) displayBmiRec.innerText = 'Great shape! Maintain your physical workout stream and healthy fibers.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container normal';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Perfect healthy category status';
                } else if (bmi < 30.0) {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Overweight Category 🟡';
                    if (displayBmiRec) displayBmiRec.innerText = 'Limit sugars, integrate green catechins matcha tea, and log cardiorespiratory active minutes.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container overweight';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Slightly above recommended ratio limits';
                } else {
                    if (displayBmiStatus) displayBmiStatus.innerText = 'Obesity Category 🔴';
                    if (displayBmiRec) displayBmiRec.innerText = 'Advised metabolic review: consume high-fiber sprouted beans and cut refined caloric grains.';
                    if (bmiDisplayBox) bmiDisplayBox.className = 'bmi-showcase-container obese';
                    if (overviewBmiDescField) overviewBmiDescField.innerText = 'Calorie limits and metabolic check suggested';
                }
            }

            // Express POST form submit profile updating
            const profileUpdateForm = document.getElementById('profileUpdateForm');
            const globalToast = document.getElementById('globalToast');
            const toastMessage = document.getElementById('toastMessage');

            function showToast(msg, isSuccess = true) {
                if (toastMessage && globalToast) {
                    toastMessage.innerText = msg;
                    globalToast.style.borderLeft = isSuccess ? '5px solid #22c55e' : '5px solid #ef4444';
                    globalToast.classList.add('visible');
                    setTimeout(() => {
                        globalToast.classList.remove('visible');
                    }, 4000);
                }
            }

            if (profileUpdateForm) {
                profileUpdateForm.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    const name = document.getElementById('editName').value;
                    const phone = document.getElementById('editPhone').value;
                    const address = document.getElementById('editAddress').value;
                    const goal = document.getElementById('editGoal').value;
                    const diet = document.getElementById('editDiet').value;
                    const height = parseFloat(formHeightInput.value);
                    const weight = parseFloat(formWeightInput.value);

                    try {
                        const response = await fetch('/php/update_profile.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name, phone, address, goal, diet, height, weight })
                        });

                        const data = await response.json();
                        if (data.success) {
                            showToast(data.message || 'Settings persisted permanently!');

                            // Update Left Display cards DOM elements
                            const dName = document.getElementById('displayCardName');
                            const hName = document.getElementById('dashboardHeroName');
                            const dPhone = document.getElementById('displayPhone');
                            const dAddress = document.getElementById('displayAddress');
                            const dGoal = document.getElementById('displayGoal');
                            const dDiet = document.getElementById('displayDiet');
                            const dHeightText = document.getElementById('viewHeightText');
                            const dWeightText = document.getElementById('viewWeightText');
                            const avatar = document.getElementById('profileAvatarText');

                            if (dName) dName.innerText = data.user.name;
                            if (hName) hName.innerText = data.user.name;
                            if (avatar) avatar.innerText = data.user.name.charAt(0).toUpperCase();
                            if (dPhone) dPhone.innerText = data.user.phone || 'Not Configured';
                            if (dAddress) dAddress.innerText = data.user.address || 'Not Configured';
                            if (dGoal) dGoal.innerText = data.user.goal;
                            if (dDiet) dDiet.innerText = data.user.diet;
                            if (dHeightText) dHeightText.innerText = data.user.height + ' cm';
                            if (dWeightText) dWeightText.innerText = data.user.weight + ' kg';

                            // Compute live dynamic BMI on the gauge UI and Overview stats
                            const computedBmi = data.user.weight / ((data.user.height / 100) * (data.user.height / 100));
                            updateBmiGaugeUI(computedBmi);

                            // Synchronize our localStorage 'nutriUser' with new name so greeting changes globally
                            const existingLocalUser = JSON.parse(localStorage.getItem('nutriUser') || '{}');
                            existingLocalUser.name = data.user.name;
                            localStorage.setItem('nutriUser', JSON.stringify(existingLocalUser));

                            // Flip viewport page state back to viewing containers
                            setTimeout(() => {
                                editFormContainer.style.display = 'none';
                                viewContainer.style.display = 'block';
                            }, 500);

                        } else {
                            showToast(data.message || 'Error occurred while saving profile info.', false);
                        }
                    } catch (err) {
                        showToast('Database MySQL exception. Please retry.', false);
                    }
                });
            }
        });

        // Fetch User Orders on Load
        document.addEventListener('DOMContentLoaded', async () => {
            const tableBody = document.getElementById('ordersTableBody');
            if (!tableBody) return;

            try {
                const response = await fetch('/php/orders.php');
                const data = await response.json();

                if (data.success && data.orders) {
                    if (data.orders.length === 0) {
                        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">No recent orders found. Time to stock up on health! 🌱</td></tr>';
                        return;
                    }

                    tableBody.innerHTML = ''; // Clear loading text
                    data.orders.forEach(order => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${order.orderId}</td>
                            <td>${order.date}</td>
                            <td>${order.items.join(', ')}</td>
                            <td><strong>₹${parseFloat(order.total).toFixed(2)}</strong></td>
                            <td><span class="badge badge-success">${order.status || 'Processing'}</span></td>
                        `;
                        tableBody.appendChild(tr);
                    });
                } else {
                    tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to fetch orders. Please try again.</td></tr>';
                }
            } catch (err) {
                console.error(err);
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Connection error fetching orders.</td></tr>';
            }
        });
    </script>
</body>
</html>
