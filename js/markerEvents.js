var tableNumber = null;

AFRAME.registerComponent("marker-handlers", {
  init: async function () {
    var dishes = await this.getDishes();
    if (tableNumber == null) {
      this.addTableNumber();
    }

    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
      alert("marker lost");
    });
  },

  addTableNumber: function () {
    swal({
      icon: "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png",
      title: "WELCOME TO CHEESE HUNGER BURGER !!",
      content: {
        element: "input",
        attributes: {
          placeholder: "Type the Table Number",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((inputvalue) => {
      tableNumber = inputvalue;
    });
  },

  handleMarkerFound: function (dishes, markerId) {
    var today = new Date();
    var currentDay = today.getDay();
    // Sunday - Saturday : 0 - 6

    dishes.map((dish) => {
      var days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      alert("Marker Found");

      if (dish.unavailable_days.includes(days[currentDay]) === true) {
        swal({
          icon: "warning",
          title: dish.dish_name,
          text: "This dish is not available....HAVE FUNNN HUNGRRRYYYYY!!!!!!!!!!!!!",
          timer: 2000,
          buttons: false,
        });
      } else if (dish.unavailable_days.includes(days[currentDay]) === false) {
        var model = document.querySelector(`#model-${dish.id}`);
        model.setAttribute("visible", true);

        var mainPlane = document.querySelector(`#main-plane${dish.id}`);
        mainPlane.setAttribute("visible", true);

        var pricePlane = document.querySelector(`#price-plane-${dish.id}`);
        pricePlane.setAttribute("visible", true);

        var buttonDiv = document.getElementById("button-div");
        buttonDiv.style.display = "flex";

        var ratingButton = document.querySelector("#rating-button");
        ratingButton.addEventListener("click", () => {
          swal({
            icon: "warning",
            title: "Rate The Dish",
            text: "WIP",
          });
        });

        var orderButton = document.querySelector("#order-button");
        orderButton.addEventListener("click", () => {
          var tNumber;
          tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;

          this.orderDish(tNumber, dish);
          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title:
              dish.dish_name + " : " + " ordered by TabaleNamuber " + tNumber,
            text: "Your order will be delivered to your table shortly!",
          });
        });

        var orderSummary = document.querySelector("#order-summary");
        orderSummary.addEventListener("click", () => {
          this.handleOrderSummary();
        });
      }
    });
  },

  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },

  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then((snapshot) => {
        return snapshot.docs.map((doc) => doc.data());
      });
  },

  orderDish: function (tableNumber, dish) {
    return firebase
      .firestore()
      .collection("tables")
      .doc(tableNumber)
      .get()
      .then((doc) => {
        var tableDetails = doc.data();
        if (tableDetails["current_orders"][dish.id]) {
          tableDetails["current_orders"][dish.id]["Total_quantity"] += 1;

          var currentQuant =
            tableDetails["current_orders"][dish.id]["Total_quantity"];
          tableDetails["current_orders"][dish.id]["Total_bill"] =
            currentQuant * dish.price;
        } else {
          tableDetails["current_orders"][dish.id] = {
            Item: dish.dish_name,
            Price: dish.price,
            Total_quantity: 1,
            Total_bill: dish.price * 1,
          };
        }

        firebase
          .firestore()
          .collection("tables")
          .doc(doc.id)
          .update(tableDetails);
      });
  },

  getSummary: async function (tableNumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tableNumber)
      .get()
      .then((doc) => doc.data());
  },

  handleOrderSummary: async function () {
    var modelDiv = document.getElementById("modal-div");
    modelDiv.style.display = "flex";

    var tableBody = document.getElementById("bill-table-body");
    tableBody.innerHTML = "";

    var myTableNumber;
    tableNumber <= 9 ? (myTableNumber = `T0${tableNumber}`) : `T${tableNumber}`;

    var orderDetails = await this.getSummary(myTableNumber);

    var currentOrders = Object.keys(orderDetails.current_orders);
    currentOrders.map((i) => {
      var tr = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var total = document.createElement("td");

      item.innerHTML = orderDetails.current_orders[i].Item;
      price.innerHTML = "$" + orderDetails.current_orders[i].Price;
      quantity.innerHTML = orderDetails.current_orders[i].Total_quantity;
      total.innerHTML = orderDetails.current_orders[i].Total_bill;

      price.setAttribute("class", "text-center");
      quantity.setAttribute("class", "text-center");
      total.setAttribute("class", "text-center");

      tr.appendChild(item);
      tr.appendChild(price);
      tr.appendChild(quantity);
      tr.appendChild(total);
      tableBody.appendChild(tr);
    });

    var toTalTr = documet.createElement("tr");

    var td1 = document.createElement("td");
    td1.setAttribute("class", "no-line");

    var td2 = document.createElement("td");
    td2.setAttribute("class", "no-line");

    var td3 = document.createElement("td");
    td3.setAttribute("class", "no-line text-center");

    var strongTag = document.createElement("strong");
    strongTag.innerHTML = "Total";
    td3.appendChild(strongTag);

    var td4 = document.createElement("td");
    td4.setAttribute("class", "no-line text-right");
    td4.innerHTML = "$" + orderSummary.total_bill;

    toTalTr.appendChild(td1)
    toTalTr.appendChild(td2)
    toTalTr.appendChild(td3)
    toTalTr.appendChild(td4)

    tableBody.appendChild(toTalTr)
  },
});
