
class BudgetController {
    
    constructor(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    addItem(type, desc, val) { // Register a new expense or income object as well as
        
        let newItem, ID; // Generate a new ID from whatever we input
        
        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0;
        }
        
        // Create a new item based on inc or exp
        
        if (type === 'expense') {
            newItem = new Expense(ID, desc, val);
        } else if (type === 'income') {
            newItem = new Income(ID, desc, val);
        }
        
        // Push it into our data structure
        
        data.allItems[type].push(newItem);
        
        // Return the new element
        
        return newItem;
        
    }
    
    calculateBudget() {
        
        // Calculate total income and expenses
        
        calculateTotal('expense');
        calculateTotal('income');
        
        // Calculate total budget: income - expenses
        
        data.budget = data.totals.income - data.totals.expense;
        
        // Calculate the percentage of income we spent
        
        if (data.totals.income > 0) {
            data.percentage = Math.round(data.totals.expense / data.totals.income * 100);
        }
        
    }
    
    getBudget() {
        return {
            budget: data.budget,
            totalIncome: data.totals.income,
            totalExpenses: data.totals.expense,
            percentage: data.percentage
        };
    }
    
    calculatePercentages() {
        
        data.allItems.expense.forEach(el => el.calcPercentage(data.totals.income));
        
    }
    
    getPercentages() {
        
        let allPercentages = data.allItems.expense.map(el => el.getPercentage());
        
        return allPercentages;
        
        }
    
    deleteItem(type, id) {
    
        let index = data.allItems[type].map(el => el.id).indexOf(id);
        
        data.allItems[type].splice(index, 1);
        
    }
    
    testing() {
        console.log(data);
    }
    
}

let data = {
    allItems : {
        expense: [],
        income: []
    },
    totals : {
        expense: 0,
        income: 0
    },
    budget: 0,
    percentage: -1
}

function calculateTotal(type) {
    
    let sum = 0;
    
    data.allItems[type].forEach(el => sum += el.value);
    
    data.totals[type] = sum;
    
}

class Expense extends BudgetController {
    
    constructor(id, description, value, percentage) {
        super(id, description, value);
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
    }
    
    calcPercentage(totalIncome) {
        
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        
    }
    
    getPercentage() {
        
        return this.percentage;
    }
    
}

class Income extends BudgetController {

}

class UIController {
    
    DOMstrings() {
        
        let DOMstrings = {
            inputType: '.add__type',
            inputDescription: '.add__description',
            inputValue: '.add__value',
            inputButton: '.add__btn',
            incomesContainer: '.income__list',
            expensesContainer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expensesLabel: '.budget__expenses--value',
            percentagesLabel: '.budget__expenses--percentage',
            container: '.container',
            expensesPercentageLabel: '.item__percentage',
            dateLabel : '.budget__title--month'
        }
        
        return DOMstrings;
        
    }
    
    getInput() {
        
        return {
            type: document.querySelector(this.DOMstrings().inputType).value, // Either inc or exp
            description: document.querySelector(this.DOMstrings().inputDescription).value,
            value: parseFloat(document.querySelector(this.DOMstrings().inputValue).value)
        };
        
    }
    
    addListItem (obj, type) {
        
        let html, newHTML, element;
        
        // Create HTML string with placeholder text
        
        if (type === 'income') {
            element = this.DOMstrings().incomesContainer;
            
            html = `<div class="item clearfix" id="income-%id%">
                 <div class="item__description">
                 %description%</div> <div class="right clearfix">
                 <div class="item__value">%value%</div>
                 <div class="item__delete"> <button class="item__delete--btn">
                <i class="ion-ios-close-outline"></i></button> </div> </div> </div>`
            
        } else if (type === 'expense') {
            element = this.DOMstrings().expensesContainer;
            
            html = `<div class="item clearfix" id="expense-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix"> <div class="item__value">%value%</div>
                <div class="item__percentage">21%</div><div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i>
                </button></div> </div> </div>`
            
        }
        
        // Replace the placeholder text with some actual data
        
        newHTML = html.replace('%id%', obj.id);
        newHTML = newHTML.replace('%description%', obj.description);
        newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
        
        // Insert the HTML into the DOM
        
        document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        
    }
    
    clearFields() {
        
        let fields = document.querySelectorAll(this.DOMstrings().inputDescription +
            ', ' + this.DOMstrings().inputValue);
        
        Array.from(fields).forEach((el, i, arr) => { el.value = ""; arr[0].focus(); });
        
    }
    
    displayBudget(obj) {
        
        let type;
        
        obj.budget > 0 ? type = 'income' : type = 'expense';
        
        document.querySelector(
            this.DOMstrings().budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(
            this.DOMstrings().incomeLabel).textContent = formatNumber(obj.totalIncome, 'income');
        document.querySelector(
            this.DOMstrings().expensesLabel).textContent = formatNumber(obj.totalExpenses, 'expense');
        
        if (obj.percentage > 0 ) {
            document.querySelector(
                this.DOMstrings().percentagesLabel).textContent = obj.percentage;
        } else {
            document.querySelector(
                this.DOMstrings().percentagesLabel).textContent = "---";
        }
        
    }
    
    displayPercentages(percentages) {
        
        let fields = document.querySelectorAll(this.DOMstrings().expensesPercentageLabel);
        
        Array.from(fields).forEach((el, i) => {
        
            if (percentages[i] > 0) {
                el.textContent = percentages[i] + '%';
            } else {
                el.textContent = '---';
            }
            
        });
        
    }
    
    deleteListItem(selectorID){
        
        let el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
        
    }
    
        displayMonth() {
        
            let now = new Date(), months, month, year;
            
            [month, year, months]= [now.getMonth(), now.getFullYear(), ['January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December']];
            
            document.querySelector(this.DOMstrings().dateLabel).textContent = `${months[month]} ${year}`;
        
    }
    
    changeType() {
    
        let fields = document.querySelectorAll(
            this.DOMstrings().inputType,
            this.DOMstrings().inputDescription,
            this.DOMstrings().inputValue);
    
        Array.from(fields).map( el => el.classList.toggle('red-focus'));
        
        document.querySelector(this.DOMstrings().inputButton).classList.toggle('red');
        
    }
    
}

function formatNumber(num, type) {
    
    let numSplit, dec, int;
    
    num = Math.abs(num);
    num = num.toFixed(2);
    
    numSplit = num.split('.');
    [int, dec] = [numSplit[0], numSplit[1]];
    
    if (int.length > 3) {
        int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3);
    }
    
    return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
    
}

var aggregation = (base, ...mixins) => {
    
    /*  create aggregation class  */
    let aggregate = class __Aggregate extends base { //aggregate extends BudgetController
        constructor(...args) {//
                /*  call base class constructor  */
            super(...args) //this = new BudgetController
            
            /*  call mixin's initializer  */
            mixins.forEach((mixin) => {
                if (typeof mixin.prototype.initializer === "function")
                    mixin.prototype.initializer.apply(this, args)
            })
        }
    };
    
    /*  copy properties  */
    let copyProps = (target, source) => { //for each property on the mixin
        // but on the mixin itself not in the prototype, get that property and put it in the aggregate
        Object.getOwnPropertyNames(source)
            .concat(Object.getOwnPropertySymbols(source))
            .forEach((prop) => {
                if (prop.match(/^(?:initializer|constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/))
                    return
                Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop))
            })
    }
    
    /*  copy all properties of all mixins into aggregation class  */
    mixins.forEach((mixin) => {
        copyProps(aggregate.prototype, mixin.prototype)
        copyProps(aggregate, mixin)
    })
    
    return aggregate
}


// Augment the Car constructor to include "driveForward" and "driveBackward"

class AppController extends aggregation(BudgetController, UIController) {
    
    setupEventListeners() {
        
        let DOM, boundctrlerAddItem, boundctrlerDeleteItem, boundchangeType;
        
        DOM = this.DOMstrings();
        boundctrlerAddItem = evt => this.ctrlerAddItem(evt);
        boundctrlerDeleteItem = evt => this.ctrlerDeleteItem(evt);
        boundchangeType = evt => this.changeType(evt);
        
        document.querySelector(DOM.inputButton).addEventListener('click', boundctrlerAddItem);
        
        document.addEventListener('keypress', function(event) {
            
            if (event.keyCode === 13 || event.which === 13) {
                this.ctrlerAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', boundctrlerDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', boundchangeType);
        
    }
    
    ctrlerAddItem() {
        
        let input, newItem;
    
        //Get the field input data
    
        input = this.getInput();
    
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        
            //Add the item to the budget controller
            
            newItem = this.addItem(input.type, input.description, input.value);
            
            //Add the new item to the UI as well
            
            this.addListItem(newItem, input.type);
        
            //Clear the fields

            this.clearFields();
        
            //Calculate and update budget
    
            this.updateBudget();
            
            this.updatePercentages();
            
        
        }
        
        this.testing();
        
    }
    
    updateBudget() {
        
        //Calculate the budget
        
        this.calculateBudget();
        
        //Return the budget
        
        let budget = this.getBudget();
        
        //Display the budget on the UI
        
        this.displayBudget(budget);
        
        
    };
    
    updatePercentages() {
        
        //Calculate the percentages
        
        this.calculatePercentages();
        
        //Read the percentages from the budget controller
        
        let percentages = this.getPercentages();
        
        //Update the UI with the new percentages
        
        this.displayPercentages(percentages);
        
    }
    
    ctrlerDeleteItem(event) {
        
        let itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.id;
    
        if (itemID) {
            
            splitID = itemID.split('-');
            
            [type, ID] = [splitID[0], parseInt(splitID[1])];
            
            // Delete the item from the data structure
            
            this.deleteItem(type, ID);
            
            // Delete the item from the UI
            
            this.deleteListItem(itemID);
            
            // Update and show the new budget
            
            this.updateBudget();
            
            this.updatePercentages();
            
        }
    }
        
        init()
        {
            console.log('Application has started');
            this.displayMonth();
            this.displayBudget({budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1});
            this.setupEventListeners();
        }
        
}

let startApp = new AppController();

startApp.init();



