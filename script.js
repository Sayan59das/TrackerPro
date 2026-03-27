/* ==========================================
   1. UTILITIES & DOM MAPPING (Skeleton)
   ========================================== */

/* Ye ek chota helper function hai. Baar-baar 'document.getElementById' 
  likhne ki jagah hum sirf 'getDOMElement(id)' likh sakte hain.
*/
const getDOMElement = (elementId) => {
    return document.getElementById(elementId);
};

/* Saare HTML elements ko ek single 'uiElements' object me group kiya hai.
  Isse global space clean rehti hai aur pata rehta hai ki hum UI se baat kar rahe hain.
*/
const uiElements = {
    marketingSiteWrapper: getDOMElement('marketingSiteWrapper'),
    dashboardWrapper: getDOMElement('appDashboardWrapper'),
    
    displayMasterBalance: getDOMElement('displayMasterBalance'),
    displayTotalIncome: getDOMElement('displayTotalIncome'),
    displayTotalExpense: getDOMElement('displayTotalExpense'),
    displayRemainingBudget: getDOMElement('displayRemainingBudget'),
    
    transactionLedgerList: getDOMElement('transactionLedgerList'),
    financialEntryForm: getDOMElement('financialEntryForm'),
    
    inputTransactionDesc: getDOMElement('inputTransactionDesc'),
    inputTransactionAmt: getDOMElement('inputTransactionAmt'),
    inputBaseSalary: getDOMElement('inputBaseSalary'),
    inputMonthlyBudget: getDOMElement('inputMonthlyBudget'),
    searchTransactions: getDOMElement('searchTransactions'),
    
    expenseVisualBar: getDOMElement('expenseVisualBar'),
    expenseRatioText: getDOMElement('expenseRatioText'),
    
    greetingMessage: getDOMElement('greetingMessage'),
    currentDateDisplay: getDOMElement('currentDateDisplay'),
    userProfileName: getDOMElement('userProfileName'),
    userAvatarText: getDOMElement('userAvatarText')
};

/* Ye browser ka native API hai jo normal numbers ko Indian Rupees (₹) 
  format me convert karta hai (e.g., 150000 -> ₹1,50,000.00).
*/
const formatIndianRupee = (rawAmount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(rawAmount);
};


/* ==========================================
   2. STATE MANAGEMENT & LOCAL STORAGE (Memory)
   ========================================== */

/* Page load hote hi browser memory (localStorage) check karte hain. 
  Agar data hai toh usko JSON.parse se array me badal lo, warna empty array [] use karo.
*/
let globalTransactionHistoryArray = JSON.parse(localStorage.getItem('trackerPro_txns')) || [];
let savedUserName = localStorage.getItem('trackerPro_userName') || 'Ghost';

// Sidebar inputs aur profile name me saved values daal do
uiElements.inputBaseSalary.value = localStorage.getItem('trackerPro_salary') || '';
uiElements.inputMonthlyBudget.value = localStorage.getItem('trackerPro_budget') || '';
uiElements.userProfileName.value = savedUserName;

// Avatar text ke liye user ke naam ka pehla letter (charAt(0)) capital karke set kar rahe hain
uiElements.userAvatarText.innerText = savedUserName.charAt(0).toUpperCase();

/* Jab bhi koi naya transaction ya naam change ho, ye function saara data 
  wapas browser ki memory me save kar deta hai taaki refresh karne par data ude nahi.
*/
const saveApplicationStateToLocalStorage = () => {
    localStorage.setItem('trackerPro_txns', JSON.stringify(globalTransactionHistoryArray));
    localStorage.setItem('trackerPro_salary', uiElements.inputBaseSalary.value);
    localStorage.setItem('trackerPro_budget', uiElements.inputMonthlyBudget.value);
};


/* ==========================================
   3. PROFILE EDITING & DYNAMIC GREETING
   ========================================== */

const updateDynamicGreetingAndDate = () => {
    // Current time check karke dynamic greeting set kar rahe hain
    const currentHour = new Date().getHours();
    let dynamicGreeting = "Good Evening";
    
    if (currentHour < 12) {
        dynamicGreeting = "Good Morning";
    } else if (currentHour < 17) {
        dynamicGreeting = "Good Afternoon";
    }
    
    uiElements.greetingMessage.innerText = `${dynamicGreeting}, ${savedUserName}`;
    
    // Date ko clean readable format me dikha rahe hain
    uiElements.currentDateDisplay.innerText = new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

/* Jab user apna naam type karta hai, ye function live update karta hai */
uiElements.userProfileName.addEventListener('input', (event) => {
    const typedName = event.target.value.trim() || 'User';
    savedUserName = typedName; // Global variable update kiya
    
    uiElements.userAvatarText.innerText = typedName.charAt(0).toUpperCase(); // Avatar update kiya
    localStorage.setItem('trackerPro_userName', typedName); // Memory me save kiya
    updateDynamicGreetingAndDate(); // Header update kiya
});

/* Enter key dabane par input se focus hata do (blur kar do) */
uiElements.userProfileName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        uiElements.userProfileName.blur(); 
    }
});


/* ==========================================
   4. SPA ROUTING (View Controller)
   ========================================== */

/* Ye function classes ko toggle karke Landing Page aur Dashboard ke 
  beech me smooth transition handle karta hai bina page refresh kiye.
*/
const toggleApplicationView = (isOpeningDashboard) => {
    uiElements.marketingSiteWrapper.classList.toggle('hiddenView', isOpeningDashboard);
    uiElements.dashboardWrapper.classList.toggle('hiddenView', !isOpeningDashboard);
    
    if (isOpeningDashboard) {
        updateDynamicGreetingAndDate();
    }
};


/* ==========================================
   5. CORE FINANCIAL MATH & DOM UPDATES (The Engine)
   ========================================== */

const calculateAndUpdateFinancialMetrics = () => {
    const targetBudget = parseFloat(uiElements.inputMonthlyBudget.value) || 0;
    
    /* Array filter aur reduce methods ka use karke maths kar rahe hain.
      Sirf positive amounts ko filter karke unka total income nikal rahe hain.
    */
    const totalIncomeCalculated = globalTransactionHistoryArray
        .filter(transactionItem => transactionItem.transactionAmount > 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue.transactionAmount, 0);
        
    /* Sirf negative amounts ko filter karke unka total expense nikal rahe hain. */
    const totalExpenseCalculated = globalTransactionHistoryArray
        .filter(transactionItem => transactionItem.transactionAmount < 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue.transactionAmount, 0);
        
    const masterBalanceCalculated = totalIncomeCalculated + totalExpenseCalculated; 

    // Calculated amounts ko currency format me badal kar HTML me inject karna
    uiElements.displayTotalIncome.innerText = `+${formatIndianRupee(totalIncomeCalculated).replace('₹', '₹ ')}`;
    uiElements.displayTotalExpense.innerText = `-${formatIndianRupee(Math.abs(totalExpenseCalculated)).replace('₹', '₹ ')}`;
    uiElements.displayMasterBalance.innerText = formatIndianRupee(masterBalanceCalculated).replace('₹', '₹ ');
    
    // Remaining Budget Math
    const remainingBudgetCalculated = targetBudget - Math.abs(totalExpenseCalculated);
    uiElements.displayRemainingBudget.innerText = formatIndianRupee(remainingBudgetCalculated).replace('₹', '₹ ');
    
    // Agar budget minus me gaya toh text red kar do
    if (remainingBudgetCalculated < 0) {
        uiElements.displayRemainingBudget.style.color = 'var(--color-expense)';
    } else {
        uiElements.displayRemainingBudget.style.color = 'var(--color-text-primary)';
    }

    // Visual Analytics Bar Fill Logic
    if (totalIncomeCalculated > 0) {
        let expenseRatioPercentage = Math.min((Math.abs(totalExpenseCalculated) / totalIncomeCalculated) * 100, 100);
        
        uiElements.expenseVisualBar.style.width = `${expenseRatioPercentage}%`;
        uiElements.expenseRatioText.innerText = `${expenseRatioPercentage.toFixed(1)}% of Income Spent`;
        
        // Agar 80% se zyada spend kar diya toh bar ko red kar do alert karne ke liye
        if (expenseRatioPercentage > 80) {
            uiElements.expenseVisualBar.style.background = 'var(--color-expense)';
        } else {
            uiElements.expenseVisualBar.style.background = '#F59E0B'; // Orange/Yellow
        }
    } else {
        uiElements.expenseVisualBar.style.width = `0%`;
        uiElements.expenseRatioText.innerText = `0%`;
    }
};

const getCategoryEmojiIcon = (categoryString) => {
    // Ye dictionary map karti hai text category ko ek visual emoji icon se
    const categoryIconsMap = { 
        'Food': '🍔', 'Transport': '🚗', 'Utilities': '⚡', 
        'Shopping': '🛍️', 'Salary': '💰', 'Freelance': '💻', 
        'Investments': '📈', 'Refund': '🔄', 'Other': '📌' 
    };
    return categoryIconsMap[categoryString] || '📌';
};

const renderTransactionLedgerToDOM = (searchFilterText = '') => {
    // Naya data draw karne se pehle purana list clear karna zaroori hai
    uiElements.transactionLedgerList.innerHTML = ''; 
    
    // Agar search bar me kuch likha hai toh array ko filter karo
    const filteredTransactionsArray = globalTransactionHistoryArray.filter(transactionItem => 
        transactionItem.transactionDescription.toLowerCase().includes(searchFilterText.toLowerCase()) || 
        transactionItem.transactionCategory.toLowerCase().includes(searchFilterText.toLowerCase())
    );

    // .sort() newest transactions ko pehle dikhata hai
    filteredTransactionsArray.sort((a, b) => b.transactionId - a.transactionId).forEach(transactionItem => {
        
        const listItemElement = document.createElement('li');
        
        // Agar amount > 0 hai toh green class do, warna red class
        if (transactionItem.transactionAmount > 0) {
            listItemElement.className = `ledgerItem incomeItem`;
        } else {
            listItemElement.className = `ledgerItem expenseItem`;
        }
        
        const formattedTime = new Date(transactionItem.transactionId).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const signString = transactionItem.transactionAmount > 0 ? '+' : '-';
        const absoluteAmountFormatted = formatIndianRupee(Math.abs(transactionItem.transactionAmount));
        
        // HTML structure build karke list me inject kar rahe hain
        listItemElement.innerHTML = `
            <div class="catIcon">${getCategoryEmojiIcon(transactionItem.transactionCategory)}</div>
            <div class="ledgerItemDetails">
                <span class="ledgerItemDesc">${transactionItem.transactionDescription}</span>
                <span class="ledgerItemDate">${transactionItem.transactionCategory} • ${formattedTime}</span>
            </div>
            <span class="ledgerItemValue">${signString}${absoluteAmountFormatted}</span>
            <button class="deleteBtn" onclick="deleteTransactionEntryById(${transactionItem.transactionId})">🗑️</button>
        `;
        
        uiElements.transactionLedgerList.appendChild(listItemElement);
    });
};

/* Ye function global window object par hai taaki HTML ka 'onclick' event isko dhoond sake */
window.deleteTransactionEntryById = (idToDelete) => {
    // Us ID ko array se hata do
    globalTransactionHistoryArray = globalTransactionHistoryArray.filter(transactionItem => transactionItem.transactionId !== idToDelete);
    
    saveApplicationStateToLocalStorage();
    calculateAndUpdateFinancialMetrics();
    renderTransactionLedgerToDOM(uiElements.searchTransactions.value);
};


/* ==========================================
   6. EVENT LISTENERS & FEATURES (Interactivity)
   ========================================== */

getDOMElement('buttonLaunchDashboard').addEventListener('click', () => { toggleApplicationView(true); });
getDOMElement('navLaunchDashboard').addEventListener('click', () => { toggleApplicationView(true); });
getDOMElement('buttonCloseDashboard').addEventListener('click', () => { toggleApplicationView(false); });

// Settings inputs change hone par instantly save aur calculate karna
uiElements.inputBaseSalary.addEventListener('input', () => { saveApplicationStateToLocalStorage(); });
uiElements.inputMonthlyBudget.addEventListener('input', () => { 
    calculateAndUpdateFinancialMetrics(); 
    saveApplicationStateToLocalStorage(); 
});

// Search bar me type karte hi live filtering
uiElements.searchTransactions.addEventListener('input', (event) => { 
    renderTransactionLedgerToDOM(event.target.value); 
});

// Quick Add Salary Button Logic
getDOMElement('btnQuickSalary').addEventListener('click', () => {
    const salaryAmountNumber = parseFloat(uiElements.inputBaseSalary.value);
    
    if (!salaryAmountNumber || isNaN(salaryAmountNumber)) {
        return alert("Please enter a Base Salary in the sidebar first.");
    }
    
    // Direct array me salary transaction push kar rahe hain
    globalTransactionHistoryArray.push({ 
        transactionId: Date.now(), 
        transactionDescription: 'Monthly Salary', 
        transactionAmount: salaryAmountNumber, 
        transactionCategory: 'Salary' 
    });
    
    saveApplicationStateToLocalStorage(); 
    calculateAndUpdateFinancialMetrics(); 
    renderTransactionLedgerToDOM();
});

// Danger Zone: Wipe All Data Logic
getDOMElement('btnClearData').addEventListener('click', () => {
    const userConfirmed = confirm("Wipe all data? This cannot be undone.");
    if (!userConfirmed) return; // Agar user cancel kare toh wapas laut jao
    
    localStorage.removeItem('trackerPro_txns');
    localStorage.removeItem('trackerPro_salary');
    localStorage.removeItem('trackerPro_budget');
    
    globalTransactionHistoryArray = []; 
    uiElements.inputBaseSalary.value = ''; 
    uiElements.inputMonthlyBudget.value = ''; 
    uiElements.searchTransactions.value = '';
    
    calculateAndUpdateFinancialMetrics(); 
    renderTransactionLedgerToDOM();
});

// Main Form Submission Logic
uiElements.financialEntryForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Page reload rokne ke liye
    
    const inputDescriptionText = uiElements.inputTransactionDesc.value.trim();
    // Math.abs se ensure karte hain ki user negative number type na kar paye
    const rawInputAmount = Math.abs(parseFloat(uiElements.inputTransactionAmt.value.trim()));
    
    // CSS Radio Button se pata lagate hain ki Expense selected hai ya Income
    const selectedTransactionType = document.querySelector('input[name="transactionType"]:checked').value;
    
    // Agar Expense hai toh Expense wala dropdown read karo, warna Income wala dropdown
    let selectedCategory = '';
    if (selectedTransactionType === 'expense') {
        selectedCategory = getDOMElement('inputCategoryExpense').value;
    } else {
        selectedCategory = getDOMElement('inputCategoryIncome').value;
    }

    // Validation: Check agar kuch khali chhut gaya ho
    if (!inputDescriptionText || isNaN(rawInputAmount)) {
        return alert("Please provide a valid description and amount.");
    }

    // Agar Expense hai toh amount ko negative kar do, warna positive rehne do
    let calculatedFinalAmount = 0;
    if (selectedTransactionType === 'expense') {
        calculatedFinalAmount = -rawInputAmount;
    } else {
        calculatedFinalAmount = rawInputAmount;
    }

    // Naya object banakar history array me daal do
    globalTransactionHistoryArray.push({ 
        transactionId: Date.now(), // Unique ID time ke basis par
        transactionDescription: inputDescriptionText, 
        transactionAmount: calculatedFinalAmount, 
        transactionCategory: selectedCategory 
    });

    saveApplicationStateToLocalStorage();
    calculateAndUpdateFinancialMetrics();
    renderTransactionLedgerToDOM(uiElements.searchTransactions.value); 

    // Entry ke baad form saaf karke description field par wapas focus set karna
    uiElements.financialEntryForm.reset();
    uiElements.inputTransactionDesc.focus();
});


/* ==========================================
   7. BOOTSTRAP (Start Engine on Page Load)
   ========================================== */
   
calculateAndUpdateFinancialMetrics();
renderTransactionLedgerToDOM();


/* ==========================================
   8. MOBILE SIDEBAR TOGGLE
   ========================================== */

const sidebarOverlay = getDOMElement('sidebarOverlay');
const dashSidebar = getDOMElement('dashSidebar');

const openSidebar = () => {
    dashSidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
};

const closeSidebar = () => {
    dashSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
};

getDOMElement('mobileSidebarToggle').addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
getDOMElement('buttonCloseDashboard').addEventListener('click', closeSidebar);

/* ==========================================
   9. MOBILE NAV MENU TOGGLE
   ========================================== */

const mobileNavToggle = getDOMElement('mobileNavToggle');
const navLinks = document.querySelector('.navLinks');

mobileNavToggle.addEventListener('click', () => {
    navLinks.classList.toggle('navOpen');
});

navLinks.querySelectorAll('.navItem').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('navOpen');
    });
});

/* ==========================================
   10. DARK / LIGHT MODE TOGGLE
   ========================================== */

const savedTheme = localStorage.getItem('trackerPro_theme') || 'light';

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    const icon = isDark ? '☀️' : '🌙';
    const label = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';

    const navBtn = getDOMElement('themeToggleNav');
    const dashBtn = getDOMElement('themeToggleDash');
    const sidebarBtn = getDOMElement('themeToggleSidebar');

    if (navBtn) navBtn.textContent = icon;
    if (dashBtn) dashBtn.textContent = icon;
    if (sidebarBtn) sidebarBtn.textContent = label;

    localStorage.setItem('trackerPro_theme', theme);
};

const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
};

applyTheme(savedTheme);

['themeToggleNav', 'themeToggleDash', 'themeToggleSidebar'].forEach(id => {
    const btn = getDOMElement(id);
    if (btn) btn.addEventListener('click', toggleTheme);
});
