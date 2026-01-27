class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.clearBtn = document.getElementById('clear');
        this.clearEntryBtn = document.getElementById('clear-entry');
        this.backspaceBtn = document.getElementById('backspace');
        this.decimalBtn = document.getElementById('decimal');
        this.equalsBtn = document.getElementById('equals');
        
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForNewInput = false;
        this.lastResult = null;
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Number buttons
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => this.inputNumber(button.dataset.number));
        });
        
        // Operator buttons
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => this.inputOperator(button.dataset.action));
        });
        
        // Clear buttons
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.clearEntryBtn.addEventListener('click', () => this.clearEntry());
        this.backspaceBtn.addEventListener('click', () => this.backspace());
        
        // Decimal button
        this.decimalBtn.addEventListener('click', () => this.inputDecimal());
        
        // Equals button
        this.equalsBtn.addEventListener('click', () => this.calculate());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }
    
    inputNumber(num) {
        if (this.waitingForNewInput) {
            this.currentInput = num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }
    
    inputOperator(op) {
        if (this.operation && !this.waitingForNewInput) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.waitingForNewInput = true;
        
        switch(op) {
            case 'add': this.operation = (a, b) => a + b; break;
            case 'subtract': this.operation = (a, b) => a - b; break;
            case 'multiply': this.operation = (a, b) => a * b; break;
            case 'divide': this.operation = (a, b) => a / b; break;
        }
        
        this.updateHistory();
    }
    
    inputDecimal() {
        if (this.waitingForNewInput) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }
    
    calculate() {
        if (!this.operation || this.waitingForNewInput) return;
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        let result;
        try {
            result = this.operation(prev, current);
            
            // Handle division by zero
            if (!isFinite(result)) {
                throw new Error('Cannot divide by zero');
            }
            
            // Round to avoid floating point precision issues
            result = Math.round(result * 100000000) / 100000000;
            
            this.lastResult = result;
            this.currentInput = result.toString();
            this.updateHistory(true);
        } catch (error) {
            this.currentInput = 'Error';
            this.history.textContent = error.message;
        }
        
        this.operation = null;
        this.waitingForNewInput = true;
        this.updateDisplay();
    }
    
    clearAll() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operation = null;
        this.waitingForNewInput = false;
        this.history.textContent = '';
        this.updateDisplay();
    }
    
    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }
    
    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Format number with commas for thousands
        const num = parseFloat(this.currentInput);
        if (!isNaN(num)) {
            this.display.textContent = num.toLocaleString('en-US', {
                maximumFractionDigits: 10
            });
        } else {
            this.display.textContent = this.currentInput;
        }
    }
    
    updateHistory(showResult = false) {
        if (!this.operation) {
            this.history.textContent = '';
            return;
        }
        
        let operatorSymbol;
        switch(this.operation) {
            case (a, b) => a + b: operatorSymbol = '+'; break;
            case (a, b) => a - b: operatorSymbol = '−'; break;
            case (a, b) => a * b: operatorSymbol = '×'; break;
            case (a, b) => a / b: operatorSymbol = '÷'; break;
        }
        
        if (showResult) {
            this.history.textContent = `${this.previousInput} ${operatorSymbol} ${this.currentInput} =`;
        } else {
            this.history.textContent = `${this.previousInput} ${operatorSymbol}`;
        }
    }
    
    handleKeyboardInput(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.inputDecimal();
        } else if (e.key === '+') {
            this.inputOperator('add');
        } else if (e.key === '-') {
            this.inputOperator('subtract');
        } else if (e.key === '*') {
            this.inputOperator('multiply');
        } else if (e.key === '/') {
            e.preventDefault();
            this.inputOperator('divide');
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clearAll();
        } else if (e.key === 'Backspace') {
            this.backspace();
        } else if (e.key === 'Delete') {
            this.clearEntry();
        }
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});