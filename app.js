var budgetController = (function(){
var Expense = function(id, des, val){
  this.id = id;
  this.description = des;
  this.value = val;
  this.percentage = -1;
};
var Income = function(id, des, val) {
  this.id = id;
  this.description = des;
  this.value = val;
}

var data = {
  allItem: {
    inc:[],
    exp:[]
  },
  total:{
    inc: 0,
    exp: 0
  },
  budget: 0,
  percentage: -1
}
Expense.prototype.calcPercentages = function(budget){
  if(budget > 0){
    this.percentage = Math.round(this.value / data.total.inc * 100);
  }else{
    this.percentage = -1;
  }
};
Expense.prototype.getPercentage = function(){
return this.percentage
}
var calculateTotal = function(type){
  var totalValue = 0;
  data.allItem[type].forEach(function(cur){
    totalValue += cur.value;
  });
  data.total[type] = totalValue;
};

var binary_search = function(array,item){
if(array.length < 2) return 0;
let low = 0;
let high = array.length - 1;
while(low <= high){
  for(var i = 0; i < array.length ; i ++){
    let mid = Math.floor((low + high) / 2 );
    let guess = array[mid];
    if(guess === item){
      return mid;
    };
    if(guess > item){
      high = mid - 1;
    }else{
      low = mid + 1;
    }
  }
  return null;
}
};

return {
  addNewItem: function(type, des, val){

    val = Number(val);
    if(!isNaN(val)){
      var newItem, ID, dataArr;
      // ID
      //1,2,3,4, 5
      //1,3,5,   6
      dataArr = data.allItem[type];
      if(dataArr.length > 0){
        ID =  dataArr[dataArr.length-1].id + 1;
      }else{
        ID = 0;
      }

    if(type ==="inc"){
      newItem = new Income(ID, des, val);
    }else if (type ==="exp"){
      newItem = new Expense(ID, des, val);
    }
    dataArr.push(newItem);
    data.total[type] += val;
    }
   return newItem
},
deleteItem: function(obj){ // itemType:"income""expense";itemID:#
//binary sort
let id = obj.itemID;
let type = obj.itemType;
let ids, index;
ids = data.allItem[type].map(function(el){
  return el.id;
});
index = binary_search(ids,id);
if(!isNaN(index)){
  data.allItem[type].splice(index, 1);
};
},
calculateBudget: function(){
  calculateTotal("inc");
  calculateTotal("exp");


    data.budget = data.total.inc - data.total.exp;
    if(data.budget > 0){
      data.percentage = Math.round(data.total.exp / data.total.inc * 100) ;
    }else{
      data.percentage = -1;
    }
  return{
    budget:data.budget,
    expTotal:data.total.exp,
    incTotal:data.total.inc,
    budgetPercentage:data.percentage
  }

},
getPercentage:function(){
  var percenArr;
  percenArr = data.allItem.exp.map(function(cur){
    return cur.percentage
  });
  return percenArr
},
calculatePercentages: function(){
  data.allItem.exp.forEach(function(cur){
    cur.calcPercentages(data.budget);
  });
},
testing:function(){
  console.log(data);
}

}
})();

var uiController = (function(){
  var itemType, itemDescription, itemValue;
  var DOMstring = {
    inputType : ".add__type",
    inputDescription:".add__description",
    inputValue: ".add__value",
    inputButton:".add__btn",
    incomeContainer:".income__list",
    expensesContainer:".expenses__list",
    budgetValue:".budget__value",
    incomeValue:".budget__income--value",
    expenseValue:".budget__expenses--value",
    budgetPercentage:".budget__expenses--percentage",
    itemPercentage:".item__percentage",
    monthOfYear:".budget__title--month",
    container:".container"

  };
  itemType = document.querySelector(DOMstring.inputType);
  itemDescription = document.querySelector(DOMstring.inputDescription);
  itemValue = document.querySelector(DOMstring.inputValue);

  var beautyNum = function(num, type){
  if(num === 0){return 0}
  if(!isNaN(num)){
    var numSplit,intger, decimal;

    num =  Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    intger = numSplit[0];
    decimal = numSplit[1];
  if(intger.length > 3 && intger.length < 7){
    intger = intger.slice(0,intger.length-3)+","+intger.slice(intger.length - 3);
  }
  if (type === "inc"){
    type = "+ ";
  }else if (type === "exp"){
    type = "- ";
  }
return type + intger +"."+ decimal
}


  };
  return {
    displayNewItem:function(item, type){
      var container, html;

      if(type === "inc"){
        container = document.querySelector(DOMstring.incomeContainer);
        html =   '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div>'+
        '<div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete">'+
        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }else if (type === "exp"){
        container = document.querySelector(DOMstring.expensesContainer);
        html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div>'+
         '<div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div>'+
         '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      html = html.replace("%id%",item.id);
      html = html.replace("%description%", item.description);
      html = html.replace("%value%", item.value);
      container.insertAdjacentHTML("beforeend", html);
    },
    deleteItem: function(eventID){
      let el = document.getElementById(eventID);
      el.parentNode.removeChild(el);
    },
    displayNewBudget:function(obj){ // obj{budget,expTotal, incTotal}
    let type;
    obj.budget >= 0 ? type = "inc" : type = "exp";
      document.querySelector(DOMstring.budgetValue).textContent = beautyNum(obj.budget,type);

      document.querySelector(DOMstring.expenseValue).textContent = beautyNum(obj.expTotal, "exp");

      document.querySelector(DOMstring.incomeValue).textContent = beautyNum(obj.incTotal, "inc");
    if(obj.budgetPercentage > 0){
      document.querySelector(DOMstring.budgetPercentage).textContent = obj.budgetPercentage +" %";
    }else{
      document.querySelector(DOMstring.budgetPercentage).textContent = "---";
    }

    },
    displayPercentages:function(percent){
      var percentageField, percentArr;
      percentageField = document.querySelectorAll(DOMstring.itemPercentage);
      percentArr = Array.prototype.slice.call(percentageField);
      for(var i = 0; i < percentArr.length; i ++){
        if(percent[i] > 0 ){
          percentArr[i].textContent = percent[i] + " %";
        }else{
          percentArr[i].textContent = "---";
        }
      }
    },
    clearInputField:function(){
      var fields,fieldsArr;
      fields = document.querySelectorAll(
        DOMstring.inputDescription +"," +
        DOMstring.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function(cur){
        cur.value = ""
      });

      document.querySelector(DOMstring.inputDescription).focus();
    },
    getDate:function(){
      var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth();
      month = months[month];
      document.querySelector(DOMstring.monthOfYear).innerHTML = year + " "+month;

    },
    getDOM :function(){
      return DOMstring
  },
    getInput:function(){
      return{
        iType:itemType.value,
        iDescription:itemDescription.value,
        iValue:itemValue.value
      }
    }

  }
})();

var controller = (function(budgetCtrl, uiCtrl){
var DOM = uiCtrl.getDOM();


var button = document.querySelector(DOM.inputButton);
var evenListenerSetUp = function(){
  button.addEventListener("click",addItemControl);
  document.addEventListener("keydown",function(el){
    if(el.keyCode === 13){
      addItemControl();
    }
  });
  document.querySelector(DOM.container).addEventListener("click",deleteItemControl);
};

var updateBudget = function(){
 var budget;
  budget = budgetCtrl.calculateBudget();
  uiCtrl.displayNewBudget(budget);
};

var updatePercentages = function(){
var percenArr;
budgetCtrl.calculatePercentages();
percenArr = budgetCtrl.getPercentage();
uiCtrl.displayPercentages(percenArr);
};

var addItemControl = function(){
  var input, newItem;
  // get Item from UI controller
  input = uiCtrl.getInput(); // {OBJ: iType, iDescription, iValue}

  if(!isNaN(input.iValue) && input.iValue > 0 && input.iDescription !== ""){
   // add item to data structure (return id,des,val)
    newItem = budgetCtrl.addNewItem(input.iType, input.iDescription, input.iValue);
    // display newItem in UI
    uiCtrl.displayNewItem(newItem, input.iType);
    //clear input fields
    uiCtrl.clearInputField();
   // calculate budget and percentage and display it
    updateBudget();
   // calculate percentage of each item
    updatePercentages();
  };
}
var deleteItemControl = function(event){
   let eventID, splitID, type, id;
   eventID = event.target.parentNode.parentNode.parentNode.parentNode.id;
  if(eventID){
    splitID = eventID.split("-");
    type = splitID[0];
    type = type.slice(0,3);
    id = splitID[1];
    budgetCtrl.deleteItem({
      itemType: type,
      itemID: id
    });
    uiCtrl.deleteItem(eventID);
    updateBudget();
    updatePercentages();
  }
};
return {
  init:function(){
      console.log("App starts");
      evenListenerSetUp();
      uiCtrl.displayNewBudget({
        budget: 0,
        expTotal: 0,
        incTotal: 0,
        budgetPercentage: -1
      });
      uiCtrl.getDate();

  }

}
})(budgetController, uiController);

controller.init();
