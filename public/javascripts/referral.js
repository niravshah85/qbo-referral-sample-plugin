// qboXDMReady method will be called when qboXDM object becomes available
// i.e. when data from the parent frame (QBO) is available to consume
var qboXDMReady = function () {
    var wireUpEvents, sendButtonHandler, sendEmail, createOption, getSpinnerHelperObj;    

    // wires up DOM elements and its events
    wireUpEvents = function () {
        
        document.getElementById("closeTrowser").addEventListener("click", function (evt) {
            qboXDM.closeTrowser();
        });

        document.getElementById("sendButton").addEventListener("click", sendButtonHandler);

        // when user change the product in the product picker we need to change the 
        // message in  message text area
        document.getElementById("productPicker").addEventListener("change", function (evt) {
            var selectedProduct = evt.target.selectedOptions[0].value;
            document.getElementById("emailMessage").innerHTML = "I wanted to refer " + selectedProduct + ". I think you'll love it!";            
        });
    };

    sendButtonHandler = function (evt) {
        sendEmail();        
    };

    sendEmail = function () {
        var spinnerHelper = getSpinnerHelperObj(qboXDM),
            xhr;

        spinnerHelper.showSpinner();

        xhr = new XMLHttpRequest();

        xhr.open("POST", "/sendemail");        

        // in order to simulate a request that takes X secs to respond, uncomment the line below
        // you can change the path param to anything between 0 and 30 (inclusive). Values 
        // more than 30 will be reset to 30
        xhr.open("POST", "/sendemail/delay/3");

        // in order to simulate an error, uncomment the next line
        // xhr.open("POST", "/sendemail/generateError");

        xhr.onreadystatechange = function (evt) {  
            if (xhr.readyState === 4) {  
                if (xhr.status === 200 || xhr.status === 204) {
                    // hide the spinner
                    spinnerHelper.hideSpinner();

                    // close the trowser
                    qboXDM.closeTrowser();

                    // show the success dialog msg                    
                    qboXDM.showDialogWithCustomButtons("Referral sent",
                        "When your friend subscribed, you will receive an email about your Amazon gift card", 
                        [
                            {
                                "label": "Refer another friend", 
                                "section": -1
                            }, {
                                "label": "Close",
                                "primary": true, 
                                "section": 1
                            }
                        ],
                        {
                            "iconClass": "confirmIcon"
                        },
                        function (evt) {
                            switch (evt.labelId) {
                                case 0:
                                    qboXDM.navigate("approute://referrals");
                                    break;

                                case 1:
                                    console.error("Do something with click on close button");
                                    break;
                            }
                        }
                    );
                } else {  
                    errorHandler(spinnerHelper);
                }  
            }  
        };

        xhr.addEventListener("error", errorHandler.bind(null, spinnerHelper));

        // set content type to application/json
        xhr.setRequestHeader("Content-type", "application/json");

        xhr.send(JSON.stringify({
            toEmail: document.getElementById("toEmail").value,
            fromEmail: document.getElementById("fromEmail").value,
            emailMessage: document.getElementById("emailMessage").value
        }));
    };

    errorHandler = function (spinnerHelper) {
        // hide the spinner
        spinnerHelper.hideSpinner();

        // Don't close the trowser. I don't think we should navigate the user away from the trowser on error. 
        // Designers' call in the end.

        // show the error dialog msg
        qboXDM.showSimpleOkDialog("Error!", "An error occurred. Please try again!", null, {"iconClass": "alertIcon"});
    };

    createOption = function (text, value) {
        var option = document.createElement("option");
        option.text = text;
        option.value = value;

        return option;
    };

    getSpinnerHelperObj = function (qboXDM) {

        // qboXDM must be an object
        if (!qboXDM || typeof qboXDM !== "object") {
            console.error("qboXDM must be an object");
            return;
        }

        var showSpinner, hideSpinner, spinnerCallback, timeoutCallback, hidden;

        showSpinner = function () {
            hidden = false;
            qboXDM.showSpinner(spinnerCallback);
        };

        // this callback is called right away by qboXDM.showSpinner with the argument obj containing 
        // timeoutInterval. We set timer with that timeoutInterval to check if we need to continue to 
        // show spinner
        spinnerCallback = function (obj) {
            // check after the timeoutInterval/2 if we need to continue to show spinner. 
            // timeoutInterval/2 rather than timeoutInterval so that we show the spinner continously 
            // rather than showing for 5 secs, hiding for a brief period of time and showing again
            window.setTimeout(timeoutCallback, obj.timeout/2);
        };

        timeoutCallback = function () {
            if (hidden) {
                qboXDM.hideSpinner();
            } else {
                // if "hidden" is not set, then keep on showing the spinner.
                qboXDM.showSpinner(spinnerCallback);
            }
        };

        hideSpinner = function () {
            // set closure variable hidden to true so that timeout handler knows not to show spinner again
            hidden = true;

            // and explicitly hide the spinner as well to hide it right away
            qboXDM.hideSpinner();
        };

        return {
            showSpinner: showSpinner,
            hideSpinner: hideSpinner
        }
    };

    qboXDM.getContext(function (context) {
        var qboContext = context.qbo,
            productPicker;

        // populate from email field with user's email coming from QBO
        document.getElementById("fromEmail").value = qboContext.user.email;

        // if user has payroll then we need to show the product picker with payroll in
        // it otherwise user will only refer QuickBooks and so we don't need to show
        // the product picker
        // todo - we currently don't have a way to identify is user has payments or not on client side
        // That said we don't know what action we want to take if user wants to refer
        // payments. It's fine for now.
        if (qboContext.sku.isPayrollSku === true) {
            productPicker = document.getElementById("productPicker");
            productPicker.add(createOption("QuickBooks", "QuickBooks"));
            productPicker.add(createOption("Payroll", "Payroll"));
                        
            // now show the product picker
            document.getElementById("productPickerSection").classList.remove("hide");
        } else {
            // otherwise show the default product section
            document.getElementById("defaultProductSection").classList.remove("hide");
        }
    });

    wireUpEvents();
};
